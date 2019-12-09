import withRoot from '../../modules/auxliary/withRoot';
// --- Post bootstrap -----
import React from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '../../modules/components/Typography';
import { required } from '../../modules/form/validation';
import { CssBaseline } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import NewAccountIcon from '@material-ui/icons/PersonAddOutlined';
import Paper from '@material-ui/core/Paper';

import LoginBGImage from '../../resources/image/login_bg.jpg'
import HttpRequest from '../../utils/HttpRequest';
import { errorCode } from '../../global/error';
import { isContainSpecialCharacter } from '../../utils/ObjUtils'
import { message } from 'antd';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  mainpaper: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundImage: 'url(' + LoginBGImage + ')',
    backgroundSize: '100% 100%',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    // backgroundColor: 'rgba(178,178,178,0.5)',
    // background: 'rgba(178,178,178,0.5)',
  },
  paper: {
    width: 400,
    marginTop: theme.spacing.unit * 8,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    // transition: 'all 1s',
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
});

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      userName: '',
      password: '',
      showVerifyError: false,
      verifyError: '',

      // sent: false,
      // submitting: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  validate = values => {
    const errors = required(['account', 'username', 'password'], values, this.props);

    return errors;
  };

  addUserCB = (data) => {
    if (data.code === errorCode.ERROR_USER_REGISTERED) {
      // 用户已存在，已注册过
      this.setState({
        showVerifyError: true,
        verifyError: '用户账号已存在，请用其它账号注册',
      });
      return;
    } 

    // 注册完毕后，跳转到登录页面
    let history = this.context.router.history;
    history.push('/login');
  }

  handleSubmit = event => {
    const { account, userName, password } = this.state;
    event.preventDefault();
    if ((account.length === 0) || (userName.length === 0) || (password.length === 0)) {
      message.info('账号、姓名或者密码不能为空，请重新输入');
      return;
    }
    if (!this.checkData()) {
      return;
  }
    HttpRequest.asyncPost(this.addUserCB, '/users/add', { account: account, name: userName, password, user_group: 1 }, false);
  }

  checkData() {
    const { account, userName, password } = this.state;
    if (account === null || account === '') {
        message.info('账号不能为空，请重新输入');
        this.setState ({account: ''});
        return false;
    } else if (account.length > 20) {
        message.info('账号长度不能超过20，请重新输入');
        this.setState ({account: ''});
        return false;
    } else if (isContainSpecialCharacter(account)) {
        message.info('账号含有特殊字符，请重新输入');
        this.setState ({account: ''});
        return false;
    } else if (userName === null || userName === '' || userName === ' ') {
          message.info('姓名不能为空，请重新输入');
          this.setState ({userName: ''});
          return false;
      } else if (userName.length > 20) {
          message.info('姓名长度不能超过20，请重新输入');
          this.setState ({userName: ''});
          return false;
      } else if (isContainSpecialCharacter(userName)) {
          message.info('姓名含有特殊字符，请重新输入');
          this.setState ({userName: ''});
          return false;
        } else if (password === null || password === '' || password === ' ') {
          message.info('密码不能为空，请重新输入');
          this.setState ({password: ''});
          return false;
      } else if (password.length > 20) {
          message.info('密码长度不能超过20，请重新输入');
          this.setState ({password: ''});
          return false;
      }
    return true;
  }

  handleAccountChange = event => {
    this.setState({ account: event.target.value });
  }

  handleUserNameChange = event => {
    this.setState({ userName: event.target.value });
  }

  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  }


  render() {
    const { classes } = this.props;

    return (
      <Paper className={classes.mainpaper}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <NewAccountIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            注册
          </Typography>
          <form className={classes.form} onSubmit={this.handleSubmit.bind(this)} >
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="account">账号</InputLabel>
              <Input id="account" name="account" autoFocus value={this.state.account} onChange={this.handleAccountChange.bind(this)} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="username">姓名</InputLabel>
              <Input id="username" name="username" autoFocus value={this.state.userName} onChange={this.handleUserNameChange.bind(this)} />
            </FormControl>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">密码</InputLabel>
              <Input name="password" type="password" id="password" autoComplete="current-password" value={this.state.password} onChange={this.handlePasswordChange.bind(this)} />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              注册
            </Button>
          </form>
          <React.Fragment>
            {
              this.state.showVerifyError &&
              <Typography variant="body2" align="center" color='primary'>{this.state.verifyError}</Typography>
            }
            <Typography variant="body2" align="center">
              {'已有账号？  '}
              <Link href="./#/login" align="center" underline="always">
                返回登录
              </Link>
            </Typography>
          </React.Fragment>
        </Paper>
      </Paper>
    );
  }
}

SignUp.propTypes = {
  classes: PropTypes.object.isRequired,
};

SignUp.contextTypes = {
  router: PropTypes.object.isRequired
};

export default compose(
  withRoot,
  withStyles(styles),
)(SignUp);
