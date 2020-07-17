import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Skeleton, Button, Icon, Card, message } from 'antd';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import RestReq from '../../utils/RestReq';

//const CheckboxGroup = Checkbox.Group;
const allLogFields = ['级别', '类型', '标题', '日志内容', '用户名', '用户账号', '时间'];
const defaultLogFields = ['级别', '类型', '标题', '日志内容', '用户名',];
const styles = theme => ({
    checkboxWrapper: {
        border: 1,
        borderColor: '#e9e9e9',
    }
});

@inject('userStore')
@observer
class LogCustomView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logFieldList: [],
            checkedList: [],
            indeterminate: true,
            checkAll: false,
        }
        this.getLogFields();
    }

    getLogFields = () => {
        RestReq.asyncGet(this.getLogFieldsCB, '/system-log/sys_log/get-log-info-config');
    }

    getLogFieldsCB = (data) => {
        if (data.code !== 'ERROR_OK' || data.payload === undefined)
            return;

        let checkedList = [];
        for (let item of data.payload) {
            if (item.is_display === '1') {
                checkedList.push(item.log_field);
            }
        }
        this.setState({ logFieldList: data.payload, checkedList });
    }

    onChange = checkedList => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && checkedList.length < this.state.logFieldList.length,
            checkAll: checkedList.length === this.state.logFieldList.length,
        });
    };

    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked ? this.state.logFieldList : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    };

    restoreDataCB = (data) => {
        if (data.code === 'ERROR_OK') {
            message.info('日志格式定制成功！');
        } else {
            message.info('日志格式定制失败！');
        }
    }

    restoreData = () => {
        const checkedList = this.state.checkedList;
        let fields = '';
        for (let item of checkedList) {
            fields += item + ',';
        }
        RestReq.asyncPost(this.restoreDataCB, '/system-log/sys_log/upt-log-info-config', {log_fields: fields});
    }

    handleFieldChange = (code) => (event) => {
        let checkedList = [];
        let list = this.state.checkedList;
        if (event.target.checked) {
            list.push(event.target.value);
            checkedList = list; 
        } else {
            for (let item of list) {
                if (item !== event.target.value) {
                    checkedList.push(item);
                }
            }
        }
        this.setState({ checkedList });
    };

    getConfigCtrl(code, name, is_display, is_default) {
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        //color="green"
                        defaultChecked={is_display==='1'?true:false}//检查目前是否选择状态
                        onChange={this.handleFieldChange(code)}
                        disabled={is_default==='0'?true:false}
                        value={code}
                    />
                }
                label={name}
            />
        );
    }

    render() {
        const { classes } = this.props;
        const { logFieldList } = this.state;
        const userStore = this.props.userStore;
        return (
            <div>
                <Skeleton loading={!userStore.isNormalUser} active avatar>
                    <Card title={'日志格式定制'} style={{ width: '100%', height: '100%' }}>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormGroup row>
                                {logFieldList.map(log => this.getConfigCtrl(log.log_field, log.log_field_desc, log.is_display, log.is_default))}
                            </FormGroup>
                        </FormControl>
                        <br />
                        <br />
                        <div align="center">
                            <Button type="primary" size="default" onClick={this.restoreData.bind(this)}><Icon type="save" />日志格式保存</Button>
                        </div>
                    </Card>
                </Skeleton>
            </div >
        )
    }
}

LogCustomView.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(LogCustomView);