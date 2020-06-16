import { observable, action, toJS } from "mobx";

class State {
  //控制模态框的开闭
  @observable startStopOnOff=false
}

export default new State()