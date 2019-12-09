import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { Drawer, List, Row, Col } from 'antd';

const styles = theme => ({
    root: {
        width: '90%',
    },

});

class OpenPortsDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            ports: [],
        };
    }

    componentDidMount() {
        // 注册事件
        global.myEventEmitter.addListener('DisplayPortsList', this.displayPortsList);
    }

    componentWillUnmount() {
        // 取消事件
        global.myEventEmitter.removeListener('DisplayPortsList', this.displayPortsList);
    }

    displayPortsList = (data) => {
        this.setState({ visible: true, ports: data });
    }

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    render() {
        const { visible, ports } = this.state;

        return (
            <div>
                <Drawer
                    width={800}
                    title="资产开放端口信息列表"
                    placement="left"
                    closable={true}
                    onClose={this.onClose}
                    visible={visible}
                >
                    <List
                        itemLayout="vertical"
                        size="large"
                        bordered
                        pagination={{
                            onChange: (page) => {
                                console.log(page);
                            },
                            pageSize: 10,
                            position: 'both',
                        }}
                        dataSource={ports}
                        renderItem={item => (
                            <List.Item
                                key={item.index}
                            >
                                <List.Item.Meta
                                    title={'端口：' + item.localPort + '（状态：' + item.status + '）'}
                                />
                                <Row>
                                    <Col span={6}>{'协议：' + item.protocol}</Col>
                                    <Col span={6}>{'本地IP：' + item.localAddr}</Col>
                                    <Col span={6}>{'远程IP：' + item.foreignAddr}</Col>
                                    <Col span={6}>{'远程端口：' + item.foreignPort}</Col>
                                </Row>
                            </List.Item>
                        )}
                    />
                </Drawer>
            </div>
        );
    }
}

OpenPortsDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
};

OpenPortsDrawer.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(OpenPortsDrawer);
