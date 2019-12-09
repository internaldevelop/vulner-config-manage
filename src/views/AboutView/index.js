import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { Card, Row, Col, Divider, message } from 'antd'

import SystemImage from '../../resources/image/shield-ok-icon.png'
import { Button } from '@material-ui/core';
import HttpRequest from '../../utils/HttpRequest';
import { GetSystemType, GetSystemName } from "../../global/environment"

const styles = theme => ({
    gridStyle: {
        width: '25%',
        textAlign: 'center',
    },
});
const gridStyle = {
    width: '90%',
    textAlign: 'center',
    marginLeft: '5%',
    marginBottom: 8
};

class AboutView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sysInfoReady: false,
            sysInfo: {},
        }
        // axios({
        //     method: 'post',
        //     url: 'https://www.easy-mock.com/mock/59801fd8a1d30433d84f198c/example/user/login',
        //     data: {
        //         uid: 1011,
        //     }            
        // })
        // .then((data) => {
        //     console.log(data);//输出返回的数据
        // })
        // axios.get('https://www.easy-mock.com/mock/59801fd8a1d30433d84f198c/example/user/all')
        // .then((data) => {
        //     console.log(data);//输出返回的数据
        // })
        // axios.post('https://www.easy-mock.com/mock/59801fd8a1d30433d84f198c/example/user/login', {uid: 1011})
        // .then((data) => {
        //     console.log(data);//输出返回的数据
        // })
        this.GetSystemInfo();
    }

    GetSystemInfoCB = (data) => {
        this.setState({
            sysInfo: data.payload,
            sysInfoReady: true,
        });
    }

    GetSystemInfo() {
        let params = { sys_type: GetSystemType() };
        HttpRequest.asyncGet(this.GetSystemInfoCB, '/sysinfo/version', params);
    }

    render() {
        const { sysInfo, sysInfoReady } = this.state;
        if (!sysInfoReady) {
            return (<div><Button onClick={this.GetSystemInfo.bind(this)}>刷新</Button></div>);
        } else {
            return (
                <div>
                    <Row type="flex" justify="space-between">
                        <Col span={8} offset={8}>
                            <Card
                                style={{ width: 450, margin: 8 }}
                                cover={<span style={{ textAlign: 'center' }}><img alt="systemicon" style={{ width: '40%', height: '40%' }} src={SystemImage} /></span>}
                            >
                                {/* <Meta
                                title={ sysInfo.sysName }
                                description={ sysInfo.desc }
                            /> */}
                                <Card.Grid style={gridStyle}>
                                    {/* <span style={{ color: 'blue', fontSize: '24px' }}>{sysInfo.sysName} <br /></span> */}
                                    <span style={{ color: 'blue', fontSize: '24px' }}>{GetSystemName()} <br /></span>
                                    <span style={{ textAlign: 'left' }}>{sysInfo.desc} <br /></span>
                                    <Divider dashed />
                                    {"系统版本: " + sysInfo.sysVer} <br />
                                    {"版权：" + sysInfo.copyright}
                                </Card.Grid>
                                <Card.Grid style={gridStyle}>{"系统状态: " + sysInfo.status}</Card.Grid>
                                <Card.Grid style={gridStyle}>{"系统概况: " + sysInfo.overview}</Card.Grid>
                            </Card>
                        </Col>
                    </Row>
                </div>
            );
        }
    }
}

AboutView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(AboutView);