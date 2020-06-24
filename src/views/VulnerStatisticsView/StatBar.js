import React, { Component } from 'react';
import { Modal } from 'antd'
import ReactEcharts from 'echarts-for-react';
// import echarts from 'echarts';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import RestReq from '../../utils/RestReq';
import MAntdCard from '../../rlib/props/MAntdCard';
import { Card } from 'antd';


const styles = theme => ({
    root: {
        width: '90%',
    },

});

class StatBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            dimensionsData: [],
            legendSource: [],
        }
        this.getStatistics(this.props.name);
    }

    getTitle() {
        let text = '';
        // if (this.props.name === 'years') {
        //     text = '发布年份统计';
        // } else if (this.props.name === 'platform') {
        //     text = '平台统计';
        if (this.props.name === 'years') {
            text = '工控漏洞趋势';
        } else if (this.props.name === 'discoverer_years') {
            text = '主要厂商公开漏洞趋势'
        } else {
            text = '统计结果';
        }
        return text;
    }


    getOption() {
        const { dimensionsData, dataSource, legendSource } = this.state;
        let text = this.getTitle();
        if (this.props.name === 'discoverer_years') {
            return {
                //title: { text: text },
                tooltip: { trigger: 'axis' },
                legend: {
                    data: legendSource
                },
                xAxis: {
                    type: 'category',
                    data: dimensionsData
                }, yAxis: {
                    type: 'value'
                },
                series: dataSource
            };
        } else {
            return {
                //title: { text: text },
                tooltip: {},
                xAxis: {
                    type: 'category',
                    data: dimensionsData
                }, yAxis: {
                    type: 'value'
                },
                series: [{
                    data: dataSource,
                    type: 'bar'
                }]
            };
        }
    }

    getResultsYearCB = (data) => {
        if ((typeof data.payload === "undefined") || (data.payload.length === 0)) {
            return;
        }
        let dataSource = [];
        let dimensionsData = [];
        for (let item of data.payload) {
            dataSource.push(item.total);
            dimensionsData.push(item._id);
        }
        this.setState({ dataSource, dimensionsData });
    }

    getResultsDiscovererCB = (data) => {
        if ((typeof data.payload === "undefined") || (data.payload.length === 0)) {
            return;
        }
        let dataSource = [];
        let dimensionsData = [];
        let legendSource = [];
        for (let key in data.payload) {
            // let key in 和 of 的区别不仅在于前者指的是真正的key后者是一个item
            // 还在于使用范围不一样，后者只能在数组中使用，前者可以在list和数组中使用
            let item = data.payload[key];
            legendSource.push(key);
            let yearData = [];
            for(let yearKey in item) {
                if (dimensionsData.indexOf(yearKey) < 0) {
                    dimensionsData.push(yearKey);
                }
                yearData.push(item[yearKey]);
            }
            let seriesData = { name: key, type: 'line', stack: '总量', data: yearData};
            dataSource.push(seriesData);
        }
        this.setState({ dataSource, dimensionsData, legendSource });
    }

    getStatistics(name) {
        if (name === 'years') {
            RestReq.asyncGet(this.getResultsYearCB, '/fw-bend-server/vuldb/statistics-year');
        } else if (name === 'discoverer_years') {
            RestReq.asyncGet(this.getResultsDiscovererCB, '/fw-bend-server/vuldb/statistics-trend');
        }
    }

    render() {
        return (
            <Card title={this.getTitle()} style={{ height: '100%' }} headStyle={MAntdCard.headerStyle('green')}>
                <ReactEcharts option={this.getOption()} />
            </Card>
        );
    }
}

StatBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

StatBar.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(StatBar);

