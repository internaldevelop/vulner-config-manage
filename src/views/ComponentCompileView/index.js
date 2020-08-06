import { withStyles } from '@material-ui/core/styles';
import { Button, Card, Col, message, Row, Skeleton, Select, Table } from 'antd';
// import Typography from '@material-ui/core/Typography';
import Typography from '../../modules/components/Typography';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { sockMsgType } from '../../global/enumeration/SockMsgType';
import { GetWebSocketUrl } from '../../global/environment';
import MAntdCard from '../../rlib/props/MAntdCard';
import MAntdTable from '../../rlib/props/MAntdTable';
import MEvent from '../../rlib/utils/MEvent';
import { generateUuidStr } from '../../utils/tools';
import { columns as Column } from './Column';
import CompileParamsConfig from './CompileParamsConfig';
import SourceCodeView from './SourceCodeView';
import { DeepClone, DeepCopy } from '../../utils/ObjUtils';
import RestReq from '../../utils/RestReq';

let outerBox;
let consoleBox;
let timer300ms = undefined;
let scrollTimer = undefined;
let socket = null;
let SCROLL_HEIGHT = 600;
const DEFAULT_PAGE_SIZE = 10;
const Option = Select.Option;

const styles = theme => ({
    macro: {
        boxSizing: 'border-box',
        width: '100%',
        height: SCROLL_HEIGHT,
        overflowY: 'auto',
        fontSize: 13,
        padding: 10,
        background: 'rgba(17, 24, 50, 1)',
        //marginTop: 30,
    },
    content: {
        width: '100%',
        overFlow: 'hidden',
        //marginRight: 10,
        color: '#9bb7ef',
    },
    clickRow: {
        backgroundColor: '#bae7ff',
    },
    formControl: {
        minWidth: 340,
    },
});

