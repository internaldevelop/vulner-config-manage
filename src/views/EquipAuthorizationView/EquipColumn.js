import React from 'react';
import EllipsisText from '../../components/widgets/EllipsisText';

export const columns = [
  {
    title: '序号', width: 120, dataIndex: 'index', key: 'key',
    //sorter: (a, b) => a.index - b.index,
    render: content => <EllipsisText content={content} width={120}/>,
  },
    {
    title: '设备名称', width: 150, dataIndex: 'name', key: 'name',
    //sorter: (a, b) => a.equip_name - b.equip_name,
    render: content => <EllipsisText content={content} width={150}/>,
  },
  {
    title: '设备IP', width: 150, dataIndex: 'ip', 
    //sorter: (a, b) => a.equip_ip.localeCompare(b.ip, "zh"),
    render: content => <EllipsisText content={content} width={150}/>,
  },
  {
    title: '授权标识', width: 150, dataIndex: 'authorization_tag',
    sorter: (a, b) => a.authorization_tag.localeCompare(b.authorization_tag, "zh"),
    render: content => <EllipsisText content={content} width={150} />,
  },
  {
    title: '系统类型', width: 150, dataIndex: 'os_type',
    sorter: (a, b) => a.os_type.localeCompare(b.os_type, "zh"),
    render: content => <EllipsisText content={content} width={150}/>,
  },
  {
    title: '创建时间', width: 150, dataIndex: 'create_time',
    sorter: (a, b) => a.create_time.localeCompare(b.create_time, "zh"),
    render: content => <EllipsisText content={content} width={150}/>,
  },
];
