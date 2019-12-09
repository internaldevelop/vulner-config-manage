import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Button, Modal, Form, Input, Icon } from 'antd';

const SetAccountPwd = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends React.Component {
        render() {
            const { visible, onCancel, onSetPassword, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Linux系统账号密码设置"
                    okText="确定"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={onSetPassword}
                >
                    <Form layout="vertical">
                        <Form.Item label="账号">
                            {getFieldDecorator('account', {
                                rules: [
                                    { required: true, message: '请输入账号！' },
                                    { min: 4, message: '账号不能少于4个字符；', },
                                    { max: 18, message: '账号不能多于18个字符；', },
                                    { pattern: /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){3,17}$/, message: '账号只能以字母开头，可带数字、“_”、“.”；', },
                                ],
                            })(<Input allowClear
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="终端Linux系统的账号"
                            />)}
                        </Form.Item>
                        <Form.Item label="密码">
                            {getFieldDecorator('password', {
                                rules: [
                                    { required: true, message: '请输入密码！' },
                                    { min: 8, message: '密码不能少于8个字符；', },
                                    { max: 20, message: '密码不能多于20个字符；', },
                                    {
                                        pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&amp;*()_+`\-={}:";'&lt;&gt;?,.\/]).{8,20}$/,
                                        message: '密码必须由 8-20 位字母、数字、特殊符号组成；',
                                    },
                                ],
                            })(<Input.Password allowClear
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Linux系统账号的密码"
                            />)}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    },
);

export default (SetAccountPwd);
