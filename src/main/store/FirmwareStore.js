import { observable, action, configure } from 'mobx'
import { DeepClone } from '../../utils/ObjUtils'

configure({ enforceActions: 'observed' })

class FirmwareStore {
  // 0: means idle
  // 1: means new record
  // 2: means record to be edited
  @observable firmwareAction = 0;
  @observable firmwareProcName = '未知操作';
  @observable firmwarePopupShow = false;

  @action setFirmwareAction = (action) => {
    this.firmwareAction = action;
  }
  @action setFirmwareProcName = (name) => {
    this.firmwareProcName = name;
  }
  @action switchShow = (show) => {
    this.firmwarePopupShow = show;
  }

    @observable firmwareItem = {};

    @action initFirmwareItem = (firmwareItem) => {
        this.firmwareItem = DeepClone(firmwareItem);
    }
    @action setParam = (name, data) => {
        this.firmwareItem[name] = data;
    }
}

export default new FirmwareStore()