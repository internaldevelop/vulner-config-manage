import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';

export function VulColumns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    { title: '漏洞编号', width: 120, dataIndex: 'edb_id', myNoWrap: true, mySort: true },
    { title: '漏洞名称', width: 200, dataIndex: 'title', myNoWrap: true, mySort: true },
    { title: '漏洞类型', width: 120, dataIndex: 'type', myNoWrap: true, mySort: true },
    { title: '固件版本', width: 150, dataIndex: 'fw_version', myNoWrap: true, mySort: true },
    { title: '发布时间', width: 120, dataIndex: 'date_published', myNoWrap: true, mySort: true },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);
  return colsList;
}