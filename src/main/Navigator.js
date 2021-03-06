import React from 'react'
import CustomMenu from "../components/menu/CustomMenu";
import { GetSystemType } from "../global/environment"

const hostMenus = [
    {
        title: '固件分析',
        icon: 'control',
        key: '/home/firmware-analyze/',
        subs: [
            { key: '/home/firmware-analyze/firmware-fetch', title: '固件收集', icon: 'download', },
            { key: '/home/firmware-analyze/package-fetch', title: '固件包抽取', icon: 'project', },
            { key: '/home/firmware-analyze/function-fetch', title: '固件函数抽取', icon: 'code',},
            { key: '/home/firmware-analyze/component-compile', title: '组件编译', icon: 'file',},
            { key: '/home/firmware-analyze/feature-extration', title: '组件特征提取', icon: 'key',},
            { key: '/home/firmware-analyze/component-connect', title: '组件关联', icon: 'fork',},
            { key: '/home/firmware-analyze/report-download', title: '报告下载', icon: 'download' },
        ]
    },
    {
        title: '漏洞库管理',
        icon: 'project',
        key: '/home/vulner-manage',
        subs: [
            { key: '/home/vulner-manage/info', title: '漏洞库信息管理', icon: 'exception', },
            { key: '/home/vulner-stat', title: '工控漏洞统计', icon: 'line-chart', },
        ]
    },
    {
        title: '性能监控',
        icon: 'line-chart',
        key: '/home/history-performance',
    },
    {
        title: '日志管理',
        icon: 'read',
        key: '/home/log-manage',
        subs: [
            { key: '/home/log-manage/log-custom', title: '日志格式定制', icon: 'book', },
            { key: '/home/log-manage/system-logs', title: '日志管理', icon: 'alert', },
            { key: '/home/log-manage/log-copy', title: '日志备份', icon: 'copy', },
            { key: '/home/log-manage/log-download', title: '日志下载', icon: 'download' },
        ]
    },
    {
        title: '系统管理',
        icon: 'setting',
        key: '/home/sysadmin',
        subs: [
            { key: '/home/sysadmin/users', title: '用户管理', icon: 'contacts', },
            { key: '/home/sysadmin/personal', title: '个人资料', icon: 'user', },
            { key: '/home/sysadmin/backup', title: '数据备份', icon: 'copy', },
            { key: '/home/sysadmin/restore', title: '数据恢复', icon: 'rest', },
            // { key: '/home/sysadmin/assets', title: '资产管理', icon: 'cluster', },
        ]
    },
    {
        title: '授权文件管理',
        icon: 'safety-certificate',
        key: '/home/certfile-manage/',
        subs: [
            { key: '/home/certfile-manage/generate', title: '授权文件生成', icon: 'export', },
            { key: '/home/certfile-manage/import', title: '授权文件导入', icon: 'import', },
        ]
    },
    {
        title: '关于',
        icon: 'info-circle-o',
        key: '/home/about'
    }
]

const accessMenus = [
    {
        title: '运行状态监测',
        icon: 'line-chart',
        key: '/home/history-performance',
    },
    {
        title: '系统管理',
        icon: 'setting',
        key: '/home/sysadmin',
        subs: [
            { key: '/home/sysadmin/users', title: '用户管理', icon: 'contacts', },
            { key: '/home/sysadmin/personal', title: '个人资料', icon: 'user', },
        ]
    },
    {
        title: '关于',
        icon: 'info-circle-o',
        key: '/home/about'
    }
]


class Navigator extends React.Component {
    getMenus() {
        let sysType = GetSystemType();
        if (sysType === 0) {
            return hostMenus;
        } else if (sysType === 1) {
            return accessMenus;
        }
    }

    render() {

        return (
            <div style={{ height: '100vh', overflowY: 'scroll' }}>
                <div style={styles.logo}></div>
                <CustomMenu menus={this.getMenus()} />
            </div>
        )
    }
}

const styles = {
    logo: {
        height: '32px',
        //background: 'rgba(255, 255, 255, .2)',
        margin: '16px'
    }
}

export default Navigator