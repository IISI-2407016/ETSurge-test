// format time to 'YYYY-MM-DD HH:mm'
export const time_format = (time) => {
    if (!time) return '--';
    
    try {
        // 處理 ISO 8601 格式
        const dateObj = new Date(time);
        
        // 驗證日期是否有效
        if (isNaN(dateObj.getTime())) {
            return '--';
        }
        
        // 手動構建格式化字串
        const yearStr = dateObj.getFullYear().toString();
        const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = dateObj.getDate().toString().padStart(2, '0');
        const hourStr = dateObj.getHours().toString().padStart(2, '0');
        const minuteStr = dateObj.getMinutes().toString().padStart(2, '0');
        
        return `${yearStr}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}`;
    } catch (err) {
        console.warn('時間轉換失敗:', err);
        return '--';
    }
};

export const sliceArray = (array) => {
    let result = [];
    const size = Math.ceil(array.length / 6);
    for (var x = 0; x < Math.ceil(array.length / size); x++) {
        var start = x * size;
        var end = start + size;
        result.push(array.slice(start, end));
    }

    return result;
};