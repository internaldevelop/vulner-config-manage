import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';
import compileResultTag from '../../modules/antdComponents/compileResultTag';

export function columns() {
  let colsList = [
    { title: '序号', width: 80, dataIndex: 'index' },
    { title: '组件名称', width: 200, dataIndex: 'name', myNoWrap: true, mySort: true },
    { title: '组件版本', width: 120, dataIndex: 'version', myNoWrap: true, mySort: true },
    { title: '文件个数', width: 120, dataIndex: 'sourcecode_files', myNoWrap: true, mySort: true },
    { title: '文件路径', width: 150, dataIndex: 'file_path', myNoWrap: true, mySort: true },
    { title: '编译结果', width: 120, dataIndex: 'compile', mySort: true },
  ];

  // 按照各列的定义构建列元素
  MAntdTable.buildColumns(colsList);

    // 编译结果设置标签组件
    _renderResultTag(colsList);

  return colsList;
}

function _renderResultTag(colsList) {
  let resultCol = MAntdTable.findColumn(colsList, 'compile');
  if (resultCol !== null) {
    resultCol['render'] = (content) => compileResultTag(content);
  }
}