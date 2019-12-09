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
        this.fetchUser();
    }

    fetchUserCB = (data) => {
        this.setState({ userUuid: this.props.uuid, userInfo: data.payload, userInfoReady: true });
        const { resetFields } = this.props.form;
        resetFields();
    }
    fetchUser = () => {
        HttpRequest.asyncGet(this.fetchUserCB.bind(this), '/users/user-by-uuid', {uuid: this.props.uuid} );
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
                    const { userInfo } = this.state;
                    let newUserData = {};
                    Object.assign(newUserData, userInfo, values);
                    HttpRequest.asyncPost(this.updateUserDataCB, '/users/update', newUserData);
                }
            });
        }
        if (success)
            this.setState({ isModifyDetails: !this.state.isModifyDetails });
    }

    updateUserDataCB = (data) => {
        this.fetchUser();
    }

    changePassword = () => {
        this.setState({ showChangePwd: true });
    }
    handleCloseChangePwd = (e) => {
        this.setState({ showChangePwd: false });
    }

    activateUserCB = (data) => {
        this.fetchUser();
    }
    activateUser = (status) => (event) => {
        HttpRequest.asyncPost(this.activateUserCB, '/users/activate', { uuid: this.props.uuid, status: status });
    }

    changeUserGroupCB = (data) => {
        this.fetchUser();
    }

    handleUserGroupChange = (value) => {
        HttpRequest.asyncPost(this.changeUserGroupCB, '/users/change-user-group', { uuid: this.props.uuid, user_group: value });
    }

    userGroupSelect() {
        const { userInfo, userInfoReady } = this.state;
        const userStore = this.props.userStore;
        return (
            (this.props.manage === 1) && userInfoReady && 
            userStore.loginUser.userUuid !== userInfo.uuid && 
            <Select value={userInfo.user_group} style={{ width: 120 }} onChange={this.handleUserGroupChange.bind(this)}>
                <Option value={99}>系统管理员</Option>
                <Option value={2}>系统审计员</Option>
                <Option value={1}>普通用户</Option>
            </Select>
        );
    }

    getUserStateInfo() {
        const { userInfo } = this.state;
        if (userInfo.status === 0 && this.props.manage === 1) {
            return (
                <a onClick={this.activateUser(1).bind(this)}>激活</a>
            );
        } else if (userInfo.status === 1 && userInfo.user_group !== 99 && this.props.manage === 1) {
            return (
                <a onClick={this.activateUser(0).bind(this)}>回收</a>
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
        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: 86,
        })(
            <Select style={{ width: 70 }}>
                <Option value={86}>+86</Option>
                {/* <Option value={87}>+87</Option> */}
            </Select>
        );
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
                                {"账号：" + userInfo.account}
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
                            { "密码有效期截止到：   " + userInfo.expire_time }
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
                                            getFieldDecorator('name', {
                                                initialValue: userInfo.name,
                                                rules: []
                                            })(
                                                <Input allowClear />
                                            )
                                        }
                                    </FormItem>
                                    <FormItem label='电话' {...formItemLayout}>
                                        {
                                            getFieldDecorator('phone', {
                                                initialValue: userInfo.phone,
                                                rules: [
                                                    {
                                                        len: 11,
                                                        pattern: /^[1][3,4,5,7,8][0-9]{9}$/,
                                                        required: true,
                                                        message: '请输入正确的11位手机号码'
                                                    }
                                                ]
                                            })(
                                                <Input addonBefore={prefixSelector} allowClear />
                                            )
                                        }
                                    </FormItem>
                                    <FormItem label='居住地' {...formItemLayout}>
                                        {
                                            getFieldDecorator('address', {
                                                initialValue: userInfo.address,
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
