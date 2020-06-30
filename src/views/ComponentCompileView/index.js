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

let outerBox;
let consoleBox;
let speed;
let timer300ms = undefined;
let scrollTimer = undefined;
let socket = null;
const DEFAULT_PAGE_SIZE = 10;
const Option = Select.Option;
//const { Text, Title } = Typography;

const styles = theme => ({
    macro: {
        boxSizing: 'border-box',
        width: '100%',
        height: 600,
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

let list = [
    { index: 1, title: '水电终端-41', type: 'v1.1', fileNum: 130, compile_result: 1 },
    { index: 2, title: '水电终端-42', type: 'v1.3', fileNum: 120, compile_result: 2 },
    { index: 3, title: '水电终端-43', type: 'v1.11', fileNum: 110, compile_result: 3 },
    { index: 4, title: '水电终端-44', type: 'v12.112', fileNum: 30, compile_result: 0 },];

@inject('userStore')
@observer
class ComponentCompileView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            selectRowIndex: -1,
            componetsList: list,
            showConfig: false,
            columns: Column(),
            dirPath: '',
            fileNum: '',
            loading: true,
            content: 'IRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
                '\nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}',
        }
        //this.getAllComponets();
    }

    getAllComponets = () => {
        this.setState({ componetsList: list });
    }

    handleSelectCompileResult = () => {
        this.setState({ showConfig: true });
    }

    getCompileID = () => {
        const { selectRowIndex, componetsList } = this.state;
        const compileItem = componetsList[selectRowIndex];
        return compileItem.uuid;
    }

    handleCloseConfig = (isOk) => {
        this.setState({ showConfig: false });
    }

    componentDidMount() {
        MEvent.register('my_select_compile_result', this.handleSelectCompileResult);
        outerBox = this.outerContainer;
        consoleBox = this.consolecontainer;
        speed = 10;
        scrollTimer = setInterval(this.scroll, speed);
        //timer300ms = setInterval(() => this.updateCompileContent(), 300);

        // 开启 websocket ，实时获取编译内容
        this.openWebsocket();
    }

    componentWillUnmount() {
        MEvent.unregister('my_select_compile_result', this.handleSelectCompileResult);
        // 清除定时器
        clearInterval(timer300ms);
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
            if (message.payload.content !== undefined) {
                this.updateCompileContent(message.payload.content);
            }
        } else {
            // 其它消息类型不做处理
        }
    }

    updateCompileContent = (data) => {
        if (this.state.selectRowIndex < 0) {
            message.info("请选择一个组件进行编译！");
            return;
        }
        let content = this.state.content;
        content = content + //data
            'hello t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            'tttt t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            'tttt IRSB t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            'tttt IRSB t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            '  tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}' +
            ' tttt  wowo  \nIRSB \{t0:Ity_I32 t1:Ity_I64 t2:Ity_I64 t3:Ity_I64 00 | ------ IMark(0x4003e0, 6, 0) ------01 | t2 = LDle:I64(0x0000000000601018)NEXT: PUT(rip) = t2; Ijk_Boring}';

        this.setState({ content });
    }

    //滚动
    scroll = () => {
        if (outerBox.scrollTop + 100 >= consoleBox.scrollHeight) {
            outerBox.scrollTop = 0;
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

    isSelectedSuccessItem = () => {
        // const { selectRowIndex, componetsList } = this.state;
        // const compileItem = componetsList[selectRowIndex];
        // if (compileItem.compile_result === 1) {
        //     return true;
        // }
        return true;
    }

    handlePropChange = (event) => {
    }

    render() {
        //const {  } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        const { columns, componetsList, showConfig } = this.state;
        let self = this;

        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Row>
                    <Col span={12}>
                        <Card title={'组件选择'} style={{ height: '100%', margin: 8 }} headStyle={MAntdCard.headerStyle('main')}>
                            <Table
                                columns={columns}
                                dataSource={componetsList}
                                bordered={true}
                                rowKey={record => record.uuid}
                                rowClassName={this.setRowClassName}
                                onRow={this.onRow}
                                pagination={MAntdTable.pagination(self.handlePageChange)}
                            />
                            <br />
                            <Row>
                                <Col span={3}>
                                    <Typography variant="subtitle1" style={{ marginTop: 5 }}>编译参数：</Typography>
                                </Col>
                                <Col span={8}>
                                    <Select size='large' placeholder='选择编译参数' style={{ width: 260 }} onChange={this.handlePropChange.bind(this)}>
                                        <Option value="ARM">ARM</Option>
                                        <Option value="X86">X86</Option>
                                        <Option value="MTPS">MTPS</Option>
                                        <Option value="PowerPC">PowerPC</Option>
                                    </Select>
                                </Col>
                                <Col span={3} offset={1}>
                                    <Button size={'large'} type='primary' onClick={this.updateCompileContent}>执行编译</Button>
                                </Col>
                                <Col span={3} offset={1}>
                                    <Button disabled={!this.isSelectedSuccessItem()} size={'large'} type='primary' onClick={this.handleSelectCompileResult}>查看结果</Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={'编译信息'} style={{ height: '100%', margin: 8 }} headStyle={MAntdCard.headerStyle('info-2')}>
                            <div className={classes.macro} ref={(c) => { this.outerContainer = c }}>
                                <div id='consolecontainer' ref={(c) => { this.consolecontainer = c }} >
                                    <p className={classes.content}>{this.state.content}</p>
                                </div >
                            </div>
                        </Card>
                    </Col>
                </Row>
                {showConfig && <CompileParamsConfig compileID={this.getCompileID} actioncb={this.handleCloseConfig} />}
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