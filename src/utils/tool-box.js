import { Lunar } from 'lunar-javascript'

// format local time to 'YYYY-MM-DD HH:mm'
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

// format UTC time to 'YYYY-MM-DD HH:mm'
export const time_format_utc = (time) => {
    if (!time) return '--'; 
    return time.replace('T', ' ').replace(':00Z', '');
}

// format time to 'M月D日 H時'
export const time_format_chDate = (time) => {
    if (!time) return '--';

    // 先建立 Date 物件（注意把空白轉成 T 才能正確解析）
    const date = new Date(time.replace(" ", "T"));

    const month = date.getMonth() + 1;   // 月份從 0 開始
    const day = date.getDate();
    const hour = date.getHours();
    
    return `${month}月${day}日 ${hour}時`;
}

// format time to hour only
export const format_hours = (time) => {
    if (!time) return '-';

    const date = new Date(time.replace(" ", "T"));
    const hour = date.getHours();

    return hour;
}

// 日期格式: 'YYY年M月D日至YYY年M月D日'，可農曆判斷
export const format_date_range = (time, is_lunar) => {
    if (!time) return '--';
        try {
        const start = new Date(time)
        
        // 檢查日期有效性
        if (isNaN(start.getTime())) {
            console.error('無效的日期格式:', time)
            return '資料日期範圍：日期格式錯誤'
        }
        
        const end = new Date(start)
        end.setDate(start.getDate() + 2)

        // 轉換為農曆
        const start_lunar = Lunar.fromDate(start)
        const end_lunar = Lunar.fromDate(end)

        const start_date = is_lunar ? start_lunar : start
        const end_date = is_lunar ? end_lunar : end
        
        const startMonth = start_date.getMonth() + 1
        const startDay = !is_lunar ? start_date.getDate() : start_date.getDay()
        const endMonth = end_date.getMonth() + 1
        const endDay = !is_lunar ? end_date.getDate() : end_date.getDay()
        const startYear = (!is_lunar ? start_date.getFullYear() : start_date.getYear()) - 1911
        const endYear = (!is_lunar ? end_date.getFullYear() : end_date.getYear()) - 1911

        // 跨年處理
        if (startYear !== endYear) {
            return `${startYear}年${startMonth}月${startDay}日至${endYear}年${endMonth}月${endDay}日`
        }
        // 跨月處理
        else if (startMonth !== endMonth) {
            return `${startYear}年${startMonth}月${startDay}日至${endMonth}月${endDay}日`
        }
        // 同月處理
        else {
            return `${startYear}年${startMonth}月${startDay}日至${endDay}日`
        }
    } catch (error) {
        console.error('日期處理錯誤:', error)
        return '資料日期範圍：處理錯誤'
    }
}

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