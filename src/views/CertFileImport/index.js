import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Upload, message, DatePicker, Icon, Button, Skeleton, Select, Card, Row, Col } from 'antd'
import CertFileCard from '../CertFileGenerate/CertFileCard'

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
@inject('certFileStore')
@observer
class CertFileImport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
        }
        this.initCertFileData();
    }

    initCertFileData = () => {
        let certFileItem = {
            selectUserUuid: '',
            expireDate: '',
            selectRoles: [],
        };
        this.props.certFileStore.initCertFileItem(certFileItem);
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
            RestReq.asyncPost(this.importCertFileCB, '/unified-auth/license/import?access_token=' + RestReq._getAccessToken() + '&uploadFileContent=' + uploadFileContent);
        }
    }

    render() {
        const userStore = this.props.userStore;
        let self = this;
        uploadFileContent = '';

        const props = {
            name: 'file',
            multiple: true,
            action: RestReq._getBaseURL('') + '/unified-auth/license/import',
            data: {
                access_token: RestReq._getAccessToken(),
            },
            onChange(info) {
              const { status } = info.file;
              if (status !== 'uploading') {
                console.log(info.file, info.fileList);
              }
              if (status === 'done') {
                if (info.file.response.code === 'ERROR_OK') {
                    if (info.file.response.payload !== undefined &&  info.file.response.payload !== null) {
                        let certFileItem = {
                            selectUserUuid: info.file.response.payload.account_uuid,
                            expireDate: info.file.response.payload.expire_time + ' 00:00:00',
                            selectRoles: info.file.response.payload.role_uuids.split(","),
                        };
                        self.props.certFileStore.initCertFileItem(certFileItem);
                    }
                    message.success(`${info.file.name} 授权成功.`);
                } else {
                    message.success(`${info.file.name} 授权失败：` + info.file.response.error);
                }
              } else if (status === 'error') {
                message.error(`${info.file.name} 授权失败.`);
              }
            },
          };

        return (
            <div>
                <Skeleton loading={!userStore.isAdminUser} active avatar>
                    <Card title="授权文件导入">
                        <Row>
                            <Col span={10}>
                                <div>
                                    <Dragger {...props}>
                                        <p className="ant-upload-drag-icon">
                                            <Icon type="inbox" />
                                        </p>
                                        <p className="ant-upload-text">点击选择或者拖拽授权文件到这里</p>
                                        {/* <p className="ant-upload-hint">
                                            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                                            band files
                                        </p> */}
                                    </Dragger>
                                    <br />
                                    <br />
                                </div>
                            </Col>
                            <Col span={12} offset={2}>
                                <CertFileCard />
                            </Col>
                        </Row>
                        <br />
                        {/* <div align="center"><Button type="primary" size="large" onClick={this.importCertFile.bind(this)}><Icon type="import" />授权文件导入</Button></div> */}
                    </Card>
                </Skeleton>
            </div>
        )

    }
}

CertFileImport.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CertFileImport);