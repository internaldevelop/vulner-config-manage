import React from 'react';
import MAntdTable from '../../rlib/props/MAntdTable';


export function columns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    // { title: '固件编号', width: 100, dataIndex: 'firmware_id', myNoWrap: true, mySort: true },
    { title: '固件名称', width: 200, dataIndex: 'name', myNoWrap: true, mySort: true },
    { title: '厂商', width: 150, dataIndex: 'manufacturer', mySort: true },
    { title: '设备类型', width: 150, dataIndex: 'model', myNoWrap: true, mySort: true },
    { title: '创建时间', width: 150, dataIndex: 'create_time', myNoWrap: true, mySort: true },
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