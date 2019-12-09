
import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { observer, inject } from 'mobx-react'

import { Skeleton, Card, Table, Select } from 'antd'
import { GetMainViewHeight, GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils'
import EllipsisText from '../../components/widgets/EllipsisText';
import { GetTableColumnFilters } from '../../utils/tools'
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'
import HttpRequest from '../../utils/HttpRequest';

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
});


@observer
@inject('userStore')
class SystemLogsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resultData: [],
            scrollWidth: 1500,        // 表格的 scrollWidth
            scrollHeight: 1300,      // 表格的 scrollHeight
        }

        this.querySystemLogs();
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

    querySystemLogsCB = (data) => {
        let logs = data.payload.map((log, index) => {
            let item = DeepClone(log);
            // antd 表格的 key 属性复用 index
            // 表格中索引列（后台接口返回数据中没有此属性）
            item.index = index + 1;
            item.key = index + 1;
            item.level = this.getLogLevelMeaning(item.type);
            return item;
        });
        this.setState({ resultData: logs });
    }

    querySystemLogs = () => {
        return HttpRequest.asyncGet(this.querySystemLogsCB, '/system-logs/all');
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
        } else if (type === 1 || type === 4 ) {
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

    getTableColumns() {
        const ratio = 1;
        const { resultData } = this.state;
        const tableColumns = [
            {
                title: '序号', dataIndex: 'index', key: 'key', width: 50,
            },
            {
                title: '级别', dataIndex: 'level', width: 80,
                // 添加过滤器用于审计
                filters: this.getLevelColumnFilters(resultData, "type"),
                filterMultiple: true,
                onFilter: (value, record) => this.getLogLevelMeaning(record.type).indexOf(value) === 0,
            },
            {
                title: '类型', dataIndex: 'type', width: 80,
                render: content => this.getLogTypeMeaning(parseInt(content)),
                // 添加过滤器用于审计
                filters: this.getTypeColumnFilters(resultData, "type"),
                filterMultiple: true,
                onFilter: (value, record) => this.getLogTypeMeaning(record.type).indexOf(value) === 0,
            },
            {
                title: '标题', dataIndex: 'title', width: 80,
                // 添加过滤器用于审计
                filters: GetTableColumnFilters(resultData, "title"),
                filterMultiple: true,
                onFilter: (value, record) => record.title.indexOf(value) === 0,
            },
            {
                title: '日志内容', dataIndex: 'contents', width: 260,
                render: content => <EllipsisText content={content} width={260 * ratio} />,
            },
            {
                title: '用户名', dataIndex: 'create_user_name', width: 100,
                // 添加过滤器用于审计
                // filters: GetTableColumnFilters(resultData, "create_user_name"),
                // filterMultiple: true,
                // onFilter: (value, record) => record.create_user_name.indexOf(value) === 0,
            },
            {
                title: '用户账号', dataIndex: 'create_user_account', width: 100,
                // 添加过滤器用于审计
                // filters: GetTableColumnFilters(resultData, "create_user_account"),
                // filterMultiple: true,
                // onFilter: (value, record) => record.create_user_account.indexOf(value) === 0,
            },
            {
                title: '时间', dataIndex: 'create_time', width: 130,
            },
        ];
        return tableColumns;
    }

    onChange = () =>{

    }

    getTableProps() {
        const DEFAULT_PAGE_SIZE = 10;
        const { scrollWidth, scrollHeight, resultData } = this.state;
        let newScrollHeight = scrollHeight > 500 ? scrollHeight - 80 : scrollHeight;

        const tableProps = {
            columns: this.getTableColumns(),
            rowKey: record => record.uuid,
            dataSource: resultData,
            onChange: this.onChange,
            // scroll: { x: scrollWidth, y: newScrollHeight },
            scroll: { y: newScrollHeight },
            bordered: true,
            pagination: {
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                pageSizeOptions: [DEFAULT_PAGE_SIZE.toString(), '20', '50'],
                defaultPageSize: DEFAULT_PAGE_SIZE,
                showQuickJumper: true,
                showSizeChanger: true,
            }
        };
        return tableProps;
    }

    render() {
        const userStore = this.props.userStore;
        return (
            <Skeleton loading={userStore.isAdminUser} active avatar paragraph={{ rows: 12 }}>
                <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                    <Card title={'操作日志'} style={{ width: '100%', height: '100%' }}
                    >
                        <Table {...this.getTableProps()} />
                    </Card>
                </div>

            </Skeleton>
        );
    }
}

SystemLogsView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(SystemLogsView);
