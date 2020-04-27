import { observable, action, configure } from 'mobx'
import { DeepClone } from '../../utils/ObjUtils'

configure({ enforceActions: 'observed' })

class LogStore {
  // 0: means idle
  // 1: means new record
  // 2: means record to be edited
  @observable logAction = 0;
  @observable logProcName = '未知操作';
  @observable logPopupShow = false;

  @action setLogAction = (action) => {
    this.logAction = action;
  }
  @action setLogProcName = (name) => {
    this.logProcName = name;
  }
  @action switchShow = (show) => {
    this.logPopupShow = show;
  }

  @observable logItem = {};

  @action initLogItem = (logItem) => {
    this.logItem = DeepClone(logItem);
  }
  @action setParam = (name, data) => {
    this.logItem[name] = data;
  }
}

export default new LogStore()