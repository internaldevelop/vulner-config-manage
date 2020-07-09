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
import CertFileImport from '../views/CertFileImport';
import PerformanceOverView from '../views/PerformanceOverView';
import VulnerManageInfoView from '../views/VulnerManageView/VulnerManageInfoView'
import VulnerStatisticsView from '../views/VulnerStatisticsView/VulnerStatisticsView'
import FirmwareFunctionView from '../views/FirmwareFunctionView';
import FirmwarePackageView from '../views/FirmwarePackageView';
import DataBackupView from '../views/DataBackupView';
import DataRestoreView from '../views/DataRestoreView';
import LogCustomView from '../views/SystemLogsView/LogCustomView';
import LogDownloadView from '../views/SystemLogsView/LogDownloadView';
import ComponentCompileView from '../views/ComponentCompileView';
import ComponentConnectView from '../views/ComponentConnectView';
import FeatureExtrationView from '../views/FeatureExtrationView';

@withRouter
class ContentMain extends React.Component {
  render() {
    return (
      <div style={{ padding: 16, position: 'relative' }}>
        {GetSystemType() === 0 && this.getHostSystemRoute()}
        {GetSystemType() === 1 && this.getAccessSystemRoute()}
      </div>
    )
  }

  getHostSystemRoute() {
    return (
      <Switch>
        <PrivateRoute exact path='/home/log-manage/system-logs' component={SystemLogsView} />
        <PrivateRoute exact path='/home/log-manage/log-custom' component={LogCustomView} />
        <PrivateRoute exact path='/home/log-manage/log-download' component={LogDownloadView} />

        <PrivateRoute exact path='/home/sysadmin/users' component={UsersManageView} />
        <PrivateRoute exact path='/home/sysadmin/personal' component={UserInfoView} />
        <PrivateRoute exact path='/home/sysadmin/assets' component={AssetManageView} />

        <PrivateRoute exact path='/home/firmware-analyze/firmware-fetch' component={FirmwareFetchView} />
        <PrivateRoute exact path='/home/firmware-analyze/package-fetch' component={FirmwarePackageView} />
        <PrivateRoute exact path='/home/firmware-analyze/function-fetch' component={FirmwareFunctionView} />
        <PrivateRoute exact path='/home/firmware-analyze/component-compile' component={ComponentCompileView} />
        <PrivateRoute exact path='/home/firmware-analyze/component-connect' component={ComponentConnectView} />
        <PrivateRoute exact path='/home/firmware-analyze/feature-extration' component={FeatureExtrationView} />

        <PrivateRoute exact path='/home/certfile-manage/generate' component={CertFileGenerate} />
        <PrivateRoute exact path='/home/certfile-manage/import' component={CertFileImport} />

        <PrivateRoute exact path='/home/history-performance' component={PerformanceOverView} />

        <PrivateRoute exact path='/home/vulner-manage/info' component={VulnerManageInfoView} />
        <PrivateRoute exact path='/home/vulner-stat' component={VulnerStatisticsView} />

        <PrivateRoute exact path='/home/sysadmin/backup' component={DataBackupView} />
        <PrivateRoute exact path='/home/sysadmin/restore' component={DataRestoreView} />

        <PrivateRoute exact path='/home/about' component={AboutView} />

        <Redirect exact from='/' to='/home' />
      </Switch>
    );
  }

  getAccessSystemRoute() {
    return (
      <Switch>
        <PrivateRoute exact path='/home/log-manage/system-logs' component={SystemLogsView} />
        <PrivateRoute exact path='/home/sysadmin/users' component={UsersManageView} />
        <PrivateRoute exact path='/home/sysadmin/personal' component={UserInfoView} />
        <PrivateRoute exact path='/home/sysadmin/assets' component={AssetManageView} />
        <PrivateRoute exact path='/home/history-performance' component={PerformanceOverView} />
        <PrivateRoute exact path='/home/about' component={AboutView} />
        <Redirect exact from='/' to='/home' />
      </Switch>
    );
  }
}

export default ContentMain