import { withStyles } from '@material-ui/core/styles';
import CodeMirror from '@uiw/react-codemirror';
import { Modal, Card, Col, Input, message, Row, Spin, Select, Skeleton, Tree } from 'antd';
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
import Typography from '../../modules/components/Typography';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { sockMsgType } from '../../global/enumeration/SockMsgType';
import { GetWebSocketUrl } from '../../global/environment';
import { DeepClone } from '../../utils/ObjUtils';
import RestReq from '../../utils/RestReq';
import { generateUuidStr } from '../../utils/tools';
import MAntdCard from '../../rlib/props/MAntdCard';
import MStatCardNoIcon from '../../rlib/antdComponents/MStatCardNoIcon';
import FileDetailInfo from './FileDetailInfo';

let socket = null;
let fileListData = [];
let expandedChildNum = 0;
let firstMatchedIndex = 0;
const { Search } = Input;
const File_TREE_HEIGHT = 1000;
const Function_TREE_HEIGHT = 1000;
const SCROLL_HEIGHT = 1200;
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
        height: File_TREE_HEIGHT,
    },
    functionTreeContainer: {
        border: 1,
        borderColor: '#e8e8e8',
        borderRadius: 4,
        overflow: 'auto',
        overflowX: 'hidden',
        height: Function_TREE_HEIGHT,
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
            scrollHeight: SCROLL_HEIGHT,
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
            percentage: 0,
            expandedFunctionKeys: [],
            expandedKeyNum: 0,
            functionSearchValue: '',
            autoFunctionExpandParent: true,
            expandedFileKeys: [],
            fileSearchValue: '',
            autoFileExpandParent: true,
            isFunctionAreaVisible: false,
            functionPreviewImage: null,
            functionPreviewVisible: false,
            controlPreviewImage: null,
            controlPreviewVisible: false,
            dependencyPreviewImage: null,
            dependencyPreviewVisible: false,
            stats: this.initFileStats(),
            showExtraInfo: false,
            functionName: '',
            functionDefinition: '',
            functionParameterList: [],
            functionReturnValue: '',
            functionMemoryValues: [],
            functionRegisterValues: [],
            loading: false,
            extraInfo: {},
        }
        this.getPackExeFileTree();
    }

    getPackExeFileTree = () => {
        let pack_id = '';//TODO 暂时用的是1.6.26-libjsound.so
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

    initFileStats() {
        let stats = [];
        stats.push({ name: 'stackSize', title: '栈空间大小', value: 112893, icon: 'database', bgColor: '#DEF2DD', fgColor: 'black' });
        stats.push({ name: 'heapSize', title: '堆空间大小', value: 812893, icon: 'like', bgColor: '#F3E6FA', fgColor: 'black' });
        stats.push({ name: 'arguments', title: '函数参数', value: 'test int\ntest2 flost', fontSize: 28, icon: 'dislike', bgColor: '#FFF2CC', fgColor: 'red' });
        stats.push({ name: 'returns', title: '函数返回值', value: 'test 10000', fontSize: 28, icon: 'eye', bgColor: '#DDEBFF', fgColor: 'green' });
        stats.push({ name: 'types', title: '变量类型', value: 'int a int b string c', fontSize: 28, icon: 'check-circle', bgColor: '#DEF2DD', fgColor: 'green' });
        return stats;
    }

    componentDidMount() {
        // 开启300毫秒的定时器
        // timer300mS = setInterval(() => this.timer300msProcess(), 300);

        // 开启 websocket ，实时获取固件抽取进度
        //this.openWebsocket();
    }

    componentWillUnmount() {
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

    getFunctionsCB = (data) => {
        let functions = [];
        if (data.code !== 'ERROR_OK' || data.payload === undefined || data.payload.functions === undefined)
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

    getFunctionCodeCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        }

        let functionName = data.payload.function_name;
        let functionDefinition = '';
        let functionReturnValue = '';
        let functionMemoryValues = [];
        let functionRegisterValues = [];
        let functionParameterList = [];
        if (data.payload.props !== undefined && data.payload.props.prototype !== undefined && data.payload.props.prototype !== null) {
            if (data.payload.props.prototype.arguments !== undefined && data.payload.props.prototype.arguments !== null) {
                functionParameterList = data.payload.props.prototype.arguments;
            }
            if (data.payload.props.prototype.return_type !== undefined && data.payload.props.prototype.return_type !== null) {
                if (data.payload.props.prototype.return_type === undefined || data.payload.props.prototype.return_type === null) {
                    functionReturnValue = 'void ';
                } else {
                    functionReturnValue = data.payload.props.prototype.return_type;
                }
            }
        }
        if (functionReturnValue !== '') {
            functionDefinition = functionReturnValue + ' ' + functionName;
        } else {
            functionDefinition = 'void ' + functionName;
        }
        if (functionParameterList.length > 0) {
            functionDefinition = functionDefinition + ' (';
            for (let index in functionParameterList) {
                if (parseInt(index) === (functionParameterList.length - 1)) {
                    functionDefinition += functionParameterList[index].type + ')';
                } else {
                    functionDefinition += functionParameterList[index].type + ', ';
                }
            }
        }
        if (data.payload.vars !== undefined && data.payload.vars.memory_vars !== undefined) {
            // 内存变量
            functionMemoryValues = data.payload.vars.memory_vars.vars;
        }
        if (data.payload.vars !== undefined && data.payload.vars.register_vars !== undefined) {
            // 寄存器变量
            functionRegisterValues = data.payload.vars.register_vars.vars;
        }
        // 根据method去后台取对应的函数代码
        this.setState({ loading: false, functionName, functionDefinition, functionParameterList, functionReturnValue, functionMemoryValues, functionRegisterValues, vexCode: data.payload.vex, asmCode: data.payload.asm, });
    }

    onSelectMethod = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            const firmware_id = this.state.selectedFirmwareId;
            RestReq.asyncGet(this.getFunctionCodeCB, '/firmware-analyze/fw_analyze/cfg/func_info', { file_id: firmware_id, func_addr: selectedKeys[0], extra_info: 'props,vars' });
            this.setState({ loading: true, functionSearchValue: '', selectedFirmwareFunctionId: selectedKeys[0] });
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
                fileInfo = { title: fileName, path: filePath, };
                break;
            }
        }
        return fileInfo;
    }

    onSelectFile = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            let fileInfo = this.getFileInfo(selectedKeys[0]);
            // 根据firmware查询返回所有的函数 中间函数 汇编函数等
            let fileId = selectedKeys[0];
            RestReq.asyncGet(this.getFunctionsCB, '/firmware-analyze/fw_analyze/cfg/func_list', { file_id: fileId });
            this.setState({ loading: false, selectedFirmwareFunctionId: '', functionSearchValue: '', fileSearchValue: '', fileName: fileInfo.title, filePath: fileInfo.path, selectedFirmwareId: fileId, percentage: 0, asmCode: '', vexCode: '', functionTreeData: [], functionsListData: [] });
        }
    }

    onExtraInfoCB = (fileInfo) => (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined) {
            return;
        }
        let arch_name, bits, linux_name, instruction_endness = '';
        if (data.payload.arch !== undefined && data.payload.arch !== null) {
            arch_name = data.payload.arch.arch_name;
            bits = data.payload.arch.bits;
            linux_name = data.payload.arch.linux_name
            instruction_endness = data.payload.arch.instruction_endness;
        }
        let extraInfo = {
            name: fileInfo.title, entry_addr: data.payload.entry_addr, heap_base: data.payload.heap_base,
            heap_size: data.payload.heap_size, mmap_base: data.payload.mmap_base, stack_size: data.payload.stack_size,
            arch_name, bits, linux_name, instruction_endness,
        };
        //this.setState({ showExtraInfo: true, extraInfo });
        this.showExtraInfoModal(extraInfo);
    }

    showExtraInfoModal = (extraInfo) => {
        Modal.info({
            title: extraInfo.name + '可执行文件信息',
            style: ({ top: 200, minWidth: 400 }),
            content: (
                <div>
                    <Row>
                        <Col span={10}>
                            {'entry_addr: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.entry_addr}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'heap_base: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.heap_base}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'heap_size: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.heap_size}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'mmap_base: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.mmap_base}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'stack_size: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.stack_size}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'arch_name: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.arch_name}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'bits: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.bits}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10}>
                            {'linux_name: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.linux_name}
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col span={10}>
                            {'instruction_endness: '}
                        </Col>
                        <Col span={7}>
                            {extraInfo.instruction_endness}
                        </Col>
                    </Row> */}
                </div>
            )
        });
    }

    onExtraInfo = (event, node) => {
        if (event !== undefined && event !== null && event.node !== undefined && event.node !== null
            && event.node.props !== undefined && event.node.props !== null) {
            let key = event.node.props.eventKey;
            let fileInfo = this.getFileInfo(key);
            // 根据firmware查询堆栈空间、组件基址
            RestReq.asyncGet(this.onExtraInfoCB(fileInfo), '/firmware-analyze/fw_analyze/state', { file_id: key });
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

    computeFunctionExpandKeyRateAndScroll = (index) => {
        const expandKeyNum = this.state.expandedFunctionKeys.length;
        const functionTreeLen = this.state.functionTreeData.length;
        if (functionTreeLen > 0 && expandKeyNum > 0 && document.getElementById('functionTree') !== undefined
            && document.getElementById('functionTree') !== null) {
            let scrollHeight = document.getElementById('functionTree').scrollHeight;//clientHeight
            let scrollValue = (parseInt)(((parseFloat(index)) / functionTreeLen) * scrollHeight);
            if (scrollValue >= 0) {
                document.getElementById('functionTree').scrollTop = scrollValue; //通过scrollTop设置滚动到指定位置
            }
        }
    }

    computeFileExpandKeyRateAndScroll = (index) => {
        const expandedKeyNum = this.state.expandedKeyNum;
        let fileTreeLen = this.state.fileTreeData.length;
        if (fileTreeLen > 0 && expandedKeyNum > 0 && document.getElementById('fileTree') !== undefined
            && document.getElementById('fileTree') !== null) {
            let scrollHeight = document.getElementById('fileTree').scrollHeight;
            let scrollValue = (parseInt)(((parseFloat(firstMatchedIndex)) / expandedKeyNum) * scrollHeight);
            if (scrollValue >= 0 && expandedKeyNum !== fileTreeLen) {
                document.getElementById('fileTree').scrollTop = scrollValue; //通过scrollTop设置滚动到指定位置
            }
        }
    }

    getExpandedItemLen = (expandedNum, expandedFileKeys, data) => {
        for (let fileKey of expandedFileKeys) {
            for (let item of data) {
                if (item.key === fileKey) {
                    if (item.children.length > 0)
                        expandedNum += item.children.length;
                    this.getExpandedItemLen(expandedNum);
                    break;
                }
            }
        }
    }

    getParentKey = (expandedFileKeyList, key, tree) => {
        let parentKey = key;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                let isHasNode = false;
                if (node.key === key) {
                    if (firstMatchedIndex === 0) {
                        firstMatchedIndex = i + 1;
                    }
                }
                let num = 0;
                // 记录第一次匹配的节点以及所有需要展开的子节点总数
                for (let child of node.children) {
                    num++;
                    if (child.key === key) {
                        if (firstMatchedIndex === 0) {
                            firstMatchedIndex = num;
                        }
                        parentKey = node.key;
                        let isAddedList = false;
                        for (let item of expandedFileKeyList) {
                            if (item === parentKey) {
                                isAddedList = true;
                            }
                        }
                        if (!isAddedList) {
                            expandedFileKeyList.push(parentKey);
                            expandedChildNum += node.children.length;
                        }
                        isHasNode = true;
                        break;
                    }
                }
                if (!isHasNode && this.getParentKey(expandedFileKeyList, key, node.children)) {
                    parentKey = this.getParentKey(expandedFileKeyList, key, node.children);
                }
            }
        }
        return parentKey;
    };

    onFileInputSearch = value => {
        const { fileTreeData } = this.state;
        expandedChildNum = 0;
        firstMatchedIndex = 0;
        let expandedFileKeyList = [];
        const expandedFileKeys = fileListData
            .map(item => {
                if (item.title.indexOf(value) > -1) {
                    return this.getParentKey(expandedFileKeyList, item.key, fileTreeData);
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
            // TODO 展开节点数目expandedChildNum是除去第一层外其他需要展开的子节点。
            // 第一层节点数有待计算，目前是第一层都算上了
            let firstLevelExpandedNum = fileTreeData.length;//(parseInt)(fileTreeData.length / 2);
            this.setState({
                expandedKeyNum: firstLevelExpandedNum + expandedChildNum,
                expandedFileKeys,
                fileSearchValue: value,
                autoFileExpandParent: true,
            });
        }
    }

    onFileInputChange = e => {
        const { value } = e.target;
        this.onFileInputSearch(value);
    };

    onMethodInputChange = e => {
        const { value } = e.target;
        this.setState({
            functionSearchValue: value,
            autoFunctionExpandParent: true,
        });
    };

    onMethodSearch = value => {
        this.setState({
            functionSearchValue: value,
            autoFunctionExpandParent: true,
        });
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

    //handleShowExtraInfoCancel = () => this.setState({ showExtraInfo: false });

    handleFunctionPreviewCancel = () => this.setState({ functionPreviewVisible: false });

    getGraphInfoCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        } else {
            this.setState({ functionPreviewImage: data.payload.call_graph, functionPreviewVisible: true });
        }
    }

    getGraphInfo = () => {
        const firmware_id = this.state.selectedFirmwareId;
        const method_id = this.state.selectedFirmwareFunctionId;
        RestReq.asyncGet(this.getGraphInfoCB, '/firmware-analyze/fw_analyze/cfg/call_graph_a', { file_id: firmware_id, func_addr: method_id });
    }

    handleControlPreviewCancel = () => this.setState({ controlPreviewVisible: false });

    handleDependencyPreviewCancel = () => this.setState({ dependencyPreviewVisible: false });

    getControlGraphInfoCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        } else {
            this.setState({ controlPreviewImage: data.payload.cfg_graph, controlPreviewVisible: true });
        }
    }

    getControlGraphInfo = () => {
        const firmware_id = this.state.selectedFirmwareId;
        const method_id = this.state.selectedFirmwareFunctionId;
        RestReq.asyncGet(this.getControlGraphInfoCB, '/firmware-analyze/fw_analyze/cfg/cfg_graph', { file_id: firmware_id, func_addr: method_id });
    }

    getDependencyGraphInfoCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        } else {
            this.setState({ dependencyPreviewImage: data.payload.cdg_graph, dependencyPreviewVisible: true });
        }
    }

    getDependencyGraphInfo = () => {
        const firmware_id = this.state.selectedFirmwareId;
        const method_id = this.state.selectedFirmwareFunctionId;
        RestReq.asyncGet(this.getDependencyGraphInfoCB, '/firmware-analyze/fw_analyze/cfg/cdg_graph', { file_id: firmware_id, func_addr: method_id });
    }

    backPackPage = () => {

    }

    getExtra() {
        return (
            <a style={{ color: 'white' }} href="./#/home/firmware-analyze/package-fetch" >返回</a>
        );
    }

    getSpan = (stat) => {
        if (stat.name == 'stackSize' || stat.name == 'heapSize') {
            return 3;
        } else {
            return 6;
        }
    }

    handleCloseConfig = (isOk) => {
        this.setState({ showExtraInfo: false });
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

        const { extraInfo, loading, functionPreviewVisible, functionPreviewImage, functionSearchValue, expandedFunctionKeys,
            autoFunctionExpandParent, fileSearchValue, expandedFileKeys, autoFileExpandParent, isFunctionAreaVisible,
            fileTreeData, functionTreeData, scrollHeight, showExtraInfo,
            functionDefinition, functionParameterList, functionReturnValue, functionMemoryValues, functionRegisterValues } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        let self = this;

        let firstFunctionMatchedIndex = 0;
        let scrollFunction = false;
        const loopFunctionTree = data =>
            data.map(item => {
                const index = item.title.indexOf(functionSearchValue);
                if (index > -1 && !scrollFunction && functionSearchValue !== '') {
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

        let scrollTree = false;
        const loopFileTree = data =>
            data.map(item => {
                const index = item.title.indexOf(fileSearchValue);
                if (index > -1 && !scrollTree && fileSearchValue !== '') {
                    this.computeFileExpandKeyRateAndScroll();
                    scrollTree = true;
                }
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

        const { stats } = this.state;
        let statSpan = 24 / stats.length;

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Row>
                        <Col span={5}>
                            <Card title={'文件结构'} style={{ height: scrollHeight }} headStyle={MAntdCard.headerStyle('default')}>
                                <Search allowClear id='fileSearchInput' placeholder="文件搜索" onChange={this.onFileInputChange} onSearch={this.onFileInputSearch} />
                                <div id='fileTree' className={classes.fileTreeContainer}>
                                    <Tree
                                        showLine={true}
                                        showIcon={true}
                                        onSelect={this.onSelectFile}
                                        onRightClick={this.onExtraInfo}
                                        onExpand={this.onFileExpand}
                                        expandedKeys={expandedFileKeys}
                                        autoExpandParent={autoFileExpandParent}
                                        //treeData={fileTreeData}
                                        treeData={loopFileTree(fileTreeData)}
                                    />
                                </div>
                                {showExtraInfo && <FileDetailInfo extraInfo={extraInfo} actioncb={this.handleCloseConfig} />}
                            </Card>
                        </Col>
                        <Col span={19}>
                            <Row>
                                <Spin spinning={loading} size="large">
                                    <Card title={'函数信息'} extra={this.getExtra()} style={{ height: scrollHeight }} headStyle={MAntdCard.headerStyle('default')}>
                                        {isFunctionAreaVisible &&
                                            <Row>
                                                {/* <Row gutter={10}>
                                                {stats.map((stat) => (<Col span={this.getSpan(stat)}>
                                                    <MStatCardNoIcon myparams={stat} />
                                                </Col>))}
                                            </Row>
                                            <br /> */}
                                                <Col span={7} >
                                                    <Search allowClear id='functionSearchInput' placeholder="函数搜索" onChange={this.onMethodInputChange} onSearch={this.onMethodSearch} />
                                                    <div id='functionTree' className={classes.functionTreeContainer}>
                                                        <Tree
                                                            //showLine={true}
                                                            onSelect={this.onSelectMethod}
                                                            onExpand={this.onFunctionExpand}
                                                            expandedKeys={expandedFunctionKeys}
                                                            autoExpandParent={autoFunctionExpandParent}
                                                            treeData={loopFunctionTree(functionTreeData)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col span={17}>
                                                    {this.state.asmCode !== ''
                                                        && <Card title="函数详细信息" style={{ height: 200 }} headStyle={MAntdCard.headerStyle('info-2')}>
                                                            <Row>
                                                                <Col span={12}><Typography variant="subtitle2" style={{ color: 'green' }}>{functionDefinition}</Typography>
                                                                    <Row>
                                                                        {'返回值类型： ' + functionReturnValue}
                                                                    </Row>
                                                                    <Row>
                                                                        {'函数参数： ' + functionParameterList.map((parameter) => (parameter.type + ' '))}
                                                                    </Row>
                                                                </Col>
                                                                <Col span={6}><Typography variant="subtitle2" style={{ color: 'green' }}>寄存器变量</Typography>
                                                                    {functionRegisterValues.map((value) => (
                                                                        <Row>
                                                                            <Col>
                                                                                {'name:' + value.name + ', size: ' + value.size}
                                                                            </Col>
                                                                        </Row>))}
                                                                </Col>
                                                                <Col span={6}><Typography variant="subtitle2" style={{ color: 'green' }}>内存变量</Typography>
                                                                    {functionMemoryValues.map((value) => (
                                                                        <Row>
                                                                            <Col>
                                                                                {'name:' + value.name + ', size: ' + value.size}
                                                                            </Col>
                                                                        </Row>))}
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col span={12}><Typography variant="subtitle2" style={{ color: 'green' }}>{'脆弱性函数： ' + '否'}</Typography></Col>
                                                            </Row>
                                                        </Card>
                                                    }
                                                    {this.state.asmCode !== ''
                                                        && <Card title="汇编代码" headStyle={MAntdCard.headerStyle('info-2')}>
                                                            <CodeMirror height={200} ref="editor" value={this.state.asmCode} /*onChange={this.updateCode}*/ options={optionsAsm} />
                                                        </Card>
                                                    }
                                                    {this.state.vexCode !== ''
                                                        && <Card title="中间代码" headStyle={MAntdCard.headerStyle('info-2')}>
                                                            <CodeMirror height={400} ref="editor" value={this.state.vexCode} /*onChange={this.updateCode}*/ options={optionsVex} />
                                                        </Card>
                                                    }
                                                    {this.state.vexCode !== ''
                                                        && <Card title="函数调用关系图" headStyle={MAntdCard.headerStyle('info-2')} extra={
                                                            <div>
                                                                <a onClick={this.getGraphInfo.bind(this)}>详细</a>
                                                            </div>
                                                        }>
                                                        </Card>
                                                    }
                                                    <Modal visible={functionPreviewVisible} footer={null}
                                                        style={{ top: 20, minWidth: 800, minHeight: 800 }}
                                                        onCancel={this.handleFunctionPreviewCancel.bind(this)}>
                                                        <img alt="functionPreview" style={{ width: '100%', height: '100%' }} src={'data:image/jpg/png/gif;base64,' + functionPreviewImage} />
                                                    </Modal>

                                                    {/* {this.state.vexCode !== ''
                                                && <Card title="函数控制流程图" headStyle={MAntdCard.headerStyle('info-2')} extra={
                                                    <div>
                                                        <a onClick={this.getControlGraphInfo.bind(this)}>详细</a>
                                                    </div>
                                                }>
                                                </Card>
                                            }
                                            <Modal visible={controlPreviewVisible} footer={null} onCancel={this.handleControlPreviewCancel}>
                                                <img alt="controlPreview" style={{ width: '100%' }} src={'data:image/jpg/png/gif;base64,' + controlPreviewImage} />
                                            </Modal>
                                            {this.state.vexCode !== ''
                                                && <Card title="函数控制依赖图" headStyle={MAntdCard.headerStyle('info-2')} extra={
                                                    <div>
                                                        <a onClick={this.getDependencyGraphInfo.bind(this)}>详细</a>
                                                    </div>
                                                }>
                                                </Card>
                                            }
                                            <Modal visible={dependencyPreviewVisible} footer={null} onCancel={this.handleDependencyPreviewCancel}>
                                                <img alt="dependencyPreview" style={{ width: '100%' }} src={'data:image/jpg/png/gif;base64,' + dependencyPreviewImage} />
                                            </Modal> */}
                                                </Col>
                                            </Row>}
                                    </Card>
                                </Spin>
                            </Row>
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        );
    }
}

export default withStyles(styles)(FirmwareFunctionView);