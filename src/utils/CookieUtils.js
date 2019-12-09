import { GetExpireTimeGMTStr } from './TimeUtils'

export function SetCookie(name, value) {
    document.cookie = name + "="+ escape (value);
} 

export function SetCookieExpireDays(name, value, days) {
    document.cookie = name + "="+ escape (value) + ";expires=" + GetExpireTimeGMTStr(days);
}

export function GetCookie(name)
{
    var arr, reg = new RegExp( "(^| )" + name + "=([^;]*)(;|$)" ); //正则匹配
    if ( ( arr = document.cookie.match(reg) ) !== null ) {
      return unescape(arr[2]);
    } else {
     return null;
    }
} 

export function DelCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = GetCookie(name);
    if ( cval != null ) {
      document.cookie = name + "=" + cval + ";expires="+ exp.toGMTString();
    }
} 
