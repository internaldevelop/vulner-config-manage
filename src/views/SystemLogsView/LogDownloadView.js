import { withStyles } from '@material-ui/core/styles';
import { Table, Button, Card, Icon, Skeleton } from 'antd';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import MAntdTable from '../../rlib/props/MAntdTable';
import EllipsisText from '../../components/widgets/EllipsisText';

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
            selectRowIndex: 0,
        }
        this.getAllLogFiles();
    }

    getAllLogFilesCB = (data) => {

    }

    getAllLogFiles = () => {
        //RestReq.asyncGet(this.getAllLogFilesCB, '/firmware-analyze/system/', {});
    }

    setRowClassName = (record) => {
        const { classes } = this.props;
        const { selectRowIndex } = this.state;
        return (selectRowIndex === record.index) ? classes.clickRow : '';
    }

    onRow = (record) => {
        const { logFiles } = this.state;
        let index = record.index - 1;
        // logFiles[index]
        this.setState({ selectRowIndex: record.index });
    }

    handlePageChange = (currentPage, pageSize) => {
    }

    downloadLogs = () => {
        // 下载日志文件
    }

    render() {
        const { classes } = this.props;
        const { logFiles } = this.state;
        const userStore = this.props.userStore;
        let self = this;

        // let columns = [
        //     { title: '序号', width: 150, dataIndex: 'index',},
        //     { title: '文件名', width: 200, dataIndex: 'name',},
        //     { title: '生成时间', width: 200, dataIndex: 'create_time',},
        // ];
        // columns = MAntdTable.buildColumns(columns);

        const columns = [
            {
                title: '序号', width: 150, dataIndex: 'index', key: 'index',
                //sorter: (a, b) => a.index - b.index,
                render: content => <EllipsisText content={content} width={150} />,
            },
            {
                title: '文件名', width: 200, dataIndex: 'name', key: 'name',
                //sorter: (a, b) => a.name - b.name,
                render: content => <EllipsisText content={content} width={200} />,
            },
            {
                title: '生成时间', width: 200, dataIndex: 'create_time', key: 'create_time',
                sorter: (a, b) => a.create_time - b.create_time,
                render: content => <EllipsisText content={content} width={200} />,
            },
        ];
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Card title={'日志下载'} style={{ width: '100%', height: '100%' }}>
                        <Table
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
                            <Button type="primary" size="default" onClick={this.downloadLogs.bind(this)}><Icon type="download" />日志下载</Button>
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