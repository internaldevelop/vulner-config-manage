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

// var dataSource = [];
var MAX_COUNT = 60;
var TIME_GAP = 3000;

@inject('assetInfoStore')
@observer
class HistoryUsageLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            dataSource: [],
        };
        this.initDataSource();
    }

    initDataSource = () => {
        const { dataSource } = this.state;
        if (dataSource.length > 0) {
            return;
        }
        let now = new Date();
        let startTime = now.getTime();
        startTime -= MAX_COUNT * TIME_GAP;
        for (let i=0; i<MAX_COUNT; i++) {
            now.setTime(startTime + i * TIME_GAP);
            dataSource.push({time: this.formatTimeStr(now), value: 0.0});
        }
    }

    formatTimeStr = (time) => {
        let _hour = ( 10 > time.getHours() ) ? '0' + time.getHours() : time.getHours();
        let _minute = ( 10 > time.getMinutes() ) ? '0' + time.getMinutes() : time.getMinutes();
        let _second = ( 10 > time.getSeconds() ) ? '0' + time.getSeconds() : time.getSeconds();
        return _hour + ':' + _minute + ':' + _second;
    }
    getCurrentTime = () => {
        let now1 = new Date();
        return this.formatTimeStr(now1);
        //let _month = ( 10 > (now.getMonth()+1) ) ? '0' + (now.getMonth()+1) : now.getMonth()+1;
        //let _day = ( 10 > now.getDate() ) ? '0' + now.getDate() : now.getDate();
    }

    saveRealTimeList = (usedPercent) => {
        const { dataSource } = this.state;
        //let dataSource = this.state;
        dataSource.push({time: this.getCurrentTime(), value: usedPercent});
        if (dataSource.length > MAX_COUNT) {
            dataSource.shift();
        }
    }

    getOption() {
        const { name, dataSource } = this.state;
        let infoStore = this.props.assetInfoStore;
        let usedPercent = 0.0;
        let itemStyle;
        let usageData;
        if (name === 'CPU') {
            usageData = infoStore.historyCpuPercents;
            if (infoStore.cpuUsed !== null && infoStore.cpuUsed !== undefined) {
                usedPercent = infoStore.cpuUsed.toFixed(4);
            }
            itemStyle = {
                normal: {
                    color: '#289df5', // 折线条的颜色
                    borderColor: '#289df5', // 拐点边框颜色
                    areaStyle: {
                        type: 'default',
                        opacity: 0.1
                    }
                }
            };
        } else if (name === '内存') {
            usageData = infoStore.historyMemPercents;
            if (infoStore.memUsed !== null && infoStore.memUsed !== undefined) {
                usedPercent = infoStore.memUsed.toFixed(4);
            }
            itemStyle = {
                normal: {
                    color: '#fbc01b',
                    borderColor: '#fbc01b',
                    areaStyle: {
                        type: 'default',
                        opacity: 0.1
                    }
                }
            };
        } else if (name === '硬盘') {
            usageData = infoStore.historyDiskPercents;
            if (infoStore.diskUsed !== null && infoStore.diskUsed !== undefined) {
                usedPercent = infoStore.diskUsed.toFixed(5);
            }
            itemStyle = {
                normal: {
                    color: '#ff5050',
                    borderColor: '#ff5050',
                    areaStyle: {
                        type: 'default',
                        opacity: 0.1
                    }
                }
            };
        }
        if (this.props.type === 'dataSrcFromNow' || usageData.length <= 0) {
            if (this.props.type === 'dataSrcFromDB') {
                usedPercent = 0.0;
            }
            this.saveRealTimeList(usedPercent);
            usageData = dataSource;
        }
        
        return {
            tooltip: {
                //formatter: (data) => this.getTooltipFormatter(data)
            },
            dataset: { source: usageData },
            grid: { containLabel: true },

            yAxis: {
                name: name + '使用率',
            },
            xAxis: {
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    formatter: function (value) {
                        return value;
                    }
                }
            },
            series: [
                {
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    encode: {
                        // Map the "value" column to Y axis.
                        y: 'value',
                        // Map the "time" column to X axis
                        x: 'time'
                    },
                    areaStyle: {},
                    itemStyle,
                }
            ]
        };
    }

    render() {
        let option = this.getOption();
        return (
            <ReactEcharts option={option} />
        );
    }

}

HistoryUsageLine.propTypes = {
    classes: PropTypes.object.isRequired,
};

HistoryUsageLine.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(HistoryUsageLine);
