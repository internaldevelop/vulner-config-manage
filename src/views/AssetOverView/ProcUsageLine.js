import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { observer, inject } from 'mobx-react'

const styles = theme => ({
    root: {
        width: '90%',
    },

});

@inject('assetInfoStore')
@observer
class ProcUsageLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            // percents: props.percents,
        };

        // let infoStore = this.props.assetInfoStore;
        // if (props.name === 'CPU') {
        //     this.setState({ percents: infoStore.procCpuPercents });
        // } else if (props.name === '内存') {
        //     this.setState({ percents: infoStore.procMemPercents });
        // }
    }

    getTooltipFormatter = (data) => {
        var res = this.state.name + '占用率<br/>'
        // for (var i = 0, length = data.length; i < length; i++) {
           res += data.data[0] + '<br/>' 
               + data.data[1] + '%<br/>'
        //  }
         return res
}

    getOptions() {
        const { name } = this.state;
        let infoStore = this.props.assetInfoStore;
        let percents;
        let maxBound;
        if (name === 'CPU') {
            percents = infoStore.procCpuPercents;
            maxBound = 50;
        } else if (name === '内存') {
            percents = infoStore.procMemPercents;
            maxBound = 10;
        }

        return {
            tooltip: {
                formatter: (data) => this.getTooltipFormatter(data)
            },
            dataset: { source: percents },
            grid: { containLabel: true },
            yAxis: {
                name: name === 'CPU' ? '每CPU(%)' : '内存及交换区使用率(%)',
            },
            xAxis: {
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    rotate: 60,
                    formatter: function(value) {
                        return value.slice(0, 6);
                    }
                }
            },
            visualMap: {
                orient: 'vertical',
                top: 'right',
                min: 1,
                max: maxBound,
                text: ['High Score', 'Low Score'],
                // Map the score column to color
                dimension: 2,
                inRange: {
                    color: ['#6FEA87', '#C23531']
                }
            },
            series: [
                {
                    type: 'bar',
                    encode: {
                        // Map the "percent" column to Y axis.
                        y: 'percent',
                        // Map the "procname" column to X axis
                        x: 'procname'
                    }
                }
            ]
        };

    }

    render() {

        let option = this.getOptions();

        return (
            <ReactEcharts option={option} />
        );
    }
}

ProcUsageLine.propTypes = {
    classes: PropTypes.object.isRequired,
};

ProcUsageLine.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(ProcUsageLine);
