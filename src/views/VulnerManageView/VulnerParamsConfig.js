import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import Draggable from '../../components/window/Draggable'
import { Modal, Row, Col, message, Icon, Button, Typography } from 'antd';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
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
        minWidth: 340,
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

        if (data.code === 'ERROR_OK') {
            message.info(successInfo);
            // 调用父组件传入的回调函数，第一个参数 true 表示本组件的参数设置已确认，且记录已在后台创建或更新
            actionCB(true, {});
        } else {
            message.error(eng2chn(data.error));
            actionCB(false, {});
        }
    }

    handleOk = (e) => {
        const { vul_id, edb_id, title, serverity, type, products, discovererName, customized } = this.props.vulnerStore.vulnerItem;
        const { userUuid } = this.props.userStore.loginUser;
        if (!this.checkData()) {
            return false;
        }
        if (this.props.vulnerStore.vulnerAction === actionType.ACTION_NEW) {
            let result = { edb_id: edb_id, title, serverity, type, products, discovererName };
            RestReq.asyncPost(this.requestVulnerCB('new'), '/fw-bend-server/vuldb/add_vul', { params: JSON.stringify(result) });
        } else if (this.props.vulnerStore.vulnerAction === actionType.ACTION_EDIT) {
            let result = { id: vul_id, edb_id: edb_id, title, serverity, type, products, discovererName };//result result.toString() JSON.stringify(result);三种都不行 可能是get请求 会转义特殊字符 需要用post
            RestReq.asyncPost(this.requestVulnerCB('update'), '/fw-bend-server/vuldb/modify_vul', { params: JSON.stringify(result) });
        }
    }

    checkData() {
        let title = document.getElementById('title').value;
        let discovererName = document.getElementById('discovererName').value;
        let products = document.getElementById('products').value;
        let type = document.getElementById('type').value;

        if (title === null || title === '') {
            message.info('漏洞名称不能为空，请重新输入');
            document.getElementById('title').value = '';
            return false;
        // } else if (title.length > 20) {
        //     message.info('漏洞名称长度不能超过20，请重新输入');
        //     document.getElementById('title').value = '';
        //     return false;
        } else if (isContainSpecialCharacter(title)) {
            message.info('漏洞名称含有特殊字符，请重新输入');
            document.getElementById('title').value = '';
            return false;
        } else if (discovererName === null || discovererName === ' ' || discovererName === '') {
            message.info('厂商不能为空，请重新输入');
            document.getElementById('discovererName').value = '';
            return false;
        // } else if (discovererName.length > 20) {
        //     message.info('厂商名称长度不能超过20，请重新输入');
        //     document.getElementById('discovererName').value = '';
        //     return false;
        } else if (isContainSpecialCharacter(discovererName)) {
            message.info('厂商名称含有特殊字符，请重新输入');
            document.getElementById('discovererName').value = '';
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
        } else if (products === null || products === '' || products === ' ') {
            message.info('产品不能为空，请重新输入');
            document.getElementById('products').value = '';
            return false;
        // } else if (products.length > 20) {
        //     message.info('产品长度不能超过20，请重新输入');
        //     document.getElementById('products').value = '';
        //     return false;
        } else if (isContainSpecialCharacter(products)) {
            message.info('产品含有特殊字符，请重新输入');
            document.getElementById('products').value = '';
            return false;
        }
        return true;
    }

    handleVulnerTitleChange = (event) => {
        let title = event.target.value;
        this.props.vulnerStore.setParam("title", event.target.value);
    }

    handleProductsChange = (event) => {
        this.props.vulnerStore.setParam("products", event.target.value);
    }

    handleDiscovererNameChange = (event) => {
        this.props.vulnerStore.setParam("discovererName", event.target.value);
    }

    handleTypeChange = (event) => {
        this.props.vulnerStore.setParam("type", event.target.value);
    }

    handleEdbIDChange = (event) => {
        this.props.vulnerStore.setParam("edb_id", event.target.value);
    }

    handleServerityChange = (event) => {
        this.props.vulnerStore.setParam("serverity", event.target.value);
    }

    render() {
        const { vul_id, edb_id, title, serverity, type, products, discovererName } = this.props.vulnerStore.vulnerItem;
        const { vulnerNameExist } = this.state;
        const modalTitle = <Draggable title={this.props.vulnerStore.vulnerProcName} />;
        const { classes } = this.props;
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
                            <TextField required fullWidth id="products" label="产品类型" defaultValue={products}
                                variant="outlined" margin="normal" onChange={this.handleProductsChange}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField required fullWidth id="discovererName" label="厂商" defaultValue={discovererName}
                                variant="outlined" margin="normal" onChange={this.handleDiscovererNameChange}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={11}>
                            <TextField required fullWidth id="type" label="类型" defaultValue={type}
                                variant="outlined" margin="normal" onChange={this.handleTypeChange}
                            />
                        </Col>
                        <Col span={11} offset={2}>
                            <TextField required fullWidth id="edb_id" label="漏洞编号" defaultValue={edb_id}
                                variant="outlined" margin="normal" onChange={this.handleEdbIDChange}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={11}>
                            <FormControl variant="outlined"  margin="normal" className={classes.formControl}>
                                <InputLabel id="select-outlined-label">危害等级</InputLabel>
                                <Select
                                    value={serverity}
                                    onChange={this.handleServerityChange}
                                    label="serverity"
                                >
                                    <MenuItem value="高">高</MenuItem>
                                    <MenuItem value="中">中</MenuItem>
                                    <MenuItem value="低">低</MenuItem>
                                </Select>
                            </FormControl>
                        </Col>
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
