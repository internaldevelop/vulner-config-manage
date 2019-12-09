

// var PROTOCOL = 'https';
// // 主服务端口：ng映射端口 12001
// const MAIN_S_PORT = '12001';
// // Agent服务端口：ng映射端口 12002
// const AGENT_S_PORT = '12002';
// // 漏洞库服务端口：ng映射端口 12003
// const EDB_PORT = '12003'

// var PROTOCOL = 'http';
// 主服务端口：原始端口 8090
// const MAIN_S_PORT = '8090';
// Agent服务端口：原始端口 8191
// const AGENT_S_PORT = '8191';
// 漏洞库服务端口：原始端口 10091
// const EDB_PORT = '10091'

// 本地： localhost
// WYT 虚拟机： 192.168.182.88
// TQ 直连虚拟机： 192.168.1.70
// TQ 本机： 192.168.1.60
// TQ wifi虚拟机： 172.16.113.39
// 信通所云服务器： 172.16.60.5
// 域名： ytwei.club
// const BASE_URL = '://192.168.182.88:' + MAIN_S_PORT + '/';
// export const BASE_URL2 = '://192.168.182.88:' + EDB_PORT;

// const BASE_URL = '://ytwei.club:' + MAIN_S_PORT + '/';
// export const BASE_URL2 = '://ytwei.club:' + EDB_PORT;

export function LoadEnvironConfig() {
    // 默认环境参数
    global.myEnvironConfig = {
        "viewMinWidth": 1100,
        "systemType": 1,
        "systemName": [
            "主站 & 终端系统自动化配置核查工具",
            "主站系统自动化配置核查工具",
            "终端系统自动化配置检测工具",
            "主站性能测试工具",
            "终端漏洞利用工具"
        ],
        "ssl": false,
        "mainServerPort": "8090",
        "agentServerPort": "8191",
        "edbServerPort": "10091",
        "mainServerUrl": "192.168.182.88",
        "edbServerUrl": "192.168.182.88"
    };

    // 读取环境参数配置文件
    fetch("./environ_config.json")
        .then(res => res.json())
        .then(json => {
            global.myEnvironConfig = json;
            console.log(json);
        })
}

export function GetSystemType() {
    return global.myEnvironConfig.systemType;
}

export function GetSystemName() {
    let systemType = GetSystemType();
    return global.myEnvironConfig.systemName[systemType];
}

function _sslProtocol() {
    return global.myEnvironConfig.ssl;
}

function _getHttpProtocol() {
    return _sslProtocol() ? 'https' : 'http';
}

function _getWsProtocol() {
    return _sslProtocol() ? 'wss' : 'ws';
}

export function GetMainServerRootUrl() {
    let protocol = _getHttpProtocol();
    let url = global.myEnvironConfig.mainServerUrl;
    let port = global.myEnvironConfig.mainServerPort;
    return protocol + '://' + url + ':' + port + '/api';
}

export function GetEdbServerRootUrl() {
    let protocol = _getHttpProtocol();
    let url = global.myEnvironConfig.edbServerUrl;
    let port = global.myEnvironConfig.edbServerPort;
    return protocol + '://' + url + ':' + port;
}

export function GetAgentRootUrl(agentIp) {
    let protocol = _getHttpProtocol();
    let port = global.myEnvironConfig.agentServerPort;
    return protocol + '://' + agentIp + ':' + port;
}

export function GetWebSocketUrl() {
    let protocol = _getWsProtocol();
    let url = global.myEnvironConfig.mainServerUrl;
    let port = global.myEnvironConfig.mainServerPort;
    return protocol + '://' + url + ':' + port + '/websocket/';
}

export function GetViewMinWidth() {
    return global.myEnvironConfig.viewMinWidth;
}
