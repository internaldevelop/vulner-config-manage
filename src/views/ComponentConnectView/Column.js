import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';

export function columns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    { title: '组件名称', width: 200, dataIndex: 'file_name', myNoWrap: true, mySort: true },
    { title: '组件版本', width: 120, dataIndex: 'version', myNoWrap: true, mySort: true },
    { title: '文件路径', width: 150, dataIndex: 'file_path', myNoWrap: true, mySort: true },
    { title: '固件名称', width: 150, dataIndex: 'fw_name', myNoWrap: true, mySort: true },
    { title: '关联漏洞编号', width: 150, dataIndex: 'edb_id', mySort: true },
    { title: '关联漏洞名称', width: 200, dataIndex: 'edb_name', mySort: true },
    {
      title: '',
      dataIndex: 'action_col',
      fixed: 'right',
      width: 150,
      render: () => (
        <span>
        </span>
      ),
    },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);
  return colsList;
}