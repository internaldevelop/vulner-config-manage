import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CodeMirror from '@uiw/react-codemirror';
import { Modal, Card, Col, Input, message, Row, Select, Skeleton, Tree } from 'antd';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/keymap/sublime';
import 'codemirror/mode/go/go';
import 'codemirror/mode/http/http';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/php/php';
import 'codemirror/mode/python/python';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/xml/xml';
import 'codemirror/theme/eclipse.css';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { sockMsgType } from '../../global/enumeration/SockMsgType';
import { GetWebSocketUrl } from '../../global/environment';
import { DeepClone } from '../../utils/ObjUtils';
import { GetMainViewHeight } from '../../utils/PageUtils';
import RestReq from '../../utils/RestReq';
import { generateUuidStr } from '../../utils/tools';

let socket = null;
let fileListData = [];
const Option = Select.Option;
const DEFAULT_PAGE_SIZE = 10;
const { Search } = Input;
const FUNCTION_TREE_HEIGHT = 400;
const FILE_TREE_HEIGHT = 500;
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
    fileTreeContainer: {
        border: 1,
        borderColor: '#e8e8e8',
        borderRadius: 4,
        overflowY: 'auto',
        overflowX: 'hidden',
        height: FILE_TREE_HEIGHT,
    },
    functionTreeContainer: {
        border: 1,
        borderColor: '#e8e8e8',
        borderRadius: 4,
        overflow: 'auto',
        overflowX: 'hidden',
        height: FUNCTION_TREE_HEIGHT,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 40,
        width: 100,
        textAlign: 'center',
    },
    treeSearchStyle: {
        color: '#f50',
    },
});

