import { Tag } from 'antd';
import React from 'react';
import MObjUtils from '../../rlib/utils/MObjUtils';

export default function invertedResultTag(invertedResult) {
    if (MObjUtils.isString(invertedResult)) {
        invertedResult = parseInt(invertedResult);
    }

    if (!MObjUtils.isNumber(invertedResult)) {
        return (<div></div>);
    }

    let color = '#436EEE';
    let tag = '待完成';//0
    if (invertedResult === 99) {
        color = '#d4380d';
        tag = '索引失败';
    } else if (invertedResult === 1) {
        color = '#389e0d';
        tag = '索引成功';
    }
    return (<span>
        {/* {(compileResult !== 1) ? <Tag color={color} key={'failed'}>{'认证失败'}</Tag> : <div />} */}
        <Tag color={color} key={tag}>{tag}</Tag>
    </span>);
}
