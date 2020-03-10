import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import Draggable from '../../components/window/Draggable'
import { Modal, Row, Col, message, Icon, Button, Typography } from 'antd';
import TextField from '@material-ui/core/TextField';
import { isContainSpecialCharacter } from '../../utils/ObjUtils'

import HttpRequest from '../../utils/HttpRequest'
import { actionType } from '../../global/enumeration/ActionType';
import { osType } from '../../global/enumeration/OsType';
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
        //minHeight: 100,
    },
});

let vulnerNamealert = '';

@inject('vulnerStore')
@inject('userStore')
@observer
class VulnerParamsConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vulnerNameExist: false,
        }
    }

    handleCancel = (e) => {
        let actionCB = this.props.actioncb;
        // 调用父组件传入的回调函数，第一个参数 false 表示本组件的参数设置被取消 cancel
        actionCB(false, {});
    }

    requestVulnerCB = (action) => (data) => {
        let actionCB = this.props.actioncb;
        let successInfo;

        if (action === 'new') {
            successInfo = "漏洞创建成功";
        } else if (action === 'update') {
            successInfo = "漏洞更新成功";
        } else {
            successInfo = "操作成功";
        }

        if (data.code === errorCode.ERROR_OK) {
            message.info(successInfo);
            this.props.vulnerStore.setParam("edb_id", data.payload.edb_id);
            this.props.vulnerStore.setParam("date_published", data.payload.date_published);
            // 调用父组件传入的回调函数，第一个参数 true 表示本组件的参数设置已确认，且记录已在后台创建或更新
            actionCB(true, {});
        } else {
            message.error(eng2chn(data.error));
            //TODO, 测试中为了增加错误日志功能
            let title = '新建漏洞';
            let content = '新建漏洞失败，' + eng2chn(data.error);
            if (this.props.vulnerStore.vulnerAction === actionType.ACTION_EDIT) {
                title = '更新漏洞';
                content = '更新漏洞失败，' + eng2chn(data.error);
            }
            HttpRequest.asyncPost(this.addSystemLogsCB, '/system-logs/add', {
                title, content, type: 3,//SYS_ERROR = 3
            },
            false);
            // 后台创建记录失败，则用参数 false 通知父组件不更新页面
            actionCB(false, {});
        }
    }

    addSystemLogsCB = (data) => {

    }

    handleOk = (e) => {
        const { edb_id, title, author, type, platform, customized} = this.props.vulnerStore.vulnerItem;
        const { userUuid } = this.props.userStore.loginUser;
        if (!this.checkData()) {
            return false;
        }
        if (this.props.vulnerStore.vulnerAction === actionType.ACTION_NEW) {
            HttpRequest.asyncPost2(this.requestVulnerCB('new'), '/edb/add',
                {
                    title, author, type, platform, customized,
                },
                false
            );
        } else if (this.props.vulnerStore.vulnerAction === actionType.ACTION_EDIT) {
            HttpRequest.asyncPost2(this.requestVulnerCB('update'), '/edb/update',
                {
                    edb_id, title, author, type, platform, customized,
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

    handleVulnerTitleChange = (event) => {
        let title = event.target.value;
        this.props.vulnerStore.setParam("title", event.target.value);
    }

    handleAuthorChange = (event) => {
        this.props.vulnerStore.setParam("author", event.target.value);
    }

    handlePlatformChange = (event) => {
        this.props.vulnerStore.setParam("platform", event.target.value);
    }

    handleTypeChange = (event) => {
        this.props.vulnerStore.setParam("type", event.target.value);
    }

    render() {
        const { edb_id, title, author, type, platform, } = this.props.vulnerStore.vulnerItem;
        const { vulnerNameExist } = this.state;
        const modalTitle = <Draggable title={this.props.vulnerStore.vulnerProcName} />;
        return (
            <Modal
                title={modalTitle}
                style={{ top: 20, minWidth: 800 }}
                maskClosable={false}
                destroyOnClose={true}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <form>
                    <TextField required fullWidth autoFocus id="title" label="漏洞名称" defaultValue={title}
                        variant="outlined" margin="normal" onChange={this.handleVulnerTitleChange}
                    />
                    {/* { vulnerNameExist ? <Text type="danger"><br />{vulnerNamealert}</Text> :
                        <Text styles={{ color: '#4caf50' }}><br />{vulnerNamealert}</Text>} */}
                    <Row>
                        <Col span={11}>
                            <TextField required fullWidth id="author" label="发布者" defaultValue={author}
                                variant="outlined" margin="normal" onChange={this.handleAuthorChange}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField required fullWidth id="platform" label="平台" defaultValue={platform}
                                variant="outlined" margin="normal" onChange={this.handlePlatformChange}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <TextField required fullWidth id="type" label="类型" defaultValue={type}
                            variant="outlined" margin="normal" onChange={this.handleTypeChange}
                        />
                    </Row>
                </form>
            </Modal>
        );
    }
}

VulnerParamsConfig.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(VulnerParamsConfig);
