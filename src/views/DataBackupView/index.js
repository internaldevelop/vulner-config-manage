import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Input, message, Skeleton, Select, Card, Row, Col, Switch, Button, Icon } from 'antd'
import { columns as Column } from './Column'
import RestReq from '../../utils/RestReq';
import { GetMainViewMinHeight, GetMainViewMinWidth } from '../../utils/PageUtils'

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
    shade: {
        position: 'absolute',
        top: 50,
        left: 0,
        zIndex: 10,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        opacity: 0.01,
        display: 'block',
    },
});

const Option = Select.Option;
const DEFAULT_PAGE_SIZE = 10;
@inject('userStore')
@observer
class DataBackupView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [], // Check here to configure the default column
            users: [],
            logConfigs: [],
            columns: Column,
            pageSize: DEFAULT_PAGE_SIZE,
            scrollWidth: 800,        // 表格的 scrollWidth
            scrollHeight: 200,      // 表格的 scrollHeight
            // analysisLog: {},
            // systemLog: {},
            // taskLog: {},
            // queryTaskLog: {},
            // queryLog: {},
            // searchLog: {},
            // statisticLog: {},
            // debugLog: {},
            // downloadLog: {},
        }
        //this.getUsers();
        this.getSystemConfigs();
    }

    getSystemConfigsCB = (data) => {
        if (data.code !== 'ERROR_OK')
            return;

        let logConfigs = [];
        for (let key in data.payload.log_configs) {
            logConfigs.push({ name: key, description: data.payload.log_configs[key].description, alias: data.payload.log_configs[key].alias, on: data.payload.log_configs[key].on });
        }

        this.setState({
            logConfigs,
            // analysisLog: data.payload.log_configs.analysis,
            // systemLog: data.payload.log_configs.system_config,
            // taskLog: data.payload.log_configs.task,
            // queryTaskLog: data.payload.log_configs.query_task,
            // queryLog: data.payload.log_configs.query,
            // searchLog: data.payload.log_configs.search,
            // statisticLog: data.payload.log_configs.statistics,
            // debugLog: data.payload.log_configs.debug,
            // downloadLog: data.payload.log_configs.download,
        });
    }

    getSystemConfigs() {
        RestReq.asyncGet(this.getSystemConfigsCB, '/firmware-analyze/system/read_config');
    }

    getLogValue = (item) => {
        return (item.on === 1 ? true : false);
    }

    handleLogSwitch = (item) => (checked, event) => {
        let logConfigs  = this.state.logConfigs;
        for (let log of logConfigs) {
            if (log.name === item.name) {
                log.on = checked ? 1 : 0; 
            }
        }
        this.setState({ logConfigs });
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    getDefaultFileName = () => {
        let now = new Date();
        let month = (10 > (now.getMonth() + 1)) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        let day = (10 > now.getDate()) ? '0' + now.getDate() : now.getDate();
        let today = now.getFullYear() + month + day;
        return 'back' + today;
    }

    saveDataCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            message.info('系统备份失败！');
            return;
        } else {
            this.getSystemConfigsCB(data);
            message.info('系统备份成功！');
        }
    }

    saveData = () => {
        const logConfigs = this.state.logConfigs;
        let logConfigsDic = {};
        for (let log of logConfigs) {
            let item = {
                alias: log.alias,
                on: log.on,
                description: log.description,
            };
            logConfigsDic[log.name] = item;
            // 如果写成let type = log.name 
            // logConfgisDic.type = item 则key为'type'而不是log.name的值
        }
        let result = JSON.stringify({log_configs: logConfigsDic});
        RestReq.asyncPost(this.saveDataCB, '/firmware-analyze/system/write_config', {sys_config: result});
    }

    render() {
        const { classes } = this.props;
        const { selectedRowKeys, logConfigs } = this.state;
        const userStore = this.props.userStore;
        let self = this;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <div style={{ minWidth: GetMainViewMinWidth(), minHeight: GetMainViewMinHeight() }}>
                        <Card title={'系统备份'} style={{ width: '100%', height: '100%' }}
                        >
                            <Row gutter={[16, 16]}>
                                {logConfigs.map((item, index) => (
                                    <Col span={12}>
                                        <Col span={6}>
                                            {item.alias}
                                        </Col>
                                        <Col span={4}>
                                            <Switch checkedChildren="开" unCheckedChildren="关" onChange={this.handleLogSwitch(item)}
                                                checked={this.getLogValue(item)} />
                                        </Col>
                                    </Col>
                                ))}
                            </Row>
                            <br />
                            <Row>
                                <Col span={4}>
                                    {"备份文件名称："}
                                </Col>
                                <Col span={4}>
                                    <Input defaultValue={this.getDefaultFileName()} onChange={this.handleFileChange} style={{ width: 200 }} />
                                </Col>
                            </Row>
                            <br />
                            <br />
                            <Row>
                                <Col span={4} offset={6}>
                                    <Button type="primary" size="large" onClick={this.saveData}><Icon type="save" />系统备份</Button>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                </Skeleton>
            </div>
        )

    }
}

DataBackupView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(DataBackupView);