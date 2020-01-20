import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Skeleton, Row, Col } from 'antd';
import { observer, inject } from 'mobx-react'
import { withRouter } from 'react-router-dom'


import UserCard from './UserCard'
import RestReq from '../../utils/RestReq';

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
        RestReq.asyncGet(this.getLoginUserCB, '/unified-auth/account_manage/account_info', { account_uuid: userUuid });
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