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
            name: '',
            uuid: '',
            password: '',
            expire: '',
            email: '',
            roles: {},
        });
    }
    var value = JSON.parse(login);
    return value;
};

export class UserStore {
    @observable loginUser = {
        isLogin: false,
        name: '',
        uuid: '',
        password: '',
        expire: '',
        email: '',
        roles: {},//以下是roles结构
        // "role_uuid": "",
        // "role_name": "ROLE_USER",
        // "role_alias": "普通用户"
    };
    @action setLoginUser = (user) => {
        Object.assign(this.loginUser, user);
    };
    @action saveLoginUser = (expireDays) => {
        let info = JSON.stringify({
            name: this.loginUser.name,
            uuid: this.loginUser.uuid,
            password: this.loginUser.password,
            expire: GetExpireTimeGMTStr(expireDays),
            email: this.loginUser.email,
            roles: this.loginUser.roles,
        });
        SetCookieExpireDays(loginInfoName, info, expireDays);
    }
    // 从cookie中读取保存的 remember user 信息
    @action initLoginUser = () => {
        let cachedUser = LoadUserLoginInfo();
        Object.assign(this.loginUser, cachedUser);
    }

    @action updateUserRoles = (roles) => {
        this.loginUser.roles = roles;
    }

    @computed get isUserExpired() {
        return IsEmptyString(this.loginUser.name);
    }

    @computed get isAdminUser() {
        for (let i = 0; i < this.loginUser.roles.length; i++) {
            if (this.loginUser.roles[i].role_name === 'ROLE_ADMIN') {
                return true;
            }
        }
        return false
    }

    @computed get isAuditUser() {
        for (let i = 0; i < this.loginUser.roles.length; i++) {
            if (this.loginUser.roles[i].role_name === 'ROLE_AUDITOR') {
                return true;
            }
        }
        return false;
    }

    @computed get isNormalUser() {
        for (let i = 0; i < this.loginUser.roles.length; i++) {
            if (this.loginUser.roles[i].role_name === 'ROLE_USER') {
                return true;
            }
        }
        return false;
    }
}

export default new UserStore()