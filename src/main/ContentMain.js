import React from 'react'
import { withRouter, Switch, Redirect } from 'react-router-dom'
import 'antd/dist/antd.css';
import PrivateRoute from './AppRouter/PrivateRoute'

import { GetSystemType } from "../global/environment"
import SystemLogsView from '../views/SystemLogsView'
import UsersManageView from '../views/UsersManageView'
import UserInfoView from '../views/UsersManageView/UserInfoView'
import AboutView from '../views/AboutView'
import AssetManageView from '../views/AssetManageView';
import FirmwareFetchView from '../views/FirmwareFetchView';
import CertFileGenerate from '../views/CertFileGenerate';

@withRouter
class ContentMain extends React.Component {
  render() {
    return (
      <div style={{ padding: 16, position: 'relative' }}>
      {GetSystemType() === 1 && this.getHostSystemRoute()}  
      </div>
    )
  }

  getHostSystemRoute() {
    return (
      <Switch>
        <PrivateRoute exact path='/home/log-manage/system-logs' component={SystemLogsView} />

        <PrivateRoute exact path='/home/sysadmin/users' component={UsersManageView} />
        <PrivateRoute exact path='/home/sysadmin/personal' component={UserInfoView} />
        <PrivateRoute exact path='/home/sysadmin/assets' component={AssetManageView} />

        <PrivateRoute exact path='/home/firmware-analyze/fetch' component={FirmwareFetchView} />
        <PrivateRoute exact path='/home/certfile-manage/generate' component={CertFileGenerate} />

        <PrivateRoute exact path='/home/about' component={AboutView} />

        <Redirect exact from='/' to='/home' />
      </Switch>
    );
  }
}

export default ContentMain