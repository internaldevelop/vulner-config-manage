import MStrUtils from '../utils/MStrUtils';


class MAntdCard {

    /**
     * 返回指定的卡片头部风格的字典对象
     * @param {String} mode 模式
     */
    headerStyle(mode){
        if (MStrUtils.equalNoCase(mode, 'main')) {
            return {backgroundColor: '#0093be', color: 'white'};

        } else if (MStrUtils.equalNoCase(mode, 'main-2')) {
            return {backgroundColor: '#008c9e', color: 'white'};

        } else if (MStrUtils.equalNoCase(mode, 'emphasis')) {
            return {backgroundColor: '#880e4f', color: 'white'};

        } else if (MStrUtils.equalNoCase(mode, 'emphasis-2')) {
            return {backgroundColor: '#d9534f', color: 'white'};

        } else if (MStrUtils.equalNoCase(mode, 'info')) {
            return {backgroundColor: '#00695C', color: 'white'};

        } else if (MStrUtils.equalNoCase(mode, 'notify')) {
            return {backgroundColor: '#fff9c4', color: 'black'};

        } else if (MStrUtils.equalNoCase(mode, 'info-2')) {
            return {backgroundColor: '#fffbe5', color: 'black'};

        } else if (mode[0] === '#') {
            return {backgroundColor: mode, color: 'white'};
        }
    
        // 缺省情况下的卡片头部风格设置
        return {backgroundColor: '#0093be', color: 'white'};
    }
    
}

export default new MAntdCard();
