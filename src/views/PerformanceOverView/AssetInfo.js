import React from 'react'

import { Collapse, Tag, Divider, Button } from 'antd'
import { withStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';

const Panel = Collapse.Panel;

export function renderAssetInfo(assetInfo) {
    let system;
    return (
        <Collapse accordion defaultActiveKey='System'>
            {assetGeneralInfo(assetInfo, 'System')}
            {assetCpuInfo(assetInfo.CPU)}
            {assetMenInfo(assetInfo.Memory, assetInfo.Swap)}
            {assetDiskInfo(assetInfo.FST)}
            {assetNetworkInfo(assetInfo['Net Config'])}
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

function assetGeneralInfo(assetInfo, infoType) {
    let info;
    let title;
    let items;
    if (infoType === 'System') {
        items = systemInfoItems;
        title = '系统参数';
    }
    if (assetInfo.hasOwnProperty(infoType) && ((info = assetInfo[infoType]) !== null)) {
        return (
            <Panel header={title} key={infoType}>
                {items.map((item) => tagInfo(item.desc, info[item.name]))}
            </Panel>
        );
    } else {
        return (
            <Panel header={'未知'} key={infoType}>
            </Panel>
        );
    }
}

function assetCpuInfo(cpuInfo) {
    if (cpuInfo instanceof Array && cpuInfo.length > 0) {
        let cpuItem = cpuInfo[0];
        return (
            <Panel header={'CPU信息'} key={'CPUInfo'}>
                {tagInfo('CPU核', cpuInfo.length + '核')}
                {tagInfo('制造商', cpuItem.vendor)}
                {tagInfo('型号', cpuItem.model)}
                {tagInfo('主频', cpuItem.mhz)}
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

function formatDisk(capacity) {
    if (capacity > 1073741824) {
        // T
        capacity = capacity / 1073741824;
        capacity = capacity.toFixed(2) + ' T';
    } else if (capacity > 1048576) {
        // G
        capacity = capacity / 1048576;
        capacity = capacity.toFixed(2) + ' G';
    } else if (capacity > 1024) {
        // MB
        capacity = capacity / 1024;
        capacity = capacity.toFixed(2) + ' M';
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

function assetMenInfo(memInfo, swapInfo) {
    if (typeof (memInfo) === 'undefined' || memInfo === null ||
        typeof (swapInfo) === 'undefined' || swapInfo === null) {
        return (
            <Panel header={'内存信息获取失败'} key={'Memory'}>
            </Panel>
        );
    } else {
        return (
            <Panel header={'内存信息'} key={'Memory'}>
                {tagInfo('内存总量', formatCapacity(memInfo.total))}
                {tagInfo('已用内存', formatCapacity(memInfo.actualUsed))}
                {tagInfo('空闲内存', formatCapacity(memInfo.actualFree))}
                {tagInfo('已用占比', formatPercent(memInfo.usedPercent))}
                {tagInfo('空闲占比', formatPercent(memInfo.freePercent))}
                {tagInfo('交换区总量', formatCapacity(swapInfo.total))}
                {tagInfo('已用交换区', formatCapacity(swapInfo.used))}
                {tagInfo('空闲交换区', formatCapacity(swapInfo.free))}
            </Panel>
        );
    }
}

function assetDiskInfo(diskInfo) {
    if (typeof (diskInfo) === 'undefined' || diskInfo === null) {
        return (
            <Panel header={'硬盘信息获取失败'} key={'Disk'}>
            </Panel>
        );
    } else {
        return (
            <Panel header={'硬盘信息'} key={'Disk'}>
                {tagInfo('硬盘总量', formatDisk(diskInfo.allTotal))}
                {tagInfo('已用硬盘', formatDisk(diskInfo.usedTotal))}
                {tagInfo('空闲硬盘', formatDisk(diskInfo.freeTotal))}
                {tagInfo('已用占比', formatPercent(diskInfo.usedPercentTotal))}
                {tagInfo('空闲占比', formatPercent(diskInfo.freePercentTotal))}
            </Panel>
        );
    }
}

function netCardInfo(netCard, index) {
    if (netCard.address === '0.0.0.0') {
        return <div></div>;
    } else {
        return (
            <div>
                {tagInfo(netCard.name + ' MAC', netCard.hwaddr)}
                {tagInfo(netCard.name + '类型', netCard.type)}
                {tagInfo(netCard.name + '描述', netCard.description)}
                {tagInfo(netCard.name + ' IP', netCard.address)}
                <Divider />
            </div>
        );
    }
}

function assetNetworkInfo(networkInfo) {
    if (networkInfo instanceof Array && networkInfo.length > 0) {
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