@inject('userStore')
@observer
class ComponentCompileView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            selectRowIndex: -1,
            componentsList: [],
            showConfig: false,
            showSourceCode: false,
            columns: Column(),
            arch: 'x86',
            task_id: '',
            dirPath: '',
            fileNum: '',
            loading: true,
            content: '',
        }
        this.getAllComponets();
    }

    getAllComponetsCB = (data) => {
        let componentsList = [];
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;

        componentsList = data.payload.map((item, index) => {
            let componentItem = DeepClone(item);
            componentItem.index = index + 1;
            componentItem.key = index + 1;
            return componentItem;
        })
        this.setState({ componentsList });
    }

    getAllComponets = () => {
        RestReq.asyncGet(this.getAllComponetsCB, '/firmware-analyze/component/async_funcs/list');
    }

    getComponetSource = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请选择一个组件进行查看！");
            return;
        }
        this.setState({ showSourceCode: true });
    }

    handleSelectCompileResult = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请选择一个组件进行查看！");
            return;
        }
        const { selectRowIndex, componentsList } = this.state;
        const compileItem = componentsList[selectRowIndex - 1];
        if (compileItem.compile === 1) {
            this.setState({ showConfig: true });
        } else {
            message.info("请先成功编译当前组件！");
        }
    }

    getCompileItem = () => {
        const { selectRowIndex, componentsList } = this.state;
        const compileItem = componentsList[selectRowIndex - 1];
        return compileItem;
    }

    handleCloseConfig = (isOk) => {
        this.setState({ showConfig: false });
    }

    handleCloseSourceCode = (isOk) => {
        this.setState({ showSourceCode: false });
    }

    componentDidMount() {
        MEvent.register('my_select_compile_result', this.handleSelectCompileResult);
        outerBox = this.outerContainer;
        consoleBox = this.consolecontainer;
        scrollTimer = setInterval(this.scroll, 1);

        // 开启 websocket ，实时获取编译内容
        this.openWebsocket();
    }

    componentWillUnmount() {
        MEvent.unregister('my_select_compile_result', this.handleSelectCompileResult);
        // 清除定时器
        clearInterval(scrollTimer);
        if (socket != null)
            socket.close();
    }

    openWebsocket = () => {
        let self = this;
        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            console.log("您的浏览器支持WebSocket");
            //实现化WebSocket对象，指定要连接的服务器地址与端口建立连接  
            socket = new WebSocket(GetWebSocketUrl() + 'asset_info' + generateUuidStr());
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

    processSockMessage = (data) => {
        let message = JSON.parse(data);
        if (message.type === sockMsgType.FIRMWARE_INFO && this.state.task_id === message.payload.task_id) {
            if (message.payload.result !== undefined) {
                if (message.payload.percentage === 100) {
                    let end = '\n 编译完成！'
                    this.updateCompileContent(message.payload.result + end);
                    this.getAllComponets();
                } else {
                    this.updateCompileContent(message.payload.result);
                }
            }
        } else {
            // 其它消息类型不做处理
        }
    }

    compileComponentCB = (data) => {
        if (data.code !== 'ERROR_OK') {
            return;
        }
        let content = '正在编译' + this.getCompileItem().file_path + ' ......';
        this.setState({ content, task_id: data.payload.task_id });
    }

    compileComponent = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请选择一个组件进行编译！");
            return;
        }
        RestReq.asyncGet(this.compileComponentCB, '/firmware-analyze/component/async_funcs/compile', { arch: this.state.arch, pack_id: this.getCompileItem().pack_id });
    }

    updateCompileContent = (data) => {
        let content = this.state.content;
        content = content + '\n' + data;
        this.setState({ content });
    }

    //滚动
    scroll = () => {
        if (outerBox.scrollTop + 100 >= SCROLL_HEIGHT) {
            outerBox.scrollTop = consoleBox.scrollHeight;
        } else {
            outerBox.scrollTop++;
        }
    }

    beforeUpload = (directory, files) => {
        let dirName = directory.webkitRelativePath;
        if (dirName !== undefined && dirName.indexOf('/') > 0) {
            let dirPath = dirName.substring(0, dirName.indexOf('/'));
            let fileNum = files.length;
            this.setState({ dirPath, fileNum });
        }
    }

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {//&& 判断是否为最后一个文件
            this.setState({ loading: false });
            return;
        }
    };

    setRowClassName = (record) => {
        const { classes } = this.props;
        const { selectRowIndex } = this.state;
        return (selectRowIndex === record.index) ? classes.clickRow : '';
    }

    onRow = (record) => {
        return {
            onClick: (event) => {
                // 设置当前选中行
                this.setState({ selectRowIndex: record.index });
            },
        };
    }

    handlePageChange = (currentPage, pageSize) => {
        this.setState({ currentPage, pageSize });
    }

    handlePropChange = (value) => {
        this.setState({ arch: value });
    }

    render() {
        const { classes } = this.props;
        const userStore = this.props.userStore;
        const { columns, componentsList, showConfig, showSourceCode } = this.state;
        let self = this;

        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Row>
                    <Col span={12}>
                        <Card title={'组件源码选择'} style={{ height: 750, margin: 8 }} headStyle={MAntdCard.headerStyle('main')}>
                            <Table
                                columns={columns}
                                dataSource={componentsList}
                                bordered={true}
                                rowKey={record => record.uuid}
                                rowClassName={this.setRowClassName}
                                onRow={this.onRow}
                                pagination={MAntdTable.pagination(self.handlePageChange)}
                            />
                            <br />
                            <Row>
                                <Col span={3} style={{ marginTop: 10 }}>
                                    <Typography variant="paragraph">编译参数：</Typography>
                                </Col>
                                <Col span={6}>
                                    <Select size='large' placeholder='选择编译参数' defaultValue='x86' style={{ width: 200 }} onChange={this.handlePropChange.bind(this)}>
                                        <Option value="x86">X86</Option>
                                        <Option value="arm">ARM</Option>
                                        <Option value="mtps">MTPS</Option>
                                        <Option value="powerpc">PowerPC</Option>
                                    </Select>
                                </Col>
                                <Col span={3} offset={1}>
                                    <Button size={'large'} type='primary' onClick={this.compileComponent}>执行组件编译</Button>
                                </Col>
                                <Col span={3} offset={1}>
                                    <Button size={'large'} type='primary' onClick={this.getComponetSource}>查看源码文件</Button>
                                </Col>
                                <Col span={3} offset={1}>
                                    <Button size={'large'} type='primary' onClick={this.handleSelectCompileResult}>查看编译结果</Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={'编译信息'} style={{ height: 750, margin: 8 }} headStyle={MAntdCard.headerStyle('info-2')}>
                            <div className={classes.macro} ref={(c) => { this.outerContainer = c }}>
                                <div id='consolecontainer' ref={(c) => { this.consolecontainer = c }} >
                                    <p className={classes.content}>{this.state.content}</p>
                                </div >
                            </div>
                        </Card>
                    </Col>
                </Row>
                {showConfig && <CompileParamsConfig compileID={this.getCompileItem().pack_id} compileName={this.getCompileItem().name} actioncb={this.handleCloseConfig} />}
                {showSourceCode && <SourceCodeView compileID={this.getCompileItem().pack_id} compileName={this.getCompileItem().name} actioncb={this.handleCloseSourceCode} />}
                {/* <Row>
                        <Col span={10}>
                            <FormControl disabled margin="normal" fullWidth>
                                <InputLabel>组件源文件目录：</InputLabel>
                                <Input id="path" name="path" autoFocus value={this.state.dirPath} />
                            </FormControl>
                        </Col>
                        <Col span={8} offset={1}>
                            <FormControl disabled margin="normal" fullWidth>
                                <InputLabel>源文件数目：</InputLabel>
                                <Input id="number" type="number" value={this.state.fileNum} />
                            </FormControl>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col span={3} offset={6}>
                            <Upload
                                //listType="picture-card"
                                //className="avatar-uploader"
                                showUploadList={false}
                                //action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                beforeUpload={this.beforeUpload}
                                onChange={this.handleChange}
                                directory
                            >
                                <Button size={'large'} type='primary' style={{ marginRight: 100 }}>选择目录</Button>
                            </Upload>
                        </Col>
                        <Col span={3} offset={1}>
                            <Button disabled={this.state.loading} size={'large'} type='primary' onClick={this.updateCompileContent}>执行编译</Button>
                        </Col>
                        <Col span={3} offset={1}>
                            <Button disabled={this.state.loading} size={'large'} type='primary' onClick={this.updateCompileContent}>查看结果</Button>
                        </Col>
                    </Row>
                    <div className={classes.macro} ref={(c) => { this.outerContainer = c }}>
                        <div id='consolecontainer' ref={(c) => { this.consolecontainer = c }} >
                            <p className={classes.content}>{this.state.content}</p>
                        </div >
                    </div> */}
            </Skeleton>
        );
    }
}

export default withStyles(styles)(ComponentCompileView);