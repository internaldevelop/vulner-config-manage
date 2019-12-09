import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Login from './LogIn'
// import LoginBGImage from '../../resources/image/login_bg.jpg'


const styles = theme => ({
    backgroundBox: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        // backgroundImage: 'url(https://github.com/zhangZhiHao1996/image-store/blob/master/react-admin-master/bg1.jpg?raw=false)',
        // backgroundImage: 'url(' + LoginBGImage + ')',
        // backgroundImage: 'url(${LoginBGImage})',
        backgroundSize: '100% 100%',
        // zIndex:1,
        // transition: 'all .5s',
        // backgroundColor: 'rgba(255,255,255,0.5)',
        // background:'rgba(128,128,128,0.5)',
    },
    loginBox: {
        // zIndex:2,
        // backgroundColor: 'rgba(178,178,178,0.5)',
        // background:'#DEF3F4',
        // backface-visibility: hidden,
        // background: linear-gradient(230deg, rgba(53, 57, 74, 0) 0%, rgb(0, 0, 0) 100%);

    },
});

class LoginPage extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <div id='login-page'>
                {/* <div id='bg-image' className={classes.backgroundBox} /> */}
                <div className={classes.loginBox} >
                    <Login />
                </div>
            </div>
        );
    }
}

LoginPage.propTypes = {
    classes: PropTypes.object.isRequired,
};

LoginPage.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(LoginPage);
