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
    //sorter: (a, b) => a.equip_name - b.equip_name,
    render: content => <EllipsisText content={content} width={180}/>,
  },
  {
    title: '设备IP', width: 180, dataIndex: 'ip',
    sorter: (a, b) => a.ip.localeCompare(b.ip, "zh"),
    render: content => <EllipsisText content={content} width={180} />,
  },
  {
    title: '指纹', width: 250, dataIndex: 'fingerprint',
    sorter: (a, b) => a.fingerprint.localeCompare(b.fingerprint, "zh"),
    render: content => <EllipsisText content={content} width={250}/>,
  },
];
