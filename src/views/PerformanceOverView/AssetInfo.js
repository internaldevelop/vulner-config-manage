import React from 'react'

import { Collapse, Tag, Divider, Button } from 'antd'
import { withStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

const Panel = Collapse.Panel;

export function renderAssetInfo(fpInfo) {
    let system;
    return (
        <Collapse accordion defaultActiveKey='ComputerSystem'>
            {assetComputerSysInfo(fpInfo)}
            {/* {assetGeneralInfo(fpInfo)} */}
            {assetCpuInfo(fpInfo)}
            {assetMenInfo(fpInfo)}
            {assetDiskInfo(fpInfo)}
            {assetNetworkInfo(fpInfo)}
        </Collapse>
    );

}

function tagInfo(tag, info) {
    return (<p><Tag color="cyan">{tag}</Tag>{info}</p>);
}

const systemInfoItems = [
    { name: 'os.name', desc: '操作系统' },
    { name: 'os.version', desc: 'OS版本' },
    { name: 'os.arch', desc: '系统架构' },
    { name: 'java.runtime.version', desc: 'JAVA运行时版本' },
    { name: 'java.runtime.name', desc: 'JAVA运行时环境' },
    // { name: 'java.home', desc: 'JAVA主目录' },
    { name: 'sun.jnu.encoding', desc: '系统编码' },
    { name: 'user.timezone', desc: '用户时区' },
];

function assetGeneralInfo(fpInfo) {

    if (fpInfo.hasOwnProperty('sys_type') && (fpInfo['sys_type'] !== null)) {
        return (
            <Panel header={'操作系统'} key={'system'}>
                {tagInfo('系统类型', fpInfo.sys_type)}
                {tagInfo('系统名称', fpInfo.sys_name)}
                {tagInfo('系统版本', fpInfo.sys_version)}
            </Panel>
        );
    } else {
        return (
            <Panel header={'系统信息获取失败'} key={'system'}>
            </Panel>
        );
    }
}

function assetComputerSysInfo(fpInfo) {

    if (fpInfo.hasOwnProperty('ComputerSystem') && (fpInfo['ComputerSystem'] !== null)) {
        let hwSys = fpInfo['ComputerSystem'];
        return (
            <Panel header={'硬件系统'} key={'ComputerSystem'}>
                {tagInfo('型号', hwSys.model)}
                {tagInfo('制造商', hwSys.manufacturer)}
                {tagInfo('主板厂商', hwSys.baseboard.manufacturer)}
                {tagInfo('主板序列号', hwSys.baseboard.serialNumber)}
                {tagInfo('主板版本号', hwSys.baseboard.version)}
                {tagInfo('固件厂商', hwSys.firmware.manufacturer)}
                {tagInfo('固件名称', hwSys.firmware.name)}
                {tagInfo('固件版本', hwSys.firmware.version)}
                {tagInfo('固件发布日期', hwSys.firmware.releaseDate)}
            </Panel>
        );
    } else {
        return (
            <Panel header={'硬件信息获取失败'} key={'ComputerSystem'}>
            </Panel>
        );
    }
}

function assetCpuInfo(fpInfo) {
    if (fpInfo.hasOwnProperty('CPU') && (fpInfo['CPU'] !== null)) {
        let cpuInfo = fpInfo['CPU'];
        return (
            <Panel header={'CPU信息'} key={'CPUInfo'}>
                {tagInfo('CPU', cpuInfo.name)}
                {tagInfo('制造商', cpuInfo.vendor)}
                {tagInfo('ID', cpuInfo.processorID)}
                {tagInfo('SN', cpuInfo.systemSerialNumber)}
                {tagInfo('型号', cpuInfo.model)}
                {tagInfo('主频', '' + cpuInfo.vendorFreq / (1000.0 * 1000 * 1000) + 'GHz')}
                {tagInfo('CPU族', cpuInfo.family)}
                {tagInfo('标识', cpuInfo.identifier)}
                {tagInfo('64位', cpuInfo.cpu64bit ? '是' : '否')}
                {tagInfo('物理核数', cpuInfo.physicalProcessorCount + '核')}
                {tagInfo('逻辑核数', cpuInfo.logicalProcessorCount + '核')}
            </Panel>
        );
    } else {
        return (
            <Panel header={'CPU信息获取失败'} key={'CPUInfo'}>
            </Panel>
        );
    }
}

function formatCapacity(capacity) {
    if (capacity > 1073741824) {
        // GB
        capacity = capacity / 1073741824;
        capacity = capacity.toFixed(2) + ' G';
    } else if (capacity > 1048576) {
        // MB
        capacity = capacity / 1048576;
        capacity = capacity.toFixed(2) + ' M';
    } else if (capacity > 1024) {
        // KB
        capacity = capacity / 1024;
        capacity = capacity.toFixed(2) + ' K';
    } else {
        capacity = capacity + ' ';
    }
    return capacity + 'B';
}

function formatPercent(percent) {
    if (percent === null) {
        return '--%';
    }
    return percent.toFixed(2) + '%';
}

function assetMenInfo(fpInfo) {
    if (fpInfo.hasOwnProperty('Memory') && (fpInfo['Memory'] !== null)) {
        let memInfo = fpInfo['Memory'];
        return (
            <Panel header={'内存信息'} key={'Memory'}>
                {tagInfo('内存总量', formatCapacity(memInfo.total))}
                {tagInfo('交换区', formatCapacity(memInfo.swapTotal))}
                {tagInfo('页大小', formatCapacity(memInfo.pageSize))}
                {tagInfo('换出页', formatCapacity(memInfo.swapPagesOut))}
            </Panel>
        );
    } else {
        return (
            <Panel header={'内存信息获取失败'} key={'Memory'}>
            </Panel>
        );
    }
    // if (typeof (memInfo) === 'undefined' || memInfo === null ||
    //     typeof (swapInfo) === 'undefined' || swapInfo === null) {
    //     return (
    //         <Panel header={'内存信息获取失败'} key={'Memory'}>
    //         </Panel>
    //     );
    // } else {
    //     return (
    //         <Panel header={'内存信息'} key={'Memory'}>
    //             {tagInfo('内存总量', formatCapacity(memInfo.total))}
    //             {tagInfo('已用内存', formatCapacity(memInfo.actualUsed))}
    //             {tagInfo('空闲内存', formatCapacity(memInfo.actualFree))}
    //             {tagInfo('已用占比', formatPercent(memInfo.usedPercent))}
    //             {tagInfo('空闲占比', formatPercent(memInfo.freePercent))}
    //             {tagInfo('交换区总量', formatCapacity(swapInfo.total))}
    //             {tagInfo('已用交换区', formatCapacity(swapInfo.used))}
    //             {tagInfo('空闲交换区', formatCapacity(swapInfo.free))}
    //         </Panel>
    //     );
    // }
}

function netCardInfo(netCard, index) {
    let netName = '网络' + (index + 1);
    return (
        <div key={netCard.macAddress}>
            {tagInfo(netName + '名称', netCard.netWorkName)}
            {tagInfo(netName + ' MAC', netCard.macAddress)}
            {tagInfo(netName + '速度', netCard.speed)}
            {tagInfo(netName + 'MTU', netCard.mtu)}
            <Divider />
        </div>
    );
}

function assetNetworkInfo(fpInfo) {
    if (fpInfo.hasOwnProperty('Network') && (fpInfo['Network'] !== null)) {
        let networkInfo = fpInfo['Network'];
        return (
            <Panel header={'网络信息'} key={'Network'}>
                {networkInfo.map((netCard, index) => netCardInfo(netCard, index))}
            </Panel>
        );
    } else {
        return (
            <Panel header={'网络信息获取失败'} key={'Network'}>
            </Panel>
        );
    }
}

function fileStoreInfo(fileStore, index) {
    let fsName = '存储' + (index + 1);
    return (
        <div key={fileStore.volume}>
            {tagInfo(fsName + '卷标', fileStore.volume)}
            {tagInfo(fsName + '名称', fileStore.name)}
            {tagInfo(fsName + '描述', fileStore.description)}
            {tagInfo(fsName + '类型', fileStore.type)}
            {tagInfo(fsName + '挂载', fileStore.mount)}
            {tagInfo(fsName + ' UUID', fileStore.uUID)}
            <Divider />
        </div>
    );
}

function assetDiskInfo(fpInfo) {
    if (fpInfo.hasOwnProperty('Disks') && (fpInfo['Disks'] !== null)) {
        let diskInfo = fpInfo['Disks'];
        let fileStores = diskInfo['fileStores'];
        return (
            <Panel header={'存储信息'} key={'DiskInfo'}>
                {tagInfo('总容量', formatCapacity(diskInfo.allTotal))}
                <Divider />
                {fileStores.map((fileStore, index) => fileStoreInfo(fileStore, index))}
            </Panel>
        );
    } else {
        return (
            <Panel header={'存储信息获取失败'} key={'DiskInfo'}>
            </Panel>
        );
    }
}

function assetPortInfo(portInfo) {
    if (portInfo instanceof Array && portInfo.length > 0) {
        return (
            <Panel header={'开放的端口'} key={'OpenPorts'}>
                <p>
                    <Tag color="cyan">开放端口总数</Tag>
                    <Link component="button" align="center" underline="always"
                        onClick={() => { global.myEventEmitter.emit('DisplayPortsList', portInfo); }}
                    >{portInfo.length + '个'}</Link>
                </p>
                {/* <p>
                    <Tag color="cyan">UDP</Tag>
                    <Link component="button" align="center" underline="always"
                        onClick={() => { global.myEventEmitter.emit('DisplayPortsList', portInfo); }}
                    > 23</Link>
                </p> */}
            </Panel>
        );
    } else {
        return (
            <Panel header={'端口信息获取失败'} key={'OpenPorts'}>
            </Panel>
        );
    }
}

