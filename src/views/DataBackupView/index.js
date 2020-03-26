import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Modal, message, Skeleton, Select, Card, Row, Col, Switch, Form } from 'antd'
import HttpRequest from '../../utils/HttpRequest';
import { userType } from '../../global/enumeration/UserType';
import { errorCode } from '../../global/error';
import { eng2chn } from '../../utils/StringUtils'

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

@inject('userStore')
@observer
class DataBackupView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModifyDetails: false, // false 表示只读状态，true 表示正在修改中，可以保存
            users: [],
            mailToManagerAddress: '',
            mailToManagerUuid: '',
            mailToManagerOnOff: '',
            mailToUserOnOff: '',
            existManagerMail: false,
            existUserOnOff: false,
        }
        this.getSystemConfig();
    }

    getSystemConfigCB = (data) => {
        // 检查响应的payload数据是数组类型
        if (!(data.payload instanceof Array))
            return;

        let mailToManagerAddress = '';
        let mailToManagerUuid = '';
        let existManagerMail = false;
        let existUserOnOff = false;
        let mailToManagerOnOff = 'off';
        let mailToUserOnOff = 'off';
        for (let config of data.payload) {
            let name = config.name;
            if (name !== '') {
                if (name === 'mail-to-manager-address') {
                    existManagerMail = true;
                    mailToManagerAddress = config.value;
                } else if (name === 'mail-to-manager-on-off') {
                    existManagerMail = true;
                    mailToManagerOnOff = config.value;
                } else if (name === 'mail-to-manager-uuid') {
                    existManagerMail = true;
                    mailToManagerUuid = config.value;
                } else if (name === 'mail-to-user-on-off') {
                    existUserOnOff = true;
                    mailToUserOnOff = config.value;
                }
            }
        }
        this.setState({ existUserOnOff, existManagerMail, mailToManagerAddress, mailToManagerUuid, mailToManagerOnOff, mailToUserOnOff, });
        this.getUsers();
    }

    getSystemConfig() {
        HttpRequest.asyncGet(this.getSystemConfigCB, '/system-config/all');
    }

    getUsersCB = (data) => {
        let users = [];
        let mailToManagerAddress = this.state.mailToManagerAddress;
        let mailToManagerUuid = this.state.mailToManagerUuid;
        // 检查响应的payload数据是数组类型
        if (!(data.payload instanceof Array))
            return;

        for (let user of data.payload) {
            if (user.email !== null && user.email !== '' && user.user_group === userType.TYPE_ADMINISTRATOR) {
                if (mailToManagerUuid === '') {
                    mailToManagerAddress = user.email;
                    mailToManagerUuid = user.uuid;
                } else if (mailToManagerUuid === user.uuid) {
                    mailToManagerAddress = user.email;
                }
                users.push(user);
            }
        }
        this.setState({ users, mailToManagerAddress, mailToManagerUuid });
    }

    getUsers() {
        HttpRequest.asyncGet(this.getUsersCB, '/users/all');
    }

    handleSelectManager = (value) => {
        const { users } = this.state;
        for (let user of users) {
            if (user.uuid === value) {
                this.setState({ mailToManagerAddress: user.email, mailToManagerUuid: value });
                break;
            }
        }
    }

    getDefaultMailManagerChecked = () => {
        const mailToManagerOnOff = this.state.mailToManagerOnOff;
        if (mailToManagerOnOff !== '' && mailToManagerOnOff === 'on') {
            return true;
        }
        return false;
    }

    handleMailManagerSwitchConfig = (checked, event) => {
        let mailToManagerOnOff = checked ? 'on' : 'off';
        this.setState({ mailToManagerOnOff });
    }

    getDefaultMailUserChecked = () => {
        const mailToUserOnOff = this.state.mailToUserOnOff;
        if (mailToUserOnOff !== '' && mailToUserOnOff === 'on') {
            return true;
        }
        return false;
    }

    handleMaileUserSwitchConfig = (checked, event) => {
        let mailToUserOnOff = checked ? 'on' : 'off';
        this.setState({ mailToUserOnOff });
    }

    requestSystemConfigCB = (action) => (data) => {
        let successInfo;
        if (data.code === errorCode.ERROR_OK) {
            if (action === 'new') {
                successInfo = "系统配置添加成功";
                message.info(successInfo);
            } else if (action === 'update') {
                successInfo = "系统配置更新成功";
                message.info(successInfo);
            }
        } else {
            Modal.error({
                title: '数据更新失败',
                content: eng2chn(data.error),
            });
        }
    }

    modifyDetails = () => {
        const { existUserOnOff, existManagerMail, mailToManagerAddress, mailToManagerUuid, mailToManagerOnOff, mailToUserOnOff } = this.state;
        if (this.state.isModifyDetails) {
            if (existManagerMail) {
                HttpRequest.asyncPost(this.requestSystemConfigCB(''), '/system-config/update', { name: 'mail-to-manager-on-off', value: mailToManagerOnOff, });
                HttpRequest.asyncPost(this.requestSystemConfigCB(''), '/system-config/update', { name: 'mail-to-manager-address', value: mailToManagerAddress });
                HttpRequest.asyncPost(this.requestSystemConfigCB('update'), '/system-config/update', { name: 'mail-to-manager-uuid', value: mailToManagerUuid });
            } else {
                existManagerMail = true;
                HttpRequest.asyncPost(this.requestSystemConfigCB(''), '/system-config/add', { name: 'mail-to-manager-on-off', value: mailToManagerOnOff, });         
                HttpRequest.asyncPost(this.requestSystemConfigCB(''), '/system-config/add', { name: 'mail-to-manager-address', value: mailToManagerAddress });
                HttpRequest.asyncPost(this.requestSystemConfigCB('new'), '/system-config/add', { name: 'mail-to-manager-uuid', value: mailToManagerUuid });
            }

            if (existUserOnOff) {
                HttpRequest.asyncPost(this.requestSystemConfigCB(''), '/system-config/update', { name: 'mail-to-user-on-off', value: mailToUserOnOff, });
            } else {
                existUserOnOff = true;
                HttpRequest.asyncPost(this.requestSystemConfigCB(''), '/system-config/add', { name: 'mail-to-user-on-off', value: mailToUserOnOff, });
            }
        }
        this.setState({ isModifyDetails: !this.state.isModifyDetails });
    }

    render() {
        const { classes } = this.props;
        const { users, mailToManagerAddress, mailToManagerUuid, } = this.state;
        const userStore = this.props.userStore;
        let defaultMailManagerChecked = this.getDefaultMailManagerChecked();
        let defaultMailUserChecked = this.getDefaultMailUserChecked();
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Row>
                        <Col span={16} offset={4}>
                            <Card title="系统告警配置" extra={
                                <div>
                                    <a onClick={this.modifyDetails.bind(this)}>{this.state.isModifyDetails ? "保存" : "修改"}</a>
                                </div>
                            }>
                                {!this.state.isModifyDetails && <div className={classes.shade}></div>}
                                <div>
                                <Card
                                    style={{ marginTop: 16 }}
                                    type="inner"
                                    title="登录时密码尝试三次以上则锁定账户，系统自动发邮件通知管理员解锁"
                                >
                                    <Row>
                                        <Col span={4}>
                                            {"是否自动发送邮件："}
                                        </Col>
                                        <Col span={4}>
                                            <Switch checkedChildren="开" unCheckedChildren="关" onChange={this.handleMailManagerSwitchConfig} checked={defaultMailManagerChecked} />
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col span={4}>
                                            {"请选择管理员："}
                                        </Col>
                                        <Col span={4} >
                                            <Select style={{ width: 200 }} disabled={!defaultMailManagerChecked} value={mailToManagerUuid} onChange={this.handleSelectManager}>
                                                {users.map(user => (
                                                    <Option value={user.uuid}>{user.account}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                </Card>
                                <Card
                                    style={{ marginTop: 16 }}
                                    type="inner"
                                    title="当系统发现漏洞，系统自动发送邮件通知用户"
                                >
                                    <Row>
                                        <Col span={4}>
                                            {"是否自动发送邮件："}
                                        </Col>
                                        <Col span={4}>
                                            <Switch checkedChildren="开" unCheckedChildren="关" onChange={this.handleMaileUserSwitchConfig} checked={defaultMailUserChecked} />
                                        </Col>
                                    </Row>
                                </Card>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        )

    }
}

DataBackupView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(DataBackupView);