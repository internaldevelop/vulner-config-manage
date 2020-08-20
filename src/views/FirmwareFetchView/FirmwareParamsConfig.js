import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Col, message, Modal, Row, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from '../../components/window/Draggable';
import { actionType } from '../../global/enumeration/ActionType';
import { errorCode } from '../../global/error';
import { isContainSpecialCharacter } from '../../utils/ObjUtils';
import { eng2chn } from '../../utils/StringUtils';
import RestReq from '../../utils/RestReq';

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

    requestCB = (action) => (data) => {
        let actionCB = this.props.actioncb;
        let successInfo;

        if (action === 'new') {
            successInfo = "固件创建成功";
        } else if (action === 'update') {
            successInfo = "固件更新成功";
        } else {
            successInfo = "操作成功";
        }

        if (data.code === 'ERROR_OK') {
            message.info(successInfo);
            //this.props.firmwareStore.setParam("uuid", data.payload.firmware_uuid);
            // 调用父组件传入的回调函数，第一个参数 true 表示本组件的参数设置已确认，且策略记录已在后台创建或更新
            actionCB(true, {});
        } else {
            message.error(eng2chn(data.error));
            // 后台创建失败，则用参数 false 通知父组件不更新页面
            actionCB(false, {});
        }
    }

    handleOk = (e) => {
        const { pack_id, name, manufacturer, model } = this.props.firmwareStore.firmwareItem;
        // if (!this.checkData()) {
        //     return false;
        // }
        if (this.props.firmwareStore.firmwareAction === actionType.ACTION_NEW) {
            // 向后台发送请求，创建一条新的固件记录
        } else if (this.props.firmwareStore.firmwareAction === actionType.ACTION_EDIT) {
            RestReq.asyncPost(this.requestCB('update'), '/firmware-analyze/fw_analyze/pack/edit',
                { name, manufacturer, model, pack_id });
        }
    }

    checkData() {
        let fw_file_name = document.getElementById('name').value;

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
        this.props.firmwareStore.setParam("name", event.target.value);
    }

    handleManufacturerChange = (event) => {
        this.props.firmwareStore.setParam("manufacturer", event.target.value);
    }

    handleVersionChange = (event) => {
        this.props.firmwareStore.setParam("version", event.target.value);
    }

    handleModelChange = (event) => {
        this.props.firmwareStore.setParam("model", event.target.value);
    }

    render() {
        const { name, manufacturer, model, version } = this.props.firmwareStore.firmwareItem;
        const modalTitle = <Draggable title={this.props.firmwareStore.firmwareProcName} />;
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
                    <Row>
                        <Col span={11}>
                            <TextField required fullWidth autoFocus id="name" label="固件名称" defaultValue={name}
                                variant="outlined" margin="normal" onChange={this.handleFirmwareNameChange.bind(this)}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField fullWidth id="version" label="版本" defaultValue={version}
                                variant="outlined" margin="normal" onChange={this.handleVersionChange.bind(this)}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={11}>
                            <TextField fullWidth id="manufacturer" label="厂商" defaultValue={manufacturer}
                                variant="outlined" margin="normal" onChange={this.handleManufacturerChange.bind(this)}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField fullWidth id="model" label="设备类型" defaultValue={model}
                                variant="outlined" margin="normal" onChange={this.handleModelChange.bind(this)}
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
