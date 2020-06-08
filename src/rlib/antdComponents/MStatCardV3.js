import React from 'react'
import { Card, Statistic, Tag, Icon, Row, Col } from 'antd'
import MAntdCard from '../props/MAntdCard';
import { SmileTwoTone, HeartTwoTone, CheckCircleTwoTone } from '@ant-design/icons';


class MStatCardV3 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            params: this._initParams(),
        };

        // this.fetchFixedStat();
    }

    _initParams() {
        let params = this.props.myparams;
        if (typeof (params) === 'undefined') {
            params = {};
        }
        // 默认标题
        if (!params.hasOwnProperty('title')) {
            params['title'] = '在此设置标题';
        }

        // 默认值
        if (!params.hasOwnProperty('value')) {
            params['value'] = '???';
        }

        // 默认图标
        if (!params.hasOwnProperty('icon')) {
            params['icon'] = 'setting';
        }

        // 默认背景色
        if (!params.hasOwnProperty('bgColor')) {
            params['bgColor'] = '#5cdbd3';
        }

        // 默认前景色
        if (!params.hasOwnProperty('fgColor')) {
            params['fgColor'] = 'brown';
        }

        // 默认图标色
        if (!params.hasOwnProperty('iconColor')) {
            params['iconColor'] = 'brown';
        }

        return params;
    }

    render() {
        const { params } = this.state;

        return (
            // <Card title={<Tag color={'gold'}>{title}</Tag>} headStyle={MAntdCard.headerStyle('main')}>
            <Card bordered={true} bodyStyle={{ backgroundColor: params.bgColor }}>
            <Row gutter={8}>
                <Col span={6}>
                    {/* <Card bordered={true} bodyStyle={{ backgroundColor: 'white', height: '100%'}}> */}
                        <Icon type={params.icon} theme="twoTone" style={{ fontSize: 48 }} twoToneColor={params.iconColor} />
                    {/* </Card> */}
                </Col>
                <Col span={18}>
                    {/* <Card bordered={false} bodyStyle={{ backgroundColor: params.bgColor }}> */}
                        <Statistic
                            // style={{ marginLeft: 0}}
                            // title={<Tag color={'#faad14'} style={{ fontSize: 20, height: 22 }}>{params.title}</Tag>}
                            title={params.title}
                            // prefix={<Tag color={color}>{level}</Tag>}
                            // suffix={"(" + percent + "%)"}
                            style={{ textAlign: 'center' }}
                            value={params.value}
                            valueStyle={{ fontSize: 32, color: params.fgColor, textAlign: 'center' }}
                            // suffix={params.title}
                        />
                    {/* </Card> */}
                </Col>
            </Row>
            </Card>
        );
    }
}

export default MStatCardV3;
