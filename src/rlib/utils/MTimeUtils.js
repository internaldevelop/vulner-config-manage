import MStrUtils from './MStrUtils';
import MObjUtils from './MObjUtils';
class MTimeUtils {
    /**
     * 当前线程等待给定的毫秒数
     * @param {number} ms 等待毫秒数
     */
    sleep(ms) {
        return new Promise(resolve =>
            setTimeout(resolve, ms)
        )
    }

    /**
     * 获取当前时间字符串或时间对象
     * @param {string} mode 时间类型：字符串 或 时间对象
     * @param {string} fmt 格式名 或 格式化串
     */
    now(mode = 'str', fmt = 'simple') {
        let nowTime = new Date();
        return this._timeData(nowTime, mode, fmt);
    }

    _timeData(tm, mode, fmt) {
        if (MStrUtils.equalNoCase(mode, 'str')) {
            // 返回格式化的时间字符串
            return this.formatStr(tm, fmt);
        }

        // 返回时间对象
        return tm;
    }

    /**
     * 不能解析这种格式： 2020年11月4日
     * @param {string} tmStr 时间字符串
     */
    parse(tmStr) {
        if (!MObjUtils.isString(tmStr)) {
            return null;
        }
        return new Date(Date.parse(tmStr));
    }

    /** 
     * 从当前时间，向未来或向过去偏移一段时间，并格式化输出
     * @param {number} count 偏移量
     * @param {string} countType 偏移量的类型
     * @param {string} mode 时间类型：字符串 或 时间对象
     * @param {string} fmt 格式名 或 格式化串
     */
    offset(count, countType = 'day', mode = 'str', fmt = 'simple') {
        let tm = this.now('Date');
        if (MStrUtils.equalNoCase(countType, 'second')) {
            tm.setSeconds(tm.getSeconds() + count);
        } else if (MStrUtils.equalNoCase(countType, 'minute')) {
            tm.setMinutes(tm.getMinutes() + count);
        } else if (MStrUtils.equalNoCase(countType, 'hour')) {
            tm.setHours(tm.getHours() + count);
        } else if (MStrUtils.equalNoCase(countType, 'day')) {
            tm.setDate(tm.getDate() + count);
        } else if (MStrUtils.equalNoCase(countType, 'month')) {
            tm.setMonth(tm.getMonth() + count);
        } else if (MStrUtils.equalNoCase(countType, 'year')) {
            tm.setFullYear(tm.getFullYear() + count);
        } else {
            return this.now(mode, fmt);
        }

        return this._timeData(tm, mode, fmt);
    }

    /**
     * 将时间对象转换为时间字符串
     * @param {Date} tm 时间对象
     * @param {string} fmt 格式名 或 格式化串
     */
    formatStr(tm, fmt) {
        if (MStrUtils.equalNoCase(fmt, 'simple')) {
            // 自定义的简单格式
            return this.myFormat(tm, "yyyy-MM-dd hh:mm:ss");

        } else if (MStrUtils.equalNoCase(fmt, 'GMT')) {
            // 格林威治时间，输出：Mon, 04 Nov 2020 14:03:05 GMT
            return tm.toGMTString();

        } else if (MStrUtils.equalNoCase(fmt, 'Date')) {
            // 日期字符串，输出：Mon Nov 04 2020
            return tm.toDateString();

        } else if (MStrUtils.equalNoCase(fmt, 'ISO')) {
            // 国际标准组织（ISO）格式，输出：2020-11-04T14:03:05.420Z
            return tm.toISOString();

        } else if (MStrUtils.equalNoCase(fmt, 'JSON')) {
            // 输出：2020-11-04T14:03:05.420Z
            return tm.toJSON();

        } else if (MStrUtils.equalNoCase(fmt, 'LocaleDate')) {
            // 转换为本地日期格式，视环境而定，输出：2020年11月4日
            return tm.toLocaleDateString();

        } else if (MStrUtils.equalNoCase(fmt, 'Locale')) {
            // 转换为本地日期和时间格式，视环境而定，输出：2020年11月4日 下午10:03:05
            return tm.toLocaleString();

        } else if (MStrUtils.equalNoCase(fmt, 'LocaleTime')) {
            // 转换为本地时间格式，视环境而定，输出：下午10:03:05
            return tm.toLocaleTimeString();

        } else if (MStrUtils.equalNoCase(fmt, 'UTC')) {
            // 转换为世界时间，输出：Mon, 04 Nov 2020 14:03:05 GMT
            return tm.toUTCString();

        } else if (MStrUtils.equalNoCase(fmt, 'normal')) {
            // 转换为字符串，输出：Mon Nov 04 2020 22:03:05 GMT+0800 (中国标准时间)
            return tm.toString();

        } else if (MStrUtils.equalNoCase(fmt, 'normalTime')) {
            // 转换为时间字符串，输出：22:03:05 GMT+0800 (中国标准时间)
            return tm.toTimeString();

        }

        // 认定 fmt 为指定格式化串，比如："yyyy-MM-dd hh:mm:ss.S" ==> 2020-07-02 08:09:04.423
        return this.myFormat(tm, fmt);
    }

    /**
     * 自定义格式化串
     * @param {Date} tm 时间对象
     * @param {string} fmt 格式化串
     */
    myFormat(tm, fmt) {
        let tmStr = fmt;
        let props = {
            "M+": tm.getMonth() + 1, //月份
            "d+": tm.getDate(), //日
            "h+": tm.getHours(), //小时
            "m+": tm.getMinutes(), //分
            "s+": tm.getSeconds(), //秒
            "q+": Math.floor((tm.getMonth() + 3) / 3), //季度
            "S": tm.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(tmStr)) tmStr = tmStr.replace(RegExp.$1, (tm.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in props)
            if (new RegExp("(" + k + ")").test(tmStr)) tmStr = tmStr.replace(RegExp.$1, (RegExp.$1.length == 1) ? (props[k]) : (("00" + props[k]).substr(("" + props[k]).length)));
        return tmStr;
    }
}

export default new MTimeUtils();
