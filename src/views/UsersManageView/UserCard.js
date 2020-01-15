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
        };
        this.fetchUser();
    }

    fetchUserCB = (data) => {
        this.setState({ userUuid: this.props.uuid, userInfo: data.payload, userInfoReady: true });
        const { resetFields } = this.props.form;
        resetFields();
    }
    fetchUser = () => {
        RestReq.asyncGet(this.fetchUserCB, '/unified-auth/account_manage/account_info', { account_uuid: this.props.uuid });
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
        // TODO 注册完后是guest角色，登录的时候报错，因为查询不了自身信息，需要在激活状态时同时赋予角色
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

    handleUserGroupChange = (value) => {
        //TODO 暂时还未实现
        RestReq.asyncPost(this.changeUserGroupCB, '/unified-auth/account_manage/change-user-group', { uuid: this.props.uuid, user_group: value });
    }

    userGroupSelect() {
        const { userInfo, userInfoReady } = this.state;
        const userStore = this.props.userStore;
        return (
            (this.props.manage === 1) && userInfoReady &&
            userStore.loginUser.uuid !== userInfo.uuid &&
            <Select value={userInfo.user_group} style={{ width: 120 }} onChange={this.handleUserGroupChange.bind(this)}>
                <Option value={99}>系统管理员</Option>
                <Option value={2}>系统审计员</Option>
                <Option value={1}>普通用户</Option>
            </Select>
        );
    }

    getUserStateInfo() {
        const { userInfo } = this.state;
        //TODO userInfo.user_group !== 99 必须是管理员角色才可以做这些操作
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
                <Card title={userInfo.name}>{/*extra={this.userGroupSelect()} */}
                    <Card
                        type="inner"
                        title='基本信息'
                        extra={this.getUserStateInfo()}
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
