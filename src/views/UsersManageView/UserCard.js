import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Card, Form, Select, Input, Tooltip, Icon, message, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react'

import ChangePwdDlg from '../../components/ChangePwdDlg';
import HttpRequest from '../../utils/HttpRequest';
import { errorCode } from '../../global/error';

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
        //TODO 现在用的是全部用户取出来，查找对应的用户，后续需要提供根据uuid查询用户接口
        //原本打算把全部用户保存起来，然后修改某个用户后需要更新父页面重新查询用户或者更新全用用户list
        this.fetchUser();
    }

    getUsersCB = (data) => {
        if (data.code === 'ERROR_OK') {
            for (let i = 0; i < data.payload.length; i++) {
                if (this.props.uuid === data.payload[i].uuid) {
                    this.setState({ userUuid: this.props.uuid, userInfo: data.payload[i], userInfoReady: true });
                    const { resetFields } = this.props.form;
                    resetFields();
                    break;
                }
            }
        }
    }

    getUsers() {
        const userStore = this.props.userStore;
        HttpRequest.asyncGet(this.getUsersCB, '/unified-auth/account_manage/all', { access_token: userStore.loginUser.access_token });
    }

    fetchUserCB = (data) => {
        this.setState({ userUuid: this.props.uuid, userInfo: data.payload, userInfoReady: true });
        const { resetFields } = this.props.form;
        resetFields();
    }
    fetchUser = () => {
        // TODO 等待开放此接口
        //HttpRequest.asyncGet(this.fetchUserCB.bind(this), '/users/user-by-uuid', {uuid: this.props.uuid} );
        this.getUsers();
    }

    cancelModifyDetails = () => {
        const { resetFields } = this.props.form;
        resetFields();
        this.setState({ isModifyDetails: !this.state.isModifyDetails });
    }

    modifyDetails = () => {
        let success = true;
        const userStore = this.props.userStore;
        if (this.state.isModifyDetails) {
            this.props.form.validateFields((err, values) => {
                if (err !== null) {
                    success = false;
                } else {
                    let newUserData = { access_token: userStore.loginUser.access_token };
                    if (values.gender === '男') {
                        values.gender = 'M';
                    } else {
                        values.gender = 'F';
                    }
                    Object.assign(newUserData, values, { birthday: '2001/12/31', uuid: this.props.uuid });
                    HttpRequest.asyncPost(this.updateUserDataCB, '/unified-auth/account_manage/update', newUserData);
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
        HttpRequest.asyncGet(this.activateUserCB, '/unified-auth/account_manage/activate', { account_uuid: this.props.uuid, access_token: userStore.loginUser.access_token });
    }

    revokeUserCB = (data) => {
        if (data.code === 'ERROR_OK') {
            this.fetchUser();
        } else {
            message.info(data.error);
        }
    }
    revokeUser = (status) => (event) => {
        const userStore = this.props.userStore;
        HttpRequest.asyncDelete(this.revokeUserCB, '/unified-auth/account_manage/revoke', { account_uuid: this.props.uuid, access_token: userStore.loginUser.access_token });
    }

    changeUserGroupCB = (data) => {
        this.fetchUser();
    }

    handleUserGroupChange = (value) => {
        //TODO 暂时还未实现
        HttpRequest.asyncPost(this.changeUserGroupCB, '/unified-auth/account_manage/change-user-group', { uuid: this.props.uuid, user_group: value });
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
        if (userInfo.status === 1 && this.props.manage === 1) {
            return (
                <a onClick={this.activateUser(1).bind(this)}>激活</a>
            );
        } else if (userInfo.locked === 1 && userInfo.user_group !== 99 && this.props.manage === 1) {
            return (
                <a onClick={this.revokeUser(0).bind(this)}>回收</a>//可以在这里实现解锁功能
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
                <Card title={userInfo.name} extra={this.userGroupSelect()}>
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
                                {(userInfo.status === 0) && "账户未激活"}
                                {(userInfo.status === 1) && "账户已激活"}
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
                                                <Input allowClear />
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
