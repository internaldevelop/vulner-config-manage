import EventEmitter from 'events';

class MEvent {
    register(eventName, eventCB) {
        if (global.myEventEmitter === undefined) {
            global.myEventEmitter = new EventEmitter();
            // 临时设置最大监听数量为100，需要用更优化和更适配的方式替换
            global.myEventEmitter.setMaxListeners(100);
        }
        // 注册事件
        global.myEventEmitter.addListener(eventName, eventCB);
    }

    unregister(eventName, eventCB) {
        if (global.myEventEmitter !== undefined) {
            // 取消事件
            global.myEventEmitter.removeListener(eventName, eventCB);
        }
    }

    send(eventName, data) {
        if (global.myEventEmitter) {
            global.myEventEmitter.emit(eventName, data);
        }
    }
}

export default new MEvent();
