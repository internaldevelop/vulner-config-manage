import React from 'react';
import ReactDOM from 'react-dom';
import { inject, observer } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { Card, Button, Col, message, Row, Skeleton, Upload } from 'antd';
import { sockMsgType } from '../../global/enumeration/SockMsgType';
import { GetWebSocketUrl } from '../../global/environment';
import { generateUuidStr } from '../../utils/tools';
import MAntdCard from '../../rlib/props/MAntdCard';


let outerBox;
let consoleBox;
let speed;
let timer300ms = undefined;
let scrollTimer = undefined;
let socket = null;

const styles = theme => ({
    macro: {
        boxSizing: 'border-box',
        width: '100%',
        height: 600,
        overflowY: 'auto',
        fontSize: 13,
        padding: 10,
        background: 'rgba(17, 24, 50, 1)',
        marginTop: 30,
    },
    content: {
        width: '100%',
        overFlow: 'hidden',
        marginRight: 10,
        color: '#9bb7ef',
    },
});

@inject('userStore')
@observer
class ComponentCompileView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
    }

    componentDidMount() {
        outerBox = this.outerContainer;
        consoleBox = this.consolecontainer;
        speed = 10;
        scrollTimer = setInterval(this.scroll, speed);
        //timer300ms = setInterval(() => this.updateCompileContent(), 300);

        // 开启 websocket ，实时获取编译内容
        this.openWebsocket();
    }

    componentWillUnmount() {
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
            this.setState({dirPath, fileNum});
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

    render() {
        //const {  } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        let self = this;

        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Card title={'组件编译'} /*extra={this.getExtra()}*/ style={{ height: '100%' }} headStyle={MAntdCard.headerStyle('default')}>
                    <Row>
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
                    </div>
                </Card>
            </Skeleton>
        );
    }
}

export default withStyles(styles)(ComponentCompileView);