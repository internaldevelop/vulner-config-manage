import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import Draggable from '../../components/window/Draggable'
import { Modal, Row, Col, message, Icon, Button, Typography } from 'antd';
import TextField from '@material-ui/core/TextField';
import { isContainSpecialCharacter } from '../../utils/ObjUtils'

import RestReq from '../../utils/RestReq';
import { actionType } from '../../global/enumeration/ActionType';
import { errorCode } from '../../global/error';
import { eng2chn } from '../../utils/StringUtils'

const { Text } = Typography;

const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit,
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
    },
    formControl: {
        minWidth: 200,
    },
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    searchItemStyle: {
        marginTop: 20,
    },
});


@inject('logStore')
@inject('userStore')
@observer
class LogParamsConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleCancel = (e) => {
        let actionCB = this.props.actioncb;
        // 调用父组件传入的回调函数，第一个参数 false 表示本组件的参数设置被取消 cancel
        actionCB(false, {});
    }

    requestLogCB = (action) => (data) => {
        let actionCB = this.props.actioncb;
        let successInfo;

        if (action === 'new') {
            successInfo = "日志创建成功";
        } else if (action === 'update') {
            successInfo = "日志更新成功";
        } else {
            successInfo = "操作成功";
        }

        if (data.code === errorCode.ERROR_OK) {
            message.info(successInfo);
            this.props.logStore.setParam("edb_id", data.payload.edb_id);
            this.props.logStore.setParam("date_published", data.payload.date_published);
            // 调用父组件传入的回调函数，第一个参数 true 表示本组件的参数设置已确认，且记录已在后台创建或更新
            actionCB(true, {});
        } else {
            message.error(eng2chn(data.error));
            actionCB(false, {});
        }
    }

    handleOk = (e) => {
        const { vul_id, title, author, type, platform, customized } = this.props.logStore.logItem;
        if (!this.checkData()) {
            return false;
        }
        if (this.props.logStore.logAction === actionType.ACTION_NEW) {
            RestReq.asyncGet(this.requestLogCB('new'), '/fw-bend-server/vuldb/add_vul',
                {
                    title, author, type, platform, customized,
                },
                false
            );
        } else if (this.props.logStore.logAction === actionType.ACTION_EDIT) {
            RestReq.asyncGet(this.requestLogCB('update'), '/fw-bend-server/vuldb/modify_vul',
                {
                    id: vul_id, title, author, type, platform, customized,
                },
                false
            );
        }
    }

    checkData() {
        let title = document.getElementById('title').value;
        let author = document.getElementById('author').value;
        let platform = document.getElementById('platform').value;
        let type = document.getElementById('type').value;

        if (title === null || title === '') {
            message.info('漏洞名称不能为空，请重新输入');
            document.getElementById('title').value = '';
            return false;
        } else if (title.length > 20) {
            message.info('漏洞名称长度不能超过20，请重新输入');
            document.getElementById('title').value = '';
            return false;
        } else if (isContainSpecialCharacter(title)) {
            message.info('漏洞名称含有特殊字符，请重新输入');
            document.getElementById('title').value = '';
            return false;
        } else if (author === null || author === ' ' || author === '') {
            message.info('发布者不能为空，请重新输入');
            document.getElementById('author').value = '';
            return false;
        } else if (author.length > 20) {
            message.info('发布者名称长度不能超过20，请重新输入');
            document.getElementById('author').value = '';
            return false;
        } else if (isContainSpecialCharacter(author)) {
            message.info('发布者名称含有特殊字符，请重新输入');
            document.getElementById('author').value = '';
            return false;
        } else if (type === null || type === '' || type === ' ') {
            message.info('类型不能为空，请重新输入');
            document.getElementById('type').value = '';
            return false;
        } else if (type.length > 20) {
            message.info('类型长度不能超过20，请重新输入');
            document.getElementById('type').value = '';
            return false;
        } else if (isContainSpecialCharacter(type)) {
            message.info('类型含有特殊字符，请重新输入');
            document.getElementById('type').value = '';
            return false;
        } else if (platform === null || platform === '' || platform === ' ') {
            message.info('平台不能为空，请重新输入');
            document.getElementById('platform').value = '';
            return false;
        } else if (platform.length > 20) {
            message.info('平台名称长度不能超过20，请重新输入');
            document.getElementById('platform').value = '';
            return false;
        } else if (isContainSpecialCharacter(platform)) {
            message.info('平台名称含有特殊字符，请重新输入');
            document.getElementById('platform').value = '';
            return false;
        }
        return true;
    }

    handleLogTitleChange = (event) => {
        let title = event.target.value;
        this.props.logStore.setParam("title", event.target.value);
    }

    handleAccountNameChange = (event) => {
        this.props.logStore.setParam("account_name", event.target.value);
    }

    handleContentsChange = (event) => {
        this.props.logStore.setParam("contents", event.target.value);
    }

    handleLevelChange = (event) => {
        this.props.logStore.setParam("level", event.target.value);
    }

    render() {
        const { title, account_name, level, contents, } = this.props.logStore.logItem;
        const modalTitle = <Draggable title={this.props.logStore.logProcName} />;
        return (
            <Modal
                title={modalTitle}
                style={{ top: 20, minWidth: 800 }}
                maskClosable={false}
                destroyOnClose={true}
                visible={true}
                onOk={this.handleOk.bind(this)}
                onCancel={this.handleCancel.bind(this)}
            >
                <form>
                    <TextField required fullWidth autoFocus id="title" label="日志名称" defaultValue={title}
                        variant="outlined" margin="normal" onChange={this.handleLogTitleChange.bind(this)}
                    />
                    <Row>
                        <Col span={11}>
                            <TextField required fullWidth id="level" label="类型" defaultValue={level}
                                variant="outlined" margin="normal" onChange={this.handleLevelChange.bind(this)}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField required fullWidth id="account_name" label="用户账户" defaultValue={account_name}
                                variant="outlined" margin="normal" onChange={this.handleAccountNameChange.bind(this)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <TextField required fullWidth id="contents" label="日志内容" defaultValue={contents}
                            variant="outlined" margin="normal" onChange={this.handleContentsChange.bind(this)}
                        />
                    </Row>
                </form>
            </Modal>
        );
    }
}

LogParamsConfig.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(LogParamsConfig);
