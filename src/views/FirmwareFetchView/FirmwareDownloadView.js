import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { withStyles } from '@material-ui/core/styles';
import { Button, Card, Col, Icon, message, Progress, Row } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { sockMsgType } from '../../global/enumeration/SockMsgType';
import { GetWebSocketUrl } from '../../global/environment';
import MAntdCard from '../../rlib/props/MAntdCard';
import { GetMainViewHeight } from '../../utils/PageUtils';
import RestReq from '../../utils/RestReq';
import { generateUuidStr } from '../../utils/tools';

let socket = null;
const styles = theme => ({
    formControl: {
        margin: 0,
        marginLeft: 10,
    },
});

@inject('userStore')
@observer
class FirmwareDownloadView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            protocol: 'HTTP',
            url: '',
            percent: 0,
            user: 'ftpuser',
            password: 'Pass4fp',
            task_id: '',
        }
    }

    componentDidMount() {
        // 增加监听器，侦测浏览器窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({ scrollHeight: GetMainViewHeight() });
        // 开启300毫秒的定时器
        // timer300mS = setInterval(() => this.timer300msProcess(), 300);

        // 开启 websocket ，实时获取下载固件进度
        this.openWebsocket();
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


    handleProtocolChange = event => {
        this.setState({ url: '', protocol: event.target.value });
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
        if (message.type === sockMsgType.FIRMWARE_INFO && this.state.task_id === message.payload.task_id) {
            this.setState({ percent: message.payload.percentage });
            if (message.payload.percentage === 100) {
                let onCallback = this.props.onCallback;
                onCallback(1, 10);
            }
        } else {
            // 其它消息类型不做处理
        }
    }

    openWebsocket = () => {
        let self = this;
        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            console.log("您的浏览器支持WebSocket");
            //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接  
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

    getFirmwareInfoCB = (data) => {
        if (data.code === 'ERROR_OK') {
            message.info('固件开始下载！');
            this.setState({task_id: data.payload.task_id});
        }
    }

    getFirmwareInfo = event => {//firmware-analyze/
        if (this.checkProtocolRules()) {
            // 把进度条设置成0
            const { user, password } = this.state;
            this.setState({ percent: 0 });
            if (this.state.protocol === 'HTTP') {
                RestReq.asyncPost(this.getFirmwareInfoCB, '/firmware-analyze/fw_fetch/async_funcs/download', { url: this.state.url });
            } else {
                RestReq.asyncPost(this.getFirmwareInfoCB, '/firmware-analyze/fw_fetch/async_funcs/download', { url: this.state.url, user, password });
            }
        } else {
            message.info('URL输入错误，请重新输入URL');
        }
    }

    handleUserChange = event => {
        this.setState({ user: event.target.value });
    }

    handlePasswordChange = event => {
        this.setState({ password: event.target.value });
    }

    isFTPProtocol = () => {
        if (this.state.protocol === 'FTP') {
            return true;
        }
        return false;
    }

    getOption() {
        return {
            tooltip: {
                formatter: "{a} <br/>{b} : {c}%"
            },
            series: [
                {
                    name: '下载进度',
                    type: 'gauge',
                    radius: "90%",
                    center: ['50%', '40%'],
                    detail: { formatter: '{value}%' },
                    data: [{ value: 50, name: '当前进度' }]
                }
            ]
        };
    }

    render() {
        const userStore = this.props.userStore;
        const { classes } = this.props;
        let self = this;
        let percent = this.state.percent;
        if (percent !== 0) {
            //percent = (this.state.percent * 100).toFixed(2);
        }
        //let option = this.getOption();
        //option.series[0].data[0].value = (percent * 100).toFixed(2) - 0;
        return (
            <div>
                <Card title={'固件下载'} /*extra={this.getExtra()}*/ style={{ height: '100%' }} headStyle={MAntdCard.headerStyle('default')}>
                    <Row>
                        <Col span={18}>
                            <Row>
                                <Col span={6} style={{ marginTop: 30 }}>
                                    <RadioGroup value={this.state.protocol} onChange={this.handleProtocolChange.bind(this)} row>
                                        <FormControlLabel value='FTP' control={<Radio />} label="FTP" />
                                        <FormControlLabel value="HTTP" control={<Radio />} label="HTTP" />
                                    </RadioGroup>
                                </Col>
                                <Col span={12}>
                                    <FormControl margin="normal" required fullWidth>
                                        <InputLabel>URL链接</InputLabel>
                                        <Input name="URL" id="URL" value={this.state.url} onChange={this.handleURLChange.bind(this)} />
                                    </FormControl>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={5}>
                                    <FormControl disabled={!this.isFTPProtocol()} margin="normal" required fullWidth>
                                        <InputLabel>用户名</InputLabel>
                                        <Input id="user" name="user" autoFocus value={this.state.user} onChange={this.handleUserChange.bind(this)} />
                                    </FormControl>
                                </Col>
                                <Col span={5} offset={1}>
                                    <FormControl disabled={!this.isFTPProtocol()} margin="normal" required fullWidth>
                                        <InputLabel>密码</InputLabel>
                                        <Input id="password" type="password" value={this.state.password} onChange={this.handlePasswordChange.bind(this)} />
                                    </FormControl>
                                </Col>
                                <Col span={5} offset={1} style={{ marginTop: 25 }} >
                                    <Button type="primary" size="large" onClick={this.getFirmwareInfo.bind(this)}><Icon type="download" />下载固件</Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={6}>
                            <Progress
                                // strokeColor={{
                                //     '0%': '#87d068',
                                //     '100%': '#fffbe5',
                                // }}
                                strokeColor='#87d068' strokeWidth='10' type="circle" percent={percent} />
                            {/* <ReactEcharts option={option} /> */}
                        </Col>
                    </Row>
                </Card>
                <br />
            </div>
        );
    }
}

export default withStyles(styles)(FirmwareDownloadView);
