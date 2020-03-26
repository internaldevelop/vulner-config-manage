import { message } from 'antd'
import axios from 'axios';
import ArrUtils from '../utils/ArrUtils';
import StrUtils from '../utils/StrUtils';
import TimeUtils from '../utils/TimeUtils';
import qs from 'qs';


/**
 * New version of RESTful interface calling,
 * HttpRequest(old version) is deprecated.
 */
class RestReq {

    /**
     * 异步 get 请求
     * @param {*} callBack 必选参数，完成 get 请求后，data 通过回调函数处理
     * @param {*} url 必选参数，后台接口地址，形如：'/unified-auth/oauth/token'
     * @param {*} params 可选参数， get 请求的参数，默认为 {}
     * @param {*} config 可选参数， axios.options 的配置标志，默认为 {}
     */
    asyncGet(callBack, url, params = {}, config = {}) {
        return this.asyncCall(url, callBack, 'get', params, config);
    }

    /**
     * 异步 post 请求
     * @param {*} callBack  必选参数，完成 post 请求后，data 通过回调函数处理
     * @param {*} url 必选参数，后台接口地址，形如：'/unified-auth/oauth/token'
     * @param {*} params 可选参数， post 请求的参数，默认为 {}
     * @param {*} config 可选参数， axios.options 的配置标志，默认为 {}
     */
    asyncPost(callBack, url, params = {}, config = {}) {
        return this.asyncCall(url, callBack, 'post', params, config);
    }

    /**
     * 异步 delete 请求
     * @param {*} callBack  必选参数，完成 delete 请求后，data 通过回调函数处理
     * @param {*} url 必选参数，后台接口地址，形如：'/unified-auth/oauth/token'
     * @param {*} params 可选参数， delete 请求的参数，默认为 {}
     * @param {*} config 可选参数， axios.options 的配置标志，默认为 {}
     */
    asyncDelete(callBack, url, params = {}, config = {}) {
        return this.asyncCall(url, callBack, 'delete', params, config);
    }

    /**
     * 异步后台接口调用
     * @param {*} url 必选参数，后台接口地址，形如：'/unified-auth/oauth/token'
     * @param {*} callBack 必选参数，完成 delete 请求后，data 通过回调函数处理
     * @param {*} method 可选参数， 后台接口调用请求方法，默认为 get
     * @param {*} params 可选参数， 后台接口调用请求的参数，默认为 {}
     * @param {*} config 可选参数， axios.options 的配置标志，默认为 {}
     */
    asyncCall(url, callBack, method = 'get', params = {}, config = {}) {
        config = this._composeConfig(config);

        // 设定 REST 接口的 baseURL
        let baseURL = this._getBaseURL(config.baseUrlType);

        // 设置 axios 的 options
        let options = {
            method,     // default is 'get'
            baseURL,    // `baseURL` will be prepended to `url` unless `url` is absolute.
            url,        // `url` is the server URL that will be used for the request
            responseType: 'json',
            timeout: 3000, // default is `0` (no timeout)
        };

        // 需要验证权限的加上 access_token 参数
        if (config.token) {
            params.access_token = this._getAccessToken();
        }

        if (method === 'post') {
            // post 方法时，参数传递给 data 域
            options.data = qs.stringify(params);
            options.headers = { 'content-type': 'application/x-www-form-urlencoded' };
        } else if (ArrUtils.contains(['get', 'delete'], method)) {
            // get / delete 方法时，参数传递给 params 域
            options.params = params;
        }

        // 客户端认证
        if (config.clientAuth) {
            options.auth = this._getClientAuthConfig();
        }

        // 执行请求
        axios(options)
            .then((response) => response.data)
            .then((data) => {
                console.log('axios response data:');
                console.log(data);//输出返回的数据
                if (!!callBack && (config.alwaysCallBack || data === null || (data.code !== undefined && data.code === 'ERROR_OK'))) {
                    callBack(data);
                }
            })
            .catch(error => {
                console.log('axios catch error:');
                console.log(error);
                message.error(StrUtils.eng2chn(error.message));
            });
    }

    _composeConfig(config) {
        if (config === undefined || config === null) {
            // 未定义config 时，或其为 null 时，构造空对象
            config = {};
        }
        if (config.alwaysCallBack === undefined) {
            // 默认只有响应成功时，才调用回调函数
            config.alwaysCallBack = false;
        }
        if (config.clientAuth === undefined) {
            // 默认不进行客户端校验
            config.clientAuth = false;
        }
        if (config.baseUrlType === undefined) {
            // 默认 base 地址类型为空
            config.baseUrlType = '';
        }
        if (config.token === undefined) {
            // 默认参数需增加 access_token 
            config.token = true;
        }
        return config;
    }

    _getBaseURL(baseUrlType) {
        let baseUrl = 'http://localhost:10112';

        // 设定 REST 接口的 BaseUrl
        if (baseUrlType.length === 0) {
            // 默认的 BaseUrl
            // baseUrl = GetMainServerRootUrl();
            baseUrl = 'http://localhost:10110';
        }

        return baseUrl;
    }

    _getClientAuthConfig() {
        return {
            username: 'android',
            password: 'android'
        };
    }

    _getAccessToken() {
        return sessionStorage.getItem('access_token');
    }

    // =======================================================================
    // 开始--测试部分
    // 测试函数及回调函数
    _testCallBack = (data) => {
        console.log('Enter call back functions:');  //输出返回的数据
        console.log(data);  //输出返回的数据
        if (data.access_token !== undefined) {
            sessionStorage.setItem('access_token', data.access_token);
        }
    }

    _testGetAccUuid() {
        return 'df6cdd4a-1cad-11ea-b42f-0242ac110003';
    }

    _testNoAuthGet() {
        this.asyncGet(this._testCallBack, '/unified-auth/system/run_status', {}, { token: false });
    }

    _testAuthGet() {
        let params = {
            grant_type: 'password',
            username: 'user_3',
            password: '12345678'
        };
        this.asyncGet(this._testCallBack, '/unified-auth/oauth/token', params, { alwaysCallBack: true, clientAuth: true, token: false });
    }

    _testAuthPost() {
        let params = {
            uuid: this._testGetAccUuid(),
            alias: '32',
            email: '11@2',
            mobile: '999',
            gender: 'M',
            birthday: '2001/12/21'
        };
        this.asyncPost(this._testCallBack, '/unified-auth/account_manage/update', params);
    }

    _testAuthDelete() {
        this.asyncDelete(this._testCallBack, '/unified-auth/account_auth/exit');
    }

    testRestReq() {
        this._testNoAuthGet();
        TimeUtils.sleep(1000)
            .then(() => { 
                this._testAuthGet(); 
                return TimeUtils.sleep(1000); 
            })
            .then(() => { 
                this._testAuthPost(); 
                return TimeUtils.sleep(1000); 
            })
            .then(() => { 
                this._testAuthDelete(); 
                return TimeUtils.sleep(1000); 
            });

    }

    // 结束--测试部分
    // =======================================================================

}

export default new RestReq()
