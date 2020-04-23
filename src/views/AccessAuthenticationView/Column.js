import React from 'react';
import EllipsisText from '../../components/widgets/EllipsisText';

export const columns = [
  {
    title: '序号', width: 120, dataIndex: 'index', key: 'index',
    //sorter: (a, b) => a.index - b.index,
    render: content => <EllipsisText content={content} width={120}/>,
  },
    {
    title: '设备名称', width: 180, dataIndex: 'name', key: 'name',
    //sorter: (a, b) => a.name - b.name,
    render: content => <EllipsisText content={content} width={180}/>,
  },
  {
    title: '认证标识', width: 180, dataIndex: 'authen_tag',
    sorter: (a, b) => a.authen_tag.localeCompare(b.authen_tag, "zh"),
    render: content => <EllipsisText content={content} width={180} />,
  },
  {
    title: '认证时间', width: 180, dataIndex: 'create_time',
    sorter: (a, b) => a.create_time.localeCompare(b.create_time, "zh"),
    render: content => <EllipsisText content={content} width={180}/>,
  },
  {
    title: '',
    fixed: 'right',
    width: 150,
    render: () => (
      <span>
      </span>
    ),
  },
];
