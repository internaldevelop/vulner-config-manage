import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';

export function columns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    { title: '组件名称', width: 200, dataIndex: 'title', myNoWrap: true, mySort: true },
    { title: '组件版本', width: 120, dataIndex: 'type', myNoWrap: true, mySort: true },
    { title: '文件个数', width: 150, dataIndex: 'products', myNoWrap: true, mySort: true },
    // {
    //   title: '',
    //   dataIndex: 'action_col',
    //   fixed: 'right',
    //   width: 150,
    //   render: () => (
    //     <span>
    //     </span>
    //   ),
    // },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);
  return colsList;
}