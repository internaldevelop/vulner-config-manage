class MNumUtils {
    rand(minNum, maxNum) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * minNum, 10);
                break;
            case 2:
                return parseInt(Math.random() * (maxNum - minNum) + minNum, 10);
                break;
            default:
                return 0;
                break;
        }
    }

    /**
     * 截取小数点后几位（由 count 指定）
     * @param {*} num 
     * @param {*} count 
     */
    fixed(num, count = 2) {
        let base = 1.0;
        for (let i = 0; i < count; i++)
            base *= 10.0;
        return parseInt(num * base) / base;
    }
}

export default new MNumUtils();
