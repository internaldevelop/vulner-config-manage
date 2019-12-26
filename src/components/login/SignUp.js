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
import { message, Row, Col, Radio } from 'antd';

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
    width: 600,
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
      alias: '',
      password: '',
      email: '',
      mobile: '',
      gender: 'F',
      showVerifyError: false,
      verifyError: '',

      // sent: false,
      // submitting: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // validate = values => {
  //   const errors = required(['account', 'alias', 'password'], values, this.props);

  //   return errors;
  // };

  addUserCB = (data) => {
    if (data.code === 'ERROR_ACCOUNT_EXIST') {
      this.setState({
        showVerifyError: true,
        verifyError: data.error,
      });
      return;
    } else if (data.code === 'ERROR_INVALID_PARAMETER') {
      this.setState({
        showVerifyError: true,
        verifyError: data.payload[0],
      });
      return;
    }

    // 注册完毕后，跳转到登录页面
    let history = this.context.router.history;
    history.push('/login');
  }

  handleSubmit = event => {
    const { account, alias, password, email, mobile, gender } = this.state;
    event.preventDefault();
    HttpRequest.asyncPost(this.addUserCB, '/system/account/register', { name: account, alias, password, email, mobile, gender, birthday: '2001/12/21' }, false);
  }

  handleAccountChange = event => {
    this.setState({ account: event.target.value });
  }

  handleAliasChange = event => {
    this.setState({ alias: event.target.value });
  }

  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  }

  handleEmailChange = event => {
    this.setState({ email: event.target.value });
  }

  handleMobileChange = event => {
    this.setState({ mobile: event.target.value });
  }

  handleGenderChange = event => {
    this.setState({ gender: event.target.value });
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
          {
              this.state.showVerifyError &&
              <Typography variant="body2" align="center" color='primary'>{this.state.verifyError}</Typography>
          }
          <form className={classes.form} onSubmit={this.handleSubmit.bind(this)} >
            <Row>
              <Col span={12}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel>账号</InputLabel>
                  <Input id="username" name="account" autoFocus value={this.state.account} onChange={this.handleAccountChange.bind(this)} />
                </FormControl>
              </Col>
              <Col span={12}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel>姓名</InputLabel>
                  <Input name="alias" value={this.state.alias} onChange={this.handleAliasChange.bind(this)} />
                </FormControl>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel>密码</InputLabel>
                  <Input id="password" type="password" value={this.state.password} onChange={this.handlePasswordChange.bind(this)} />
                </FormControl>
              </Col>
              <Col span={12}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel>邮箱</InputLabel>
                  <Input value={this.state.email} onChange={this.handleEmailChange.bind(this)} />
                </FormControl>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormControl margin="normal" required fullWidth>
                  <InputLabel>手机号码</InputLabel>
                  <Input name="mobile" type="mobile" id="mobile" value={this.state.mobile} onChange={this.handleMobileChange.bind(this)} />
                </FormControl>
              </Col>
              <Col span={12}>
                <FormControl margin="normal" required fullWidth>
                  <Row>
                    <Col span={10}>
                      <InputLabel>性别</InputLabel>
                    </Col>
                    <Col span={14} style={{ marginTop: 20 }}>
                      <Radio.Group onChange={this.handleGenderChange.bind(this)} value={this.state.gender}>
                        <Radio value={'F'}>女</Radio>
                        <Radio value={'M'}>男</Radio>
                      </Radio.Group>
                    </Col>
                  </Row>
                </FormControl>
              </Col>
            </Row>
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
