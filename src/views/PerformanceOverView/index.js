import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'

import { Tabs, Card, Skeleton, Select, Input, Spin, Button, Row, Col, Icon, Collapse, message, Modal } from 'antd';

import { renderAssetInfo } from './AssetInfo';
import ProcUsageLine from '../AssetOverView/ProcUsageLine';
import HistoryUsageLine from './HistoryUsageLine';
import UsageGauge from '../AssetOverView/UsageGauge';
import { OpenSocket, CloseSocket } from '../../utils/WebSocket';
import { sockMsgType } from '../../global/enumeration/SockMsgType'
import { GetMainServerRootUrl, GetAgentRootUrl } from '../../global/environment'
import RestReq from '../../utils/RestReq';

const Option = Select.Option;
const Panel = Collapse.Panel;
const { TabPane } = Tabs;

let socket = null;

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    cardContainer: {
        //height: 120,
        marginTop: -16,
    }
});

@inject('assetInfoStore')
@inject('userStore')
@observer
class PerformanceOverView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            assets: [],
            selectedAssetId: -1,//TODO 如果用以前的接口的话需要用指定的资产uuid, 这里需要增加当前资产uuid
            assetInfo: {},
            assetOnline: false,
            loading: false,
            isWindows: false,
            showSetPwd: false,
        };

        this.startNodeScheduler();
    }

    componentDidMount() {
        let infoStore = this.props.assetInfoStore;
        // TODO: 性能测试时需要注释掉Socket通信
        socket = OpenSocket('asset_info', this.processAssetRealTimeInfo);
        infoStore.setProcCpu(this.getSourceInital());
        infoStore.setProcMem(this.getSourceInital());

        // 注册事件
        global.myEventEmitter.addListener('DisplayPortsList', this.displayPortsList);
    }

    componentWillUnmount() {
        // TODO: 性能测试时需要注释掉Socket通信
        CloseSocket(socket);

        // 取消事件
        global.myEventEmitter.removeListener('DisplayPortsList', this.displayPortsList);
    }

    displayPortsList = () => {
    }

    getSourceInital = () => {
        return [['procname', 'percent', 'score']];
    }

    processAssetRealTimeInfo = (data) => {
        let infoStore = this.props.assetInfoStore;
        let message = JSON.parse(data);
        if (message.type === sockMsgType.ASSET_REAL_TIME_INFO) {//&& selectedAssetId > -1 && assets.length > 0
            // payload
            let payload = message.payload;
            // 不是当前选择的资产信息忽略 TODO 当前项目不需要选择资产
            // if (payload['asset_uuid'] !== assets[selectedAssetId].uuid) {
            //     return;
            // }

            // 从payload中提取CPU使用率，存到仓库中
            infoStore.setCpu(payload['CPU'].usedPercentTotal / 100.0);
            // 从payload中提取内存使用率，存到仓库中
            infoStore.setMem(payload['Memory'].usedPercentTotal / 100.0);

            // 从payload中提取硬盘使用率，存到仓库中
            infoStore.setDisk(payload['Disks'].usedPercentTotal / 100.0);

            // 存储进程的CPU占用率
            // let procCpuList = payload['Proc CPU Ranking'];
            // if (procCpuList instanceof Array) {
            //     let procPercents = this.getSourceInital();
            //     for (let procCpu of procCpuList) {
            //         let percent = (procCpu.percent * 100).toFixed(2) - 0;
            //         let procName = procPercents.length + '-' + procCpu.name;
            //         procPercents.push([procName, percent, percent]);
            //     }
            //     infoStore.setProcCpu(procPercents);
            // }

            // 存储进程的内存占用率
            // let procMemList = payload['Proc Memory Ranking'];
            // if (procMemList instanceof Array) {
            //     let procPercents = this.getSourceInital();
            //     for (let procMem of procMemList) {
            //         let procName = procPercents.length + '-' + procMem.name;
            //         let percent = (procMem.percent * 100).toFixed(2) - 0;
            //         procPercents.push([procName, percent, percent]);
            //     }
            //     infoStore.setProcMem(procPercents);
            // }
        } else {
            // 其它消息类型不做处理
        }

    }

    assetNameFromUuid(assetUuid) {
        const { assets } = this.state;
        for (let asset of assets) {
            if (asset.uuid === assetUuid)
                return asset.name;
        }
        return '';
    }
    assetIndexFromUuid(assetUuid) {
        const { assets } = this.state;
        for (let index in assets) {
            if (assets[index].uuid === assetUuid)
                return parseInt(index);
        }
        return -1;
    }

    // 启动后台任务 
    startNodeScheduler = () => {
        RestReq.asyncGet(this.startNodeSchedulerCB, '/fw-bend-server/starttask/resources', { types: 'CPU,Memory,Disks', second_time: 3 });
        //RestReq.asyncGet(this.startNodeSchedulerCB, '/fw-bend-server/starttask/resources', { types: 'CPU,Memory,Disks', second_time: 3, detail: 1 });
    }

    startNodeSchedulerCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;
        this.setState({ assetInfo: data.payload });
    }

    render() {
        const { assetInfo } = this.state;
        let infoStore = this.props.assetInfoStore;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    {/* <Spin spinning={this.state.loading} size="large"> */}
                    <Card title="实时监控" /*extra={this.getAssetSelectList()}*/ bodyStyle={{ minWidth: '800px', minHeight: '400px' }}>
                        {/* <Skeleton loading={!assetOnline} active avatar> */}
                        <Row gutter={8}>
                            <Col span={17} className={classes.cardContainer}>
                                <Row>
                                    <Col span={7}>
                                        <UsageGauge name='CPU' />
                                    </Col>
                                    <Col span={17}>
                                        <HistoryUsageLine type='dataSrcFromNow' name='CPU' />
                                        {/* <ProcUsageLine name='CPU' percents={infoStore.procCpuPercents} /> */}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={7}>
                                        <UsageGauge name='内存' />
                                    </Col>
                                    <Col span={17}>
                                        {/* <ProcUsageLine name='内存' percents={infoStore.procMemPercents} /> */}
                                        <HistoryUsageLine type='dataSrcFromNow' name='内存' />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={7}>
                                        <UsageGauge name='硬盘' />
                                    </Col>
                                    <Col span={17}>
                                        <HistoryUsageLine type='dataSrcFromNow' name='硬盘' />
                                    </Col>
                                </Row>

                                {/* <Tabs onChange={this.changeTabs} type="card">
                                    <TabPane tab="CPU" key="1">
                                        <Row>
                                            <Col span={7}>
                                                <UsageGauge name='CPU' />
                                            </Col>
                                            <Col span={17}>
                                                <HistoryUsageLine type='dataSrcFromNow' name='CPU' />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <HistoryUsageLine type='dataSrcFromNow' name='CPU' />
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    <TabPane tab="内存" key="2">
                                        <Row>
                                            <Col span={7}>
                                                <UsageGauge name='内存' />
                                            </Col>
                                            <Col span={17}>
                                                <ProcUsageLine name='内存' percents={infoStore.procMemPercents} />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <HistoryUsageLine type='dataSrcFromNow' name='内存' />
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    <TabPane tab="硬盘" key="3">
                                        <Row>
                                            <Col span={7}>
                                                <UsageGauge name='硬盘' />
                                            </Col>
                                            <Col span={17}>
                                                <HistoryUsageLine type='dataSrcFromNow' name='硬盘' />
                                            </Col>
                                        </Row>
                                    </TabPane>
                                </Tabs> */}
                            </Col>
                            <Col span={7} className={classes.cardContainer}>
                                {renderAssetInfo(assetInfo)}
                            </Col>
                        </Row>
                        {/* </Skeleton> */}
                    </Card>
                    {/* </Spin> */}
                </Skeleton>
            </div>
        );
    }
}

PerformanceOverView.propTypes = {
    classes: PropTypes.object,
};


export default withStyles(styles)(PerformanceOverView);
