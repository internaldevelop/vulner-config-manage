import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Skeleton, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react'
import { userType } from '../../global/enumeration/UserType'
// import UserStore from '../../main/store/UserStore';
import { withRouter } from 'react-router-dom'


import UserCard from './UserCard'
import HttpRequest from '../../utils/HttpRequest';

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
});

@withRouter
@observer
@inject('userStore')
class UserInfoView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            userDataReady: false,
        };
        this.getLoginUser();
    }

    getLoginUserUuid() {
        const userStore = this.props.userStore;
        return userStore.loginUser.uuid;
        // return '4bac0683-a076-41ba-a12b-ba4078f52dac';
    }

    getUserInfo () {
        const userStore = this.props.userStore;
        this.setState({
            userDataReady: true,
        });
    }

    getLoginUserCB = (data) => {
        this.setState({
            user: data.payload,
            userDataReady: true,
        });
    }

    getLoginUser() {
        let userUuid = this.getLoginUserUuid();
        // TODO 登录的时候用户信息已经存到userStore里面，直接从userStore获取数据，目前根据uuid取用户信息接口暂时没有
        this.getUserInfo();
        //HttpRequest.asyncGet(this.getLoginUserCB, '/users/user-by-uuid', { uuid: userUuid });
    }

    render() {
        const { user, userDataReady } = this.state;
        const userStore = this.props.userStore;
        return (
            <div>
                {
                    //userDataReady &&
                    <Row>
                        <Col span={16} offset={4}>
                            <UserCard uuid={userStore.loginUser.uuid} manage={0} />
                        </Col>
                    </Row>
                }
            </div>
        );
    }
}

UserInfoView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(UserInfoView);