import React from 'react';
import { Tooltip } from 'antd';
import MObjUtils from '../utils/MStrUtils';

const DEFAULT_PAGE_SIZE = 10;

class MAntdTable {
    /**
     * 设置列 style 为文本不换行，超过列宽部分使用省略号
     * @param {*} maxWidth 列最大宽度
     * @param {*} cursor 鼠标游标形状
     */
    noWrapCell(maxWidth, cursor = 'default') {
        return {
            style: {
                width: maxWidth,
                maxWidth: maxWidth,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                cursor: cursor,
            }
        }
    }

    _cmpCol(a, b, col) {
        let aVal = a[col['dataIndex']];
        let bVal = b[col['dataIndex']];

        return MObjUtils.compare(aVal, bVal);
    }

    /**
     * 按常用的模式设置列属性：myNoWrap, mySort, ...
     * @param {Array} colsList 列属性数组，必填属性为: title, dataIndex
     */
    buildColumns(colsList) {
        for (let col of colsList) {
            // 如果没有 key 属性，则用 dataIndex 的值补充 key 属性
            if (!col.hasOwnProperty('key')) {
                col['key'] = col['dataIndex'];
            }

            // 如果没有 width 属性，默认150
            if (!col.hasOwnProperty('width')) {
                col['width'] = 150;
            }

            // 设置不换行，且增加 tooltip
            if (col.hasOwnProperty('myNoWrap') && col['myNoWrap']) {
                col['onCell'] = () => this.noWrapCell(col['width']);
                col['render'] = (content) => <Tooltip placement="topLeft" title={content}>{content}</Tooltip>;
            }

            // 设置排序
            if (col.hasOwnProperty('mySort') && col['mySort']) {
                // col['sorter'] = (a, b) => a[col['dataIndex']].localeCompare(b[col['dataIndex']], "zh");
                col['sorter'] = (a, b) => this._cmpCol(a, b, col);
            }
        }
    }

    findColumn(colsList, dataIndex) {
        for (let col of colsList) {
            if (col['dataIndex'] === dataIndex)
                return col;
        }
        return null;
    }

    pagination(handlePageChange = null, pageSizeOptions = []) {
        if (pageSizeOptions.length === 0) {
            pageSizeOptions = [DEFAULT_PAGE_SIZE.toString(), '20', '30', '40']
        }
        return {
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            pageSizeOptions: pageSizeOptions,
            defaultPageSize: DEFAULT_PAGE_SIZE,
            showQuickJumper: true,
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {  //当几条一页的值改变后调用函数，current：改变显示条数时当前数据所在页；pageSize:改变后的一页显示条数
                if (handlePageChange !== null)
                    handlePageChange(current, pageSize);
            },
            onChange(current, pageSize) {  //点击改变页数的选项时调用函数，current:将要跳转的页数
                if (handlePageChange !== null)
                    handlePageChange(current, pageSize);
            },
        };
    }
}

export default new MAntdTable();
