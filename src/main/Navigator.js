import React from 'react'
import CustomMenu from "../components/menu/CustomMenu";
import { GetSystemType } from "../global/environment"

const hostMenus = [
    {
        title: '固件分析',
        icon: 'control',
        key: '/home/firmware-analyze/',
        subs: [
            { key: '/home/firmware-analyze/fetch', title: '固件收集', icon: 'download', },
        ]
    },
    {
        title: '日志管理',
        icon: 'read',
        key: '/home/log-manage',
        subs: [
            { key: '/home/log-manage/system-logs', title: '系统日志', icon: 'alert', },
        ]
    },
    {
        title: '系统管理',
        icon: 'setting',
        key: '/home/sysadmin',
        subs: [
            { key: '/home/sysadmin/users', title: '用户管理', icon: 'contacts', },
            { key: '/home/sysadmin/personal', title: '个人资料', icon: 'user', },
            { key: '/home/sysadmin/assets', title: '资产管理', icon: 'cluster', },
        ]
    },
    {
        title: '授权文件管理',
        icon: 'safety-certificate',
        key: '/home/certfile-manage/',
        subs: [
            { key: '/home/certfile-manage/generate', title: '授权文件生成', icon: 'download', },
            { key: '/home/certfile-manage/import', title: '授权文件导入', icon: 'import', },
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
        if (sysType === 1) {
            return hostMenus;
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