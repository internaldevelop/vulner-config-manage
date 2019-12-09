import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { userType } from '../../global/enumeration/UserType'
// import green from '@material-ui/core/colors/green';
// import pink from '@material-ui/core/colors/pink';
// import blue from '@material-ui/core/colors/blue';

import { Skeleton, List, Avatar, Row, Col, Button, Popconfirm, Icon } from 'antd';

import UserCard from './UserCard'
import HttpRequest from '../../utils/HttpRequest';

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
    selectedItem: {
        // backgroundColor: blue[100],
        backgroundColor: "white",
    },
    unselectedItem: {
        // backgroundColor: 'rgba(178,178,178,0.5)',
    },
    shade: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#808080',
        opacity: 0.95,
        display: 'block',
        zIndex: 999,
    },
});

@inject('userStore')
@observer
class UsersManageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedAccID: -1,
            usersDataReady: false,
            users: {},
            usersList: {},
        }
        this.getUsers();
    }

    onClick = (event, index) => {
        // message.info(`选中用户（ID为${index}）`);
        this.setState({
            selectedAccID: index,
        });
    }

    deleteUserCB = (data) => {
        this.getUsers();
    }

    onDelete = (event, index) => {
        const { users } = this.state;
        HttpRequest.asyncPost(this.deleteUserCB, '/users/remove', { uuid: users[index].uuid });
    }

    generateUserList(users) {
        const listData = [];
        if ((typeof users === "undefined") || (users.length === 0)) {
            return listData;
        }

        for (let i = 0; i < users.length; i++) {
            listData.push({
                // href: 'http://ant.design',
                index: i,
                title: users[i].name,
                avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                description: '在线，有效期截止至2020年12月1日',
                content: '账号：' + users[i].account + '地址：' + users[i].address + '电话：' + users[i].phone,
                user_group: users[i].user_group,
            })
        }
        return listData;
    }

    getUsersCB = (data) => {
        this.setState({
            users: data.payload,
            usersDataReady: true,
            usersList: this.generateUserList(data.payload),
            selectedAccID: 0,
        });
    }

    getUsers() {
        HttpRequest.asyncGet(this.getUsersCB, '/users/all');
    }

    userListBox() {
        const { classes } = this.props;
        const { selectedAccID, usersList } = this.state;
        const userStore = this.props.userStore;
        return (
            <List
                itemLayout="vertical"
                size="large"
                bordered
                pagination={{
                    onChange: (page) => {
                        console.log(page);
                    },
                    pageSize: 3,
                }}
                dataSource={usersList}
                renderItem={item => (
                    <List.Item
                        className={(item.index === selectedAccID) ? classes.selectedItem : classes.unselectedItem}
                        key={item.title}
                    // actions={[<IconText type="star-o" text="156" />, <IconText type="like-o" text="156" />, <IconText type="message" text="2" />]}
                    // extra={<Button onClick={event => this.onClick(event, item.index)}>详情<Icon type="right" /></Button>}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={item.title}
                            description={item.description}
                        />
                        <Row>
                            <Col span={16}>{item.content}</Col>
                            <Col span={4} offset={4}>
                                <Button onClick={event => this.onClick(event, item.index)}>详情<Icon type="right" /></Button>
                                <Popconfirm title="确定要删除该用户吗？" onConfirm={event => this.onDelete(event, item.index)} okText="确定" cancelText="取消">
                                {item.user_group !== 99 && <Button>删除</Button>}
                            </Popconfirm>

                                
                            </Col>
                        </Row>
                    </List.Item>
                )}
            />
        );
    }

    render() {
        const { usersDataReady, selectedAccID, users } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        let userUuid;
        if (selectedAccID >= 0)
            userUuid = users[selectedAccID].uuid;
        // let user = users[selectedAccID];
        return (
            <div>
                <Skeleton loading={!userStore.isAdminUser} active avatar>
                    {
                        usersDataReady && selectedAccID >= 0 &&
                        <Row>
                            <Col span={8}>
                                {this.userListBox()}
                            </Col>
                            <Col span={16}>
                                <UserCard uuid={userUuid} manage={1} />
                            </Col>
                        </Row>
                    }
                </Skeleton>
            </div>
        );
    }
}


UsersManageView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(UsersManageView);