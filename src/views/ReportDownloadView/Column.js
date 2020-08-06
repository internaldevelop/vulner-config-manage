import React from 'react';
import MAntdTable from '../../rlib/props/MAntdTable';


export function columns() {
  let colsList = [
    { title: '序号', width: 100, dataIndex: 'index' },
    { title: '固件名', width: 200, dataIndex: 'pack_name', myNoWrap: true, mySort: true },
    { title: '文件名', width: 200, dataIndex: 'pdf_name', myNoWrap: true, mySort: true },
    { title: '文件路径', width: 200, dataIndex: 'pdf_path', mySort: true },
    { title: '创建时间', width: 150, dataIndex: 'create_time', myNoWrap: true, mySort: true },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);
  return colsList;
}