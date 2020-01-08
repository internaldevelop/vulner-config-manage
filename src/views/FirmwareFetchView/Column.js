import React from 'react'
import EllipsisText from '../../components/widgets/EllipsisText';
import { Tag } from 'antd';

export const columns = [
  // {
  //   title: '序号', width: 150, dataIndex: 'index', key: 'key',
  //   sorter: (a, b) => a.index - b.index,
  //   render: content => <EllipsisText content={content} width={150}/>,
  // },
  {
    title: '固件名称', width: 200, dataIndex: 'title', 
    //sorter: (a, b) => a.name.localeCompare(b.name, "zh"),
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '厂商', width: 200, dataIndex: 'firm_name',
    render: content => <EllipsisText content={content} width={200} />,
  },
  {
    title: '设备类型', width: 200, dataIndex: 'device_type',
    render: content => <EllipsisText content={content} width={200}/>,
  },
];
