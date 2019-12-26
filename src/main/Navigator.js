import React from 'react'
import CustomMenu from "../components/menu/CustomMenu";
import { GetSystemType } from "../global/environment"

const hostMenus = [
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