import MTimeUtils from './MTimeUtils';
import MObjUtils from './MObjUtils';

class MTest {
    now() {
        let tms1 = MTimeUtils.now();
        let tms2 = MTimeUtils.now('str', 'simple');
        let tms3 = MTimeUtils.now('str', 'yyyy-MM-dd hh:mm:ss.S');
        let tms4 = MTimeUtils.now('str', 'locale');
        let tms5 = MTimeUtils.now('str', 'localetime');
        let tms6 = MTimeUtils.now('str', 'normal');
        let tms7 = MTimeUtils.now('str', 'GMT');
        return 1;
    }

    offset() {
        let tms0 = MTimeUtils.now();
        let tms1 = MTimeUtils.offset(-39, 'second');
        let tms2 = MTimeUtils.offset(-39, 'minute');
        let tms3 = MTimeUtils.offset(-9, 'hour');
        let tms4 = MTimeUtils.offset(-9, 'day');
        let tms5 = MTimeUtils.offset(-9, 'month');
        let tms6 = MTimeUtils.offset(-9, 'year');
        let i = 1;
        return 1;
    }

    obj() {
        let res11 = MObjUtils.isNumber(1);
        let res12 = MObjUtils.isNumber('1');
        let res13 = MObjUtils.isNumber({a: 1});
        let res14 = MObjUtils.isNumber([1]);
        let res21 = MObjUtils.isString(1);
        let res22 = MObjUtils.isString('1');
        let res23 = MObjUtils.isString({a: '1'});
        let res24 = MObjUtils.isString(['1']);
        return 1;
    }

    timeParse() {
        let tm1 = MTimeUtils.parse('2020年11月4日');
        let tm2 = MTimeUtils.parse('Mon Nov 04 2020 22:03:05 GMT+0800 (中国标准时间)');
        let tm3 = MTimeUtils.parse('2020-07-02 08:09:04.423');
        let tm4 = MTimeUtils.parse('2020-07-02 08:09:04');
        let tm5 = MTimeUtils.parse('Mon, 04 Nov 2020 14:03:05 GMT');
        let tm6 = MTimeUtils.parse('2020-11-04T14:03:05.420Z');
        let tm7 = MTimeUtils.parse('Mon Nov 04 2020');
        return 1;
    }
}

export default new MTest();
