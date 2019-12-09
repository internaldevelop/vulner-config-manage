import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { observer, inject } from 'mobx-react'

import { Col } from 'antd';

const styles = theme => ({
    root: {
        width: '90%',
    },

});

@inject('assetInfoStore')
@observer
class UsageGauge extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            // percent: props.percent,
        };
    }

    getOption() {
        const { name } = this.state;
        return {
            tooltip : {
                formatter: "{a} <br/>{b} : {c}%"
            },
            series: [
                {
                    name: '使用率',
                    type: 'gauge',
                    radius: "90%",
                    detail: {formatter:'{value}%'},
                    data: [{value: 50, name}]
                }
            ]
        };
    }

    render() {
        let infoStore = this.props.assetInfoStore;
        let percent = infoStore.cpuUsed;
        const { name } = this.state;
        if (name === 'CPU') {
            percent = infoStore.cpuUsed;
        } else if (name === '内存') {
            percent = infoStore.memUsed;
        } else if (name === '硬盘') {
            percent = infoStore.diskUsed;
        }
        
        let option = this.getOption();
        option.series[0].data[0].value = (percent * 100).toFixed(2) - 0;

        return (
            <ReactEcharts option={option} />
            // <div style={{minWidth: '600px', minHeight: '400px'}}>
            //     <Col span={8}>
            // <ReactEcharts option={option} />
            // </Col>
            // <Col span={16}>
            // <ReactEcharts option={option} />
            // </Col>
            // </div>
        );
    }

}


UsageGauge.propTypes = {
    classes: PropTypes.object.isRequired,
};

UsageGauge.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(UsageGauge);
