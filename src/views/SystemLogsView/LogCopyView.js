
import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import moment from 'moment';
import { DatePicker, Icon, Modal, Skeleton, Card, Table, Button, message, Row, Col, Popconfirm, Input } from 'antd'
import { GetMainViewHeight } from '../../utils/PageUtils'
import EllipsisText from '../../components/widgets/EllipsisText';
import { GetTableColumnFilters } from '../../utils/tools'
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'
import { GetNowTimeMyStr } from '../../utils/TimeUtils'
import RestReq from '../../utils/RestReq';

const { RangePicker } = DatePicker;
const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
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

const DEFAULT_PAGE_SIZE = 10;
@observer
@inject('userStore')
@inject('logStore')
class LogCopyView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [],
            logFieldList: [],
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
            inputValue: '',
            beginTime: '2020-07-01 00:00:00',
            endTime: GetNowTimeMyStr(),
        }
        this.getLogFields();
    }

    getLogFields = () => {
        RestReq.asyncGet(this.getLogFieldsCB, '/system-log/sys_log/get-log-info-config');
    }

    getLogFieldsCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;

        this.querySystemLogs(this.state.currentPage, this.state.pageSize);
        this.setState({ logFieldList: data.payload });
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
        }
    }

    querySystemLogs = (targetPage, pageSize) => {
        if (targetPage === undefined) {
            targetPage = 1;
        }
        if (pageSize === undefined) {
            pageSize = DEFAULT_PAGE_SIZE;
        }
        let startSet = (targetPage - 1) * pageSize + 1;
        const {beginTime, endTime} = this.state;
        return RestReq.asyncGet(this.querySystemLogsCB, '/system-log/sys_log/search_by_filter', { offset: startSet, count: pageSize, begin_time: beginTime, end_time: endTime }, { token: false });
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

    getTableColumns = () => {
        const ratio = 1;
        const { logs, logFieldList } = this.state;
        let tableColumns = [];
        let logColumn = {
            title: '序号', dataIndex: 'index', key: 'key', width: 80,
        };
        tableColumns.push(logColumn);
        for (let item of logFieldList) {
            // 显示类型和级别
            if (item.is_display === '1' && item.log_field === 'type') {
                logColumn = {
                    title: '类型', dataIndex: 'type', width: 80,
                    render: content => this.getLogTypeMeaning(parseInt(content)),
                    // 添加过滤器用于审计
                    filters: this.getTypeColumnFilters(logs, "type"),
                    filterMultiple: true,
                    onFilter: (value, record) => this.getLogTypeMeaning(record.type).indexOf(value) === 0,
                };
                tableColumns.push(logColumn);

                logColumn = {
                    title: '级别', dataIndex: 'level', width: 80,
                    // 添加过滤器用于审计
                    filters: this.getLevelColumnFilters(logs, "type"),
                    filterMultiple: true,
                    onFilter: (value, record) => this.getLogLevelMeaning(record.type).indexOf(value) === 0,
                };
                tableColumns.push(logColumn);
            } else if (item.is_display === '1' && item.log_field === 'title') {
                logColumn = {
                    title: '标题', dataIndex: 'title', width: 80,
                    // 添加过滤器用于审计
                    filters: GetTableColumnFilters(logs, "title"),
                    filterMultiple: true,
                    onFilter: (value, record) => record.title.indexOf(value) === 0,
                };
                tableColumns.push(logColumn);
            } else if (item.is_display === '1' && item.log_field === 'contents') {
                logColumn = {
                    title: '日志内容', dataIndex: 'contents', width: 260,
                    render: content => <EllipsisText content={content} width={260 * ratio} />,
                };
                tableColumns.push(logColumn);
            } else if (item.is_display === '1' && item.log_field === 'account_info') {
                logColumn = {
                    title: '用户账号', dataIndex: 'account_name', width: 100,
                    // 添加过滤器用于审计
                    filters: GetTableColumnFilters(logs, "account_name"),
                    filterMultiple: true,
                    onFilter: (value, record) => record.account_name.indexOf(value) === 0,
                };
                tableColumns.push(logColumn);
            } else if (item.is_display === '1' && item.log_field === 'create_time') {
                logColumn = { title: '时间', dataIndex: 'create_time', width: 130, };
                tableColumns.push(logColumn);
            }
        }
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
    handlePageChange = (pagination, filters, sorter) => {
        if (pagination.current !== this.state.currentPage) {
            this.setState({ currentPage: pagination.current, pageSize: pagination.pageSize });
            this.querySystemLogs(pagination.current, pagination.pageSize);
        }
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
            //rowSelection: { rowSelection },
            columns: columns,
            rowKey: record => record.uuid,
            dataSource: logs,
            scroll: { x: scrollWidth, y: scrollHeight },
            //scroll: { y: newScrollHeight },
            bordered: true,
            onChange(pagination, filters, sorter) {
                self.handlePageChange(pagination, filters, sorter);
            },
            pagination: {
                total: totalResult > 0 ? totalResult : 10,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                //showTotal: (totalResult, range) => `${range[0]}-${range[1]} / ${totalResult}`,
                pageSizeOptions: [DEFAULT_PAGE_SIZE.toString(), '20', '30', '40'],
                defaultPageSize: DEFAULT_PAGE_SIZE,
                //showQuickJumper: true,
                showSizeChanger: true,
                onShowSizeChange(current, pageSize) {  //当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                    self.handlePageChange(current, pageSize);
                },
                // onChange(current, pageSize) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                //     self.handlePageChange(current, pageSize);
                // },
            }
        };
        return tableProps;
    }

    copyLogRecords = () => {
        this.setState({ inputFileNameVisible: true });
    }

    handleInputFileNameCancel = () => {
        this.setState({ inputFileNameVisible: false });
    }

    backUpCB = (data) => {
        if (data.code === 'ERROR_OK') {
            message.info(this.state.inputFileName + '已经生成');
        }
    }

    handleInputFileNameOk = () => {
        if (this.state.inputFileName === '') {
            message.info('请输入文件名');
        } else if (this.state.totalResult <= 0) {
            message.info('日志记录数目不能为0');
        } else {
            this.setState({ inputFileNameVisible: false });
            RestReq.asyncGet(this.backUpCB, '/system-log/sys_log/backup', { file_name: this.state.inputFileName, begin_time: this.state.beginTime, end_time: this.state.endTime }, { token: false });
        }
    }

    handleFileNameChange = (event) => {
        this.setState({
            inputFileName: event.target.value,
        })
    }

    getDefaultFileName = () => {
        let now = new Date();
        let month = (10 > (now.getMonth() + 1)) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        let day = (10 > now.getDate()) ? '0' + now.getDate() : now.getDate();
        let today = now.getFullYear() + month + day;
        //return 'back' + today;
        return 'backup';
    }

    getSearch = () => {
        const { beginTime, endTime, currentPage, pageSize } = this.state;
        let startSet = (currentPage - 1) * pageSize + 1;
        RestReq.asyncGet(this.querySystemLogsCB, '/system-log/sys_log/search_by_filter', { offset: startSet, count: pageSize, begin_time: beginTime, end_time: endTime }, { token: false });
    }

    onDateTimeChange = (value, dateString) => {
        this.setState({ beginTime: dateString[0], endTime: dateString[1] });
    }

    onSetDateTime = (value) => {
        // console.log('onSetDateTime: ', value);
    }

    getRangePickerProps() {
        const timeFormat = "YYYY-MM-DD HH:mm:ss";
        const { beginTime, endTime } = this.state;

        const rangePickerProps = {
            allowClear: false,
            showTime: { format: 'HH:mm' },
            format: timeFormat,
            placeholder: ['Start Time', 'End Time'],
            onChange: this.onDateTimeChange,
            onOk: this.onSetDateTime,
            defaultValue: [moment(beginTime, timeFormat), moment(endTime, timeFormat)],
        };
        return rangePickerProps;
    }

    render() {
        const userStore = this.props.userStore;
        const { columns } = this.state;
        const { classes } = this.props;
        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Card title={'日志备份'} style={{ width: '100%', height: '100%' }}>
                    <Row>
                        <Col xs={8}>
                            选择时间（起止时间段）<RangePicker {...this.getRangePickerProps()} />
                        </Col>
                        <Col span={2} align="left" >
                            <Button className={classes.iconButton} type="primary" size="large" onClick={this.getSearch.bind(this)} ><Icon type="file-search" />查询</Button>
                        </Col>
                        <Col span={2} align="left">
                            <Button size={'large'} type='primary' onClick={this.copyLogRecords}><Icon type="copy" />备份</Button>
                            <Modal
                                title="请输入文件名称"
                                visible={this.state.inputFileNameVisible}
                                onOk={this.handleInputFileNameOk.bind(this)}
                                onCancel={this.handleInputFileNameCancel.bind(this)}
                            >
                                <Input defaultValue={this.state.inputFileName} onChange={this.handleFileNameChange.bind(this)}></Input>
                            </Modal>
                        </Col>
                    </Row>
                    <br />
                    <Table {...this.getTableProps()} />
                </Card>
            </Skeleton >
        );
    }
}

LogCopyView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(LogCopyView);