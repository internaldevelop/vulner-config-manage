import { withStyles } from '@material-ui/core/styles';
import { Button, Card, Popconfirm, Skeleton, Table } from 'antd';
import { inject } from 'mobx-react';
import React from 'react';
import { actionType } from '../../global/enumeration/ActionType';
import MAntdCard from '../../rlib/props/MAntdCard';
import MAntdTable from '../../rlib/props/MAntdTable';
import { DeepClone, DeepCopy } from '../../utils/ObjUtils';
import { GetMainViewHeight } from '../../utils/PageUtils';
import RestReq from '../../utils/RestReq';
import { columns as Column } from './Column';
import FirmwareDownloadView from './FirmwareDownloadView';
import FirmwareParamsConfig from './FirmwareParamsConfig';

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
    formControl: {
        margin: 0,
        marginLeft: 10,
    },
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
});

const DEFAULT_PAGE_SIZE = 10;
@inject('firmwareStore')
@inject('userStore')
class FirmwareFetchView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: Column(),
            currentPage: 1,     // Table中当前页码（从 1 开始）
            pageSize: DEFAULT_PAGE_SIZE,
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 400,      // 表格的 scrollHeight
            firmwareList: [],
            percent: 0,
        }

        // 设置操作列的渲染
        this.initActionColumn();

        this.getAllFirmwares(this.state.currentPage, this.state.pageSize);
    }

    componentDidMount() {
        // 增加监听器，侦测浏览器窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    handleResize = e => {
        console.log('浏览器窗口大小改变事件', e.target.innerWidth, e.target.innerHeight);
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    componentWillUnmount() {
        // 组件卸装前，一定要移除监听器
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    /** 初始化操作列，定义渲染效果 */
    initActionColumn() {
        const { columns } = this.state;
        const { classes } = this.props;
        if (columns.length === 0)
            return;

        columns[columns.length - 1].render = (text, record, index) => (
            <div>
                <Popconfirm title="确定要删除该固件吗？" onConfirm={this.handleDel(index).bind(this)} okText="确定" cancelText="取消">
                    <Button className={classes.actionButton} type="danger" size="small">删除</Button>
                </Popconfirm>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleEdit(index).bind(this)}>编辑</Button>
            </div>
        )

        this.setState({ columns });
    }

    /**
     * 将数据所在页的行索引转换成整个数据列表中的索引
     * @param {} rowIndex 数据在表格当前页的行索引
     */
    transferDataIndex(rowIndex) {
        // currentPage 为 Table 中当前页码（从 1 开始）
        const { currentPage, pageSize } = this.state;
        let dataIndex = (currentPage - 1) * pageSize + rowIndex;
        return dataIndex;
    }

    /** 向后台发起删除固件数据请求的完成回调 
     *  因调用请求函数时，默认参数只返回成功请求，所以此处不需要判断后台是否成功删除固件
    */
    deleteFirmwaresCB = (dataIndex) => (data) => {
        // const { firmwareList } = this.state;
        // // rowIndex 为行索引，第二个参数 1 为一次去除几行
        // firmwareList.splice(dataIndex, 1);
        // this.setState({ firmwareList });
        // 删除完一条数据后重新取当前页面的数据, TODO, 看看是否需要这么做,或者其他方式
        this.getAllFirmwares(this.state.currentPage, this.state.pageSize);
    }

    /** 处理删除操作
     * rowIndex 为当前页所含记录中的第几行（base:0），不是所有记录中的第几条
     * 需要根据当前 pagination 的属性，做变换
     */
    handleDel = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 向后台提交删除该固件
        const { firmwareList } = this.state;
        // TODO 需要修改接口
        // RestReq.asyncPost(this.deleteFirmwaresCB(dataIndex), '/firmware-analyze/fw-fetch/del', {}, { uuid: firmwareList[dataIndex].uuid, token: false });
    }

    /** 处理编辑操作 */
    handleEdit = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 获取需要编辑的固件数据
        const firmwareItem = this.state.firmwareList[dataIndex];

        // 利用仓库保存固件操作类型、操作窗口名称、固件数据
        const firmwareStore = this.props.firmwareStore;
        firmwareStore.setFirmwareAction(actionType.ACTION_EDIT);
        firmwareStore.setFirmwareProcName('编辑固件参数');
        firmwareStore.initFirmwareItem(firmwareItem);

        // 保存待编辑的数据索引，并打开任务数据操作窗口
        this.setState({ recordChangeID: dataIndex, showConfig: true });
    }

    /** 新建/编辑固件窗口完成的回调处理 */
    handleCloseConfig = (isOk, policy) => {
        const firmwareStore = this.props.firmwareStore;
        if (isOk) {
            if (firmwareStore.firmwareAction === actionType.ACTION_NEW) {
                //
            } else if (firmwareStore.firmwareAction === actionType.ACTION_EDIT) {
                this.editFirmwareParams();
            }
        }

        // 关闭固件数据操作窗口
        this.setState({ showConfig: false });
    }

    /** 确认修改固件后，在固件列表中修改指定数据 */
    editFirmwareParams = () => {
        const { firmwareList, recordChangeID } = this.state;
        const firmwareItem = this.props.firmwareStore.firmwareItem;

        // 从仓库中取出编辑后的固件对象，深拷贝到源数据中
        let record = firmwareList[recordChangeID];
        DeepCopy(record, firmwareItem);
    }

    getAllFirmwares = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        // TODO 提供分页功能,但是接口目前没有提供分页
        RestReq.asyncGet(this.getAllFirmwaresCB, '/firmware-analyze/fw_analyze/pack/all', { /*offset: startSet, count: pageSize*/ }, { token: false });
    }

    getAllFirmwaresCB = (data) => {
        let firmwares = [];
        // 检查响应的payload数据是数组类型
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;

        // 从响应数据生成 table 数据源
        let startSet = (this.state.currentPage - 1) * this.state.pageSize;
        firmwares = data.payload.map((firmware, index) => {
            let firmwareItem = DeepClone(firmware);
            // antd 表格需要数据源中含 key 属性
            //firmwareItem.key = index + 1;
            // 表格中索引列（后台接口返回数据中没有此属性）
            //firmwareItem.index = index + 1;
            firmwareItem.index = startSet + index + 1;
            firmwareItem.key = startSet + index + 1;
            return firmwareItem;
        })
        this.setState({ firmwareList: firmwares });
    }

    /** 处理页面变化（页面跳转/切换/每页记录数变化） */
    handlePageChange = (currentPage, pageSize) => {
        // TODO 目前没有提供分页功能 暂时不按照分页取数据
        //this.setState({ currentPage, pageSize });
        // this.getAllFirmwares(currentPage, pageSize);
    }

    render() {
        const { columns, showConfig, firmwareList } = this.state;
        let self = this;
        const { classes } = this.props;
        const userStore = this.props.userStore;

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <FirmwareDownloadView onCallback={this.getAllFirmwares} />
                    <Card title={'固件列表'} style={{ height: '100%' }} headStyle={MAntdCard.headerStyle('default')}>
                        <Table
                            columns={columns}
                            dataSource={firmwareList}
                            //scroll={{ x: scrollWidth, y: scrollHeight }}
                            rowKey={record => record.uuid}
                            pagination={MAntdTable.pagination(self.handlePageChange)}
                        />
                    </Card>
                    {showConfig && <FirmwareParamsConfig actioncb={this.handleCloseConfig} />}
                </Skeleton>
            </div>
        );
    }
}

export default withStyles(styles)(FirmwareFetchView);