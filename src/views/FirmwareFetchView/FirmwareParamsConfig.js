import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import Draggable from '../../components/window/Draggable'
import { Modal, Row, Col, message, Icon, Button, Typography } from 'antd';
import TextField from '@material-ui/core/TextField';
import { isContainSpecialCharacter } from '../../utils/ObjUtils'

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
        //minHeight: 100,
    },
});

let firmwareAlert = '';

@inject('firmwareStore')
@inject('userStore')
@observer
class FirmwareParamsConfig extends React.Component {
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

    requestAssetCB = (action) => (data) => {
        let actionCB = this.props.actioncb;
        let successInfo;

        if (action === 'new') {
            successInfo = "固件创建成功";
        } else if (action === 'update') {
            successInfo = "固件更新成功";
        } else {
            successInfo = "操作成功";
        }

        if (data.code === errorCode.ERROR_OK) {
            message.info(successInfo);
            this.props.firmwareStore.setParam("uuid", data.payload.firmware_uuid);
            // 调用父组件传入的回调函数，第一个参数 true 表示本组件的参数设置已确认，且策略记录已在后台创建或更新
            actionCB(true, {});
        } else {
            message.error(eng2chn(data.error));
            // 后台创建失败，则用参数 false 通知父组件不更新页面
            actionCB(false, {});
        }
    }

    handleOk = (e) => {
        const { uuid, firmware_id, fw_file_name, fw_manufacturer, application_mode } = this.props.firmwareStore.firmwareItem;
        const { userUuid } = this.props.userStore.loginUser;
        if (!this.checkData()) {
            return false;
        }
        if (this.props.firmwareStore.firmwareAction === actionType.ACTION_NEW) {
            // 向后台发送请求，创建一条新的固件记录
        } else if (this.props.firmwareStore.firmwareAction === actionType.ACTION_EDIT) {
            // 向后台发送请求，更新固件数据
            // TODO, 这里需要请求更新固件接口
        }
    }

    checkData() {
        let fw_file_name = document.getElementById('fw_file_name').value;
        
        if (fw_file_name === null || fw_file_name === '') {
            message.info('固件名称不能为空，请重新输入');
            document.getElementById('fw_file_name').value = '';
            return false;
        } else if (fw_file_name.length > 20) {
            message.info('固件名称长度不能超过20，请重新输入');
            document.getElementById('fw_file_name').value = '';
            return false;
        } else if (isContainSpecialCharacter(fw_file_name)) {
            message.info('固件名称含有特殊字符，请重新输入');
            document.getElementById('fw_file_name').value = '';
            return false;
        }
        return true;
    }

    handleFirmwareNameChange = (event) => {
        let name = event.target.value;
        if (name === null || name === '' || name === undefined) {
            firmwareAlert = '固件名称不能为空，请重新输入';
            return false;
        } else if (name.length > 20) {
            firmwareAlert = '资产名称长度不能超过20，请重新输入';
            return false;
        }
        this.props.firmwareStore.setParam("fw_file_name", event.target.value);
    }

    handleFWManufacturerChange = (event) => {
        this.props.firmwareStore.setParam("fw_manufacturer", event.target.value);
    }

    handleApplicationModeChange = (event) => {
        this.props.firmwareStore.setParam("application_mode", event.target.value);
    }

    render() {
        const { uuid, firmware_id, fw_file_name, fw_manufacturer, application_mode } = this.props.firmwareStore.firmwareItem;
        const modalTitle = <Draggable title={this.props.firmwareStore.firmwareProcName} />;
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
                    <TextField required fullWidth autoFocus id="fw_file_name" label="固件名称" defaultValue={fw_file_name}
                        variant="outlined" margin="normal" onChange={this.handleFirmwareNameChange}
                    />
                    <Text type="danger"><br />{firmwareAlert}</Text> :
                        <Text styles={{ color: '#4caf50' }}><br />{firmwareAlert}</Text>
                    <Row>
                        <Col span={12}>
                            <TextField required id="fw_manufacturer" label="厂商" defaultValue={fw_manufacturer}
                                variant="outlined" margin="normal" onChange={this.handleIpChange}
                            />
                        </Col>
                        <Col span={12}>
                            <TextField required id="application_mode" label="设备类型" defaultValue={application_mode}
                                variant="outlined" margin="normal" onChange={this.handleIpChange}
                            />
                        </Col>
                    </Row>
                </form>
            </Modal>
        );
    }
}

FirmwareParamsConfig.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(FirmwareParamsConfig);
