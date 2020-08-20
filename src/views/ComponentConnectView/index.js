import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { List, Drawer, message, Card, Button, Input, Icon, Col, Row, Skeleton, Table } from 'antd';
import { inject, observer } from 'mobx-react';
import MAntdCard from '../../rlib/props/MAntdCard';
import MAntdTable from '../../rlib/props/MAntdTable';
import { columns as Column } from './Column';
import ConnectParamsConfig from './ConnectParamsConfig';
import RestReq from '../../utils/RestReq';
import { DeepClone } from '../../utils/ObjUtils';

const DEFAULT_PAGE_SIZE = 10;

const styles = theme => ({
    clickRow: {
        backgroundColor: '#bae7ff',
    },
    formControl: {
        minWidth: 340,
    },
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
    antInput: {
        width: 300,
    },
});

@inject('userStore')
@observer
class ComponentConnectView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            selectRowIndex: -1,
            componentsList: [],
            showConfig: false,
            columns: Column(),
            inputValue: '',
            taskManageVisible: false,
            unDoneTasks: [],
            doneTasks: [],
        }
        // 设置操作列的渲染
        this.initActionColumn();
        this.getAllComponets();
    }

    getAllComponetsCB = (data) => {
        let componentsList = [];
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;

        componentsList = data.payload.map((item, index) => {
            let componentItem = DeepClone(item);
            componentItem.index = index + 1;
            componentItem.key = index + 1;
            return componentItem;
        })
        this.setState({ componentsList });
    }

    getAllComponets = () => {
        RestReq.asyncGet(this.getAllComponetsCB, '/firmware-analyze/fw_analyze/pack/com_files_list');
    }

    initActionColumn() {
        const { columns } = this.state;
        const { classes } = this.props;
        if (columns.length === 0)
            return;

        columns[columns.length - 1].render = (text, record, index) => (
            <div>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleAutoConnect(index).bind(this)}>自动关联</Button>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleConnect(index).bind(this)}>手动关联</Button>
            </div>
        )
        this.setState({ columns });
    }

    handleConnect = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);
        // 保存待编辑的数据索引，并打开任务数据操作窗口
        this.setState({ recordChangeID: dataIndex, showConfig: true });
    }

    transferDataIndex(rowIndex) {
        // currentPage 为 Table 中当前页码（从 1 开始）
        const { currentPage, pageSize } = this.state;
        let dataIndex = (currentPage - 1) * pageSize + rowIndex;
        return dataIndex;
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

    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
    }

    handleInputValue = (event) => {
        this.setState({
            inputValue: event.target.value,
        })
    };

    getSearchCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        }
        //更新componentsList
    }

    getSearch = (event) => {
        if (this.state.inputValue === undefined || this.state.inputValue === '') {
            message.info("请输入组件名称！");
            return;
        }
        RestReq.asyncGet(this.getSearchCB, '/component/async_funcs/get_inverted_fw_data', { index_con: this.state.inputValue });
    };

    getComponentItem = () => {
        const { selectRowIndex, componentsList } = this.state;
        const compileItem = componentsList[selectRowIndex - 1];
        return compileItem;
    }

    handleAutoConnectCB = (data) => {
        if (data.code === 'ERROR_OK') {
            message.info("正在进行自动关联，详细进度请点击任务进度列表查看！");
            return;
        } else {
            message.info("自动关联失败！");
        }
    }

    // handleAutoConnect = (event) => {
    //     if (this.state.selectRowIndex < 0) {
    //         message.info("请先选择一个组件！");
    //         return;
    //     }
    //     RestReq.asyncGet(this.handleAutoConnectCB, '/firmware-analyze/fw_analyze/com/auto_vuler_association', { pack_id: this.getComponentItem().pack_id });
    // };

    handleAutoConnect = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);
        const componentItem = this.state.componentsList[dataIndex];
        RestReq.asyncGet(this.handleAutoConnectCB, '/firmware-analyze/fw_analyze/com/auto_vuler_association', { pack_id: componentItem.pack_id });
    };

    handleCloseConfig = (isOk, data) => {
        this.setState({ showConfig: false });
        if (isOk) {
            //重新获取手动关联后的数据
            this.getAllComponets();
        }
    }

    getAllTasksCB = (data) => {
        let doneTasks = [];
        let unDoneTasks = [];
        if (data.code !== 'ERROR_OK' || !(data.payload instanceof Array))
            return;

        for (let item of data.payload) {
            if (item.percentage === 100) {
                doneTasks.push(item);
            } else {
                unDoneTasks.push(item);
            }
        }
        this.setState({ unDoneTasks, doneTasks, taskManageVisible: true, });
    }

    showComponentDrawer = () => {
        RestReq.asyncGet(this.getAllTasksCB, '/firmware-analyze/fw_analyze/task/query_component');
    };

    onCloseDrawer = () => {
        this.getAllComponets();
        this.setState({
            taskManageVisible: false,
        });
    };

    getExtra() {
        return (
            <a style={{ color: '#FF4500' }} onClick={this.showComponentDrawer.bind(this)}>任务进度列表</a>
        );
    }

    render() {
        const { classes } = this.props;
        const userStore = this.props.userStore;
        const { columns, componentsList, showConfig, doneTasks, unDoneTasks } = this.state;
        let self = this;

        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Card title={'组件漏洞关联'} extra={this.getExtra()} style={{ height: '100%', margin: 8 }} headStyle={MAntdCard.headerStyle('main')}>
                    <Table
                        columns={columns}
                        dataSource={componentsList}
                        bordered={true}
                        rowKey={record => record.uuid}
                        rowClassName={this.setRowClassName}
                        onRow={this.onRow}
                        pagination={MAntdTable.pagination(self.handlePageChange)}
                    />
                    {showConfig && <ConnectParamsConfig name={this.getComponentItem().file_name} version={this.getComponentItem().version} file_id={this.getComponentItem().file_id} actioncb={this.handleCloseConfig} />}
                    {/* <Row>
                        <Col span={4} align="left">
                            <Input className={classes.antInput} size="large" allowClear onChange={this.handleInputValue.bind(this)} placeholder="组件名称" />
                        </Col>
                        <Col span={2} align="left" offset={1}>
                            <Button className={classes.iconButton} type="primary" size="large" onClick={this.getSearch.bind(this)} ><Icon type="file-search" />查询</Button>
                        </Col>
                        <Col span={3} align="left"><Button type="primary" size="large" onClick={this.handleAutoConnect.bind(this)}><Icon type="plus-circle-o" />自动关联</Button></Col>
                    </Row> */}
                    <Drawer
                        title="组件关联进度列表"
                        placement="right"
                        width={400}
                        closable={false}
                        onClose={this.onCloseDrawer}
                        visible={this.state.taskManageVisible}
                    >
                        <List
                            size="large"
                            header={<div style={{ color: 'red', fontSize: 14, fontWeight: 'bold' }}>{'未完成任务'}</div>}
                            //bordered
                            dataSource={unDoneTasks}
                            renderItem={item =>
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.process_file_name + ' ' + item.task_name}
                                        description={item.start_time}
                                    />
                                    <div>{item.percentage + '%'}</div>
                                </List.Item>}
                        />
                        <List
                            size="large"
                            header={<div style={{ color: '#32CD32', fontSize: 14, fontWeight: 'bold' }}>{'已完成任务'}</div>}
                            //bordered
                            dataSource={doneTasks}
                            renderItem={item =>
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.process_file_name + ' ' + item.task_name}/*固件名称 + 任务名称*/
                                        description={item.start_time}
                                    />
                                    <div>{item.percentage + '%'}</div>
                                </List.Item>}
                        />
                    </Drawer>
                </Card>
            </Skeleton>
        );
    }
}

export default withStyles(styles)(ComponentConnectView);