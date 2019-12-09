import React, { Component } from 'react';
import './App.css';
import { HashRouter, Route, Switch } from 'react-router-dom'
import PrivateRoute from './AppRouter/PrivateRoute'
import LoginPage from '../components/login/LoginPage'
import Signup from '../components/login/SignUp';
import { LoadEnvironConfig } from "../global/environment"
import SystemEntry from './SystemEntry'

import EventEmitter from 'events';

class App extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state={};

  //   // let data = '{"startup": 111}';
  //   let data = '{"startup": {"SELinux_status": "检查SELinux是否开启","SELinux_mode": "检查SELinux模式是否为enforcing","SELinux_policy": "检查SELinux策略是否为strict"}}';
  //   let jsonData = JSON.parse(data);
  //   jsonData = jsonData["startup"];

  //   let arrData= [];
  //   for (let key in jsonData) {
  //       if (jsonData.hasOwnProperty(key)) {
  //           let value = jsonData[key];
  //           arrData.push({key, value});
  //           console.log(value);
  //       }
  //   }
  //   let newData = arrData.map((value) => value.key + ": " + value.value);

  // }
  componentWillMount = () => {
    LoadEnvironConfig();
  }

  componentDidMount() {
    global.myEventEmitter = new EventEmitter();
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Switch>
            <Route exact path="/" component={LoginPage} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/signup" component={Signup} />
            <PrivateRoute path='/home' component={SystemEntry} />
            {/* <PrivateRoute path='/tasks' component={TaskPage} /> */}
            {/* <Redirect exact from='/' to='/home'/> */}
          </Switch>
        </div>
      </HashRouter>
    );

  }
}

export default App;
