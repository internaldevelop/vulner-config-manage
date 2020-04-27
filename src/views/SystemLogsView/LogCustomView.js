import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react'
import { Skeleton, Button, Icon, Card, Row, Col } from 'antd';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';

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
            logFieldList: allLogFields,//{ label: 'Orange', value: 'Orange', disabled: false },
            checkedList: defaultLogFields,
            indeterminate: true,
            checkAll: false,
        }
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

    restoreData = () => {
        //
    }

    handleFieldChange = code => event => {
        if (event.target.checked) {
        } else {
        }
    };

    getConfigCtrl(code, name) {
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        // color="green"
                        //checked={this.isCheck(code)}
                        onChange={this.handleFieldChange(code)}
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
                    {/* <div className={classes.checkboxWrapper}>
                        <Checkbox
                            indeterminate={this.state.indeterminate}
                            onChange={this.onCheckAllChange}
                            checked={this.state.checkAll}
                        >
                            Check all
                        </Checkbox>
                    </div>
                    <br />
                    <CheckboxGroup
                        options={logFieldList}
                        value={this.state.checkedList}
                        onChange={this.onChange}
                    />
                    <br /> */}
                    <Card title={'日志格式定制'} style={{ width: '100%', height: '100%' }}>
                        <FormControl component="fieldset" className={classes.formControl}>
                            <FormGroup row>
                                {logFieldList.map(log => this.getConfigCtrl(log, log))}
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