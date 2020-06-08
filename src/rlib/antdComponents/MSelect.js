import React from 'react';
import { Select } from 'antd';

class MSelect {
    normal(options, handleSelectChange, toolTips='', maxWidth=300, minWidth=200) {
        return (<Select
            // mode="multiple"
            placeholder={toolTips}
            style={{ maxWidth: maxWidth, minWidth: minWidth }}
            allowClear
            // dropdownMatchSelectWidth
            onChange={handleSelectChange}
        >
            {options.map((item, index) => (
                <Select.Option key={item.value} value={item.value}>
                    {item.title}
                </Select.Option>
            ))}
        </Select>);
    }
}

export default new MSelect();
