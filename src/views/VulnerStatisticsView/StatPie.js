import React, { Component } from 'react';
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

class StatPie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            dimensionsData: [],
        }
        this.getStatistics(this.props.name);
    }

    getTitle() {
        let text = '';
        // if (this.props.name === 'type') {
        //     text = '类型统计';
        // } else if (this.props.name === 'verified') {
        //     text = '是否校验统计';
        if (this.props.name === 'discoverer') {
            text = '漏洞厂商分布';
        } else if (this.props.name === 'serverity') {
            text = '风险等级统计';
        } else {
            text = '统计结果';
        }
        return text;
    }

    getOption() {
        const { pieSourceData, dimensionsData } = this.state;
        let text = this.getTitle();
        if (this.props.name === 'serverity') {
            return {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 10,
                    data: dimensionsData,
                },
                series: [
                    {
                        name: '危害等级',
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '40',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: pieSourceData
                    }
                ]
            };            
        } else {
            return {
                //title: { text: text },
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} ({d}%)"
                },
                series: [
                    {
                        type: 'pie',
                        selectedMode: 'single',
                        radius: ['50%', '70%'],
    
                        label: {
                            normal: {
                                // formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                                formatter: '{b|{b}：}{c}  {per|{d}%}  ',
                                // backgroundColor: '#eee',
                                // borderColor: '#aaa',
                                // borderWidth: 1,
                                // borderRadius: 4,
                                rich: {
                                    a: {
                                        color: '#999',
                                        lineHeight: 30,
                                        align: 'center'
                                    },
                                    hr: {
                                        borderColor: '#aaa',
                                        width: '100%',
                                        borderWidth: 0.5,
                                        height: 0
                                    },
                                    b: {
                                        fontSize: 14,
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
    }

    getResultsCB = (data) => {
        const result = data.payload;
        let sourceDatas = [];
        let dimensionsData = [];

        if ((typeof data.payload === "undefined") || (data.payload.length === 0)) {
            return;
        }

        for (let i = 0; i < result.length; i++) {
            // if (i > 5) {
            //     break;
            // }
            let pName = '';
            pName = result[i]._id;
            let myMap = {};
            if (this.props.name === 'serverity') {
                if (i === 0 && pName === '低') {
                    myMap = { 'value': result[i].total, 'name': pName, 'selected': true, itemStyle:{normal:{color:'green'}}};
                } else if (pName === '中'){
                    myMap = { 'value': result[i].total, 'name': pName, itemStyle:{normal:{color:'yellow'}}};
                } else if (pName === '高'){
                    myMap = { 'value': result[i].total, 'name': pName, itemStyle:{normal:{color:'red'}}};
                } else {
                    myMap = { 'value': result[i].total, 'name': pName, itemStyle:{normal:{color:'blue'}}};
                }
            } else if (this.props.name === 'discoverer') {
                if (i == 0) {
                    myMap = { 'value': result[i].total, 'name': pName, 'selected': true };
                } else {
                    myMap = { 'value': result[i].total, 'name': pName };
                }
            }
            sourceDatas.push(myMap);
            dimensionsData.push(pName);
        }

        this.setState({
            pieSourceData: sourceDatas, dimensionsData
        });

    }

    getStatistics(name) {
        if (name === 'discoverer') {
            RestReq.asyncGet(this.getResultsCB, '/fw-bend-server/vuldb/statistics-discoverer');
        } else if (name === 'serverity') {
            RestReq.asyncGet(this.getResultsCB, '/fw-bend-server/vuldb/statistics-level');
        }
    }

    render() {
        return (
            <Card title={this.getTitle()} style={{ height: '100%' }} bodyStyle={{ color: '#DEF2DD' }} bordered headStyle={MAntdCard.headerStyle('green')}>
                <ReactEcharts option={this.getOption()} />
            </Card>
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

