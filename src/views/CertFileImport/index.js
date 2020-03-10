import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Upload, message, DatePicker, Icon, Button, Skeleton, Select, Card, Row, Col } from 'antd'
import { GetMainServerRootUrl } from '../../global/environment'

import RestReq from '../../utils/RestReq';

const { Dragger } = Upload;


const styles = theme => ({
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
    uploadStyle: {
        marginTop: 20,
        //minHeight: 100,
    },
});

const Option = Select.Option;
let uploadFileContent = '';

@inject('userStore')
@inject('userRoleStore')
@observer
class CertFileImport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
        }
    }

    importCertFileCB = (data) => {
        //
    }

    importCertFile = event => {
        // 调接口导入授权文件
        if (this.state.fileList.length === 0) {
            message.info("授权文件不能为空");
            return;
        } else if (this.state.fileList.length > 1) {
            message.info("一次只支持授权一个文件,请删除多余授权文件");
            return;
        } else {
            // TODO 需要联调修改接口参数
            RestReq.asyncGet(this.importCertFileCB, '/unified-auth/license/import?access_token=' + RestReq._getAccessToken() + '&uploadFileContent=' + uploadFileContent);
        }
    }

    render() {
        const { classes } = this.props;
        const { users } = this.state;
        const userStore = this.props.userStore;
        let roles = this.props.userRoleStore.roleArray;
        const { fileList } = this.state;
        let self = this;
        uploadFileContent = '';

        const props = {
            name: 'file',
            multiple: false,
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
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
                    uploadFileContent = oFREvent.target.result;
                }
                return false;
            },
            fileList,
        };

        return (
            <div>
                <Skeleton loading={!userStore.isAdminUser} active avatar>
                    <Row>
                        <Col span={20} offset={2}>
                            <Card title="授权文件导入">
                                <div>
                                    <Dragger {...props}>
                                        <p className="ant-upload-drag-icon">
                                            <Icon type="inbox" />
                                        </p>
                                        <p className="ant-upload-text">点击选择或者拖拽授权文件</p>
                                        {/* <p className="ant-upload-hint">
                                            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                                            band files
                                        </p> */}
                                    </Dragger>
                                    <br />
                                    <br />
                                    <div align="center"><Button type="primary" size="large" onClick={this.importCertFile.bind(this)}><Icon type="import" />授权文件导入</Button></div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        )

    }
}

CertFileImport.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CertFileImport);