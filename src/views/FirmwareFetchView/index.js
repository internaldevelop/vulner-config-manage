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
import { Table, Progress, Button, Icon, Row, Col, message } from 'antd';
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'
import { columns as Column } from './Column'
import RestReq from '../../utils/RestReq';
import { generateUuidStr } from '../../utils/tools';
import { sockMsgType } from '../../global/enumeration/SockMsgType'
import { GetWebSocketUrl, GetViewMinWidth } from '../../global/environment';
import { GetMainViewHeight } from '../../utils/PageUtils';

let socket = null;
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
            percent: 0,
        }
        this.getAllFirmwares();
    }

    componentDidMount() {
        // 增加监听器，侦测浏览器窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({ scrollHeight: GetMainViewHeight() });

        // 开启300毫秒的定时器
        // timer300mS = setInterval(() => this.timer300msProcess(), 300);

        // 开启 websocket ，实时获取下载固件进度
        //this.openWebsocket();
    }

    handleResize = e => {
        console.log('浏览器窗口大小改变事件', e.target.innerWidth, e.target.innerHeight);
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    componentWillUnmount() {
        // 组件卸装前，一定要移除监听器
        window.removeEventListener('resize', this.handleResize.bind(this));

        // 清除定时器
        // clearInterval(timer300mS);
        if (socket != null)
            socket.close();
    }

    getAllFirmwares = () => {
        RestReq.asyncGet(this.getAllFirmwaresCB, '/firmware-analyze/fw-fetch/list', {}, { token: false });
    }

    getAllFirmwaresCB = (data) => {
        let firmwares = [];
        // 检查响应的payload数据是数组类型
        if (data.code !== 'ERROR_OK' || data.payload.items === undefined)
            return;

        // 从响应数据生成 table 数据源
        firmwares = data.payload.items.map((firmware, index) => {
            let firmwareItem = DeepClone(firmware);
            // antd 表格需要数据源中含 key 属性
            firmwareItem.key = index + 1;
            // 表格中索引列（后台接口返回数据中没有此属性）
            firmwareItem.index = index + 1;
            return firmwareItem;
        })
        this.setState({ firmwareList: firmwares });
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

    processSockMessage = (data) => {
        let message = JSON.parse(data);
        if (message.type === sockMsgType.MULTIPLE_TASK_RUN_INFO) {
            // 处理多任务运行状态
            this.processMultipleTaskRunStatusInfo(message.payload);
        } else {
            // 其它消息类型不做处理
        }
    }

    openWebsocket = () => {
        // var socket;

        let self = this;
        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            console.log("您的浏览器支持WebSocket");
            //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接  
            socket = new WebSocket(GetWebSocketUrl() + 'firmware_download_percent' + generateUuidStr());
            //打开事件  
            socket.onopen = function () {
                console.log("Socket 已打开");
                //socket.send("这是来自客户端的消息" + location.href + new Date());  
            };
            //获得消息事件  
            socket.onmessage = function (msg) {
                console.log(msg.data);
                self.processSockMessage(msg.data);
                //发现消息进入    开始处理前端触发逻辑
            };
            //关闭事件  
            socket.onclose = function () {
                console.log("Socket已关闭");
                socket.close();
                socket = null;
            };
            //发生了错误事件  
            socket.onerror = function () {
                message.error("Socket发生了错误");
                //此时可以尝试刷新页面
            }
        }

    }

    processMultipleTaskRunStatusInfo = (payload) => {
        // 检查响应的payload
        if (payload.percent === undefined)
            return;

        // 更新下载进度条
        this.setState({ percent: payload.percent });
    }

    getFirmwareInfoCB = (data) => {

    }

    getFirmwareInfo = event => {
        if (this.checkProtocolRules()) {
            // 把进度条设置成0
            this.setState({ percent: 0 });
            // TODO 目前从网关走不能正确调用django，只能直接调用
            RestReq.asyncGet(this.getFirmwareInfoCB, '/firmware-analyze/fw-fetch/downloadex', { url: this.state.url }, { token: false });
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
                <br />
                <div style={{ marginLeft: 10, width: '60%' }}>
                    <Progress percent={this.state.percent} strokeWidth='20px' strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} />
                </div>
                <br />
                <br />
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