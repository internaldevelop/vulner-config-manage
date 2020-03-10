import React, { Component } from 'react';
import { Modal } from 'antd'
import ReactEcharts from 'echarts-for-react';
// import echarts from 'echarts';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import HttpRequest from '../../utils/HttpRequest';


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
        }
        this.getStatistics(this.props.name);
    }


    getOption() {
        const { dimensionsData, dataSource, seriesBar } = this.state;
        let text = '';
        if (this.props.name === 'years') {
            text = '发布年份统计';
        } else if (this.props.name === 'platform') {
            text = '平台统计';
        } else {
            text = '统计结果';
        }
        return {
            title: { text: text },
            tooltip: {},
            xAxis: {
                type: 'category',
                data: dimensionsData,
            }, yAxis: {
                type: 'value'
            },
            series: [{
                data: dataSource,
                type: 'bar'
            }]
        };
    }

    getResultsCB = (data) => {
        if ((typeof data.payload === "undefined") || (data.payload.length === 0)) {
            return;
        }
        let dataSource = [];
        let dimensionsData = [];
        for (let item of data.payload) {
            if (this.props.name === 'years') {
                dataSource.push(item.count);
                dimensionsData.push(item.year);
            } else if (this.props.name === 'platform') {
                dimensionsData.push(item.platform);
                dataSource.push(item.count);
            }
        }
        this.setState({ dataSource, dimensionsData });
    }

    getStatistics(name) {
        HttpRequest.asyncGet2(this.getResultsCB, '/edb/stat/' + name);
    }

    render() {
        return (
            <ReactEcharts option={this.getOption()} />

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

