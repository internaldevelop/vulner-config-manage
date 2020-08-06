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
class ReportDownloadView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reportFiles: [],
            selectRowIndex: 0,
            columns: Column(),
            selectedRowKeys: [],
        }
        this.getAllReportFiles();
    }

    getAllReportFilesCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;
        let reportFiles = data.payload.map((file, index) => {
            let item = DeepClone(file);
            item.index = index + 1;
            item.key = index + 1;
            return item;
        });
        this.setState({ reportFiles, totalResult: data.payload.totalResults });
    }

    getAllReportFiles = () => {
        RestReq.asyncGet(this.getAllReportFilesCB, '/firmware-analyze/report/pdf/get_report_pdf');
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

    getReportItem = () => {
        const { selectRowIndex, reportFiles } = this.state;
        return reportFiles[selectRowIndex - 1];
    }

    downloadReport = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请选择一个报告进行下载！");
            return;
        }
        window.location.href = GetMainServerRootUrl() + '/firmware-analyze/report/pdf/download_report?report_id=' + this.getReportItem().report_id + '&access_token=' + RestReq._getAccessToken();
    }

    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

    render() {
        const { classes } = this.props;
        const { selectedRowKeys, columns, reportFiles } = this.state;
        const userStore = this.props.userStore;
        let self = this;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Card title={'报告下载'} style={{ width: '100%', height: '100%' }}>
                        <Table
                            //rowSelection={rowSelection}
                            columns={columns}
                            dataSource={reportFiles}
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
                            <Button type="primary" size="default" onClick={this.downloadReport.bind(this)}><Icon type="download" />报告下载</Button>
                        </div>
                    </Card>
                </Skeleton>
            </div >
        )
    }
}

ReportDownloadView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(ReportDownloadView);