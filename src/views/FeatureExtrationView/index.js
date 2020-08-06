import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { message, Card, Button, Input, Icon, Col, Row, Select, Skeleton, Table } from 'antd';
import { inject, observer } from 'mobx-react';
import MAntdCard from '../../rlib/props/MAntdCard';
import MAntdTable from '../../rlib/props/MAntdTable';
import { columns as Column } from './Column';
import Typography from '../../modules/components/Typography';
import RestReq from '../../utils/RestReq';
import { DeepClone } from '../../utils/ObjUtils';
import { sockMsgType } from '../../global/enumeration/SockMsgType';
import { GetWebSocketUrl } from '../../global/environment';
import { generateUuidStr } from '../../utils/tools';
import EllipsisText from '../../components/widgets/EllipsisText';

const DEFAULT_PAGE_SIZE = 10;
let socket = null;

const styles = theme => ({
    clickRow: {
        backgroundColor: '#bae7ff',
    },
    formControl: {
        minWidth: 340,
    },
    iconButton: {
        margin: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    actionButton: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0,
        marginTop: 0,
    },
    antInput: {
        width: 300,
    },
});

@inject('userStore')
@observer
class FeatureExtrationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            currentPage: 1,     // Table中当前页码（从 1 开始）
            selectRowIndex: -1,
            componentsList: [],
            columns: Column(),
            inputValue: '',
            featuresList: [],
            task_id: '',
        }
        this.getAllComponets();
    }

    componentDidMount() {
        // 开启 websocket ，实时获取倒排索引状态
        this.openWebsocket();
    }

    componentWillUnmount() {
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
                    this.getAllComponets();
                }
            }
        } else {
            // 其它消息类型不做处理
        }
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
        this.setState({ componentsList, featuresList: [] });
    }

    getAllComponets = () => {
        RestReq.asyncGet(this.getAllComponetsCB, '/firmware-analyze/fw_analyze/pack/com_files_list');
    }

    transferDataIndex(rowIndex) {
        // currentPage 为 Table 中当前页码（从 1 开始）
        const { currentPage, pageSize } = this.state;
        let dataIndex = (currentPage - 1) * pageSize + rowIndex;
        return dataIndex;
    }

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

    handleInputValue = (event) => {
        this.setState({
            inputValue: event.target.value,
        })
    };

    getSearchCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined) {
            message.info("没有搜索到相关组件！");
            return;
        }
        //更新componentsList
        let componentsList = [];
        componentsList = data.payload.files.map((item, index) => {
            let componentItem = DeepClone(item);
            componentItem.index = index + 1;
            componentItem.key = index + 1;
            return componentItem;
        })
        this.setState({ componentsList });
    }

    getSearch = (event) => {
        if (this.state.inputValue === undefined || this.state.inputValue === '') {
            message.info("请输入敏感关键字！");
            return;
        }
        RestReq.asyncGet(this.getSearchCB, '/firmware-analyze/component/async_funcs/get_inverted_fw_data', { index_con: this.state.inputValue });
    };

    getComponentItem = () => {
        const { selectRowIndex, componentsList } = this.state;
        const compileItem = componentsList[selectRowIndex - 1];
        return compileItem;
    }

    invertedIndexCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined) {
            message.info("倒排索引失败！");
            return;
        } else {
            message.info("正在进行倒排索引！");
        }
        this.setState({ task_id: data.payload.task_id });
        // let featuresList = [];
        // featuresList = data.payload.map((item, index) => {
        //     let featureItem = DeepClone(item);
        //     featureItem.index = index + 1;
        //     featureItem.key = index + 1;
        //     return featureItem;
        // })
        // this.setState({ featuresList });
    }

    invertedIndex = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请先选择一个组件进行倒排索引！");
            return;
        } else if (this.getComponentItem().inverted === 1) {
            message.info("已经完成倒排索引！");
            return;
        }
        RestReq.asyncGet(this.invertedIndexCB, '/firmware-analyze/component/async_funcs/inverted', { file_id: this.getComponentItem().file_id });
    }

    featureExtractCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined || data.payload.items === undefined) {
            message.info("特征提取失败！");
            return;
        }
        let featuresList = [];
        featuresList = data.payload.items.map((item, index) => {
            let featureItem = DeepClone(item);
            featureItem.index = index + 1;
            featureItem.key = index + 1;
            return featureItem;
        })
        this.setState({ featuresList });
    }

    featureExtract = () => {
        if (this.state.selectRowIndex < 0) {
            message.info("请先选择一个组件！");
            return;
        } else if (this.getComponentItem().inverted !== 1) {
            message.info("请先进行倒排索引！");
            return;
        }
        RestReq.asyncGet(this.featureExtractCB, '/firmware-analyze/component/async_funcs/get_inverted_data', { file_id: this.getComponentItem().file_id });
    }


    render() {
        const { classes } = this.props;
        const userStore = this.props.userStore;
        const { columns, componentsList, featuresList } = this.state;
        let self = this;

        return (
            <Skeleton loading={!userStore.isNormalUser} active avatar>
                <Row>
                    <Col span={12}>
                        <Card title={'组件列表'} style={{ height: 1200, margin: 8 }} headStyle={MAntdCard.headerStyle('main')}>
                            <Table
                                columns={columns}
                                dataSource={componentsList}
                                bordered={true}
                                rowKey={record => record.uuid}
                                rowClassName={this.setRowClassName}
                                onRow={this.onRow}
                                pagination={MAntdTable.pagination(self.handlePageChange)}
                            />
                            <Row style={{ margin: 8 }}>
                                <Col span={10} align="left">
                                    <Input className={classes.antInput} size="large" allowClear onChange={this.handleInputValue.bind(this)} placeholder="敏感关键字" />
                                </Col>
                                <Col span={3} align="left">
                                    <Button className={classes.iconButton} type="primary" size="large" onClick={this.getSearch.bind(this)} ><Icon type="file-search" />查询</Button>
                                </Col>
                                <Col span={4} align="left">
                                    <Button className={classes.iconButton} type="primary" size="large" onClick={this.invertedIndex.bind(this)} ><Icon type="branches" />倒排索引</Button>
                                </Col>
                                <Col span={4} align="left">
                                    <Button className={classes.iconButton} type="primary" size="large" onClick={this.featureExtract.bind(this)} ><Icon type="key" />特征提取</Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={'特征信息'} style={{ height: 1200, margin: 8, overflowY: 'auto', }} headStyle={MAntdCard.headerStyle('info-2')}>
                            <Row>
                                <Col span={16}><Typography variant="subtitle2" style={{ color: 'green' }}>敏感关键字</Typography></Col>
                                <Col span={4}><Typography variant="subtitle2" style={{ color: 'green' }}>出现频次</Typography></Col>
                                <Col span={4}><Typography variant="subtitle2" style={{ color: 'green' }}>出现位置</Typography></Col>
                            </Row>
                            {featuresList.map((feature) => (
                                <Row>
                                    <Col span={16}>
                                        <EllipsisText content={feature.index_con} width={400}/>
                                    </Col>
                                    <Col span={4}>
                                        {feature.appear_total}
                                    </Col>
                                    <Col span={4}>
                                        {feature.position}
                                    </Col>
                                </Row>))}
                        </Card>
                    </Col>
                </Row>
            </Skeleton >
        );
    }
}

export default withStyles(styles)(FeatureExtrationView);