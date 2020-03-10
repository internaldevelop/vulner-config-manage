import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'

import { Skeleton, Row, Col } from 'antd'

import StatBar from './StatBar'
import StatPie from './StatPie'

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
});

@observer
@inject('userStore')
class VulnerStatisticsView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { classes } = this.props;
        const userStore = this.props.userStore;
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Row>
                        <Col span={12}>
                            <StatBar name='years' />
                        </Col>
                        <Col span={12}>
                            <StatBar name='platform' />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <StatPie name='type' />
                        </Col>
                        <Col span={12} >
                            <StatPie name='verified' />
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        );

    }
}

VulnerStatisticsView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(VulnerStatisticsView);