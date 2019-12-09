import { message } from 'antd';

import { GetWebSocketUrl } from '../global/environment';
import { generateUuidStr } from './tools'

export function OpenSocket(slotType, processCB) {
    let socket = null;

    if (typeof (WebSocket) == "undefined") {
        console.log("您的浏览器不支持WebSocket");
    } else {
        console.log("您的浏览器支持WebSocket");
        //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接  
        socket = new WebSocket(GetWebSocketUrl() + slotType + '_' + generateUuidStr());
        //打开事件  
        socket.onopen = function () {
            console.log("Socket 已打开");
            //socket.send("这是来自客户端的消息" + location.href + new Date());  
        };
        //获得消息事件  
        socket.onmessage = function (msg) {
            // console.log(msg.data);
            processCB(msg.data);
            //发现消息进入    开始处理前端触发逻辑
        };
        //关闭事件  
        socket.onclose = function () {
            console.log("Socket已关闭");
            socket.close();
            socket = null;
        };
        //发生了错误事件  
        socket.onerror = function () {
            message.error("Socket发生了错误");
            //此时可以尝试刷新页面
        }
    }

    return socket;
}

export function CloseSocket(socket) {
    if (socket != null)
        socket.close();
}
