import { observable, action, configure } from 'mobx'
import { DeepClone } from '../../utils/ObjUtils'

configure({ enforceActions: 'observed' })

class AssetStore {
  // 0: means idle
  // 1: means new record
  // 2: means record to be edited
  @observable assetAction = 0;
  @observable assetProcName = '未知操作';
  @observable assetPopupShow = false;

  @action setAssetAction = (action) => {
    this.assetAction = action;
  }
  @action setAssetProcName = (name) => {
    this.assetProcName = name;
  }
  @action switchShow = (show) => {
    this.assetPopupShow = show;
  }

    @observable assetItem = {};

    @action initAssetItem = (assetItem) => {
        this.assetItem = DeepClone(assetItem);
    }
    @action setParam = (name, data) => {
        this.assetItem[name] = data;
    }
}

export default new AssetStore()