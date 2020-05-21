import { withStyles } from '@material-ui/core/styles';
import { Button, Card, Col, Icon, message, Row, Select, Skeleton, Switch, Table } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import EllipsisText from '../../components/widgets/EllipsisText';
import MAntdCard from '../../rlib/props/MAntdCard';
import MAntdTable from '../../rlib/props/MAntdTable';
import { DeepClone } from '../../utils/ObjUtils';
import RestReq from '../../utils/RestReq';

const Option = Select.Option;
const DEFAULT_PAGE_SIZE = 10;

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
    clickRow: {
        backgroundColor: '#bae7ff',
    },
});

@inject('userStore')
@observer
class DataRestoreView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            allConfigs: [],
            pageSize: DEFAULT_PAGE_SIZE,
            selectedConfigs: [],
            fileName: '',
            selectRowIndex: 1,
        }
        this.getAllConfigs();
    }

    getAllConfigsCB = (data) => {
        let allConfigs = [];
        let selectedConfigs = [];
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;

        let i = 0;
        let fileName = '';
        allConfigs = data.payload.map((config, index) => {
            if (i === 0) {
                let configs = config.value.log_configs;
                for (let key in configs) {
                    selectedConfigs.push({ name: key, description: configs[key].description, alias: configs[key].alias, on: configs[key].on });
                }
                fileName = config.key;
                i++;
            }
            let configItem = DeepClone(config);
            configItem.index = index + 1;
            configItem.key = index + 1;
            configItem.name = config.key;
            return configItem;
        })
        // TODO 接口数据没有备份文件创建时间，后台需要增加
        this.setState({ allConfigs, selectedConfigs, fileName});
    }

    getAllConfigs() {
        RestReq.asyncGet(this.getAllConfigsCB, '/firmware-analyze/system/read_config', { all_config: 1 });
    }

    handleSelectManager = (value) => {
        const { users } = this.state;
        for (let user of users) {
            if (user.uuid === value) {
                break;
            }
        }
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    restoreFactoryDataCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            message.info('恢复出厂设置失败！');
            return;
        } else {
            message.info('恢复出厂设置成功！');
        }
        this.getAllConfigs();
    }

    restoreFactoryData = () => {
        RestReq.asyncGet(this.restoreFactoryDataCB, '/firmware-analyze/system/default_config');
    }

    restoreDataCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            message.info('恢复' + this.state.fileName + '设置失败！');
            return;
        } else {
            message.info('恢复' + this.state.fileName + '设置成功！');
        }
        this.getAllConfigs();
    }

    restoreData = () => {
        RestReq.asyncPost(this.restoreDataCB, '/firmware-analyze/system/recover_config', {config_key: this.state.fileName});
    }

    setRowClassName = (record) => {
        const { classes } = this.props;
        const { selectRowIndex } = this.state;
        return (selectRowIndex === record.index) ? classes.clickRow : '';
    }

    onRow = (record) => {
        const { allConfigs } = this.state;
        let index = record.index - 1;
        if (record !== undefined && allConfigs[index] !== undefined && allConfigs[index].value.log_configs !== undefined) {
            const configs = allConfigs[index].value.log_configs;
            let selectedConfigs = [];
            for (let key in configs) {
                selectedConfigs.push({ name: key, description: configs[key].description, alias: configs[key].alias, on: configs[key].on });
            }
            this.setState({ selectRowIndex: record.index, selectedConfigs, fileName: allConfigs[index].name });
        }
    }

    getLogValue = (item) => {
        return (item.on === 1 ? true : false);
    }

    handlePageChange = (currentPage, pageSize) => {
    }

    render() {
        const { classes } = this.props;
        const { fileName, selectedRowKeys, allConfigs, selectedConfigs } = this.state;
        const userStore = this.props.userStore;
        let self = this;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        const columns = [
            {
                title: '序号', width: 120, dataIndex: 'index', key: 'index',
                //sorter: (a, b) => a.index - b.index,
                render: content => <EllipsisText content={content} width={120} />,
            },
            {
                title: '备份文件名', width: 200, dataIndex: 'name', key: 'name',
                //sorter: (a, b) => a.name - b.name,
                render: content => <EllipsisText content={content} width={200} />,
            },
            {
                title: '备份时间', width: 150, dataIndex: 'create_time', key: 'create_time',
                sorter: (a, b) => a.create_time - b.create_time,
                render: content => <EllipsisText content={content} width={150} />,
            },
        ];

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Row>
                        <Col span={12}>
                            <Card title={'系统恢复'} style={{ height: '100%' }}>
                                <Table
                                    //rowSelection={rowSelection}
                                    columns={columns}
                                    dataSource={allConfigs}
                                    rowKey={record => record.uuid}
                                    rowClassName={this.setRowClassName}
                                    onRow={(record) => {//表格行点击事件
                                        return {
                                            onClick: this.onRow.bind(this, record)
                                        };
                                    }}
                                    pagination={MAntdTable.pagination(self.handlePageChange)}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title={fileName + '参数备份'} style={{ height: '100%' }}>
                                {selectedConfigs.map((item, index) => (
                                    <div>
                                        <Row>
                                            <Col span={10}>
                                                {item.alias}
                                            </Col>
                                            <Col span={10}>
                                                <Switch checkedChildren="开" unCheckedChildren="关" checked={this.getLogValue(item)} />
                                            </Col>
                                        </Row>
                                        <br />
                                    </div>
                                ))}
                            </Card>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <Row>
                        <Col span={4} offset={6}>
                            <Button type="primary" size="large" onClick={this.restoreFactoryData.bind(this)}><Icon type="save" />恢复出厂设置</Button>
                        </Col>
                        <Col span={4} offset={4}>
                            <Button type="primary" size="large" onClick={this.restoreData.bind(this)}><Icon type="save" />系统恢复</Button>
                        </Col>
                    </Row>
                </Skeleton>
            </div >
        )

    }
}

DataRestoreView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(DataRestoreView);