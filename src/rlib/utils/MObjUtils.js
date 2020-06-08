class MObjUtils {
    /**
     * 浅拷贝，不影响目标对象中不拷贝的属性
     * @param {Object} dest 存放待拷贝属性的目标对象
     * @param {Object} src 源对象
     */
    shallowCopy(dest, src) {
        Object.assign(dest, src);
    }

    /**
     * 深克隆，复制产生新对象
     * @param {Object} src 源对象
     * @return {Object} 拷贝产生的新对象
     */
    deepClone(src) {
        let dest = JSON.parse(JSON.stringify(src));
        return dest;
    }

    /**
     * 深拷贝，将源对象深拷贝到目标对象中，不影响目标对象中不拷贝的属性
     * @param {Object} dest 存放待拷贝属性的目标对象
     * @param {Object} src 源对象
     */
    deepCopy(dest, src) {
        // 对源对象克隆出一个新对象
        let clone = this.deepClone(src);

        // 将克隆出的对象拷贝到目标对象中
        this.shallowCopy(dest, clone);
    }

    /**
     * 比较两个数字
     * @param {number} a 待比较的第一个数字
     * @param {number} b 待比较的第二个数字
     */
    compareNumber(a, b) {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } 
        return 0;
    }

    /**
     * 比较两个对象的值（支持字符串和数字）
     * @param {any} a 待比较的第一个对象
     * @param {any} b 待比较的第二个对象
     */
    compare(a, b) {
        if (this.isString(a)) {
            // 字符串比较
            return a.localeCompare(b, "zh");
        } else if (this.isNumber(a)) {
            // 数字比较
            return this.compareNumber(a, b);
        }

        // 不支持的对象返回 0
        return 0;
    }

    isNumber(obj) {
        return (typeof(obj) === 'number');
    }

    isString(obj) {
        return (typeof(obj) === 'string');
    }
}

export default new MObjUtils();
