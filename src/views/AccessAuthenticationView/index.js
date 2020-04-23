import { withStyles } from '@material-ui/core/styles';
import { message, Row, Col, Input, Button, Icon, Card, Skeleton, Table } from 'antd';
import { inject, observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { DeepClone } from '../../utils/ObjUtils';
import { GetMainViewHeight, GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils';
import { columns as AccessLogColumn } from './AccessLogColumn';
import { columns as Column } from './Column';
import RestReq from '../../utils/RestReq';

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
    antInput: {
        width: 300,
    },
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
});

const DEFAULT_PAGE_SIZE = 10;
@observer
@inject('userStore')
class AccessAuthenticationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: Column,
            equips: [],
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 200,      // 表格的 scrollHeight
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            totalResult: 0,
            selectedEquipRowKeys: [],
            equipValue: '',
        }
        // 设置操作列的渲染
        this.initActionColumn();

        this.queryAuthorizationEquips(this.state.currentPage, this.state.pageSize);
    }

    componentDidMount() {
        // 增加监听器，侦测浏览器窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    componentWillUnmount() {
        // 组件卸装前，一定要移除监听器
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    handleResize = e => {
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    /** 初始化操作列，定义渲染效果 */
    initActionColumn() {
        const { columns } = this.state;
        const { classes } = this.props;
        if (columns.length === 0)
            return;

        columns[columns.length - 1].render = (text, record, index) => (
            <div>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleAuthentication(index).bind(this)}>指纹认证</Button>
            </div>
        )

        this.setState({ columns });
    }

    queryAuthorizationEquips = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        return RestReq.asyncGet(this.queryAuthorizationEquipsCB, '/fw-bend-server/assets/get-assets', { empower_flag: 1, /*offset: startSet, count: pageSize*/ }, { token: false });
    }

    queryAuthorizationEquipsCB = (data) => {
        if (data.code === 'ERROR_OK') {
            let startSet = (this.state.currentPage - 1) * this.state.pageSize;
            let equips = data.payload.map((equip, index) => {
                let item = DeepClone(equip);
                item.index = startSet + index + 1;
                item.key = startSet + index + 1;
                return item;
            });
            this.setState({ equips, /*totalResult: data.payload.total*/ });
        }
    }

    /**
     * 将数据所在页的行索引转换成整个数据列表中的索引
     * @param {} rowIndex 数据在表格当前页的行索引
     */
    transferDataIndex = (rowIndex) => {
        // currentPage 为 Table 中当前页码（从 1 开始）
        const { currentPage, pageSize } = this.state;
        let dataIndex = (currentPage - 1) * pageSize + rowIndex;
        return dataIndex;
    }

    /** 处理页面变化（页面跳转/切换/每页记录数变化） */
    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
        this.queryAuthorizationEquips(currentPage, pageSize);
    }

    onSelectEquipChange = selectedEquipRowKeys => {
        //console.log('selectedEquipRowKeys changed: ', selectedEquipRowKeys);
        this.setState({ selectedEquipRowKeys });
    };

    handleEquipInputKeyPressed = (event) => {
        if (event.which === 13) {
            //this.equipSearch();
        }
    }

    handleEquipInputValue = (event) => {
        if (event.target.value === '' && (this.state.equipValue === '' || this.state.equipValue === undefined)) {
            //this.queryEquipAuthorizations(this.state.currentPage, this.state.pageSize, 0);
        }
        this.setState({
            equipValue: event.target.value,
        })
    }

    equipAuthenticationCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.queryAuthorizationEquips(this.state.currentPage, this.state.pageSize);
        } else {
            message.info("认证失败！");
        }
    }

    handleAuthentication = (index) => (event) => {
        const equips = this.state.equips;

        //RestReq.asyncGet(this.queryAuthorizationEquipsCB, '/fw-bend-server/assets/get-assets', { empower_flag: 1, /*offset: startSet, count: pageSize*/ }, { token: false });
        RestReq.asyncGet(this.queryAuthorizationEquipsCB, '/fw-bend-server/authenticate/authenticate', { asset_uuid: equips[index].uuid, }, { token: false });
    }

    getExtraInput = () => {
        const { classes } = this.props;
        return (
            <Input className={classes.antInput} size="large" onChange={this.handleEquipInputValue} placeholder="接入日志查询" onKeyPress={this.handleEquipInputKeyPressed} />
        );
    }

    getAccessLogTableProps() {
        const { totalResult, scrollWidth, scrollHeight, equips } = this.state;
        let self = this;

        const tableProps = {
            columns: AccessLogColumn,
            rowKey: record => record.uuid,
            dataSource: equips,
            scroll: { x: scrollWidth, y: scrollHeight },
            bordered: true,
            pagination: {
                total: totalResult > 0 ? totalResult : 10,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                pageSizeOptions: [DEFAULT_PAGE_SIZE.toString(), '20', '30', '40'],
                defaultPageSize: DEFAULT_PAGE_SIZE,
                showSizeChanger: true,
                onShowSizeChange(current, pageSize) {  //当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                    self.handlePageChange(current, pageSize);
                },
                onChange(current, pageSize) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                    self.handlePageChange(current, pageSize);
                },
            }
        };
        return tableProps;
    }

    render() {
        const userStore = this.props.userStore;
        const { columns, totalResult, scrollWidth, scrollHeight, equips } = this.state;
        const { classes } = this.props;
        let self = this;
        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                    <Card title={'授权列表'}>
                        <Table
                            columns={columns}
                            dataSource={equips}
                            bordered={true}
                            scroll={{ x: scrollWidth, y: scrollHeight }}
                            rowKey={record => record.uuid}
                            pagination={{
                                total: totalResult > 0 ? totalResult : 10,
                                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                                pageSizeOptions: [DEFAULT_PAGE_SIZE.toString(), '20', '30', '40'],
                                defaultPageSize: DEFAULT_PAGE_SIZE,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                onShowSizeChange(current, pageSize) {  //当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                                    self.handlePageChange(current, pageSize);
                                },
                                onChange(current, pageSize) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                                    self.handlePageChange(current, pageSize);
                                },
                            }}
                        />
                    </Card>
                    <br />
                    {/* <Card title={'接入日志'} extra={this.getExtraInput()}>
                        <Table {...this.getAccessLogTableProps()} />
                    </Card> */}
                </div>

            </Skeleton>
        );
    }
}

AccessAuthenticationView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(AccessAuthenticationView);