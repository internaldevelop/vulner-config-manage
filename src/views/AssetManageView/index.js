import React from 'react'
import PropTypes from 'prop-types';
import { Skeleton, Table, Icon, Button, Row, Col, Tabs, Popconfirm } from 'antd'
import { columns as Column } from './Column'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { observer, inject } from 'mobx-react'
import AssetParamsConfig from './AssetParamsConfig'
import { actionType } from '../../global/enumeration/ActionType';
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'
import { GetMainViewHeight } from '../../utils/PageUtils'
import HttpRequest from '../../utils/HttpRequest';

const TabPane = Tabs.TabPane;


const styles = theme => ({
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
});

const DEFAULT_PAGE_SIZE = 10;
@inject('assetStore')
@inject('userStore')
@observer
class AssetMangeView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showConfig: false,
            columns: Column,
            assets: [],
            recordChangeID: -1,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            pageSize: DEFAULT_PAGE_SIZE,
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 300,      // 表格的 scrollHeight
            shadeState: false,
        }
        // 设置操作列的渲染
        this.initActionColumn();

        // 从后台获取设备数据的集合
        this.getAllAssets();
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
                <Popconfirm title="确定要删除该资产吗？" onConfirm={this.handleDel(index).bind(this)} okText="确定" cancelText="取消">
                    <Button className={classes.actionButton} type="danger" size="small">删除</Button>
                </Popconfirm>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleEdit(index).bind(this)}>编辑</Button>
            </div>
        )

        this.setState({ columns });
    }

    /** 从后台请求所有设备数据，请求完成后的回调 */
    getAllAssetsCB = (data) => {
        let assets = [];
        // 检查响应的payload数据是数组类型
        if (!(data.payload instanceof Array))
            return;

        // 从响应数据生成 table 数据源
        assets = data.payload.map((asset, index) => {
            let assetItem = DeepClone(asset);
            // antd 表格需要数据源中含 key 属性
            assetItem.key = index + 1;
            // 表格中索引列（后台接口返回数据中没有此属性）
            assetItem.index = index + 1;
            return assetItem;
        })

        // 更新 assets 数据源
        this.setState({ assets });
    }

    /** 从后台请求所有设备数据 */
    getAllAssets = () => {
        // 从后台获取任务的详细信息，含任务表的数据和关联表的数据
        HttpRequest.asyncGet(this.getAllAssetsCB, '/assets/all');
    }

    /** 向后台发起删除资产数据请求的完成回调 
     *  因调用请求函数时，默认参数只返回成功请求，所以此处不需要判断后台是否成功删除资产
    */
    deleteAssetCB = (dataIndex) => (data) => {
        const { assets } = this.state;
        // rowIndex 为行索引，第二个参数 1 为一次去除几行
        assets.splice(dataIndex, 1);
        this.setState({ assets });
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

    /** 处理删除操作
     * rowIndex 为当前页所含记录中的第几行（base:0），不是所有记录中的第几条
     * 需要根据当前 pagination 的属性，做变换
     */
    handleDel = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 向后台提交删除该任务
        const { assets } = this.state;
        HttpRequest.asyncPost(this.deleteAssetCB(dataIndex), '/assets/delete', { uuid: assets[dataIndex].uuid });
    }

    /** 处理编辑操作 */
    handleEdit = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 获取需要编辑的资产数据
        const assetItem = this.state.assets[dataIndex];

        // 利用仓库保存资产操作类型、操作窗口名称、资产数据
        const assetStore = this.props.assetStore;
        assetStore.setAssetAction(actionType.ACTION_EDIT);
        assetStore.setAssetProcName('编辑资产参数');
        assetStore.initAssetItem(assetItem);

        // 保存待编辑的数据索引，并打开任务数据操作窗口
        this.setState({ recordChangeID: dataIndex, showConfig: true });
    }

    /** 处理新建资产 */
    handleNewAsset = (event) => {
        const assetStore = this.props.assetStore;
        // 在资产仓库中保存操作类型、窗口名称和缺省资产数据
        assetStore.setAssetAction(actionType.ACTION_NEW);
        assetStore.setAssetProcName(('新建资产'));
        let assetItem = {
            name: '新建资产',
            ip: '127.0.0.1',
            port: '8191',
        };
        assetStore.initAssetItem(assetItem);

        // 打开资产数据操作窗口
        this.setState({ showConfig: true });
    }

    /** 新建/编辑资产窗口完成的回调处理 */
    handleCloseConfig = (isOk, policy) => {
        const assetStore = this.props.assetStore;
        if (isOk) {
            if (assetStore.assetAction === actionType.ACTION_NEW) {
                this.addAssetData();
            } else if (assetStore.assetAction === actionType.ACTION_EDIT) {
                this.editAssetParams();
            }
        }

        // 关闭资产数据操作窗口
        this.setState({ showConfig: false });
    }

    /** 添加资产数据到前端缓存的数据列表中 */
    addAssetData = () => {
        const { assets } = this.state;
        // 从仓库中取出新建的资产对象，设置 key 和 index 属性
        const assetItem = this.props.assetStore.assetItem;
        assetItem.key = assets.length + 1;
        assetItem.index = (assets.length + 1).toString();

        // 将新建资产对象添加到资产数据源中（数据源的首位）
        assets.unshift(assetItem);
    }

    /** 确认修改资产后，在资产列表中修改指定数据 */
    editAssetParams = () => {
        const { assets, recordChangeID } = this.state;
        const assetItem = this.props.assetStore.assetItem;

        // 从仓库中取出编辑后的资产对象，深拷贝到源数据中
        let record = assets[recordChangeID];
        DeepCopy(record, assetItem);
    }

    /** 处理页面变化（页面跳转/切换/每页记录数变化） */
    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
    }

    callback = (key) => {
        console.log(key);
    }

    render() {
        const { columns, showConfig, assets, scrollWidth, scrollHeight } = this.state;
        let self = this;
        const userStore = this.props.userStore;
        return (
            <div>
                <Skeleton loading={userStore.isAdminUser} active avatar>
                    <Row>
                        <Col span={8}><Typography variant="h6">资产管理</Typography></Col>
                        <Col span={8} offset={8} align="right"><Button type="primary" size="large" onClick={this.handleNewAsset.bind(this)}><Icon type="plus-circle-o" />新建资产</Button></Col>
                    </Row>
                    <Table
                        id="assetListTable"
                        columns={columns}
                        dataSource={assets}
                        bordered={true}
                        scroll={{ x: scrollWidth, y: scrollHeight }}
                        rowKey={record => record.uuid}
                        pagination={{
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
                    {showConfig && <AssetParamsConfig actioncb={this.handleCloseConfig} />}
                </Skeleton>
            </div>
        )

    }
}

AssetMangeView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(AssetMangeView);