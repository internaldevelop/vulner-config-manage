import { NavLink as Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Col, Row, Skeleton } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { DeepClone } from '../../utils/ObjUtils';
import { GetMainViewHeight } from '../../utils/PageUtils';
import RestReq from '../../utils/RestReq';
import { columns as Column } from './Column';

const DEFAULT_PAGE_SIZE = 10;
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
    packGutterBox: {
        padding: 8,
        background: '#F0FFFF',
    },
    nameGutterBox: {
        padding: 8,
        background: '#5F9EA0',
        height: 40,
        color: '#000000',
    },
    fileGutterBox: {
        padding: 8,
        background: '#D4F2E7',
        height: 100,
        color: '#DC143C',
    }
});

@inject('userStore')
@observer
class FirmwarePackageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGE_SIZE,
            columns: Column,
            scrollWidth: 1000,        // 表格的 scrollWidth
            scrollHeight: 400,      // 表格的 scrollHeight
            packageList: [],
            packTotal: 0,
            exeFileTotal: 0,
            mirrorFileTotal: 0,
        }
        this.getAllPackages();
    }

    getAllPackages = () => {
        RestReq.asyncGet(this.getAllPackagesCB, '/firmware-analyze/fw_analyze/pack/all');
    }

    getAllPackagesCB = (data) => {
        let packages = [];
        // 检查响应的payload数据是数组类型
        if (data.code !== 'ERROR_OK' || !(data.payload instanceof Array))
            return;

        let packTotal = 0;
        let exeFileTotal = 0;
        let mirrorFileTotal = 0;
        packages = data.payload.map((pack, index) => {
            let packItem = DeepClone(pack);
            packItem.index = index + 1;
            packItem.key = index + 1;
            packTotal++;
            let systemMirrorNum = 0;
            let fileMirrorNum = 0;
            let exeFileNum = 0;
            if (pack.unpack_files !== undefined) {
                if (pack.unpack_files["2"] !== undefined) {
                    systemMirrorNum += pack.unpack_files["2"].count;
                    mirrorFileTotal += systemMirrorNum;
                }
                if (pack.unpack_files["3"] !== undefined) {
                    fileMirrorNum += pack.unpack_files["3"].count;
                    mirrorFileTotal += fileMirrorNum;
                }
                if (pack.unpack_files["4"] !== undefined) {
                    exeFileNum += pack.unpack_files["4"].count;
                    exeFileTotal += exeFileNum;
                }
            }
            packItem.systemMirrorNum = systemMirrorNum;
            packItem.fileMirrorNum = fileMirrorNum;
            packItem.exeFileNum = exeFileNum;
            return packItem;
        })

        this.setState({ packageList: packages, packTotal, exeFileTotal, mirrorFileTotal });
    }

    componentDidMount() {
        // 增加监听器，侦测浏览器窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    handleResize = e => {
        console.log('浏览器窗口大小改变事件', e.target.innerWidth, e.target.innerHeight);
        this.setState({ scrollHeight: GetMainViewHeight() });
    }

    componentWillUnmount() {
        // 组件卸装前，一定要移除监听器
        window.removeEventListener('resize', this.handleResize.bind(this));
    }

    render() {
        const { packTotal, mirrorFileTotal, exeFileTotal, packageList } = this.state;
        const { classes } = this.props;
        const userStore = this.props.userStore;
        let self = this;

        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    {/* <FormLabel component="legend">固件列表</FormLabel> */}
                    <Typography variant="h6">固件包信息</Typography>
                    <br />
                    <Row>
                        <Col span={6}>
                            {"固件包数量：" + packTotal}
                        </Col>
                        <Col span={6}>
                            {"镜像文件总数：" + mirrorFileTotal}
                        </Col>
                        <Col span={6}>
                            {"可执行文件总数：" + exeFileTotal}
                        </Col>
                    </Row>
                    <br />
                    <Typography variant="h6">固件包列表</Typography>
                    <Row gutter={[16, 24]}>
                        {packageList.map((item, index) => (
                            <Link to={{pathname: '/home/firmware-analyze/function-fetch', state: { pack_id: item.pack_id }}} align="center">
                                <Col span={4} className={classes.packGutterBox} >
                                    <Row className={classes.nameGutterBox}>{item.name}</Row>
                                    <Row>
                                        <Col className={classes.fileGutterBox}>
                                            <p>{"可执行文件" + item.exeFileNum + "个"}</p>
                                            <p>{"系统镜像文件" + item.systemMirrorNum + "个"}</p>
                                            <p>{"文件系统镜像文件" + item.fileMirrorNum + "个"}</p>
                                        </Col>
                                    </Row>
                                </Col>
                            </Link>
                        ))}
                    </Row>
                </Skeleton>
            </div>
        );
    }
}

export default withStyles(styles)(FirmwarePackageView);