import { withStyles } from '@material-ui/core/styles';
import { message, Table, Button, Card, Icon, Skeleton } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import MAntdTable from '../../rlib/props/MAntdTable';
import { DeepClone } from '../../utils/ObjUtils'
import RestReq from '../../utils/RestReq';
import { columns as Column } from './Column';
import { GetMainServerRootUrl } from '../../global/environment'

const styles = theme => ({
    clickRow: {
        backgroundColor: '#bae7ff',
    },
});

@inject('userStore')
@observer
class LogDownloadView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logFiles: [],
            selectRowIndex: -1,
            columns: Column(),
            selectedRowKeys: [],
        }
        this.getAllLogFiles();
    }

    getAllLogFilesCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;
        let logFiles = data.payload.map((file, index) => {
            let item = DeepClone(file);
            item.index = index + 1;
            item.key = index + 1;
            return item;
        });
        this.setState({ logFiles, totalResult: data.payload.totalResults });
    }

    getAllLogFiles = () => {
        RestReq.asyncGet(this.getAllLogFilesCB, '/system-log/sys_log/get-backups', {}, { token: false });
    }

    setRowClassName = (record) => {
        const { classes } = this.props;
        const { selectRowIndex } = this.state;
        return (selectRowIndex === record.index) ? classes.clickRow : '';
    }

    onRow = (record) => {
        this.setState({ selectRowIndex: record.index });
    }

    handlePageChange = (currentPage, pageSize) => {
    }

    getLogItem = () => {
        const { selectRowIndex, logFiles } = this.state;
        return logFiles[selectRowIndex - 1];
    }

    downloadLog = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请先选择一个文件进行下载！");
            return;
        }
        window.location.href = GetMainServerRootUrl() + '/system-log/sys_log/download-log?uuid=' + this.getLogItem().uuid + '&access_token=' + RestReq._getAccessToken();
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    render() {
        const { classes } = this.props;
        const { selectedRowKeys, columns, logFiles } = this.state;
        const userStore = this.props.userStore;
        let self = this;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Card title={'日志下载'} style={{ width: '100%', height: '100%' }}>
                        <Table
                            //rowSelection={rowSelection}
                            columns={columns}
                            dataSource={logFiles}
                            rowKey={record => record.uuid}
                            rowClassName={this.setRowClassName}
                            onRow={(record) => {//表格行点击事件
                                return {
                                    onClick: this.onRow.bind(this, record)
                                };
                            }}
                            pagination={MAntdTable.pagination(self.handlePageChange)}
                        />
                        <br />
                        <br />
                        <div align="center">
                            <Button type="primary" size="default" onClick={this.downloadLog.bind(this)}><Icon type="download" />日志下载</Button>
                        </div>
                    </Card>
                </Skeleton>
            </div >
        )
    }
}

LogDownloadView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(LogDownloadView);