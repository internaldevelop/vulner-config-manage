
import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { observer, inject } from 'mobx-react'

import { Modal, Skeleton, Card, Table, Button, message, Upload, Row, Col, Popconfirm, Input } from 'antd'
import { GetMainViewHeight, GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils'
import EllipsisText from '../../components/widgets/EllipsisText';
import { actionType } from '../../global/enumeration/ActionType';
import { GetTableColumnFilters } from '../../utils/tools'
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'
import RestReq from '../../utils/RestReq';
import * as XLSX from 'xlsx';
import LogParamsConfig from './LogParamsConfig'

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
});

const DEFAULT_PAGE_SIZE = 10;
@observer
@inject('userStore')
@inject('logStore')
class SystemLogsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [],
            logs: [],
            scrollWidth: 1500,        // 表格的 scrollWidth
            scrollHeight: 1300,      // 表格的 scrollHeight
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            totalResult: 0,
            recordChangeID: -1,
            selectedRowKeys: [], // Check here to configure the default column
            inputFileNameVisible: false,
            inputFileName: this.getDefaultFileName(),
        }
        this.querySystemLogs(this.state.currentPage, this.state.pageSize);
    }

    /** 初始化操作列，定义渲染效果 */
    initActionColumn() {
        const { columns } = this.state;
        const { classes } = this.props;
        if (columns.length === 0)
            return;

        columns[columns.length - 1].render = (text, record, index) => (
            <div>
                <Popconfirm title="确定要删除该日志信息吗？" onConfirm={this.handleDel(index).bind(this)} okText="确定" cancelText="取消">
                    <Button className={classes.actionButton} type="danger" size="small">删除</Button>{/**disabled={!this.isCustomizedData(index)} */}
                </Popconfirm>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleEditLog(index).bind(this)}>编辑</Button>
            </div>
        )

        this.setState({ columns });
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

    getAccountName(item, accountInfo) {
        if (accountInfo !== undefined) {
            try {
                let infoArrays = JSON.parse(accountInfo);
                item.account_name = infoArrays.account_name;
                item.account_alias = infoArrays.account_alias;
            } catch (e) {
                console.log('error：' + e);
                return false;
            }
        }
    }

    querySystemLogsCB = (data) => {
        if (data.payload.logs !== undefined) {
            let startSet = (this.state.currentPage - 1) * this.state.pageSize;
            let logs = data.payload.logs.map((log, index) => {
                let item = DeepClone(log);
                // antd 表格的 key 属性复用 index
                // 表格中索引列（后台接口返回数据中没有此属性）
                //item.index = index + 1;
                //item.key = index + 1;
                item.index = startSet + index + 1;
                item.key = startSet + index + 1;
                item.level = this.getLogLevelMeaning(item.type);
                this.getAccountName(item, log.account_info);
                return item;
            });
            this.setState({ logs, totalResult: data.payload.total });
            this.getTableColumns();
            // 设置操作列的渲染
            this.initActionColumn();
        }
    }

    querySystemLogs = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        return RestReq.asyncGet(this.querySystemLogsCB, '/system-log/sys_log/search_by_filter', { offset: startSet, count: pageSize }, { token: false });
    }

    logTypeArray() {
        //TODO, 测试中要求运行日志，登录日志，错误日志，这里把失败类型改成错误类型，未知改成登录，成功，信息以及异常都算运行日志
        return ["登录", "成功", "错误", "系统错误", "信息", "异常", "告警",];
    }

    logLevelArray() {
        return ["普通", "异常", "严重"];
    }

    getLogTypeMeaning(type) {
        if (type === 0) {
            return "登录";
        } else if (type === 1 || type === 4) {
            return "运行";
        } else if (type === 5 || type === 6) {
            return "告警";
        } else {
            return "错误";
        }
        //return this.logTypeArray()[type];
    }

    getLogLevelMeaning(type) {
        let typeName = this.logTypeArray()[type];
        if (typeName === "成功" || typeName === "信息" || typeName === "登录") {
            return this.logLevelArray()[0];
        } else if (typeName === "告警" || typeName === "异常") {
            return this.logLevelArray()[1];
        } else {
            return this.logLevelArray()[2];
        }
    }

    getLevelColumnFilters = (dataList, key) => {
        let values = [];
        for (let item of dataList) {
            let meaning = this.getLogLevelMeaning(item[key]);
            if ((meaning.length > 0) && (values.indexOf(meaning) < 0)) {
                values.push(meaning);
            }
        }
        return values.map(item => { return { text: item, value: item }; });
    }

    getTypeColumnFilters = (dataList, key) => {
        let values = [];
        for (let item of dataList) {
            let meaning = this.getLogTypeMeaning(item[key]);
            if ((meaning.length > 0) && (values.indexOf(meaning) < 0)) {
                values.push(meaning);
            }
        }
        return values.map(item => { return { text: item, value: item }; });
    }

    createTableColums() {
        // TODO get table colums from the server
        let colums = [{ title: '序号', dataIndex: 'index', key: 'key' }, { title: '级别', dataIndex: 'level' }, { title: '类型', dataIndex: 'type' },];
        let tableColumns = [];
        let columItem;
        for (let item of colums) {
            columItem = DeepClone(item);
            columItem.width = 80;
            tableColumns.push(columItem);
        }
        columItem = { title: '', width: 150, render: () => (<span></span>) };
        tableColumns.push(columItem);
        this.setState({ columns: tableColumns });
    }

    getTableColumns = () => {
        const ratio = 1;
        const { logs } = this.state;
        const constantTableColumns = [
            {
                title: '序号', dataIndex: 'index', key: 'key', width: 80,
            },
            {
                title: '级别', dataIndex: 'level', width: 80,
                // 添加过滤器用于审计
                filters: this.getLevelColumnFilters(logs, "type"),
                filterMultiple: true,
                onFilter: (value, record) => this.getLogLevelMeaning(record.type).indexOf(value) === 0,
            },
            {
                title: '类型', dataIndex: 'type', width: 80,
                render: content => this.getLogTypeMeaning(parseInt(content)),
                // 添加过滤器用于审计
                filters: this.getTypeColumnFilters(logs, "type"),
                filterMultiple: true,
                onFilter: (value, record) => this.getLogTypeMeaning(record.type).indexOf(value) === 0,
            },
            {
                title: '标题', dataIndex: 'title', width: 80,
                // 添加过滤器用于审计
                filters: GetTableColumnFilters(logs, "title"),
                filterMultiple: true,
                onFilter: (value, record) => record.title.indexOf(value) === 0,
            },
            {
                title: '日志内容', dataIndex: 'contents', width: 260,
                render: content => <EllipsisText content={content} width={260 * ratio} />,
            },
            {
                title: '用户名', dataIndex: 'account_alias', width: 100,
                // 添加过滤器用于审计
                filters: GetTableColumnFilters(logs, "account_alias"),
                filterMultiple: true,
                onFilter: (value, record) => record.account_alias.indexOf(value) === 0,
            },
            {
                title: '用户账号', dataIndex: 'account_name', width: 100,
                // 添加过滤器用于审计
                filters: GetTableColumnFilters(logs, "account_name"),
                filterMultiple: true,
                onFilter: (value, record) => record.account_name.indexOf(value) === 0,
            },
            {
                title: '时间', dataIndex: 'create_time', width: 130,
            },
            {
                title: '',
                width: 150,
                render: () => (
                    <span>
                    </span>
                ),
            },
        ];
        // 查询定制日志项，构造tableColumns
        let tableColumns = constantTableColumns;
        this.setState({ columns: tableColumns });
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

    /** 处理页面变化（页面跳转/切换/每页记录数变化） */
    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
        this.querySystemLogs(currentPage, pageSize);
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    getTableProps() {
        const { selectedRowKeys, totalResult, scrollWidth, scrollHeight, logs, columns } = this.state;
        //let newScrollHeight = scrollHeight > 500 ? scrollHeight - 80 : scrollHeight;
        let self = this;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        const tableProps = {
            rowSelection: { rowSelection },
            columns: columns,
            rowKey: record => record.uuid,
            dataSource: logs,
            scroll: { x: scrollWidth, y: scrollHeight },
            //scroll: { y: newScrollHeight },
            bordered: true,
            pagination: {
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
            }
        };
        return tableProps;
    }

    uploadLogRecords = (data) => {
        // 批量上传到服务器，成功后重新查询日志数据库，更新table
    }

    downloadLogRecords = () => {
        this.setState({ inputFileNameVisible: true });
    }

    handleInputFileNameCancel = () => {
        this.setState({ inputFileNameVisible: false });
    }

    handleInputFileNameOk = () => {
        if (this.state.inputFileName === '') {
            message.info('请输入文件名');
        } else if (this.state.selectedRowKeys.length <= 0) {
            message.info('请选择日志记录');
        } else {
            // 生成文件名为inputFileName的报告文件
            message.info(this.state.inputFileName + '已经生成');
            this.setState({ inputFileNameVisible: false });
        }
    }

    handleFileNameChange = (event) => {
        this.setState({
            inputFileName: event.target.value,
        })
    }

    beforeUpload = (file) => {
        // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        // if (!isJpgOrPng) {
        //     message.error('You can only upload JPG/PNG file!');
        //     return false;
        // }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
            return false;
        }
        // const { files } = file.target;
        const files = file;

        // 通过FileReader对象读取文件
        const fileReader = new FileReader();
        let self = this;
        fileReader.onload = event => {
            try {
                const { result } = event.target;
                // 以二进制流方式读取得到整份excel表格对象
                const workbook = XLSX.read(result, { type: 'binary' });
                // 存储获取到的数据
                let data = [];
                // 遍历每张工作表进行读取（这里默认只读取第一张表）
                for (const sheet in workbook.Sheets) {
                    // esline-disable-next-line
                    if (workbook.Sheets.hasOwnProperty(sheet)) {
                        // 利用 sheet_to_json 方法将 excel 转成 json 数据
                        data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                        // break; // 如果只取第一张表，就取消注释这行
                    }
                }
                self.uploadLogRecords(data);
                // 最终获取到并且格式化后的 json 数据
                message.success('文件解析成功！')
                console.log(data);
            } catch (e) {
                // 这里可以抛出文件类型错误不正确的相关提示
                message.error('文件类型不正确！');
            }
        };
        // 以二进制方式打开文件
        // fileReader.readAsBinaryString(files[0]);
        fileReader.readAsBinaryString(files);
        // fileReader.readAsArrayBuffer(files)
    }

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
        }
    };

    getDefaultFileName = () => {
        let now = new Date();
        let month = (10 > (now.getMonth() + 1)) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        let day = (10 > now.getDate()) ? '0' + now.getDate() : now.getDate();
        let today = now.getFullYear() + month + day;
        return 'back' + today;
    }

    getLogActions = () => {
        return (
            <span>
                <Row>
                    <Col span={8}>
                        <Upload
                            name="avatar"
                            //listType="picture-card"
                            //className="avatar-uploader"
                            showUploadList={false}
                            //action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            beforeUpload={this.beforeUpload}
                            onChange={this.handleChange}
                        >
                            <Button size={'large'} type='primary' style={{ marginRight: 100 }} onClick={this.uploadLogRecords}>日志记录上传</Button>
                        </Upload>
                    </Col>
                    <Col span={8} offset={1}>
                        <Button size={'large'} type='primary' onClick={this.downloadLogRecords}>日志记录生成</Button>
                        <Modal
                            title="请输入文件名称"
                            visible={this.state.inputFileNameVisible}
                            onOk={this.handleInputFileNameOk}
                            onCancel={this.handleInputFileNameCancel}
                        >
                            <Input defaultValue={this.state.inputFileName} onChange={this.handleFileNameChange.bind(this)}></Input>
                        </Modal>
                    </Col>
                </Row>
                {/* <Button size={'large'} type='primary' style={{ marginLeft: '16px' }} onClick={this.uploadLogRecords}>日志记录上传</Button> */}
            </span>
        );
    }

    deleteLogCB = (dataIndex) => (data) => {
        const { logs } = this.state;
        // rowIndex 为行索引，第二个参数 1 为一次去除几行
        logs.splice(dataIndex, 1);
        this.setState({ logs });
    }

    handleDel = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 向后台提交删除该日志
        const { logs } = this.state;
        //RestReq.asyncGet(this.deleteLogCB(dataIndex), '/fw-bend-server/vuldb/del_vul', { vul_id: vulners[dataIndex].vul_id });
    }

    /** 处理编辑操作 */
    handleEditLog = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);
        const logItem = this.state.logs[dataIndex];
        const logStore = this.props.logStore;
        logStore.setLogAction(actionType.ACTION_EDIT);
        logStore.setLogProcName('编辑日志参数');
        logStore.initLogItem(logItem);
        this.setState({ recordChangeID: dataIndex, showConfig: true });
    }

    handleNewLog = (event) => {
        const logStore = this.props.logStore;
        logStore.setLogAction(actionType.ACTION_NEW);
        logStore.setLogProcName(('新建漏洞'));
        let logItem = {
            title: '',//新建漏洞
            customized: 1,
        };
        logStore.initLogItem(logItem);
        this.setState({ showConfig: true });
    }

    handleCloseConfig = (isOk, policy) => {
        const logStore = this.props.logStore;
        if (isOk) {
            if (logStore.logAction === actionType.ACTION_NEW) {
                this.addLogData();
            } else if (logStore.logAction === actionType.ACTION_EDIT) {
                this.editLogParams();
            }
        }
        this.setState({ showConfig: false });
    }

    addLogData = () => {
        const { logs } = this.state;
        const logItem = this.props.logStore.logItem;
        logItem.key = logs.length + 1;
        logItem.index = (logs.length + 1).toString();
        logs.unshift(logItem);
    }

    editLogParams = () => {
        const { logs, recordChangeID } = this.state;
        const logItem = this.props.logStore.logItem;
        let record = logs[recordChangeID];
        DeepCopy(record, logItem);
    }

    render() {
        const userStore = this.props.userStore;
        const { columns, showConfig, } = this.state;
        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar paragraph={{ rows: 12 }}>
                <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                    <Card title={'操作日志'} extra={this.getLogActions()} style={{ width: '100%', height: '100%' }}
                    >
                        <Table {...this.getTableProps()} />
                    </Card>
                </div>
                {showConfig && <LogParamsConfig actioncb={this.handleCloseConfig} />}
            </Skeleton>
        );
    }
}

SystemLogsView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(SystemLogsView);