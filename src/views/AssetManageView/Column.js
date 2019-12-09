import React from 'react'
import EllipsisText from '../../components/widgets/EllipsisText';
import { Tag } from 'antd';

export const columns = [
  {
    title: '序号', width: 150, dataIndex: 'index', key: 'key',
    sorter: (a, b) => a.index - b.index,
    render: content => <EllipsisText content={content} width={150}/>,
  },
  {
    title: '名称', width: 200, dataIndex: 'name', 
    sorter: (a, b) => a.name.localeCompare(b.name, "zh"),
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: 'IP', width: 150, dataIndex: 'ip',
    render: content => <EllipsisText content={content} width={150} />,
  },
  {
    title: '端口', width: 150, dataIndex: 'port',
    render: content => <EllipsisText content={content} width={150}/>,
  },
  {
    title: '系统类型', width: 150, dataIndex: 'os_type',
    sorter: (a, b) => a.os_type.localeCompare(b.os_type, "zh"),
    render: content => {
      let cellText = content === '1' ? "Windows" : "Linux";
      let color = content === '1' ? "green" : "geekblue";
      return <Tag style={{ fontSize: 18 }} color={color} key={content}>{cellText}</Tag>
    },
  },
  {
    title: '系统版本', dataIndex: 'os_ver',
    sorter: (a, b) => a.os_ver.localeCompare(b.os_ver, "zh"),
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
