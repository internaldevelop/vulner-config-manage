import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { Table, Button, Icon, Row, Col, message } from 'antd';
import { columns as Column } from './Column'
import HttpRequest from '../../utils/HttpRequest';

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginLeft: 10,
    },
    formControl: {
        margin: 0,
        marginLeft: 10,
    },
});

const DEFAULT_PAGE_SIZE = 10;
class FirmwareFetchView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            protocol: 'HTTP',
            url: '',
            columns: Column,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            pageSize: DEFAULT_PAGE_SIZE,
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 300,      // 表格的 scrollHeight
            firmwareList: [],
        }
    }

    handleProtocolChange = event => {
        this.setState({ protocol: event.target.value });
    }

    handleURLChange = event => {
        this.setState({ url: event.target.value });
    }

    checkProtocolRules() {
        let protocolHead = '^((https|http|ftp)?://)';
        let strRegex = //'?(([0-9a-z_!~*().&=+$%-]+: )?[0-9a-z_!~*().&=+$%-]+@)?' //ftp的user@
            '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184
            + '|' // 允许IP和DOMAIN（域名）
            + '([0-9a-z_!~*()-]+.)*' // 域名- www.
            + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名
            + '[a-z]{2,6})' // first level domain- .com or .museum
            + '(:[0-9]{1,4})?' // 端口- :80
            + '((/?)|' // a slash isn't required if there is no file name
            + '(/[0-9a-z_!~*().;?:@&=+$,%#-]+)+/?)$';

        let url = this.state.url.toLowerCase();
        if (url.indexOf('http') === 0 || url.indexOf('ftp') === 0) {
            // let strRegex = '^((https|http|ftp)?://)'
            // +'?(([0-9a-z_!~*().&=+$%-]+: )?[0-9a-z_!~*().&=+$%-]+@)?' //ftp的user@
            // + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184
            // + '|' // 允许IP和DOMAIN（域名）
            // + '([0-9a-z_!~*()-]+.)*' // 域名- www.
            // + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名
            // + '[a-z]{2,6})' // first level domain- .com or .museum
            // + '(:[0-9]{1,4})?' // 端口- :80
            // + '((/?)|' // a slash isn't required if there is no file name
            // + '(/[0-9a-z_!~*().;?:@&=+$,%#-]+)+/?)$';
            if (new RegExp(protocolHead + strRegex).test(url)) {
                return true;
            }
            return false;
        } else {
            if (new RegExp(strRegex).test(url)) {
                if (this.state.protocol === 'HTTP') {
                    this.setState({ url: 'http://' + this.state.url });
                } else {
                    this.setState({ url: 'ftp://' + this.state.url });
                }
                return true;
            }
            return false;
        }
    }

    getFirmwareInfoCB = (data) => {

    }

    getFirmwareInfo = event => {
        if (this.checkProtocolRules()) {
            HttpRequest.asyncGet(this.getFirmwareInfoCB, '/unified-auth/account_manage/all', { access_token: '' });
        } else {
            message.info('URL输入错误，请重新输入URL');
        }
    }

    /** 处理页面变化（页面跳转/切换/每页记录数变化） */
    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
    }

    render() {
        const { columns, firmwareList, scrollWidth, scrollHeight } = this.state;
        let self = this;
        const { classes } = this.props;

        return (
            <div>
                <Row>
                    <Col span={5}>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormLabel component="legend">固件下载</FormLabel>
                            <RadioGroup aria-label="gender" name="gender1" value={this.state.protocol} onChange={this.handleProtocolChange.bind(this)} row>
                                <FormControlLabel value='FTP' control={<Radio />} label="FTP" />
                                <FormControlLabel value="HTTP" control={<Radio />} label="HTTP" />
                            </RadioGroup>
                        </FormControl>
                    </Col>
                    <Col span={8}>
                        <FormControl margin="normal" required fullWidth>
                            <InputLabel>URL链接</InputLabel>
                            <Input name="URL" id="URL" onChange={this.handleURLChange.bind(this)} />
                        </FormControl>
                    </Col>
                    <Col span={10} offset={1} style={{ marginTop: 22 }}>
                        <Button type="primary" size="large" onClick={this.getFirmwareInfo.bind(this)}><Icon type="download" />下载固件</Button>
                    </Col>
                </Row>
                <br/>
                <br/>
                <FormControl margin="normal" className={classes.formControl}>
                    <FormLabel component="legend">固件列表</FormLabel>
                    <Table
                        id="firmwareListTable"
                        columns={columns}
                        dataSource={firmwareList}
                        scroll={{ x: scrollWidth, y: scrollHeight }}
                        rowKey={record => record.uuid}
                        pagination={{
                            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                            pageSizeOptions: [DEFAULT_PAGE_SIZE.toString(), '20', '30', '40'],
                            defaultPageSize: DEFAULT_PAGE_SIZE,
                            showQuickJumper: true,
                            showSizeChanger: true,
                            onShowSizeChange(current, pageSize) {  //当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                                self.handlePageChange(current, pageSize);
                            },
                            onChange(current, pageSize) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                                self.handlePageChange(current, pageSize);
                            },
                        }}
                    />
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles)(FirmwareFetchView);