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

class FileDetailInfo extends React.Component {
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
        let extraInfo = this.props.extraInfo;
        let title = extraInfo.name;
        return (
            <Modal
                title={title + '可执行文件信息'}
                style={{ top: 30, minWidth: 400 }}
                maskClosable={false}
                destroyOnClose={true}
                visible={true}
                //okText='我知道了'
                onOk={this.handleOk.bind(this)}
            //onCancel={this.handleCancel.bind(this)}
            >
                <Row>
                    <Col span={7}>
                        {'entry_addr: '}
                    </Col>
                    <Col span={7}>
                        {/* <Input disabled value={this.props.extraInfo.entry_addr} /> */}
                        {this.props.extraInfo.entry_addr}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'heap_base: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.heap_base}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'heap_size: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.heap_size}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'mmap_base: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.mmap_base}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'stack_size: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.stack_size}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'arch_name: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.arch_name}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'bits: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.bits}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'linux_name: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.linux_name}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {'instruction_endness: '}
                    </Col>
                    <Col span={7}>
                        {this.props.extraInfo.instruction_endness}
                    </Col>
                </Row>
            </Modal>
        );
    }
}

FileDetailInfo.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(FileDetailInfo);
