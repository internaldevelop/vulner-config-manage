import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import { Col, Modal, Row, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';


const { Text } = Typography;

const styles = theme => ({

});

class DetailFWInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleOk = (e) => {
        let actionCB = this.props.actioncb;
        actionCB(false, {});
    }

    handleCancel = (e) => {
        let actionCB = this.props.actioncb;
        actionCB(false, {});
    }

    render() {
        return (
            <Modal
                title={'固件分析详情'}
                style={{ top: 30, minWidth: 800 }}
                maskClosable={false}
                destroyOnClose={true}
                visible={true}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <Row>
                    <Col span={12}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel>可执行文件数</InputLabel>
                            <Input disabled name="exeFileNum" value={this.props.selectFWItem.exeFileNum} />
                        </FormControl>
                    </Col>
                    <Col span={12}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel>系统镜像文件</InputLabel>
                            <Input disabled name="systemMirrorNum" value={this.props.selectFWItem.systemMirrorNum} />
                        </FormControl>
                    </Col>
                </Row>

                <Row>
                    <Col span={12}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel>固件分析进度</InputLabel>
                            <Input disabled name="progress" value={this.props.selectFWItem.exeFileNum} />
                        </FormControl>
                    </Col>
                    <Col span={12}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel>固件分析剩余时间</InputLabel>
                            <Input disabled name="leftTime" value={this.props.selectFWItem.systemMirrorNum} />
                        </FormControl>
                    </Col>
                </Row>
            </Modal>
        );
    }
}

DetailFWInfo.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(DetailFWInfo);
