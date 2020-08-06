import { withStyles } from '@material-ui/core/styles';
import { Col, Modal, Row, Tabs, Tree } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from '../../components/window/Draggable';
import Typography from '../../modules/components/Typography';
import RestReq from '../../utils/RestReq';


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
    fileTreeContainer: {
        border: 1,
        borderColor: '#e8e8e8',
        borderRadius: 4,
        overflowY: 'auto',
        overflowX: 'hidden',
        height: 300,
    },
});

@inject('userStore')
@observer
class CompileParamsConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileTreeData: [],
        }
        this.getTreeData();
    }

    getTreeDataCB = (data) => {
        if (data.code !== 'ERROR_OK' && !(data.payload instanceof Array))
            return;

        this.setState({ fileTreeData: data.payload });
    }

    getTreeData = () => {
        let pack_id = this.props.compileID;
        RestReq.asyncGet(this.getTreeDataCB, '/firmware-analyze/component/async_funcs/list_make', { pack_id, tree_type: 'antd' });
    }

    handleCancel = (e) => {
        let actionCB = this.props.actioncb;
        // 调用父组件传入的回调函数，第一个参数 false 表示本组件的参数设置被取消 cancel
        actionCB(false, {});
    }

    handleOk = (e) => {
        let actionCB = this.props.actioncb;
        // 调用父组件传入的回调函数，第一个参数 false 表示本组件的参数设置被取消 cancel
        actionCB(false, {});
    }

    clickTab = (value) => {
        RestReq.asyncGet(this.getTreeDataCB, '/firmware-analyze/component/async_funcs/list_make', { arch: value, pack_id: this.props.compileID, tree_type: 'antd' });
    }

    render() {
        const modalTitle = <Draggable title='组件编译结果' />;
        const { classes } = this.props;
        const { fileTreeData } = this.state;
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
                <form style={{ width: '100%', height: 400 }}>
                    <Typography variant="subtitle1" style={{ marginTop: 5 }}>{'组件名称：' + this.props.compileName}</Typography>
                    <Row>
                        <Col>
                            <Tabs defaultActiveKey="x86" onTabClick={this.clickTab} >
                                <TabPane tab="ARM" key="arm">
                                    <div id='armTree' className={classes.fileTreeContainer}>
                                        <Tree
                                            treeData={fileTreeData}
                                        />
                                    </div>
                                </TabPane>
                                <TabPane tab="X86" key="x86">
                                    <div id='x86Tree' className={classes.fileTreeContainer}>
                                        <Tree
                                            treeData={fileTreeData}
                                        />
                                    </div>
                                </TabPane>
                                <TabPane tab="MTPS" disabled key="mtps">
                                    <div id='mtpsTree' className={classes.fileTreeContainer}>
                                        <Tree
                                            treeData={fileTreeData}
                                        />
                                    </div>
                                </TabPane>
                                <TabPane tab="PowerPC" disabled key="powerpc">
                                    <div id='powerPCTree' className={classes.fileTreeContainer}>
                                        <Tree
                                            treeData={fileTreeData}
                                        />
                                    </div>
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
