import { NavLink as Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import { message, Icon, List, Drawer, Card, Col, Row, Skeleton, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { DeepClone } from '../../utils/ObjUtils';
import { GetMainViewHeight } from '../../utils/PageUtils';
import RestReq from '../../utils/RestReq';
import { columns as Column } from './Column';
import MAntdCard from '../../rlib/props/MAntdCard';
import DetailFWInfo from './DetailFWInfo';
import MStatCardNoIcon from '../../rlib/antdComponents/MStatCardNoIcon';

const DEFAULT_PAGE_SIZE = 10;
const styles = theme => ({
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    formControl: {
        margin: 0,
        marginLeft: 10,
    },
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
    packGutterBox: {
        padding: 8,
        //background: '#F0FFFF',
    },
    nameGutterBox: {
        padding: 8,
        //background: '#00695C',
        //background: '#880e4f',
        //background: '#5F9EA0',
        background: '#008c9e',
        height: 40,
        color: '#FFFFFF',
    },
    fileGutterBox: {
        padding: 8,
        //height: 100,
        //background: '#E6E6E6',
        background: '#DDEBFF',
        //color: '#DC143C',
    }
});

@inject('userStore')
@observer
class FirmwarePackageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            //columns: Column,
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 400,      // 表格的 scrollHeight
            packageList: [],
            packTotal: 0,
            exeFileTotal: 0,
            mirrorFileTotal: 0,
            fileMirrorTotal: 0,
            systemMirrorTotal: 0,
            taskManageVisible: false,
            detailFWInfoPreview: false,
            selectFWItem: null,
            unDoneTasks: [],
            doneTasks: [],
            stats: this.initPackageStats(),
        }
        this.getAllPackages();
    }

    getAllTasksCB = (data) => {
        let doneTasks = [];
        let unDoneTasks = [];
        if (data.code !== 'ERROR_OK' || !(data.payload instanceof Array))
            return;

        for (let item of data.payload) {
            if (item.percentage === 100) {
                doneTasks.push(item);
            } else {
                unDoneTasks.push(item);
            }
        }
        this.setState({ unDoneTasks, doneTasks, taskManageVisible: true, });
    }

    initPackageStats() {
        let stats = [];
        stats.push({ name: 'packTotal', title: '固件包总数', value: 0, icon: 'database', bgColor: '#DEF2DD', fgColor: 'black' });
        stats.push({ name: 'mirrorFileTotal', title: '镜像文件数', value: 0, icon: 'like', bgColor: '#F3E6FA', fgColor: 'black' });
        stats.push({ name: 'exeFileTotal', title: '可执行文件数', value: 0, icon: 'dislike', bgColor: '#FFF2CC', fgColor: 'red' });
        stats.push({ name: 'fileMirrorTotal', title: '文件系统镜像数', value: 0, icon: 'eye', bgColor: '#DDEBFF', fgColor: 'green' });
        stats.push({ name: 'systemMirrorTotal', title: '系统镜像数', value: 0, icon: 'check-circle', bgColor: '#DEF2DD', fgColor: 'green' });
        stats.push({ name: 'packageProcessed', title: '任务执行情况', value: '待定', icon: 'close-circle', bgColor: '#FFF2CC', fgColor: 'red' });
        return stats;
    }

    getAllTasks = () => {
        RestReq.asyncGet(this.getAllTasksCB, '/firmware-analyze/fw_analyze/task/query_all');
    }

    getAllPackages = () => {
        RestReq.asyncGet(this.getAllPackagesCB, '/firmware-analyze/fw_analyze/pack/all');
    }

    getAllPackagesCB = (data) => {
        let packages = [];
        // 检查响应的payload数据是数组类型
        if (data.code !== 'ERROR_OK' || !(data.payload instanceof Array))
            return;

        let packTotal = 0;
        let exeFileTotal = 0;
        let mirrorFileTotal = 0;
        let systemMirrorTotal = 0;
        let fileMirrorTotal = 0;
        packages = data.payload.map((pack, index) => {
            let packItem = DeepClone(pack);
            packItem.index = index + 1;
            packItem.key = index + 1;
            packTotal++;
            let systemMirrorNum = 0;
            let fileMirrorNum = 0;
            let exeFileNum = 0;
            if (pack.unpack_files !== undefined) {
                if (pack.unpack_files["2"] !== undefined) {
                    systemMirrorNum += pack.unpack_files["2"].count;
                    mirrorFileTotal += systemMirrorNum;
                    systemMirrorTotal += systemMirrorNum;
                }
                if (pack.unpack_files["3"] !== undefined) {
                    fileMirrorNum += pack.unpack_files["3"].count;
                    mirrorFileTotal += fileMirrorNum;
                    fileMirrorTotal += fileMirrorNum;
                }
                if (pack.unpack_files["4"] !== undefined) {
                    exeFileNum += pack.unpack_files["4"].count;
                    exeFileTotal += exeFileNum;
                }
            }
            packItem.systemMirrorNum = systemMirrorNum;
            packItem.fileMirrorNum = fileMirrorNum;
            packItem.exeFileNum = exeFileNum;
            return packItem;
        })
        const { stats } = this.state;
        stats[0].value = packTotal;
        stats[1].value = mirrorFileTotal;
        stats[2].value = exeFileTotal;
        stats[3].value = fileMirrorTotal;
        stats[4].value = systemMirrorTotal;
        stats[5].value = '待定';
        this.setState({ stats, packageList: packages, packTotal, exeFileTotal, mirrorFileTotal, fileMirrorTotal, systemMirrorTotal });
    }

    componentDidMount() {
        // 增加监听器，侦测浏览器窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    handleResize = e => {
        console.log('浏览器窗口大小改变事件', e.target.innerWidth, e.target.innerHeight);
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    componentWillUnmount() {
        // 组件卸装前，一定要移除监听器
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    showDownloadFWDrawer = () => {
        this.getAllTasks();
    };

    onCloseDrawer = () => {
        this.setState({
            taskManageVisible: false,
        });
    };

    getExtra() {
        return (
            <a style={{ color: '#FF4500' }} onClick={this.showDownloadFWDrawer.bind(this)}>任务进度列表</a>
        );
    }

    generateReportCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            message.info("生成报告失败！");
            return;
        } else {
            message.info("已经生成报告！");
        }
    }

    generateReport = (item) => (event) => {
        RestReq.asyncGet(this.generateReportCB, '/firmware-analyze/report/pdf/create_report', { pack_id: item.pack_id });
    };

    showDetailFWInfo = (item) => (event) => {
        this.setState({ selectFWItem: item, detailFWInfoPreview: true });
    };

    handleCloseDetailFWInfo = () => {
        this.setState({ detailFWInfoPreview: false });
    }

    render() {
        const { doneTasks, unDoneTasks, packTotal, mirrorFileTotal, fileMirrorTotal, systemMirrorTotal, exeFileTotal, packageList } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        let self = this;
        const { stats } = this.state;
        let statSpan = 24 / stats.length;
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Card title={'固件包信息总览'} extra={this.getExtra()} style={{ height: '100%' }} headStyle={MAntdCard.headerStyle('default')}>
                        <Row gutter={20} style={{ marginBottom: 20 }}>
                            {stats.map((stat) => (<Col span={statSpan}>
                                <MStatCardNoIcon myparams={stat} />
                            </Col>))}
                        </Row>
                    </Card>
                    <Card title={'固件包列表'} style={{ height: '100%' }} headStyle={MAntdCard.headerStyle('default')}>
                        <Row gutter={[16, 24]}>
                            {packageList.map((item, index) => (
                                <Col span={4} className={classes.packGutterBox} >
                                    <Row className={classes.nameGutterBox}>
                                        <Col span={20}>{item.name}</Col>
                                        <Col span={4}>
                                            {/* <a onClick={this.showDetailFWInfo(item).bind(this)}>固件分析详情</a> */}
                                            {/* <Tooltip placement="top" title="固件分析详情"> */}
                                            <Tooltip placement="top" title="生成报告">
                                                {/* <a style={{ color: '#880e4f' }} onClick={this.showDetailFWInfo(item).bind(this)}><Icon type="plus-circle-o" /></a> */}
                                                <a style={{ color: 'red' }} onClick={this.generateReport(item).bind(this)}><Icon type="bell" /></a>
                                            </Tooltip>
                                        </Col>
                                    </Row>
                                    <Link to={{ pathname: '/home/firmware-analyze/function-fetch', state: { pack_id: item.pack_id } }} align="center">
                                        <Row>
                                            <Col className={classes.fileGutterBox} align="left">
                                                <Row>
                                                    {/* <Col span={12}>
                                                        {"组件数 " + 3}
                                                    </Col> */}
                                                    <Col>
                                                        {"可执行文件数 " + item.exeFileNum}
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        {"架构 " + item.arch}
                                                    </Col>
                                                    {/* <Col span={12}>
                                                        {"系统镜像文件数 " + item.systemMirrorNum}
                                                    </Col> */}
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        {"文件系统 " + item.filesystem}
                                                    </Col>
                                                    {/* <Col span={12}>
                                                        {"文件系统镜像数 " + item.fileMirrorNum}
                                                    </Col> */}
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                    <Drawer
                        title="任务执行列表"
                        placement="right"
                        width={400}
                        closable={false}
                        onClose={this.onCloseDrawer}
                        visible={this.state.taskManageVisible}
                    >
                        <List
                            size="large"
                            header={<div style={{ color: 'red', fontSize: 14, fontWeight: 'bold' }}>{'未完成任务'}</div>}
                            //bordered
                            dataSource={unDoneTasks}
                            renderItem={item =>
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.process_file_name + ' ' + item.task_name}
                                        description={item.start_time}
                                    />
                                    <div>{item.percentage + '%'}</div>
                                </List.Item>}
                        />
                        <List
                            size="large"
                            header={<div style={{ color: '#32CD32', fontSize: 14, fontWeight: 'bold' }}>{'已完成任务'}</div>}
                            //bordered
                            dataSource={doneTasks}
                            renderItem={item =>
                                <List.Item>
                                    <List.Item.Meta
                                        title={item.task_name}/*固件名称 + 任务名称*/
                                        description={item.start_time}
                                    />
                                    <div>{item.percentage+ '%'}</div>
                                </List.Item>}
                        />
                    </Drawer>
                    {this.state.detailFWInfoPreview && <DetailFWInfo selectFWItem={this.state.selectFWItem} actioncb={this.handleCloseDetailFWInfo} />}
                </Skeleton>
            </div >
        );
    }
}

export default withStyles(styles)(FirmwarePackageView);