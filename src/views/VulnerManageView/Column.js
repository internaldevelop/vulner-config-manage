import React from 'react'
import EllipsisText from '../../components/widgets/EllipsisText';

export const columns = [
  {
    title: '序号', width: 100, dataIndex: 'index', key: 'key',
    sorter: (a, b) => a.index - b.index,
    render: content => <div>{content}</div>,
  },
  {
    title: '漏洞编号', width: 160, dataIndex: 'edb_id',
    sorter: (a, b) => a.edb_id - b.edb_id,
    render: content => <EllipsisText content={content} width={160} />,
  },
  {
    title: '漏洞名称', width: 220, dataIndex: 'title',
    sorter: (a, b) => a.title.localeCompare(b.title, "zh"),
    render: content => <EllipsisText content={content} width={220} />,
  },
  // {
  //   title: '发布者', width: 150, dataIndex: 'author',
  //   sorter: (a, b) => a.author.localeCompare(b.author, "zh"),
  //   render: content => <EllipsisText content={content} width={150} />,
  // },
  {
    title: '漏洞类型', width: 160, dataIndex: 'type',
    sorter: (a, b) => a.type.localeCompare(b.type, "zh"),
    render: content => <EllipsisText content={content} width={160} />,
  },
  // {
  //   title: '平台', width: 100, dataIndex: 'platform',
  //   sorter: (a, b) => a.platform.localeCompare(b.platform, "zh"),
  //   render: content => <EllipsisText content={content} width={100} />,
  // },
  // {
  //   title: '发布时间', width: 120, dataIndex: 'date_published',
  //   sorter: (a, b) => a.date_published.localeCompare(b.date_published, "zh"),
  //   render: content => <EllipsisText content={content} width={120} />,
  // },
  {
    title: '厂商', width: 200, dataIndex: 'vulner_manufacturer',
    sorter: (a, b) => a.vulner_manufacturer.localeCompare(b.vulner_manufacturer, "zh"),
    render: content => <EllipsisText content={content} width={200} />,
  },
  {
    title: '设备型号', width: 200, dataIndex: 'application_mode',
    sorter: (a, b) => a.application_mode.localeCompare(b.application_mode, "zh"),
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '威胁等级', width: 200, dataIndex: 'risk_level',
    sorter: (a, b) => a.risk_level.localeCompare(b.risk_level, "zh"),
    render: content => <EllipsisText content={content} width={200}/>,
  },
  {
    title: '固件版本', width: 200, dataIndex: 'fw_version',
    sorter: (a, b) => a.fw_version.localeCompare(b.fw_version, "zh"),
    render: content => <EllipsisText content={content} width={200}/>,
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