@inject('userStore')
@observer
class FirmwareFunctionView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pack_id: '',
            fileTreeData: [],
            fileName: '',
            filePath: '',
            asmCode: '',
            asmMode: 'javascript',
            vexCode: '',
            vexMode: 'javascript',
            firmwareFunctionList: [],
            functionTreeData: [],// 保存函数的树形结构
            functionsListData: [],// 保存所有函数的key/title值，线性结构 目前两者一样，是因为函数只有一层，后面抽取的文件系统结构会是完整的树状结构
            selectedFirmwareId: '',
            selectedFirmwareTaskId: '',
            selectedFirmwareFunctionId: '',
            selectedFirmwareFunctionTaskId: '',
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 400,      // 表格的 scrollHeight
            percentage: 0,
            expandedFunctionKeys: [],
            functionSearchValue: '',
            autoFunctionExpandParent: true,
            expandedFileKeys: [],
            fileSearchValue: '',
            autoFileExpandParent: true,
            isFunctionAreaVisible: false,
            functionPreviewImage: null,
            functionPreviewVisible: false,
        }
        this.getPackExeFileTree();
    }

    getPackExeFileTree = () => {
        let pack_id = '99df9525-2b59-44cd-b736-60690a852239';//TODO 暂时用的是1.6.26-libjsound.so
        if (this.props.location.state !== undefined) {
            pack_id = this.props.location.state.pack_id;
        }
        RestReq.asyncGet(this.getPackExeFileTreeCB, '/firmware-analyze/fw_analyze/pack/exec_files_tree', { pack_id, tree_type: 'antd' });
    }

    getPackExeFileTreeCB = (data) => {
        // 检查响应的payload数据是数组类型
        if (data.code !== 'ERROR_OK' && !(data.payload instanceof Array))
            return;

        this.generateFileList(data.payload);
        this.setState({ fileTreeData: data.payload });
    }

    generateFileList = (data) => {
        for (let i = 0; i < data.length; i++) {
            fileListData.push({ key: data[i].key, title: data[i].title, file_path: data[i].file_path });
            if (data[i].children.length > 0) {
                this.generateFileList(data[i].children);
            }
        }
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

    isVisibleProgress = () => {
        if (this.state.selectedFirmwareTaskId !== '' && this.state.percentage !== 100) {
            return true;
        }
        return false;
    }

    getFunctionsCB = (data) => {
        let functions = [];
        if (data.code !== 'ERROR_OK')
            return;

        let functionTreeData = this.state.functionTreeData;
        let functionsListData = this.state.functionsListData;
        let expandedFunctionKeys = this.state.expandedFunctionKeys;
        functions = data.payload.functions.map((item, index) => {
            let functionItem = DeepClone(item);
            functionItem.index = index + 1;
            functionItem.key = index + 1;
            let treeDataitem = { title: functionItem.name, key: functionItem.addr, };
            //let expandedKeyItem = { key: functionItem.addr,}
            functionTreeData.push(treeDataitem);
            functionsListData.push(treeDataitem);
            expandedFunctionKeys.push(functionItem.addr);
            return functionItem;
        })
        this.setState({ isFunctionAreaVisible: true, firmwareFunctionList: functions, functionTreeData, functionsListData, expandedFunctionKeys, percentage: 100 });
    }

    getAsyncFunction = (firmware) => {
        if (firmware !== null) {
            // 根据firmware查询返回所有的函数 中间函数 汇编函数等
            RestReq.asyncGet(this.getAsyncFunctionsCB, '/firmware-analyze/fw_analyze/async_funcs/list', { file_id: firmware.firmware_id, }, { token: false });
            this.setState({ selectedFirmwareId: firmware.firmware_id, percentage: 0, functionTreeData: [], functionsListData: [], code: '' });
            message.info("开始抽取函数");
        }
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

    getFirmwareInfo = (rowData) => {
        const firmwareList = this.state.firmwareList;
        for (let data of firmwareList) {
            if (data.key === rowData.key) {
                return data;
            }
        }
        return null;
    }

    constructListData = (functions) => {
        let methods = [];
        for (let fun of functions) {
            let item = { name: fun.name, key: fun.addr, };
            methods.push(item);
        }
        return methods;
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
            this.setState({ percentage: data.payload.percentage, functionTreeData: [], functionsListData: [], });
            message.info("函数抽取进度：" + data.payload.percentage);
            return;
        }
        let functionTreeData = [];
        let functionsListData = [];
        let expandedFunctionKeys = [];
        functions = data.payload.result.functions.map((item, index) => {
            let functionItem = DeepClone(item);
            functionItem.index = index + 1;
            functionItem.key = index + 1;
            let treeDataitem = { title: functionItem.name, key: functionItem.addr, };
            //let expandedKeyItem = { key: functionItem.addr,}
            functionTreeData.push(treeDataitem);
            functionsListData.push(treeDataitem);
            expandedFunctionKeys.push(functionItem.addr);
            return functionItem;
        })
        this.setState({ firmwareFunctionList: functions, functionTreeData, functionsListData, expandedFunctionKeys, percentage: 100 });
    }

    getFunctionCodeCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        }
        // 根据method去后台取对应的函数代码
        this.setState({ vexCode: data.payload.vex, asmCode: data.payload.asm, });
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
            const firmware_id = this.state.selectedFirmwareId;
            RestReq.asyncGet(this.getFunctionCodeCB, '/firmware-analyze/fw_analyze/cfg/func_info', { file_id: firmware_id, func_addr: selectedKeys[0] });
            this.setState({ selectedFirmwareFunctionId: selectedKeys[0] });
        }
    }

    getFileInfo = (key) => {
        let fileName = '';
        let filePath = '';
        let fileInfo = {};
        for (let item of fileListData) {
            if (item.key === key) {
                fileName = item.title;
                filePath = item.file_path;
                fileInfo = { title: fileName, path: filePath };
                break;
            }
        }
        return fileInfo;
    }

    onSelectFile = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            let fileInfo = this.getFileInfo(selectedKeys[0]);
            // 根据firmware查询返回所有的函数 中间函数 汇编函数等
            let fileId = '15e064d0-5153-4961-b32d-a5679290c6af';//TODO 暂时数据 selectedKeys[0]
            RestReq.asyncGet(this.getFunctionsCB, '/firmware-analyze/fw_analyze/cfg/func_list', { file_id: fileId });//selectedKeys[0] 2  15e064d0-5153-4961-b32d-a5679290c6af
            this.setState({ fileName: fileInfo.title, filePath: fileInfo.path, selectedFirmwareId: fileId, percentage: 0, functionTreeData: [], functionsListData: [], asmCode: '', vexCode: '' });
        }
    }

    onFileExpand = expandedFileKeys => {
        this.setState({
            expandedFileKeys,
            autoFileExpandParent: false,
        });
    };

    onFunctionExpand = expandedFunctionKeys => {
        this.setState({
            expandedFunctionKeys,
            autoFunctionExpandParent: true,
        });
    };

    getParentKey = (key, tree) => {
        let parentKey = key;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some(item => item.key === key)) {
                    parentKey = node.key;
                } else if (this.getParentKey(key, node.children)) {
                    parentKey = this.getParentKey(key, node.children);
                }
            }
        }
        return parentKey;
    };

    computeFunctionExpandKeyRateAndScroll = (index) => {
        const expandKeyNum = this.state.expandedFunctionKeys.length;
        const functionTreeLen = this.state.functionTreeData.length;
        if (functionTreeLen > 0 && expandKeyNum > 0 && document.getElementById('functionTree') !== undefined
            && document.getElementById('functionTree') !== null) {
            let scrollHeight = document.getElementById('functionTree').scrollHeight;
            let scrollValue = (parseInt)(((parseFloat(index)) / functionTreeLen) * scrollHeight);
            if (scrollValue >= 0) {
                document.getElementById('functionTree').scrollTop = scrollValue; //通过scrollTop设置滚动到指定位置
            }
        }
    }

    computeFileExpandKeyRateAndScroll = (index) => {
        const expandKeyNum = this.state.expandedFileKeys.length;
        let fileTreeLen = expandKeyNum + this.state.fileTreeData.length - 1;
        if (fileTreeLen > 0 && expandKeyNum > 0 && document.getElementById('fileTree') !== undefined
            && document.getElementById('fileTree') !== null) {
            let scrollHeight = document.getElementById('fileTree').scrollHeight;
            let scrollValue = (parseInt)(((parseFloat(index)) / fileTreeLen) * scrollHeight);
            if (scrollValue >= 0) {
                document.getElementById('fileTree').scrollTop = scrollValue; //通过scrollTop设置滚动到指定位置
            }
        }
    }

    scrollFileTree = () => {
        const { fileSearchValue } = this.state;
        if (document.getElementById('fileTree') !== undefined && fileListData.length > 0 && fileSearchValue === '') {
            document.getElementById('fileTree').scrollTop = 0;
            return;
        }
        else {
            let scrollValue = 0;
            let scrollHeight = document.getElementById('fileTree').scrollHeight;
            for (let index in fileListData) {
                if (fileListData[index].title.indexOf(fileSearchValue) > -1) {
                    scrollValue = (parseInt)(((parseFloat(index)) / fileListData.length) * scrollHeight);
                    break;
                }
            }
            if (document.getElementById('fileTree') !== undefined && scrollValue >= 0) {
                document.getElementById('fileTree').scrollTop = scrollValue; //通过scrollTop设置滚动到指定位置
            }
        }
    }

    onFileInputChange = e => {
        const { value } = e.target;
        const { fileTreeData } = this.state;
        const expandedFileKeys = fileListData
            .map(item => {
                if (item.title.indexOf(value) > -1) {
                    return this.getParentKey(item.key, fileTreeData);
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        if (value === '') {
            this.setState({
                expandedFileKeys: [],
                fileSearchValue: value,
                autoFileExpandParent: false,
            });
        } else {
            this.setState({
                expandedFileKeys,
                fileSearchValue: value,
                autoFileExpandParent: true,
            });
        }
    };

    onMethodInputChange = e => {
        const { value } = e.target;
        // const { functionTreeData } = this.state;
        // if (functionTreeData.length > 0) {
        //     this.scrollFunctionTree();
        // }
        this.setState({
            functionSearchValue: value,
            autoFunctionExpandParent: true,
        });
    };

    onMethodSearch = () => {
        const { functionTreeData } = this.state;
        if (functionTreeData.length > 0) {
            this.scrollFunctionTree();
        }
    }

    scrollFunctionTree = () => {
        const { functionSearchValue, functionTreeData } = this.state;
        if (document.getElementById('functionTree') !== undefined && functionSearchValue === '') {
            document.getElementById('functionTree').scrollTop = 0;
            return;
        } else {
            let scrollValue = 0;
            let scrollHeight = document.getElementById('functionTree').scrollHeight;
            for (let index in functionTreeData) {
                if (functionTreeData[index].title.indexOf(functionSearchValue) > -1) {
                    scrollValue = (parseInt)(((parseFloat(index)) / functionTreeData.length) * scrollHeight);
                    break;
                }
            }
            if (document.getElementById('functionTree') !== undefined && scrollValue >= 0) {
                document.getElementById('functionTree').scrollTop = scrollValue; //通过scrollTop设置滚动到指定位置
            }
        }
    }

    handleFunctionPreviewCancel = () => this.setState({ functionPreviewVisible: false });

    getGraphInfoCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        } else {
            this.setState({functionPreviewImage: data.payload.call_graph, functionPreviewVisible: true});
        }
    }

    getGraphInfo = () => {
        const firmware_id = this.state.selectedFirmwareId;
        const method_id = this.state.selectedFirmwareFunctionId;
        RestReq.asyncGet(this.getGraphInfoCB, '/firmware-analyze/fw_analyze/cfg/call_graph_a', { file_id: firmware_id, func_addr: method_id });
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

        const { functionPreviewVisible, functionPreviewImage, fileName, filePath, functionSearchValue, expandedFunctionKeys, autoFunctionExpandParent,
            fileSearchValue, expandedFileKeys, autoFileExpandParent, isFunctionAreaVisible,
            fileTreeData, functionTreeData, scrollWidth, scrollHeight } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        let self = this;

        let firstFunctionMatchedIndex = 0;
        let scrollFunction = false;
        const loopFunctionTree = data =>
            data.map(item => {
                const index = item.title.indexOf(functionSearchValue);
                if (index > -1 && !scrollFunction) {
                    this.computeFunctionExpandKeyRateAndScroll(firstFunctionMatchedIndex);
                    scrollFunction = true;
                }
                firstFunctionMatchedIndex++;
                const beforeStr = item.title.substr(0, index);
                const afterStr = item.title.substr(index + functionSearchValue.length);
                const title =
                    index > -1 ? (
                        <span>
                            {beforeStr}
                            <span style={{ color: 'red' }}>{functionSearchValue}</span>
                            {afterStr}
                        </span>
                    ) : (
                            <span>{item.title}</span>
                        );
                if (item.children) {
                    return { title, key: item.key, children: loopFunctionTree(item.children) };
                }

                return {
                    title,
                    key: item.key,
                };
            });

        let firstFileMatchedIndex = 0;
        let scrollTree = false;
        const loopFileTree = data =>
            data.map(item => {
                const index = item.title.indexOf(fileSearchValue);
                if (index > -1 && !scrollTree) {
                    this.computeFileExpandKeyRateAndScroll(firstFileMatchedIndex);
                    scrollTree = true;
                }
                firstFileMatchedIndex++;
                const beforeStr = item.title.substr(0, index);
                const afterStr = item.title.substr(index + fileSearchValue.length);
                const title =
                    index > -1 ? (
                        <span>
                            {beforeStr}
                            <span style={{ color: 'red' }}>{fileSearchValue}</span>
                            {afterStr}
                        </span>
                    ) : (
                            <span>{item.title}</span>
                        );
                if (item.children) {
                    return { title, key: item.key, children: loopFileTree(item.children) };
                }

                return {
                    title,
                    key: item.key,
                };
            });

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Row style={{ marginTop: 10, width: scrollWidth + 10 }}>
                        <Col span={6}>
                            <Search id='fileSearchInput' placeholder="文件搜索" onChange={this.onFileInputChange} />
                            <div id='fileTree' className={classes.fileTreeContainer}>
                                <Tree
                                    onSelect={this.onSelectFile}
                                    onExpand={this.onFileExpand}
                                    expandedKeys={expandedFileKeys}
                                    autoExpandParent={autoFileExpandParent}
                                    //treeData={fileTreeData}
                                    treeData={loopFileTree(fileTreeData)}
                                />
                            </div>
                        </Col>
                        {isFunctionAreaVisible &&
                            <Col span={17} offset={1}>
                                <Typography variant="h6">文件信息</Typography>
                                <Row>
                                    <Col span={12}>
                                        {"文件名称：" + fileName}
                                    </Col>
                                    <Col span={12}>
                                        {"文件路径：" + filePath}
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <Col span={7} >
                                        <Search id='functionSearchInput' placeholder="函数搜索" onChange={this.onMethodInputChange} />{/*onSearch={this.onMethodSearch}  */}
                                        <div id='functionTree' className={classes.functionTreeContainer}>
                                            <Tree
                                                onSelect={this.onSelectMethod}
                                                onExpand={this.onFunctionExpand}
                                                expandedKeys={expandedFunctionKeys}
                                                autoExpandParent={autoFunctionExpandParent}
                                                treeData={loopFunctionTree(functionTreeData)}
                                            />
                                        </div>
                                    </Col>
                                    <Col span={16} offset={1}>
                                        {/* {this.state.asmCode === '' && this.state.selectedFirmwareFunctionId !== '' && <Spin style={{ marginTop: 50, marginLeft: 50 }} tip="Loading..."></Spin>} */}
                                        {this.state.asmCode !== ''
                                            && <Card title="汇编代码">
                                                <CodeMirror ref="editor" value={this.state.asmCode} /*onChange={this.updateCode}*/ options={optionsAsm} />
                                            </Card>
                                        }
                                        {this.state.vexCode !== ''
                                            && <Card title="中间代码">
                                                <CodeMirror ref="editor" value={this.state.vexCode} /*onChange={this.updateCode}*/ options={optionsVex} />
                                            </Card>
                                        }
                                        {this.state.vexCode !== ''
                                            && <Card title="函数流程图" extra={
                                                <div>
                                                    <a onClick={this.getGraphInfo.bind(this)}>详细</a>
                                                </div>
                                            }>
                                            </Card>
                                        }
                                        <Modal visible={functionPreviewVisible} footer={null} onCancel={this.handleFunctionPreviewCancel}>
                                            <img alt="functionPreview" style={{ width: '100%' }} src={'data:image/jpg/png/gif;base64,' + functionPreviewImage } />
                                        </Modal>
                                    </Col>
                                </Row>
                            </Col>}
                    </Row>
                </Skeleton>
            </div>
        );
    }
}

export default withStyles(styles)(FirmwareFunctionView);