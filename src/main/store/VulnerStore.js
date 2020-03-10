import { observable, action, configure } from 'mobx'
import { DeepClone } from '../../utils/ObjUtils'

configure({ enforceActions: 'observed' })

class VulnerStore {
  // 0: means idle
  // 1: means new record
  // 2: means record to be edited
  @observable vulnerAction = 0;
  @observable vulnerProcName = '未知操作';
  @observable vulnerPopupShow = false;

  @action setVulnerAction = (action) => {
    this.vulnerAction = action;
  }
  @action setVulnerProcName = (name) => {
    this.vulnerProcName = name;
  }
  @action switchShow = (show) => {
    this.vulnerPopupShow = show;
  }

  @observable vulnerItem = {};

  @action initVulnerItem = (vulnerItem) => {
    this.vulnerItem = DeepClone(vulnerItem);
  }
  @action setParam = (name, data) => {
    this.vulnerItem[name] = data;
  }
}

export default new VulnerStore()