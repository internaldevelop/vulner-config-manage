import { observable, action, configure, computed } from 'mobx'
import { IsEmptyString } from '../../utils/StringUtils'
import { GetExpireTimeGMTStr } from '../../utils/TimeUtils'
import { GetCookie, SetCookieExpireDays } from '../../utils/CookieUtils'
import { userType } from '../../global/enumeration/UserType'

configure({ enforceActions: 'observed' })

const loginInfoName = 'loginInfo'

const LoadUserLoginInfo = () => {
    let login = GetCookie(loginInfoName);
    console.log(login);

    if (IsEmptyString(login)) {
        return ({
            account: '',
            userUuid: '',
            password: '',
            expire: '',
            userGroup: userType.TYPE_NORMAL_USER,
            email: '',
        });
    }
    var value = JSON.parse(login);
    return value;
};

class UserStore {
    @observable loginUser = {
        isLogin: false,
        account: '',
        userUuid: '',
        password: '',
        expire: '',
        userGroup: userType.TYPE_NORMAL_USER,
        email: '',
    };
    @action setLoginUser = (user) => {
        Object.assign(this.loginUser, user);
    };
    @action saveLoginUser = (expireDays) => {
        let info = JSON.stringify({
            account: this.loginUser.account,
            userUuid: this.loginUser.uuid,
            password: this.loginUser.password,
            expire: GetExpireTimeGMTStr(expireDays),
            email: this.loginUser.email,
        });
        SetCookieExpireDays(loginInfoName, info, expireDays);
    }
    // 从cookie中读取保存的 remember user 信息
    @action initLoginUser = () => {
        let cachedUser = LoadUserLoginInfo();
        Object.assign(this.loginUser, cachedUser);
    }

    @computed get isUserExpired() {
        return IsEmptyString(this.loginUser.account);
    }

    @computed get isAdminUser() {
        return this.loginUser.userGroup === userType.TYPE_ADMINISTRATOR;
    }

    @computed get isAuditUser() {
        return this.loginUser.userGroup === userType.TYPE_AUDITOR;
    }

    @computed get isNormalUser() {
        return this.loginUser.userGroup === userType.TYPE_NORMAL_USER;
    }
}

export default new UserStore()