import { withStyles } from '@material-ui/core/styles';
import { Col, message, Modal, Row, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from '../../components/window/Draggable';
import { errorCode } from '../../global/error';
import Typography from '../../modules/components/Typography';
import { eng2chn } from '../../utils/StringUtils';


const { TabPane } = Tabs;
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

@inject('userStore')
@observer
class CompileParamsConfig extends React.Component {
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
    }

    render() {
        const modalTitle = <Draggable title='组件编译结果' />;
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
                <form style={{ width: '100%', height: 400 }}>
                <Typography variant="subtitle1" style={{ marginTop: 5 }}>组件名称：</Typography>
                    <Row>
                        {/* <Col span={4}>
                            <Typography variant="subtitle1" style={{ marginTop: 5 }}>组件名称</Typography>
                        </Col> */}
                        <Col>
                            <Tabs defaultActiveKey="ARM">
                                <TabPane tab="ARM" key="ARM">
                                    ARM编译结果
                                </TabPane>
                                <TabPane tab="X86" disabled key="X86">
                                    X86
                                </TabPane>
                                <TabPane tab="MTPS" key="MTPS">
                                    MTPS编译结果
                                </TabPane>
                                <TabPane tab="PowerPC" disabled key="PowerPC">
                                    PowerPC
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </form>
            </Modal>
        );
    }
}

CompileParamsConfig.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CompileParamsConfig);
