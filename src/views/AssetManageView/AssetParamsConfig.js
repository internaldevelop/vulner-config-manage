import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import Draggable from '../../components/window/Draggable'
import { Modal, Row, Col, message, Icon, Button, Typography } from 'antd';
import TextField from '@material-ui/core/TextField';
import { isContainSpecialCharacter, isContainSpecialCharacterForIP } from '../../utils/ObjUtils'

import HttpRequest from '../../utils/HttpRequest'
import { actionType } from '../../global/enumeration/ActionType';
import { osType } from '../../global/enumeration/OsType';
import { errorCode } from '../../global/error';
import { eng2chn } from '../../utils/StringUtils'
import { GetAgentRootUrl } from '../../global/environment'

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

let assetNamealert = '';

@inject('assetStore')
@inject('userStore')
@observer
class AssetParamsConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            assetNameExist: false,
        }
    }

    componentWillMount() {
        if ((this.props.assetStore.assetAction === actionType.ACTION_NEW) ||
            (this.props.assetStore.assetAction === actionType.ACTION_EDIT)) {
            this.checkAssetName();
        }
    }

    handleCancel = (e) => {
        let actionCB = this.props.actioncb;
        // 调用父组件传入的回调函数，第一个参数 false 表示本组件的参数设置被取消 cancel
        actionCB(false, {});
    }

    requestAssetCB = (action) => (data) => {
        let actionCB = this.props.actioncb;
        let successInfo;

        if (action === 'new') {
            successInfo = "资产创建成功";
        } else if (action === 'update') {
            successInfo = "资产更新成功";
        } else {
            successInfo = "操作成功";
        }

        if (data.code === errorCode.ERROR_OK) {
            message.info(successInfo);
            this.props.assetStore.setParam("uuid", data.payload.asset_uuid);
            // 调用父组件传入的回调函数，第一个参数 true 表示本组件的参数设置已确认，且策略记录已在后台创建或更新
            actionCB(true, {});
        } else {
            message.error(eng2chn(data.error));
            // 后台创建策略记录失败，则用参数 false 通知父组件不更新页面
            actionCB(false, {});
        }
    }

    handleOk = (e) => {
        const { uuid, name, ip, port, user, password, os_type, os_ver } = this.props.assetStore.assetItem;
        const { userUuid } = this.props.userStore.loginUser;
        if (!this.checkData()) {
            return false;
        }
        if (this.props.assetStore.assetAction === actionType.ACTION_NEW) {
            // 向后台发送请求，创建一条新的资产记录
            HttpRequest.asyncPost(this.requestAssetCB('new'), '/assets/add',
                {
                    name, code: "TODO", create_user_uuid: userUuid, os_type, os_ver, ip, port, user, password,
                },
                false
            );
        } else if (this.props.assetStore.assetAction === actionType.ACTION_EDIT) {
            // 向后台发送请求，更新资产数据
            HttpRequest.asyncPost(this.requestAssetCB('update'), '/assets/update',
                {
                    uuid, name, code: "TODO", create_user_uuid: userUuid, os_type, os_ver, ip, port, user, password,
                },
                false
            );
        }
    }

    checkData() {
        let name = document.getElementById('host-name').value;
        let ip = document.getElementById('host-ip').value;
        let type = document.getElementById('system-type').value;
        let version = document.getElementById('system-ver').value;
        
        if (name === null || name === '') {
            message.info('资产名称不能为空，请重新输入');
            document.getElementById('host-name').value = '';
            return false;
        } else if (name.length > 20) {
            message.info('资产名称长度不能超过20，请重新输入');
            document.getElementById('host-name').value = '';
            return false;
        } else if (isContainSpecialCharacter(name)) {
            message.info('资产名称含有特殊字符，请重新输入');
            document.getElementById('host-name').value = '';
            return false;
        } else if (ip === null || ip === ' ' || ip === '') {
            message.info('资产IP不能为空，请重新输入');
            document.getElementById('host-ip').value = '';
            return false;
        } else if (ip.length > 20) {
            message.info('资产IP名称长度不能超过20，请重新输入');
            document.getElementById('host-ip').value = '';
            return false;
        } else if (isContainSpecialCharacterForIP(ip)) {
            message.info('资产IP名称含有特殊字符，请重新输入');
            document.getElementById('host-ip').value = '';
            return false;
        } else if (type === null || type === '' || type === ' ') {
            message.info('系统类型不能为空，请重新输入');
            document.getElementById('system-type').value = '';
            return false;
        } else if (version === null || version === '' || version === ' ') {
            message.info('系统版本不能为空，请重新输入');
            document.getElementById('system-ver').value = '';
            return false;
        }
        if( this.state.assetNameExist === true) {
            return false;
        }
        return true;
    }

    checkAssetIp() {
        let ip = document.getElementById('host-ip').value;
        if (ip === null || ip === ' ' || ip === '') {
            message.info('资产IP不能为空，请重新输入');
            document.getElementById('host-ip').value = '';
            return false;
        } else if (ip.length > 20) {
            message.info('资产IP名称长度不能超过20，请重新输入');
            document.getElementById('host-ip').value = '';
            return false;
        } else if (isContainSpecialCharacterForIP(ip)) {
            message.info('资产IP名称含有特殊字符，请重新输入');
            document.getElementById('host-ip').value = '';
            return false;
        }
        return true;
    }

    getOsTypeName = (type) => {
        if (parseInt(type) === osType.TYPE_WINDOWS) {
            return 'Windows系统';
        } else if (parseInt(type) === osType.TYPE_LINUX) {
            return 'Linux系统';
        }
    }

    checkAssetNameCB = (data) => {
        if (data.payload.exist !== 0) {
            assetNamealert = '资产主机名称已存在，请使用其它名称';
        } else {
            assetNamealert = '资产主机名称可用';
        }
        this.setState({ assetNameExist: data.payload.exist !== 0 });
    }

    checkAssetName = () => {
        const { name, uuid } = this.props.assetStore.assetItem;
        let params = {};
        params.asset_name = name;
        if (this.props.assetStore.assetAction === actionType.ACTION_EDIT)
            params.asset_uuid = uuid;
        HttpRequest.asyncGet(this.checkAssetNameCB, '/assets/check-unique-name', params);
    }

    handleAssetNameChange = (event) => {
        let name = event.target.value;
        if (name === null || name === '' || name === undefined) {
            assetNamealert = '资产名称不能为空，请重新输入';
            this.setState({ assetNameExist: true });
            return false;
        } else if (name.length > 20) {
            assetNamealert = '资产名称长度不能超过20，请重新输入';
            this.setState({ assetNameExist: true });
            return false;
        }

        this.props.assetStore.setParam("name", event.target.value);
        this.checkAssetName();
    }

    handleIpChange = (event) => {
        //let ip = event.target.value;
        document.getElementById('system-type').value = '';
        document.getElementById('system-ver').value = '';
    }

    getAssetInfoCB = (data) => {
        // 检查响应的payload数据是数组类型
        if (data === null || data.payload === null || data.payload.System === null) {
            message.info('资产填写错误或者资产没有连网，请确认后再输入');
            document.getElementById('host-ip').value = '';
            return;
        }
        this.props.assetStore.setParam("ip", document.getElementById('host-ip').value);
        let osType = data.payload.System["os.name"];
        if (osType.indexOf("Windows") >= 0) {
            this.props.assetStore.setParam("os_type", "1");
        } else {
            this.props.assetStore.setParam("os_type", "2");
        }
        // let osVersion = data.payload.System.os_version;
        let osVersion = data.payload.System["os.version"];
        this.props.assetStore.setParam("os_ver", osVersion);
    }

    getAssetInfo = (event) => {
        let hostIp = document.getElementById('host-ip').value;
        if (this.checkAssetIp()) {
            hostIp = GetAgentRootUrl(hostIp);
            let params = {types: "System"};
            HttpRequest.asyncGetSpecificUrl(this.getAssetInfoCB, hostIp, '/asset-info/acquire', params);
        }
    }

    render() {
        const { name, ip, port, user, password, os_type, os_ver } = this.props.assetStore.assetItem;
        const { assetNameExist } = this.state;
        const modalTitle = <Draggable title={this.props.assetStore.assetProcName} />;
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
                    <TextField required fullWidth autoFocus id="host-name" label="主机名称" defaultValue={name}
                        variant="outlined" margin="normal" onChange={this.handleAssetNameChange}
                    />
                    {assetNameExist ? <Text type="danger"><br />{assetNamealert}</Text> :
                        <Text styles={{ color: '#4caf50' }}><br />{assetNamealert}</Text>}
                    <Row>
                        <Col span={8}>
                            <TextField required id="host-ip" label="主机IP" defaultValue={ip}
                                variant="outlined" margin="normal" onChange={this.handleIpChange}
                            />
                        </Col>
                        <Col span={8} style={{ marginTop: 20 }}>
                            <Button type="primary" size="large" onClick={this.getAssetInfo.bind(this)}><Icon type="plus-circle-o" />获取资产信息</Button>
                        </Col>
                        <Col span={6} offset={2}>
                            <TextField disabled required id="host-port" label="端口" defaultValue=" " value={port}
                                variant="outlined" margin="normal"
                            />
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col span={11}>
                            <TextField disabled required fullWidth id="login-user" label="用户名" defaultValue=" " value={user}
                                variant="outlined" margin="normal" onChange={this.handleTaskParamsChange("asset_login_user")}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField disabled required fullWidth id="login-pwd" label="登录密码" defaultValue=" " value={password} type="password"
                                variant="outlined" margin="normal" onChange={this.handleTaskParamsChange("asset_login_pwd")}
                            />
                        </Col>
                    </Row> */}
                    <Row>
                        <Col span={11}>
                            <TextField disabled required fullWidth id="system-type" label="系统类型" defaultValue=" " value={this.getOsTypeName(os_type)}
                                variant="outlined" margin="normal"
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField disabled required fullWidth id="system-ver" label="系统版本" defaultValue=" " value={os_ver}
                                variant="outlined" margin="normal"
                            />
                        </Col>
                    </Row>
                </form>
            </Modal>
        );
    }
}

AssetParamsConfig.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(AssetParamsConfig);
