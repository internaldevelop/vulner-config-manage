import { observable, action, configure } from 'mobx'
import { DeepClone } from '../../utils/ObjUtils'

configure({ enforceActions: 'observed' })

class CertFileStore {
  @observable certFileItem = {};

  @action initCertFileItem = (certFileItem) => {
    this.certFileItem = DeepClone(certFileItem);
  }
  @action setParam = (name, data) => {
    this.certFileItem[name] = data;
  }
}

export default new CertFileStore()