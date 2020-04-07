import React from 'react'
import EllipsisText from '../../components/widgets/EllipsisText';

export const columns = [
    {
    title: '账号', width: 200, dataIndex: 'name', key: 'name',
    //sorter: (a, b) => a.name - b.name,
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '密码', width: 200, dataIndex: 'password', key: 'password',
    //sorter: (a, b) => a.password.localeCompare(b.password, "zh"),
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '角色', width: 200, dataIndex: 'roles', key: 'roles',
    //sorter: (a, b) => a.roles.localeCompare(b.roles, "zh"),
    render: content => <EllipsisText content={content} width={200} />,
  },
];
