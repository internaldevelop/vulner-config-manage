

class MStrUtils {

    /**
     * 检查指定字符串中是否含有特殊字符
     * @param {String} inputStr 待检查字符串
     * @param {String} usage 字符串用途，不分大小写
     */
    hasSpecialChars(inputStr, usage = '') {
        let pattern = null;

        if (usage.length === 0) {
            // 未指定字符串用途，则做一般性检查
            pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
        } else if (this.equalNoCase(usage, 'IP')) {
            // 指定字符串为IP地址（‘.’可以作为合法字符）
            pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
        }

        return pattern.test(inputStr);
    }

    /**
     * 检查字符串是否符合指定用途的模式
     * @param {String} inputStr 待检查字符串
     * @param {String} usage 字符串用途，不分大小写
     */
    checkPattern(inputStr, usage = 'IP') {
        let pattern = null;
        if (this.equalNoCase(usage, 'IP')) {
            // IP 地址类型
            pattern = /^((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)(\.((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)){3}$|^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
        } else if (this.equalNoCase(usage, 'EMAIL')) {
            // 暂不支持EMAIL检查，待补充
            return false;
        } else if (this.equalNoCase(usage, 'ACCOUNT')) {
            // 账号类型
            // 由字母a～z(不区分大小写)、数字0～9、点、减号或下划线组成
            // 只能以字母开头，包含字符 数字 下划线，例如：beijing.2008
            // 用户名长度为4～18个字符
            pattern = /^[a-zA-Z]\w{3,15}$/ig;
        } else {
            // 不支持的 usage ，永远返回 false
            return false;
        }

        return pattern.test(inputStr);
    }

    /**
     * 比较两个字符串（大小写敏感）
     * < 0 : a 小于 b
     * > 0 : a 大于 b
     * == 0 : a 等于 b
     * @param {String} a 第一个待比较字符串
     * @param {String} b 第二个待比较字符串
     */
    compare(a, b) {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }
        // names must be equal
        return 0;
    }

    /**
     * 比较两个字符串（忽略大小写），返回值等同于: compare(a, b)
     * @param {String} a 第一个待比较字符串
     * @param {String} b 第二个待比较字符串
     */
    compareNoCase(a, b) {
        let stringA = a.toUpperCase(); // ignore upper and lowercase
        let stringB = b.toUpperCase(); // ignore upper and lowercase
        return this.compare(stringA, stringB);
    }

    /**
     * 判断两个字符串是否相等（忽略大小写）
     * @param {String} a 第一个待比较字符串
     * @param {String} b 第二个待比较字符串
     */
    equalNoCase(a, b) {
        let stringA = a.toUpperCase(); // ignore upper and lowercase
        let stringB = b.toUpperCase(); // ignore upper and lowercase
        return (stringA === stringB);
    }

    /**
     * 检查字符串是否为空
     * @param {String} str 待检查的字符串对象
     */
    isEmpty(str) {
        return (!(typeof (str) === 'string') || (str.length === 0));
    }

}

export default new MStrUtils();
