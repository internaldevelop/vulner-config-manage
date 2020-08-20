import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';
import invertedResultTag from '../../modules/antdComponents/invertedResultTag';

export function columns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    { title: '组件名称', width: 200, dataIndex: 'file_name', myNoWrap: true, mySort: true },
    { title: '版本', width: 120, dataIndex: 'version', myNoWrap: true, mySort: true },
    { title: '固件名称', width: 150, dataIndex: 'fw_name', myNoWrap: true, mySort: true },
    { title: '文件路径', width: 200, dataIndex: 'file_path', myNoWrap: true, mySort: true },
    { title: '倒排索引', width: 150, dataIndex: 'inverted', myNoWrap: true, mySort: true },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);

  // 编译结果设置标签组件
  _renderResultTag(colsList);

  return colsList;
}

function _renderResultTag(colsList) {
  let resultCol = MAntdTable.findColumn(colsList, 'inverted');
  if (resultCol !== null) {
    resultCol['render'] = (content) => invertedResultTag(content);
  }
}