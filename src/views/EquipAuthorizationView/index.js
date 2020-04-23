import { withStyles } from '@material-ui/core/styles';
import { Row, Col, Input, Button, Icon, Card, Skeleton, Table, message } from 'antd';
import { inject, observer } from 'mobx-react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { DeepClone } from '../../utils/ObjUtils';
import { GetMainViewHeight, GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils';
import { columns as EquipColumn } from './EquipColumn';
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
});

const DEFAULT_PAGE_SIZE = 10;
@observer
@inject('userStore')
class EquipAuthorizationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            equips: [],
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 200,      // 表格的 scrollHeight
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            totalResult: 0,
            selectedEquipRowKeys: [],
            equipValue: '',
            blackEquips: [],
            whiteEquips: [],
        }
        this.queryEquips(this.state.currentPage, this.state.pageSize);
        this.queryBlackEquips(this.state.currentPage, this.state.pageSize);
        this.queryWhiteEquips(this.state.currentPage, this.state.pageSize);
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

    queryBlackEquipsCB = (data) => {
        if (data.code === 'ERROR_OK') {
            let startSet = (this.state.currentPage - 1) * this.state.pageSize;
            let equips = data.payload.map((equip, index) => {
                let item = DeepClone(equip);
                item.index = startSet + index + 1;
                item.key = startSet + index + 1;
                item.authorization_tag = this.getAuthorizationTag(equip.empower_flag);
                item.os_type = this.getOSType(equip.os_type);
                return item;
            });
            this.setState({ blackEquips: equips, /*totalResult: data.payload.total*/ });
        }
    }

    queryBlackEquips = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        return RestReq.asyncGet(this.queryBlackEquipsCB, '/fw-bend-server/assets/get-assets', { empower_flag: -1 }, { token: false });
    }

    queryWhiteEquipsCB = (data) => {
        if (data.code === 'ERROR_OK') {
            let startSet = (this.state.currentPage - 1) * this.state.pageSize;
            let equips = data.payload.map((equip, index) => {
                let item = DeepClone(equip);
                item.index = startSet + index + 1;
                item.key = startSet + index + 1;
                item.authorization_tag = this.getAuthorizationTag(equip.empower_flag);
                item.os_type = this.getOSType(equip.os_type);
                return item;
            });
            this.setState({ whiteEquips: equips, /*totalResult: data.payload.total*/ });
        }
    }

    queryWhiteEquips = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        return RestReq.asyncGet(this.queryWhiteEquipsCB, '/fw-bend-server/assets/get-assets', { empower_flag: 1 }, { token: false });
    }

    getAuthorizationTag = (type) => {
        if (type === 0) {
            return "未操作";
        } else if (type === 1) {
            return "授权通过";
        } else if (type === -1) {
            return "授权失败";
        }
    }

    getOSType = (type) => {
        if (type === '1') {
            return "Windows";
        } else if (type === '2') {
            return "Linux";
        }
    }

    queryEquips = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        if (this.state.equipValue !== '') {
            return RestReq.asyncGet(this.queryEquipsCB, '/fw-bend-server/assets/get-assets', { name: this.state.equipValue }, { token: false });
        }
        return RestReq.asyncGet(this.queryEquipsCB, '/fw-bend-server/assets/get-assets', { /*offset: startSet, count: pageSize*/ }, { token: false });
    }

    queryEquipsCB = (data) => {
        if (data.code === 'ERROR_OK') {
            let startSet = (this.state.currentPage - 1) * this.state.pageSize;
            let equips = data.payload.map((equip, index) => {
                let item = DeepClone(equip);
                item.index = startSet + index + 1;
                item.key = startSet + index + 1;
                item.authorization_tag = this.getAuthorizationTag(equip.empower_flag);
                item.os_type = this.getOSType(equip.os_type);
                return item;
            });
            this.setState({ equips, /*totalResult: data.payload.total*/ });
        }
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
        this.queryEquips(currentPage, pageSize);
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
            this.queryEquips(this.state.currentPage, this.state.pageSize, 0);
        }
        this.setState({
            equipValue: event.target.value,
        })
    };

    handleEquipInputValue = (event) => {
        if (event.target.value === '' && (this.state.equipValue === '' || this.state.equipValue === undefined)) {
            this.queryEquips(this.state.currentPage, this.state.pageSize, 0);
        }
        this.setState({
            equipValue: event.target.value,
        })
    };

    handleAuthorizationCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.queryEquips(this.state.currentPage, this.state.pageSize);
            //this.queryWhiteEquips();
            //this.queryBlackEquips();
        } else {
            message.info("授权失败！");
        }
    };

    handleAuthorization = () => {
        let selectedEquipRowKeys = this.state.selectedEquipRowKeys;
        if (selectedEquipRowKeys.length <= 0) {
            message.info("请选择一条记录进行授权");
            return;
        }
        RestReq.asyncGet(this.handleAuthorizationCB, '/fw-bend-server/authenticate/to-authorizate', { asset_uuid: selectedEquipRowKeys[0], empower_flag: 1 }, { token: false });
    };

    getWhiteEquipTableProps() {
        const { totalResult, scrollWidth, scrollHeight, whiteEquips } = this.state;
        let self = this;

        const tableProps = {
            columns: Column,
            rowKey: record => record.uuid,
            dataSource: whiteEquips,
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

    getBlackEquipTableProps() {
        const { totalResult, scrollWidth, scrollHeight, blackEquips } = this.state;
        let self = this;

        const tableProps = {
            columns: Column,
            rowKey: record => record.uuid,
            dataSource: blackEquips,
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

    getEquipTableProps() {
        const { selectedEquipRowKeys, totalResult, scrollWidth, scrollHeight, equips } = this.state;
        let self = this;

        // TODO 接口目前只支持单个授权 这里需要修改
        const rowSelection = {
            selectedEquipRowKeys,
            onChange: this.onSelectEquipChange,
            getCheckboxProps: record => ({
                disabled: record.empower_flag === 1,// 已经授权的置虚，不再进行授权
            }),
        };

        const tableProps = {
            rowSelection: rowSelection,
            columns: EquipColumn,
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
        const { classes } = this.props;
        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar paragraph={{ rows: 12 }}>
                <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                    <Row>
                        {/* <Col span={4}><Typography variant="h6">设备列表</Typography></Col> */}
                        <Col span={8} align="left">
                            <Input className={classes.antInput} size="large" onChange={this.handleEquipInputValue.bind(this)} placeholder="设备名称查询" onKeyPress={this.handleEquipInputKeyPressed.bind(this)} />
                        </Col>
                        <Col span={4} align="left"><Button type="primary" size="large" onClick={this.handleAuthorization.bind(this)}><Icon type="plus-circle-o" />进行授权</Button></Col>
                    </Row>
                    <Table {...this.getEquipTableProps()} />
                    <Row>
                        <Col span={11}>
                            <Card title={'白名单设备列表'} style={{ width: '100%', height: '100%' }}>
                            <Table {...this.getWhiteEquipTableProps()} />
                            </Card>
                        </Col>
                        <Col span={11} offset={2}>
                            <Card title={'黑名单设备列表'} style={{ width: '100%', height: '100%' }}>
                            <Table {...this.getBlackEquipTableProps()} />
                            </Card>
                        </Col>
                    </Row>
                </div>

            </Skeleton>
        );
    }
}

EquipAuthorizationView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(EquipAuthorizationView);