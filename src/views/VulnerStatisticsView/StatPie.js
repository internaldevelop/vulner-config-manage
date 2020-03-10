import React, { Component } from 'react';
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

class StatPie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            dimensionsData: [],
        }
        this.getStatistics(this.props.name);
    }

    getOption() {
        const { pieSourceData } = this.state;
        let text = '';
        if (this.props.name === 'type') {
            text = '类型统计';
        } else if (this.props.name === 'verified') {
            text = '是否校验统计';
        } else {
            text = '统计结果';
        }
        return {
            title: { text: text },
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            series: [
                {
                    type:'pie',
                    selectedMode: 'single',
                    radius: ['20%', '50%'],
        
                    label: {
                        normal: {
                            // formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                            formatter: '{b|{b}：}{c}  {per|{d}%}  ',
                            backgroundColor: '#eee',
                            borderColor: '#aaa',
                            borderWidth: 1,
                            borderRadius: 4,
                            rich: {
                                a: {
                                    color: '#999',
                                    lineHeight: 22,
                                    align: 'center'
                                },
                                hr: {
                                    borderColor: '#aaa',
                                    width: '100%',
                                    borderWidth: 0.5,
                                    height: 0
                                },
                                b: {
                                    fontSize: 16,
                                    lineHeight: 33
                                },
                                per: {
                                    color: '#eee',
                                    backgroundColor: '#334455',
                                    padding: [2, 4],
                                    borderRadius: 2
                                }
                            }
                        }
                    },
                    data: pieSourceData
                },

            ]

        };
    }

    getResultsCB = (data) => {
        const result = data.payload;
        let sourceDatas = [];

        if ((typeof data.payload === "undefined") || (data.payload.length === 0)) {
            return;
        }

        for (let i = 0; i < result.length; i++) {
            if (i > 5) {
                break;
            }
            let pName = '';
            if (this.props.name === 'type') {
                pName = result[i].type;
            } else if (this.props.name === 'verified') {
                pName = result[i].verified;
            }
            let myMap = {};
            if (i == 0) {
                myMap = {'value' : result[i].count, 'name' : pName, 'selected' : true};
            } else {
                myMap = {'value' : result[i].count, 'name' : pName};
            }
            sourceDatas.push(myMap);
        }
               
        this.setState({
            pieSourceData: sourceDatas,
        });

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

StatPie.propTypes = {
    classes: PropTypes.object.isRequired,
};

StatPie.contextTypes = {
    router: PropTypes.object.isRequired
};

export default withStyles(styles)(StatPie);

