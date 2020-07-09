import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, Button, Input, Icon, Col, Row, Select, Skeleton, Table } from 'antd';
import { inject, observer } from 'mobx-react';
// import Typography from '@material-ui/core/Typography';
import Typography from '../../modules/components/Typography';
import MAntdCard from '../../rlib/props/MAntdCard';
import MAntdTable from '../../rlib/props/MAntdTable';
import { columns as Column } from './Column';

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

let list = [
    { index: 1, title: '水电终端-41', version: 'v1.1', fwName: 'testSquashfsmini.zip', vulNum: 130, vulName: 'Cisco Catalyst交换机远程拒绝服务攻击漏洞' },
    { index: 2, title: '水电终端-42', version: 'v1.3', fwName: 'testSquashfsmini.zip', vulNum: 120, vulName: 'Cisco Catalyst交换机远程拒绝服务攻击漏洞' },
    { index: 3, title: '水电终端-43', version: 'v1.11', fwName: 'testSquashfsmini.zip', vulNum: 110, vulName: 'Cisco Catalyst交换机远程拒绝服务攻击漏洞' },
    { index: 4, title: '水电终端-44', version: 'v12.112', fwName: 'testSquashfsmini.zip', vulNum: 30, vulName: 'Cisco Catalyst交换机远程拒绝服务攻击漏洞' },];

@inject('userStore')
@observer
class FeatureExtrationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            selectRowIndex: -1,
            componetsList: list,
            showConfig: false,
            columns: Column(),
            inputValue: '',
        }
        //this.getAllComponets();
    }

    getAllComponets = () => {
        this.setState({ componetsList: list });
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

    getSearch = (event) => {
        //
    };

    handleAutoConnect = (event) => {
        //
    };

    handleCloseConfig = (isOk) => {
        this.setState({ showConfig: false });
        if (isOk) {
            //重新获取手动关联后的数据
        }
    }

    render() {
        const { classes } = this.props;
        const userStore = this.props.userStore;
        const { columns, componetsList, showConfig } = this.state;
        let self = this;

        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Row>
                    <Col span={12}>
                        <Card title={'组件列表'} style={{ height: '100%', margin: 8 }} headStyle={MAntdCard.headerStyle('main')}>
                            <Table
                                columns={columns}
                                dataSource={componetsList}
                                bordered={true}
                                rowKey={record => record.uuid}
                                rowClassName={this.setRowClassName}
                                onRow={this.onRow}
                                pagination={MAntdTable.pagination(self.handlePageChange)}
                            />
                        </Card>
                        <Row style={{ margin: 8 }}>
                            <Col span={12} align="left">
                                <Input className={classes.antInput} size="large" allowClear onChange={this.handleInputValue.bind(this)} placeholder="敏感关键字" />
                                <Button className={classes.iconButton} type="primary" size="large" onClick={this.getSearch.bind(this)} ><Icon type="file-search" />查询</Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Card title={'特征信息'} style={{ height: '100%', margin: 8 }} headStyle={MAntdCard.headerStyle('info-2')}>
                            <div>

                            </div>
                        </Card>
                    </Col>
                </Row>
            </Skeleton >
        );
    }
}

export default withStyles(styles)(FeatureExtrationView);