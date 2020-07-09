import { withStyles } from '@material-ui/core/styles';
import { Table, Input, Button, Icon, Col, message, Modal, Row, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from '../../components/window/Draggable';
import { errorCode } from '../../global/error';
import Typography from '../../modules/components/Typography';
import { eng2chn } from '../../utils/StringUtils';
import { VulColumns } from './VulColumn';
import { DeepClone } from '../../utils/ObjUtils'
import RestReq from '../../utils/RestReq';


const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit,
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
    },
    formControl: {
        minWidth: 200,
    },
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    searchItemStyle: {
        marginTop: 20,
        //minHeight: 100,
    },
    antInput: {
        width: 300,
    },
    clickRow: {
        backgroundColor: '#bae7ff',
    },
});
const DEFAULT_PAGE_SIZE = 5;

@inject('userStore')
@observer
class ConnectParamsConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: VulColumns(),
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            selectRowIndex: -1,
            vulners: [],
            showConfig: false,
            inputValue: '',
            totalResult: 0,
            selectRowIndex: -1,
        }
        this.getVulnerResults();
    }

    getVulnerResults = () => {
        RestReq.asyncGet(this.getResultsCB, '/fw-bend-server/vuldb/search', { name: this.state.inputValue, page_num: this.state.currentPage, page_size: this.state.pageSize });
    }

    getResultsCB = (result) => {
        // 检查响应的payload数据是数组类型
        if (result.code !== 'ERROR_OK'
            || (typeof result.payload === "undefined")
            || (result.payload.data === null)
            || (result.payload.data.length === 0)) {
            message.info("没有查询到数据，请重新查询。");
            return;
        }
        this.generateResultList(result.payload.data, result.payload.totalResults, this.state.currentPage);
    }

    generateResultList = (result, totalResult, currentPage) => {
        let vulners = [];
        let startSet = (currentPage - 1) * this.state.pageSize;
        vulners = result.map((item, index) => {
            let taskItem = DeepClone(item);
            taskItem.index = startSet + index + 1;
            taskItem.key = startSet + index + 1;
            this.generateResult(taskItem, item)
            return taskItem;
        })

        this.setState({ vulners, totalResult, currentPage });
    }

    generateResult = (item, data) => {
        //item.platform = data.platform.platform;
        item.type = data.isEvent;
        //item.author = data.author.name;
        item.title = data.title;
        //item.edb_id = data.edb_id;
        item.edb_id = data.number;
        item.vul_id = data.id;
        item.serverity = data.serverity;
        item.discovererName = data.discovererName;
        let prodName = '';
        for(let p of data.products) {
            prodName += p.product + ' ';
        }
        item.products = prodName;
        if (data.customized !== undefined && data.customized !== null) {
            item.customized = data.customized;
        }
        item.date_published = data.openTime;
        return item;
    }

    handleCancel = (e) => {
        let actionCB = this.props.actioncb;
        // 调用父组件传入的回调函数，第一个参数 false 表示本组件的参数设置被取消 cancel
        actionCB(false, {});
    }

    handleOk = (e) => {
        if (this.state.selectRowIndex < 0) {
            message.info("请选择一个漏洞进行关联！");
            return;
        }
        // 请求后台关联漏洞
        // 获得返回数据后更新主页面
        let actionCB = this.props.actioncb;
        actionCB(true, {vulNum: 111, vulName: 'test test'});
    }

    handleInputValue = (event) => {
        this.setState({
            inputValue: event.target.value,
        })
    };

    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
    }

    setRowClassName = (record) => {
        const { classes } = this.props;
        const { selectRowIndex } = this.state;
        return (selectRowIndex === record.index) ? classes.clickRow : '';
    }

    onRow = (record) => {
        return {
            onClick: (event) => {
                // 设置当前选中行
                this.setState({ selectRowIndex: record.index });
            },
        };
    }

    checkSearch = (value) => {
        if (value === null) {
            message.info('查询条件不能为空，请重新输入');
            return false;
        } else if (value.length > 20) {
            message.info('查询条件长度不能超过20，请重新输入');
            return false;
        } 
        return true;
    }

    getFuzzySearch = () => (event) => {
        const { inputValue } = this.state;
        if (!this.checkSearch(inputValue)) {
            return;
        }
        this.getVulnerResults();
    }

    render() {
        const modalTitle = <Draggable title='手动关联' />;
        const { classes } = this.props;
        const { columns, vulners, totalResult } = this.state;
        let self = this;
        return (
            <Modal
                title={modalTitle}
                style={{ top: 20, minWidth: 800 }}
                maskClosable={false}
                destroyOnClose={true}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <form style={{ width: '100%', height: 600 }}>
                    <Row>
                        <Col span={20} align="left">
                            <Input className={classes.antInput} size="large" value={this.state.inputValue} allowClear onChange={this.handleInputValue.bind(this)} placeholder="漏洞编号 漏洞名称"/>
                            <Button className={classes.iconButton} type="primary" size="large" onClick={this.getFuzzySearch().bind(this)}><Icon type="file-search" />查询</Button>
                        </Col>
                    </Row>
                    <Table
                        id="vulnerListTable"
                        columns={columns}
                        dataSource={vulners}
                        bordered={true}
                        rowClassName={this.setRowClassName}
                        onRow={this.onRow}
                        rowKey={record => record.uuid}
                        pagination={{
                            total: totalResult > 0 ? totalResult : 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                            pageSizeOptions: [DEFAULT_PAGE_SIZE.toString(), '20', '30', '40'],
                            defaultPageSize: DEFAULT_PAGE_SIZE,
                            //showQuickJumper: true,
                            showSizeChanger: true,
                            onShowSizeChange(current, pageSize) {  //当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                                self.handlePageChange(current, pageSize);
                            },
                            onChange(current, pageSize) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                                self.handlePageChange(current, pageSize);
                            },
                        }}
                    />
                </form>
            </Modal>
        );
    }
}

ConnectParamsConfig.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(ConnectParamsConfig);
