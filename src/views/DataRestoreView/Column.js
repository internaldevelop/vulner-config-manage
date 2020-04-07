import React from 'react'
import EllipsisText from '../../components/widgets/EllipsisText';

export const columns = [
    {
    title: '文件名', width: 200, dataIndex: 'name', key: 'name',
    //sorter: (a, b) => a.name - b.name,
    render: content => <EllipsisText content={content} width={200}/>,
  },
];
