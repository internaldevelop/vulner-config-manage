import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { message, DatePicker, Icon, Button, Skeleton, Select, Card, Row, Col } from 'antd'
import { GetMainServerRootUrl } from '../../global/environment'

import RestReq from '../../utils/RestReq';
import CertFileCard from './CertFileCard';


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
});

const Option = Select.Option;

@inject('userStore')
@inject('certFileStore')
@observer
class CertFileGenerate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
        this.initCertFileData();
    }

    initCertFileData = () => {
        let certFileItem = {
            selectUserUuid: '',
            expireDate: this.getNowTime(),
            selectRoles: [],
        };
        this.props.certFileStore.initCertFileItem(certFileItem);
    }

    getNowTime = () => {
        let now = new Date();
        let month = (10 > (now.getMonth() + 1)) ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
        let day = (10 > now.getDate()) ? '0' + now.getDate() : now.getDate();
        let today = now.getFullYear() + '-' + month + '-' + day;
        return today + ' 00:00:00';
    }

    getCertFileCB = (data) => {
        //
    }

    getCertFile = event => {
        const {selectUserUuid, expireDate, selectRoles}  = this.props.certFileStore.certFileItem;
        // 调接口生成授权文件
        if (expireDate === '' || expireDate === undefined) {
            message.info("授权到期日期不能为空");
            return;
        } else {
            if (selectRoles.length > 0) {
                window.location.href = GetMainServerRootUrl() + '/unified-auth/license/create?expire_time=' + expireDate + '&access_token=' + RestReq._getAccessToken() + '&sign=1' + '&role_uuids=' + selectRoles.toString() + '&account_uuid=' + selectUserUuid;
                //RestReq.asyncGet(this.getCertFileCB, '/unified-auth/license/create', {expire_time: this.state.expireDate, sign: 1, role_uuids: this.state.selectRoles.toString, account_uuid: this.state.selectUserUuid});
            } else {
                window.location.href = GetMainServerRootUrl() + '/unified-auth/license/create?expire_time=' + expireDate + '&access_token=' + RestReq._getAccessToken() + '&sign=0' + '&account_uuid=' + selectUserUuid;
                //RestReq.asyncGet(this.getCertFileCB, '/unified-auth/license/create', {expire_time: this.state.expireDate, sign: 0, account_uuid: this.state.selectUserUuid});
            }
        }
    }

    render() {
        const { classes } = this.props;
        const userStore = this.props.userStore;
        return (
            <div>
                <Skeleton loading={!userStore.isAdminUser} active avatar>
                    <Row>
                        <Col span={20} offset={2}>
                            <Card title="授权文件生成">
                                <div>
                                    <CertFileCard manage={1} />
                                    {/* <Row>
                                        <Col span={4}>
                                            {"请选择用户："}
                                        </Col>
                                        <Col span={4} >
                                            <Select style={{ width: 200 }} defaultValue='' onChange={this.handleSelectUser}>
                                                {users.map(user => (
                                                    <Option value={user.uuid}>{user.alias}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col span={4}>
                                            {"请选择用户角色："}
                                        </Col>
                                        <Col span={4} >
                                            <Select mode="multiple" style={{ width: 200 }} onChange={this.handleUserRoleChange.bind(this)}>
                                                {roles.map(role => (
                                                    <Option value={role.uuid}>{role.alias}</Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col span={4}>
                                            {"请选择到期日期*："}
                                        </Col>
                                        <Col span={4} >
                                            <DatePicker placeholder="选择日期" style={{ width: 200 }} onChange={this.handleDateChange} />
                                        </Col>
                                    </Row>*/}
                                    <br />
                                    <br />
                                    <Row>
                                        <Col span={4} offset={5}>
                                            <Button type="primary" size="large" onClick={this.getCertFile.bind(this)}><Icon type="export" />授权文件生成</Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Skeleton>
            </div>
        )
    }
}

CertFileGenerate.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CertFileGenerate);