import React from 'react';
import { Select } from 'antd';

class MSelect {
    normal(dataList, handleSelectChange, toolTips='', maxWidth=300, minWidth=200) {
        return (<Select
            // mode="multiple"
            placeholder={toolTips}
            style={{ maxWidth: maxWidth, minWidth: minWidth }}
            allowClear
            // dropdownMatchSelectWidth
            onChange={handleSelectChange}
        >
            {dataList.map((item, index) => (
                <Select.Option key={index} value={item.name}>
                    {item.name}
                </Select.Option>
            ))}
        </Select>);
    }
}

export default new MSelect();
