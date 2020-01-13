import { message } from 'antd'
import { GetMainServerRootUrl } from '../global/environment'
import axios from 'axios';
import ArrUtils from '../utils/ArrUtils';
import StrUtils from '../utils/StrUtils';
// import { observer, inject } from 'mobx-react'
import qs from 'qs';


// @inject('userStore')
// @observer
class RestReq {
    asyncGet(callBack, url, params = {}, { alwaysCallBack = false, clientAuth = false, baseUrlType = '', token = true }) {
        return this.asyncCall(url, callBack, 'get', params, { alwaysCallBack, clientAuth, baseUrlType, token });
    }

    asyncPost(callBack, url, params = {}, { alwaysCallBack = false, clientAuth = false, baseUrlType = '', token = true }) {
        return this.asyncCall(url, callBack, 'post', params, { alwaysCallBack, clientAuth, baseUrlType, token });
    }

    asyncDelete(callBack, url, params = {}, { alwaysCallBack = false, clientAuth = false, baseUrlType = '', token = true }) {
        return this.asyncCall(url, callBack, 'delete', params, { alwaysCallBack, clientAuth, baseUrlType, token });
    }

    asyncCall(url, callBack, method = 'get', params = {}, { alwaysCallBack = false, clientAuth = false, baseUrlType = '', token = true }) {
        // 设定 REST 接口的 baseURL
        let baseURL = this._getBaseURL(baseUrlType);

        // 设置 axios 的 options
        let options = {
            method,     // default is 'get'
            baseURL,    // `baseURL` will be prepended to `url` unless `url` is absolute.
            url,        // `url` is the server URL that will be used for the request
            responseType: 'json',
            timeout: 3000, // default is `0` (no timeout)
        };

        // 需要验证权限的加上 access_token 参数
        if (token) {
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
        if (clientAuth) {
            options.auth = this._getClientAuthConfig();
        }

        // 执行请求
        axios(options)
            .then((response) => response.data)
            .then((data) => {
                console.log('axios response data:');
                console.log(data);//输出返回的数据
                if (!!callBack && (alwaysCallBack || (data.code !== undefined && data.code === 'ERROR_OK'))) {
                    callBack(data);
                }
            })
            .catch(error => {
                console.log('axios catch error:');
                console.log(error);
                message.error(StrUtils.eng2chn(error.message));
            });
    }

    _getBaseURL(baseUrlType) {
        let baseUrl = '';

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
        // return this.props.userStore.loginUser.access_token;
    }

    testCllBack = (data) => {
        console.log(data);  //输出返回的数据
        if (data.access_token !== undefined) {
            sessionStorage.setItem('access_token', data.access_token);
        }
    }

    testSetAccessToken() {
        sessionStorage.setItem('access_token', '7a0541a1-83b5-4d36-a3a7-8c36e2c0decd');
        // this.props.userStore.loginUser.access_token = 'cfa8c409-3f12-454b-b09e-649e92797b7d';
    }

    testGetAccUuid() {
        return 'df6cdd4a-1cad-11ea-b42f-0242ac110003';
    }

    testNoAuthGet() {
        this.asyncGet(this.testCllBack, '/unified-auth/system/run_status', {}, { token: false });
    }

    testAuthGet() {
        let params = {
            grant_type: 'password',
            username: 'user_3',
            password: '12345678'
        };
        this.asyncGet(this.testCllBack, '/unified-auth/oauth/token', params, { alwaysCallBack:true, clientAuth: true, token: false });
    }

    testAuthPost() {
        let params = {
            uuid: this.testGetAccUuid(),
            alias: '32',
            email: '11@2',
            mobile: '999',
            gender: 'M',
            birthday: '2001/12/21'
        };
        this.asyncPost(this.testCllBack, '/unified-auth/account_manage/update', params, {});
    }

    testAuthDelete() {
        this.asyncDelete(this.testCllBack, '/unified-auth/account_auth/exit', {}, {});
    }

}

export default new RestReq()
