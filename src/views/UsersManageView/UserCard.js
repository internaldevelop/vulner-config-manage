import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { Card, Form, Select, Input, Tooltip, Icon, message, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react'

import ChangePwdDlg from '../../components/ChangePwdDlg';
import RestReq from '../../utils/RestReq';

const FormItem = Form.Item;
const Option = Select.Option;

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
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

@inject('userRoleStore')
@inject('userStore')
@observer
@Form.create()
class UserCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModifyDetails: false, // false 表示只读状态，true 表示正在修改中，可以保存和取消
            showChangePwd: false,
            userUuid: this.props.uuid,
            userInfo: {}, // 临时保存修改但未提交的用户信息，实际的用户信息保存在 this.props.user
            userInfoReady: false,
            roleIds: [],
        };
        this.fetchUser();
    }

    componentWillMount() {
        // 加载用户角色
        this.props.userRoleStore.loadAllRoles();
    }

    getRoleInfoCB = (data) => {
        if (data.code === 'ERROR_OK') {
            if (data.payload !== undefined && data.payload.roles !== undefined
                && data.payload.roles instanceof Array) {
                let payloadData = this.state.userInfo;
                payloadData.roles = data.payload.roles;
                let userInfoReady = false;
                let roleIds = [];
                if (this.state.userInfo.name !== undefined) {
                    userInfoReady = true;
                }

                for (let i = 0; i < payloadData.roles.length; i++) {
                    roleIds.push(payloadData.roles[i].role_uuid);
                }
                this.setState({ userInfo: payloadData, userInfoReady, roleIds });
            }
        }
    }

    fetchUserCB = (data) => {
        let userInfoReady = false;
        if (this.state.userInfo.roles !== undefined) {
            userInfoReady = true;
        }
        this.setState({ userUuid: this.props.uuid, userInfo: data.payload, userInfoReady });
        const { resetFields } = this.props.form;
        resetFields();
    }
    fetchUser = () => {
        RestReq.asyncGet(this.fetchUserCB, '/unified-auth/account_manage/account_info', { account_uuid: this.props.uuid });
        // 获取用户角色, TODO 接口可以考虑获取用户信息的时候把角色同时返回
        RestReq.asyncGet(this.getRoleInfoCB, '/unified-auth/account_role_map/all', { account_uuid: this.props.uuid });
    }

    cancelModifyDetails = () => {
        const { resetFields } = this.props.form;
        resetFields();
        this.setState({ isModifyDetails: !this.state.isModifyDetails });
    }

    modifyDetails = () => {
        let success = true;
        if (this.state.isModifyDetails) {
            this.props.form.validateFields((err, values) => {
                if (err !== null) {
                    success = false;
                } else {
                    let newUserData = {};
                    Object.assign(newUserData, values, { birthday: '2001/12/31', uuid: this.props.uuid });
                    RestReq.asyncPost(this.updateUserDataCB, '/unified-auth/account_manage/update', newUserData);
                }
            });
        }
        if (success)
            this.setState({ isModifyDetails: !this.state.isModifyDetails });
    }

    updateUserDataCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.fetchUser();
        } else {
            message.info(data.error);
        }
    }

    changePassword = () => {
        this.setState({ showChangePwd: true });
    }
    handleCloseChangePwd = (e) => {
        this.setState({ showChangePwd: false });
    }

    activateUserCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.fetchUser();
        } else {
            message.info(data.error);
        }
    }
    activateUser = (status) => (event) => {
        // TODO 注册完后是guest角色，登录的时候报错，因为查询不了自身信息，需要管理员分配角色
        // TODO 注册完了之后status目前是0 已经激活状态
        const userStore = this.props.userStore;
        RestReq.asyncGet(this.activateUserCB, '/unified-auth/account_manage/activate', { account_uuid: this.props.uuid });
    }

    revokeUserCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.fetchUser();
        } else {
            message.info(data.error);
        }
    }
    revokeUser = (status) => (event) => {
        RestReq.asyncDelete(this.revokeUserCB, '/unified-auth/account_manage/revoke', { account_uuid: this.props.uuid });
    }

    unlockPwdCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.fetchUser();
        } else {
            message.info(data.error);
        }
    }
    unlockPwd = (status) => (event) => {
        RestReq.asyncGet(this.unlockPwdCB, '/unified-auth/account_manage/unlock_pwd', { account_uuid: this.props.uuid });
    }

    changeUserGroupCB = (data) => {
        this.fetchUser();
    }

    handleGenderChange = currency => {
        this.triggerChange({ currency });
    };

    triggerChange = changedValue => {
        const { onChange, value } = this.props;
        if (onChange) {
            onChange({
                ...value,
                ...changedValue,
            });
        }
    };

    handleUserRoleChange = (values) => {
        // TODO 后台增加接口，修改用户的角色，统一用一个接口，传一个list
        // TODO 后台这个接口，考虑只用role_name就ok 不要在前端保留role_uuid
        RestReq.asyncPost(this.changeUserGroupCB, '/unified-auth/account_manage/change-user-group', { uuid: this.props.uuid, user_group: values });
    }

    userRoleSelect = () => {
        const { userInfo, userInfoReady, roleIds } = this.state;
        const userStore = this.props.userStore;
        let roles = this.props.userRoleStore.roleArray;
        return (
            (this.props.manage  === 1) && userInfoReady &&
            userStore.loginUser.uuid !== userInfo.uuid &&
            (roles !== undefined && roles.length > 0 ) &&
            <Select mode="multiple" value={roleIds} style={{ width: 400 }} onChange={this.handleUserRoleChange.bind(this)}>
                {roles.map(role => (
                    <Option value={role.uuid}>{role.alias}</Option>
                ))}
            </Select>
        );
    }

    getUserStateInfo = () => {
        const { userInfo } = this.state;
        if (userInfo.status === 1 && this.props.manage === 1) {
            return (
                <a onClick={this.activateUser(1).bind(this)}>激活</a>
            );
        } else if (userInfo.status === 0 && userInfo.locked === 1 && this.props.manage === 1) {
            return (
                <a onClick={this.unlockPwd(0).bind(this)}>解锁</a>
            );
        } else if (userInfo.status === 0 && this.props.manage === 1) {
            return (
                <a onClick={this.revokeUser(0).bind(this)}>回收</a>
            );
        }
    }

    render() {
        const { userInfo } = this.state;
        const { classes } = this.props;
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
            },
        };
        // const prefixSelector = getFieldDecorator('prefix', {
        //     initialValue: 86,
        // })(
        //     <Select style={{ width: 70 }}>
        //         <Option value={86}>+86</Option>
        //         {/* <Option value={87}>+87</Option> */}
        //     </Select>
        // );
        if (this.props.uuid !== this.state.userUuid) {
            // this.setState({ userUuid: this.props.uuid });
            this.fetchUser();
        }

        // The href attribute is required for an anchor to be keyboard accessible. 
        // Provide a valid, navigable address as the href value. If you cannot provide an href, 
        // but still need the element to resemble a link, use a button and change it with appropriate styles.
        return (
            <div>
                <Card title={userInfo.name} extra={this.userRoleSelect()}>
                    <Card
                        type="inner"
                        title='基本信息'
                        extra={this.getUserStateInfo}
                    >
                        <Row>
                            <Col span={6}>
                                {"账号：" + userInfo.name}
                            </Col>
                            <Col span={14}>
                                {"账号ID：" + userInfo.uuid}
                            </Col>
                            <Col span={4}>
                                {(userInfo.status === 0) && "账户已激活"}
                                {(userInfo.status === 1) && "账户未激活"}
                            </Col>
                        </Row>
                    </Card>
                    <Card
                        style={{ marginTop: 16 }}
                        type="inner"
                        title="密码"
                        extra={(userInfo.status !== 1 || this.props.manage !== 1) && <a onClick={this.changePassword.bind(this)}>修改密码</a>}
                    >
                        <div>
                            密码有效期截止到： 2021-12-31
                        </div>
                    </Card>
                    <Card
                        style={{ marginTop: 16 }}
                        type="inner"
                        title="个人资料"
                        extra={
                            <div>
                                <a onClick={this.modifyDetails.bind(this)}>{this.state.isModifyDetails ? "保存" : "修改"}</a>
                                {this.state.isModifyDetails && <a style={{ marginLeft: 10 }} onClick={this.cancelModifyDetails.bind(this)}>{"取消"}</a>}
                            </div>
                        }
                    >
                        <span>
                            <Form layout='horizontal' style={{ width: '70%', margin: '0 auto' }}>
                                {!this.state.isModifyDetails && <div className={classes.shade}></div>}
                                <div>
                                    <FormItem label='邮箱' {...formItemLayout}>
                                        {
                                            getFieldDecorator('email', {
                                                initialValue: userInfo.email,
                                                rules: [
                                                    {
                                                        type: 'email',
                                                        message: '请输入正确的邮箱地址'
                                                    },
                                                    {
                                                        required: true,
                                                        message: '请填写邮箱地址'
                                                    }
                                                ]
                                            })(
                                                <Input allowClear />
                                            )
                                        }
                                    </FormItem>
                                    <FormItem {...formItemLayout} required label={(
                                        <span>
                                            昵称&nbsp;
                                        <Tooltip title='请输入您的昵称'>
                                                <Icon type='question-circle-o' />
                                            </Tooltip>
                                        </span>
                                    )}>
                                        {
                                            getFieldDecorator('alias', {
                                                initialValue: userInfo.alias,
                                                rules: []
                                            })(
                                                <Input allowClear />
                                            )
                                        }
                                    </FormItem>
                                    <FormItem label='电话' {...formItemLayout}>
                                        {
                                            getFieldDecorator('mobile', {
                                                initialValue: userInfo.mobile,
                                                rules: [
                                                    {
                                                        len: 11,
                                                        pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                                                        required: true,
                                                        message: '请输入正确的11位手机号码'
                                                    }
                                                ]
                                            })(
                                                <Input allowClear />
                                            )
                                        }
                                    </FormItem>
                                    <FormItem label='性别' {...formItemLayout}>
                                        {
                                            getFieldDecorator('gender', {
                                                initialValue: userInfo.gender == 'F' ? '女' : '男',
                                                rules: []
                                            })(
                                                <Select
                                                    value={userInfo.gender}
                                                    input={
                                                        <OutlinedInput name="gender" id="gender" />
                                                    }
                                                    onChange={this.handleGenderChange}
                                                >
                                                    <option value="F">女</option>
                                                    <option value="M">男</option>
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                </div>
                            </Form>
                        </span>
                    </Card>
                </Card>
                {this.state.showChangePwd && <ChangePwdDlg useruuid={this.props.uuid} onclose={this.handleCloseChangePwd.bind(this)} />}
            </div>
        );
    }
}

UserCard.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(UserCard);
