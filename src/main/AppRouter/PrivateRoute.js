import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import LoginPage from '../../components/login/LoginPage';
import HttpRequest from '../../utils/HttpRequest';
import { errorCode } from '../../global/error';

import { observer, inject } from 'mobx-react'

// import LoginUser from 'service/login-service/LoginUser';

// import Unauthorized from "page/error/Unauthorized";


//私有路由，只有登录的用户才能访问
@observer
@inject("userStore")
class PrivateRoute extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUserLogin: false,
        }
        // TODO: 后续需要关闭后门
        this.checkIfLogin();
    }

    checkIfLogin = () => {
        const userStore = this.props.userStore;
        const isUserLogin = this.state;
        if (!isUserLogin || !userStore.loginUser.isLogin) {
            userStore.initLoginUser();
            HttpRequest.asyncPost(this.verifyPasswordCB, '/users/verify-pwd', { account: userStore.loginUser.account, password: userStore.loginUser.password }, false);
        }
    }

    verifyPasswordCB = (data) => {
        const userStore = this.props.userStore;
        if (data.code === errorCode.ERROR_OK) {
            // 密码校验成功，保存登录用户
            const { account, password } = this.state;
            userStore.setLoginUser({
                isLogin: true,
                account,
                userUuid: data.payload.user_uuid,
                password,
                userGroup: data.payload.user_group,
                email: data.payload.email,
            });
            this.setState({ isUserLogin: true });
        }
    }

    // componentWillMount(){
    //     if(!this.state.isUserLogin){
    //         toastr.error('login timeOut, return to the login page after 3s');
    //         const {history} = this.props;
    //         setTimeout(() => {
    //             history.replace("/login");
    //         }, 3000)
    //     }
    // }
    render() {
        const { component: Component, path = "/", exact = false, strict = false } = this.props;
        const userStore = this.props.userStore;
        return (userStore.loginUser.isLogin || this.state.isUserLogin) ? (
            <Route path={path} exact={exact} strict={strict}
                render={(props) => (<Component {...props} />)} />) : <LoginPage />;
    }
}
export default withRouter(PrivateRoute);