import React from 'react';
import { Tag } from 'antd';
import MEvent from '../../rlib/utils/MEvent';
import MObjUtils from '../../rlib/utils/MObjUtils';

export default function compileResultTag(compileResult) {
    if (MObjUtils.isString(compileResult)) {
        compileResult = parseInt(compileResult);
    }

    if (!MObjUtils.isNumber(compileResult)) {
        return (<div></div>);
    }

    let color = '#436EEE';
    let tag = '等待编译';//0
    if (compileResult === 99) {
        color = '#d4380d';
        tag = '编译失败';
    // } else if (compileResult === 3) {
    //     color = '#8A2BE2';
    //     tag = '正在编译';
    } else if (compileResult === 1) {
        color = '#389e0d';
        tag = '编译成功';
    }
    return (<span>
        {/* {(compileResult !== 1) ? <Tag color={color} key={'failed'}>{'认证失败'}</Tag> : <div />} */}
        <Tag color={color} key={tag}>{tag}</Tag>
    </span>);
}
