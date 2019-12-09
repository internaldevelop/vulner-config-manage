import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Modal, Form, Input, message, Typography } from 'antd'

import Draggable from '../window/Draggable'
import HttpRequest from '../../utils/HttpRequest';
import { errorCode } from '../../global/error';

const FormItem = Form.Item;
const { Text } = Typography;

const styles = theme => ({
    gridStyle: {
        width: '25%',
        textAlign: 'center',
    },
});

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};

@Form.create()
class ChangePwdDlg extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            oldPwd: '',
            newPwd: '',
            newPwd2: '',
            onClose: this.props.onclose,
            showVerifyError: false,
            verifyError: '',
        };
    }

    verifyPasswordCB = (data) => {
        if (data.code === errorCode.ERROR_OK) {
            message.info('修改密码成功');
            this.state.onClose();
        } else if (data.code === errorCode.ERROR_USER_PASSWORD_LOCKED) {
            // 密码已锁定
            this.setState({
                showVerifyError: true,
                verifyError: '密码已锁定，请联系管理员解锁密码',
            });
        } else if (data.code === errorCode.ERROR_INVALID_PASSWORD) {
            // 密码校验失败，提示剩余尝试次数
            this.setState({
                showVerifyError: true,
                verifyError: '密码错误，您还有 ' + data.payload.rat + ' 次尝试机会',
            });
        } 
    }

    handleOk = (e) => {
        let validate = false;
        let params = {};
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', err, values);
            if (err === null) {
                validate = true;
                params = {
                    uuid: this.props.useruuid,
                    old_pwd: values.oldPwd,
                    new_pwd: values.newPwd,
                };
            } 
        });
        if (!validate) {
            return;
        }
        // 调用后端修改密码接口
        HttpRequest.asyncPost(this.verifyPasswordCB, '/users/change-pwd', params, false);
    }

    handleCancel = (e) => {
        this.state.onClose();
    }

    handleOldPwdChange = (event) => {
        this.setState({ oldPwd: event.target.value });
    };

    handleNewPwdChange = (event) => {
        this.setState({ newPwd: event.target.value });
    };

    handleNewPwd2Change = (event) => {
        this.setState({ newPwd2: event.target.value });
    };

    getPasswordRules() {
        return ([{
            required: true,
            message: '请输入原密码'
        }, {
            min: 8,
            message: '密码不能少于8个字符',
        }, {
            max: 16,
            message: '密码不能多于16个字符',
        }, {
            validator: this.oldAndNewpasswordValidator
        }]);
    }

    oldAndNewpasswordValidator = (rule, value, callback) => {
        const { getFieldValue } = this.props.form;
        // if (value && value === getFieldValue('newPwd')) {
        //     callback('原密码和新密码相同，请重新输入！')
        // }

        // 必须总是返回一个 callback，否则 validateFields 无法响应
        callback();
    }

    passwordValidator = (rule, value, callback) => {
        const { getFieldValue } = this.props.form;
        if (value && value !== getFieldValue('newPwd')) {
            callback('两次输入不一致！')
        } else if (value === getFieldValue('oldPwd')) {
            callback('原密码和新密码相同，请重新输入！')
        }

        // 必须总是返回一个 callback，否则 validateFields 无法响应
        callback();
    }

    render() {
        const modalTitle = <Draggable title="修改密码" />;
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                title={modalTitle}
                visible={true}
                style={{ top: '20%' }}
                maskClosable={false}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <div>
                    <Form layout='horizontal' style={{ width: '100%', margin: '0 auto' }}>
                        <FormItem label='原密码' {...formItemLayout}>
                            {
                                getFieldDecorator('oldPwd', {
                                    rules: this.getPasswordRules(),
                                })(
                                    <Input type="password" />
                                )
                            }
                        </FormItem>
                        <FormItem label='新密码' {...formItemLayout}>
                            {
                                getFieldDecorator('newPwd', {
                                    rules: this.getPasswordRules(),
                                })(
                                    <Input type="password" />
                                )
                            }
                        </FormItem>
                        <FormItem label='确认密码' {...formItemLayout}>
                            {
                                getFieldDecorator('newPwd2', {
                                    rules: [{
                                        required: true,
                                        message: '请再次输入新密码'
                                    }, {
                                        validator: this.passwordValidator
                                    }]
                                })(
                                    <Input type="password" />
                                )
                            }
                        </FormItem>
                    </Form>
                    { 
                        this.state.showVerifyError && 
                        <Text type="danger">{this.state.verifyError}</Text>
                    }
                </div>
            </Modal>
        );
    }
}

ChangePwdDlg.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(ChangePwdDlg);