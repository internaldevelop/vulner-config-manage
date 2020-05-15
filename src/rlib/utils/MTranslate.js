class MTranslate {

    /**
     * 对指定的英文字符串查表，返回对应的中文字符串
     * @param {String} eng 待转换的英文字符串
     * @return {String} 中文字符串
     */
    eng2chn(eng) {
        // 获取翻译列表
        const transList = this._getTranslateList();

        for (let i = 0; i < transList.length; i++) {
            // 如果有匹配的，则返回对应的中文字符串
            if (transList[i].eng === eng)
                return transList[i].chn;
        }

        // 没有匹配时，则返回原英文字符串
        return eng;
    }

    _getTranslateList() {
        return [
            {
                eng: 'OK',
                chn: '成功',
            },
            {
                eng: 'Network Error',
                chn: '网络连接错误',
            },
            {
                eng: 'Internal Error',
                chn: '系统内部错误',
            },
            {
                eng: 'Database Error',
                chn: '数据库错误',
            },
        ];
    }
}

export default new MTranslate();
