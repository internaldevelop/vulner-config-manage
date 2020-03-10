import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { Skeleton, Table, Progress, Button, Icon, Row, Col, message, Popconfirm } from 'antd';
import { DeepClone, DeepCopy } from '../../utils/ObjUtils'
import { columns as Column } from './Column'
import RestReq from '../../utils/RestReq';
import FirmwareParamsConfig from './FirmwareParamsConfig'
import { generateUuidStr } from '../../utils/tools';
import { sockMsgType } from '../../global/enumeration/SockMsgType'
import { actionType } from '../../global/enumeration/ActionType';
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
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
});

const DEFAULT_PAGE_SIZE = 10;
@inject('firmwareStore')
@inject('userStore')
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
            scrollHeight: 400,      // 表格的 scrollHeight
            firmwareList: [],
            percent: 0,
        }

        // 设置操作列的渲染
        this.initActionColumn();

        this.getAllFirmwares(this.state.currentPage, this.state.pageSize);
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

    /** 初始化操作列，定义渲染效果 */
    initActionColumn() {
        const { columns } = this.state;
        const { classes } = this.props;
        if (columns.length === 0)
            return;

        columns[columns.length - 1].render = (text, record, index) => (
            <div>
                <Popconfirm title="确定要删除该固件吗？" onConfirm={this.handleDel(index).bind(this)} okText="确定" cancelText="取消">
                    <Button className={classes.actionButton} type="danger" size="small">删除</Button>
                </Popconfirm>
                <Button className={classes.actionButton} type="primary" size="small" onClick={this.handleEdit(index).bind(this)}>编辑</Button>
            </div>
        )

        this.setState({ columns });
    }

    /**
     * 将数据所在页的行索引转换成整个数据列表中的索引
     * @param {} rowIndex 数据在表格当前页的行索引
     */
    transferDataIndex(rowIndex) {
        // currentPage 为 Table 中当前页码（从 1 开始）
        const { currentPage, pageSize } = this.state;
        let dataIndex = (currentPage - 1) * pageSize + rowIndex;
        return dataIndex;
    }

    /** 向后台发起删除固件数据请求的完成回调 
     *  因调用请求函数时，默认参数只返回成功请求，所以此处不需要判断后台是否成功删除固件
    */
    deleteFirmwaresCB = (dataIndex) => (data) => {
        // const { firmwareList } = this.state;
        // // rowIndex 为行索引，第二个参数 1 为一次去除几行
        // firmwareList.splice(dataIndex, 1);
        // this.setState({ firmwareList });
        // 删除完一条数据后重新取当前页面的数据, TODO, 看看是否需要这么做,或者其他方式
        this.getAllFirmwares(this.state.currentPage, this.state.pageSize);
    }

    /** 处理删除操作
     * rowIndex 为当前页所含记录中的第几行（base:0），不是所有记录中的第几条
     * 需要根据当前 pagination 的属性，做变换
     */
    handleDel = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 向后台提交删除该固件
        const { firmwareList } = this.state;
        // TODO 需要修改接口
        // RestReq.asyncPost(this.deleteFirmwaresCB(dataIndex), '/firmware-analyze/fw-fetch/del', {}, { uuid: firmwareList[dataIndex].uuid, token: false });
    }

    /** 处理编辑操作 */
    handleEdit = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);

        // 获取需要编辑的固件数据
        const firmwareItem = this.state.firmwareList[dataIndex];

        // 利用仓库保存固件操作类型、操作窗口名称、固件数据
        const firmwareStore = this.props.firmwareStore;
        firmwareStore.setFirmwareAction(actionType.ACTION_EDIT);
        firmwareStore.setFirmwareProcName('编辑固件参数');
        firmwareStore.initFirmwareItem(firmwareItem);

        // 保存待编辑的数据索引，并打开任务数据操作窗口
        this.setState({ recordChangeID: dataIndex, showConfig: true });
    }

    /** 新建/编辑固件窗口完成的回调处理 */
    handleCloseConfig = (isOk, policy) => {
        const firmwareStore = this.props.firmwareStore;
        if (isOk) {
            if (firmwareStore.firmwareAction === actionType.ACTION_NEW) {
                //
            } else if (firmwareStore.firmwareAction === actionType.ACTION_EDIT) {
                this.editFirmwareParams();
            }
        }

        // 关闭固件数据操作窗口
        this.setState({ showConfig: false });
    }

    /** 确认修改固件后，在固件列表中修改指定数据 */
    editFirmwareParams = () => {
        const { firmwareList, recordChangeID } = this.state;
        const firmwareItem = this.props.firmwareStore.firmwareItem;

        // 从仓库中取出编辑后的固件对象，深拷贝到源数据中
        let record = firmwareList[recordChangeID];
        DeepCopy(record, firmwareItem);
    }

    getAllFirmwares = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        // TODO 提供分页功能,但是接口目前没有提供分页
        //RestReq.asyncGet(this.getAllFirmwaresCB, '/firmware-analyze/fw-fetch/list', { /*offset: startSet, count: pageSize*/ }, { token: false });
        // TODO 接口目前有问题，后续沟通，这里构造一条数据
        let firmwareItem = {index: 1, key: 1, firmware_id: '900000', fw_file_name: 'TL-WVR900L_V1.0_161207'};
        let firmwareList = this.state.firmwareList.push(firmwareItem);
        this.setState({ firmwareList, totalResult: 1, });
    }

    getAllFirmwaresCB = (data) => {
        let firmwares = [];
        // 检查响应的payload数据是数组类型
        if (data.code !== 'ERROR_OK' || data.payload.items === undefined)
            return;

        // 从响应数据生成 table 数据源
        let startSet = (this.state.currentPage - 1) * this.state.pageSize;
        firmwares = data.payload.items.map((firmware, index) => {
            let firmwareItem = DeepClone(firmware);
            // antd 表格需要数据源中含 key 属性
            //firmwareItem.key = index + 1;
            // 表格中索引列（后台接口返回数据中没有此属性）
            //firmwareItem.index = index + 1;
            firmwareItem.index = startSet + index + 1;
            firmwareItem.key = startSet + index + 1;
            return firmwareItem;
        })
        let total = data.payload.items.length;
        if (data.payload.total !== undefined) {
            total = data.payload.total;
        }
        this.setState({ firmwareList: firmwares, totalResult: total, });
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
        this.getAllFirmwares(currentPage, pageSize);
    }

    render() {
        const { totalResult, columns, showConfig, firmwareList, scrollWidth, scrollHeight } = this.state;
        let self = this;
        const { classes } = this.props;
        const userStore = this.props.userStore;

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
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
                        <FormLabel component="legend">下载进度</FormLabel>
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
                                total: totalResult > 0 ? totalResult : 10,
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
                    {showConfig && <FirmwareParamsConfig actioncb={this.handleCloseConfig} />}
                </Skeleton>
            </div>
        );
    }
}

export default withStyles(styles)(FirmwareFetchView);