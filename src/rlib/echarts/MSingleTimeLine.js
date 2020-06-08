import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import MTimeUtils from '../utils/MTimeUtils';
import MEvent from '../utils/MEvent';

var MAX_COUNT = 60;
var TIME_GAP = 3000;
var DEFAULT_LINE_COLOR = '#289df5';
var DEFAULT_OPACITY = 0.1;

export default class MSingleTimeLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            extraParams: this.initExtraParams(),
            dataSource: this.initDataSource(),
        };

        this.handleUpdateData = this.handleUpdateData.bind(this);
    }

    componentDidMount() {
        // 注册事件
        const { extraParams } = this.state;
        if (extraParams.hasOwnProperty('updateEvent')) {
            MEvent.register(extraParams.updateEvent, this.handleUpdateData);
        }
    }

    componentWillUnmount() {
        // 注销事件
        const { extraParams } = this.state;
        if (extraParams.hasOwnProperty('updateEvent')) {
            MEvent.unregister(extraParams.updateEvent, this.handleUpdateData);
        }
    }

    handleUpdateData(usage) {
        const { dataSource } = this.state;
        this.pushNewUsage(dataSource, usage.time, usage.data);
        this.setState({ dataSource });
    }

    initExtraParams() {
        let extraParams = {};
        if (!this.props.hasOwnProperty('extraParams')) {
            extraParams = {
                lineColor: DEFAULT_LINE_COLOR,
                borderColor: DEFAULT_LINE_COLOR,
                opacity: DEFAULT_OPACITY
            }
        } else {
            extraParams = this.props.extraParams;
        }

        if (!extraParams.hasOwnProperty('lineColor')) { extraParams['lineColor'] = DEFAULT_LINE_COLOR; }
        if (!extraParams.hasOwnProperty('borderColor')) { extraParams['borderColor'] = extraParams['lineColor']; }
        if (!extraParams.hasOwnProperty('opacity')) { extraParams['opacity'] = DEFAULT_OPACITY; }

        return extraParams; 
    }

    initDataSource = () => {
        let dataSource = [];
        // let tm = new Date();
        // let startTime = tm.getTime();
        // startTime -= MAX_COUNT * TIME_GAP;
        // for (let i = 0; i < MAX_COUNT; i++) {
        //     tm.setTime(startTime + i * TIME_GAP);
        //     dataSource.push({ time: this.formatTime(tm), value: 1.0 });
        // }

        if (!this.props.hasOwnProperty('usagesList')) {
            return dataSource;
        }

        for (let usage of this.props.usagesList) {
            this.pushNewUsage(dataSource, usage.time, usage.data);
        }

        return dataSource;
    }

    formatTime(tm) {
        return MTimeUtils.formatStr(tm, 'hh:mm:ss');
    }

    pushNewUsage = (dataSource, timeStr, data) => {
        let tm = MTimeUtils.parse(timeStr);
        dataSource.push({ time: this.formatTime(tm), value: data });
        if (dataSource.length > MAX_COUNT) {
            dataSource.shift();
        }
    }

    getTooltipFormatter = (contents) => {
        let res = this.state.name + '<br/>';
        for (let index in contents) {
            let data = contents[index].data;
            res += data.time + '<br/>';
            res += data.value + '%<br/>';
        }

        return res;
    }

    getOption() {
        const { name, dataSource, extraParams } = this.state;
        let itemStyle = {
            normal: {
                color: extraParams.lineColor, // 折线条的颜色
                borderColor: extraParams.borderColor, // 拐点边框颜色
            }
        };
        let areaStyle = {
            type: 'default',
            opacity: extraParams.opacity
        }

        let options = {
            tooltip: {
                trigger: 'axis',
                // triggerOn: 'none',
                showContent: true,
                // alwaysShowContent: true,
                axisPointer: { type: 'cross' },
                formatter: (contents) => this.getTooltipFormatter(contents)
            },
            dataset: { source: dataSource },
            yAxis: { name: name, },
            xAxis: {
                type: 'category',
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    formatter: function (value) { return value; }
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
                    areaStyle,
                    itemStyle,
                }
            ]
        };

        if (extraParams.hasOwnProperty('height')) {
            options.grid = {
                left : '1%',   //组件离容器左侧的距离
                right : '1%',
                bottom : '1%',
                top: '10%',
                height: extraParams['height'] - 30,
                containLabel : true     //grid 区域是否包含坐标轴的刻度标签
            }
        } else {
            options.grid = { containLabel : true }
        }

        return options;
    }

    render() {
        const { extraParams } = this.state;
        let hasHeight = extraParams.hasOwnProperty('height');

        let option = this.getOption();
        if (hasHeight) {
            return (<div style={{ height: extraParams['height'] }}>
                <ReactEcharts option={option} />
            </div>)
        } else {
            return (<ReactEcharts option={option} />);
        }
    }

}
