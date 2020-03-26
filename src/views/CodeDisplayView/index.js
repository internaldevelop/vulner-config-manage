import React from 'react'
import PropTypes from 'prop-types';
import { Spin, Card, Tree, Upload, Table, Skeleton, Select, Icon, Button, Row, Col, message, Progress } from 'antd'
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { columns as Column } from './Column'
import { observer, inject } from 'mobx-react'
import { DeepClone } from '../../utils/ObjUtils'
import RestReq from '../../utils/RestReq';
import { generateUuidStr } from '../../utils/tools';
import { sockMsgType } from '../../global/enumeration/SockMsgType'
import { GetWebSocketUrl, GetViewMinWidth } from '../../global/environment';
import { GetMainViewHeight } from '../../utils/PageUtils';
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/go/go'
import 'codemirror/mode/http/http'
import 'codemirror/mode/php/php'
import 'codemirror/mode/python/python'
import 'codemirror/mode/http/http'
import 'codemirror/mode/sql/sql'
import 'codemirror/mode/vue/vue'
import 'codemirror/mode/xml/xml'

const styles = theme => ({
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
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

let socket = null;
const Option = Select.Option;
const DEFAULT_PAGE_SIZE = 10;

@inject('userStore')
@observer
class CodeDisplayView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            asmCode: '',
            asmMode: 'javascript',
            vexCode: '',
            vexMode: 'javascript',
            fileList: [],
            currentPage: 1,     // Table中当前页码（从 1 开始）
            pageSize: DEFAULT_PAGE_SIZE,
            columns: Column,
            firmwareList: [],
            firmwareFunctionList: [],
            functionTreeData: [],
            totalResult: 0,
            selectedFirmwareId: '',
            selectedFirmwareTaskId: '',
            selectedFirmwareFunctionId: '',
            selectedFirmwareFunctionTaskId: '',
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 400,      // 表格的 scrollHeight
            percentage: 0,
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

        // 开启 websocket ，实时获取固件抽取进度
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

    processSockMessage = (data) => {
        // socket推送过来的数据需要跟当前页面指定的任务id相同才可往下处理
        if (data.task_id === this.selectedFirmwareTaskId) {

        } else if (data.task_id === this.selectedFirmwareFunctionTaskId) {

        }
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

    /** 初始化操作列，定义渲染效果 */
    initActionColumn() {
        const { columns } = this.state;
        const { classes } = this.props;
        if (columns.length === 0)
            return;

        columns[columns.length - 1].render = (text, record, index) => (
            <div>
                <Button className={classes.actionButton} disabled={this.isRunning(index)} type="primary" size="small" onClick={this.handleFetchFunction(index).bind(this)}>抽取</Button>
            </div>
        )

        this.setState({ columns });
    }

    isRunning = (rowIndex) => {
        const { firmwareList } = this.state;
        if (firmwareList == null || firmwareList.length <= 0) {
            return false;
        }
        let dataIndex = this.transferDataIndex(rowIndex);
        if (firmwareList[dataIndex] !== null
            && firmwareList[dataIndex].task_id !== undefined) {
            return true;
        }
        return false;
    }

    isVisibleProgress = () => {
        if (this.state.selectedFirmwareTaskId !== '' && this.state.percentage !== 100) {
            return true;
        }
        return false;
    }

    handleFetchFunction = (rowIndex) => (event) => {
        // 从行索引转换成实际的数据索引
        let dataIndex = this.transferDataIndex(rowIndex);
        const firmware = this.state.firmwareList[dataIndex];
        if (firmware.task_id === undefined) {
            this.getAsyncFunction(firmware);
        }
    }

    getAsyncFunction = (firmware) => {
        if (firmware !== null) {
            // 根据firmware查询返回所有的函数 中间函数 汇编函数等
            RestReq.asyncGet(this.getAsyncFunctionsCB, '/firmware-analyze/fw_analyze/async_funcs/list', { file_id: firmware.firmware_id, }, { token: false });
            this.setState({ selectedFirmwareId: firmware.firmware_id, percentage: 0, functionTreeData: [], code: '' });
            message.info("开始抽取函数");
        }
    }

    getAllFirmwares = (targetPage, pageSize) => {
        let startSet = (targetPage - 1) * pageSize + 1;
        // TODO 提供分页功能,但是接口目前没有提供分页
        //RestReq.asyncGet(this.getAllFirmwaresCB, '/firmware-analyze/fw-fetch/list', { /*offset: startSet, count: pageSize*/ }, { token: false });
        // TODO 接口目前有问题，后续沟通，这里构造数据
        let firmwareItem = { index: 1, key: 1, firmware_id: '111', fw_file_name: 'TL-WVR900L_V1.0_161207' };
        let firmwareList = this.state.firmwareList;
        firmwareList.push(firmwareItem);
        firmwareItem = { index: 2, key: 2, firmware_id: '112', fw_file_name: 'TL-WVR900L_V1.0_161207' };
        firmwareList.push(firmwareItem);
        this.setState({ firmwareList, totalResult: 2, });
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

    updateCode = (newCode) => {
        this.setState({
            code: newCode,
        });
    }

    changeMode = value => {
        this.setState({
            mode: value,
        });
    }

    // interact = (cm) => {
    //     console.log(cm.getValue());
    // }

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

    /** 处理页面变化（页面跳转/切换/每页记录数变化） */
    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
        this.getAllFirmwares(currentPage, pageSize);
    }

    getFirmwareInfo = (rowData) => {
        const firmwareList = this.state.firmwareList;
        for (let data of firmwareList) {
            if (data.key === rowData.key) {
                return data;
            }
        }
        return null;
    }

    constructTreeData = (functions) => {
        let methods = [];
        for (let fun of functions) {
            let item = { title: fun.name, key: fun.addr, };
            methods.push(item);
        }
        let treeData = [{
            title: '函数列表', key: 'methodList', children: methods,
        },];
        return treeData;
    }

    getAsyncFunctionsCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined || data.payload.task_id === undefined)
            return;
        let firmwareList = this.state.firmwareList;
        for (let item of firmwareList) {
            if (item.firmware_id === this.state.selectedFirmwareId) {
                item.task_id = data.payload.task_id;
                break;
            }
        }
        this.setState({ selectedFirmwareTaskId: data.payload.task_id, firmwareList });
    }

    getAllFunctionTaskInfoCB = (data) => {
        let functions = [];
        if (data.code !== 'ERROR_OK')
            return;

        if (data.code === 'ERROR_OK' && data.payload.percentage < 100) {
            this.setState({ percentage: data.payload.percentage, functionTreeData: [] });
            message.info("函数抽取进度：" + data.payload.percentage);
            return;
        }
        functions = data.payload.result.functions.map((item, index) => {
            let functionItem = DeepClone(item);
            functionItem.index = index + 1;
            functionItem.key = index + 1;
            return functionItem;
        })
        this.setState({ firmwareFunctionList: functions, functionTreeData: this.constructTreeData(functions), percentage: 100 });
    }

    selectRow = (rowData) => {
        let firmware = this.getFirmwareInfo(rowData);
        if (firmware !== null) {
            if (firmware.task_id === undefined) {
                this.getAsyncFunction(firmware);
            } else {
                if (firmware.firmware_id === this.state.selectedFirmwareId && this.state.percentage === 100) {
                    return;
                }
                // 根据firmware查询返回所有的函数 中间函数 汇编函数等
                RestReq.asyncGet(this.getAllFunctionTaskInfoCB, '/firmware-analyze/fw_analyze/task_result', { task_id: firmware.task_id, }, { token: false });
                this.setState({ selectedFirmwareId: firmware.firmware_id });
            }
        }
    }

    // getFunctionCodeCB = (data) => {
    //     if (data.code !== 'ERROR_OK' || data.payload === undefined) {
    //         this.setState({ code: '' });
    //         return;
    //     }
    //     // 根据method去后台取对应的函数代码
    //     this.setState({ code: data.payload });
    // }

    getFunctionCodeCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload.percentage === undefined || data.payload.percentage < 100) {
            return;
        }
        // 根据method去后台取对应的函数代码
        this.setState({ vexCode: data.payload.result.vex, asmCode: data.payload.result.asm, });
    }

    getAyncFunctionCodeCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined || data.payload.task_id === undefined) {
            this.setState({ asmCode: '', vexCode: '' });
            return;
        }
        RestReq.asyncGet(this.getFunctionCodeCB, '/firmware-analyze/fw_analyze/task_result', { task_id: data.payload.task_id }, { token: false });
        this.setState({ selectedFirmwareFunctionTaskId: data.payload.task_id, asmCode: '', vexCode: '' });
    }

    onSelectMethod = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            if (this.state.selectedFirmwareFunctionId !== selectedKeys[0]) {
                const firmware_id = this.state.selectedFirmwareId;
                RestReq.asyncGet(this.getAyncFunctionCodeCB, '/firmware-analyze/fw_analyze/async_funcs/func_info', { file_id: firmware_id, func_addr: selectedKeys[0] }, { token: false });
                this.setState({ selectedFirmwareFunctionId: selectedKeys[0] });
            } else {
                RestReq.asyncGet(this.getFunctionCodeCB, '/firmware-analyze/fw_analyze/task_result', { task_id: this.state.selectedFirmwareFunctionTaskId }, { token: false });
            }
        }
        //RestReq.asyncGet(this.getFunctionCodeCB, '/firmware-analyze/fw_analyze/functions/asm', { file_id: this.state.selectedFirmwareId, func_addr: selectedKeys[0] }, { token: false });
    }

    render() {
        const optionsAsm = {
            theme: 'eclipse',
            tabSize: 2,
            keyMap: 'sublime',
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: true,
            mode: this.state.asmMode,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        };

        const optionsVex = {
            theme: 'eclipse',
            tabSize: 2,
            keyMap: 'sublime',
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: true,
            mode: this.state.vexMode,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        };

        const { totalResult, columns, firmwareList, functionTreeData, scrollWidth, scrollHeight } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;

        const { fileList } = this.state;
        let self = this;

        const props = {
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                this.setState(state => ({
                    fileList: [...state.fileList, file],
                }));

                let reader = new FileReader();
                reader.readAsText(file, "gbk");
                reader.onload = function (oFREvent) {
                    let pointsTxt = oFREvent.target.result;
                    self.setState({ code: pointsTxt });
                }

                return false;
            },
            fileList,
        };

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
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
                            onRow={(record) => ({
                                onClick: () => {
                                    this.selectRow(record);
                                },
                            })}
                        />
                    </FormControl>
                    {/* {this.isVisibleProgress() &&
                        <div style={{ marginLeft: 10, width: '60%' }}>
                            <FormLabel component="legend">函数抽取进度</FormLabel>
                            <Progress percent={this.state.percentage} strokeWidth='15px' strokeColor={{ '0%': '#108ee9', '100%': '#87d068', }} />
                        </div>} */}

                    {/* <Row style={{ marginTop: 10 }}>
                        <Col span={3} style={{ marginTop: 5 }}>
                            {"选择代码类型："}
                        </Col>
                        <Col span={4} >
                            <Select style={{ width: 200 }} onChange={this.changeMode.bind(this)} value={this.state.mode}>
                                <Option value="markdown">Markdown</Option>
                                <Option value="javascript">JavaScript</Option>
                                <Option value="python">python</Option>
                            </Select>
                        </Col>
                        <Col span={11} offset={2}>
                            <Upload {...props} >
                                <Button>
                                    <Icon type="upload" /> 选择文件
                        </Button>
                            </Upload>
                        </Col>
                    </Row> */}
                    <br />

                    <Row style={{ marginTop: 10 }}>
                        <Col span={4} >
                            <Tree
                                defaultExpandAll={true}
                                defaultExpandedKeys={['methodList']}
                                onSelect={this.onSelectMethod}
                                treeData={functionTreeData}
                            />
                        </Col>
                        <Col span={18} offset={2}>
                        {this.state.asmCode === '' && this.state.selectedFirmwareFunctionId !== '' && <Spin style={{ marginTop: 50, marginLeft: 50 }} tip="Loading..."></Spin>}
                            {this.state.asmCode !== ''
                                && <Card title="汇编代码">
                                    <CodeMirror ref="editor" value={this.state.asmCode} /*onChange={this.updateCode}*/ options={optionsAsm} />
                                </Card>
                                // && <div>
                                //     <p>汇编代码</p>
                                //     <CodeMirror ref="editor" value={this.state.asmCode} /*onChange={this.updateCode}*/ options={optionsAsm} />
                                // </div>
                            }
                            {this.state.vexCode !== ''
                                // && <div>
                                //     <p>中间代码</p>
                                //     <CodeMirror ref="editor" value={this.state.vexCode} /*onChange={this.updateCode}*/ options={optionsVex} />
                                // </div>
                                && <Card title="中间代码">
                                    <CodeMirror ref="editor" value={this.state.vexCode} /*onChange={this.updateCode}*/ options={optionsVex} />
                                </Card>
                            }
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        );
    }
}

export default withStyles(styles)(CodeDisplayView);