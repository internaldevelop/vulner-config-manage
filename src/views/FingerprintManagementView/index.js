import { withStyles } from '@material-ui/core/styles';
import { message, Row, Col, Input, Button, Icon, Card, Skeleton, Table } from 'antd';
import { inject, observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { isIPPattern, DeepClone } from '../../utils/ObjUtils';
import { GetMainViewHeight, GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils';
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
    InputSplit: {
        backgroundColor: '#fff',
    },
    InputSplitRight: {
        borderLeftWidth: 0,
    }
});

const DEFAULT_PAGE_SIZE = 10;
@observer
@inject('userStore')
class FingerprintManagementView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: Column,
            resultData: [],
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 200,      // 表格的 scrollHeight
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            totalResult: 0,
            selectedEquipRowKeys: [],
            equipValue: '',
            startIP: '',
            endIP: '',
        }
        this.queryEquips(this.state.currentPage, this.state.pageSize);
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

    queryEquips = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        RestReq.asyncGet(this.queryEquipsCB, '/fw-bend-server/assets/get-assets', { /*offset: startSet, count: pageSize*/ }, { token: false });
    }

    queryEquipsCB = (data) => {
        if (data.code === 'ERROR_OK') {
            let startSet = (this.state.currentPage - 1) * this.state.pageSize;
            let equips = data.payload.map((equip, index) => {
                let item = DeepClone(equip);
                //item.index = index + 1;
                //item.key = index + 1;
                item.index = startSet + index + 1;
                item.key = startSet + index + 1;
                return item;
            });
            this.setState({ resultData: equips, /*totalResult: data.payload.total*/ });
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
        this.querySystemLogs(currentPage, pageSize);
    }

    handleScanCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.handleScan();
        }
    }

    compareIP(startIP, endIP) {
        let temp1 = startIP.split(".");
        let temp2 = endIP.split(".");
        for (let i = 0; i < 4; i++) {
            if (temp1[i] > temp2[i]) {
                return true;
            }
        }
        return false;
    }

    handleScan = () => {
        if (this.state.startIP === '') {
            message.info('起始IP不能为空！');
            return;
        }
        if (!isIPPattern(this.state.startIP)) {
            message.info('起始IP格式不正确！');
            return;
        }
        if (this.state.endIP !== '' && !isIPPattern(this.state.endIP)) {
            message.info('截至IP格式不正确！');
            return;
        }
        if (this.state.endIP !== '' && this.compareIP(this.state.startIP, this.state.endIP)) {
            message.info('起始IP不能比截至IP大！');
            return;
        }
        RestReq.asyncGet(this.getFirmwareInfoCB, '/fw-bend-server/authenticate/scan-get-equipment', { start_ip: this.state.startIP, end_ip: this.state.endIP }, { token: false });
    };

    handleStartIPInputValue = (event) => {
        this.setState({
            startIP: event.target.value,
        })
    };

    handleEndIPInputValue = (event) => {
        this.setState({
            endIP: event.target.value,
        })
    };

    render() {
        const userStore = this.props.userStore;
        const { columns, totalResult, scrollWidth, scrollHeight, resultData } = this.state;
        const { classes } = this.props;
        let self = this;
        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                    <Row style={{ marginTop: '10px' }}>
                        <Col span={2} align="left" style={{ marginTop: '5px' }}>
                            <Typography variant="h7">请输入IP段：</Typography>
                        </Col>
                        <Col span={10}>
                            <Input.Group compact>
                                <Input style={{ width: 200, textAlign: 'center' }} onChange={this.handleStartIPInputValue} placeholder="起始IP" />
                                <Input
                                    className={classes.InputSplit}
                                    style={{
                                        width: 40,
                                        borderLeft: 0,
                                        borderRight: 0,
                                        pointerEvents: 'none',
                                    }}
                                    placeholder="-"
                                    disabled
                                />
                                <Input
                                    className={classes.InputSplitRight}
                                    onChange={this.handleEndIPInputValue}
                                    style={{
                                        width: 200,
                                        textAlign: 'center',
                                    }}
                                    placeholder="截至IP"
                                />
                            </Input.Group>
                        </Col>
                        <Col span={4} align="left"><Button type="primary" size="large" onClick={this.handleScan}><Icon type="plus-circle-o" />设备扫描</Button></Col>
                    </Row>
                    <br />
                    <Card title={'指纹设备'}>
                        <Table
                            columns={columns}
                            dataSource={resultData}
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
                </div>

            </Skeleton>
        );
    }
}

FingerprintManagementView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(FingerprintManagementView);