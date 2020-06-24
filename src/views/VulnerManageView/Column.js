import React from 'react'
import MAntdTable from '../../rlib/props/MAntdTable';

// export const columns = [
//   {
//     title: '序号', width: 100, dataIndex: 'index', key: 'index',
//     //sorter: (a, b) => a.index - b.index,
//     render: content => <EllipsisText content={content} width={100} />,
//   },
//   {
//     title: '漏洞编号', width: 120, dataIndex: 'edb_id', key: 'edb_id',
//     //sorter: (a, b) => a.edb_id - b.edb_id,
//     render: content => <EllipsisText content={content} width={120} />,
//   },
//   {
//     title: '漏洞名称', width: 120, dataIndex: 'title', key: 'title',
//     //sorter: (a, b) => a.title.localeCompare(b.title, "zh"),
//     render: content => <EllipsisText content={content} width={120} />,
//   },
//   // {
//   //   title: '发布者', width: 150, dataIndex: 'author',
//   //   sorter: (a, b) => a.author.localeCompare(b.author, "zh"),
//   //   render: content => <EllipsisText content={content} width={150} />,
//   // },
//   {
//     title: '漏洞类型', width: 120, dataIndex: 'type', key: 'type',
//     sorter: (a, b) => a.type.localeCompare(b.type, "zh"),
//     render: content => <EllipsisText content={content} width={120} />,
//   },
//   {
//     title: '发布时间', width: 120, dataIndex: 'date_published',
//     sorter: (a, b) => a.date_published.localeCompare(b.date_published, "zh"),
//     render: content => <EllipsisText content={content} width={120} />,
//   },
//   {
//     title: '厂商', width: 120, dataIndex: 'discovererName', key: 'discovererName',
//     sorter: (a, b) => a.vulner_manufacturer.localeCompare(b.vulner_manufacturer, "zh"),
//     render: content => <EllipsisText content={content} width={120} />,
//   },
//   {
//     title: '产品型号', width: 120, dataIndex: 'products', key: 'products',
//     sorter: (a, b) => a.application_mode.localeCompare(b.application_mode, "zh"),
//     render: content => <EllipsisText content={content} width={120}/>,
//   },
//   {
//     title: '危害等级', width: 120, dataIndex: 'serverity', key: 'serverity',
//     sorter: (a, b) => a.risk_level.localeCompare(b.risk_level, "zh"),
//     render: content => <EllipsisText content={content} width={120}/>,
//   },
//   {
//     title: '固件版本', width: 120, dataIndex: 'fw_version', key: 'fw_version',
//     sorter: (a, b) => a.fw_version.localeCompare(b.fw_version, "zh"),
//     render: content => <EllipsisText content={content} width={120}/>,
//   },
//   {
//     title: '',
//     fixed: 'right',
//     width: 150,
//     render: () => (
//       <span>
//       </span>
//     ),
//   },
// ];
export function columns() {
  let colsList = [
    { title: '序号', width: 60, dataIndex: 'index' },
    { title: '漏洞编号', width: 120, dataIndex: 'edb_id', myNoWrap: true, mySort: true },
    { title: '漏洞名称', width: 200, dataIndex: 'title', myNoWrap: true, mySort: true },
    { title: '漏洞类型', width: 120, dataIndex: 'type', myNoWrap: true, mySort: true },
    { title: '厂商', width: 150, dataIndex: 'discovererName', mySort: true },
    { title: '产品型号', width: 150, dataIndex: 'products', myNoWrap: true, mySort: true },
    { title: '危害等级', width: 150, dataIndex: 'serverity', myNoWrap: true, mySort: true },
    { title: '固件版本', width: 150, dataIndex: 'fw_version', myNoWrap: true, mySort: true },
    { title: '发布时间', width: 120, dataIndex: 'date_published', myNoWrap: true, mySort: true },
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