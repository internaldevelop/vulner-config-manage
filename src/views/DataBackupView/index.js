import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { Input, Table, Skeleton, Select, Card, Row, Col, Switch, Button, Icon } from 'antd'
import { columns as Column } from './Column'
import RestReq from '../../utils/RestReq';
import { GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils'

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
    shade: {
        position: 'absolute',
        top: 50,
        left: 0,
        zIndex: 10,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        opacity: 0.01,
        display: 'block',
    },
});

const Option = Select.Option;
const DEFAULT_PAGE_SIZE = 10;
@inject('userStore')
@observer
class DataBackupView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [], // Check here to configure the default column
            users: [],
            columns: Column,
            pageSize: DEFAULT_PAGE_SIZE,
            scrollWidth: 800,        // 表格的 scrollWidth
            scrollHeight: 200,      // 表格的 scrollHeight
            logOnOff: 'on',
        }
        this.getUsers();
    }

    getUsersCB = (data) => {
        this.setState({
            users: data.payload,
        });
    }

    getUsers() {
        RestReq.asyncGet(this.getUsersCB, '/unified-auth/account_manage/all');
    }

    handleSelectManager = (value) => {
        const { users } = this.state;
        for (let user of users) {
            if (user.uuid === value) {
                break;
            }
        }
    }

    getLogValue = () => {
        // TODO get log value from server
        return (this.state.logOnOff === 'on' ? true : false);
    }

    handleLogSwitch = (checked, event) => {
        const logOnOff = checked ? 'on' : 'off';
        this.setState({ logOnOff });
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    getDefaultFileName = () => {
        let now = new Date();
        let month = (10 > (now.getMonth() + 1)) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        let day = (10 > now.getDate()) ? '0' + now.getDate() : now.getDate();
        let today = now.getFullYear() + month + day;
        return 'back' + today;
    }

    handleFileChange = (value) => {
        // 
    }

    saveData = () => {
        // TODO save data
    }

    render() {
        const { classes } = this.props;
        const { selectedRowKeys, scrollWidth, scrollHeight, columns, users, } = this.state;
        const userStore = this.props.userStore;
        let self = this;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                        <Card title={'系统备份'} style={{ width: '100%', height: '100%' }}
                        >
                            <FormControl margin="normal" className={classes.formControl}>
                                <FormLabel component="legend">用户列表</FormLabel>
                                <Table
                                    rowSelection={rowSelection}
                                    id="userListTable"
                                    columns={columns}
                                    dataSource={users}
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
                            </FormControl>
                            <Row>
                                <Col span={4}>
                                    {"日志开关："}
                                </Col>
                                <Col span={4}>
                                    <Switch checkedChildren="开" unCheckedChildren="关" onChange={this.handleLogSwitch.bind(this)}
                                     checked={this.getLogValue()} />
                                </Col>
                                <Col span={4}>
                                    {"备份文件名称："}
                                </Col>
                                <Col span={4}>
                                    <Input defaultValue={this.getDefaultFileName()} onChange={this.handleFileChange.bind(this)} style={{ width: 200 }} />
                                </Col>
                            </Row>
                            <br />
                            <br />
                            <Row>
                                <Col span={4} offset={6}>
                                    <Button type="primary" size="large" onClick={this.saveData.bind(this)}><Icon type="save" />系统备份</Button>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </Skeleton>
            </div>
        )

    }
}

DataBackupView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(DataBackupView);