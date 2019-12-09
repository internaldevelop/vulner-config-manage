export function IsNowExpired(expire) {
    let currentTime = new Date();
    return (currentTime.getTime() > expire.getTime());
}

export function GetExpireTimeGMTStr(expireDays) {
    var exp = new Date();
    exp.setTime(exp.getTime() + expireDays*24*60*60*1000);
    return exp.toGMTString();
}

export function GetNowTimeGMTStr() {
    var now = new Date();
    return now.toGMTString();
}

export function GetNowTimeMyStr() {
    var now = new Date();
    return MyFormatTime(now);
}

// 输出时间格式为：yyyy-MM-dd HH-mm-ss
export function MyFormatTime(inputTime) {  
    var date = new Date(inputTime);
    var y = date.getFullYear();  
    var m = date.getMonth() + 1;  
    m = m < 10 ? ('0' + m) : m;  
    var d = date.getDate();  
    d = d < 10 ? ('0' + d) : d;  
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;  
    second = second < 10 ? ('0' + second) : second; 
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;  
}