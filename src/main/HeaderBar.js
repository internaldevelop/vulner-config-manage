import React from 'react'
// import classNames from 'classnames';
import screenfull from 'screenfull'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import pink from '@material-ui/core/colors/pink';
import IconButton from '@material-ui/core/IconButton';

// import NotificationsIcon from '@material-ui/icons/Notifications';
// import NewTaskIcon from '@material-ui/icons/AddBoxOutlined';
import FullScreenIcon from '@material-ui/icons/FullscreenOutlined';
// import FullScreenExitIcon from '@material-ui/icons/FullscreenExitOutlined';
import LogoutIcon from '@material-ui/icons/ExitToAppOutlined';
import MenuIcon from '@material-ui/icons/Menu';

import { Typography, Row, Col, Tag } from 'antd';

import LogoImage from '../resources/image/logo.jpg'
import HttpRequest from '../utils/HttpRequest';
// import { Logout } from '../components/login/Logout';
import { GetSystemName, GetViewMinWidth } from "../global/environment"

const { Title } = Typography;

const styles = theme => ({
  // headerul: {
  //   display: flex,
  //   width: '200px',
  // },
  menuButton: {
    margin: theme.spacing.unit,
  },
  greenAvatar: {
    margin: 10,
    color: '#fff',
    backgroundColor: green[500],
  },
  pinkAvatar: {
    margin: 10,
    color: '#fff',
    backgroundColor: pink[500],
  },
  trigger: {
    margin: 10,
    color: '#fff',
    backgroundColor: pink[500],
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

//withRouter一定要写在前面，不然路由变化不会反映到props中去
@withRouter @observer @inject('userStore')
@inject("userStore")
class HeaderBar extends React.Component {
  state = {
    title: '',
    subtitle: '',
    icon: 'arrows-alt',
    count: 100,
    visible: false,
    avatar: require('./image/04.jpg')
  }

  componentDidMount() {
    screenfull.onchange(() => {
      this.setState({
        icon: screenfull.isFullscreen ? 'shrink' : 'arrows-alt'
      })
    })
  }

  componentWillUnmount() {
    screenfull.off('change')
  }

  toggle = () => {
    this.props.onToggle()
  }
  screenfullToggle = () => {
    if (screenfull.enabled) {
      screenfull.toggle()
    }
  }

  logoutCB = (data) => {
  }
  logout = () => {
    const { userUuid } = this.props.userStore.loginUser;
    HttpRequest.asyncGet(this.logoutCB, '/users/logout', {user_uuid: userUuid});
    // this.props.appStore.toggleLogin(false)
    // this.props.history.push(this.props.location.pathname)
    const userStore = this.props.userStore;
    userStore.loginUser.isLogin = false;
    let history = this.props.history;
    history.push('/login');
  }

  render() {
    const { classes } = this.props

    return (
      <div id='headerbar' style={{ minWidth: GetViewMinWidth() }}>
        <div style={{ lineHeight: '64px', float: 'left' }}>
          <IconButton className={classes.menuButton} color="primary" aria-label="Open drawer" onClick={this.toggle}>
            <MenuIcon />
          </IconButton>
          {/*TODO, 不显示电科院图标*/}
          <img alt="logo-pic" src={LogoImage} />
          <span style={{ fontSize: 28, marginLeft: '32px' }} color="#108ee9">{GetSystemName()}</span>
        </div>

        <div style={{ lineHeight: '64px', float: 'right' }}>
          <table border="0">
            <tbody>
              <tr>
                <th>
                  <IconButton className={classes.greenAvatar} aria-label="Full Screen" onClick={this.screenfullToggle}>
                    <FullScreenIcon />
                  </IconButton>
                </th>
                <th>
                  <IconButton className={classes.pinkAvatar} aria-label="Logout" onClick={this.logout.bind(this)}>
                    <LogoutIcon />
                  </IconButton>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(HeaderBar);