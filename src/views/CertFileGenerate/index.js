import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { DatePicker, Icon, Button, Skeleton, Select, Card, Row, Col } from 'antd'

import RestReq from '../../utils/RestReq';


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

const Option = Select.Option;

@inject('userStore')
@inject('userRoleStore')
@observer
class CertFileGenerate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            selectUserUuid: '',
            selectRoles: [],
            expireDate: null,
        }
        this.getUsers();
    }

    componentWillMount() {
        // 加载用户角色
        this.props.userRoleStore.loadAllRoles();
    }

    getUsersCB = (data) => {
        this.setState({
            users: data.payload,
            selectedAccID: 0,
        });
    }

    getUsers() {
        const userStore = this.props.userStore;
        RestReq.asyncGet(this.getUsersCB, '/unified-auth/account_manage/all');
    }

    handleSelectUser = event => {
        this.setState({ selectUserUuid: event.target.value });
    }

    handleSelectUser = event => {
        this.setState({ selectUserUuid: event.target.value });
    }

    handleDateChange = (date, dateString) => {
        this.setState({ expireDate: date });
    }

    handleUserRoleChange = (values) => {
        this.setState({ selectRoles: values });
    }

    getCertFile = event => {
        // 调接口生成授权文件
    }

    render() {
        const { classes } = this.props;
        const { users } = this.state;
        const userStore = this.props.userStore;
        let roles = this.props.userRoleStore.roleArray;
        return (
            <div>
                <Skeleton loading={!userStore.isAdminUser} active avatar>
                    <Row>
                        <Col span={20} offset={2}>
                            <Card title="授权文件生成">
                                <div>
                                    <Row>
                                        <Col span={4}>
                                            {"请选择用户："}
                                        </Col>
                                        <Col span={4} >
                                            <Select style={{ width: 200 }} defaultValue='' onChange={this.handleSelectUser}>
                                                {users.map(user => (
                                                    <Option value={user.uuid}>{user.alias}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col span={4}>
                                            {"请选择用户角色："}
                                        </Col>
                                        <Col span={4} >
                                            <Select mode="multiple" style={{ width: 200 }} onChange={this.handleUserRoleChange.bind(this)}>
                                                {roles.map(role => (
                                                    <Option value={role.uuid}>{role.alias}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col span={4}>
                                            {"请选择到期日期："}
                                        </Col>
                                        <Col span={4} >
                                            <DatePicker placeholder="选择日期" style={{ width: 200 }} onChange={this.handleDateChange} />
                                        </Col>
                                    </Row>
                                    <br />
                                    <br />
                                    <Row>
                                        <Col span={4} offset={5}>
                                            <Button type="primary" size="large" onClick={this.getCertFile.bind(this)}><Icon type="export" />授权文件生成</Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        )

    }
}

CertFileGenerate.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CertFileGenerate);