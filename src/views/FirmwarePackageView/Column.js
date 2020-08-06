import React from 'react'
import EllipsisText from '../../components/widgets/EllipsisText';
import { Tag } from 'antd';

export const columns = [
  {
    title: '序号', width: 150, dataIndex: 'index', key: 'key',
    //sorter: (a, b) => a.index - b.index,
    render: content => <EllipsisText content={content} width={150}/>,
  },
    {
    title: '固件编号', width: 200, dataIndex: 'pack_id', key: 'pack_id',
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '固件名称', width: 200, dataIndex: 'name', 
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '厂商', width: 200, dataIndex: 'fw_manufacturer',
    sorter: (a, b) => a.fw_manufacturer.localeCompare(b.fw_manufacturer, "zh"),
    render: content => <EllipsisText content={content} width={200} />,
  },
  // {
  //   title: '设备类型', width: 200, dataIndex: 'application_mode',
  //   sorter: (a, b) => a.application_mode.localeCompare(b.application_mode, "zh"),
  //   render: content => <EllipsisText content={content} width={200}/>,
  // },
  {
    title: '',
    width: 150,
    render: () => (
      <span>
      </span>
    ),
  },
];
