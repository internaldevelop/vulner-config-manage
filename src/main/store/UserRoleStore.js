import { observable, action, configure, computed } from 'mobx'
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'

import RestReq from '../../utils/RestReq';

configure({ enforceActions: 'observed' })

class UserRoleStore {
    /**
     * 全局存放用户角色
     */
    @observable roleArray = [];

    /**
     * 全局一次性加载用户角色，不和后台的角色表同步更新。
     */
    @action loadAllRoles = () => {
        if (this.isRolesEmpty) {
            this.forceLoadRoles();
        }
    }

    /**
     * 强制加载用户角色
     */
    @action forceLoadRoles = () => {
        RestReq.asyncGet(this.requestRolesCB, '/unified-auth/role_manage/all')
    }

    requestRolesCB = (data) => {
        this.setRoles(DeepClone(data.payload));
    }

    /**
     * 本函数用于应用在前端动态增加用户角色，可能和后台角色不一致
     */
    @action setRoles = (roles) => {
        // 支持增量模式，所以采用 DeepCopy
        if (roles instanceof Array) {
            DeepCopy(this.roleArray, roles);
        }
    }
    @computed get isRolesEmpty(){
        return (this.roleArray.length === 0);
    }
};

export default new UserRoleStore()