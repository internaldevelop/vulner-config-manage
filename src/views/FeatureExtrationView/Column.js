import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';

export function columns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    { title: '组件名称', width: 200, dataIndex: 'title', myNoWrap: true, mySort: true },
    { title: '组件版本', width: 120, dataIndex: 'version', myNoWrap: true, mySort: true },
    { title: '固件名称', width: 150, dataIndex: 'fwName', myNoWrap: true, mySort: true },
    { title: '文件路径', width: 150, dataIndex: 'path', myNoWrap: true, mySort: true },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);
  return colsList;
}