import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import MEvent from '../utils/MEvent';

export default class MGauge extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            value: 0,
            extraParams: this.initExtraParams(),
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

    handleUpdateData(value) {
        this.setState({ value });
    }

    initExtraParams() {
        let extraParams = {};
        if (!this.props.hasOwnProperty('extraParams')) {
            extraParams = {};
        } else {
            extraParams = this.props.extraParams;
        }

        return extraParams;
    }

    getOption() {
        const { name, value } = this.state;
        let fixedValue = (value * 100).toFixed(2) - 0;
        return {
            // backgroundColor: "#000",
            tooltip: {
                formatter: "{b} : {c}"
            },
            grid: {
                left : '1%',   //组件离容器左侧的距离
                right : '1%',
                bottom : '1%',
                top: '0%',
                height: 120,
                containLabel: true     //grid 区域是否包含坐标轴的刻度标签
            },
            series: [
                {
                    name: name,
                    type: 'gauge',
                    center: ['50%', '30%'],
                    radius: "100%",
                    detail: { formatter: '{value}%', textStyle: { fontSize: 24 } },
                    splitNumber: 10,         // 仪表盘刻度的分割段数,默认 10。
                    axisLine: {				// 仪表盘轴线(轮廓线)相关配置。
                        show: true,				// 是否显示仪表盘轴线(轮廓线),默认 true。
                        lineStyle: {			// 仪表盘轴线样式。
                            // color: colorTemplate1, 	//仪表盘的轴线可以被分成不同颜色的多段。每段的  结束位置(范围是[0,1]) 和  颜色  可以通过一个数组来表示。默认取值：[[0.2, '#91c7ae'], [0.8, '#63869e'], [1, '#c23531']]
                            opacity: 1,					//图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                            width: 5,					//轴线宽度,默认 30。
                            shadowBlur: 20,				//(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。 
                            shadowColor: "#fff",		//阴影颜色。支持的格式同color。
                        }
                    },
                    splitLine: {			// 分隔线样式。
                        show: true,				// 是否显示分隔线,默认 true。
                        length: '20%',				// 分隔线线长。支持相对半径的百分比,默认 30。
                        lineStyle: {			// 分隔线样式。
                            color: "#eee",				//线的颜色,默认 #eee。
                            opacity: 1,					//图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                            width: 2,					//线度,默认 2。
                            type: "solid",				//线的类型,默认 solid。 此外还有 dashed,dotted
                            shadowBlur: 10,				//(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。 
                            shadowColor: "#fff",		//阴影颜色。支持的格式同color。
                        }
                    },

                    axisTick: {				// 刻度(线)样式。
                        show: true,				// 是否显示刻度(线),默认 true。
                        splitNumber: 5,			// 分隔线之间分割的刻度数,默认 5。
                        length: '10%',				// 刻度线长。支持相对半径的百分比,默认 8。
                        // lineStyle: {			// 刻度线样式。	
                        //     color: "#eee",				//线的颜色,默认 #eee。
                        //     opacity: 1,					//图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                        //     width: 1,					//线度,默认 1。
                        //     // type: "solid",				//线的类型,默认 solid。 此外还有 dashed,dotted
                        //     // shadowBlur: 10,				//(发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。 
                        //     // shadowColor: "#fff",		//阴影颜色。支持的格式同color。
                        // },
                    },
                    axisLabel: {			// 刻度标签。
                        show: true,				// 是否显示标签,默认 true。
                        distance: 5,			// 标签与刻度线的距离,默认 5。
                        color: "#fff",			// 文字的颜色,默认 #fff。
                        fontSize: 16,			// 文字的字体大小,默认 5。
                        formatter: "{value}",	// 刻度标签的内容格式器，支持字符串模板和回调函数两种形式。 示例:// 使用字符串模板，模板变量为刻度默认标签 {value},如:formatter: '{value} kg'; // 使用函数模板，函数参数分别为刻度数值,如formatter: function (value) {return value + 'km/h';}
                    },
                    pointer: {				// 仪表盘指针。
                        show: true,				// 是否显示指针,默认 true。
                        length: "90%",			// 指针长度，可以是绝对数值，也可以是相对于半径的百分比,默认 80%。
                        width: 4,				// 指针宽度,默认 8。
                    },
                    // itemStyle: {			// 仪表盘指针样式。
                    //     color: "auto",			// 指针颜色，默认(auto)取数值所在的区间的颜色
                    //     opacity: 1,				// 图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形。
                    //     borderWidth: 0,			// 描边线宽,默认 0。为 0 时无描边。
                    //     borderType: "solid",	// 柱条的描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'。
                    //     borderColor: "#000",	// 图形的描边颜色,默认 "#000"。支持的颜色格式同 color，不支持回调函数。
                    //     shadowBlur: 10,			// (发光效果)图形阴影的模糊大小。该属性配合 shadowColor,shadowOffsetX, shadowOffsetY 一起设置图形的阴影效果。 
                    //     shadowColor: "#fff",	// 阴影颜色。支持的格式同color。
                    // },
                    // emphasis: {				// 高亮的 仪表盘指针样式
                    //     itemStyle: {
                    //         //高亮 和正常  两者具有同样的配置项,只是在不同状态下配置项的值不同。
                    //     }
                    // },
                    // title: {				// 仪表盘标题。
                    //     show: true,				// 是否显示标题,默认 true。
                    //     offsetCenter: [0,"20%"],//相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                    //     color: "#fff",			// 文字的颜色,默认 #333。
                    //     fontSize: 20,			// 文字的字体大小,默认 15。
                    // },
                    // detail: {				// 仪表盘详情，用于显示数据。
                    //     show: true,				// 是否显示详情,默认 true。
                    //     offsetCenter: [0,"50%"],// 相对于仪表盘中心的偏移位置，数组第一项是水平方向的偏移，第二项是垂直方向的偏移。可以是绝对的数值，也可以是相对于仪表盘半径的百分比。
                    //     color: "auto",			// 文字的颜色,默认 auto。
                    //     fontSize: 30,			// 文字的字体大小,默认 15。
                    //     formatter: "{value}%",	// 格式化函数或者字符串
                    // },
                        data: [{ value: fixedValue, name }]
                }
            ]
        };
    }

    render() {
        const { extraParams } = this.state;
        let option = this.getOption();

        if (extraParams.hasOwnProperty('height')) {
            return (<div style={{ height: extraParams['height'] }}>
                <ReactEcharts option={option} />
            </div>)
        } else {
            return (<ReactEcharts option={option} />);
        }
    }

}


