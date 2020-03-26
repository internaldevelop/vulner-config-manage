import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Input, DatePicker, Icon, Button, Skeleton, Select, Card, Row, Col } from 'antd'
import moment from "moment"

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
@inject('userRoleStore')
@inject('userStore')
@inject('certFileStore')
@observer
class CertFileCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            selectUserUuid: this.props.selectUserUuid,
            selectRoles: this.props.selectRoles,
            expireDate: this.props.expireDate,
        };
        this.getUsers();
    }

    componentWillMount() {
        // 加载用户角色
        this.props.userRoleStore.loadAllRoles();
    }

    getUsersCB = (data) => {
        this.setState({
            users: data.payload,
            //selectedAccID: 0,
        });
    }

    getUsers() {
        const userStore = this.props.userStore;
        RestReq.asyncGet(this.getUsersCB, '/unified-auth/account_manage/all');
    }

    handleSelectUser = (value) => {
        this.props.certFileStore.setParam("selectUserUuid", value);
    }

    handleDateChange = (date, dateString) => {
        this.props.certFileStore.setParam("expireDate", dateString);
    }

    handleUserRoleChange = (values) => {
        this.props.certFileStore.setParam("selectRoles", values);
    }

    getRoleAlias = (selectRoles) => {
        let roleAlias = '';
        const roles = this.props.userRoleStore.roleArray;
        if (roles === undefined || selectRoles === undefined) {
            return;
        }
        for(let item of roles) {
            for (let role of selectRoles) {
                if (item.uuid === role) {
                    roleAlias += item.alias + ' ';
                }
            }
        }
        return roleAlias;
    }

    getUserAlias = (selectUserUuid) => {
        const { users } = this.state;
        if (selectUserUuid === undefined) {
            return;
        }
        for(let item of users) {
            if (item.uuid === selectUserUuid) {
                return item.alias;
            }
        }
    }

    render() {
        const { users } = this.state;
        const userStore = this.props.userStore;
        const { selectUserUuid, expireDate, selectRoles } = this.props.certFileStore.certFileItem;
        let realExpireDate = moment(expireDate);
        const roles = this.props.userRoleStore.roleArray;
        return (
            <div>
                <Row>
                    <Col span={4}>
                        {"用户："}
                    </Col>
                    <Col span={4} >
                        {this.props.manage === 1 && <Select placeholder='选择用户' style={{ width: 200 }} allowClear onChange={this.handleSelectUser.bind(this)}>
                            {users.map(user => (
                                <Option value={user.uuid}>{user.alias}</Option>
                            ))}
                        </Select>
                        }
                        {this.props.manage !== 1 && <Input disabled value={this.getUserAlias(selectUserUuid)} style={{ width: 200 }} />}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col span={4}>
                        {"用户角色："}
                    </Col>
                    <Col span={4} >
                        {this.props.manage === 1 && <Select mode="multiple" placeholder='选择用户角色' value={selectRoles} style={{ width: 200 }} onChange={this.handleUserRoleChange.bind(this)}>
                            {roles.map(role => (
                                <Option value={role.uuid}>{role.alias}</Option>
                            ))}
                        </Select>
                        }
                        {this.props.manage !== 1 && <Input disabled value={this.getRoleAlias(selectRoles)} style={{ width: 200 }} />}
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col span={4}>
                        {this.props.manage === 1 ? "到期日期 *：" : "到期日期："}
                    </Col>
                    <Col span={4} >
                        {this.props.manage === 1 && <DatePicker placeholder="选择日期" value={realExpireDate} style={{ width: 200 }} onChange={this.handleDateChange} />}
                        {this.props.manage !== 1 && <Input disabled value={expireDate} style={{ width: 200 }} />}
                    </Col>
                </Row>
            </div>
        )
    }
}

CertFileCard.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CertFileCard);
