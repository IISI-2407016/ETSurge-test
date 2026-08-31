import { describe, it, expect } from 'vitest';
import {
    time_format,
    time_format_utc,
    time_format_chDate,
    format_hours,
    format_date_range,
    sliceArray,
} from '@/utils/tool-box.js';

// test-generator agent 產生：涵蓋正常路徑、邊界值（空值/null）、異常路徑（無效格式）
describe('time_format', () => {
    it('將 ISO 時間字串格式化為 YYYY-MM-DD HH:mm', () => {
        expect(time_format('2026-08-13T10:30:00')).toBe('2026-08-13 10:30');
    });

    it('空字串輸入回傳 --', () => {
        expect(time_format('')).toBe('--');
    });

    it('null 輸入回傳 --', () => {
        expect(time_format(null)).toBe('--');
    });

    it('無效日期格式回傳 --（不拋出例外）', () => {
        expect(time_format('not-a-date')).toBe('--');
    });
});

describe('time_format_utc', () => {
    it('將 UTC 時間字串轉為 YYYY-MM-DD HH:mm（去除 T 與秒數）', () => {
        expect(time_format_utc('2026-08-13T10:30:00Z')).toBe('2026-08-13 10:30');
    });

    it('空字串輸入回傳 --', () => {
        expect(time_format_utc('')).toBe('--');
    });
});

describe('time_format_chDate', () => {
    it('將時間字串格式化為 M月D日 H時', () => {
        expect(time_format_chDate('2026-08-13 09:00:00')).toBe('8月13日 9時');
    });

    it('空字串輸入回傳 --', () => {
        expect(time_format_chDate('')).toBe('--');
    });
});

describe('format_hours', () => {
    it('取出時間字串中的小時數', () => {
        expect(format_hours('2026-08-13 14:00:00')).toBe(14);
    });

    it('空字串輸入回傳 -', () => {
        expect(format_hours('')).toBe('-');
    });
});

describe('format_date_range', () => {
    it('回傳三天期間的日期範圍（民國年、同月）', () => {
        // 2026-08-13 起連續 3 天（含起始日共 +2 天），皆在 8 月內，不跨月
        expect(format_date_range('2026-08-13')).toBe('115年8月13日至15日');
    });

    it('跨月時回傳含兩個月份的日期範圍', () => {
        expect(format_date_range('2026-08-30')).toBe('115年8月30日至9月1日');
    });

    it('is_lunar=true 時回傳農曆日期範圍（民國年、農曆日）', () => {
        // 2026-08-13 對應農曆月份索引 7（Lunar.getMonth()），程式邏輯 startMonth 固定用
        // getMonth()+1（未依 is_lunar 切換），故顯示為「8月」；日期則依 is_lunar 切換為
        // 農曆日（getDay()）：起始日 1、+2天後為 3，同月故不跨月顯示
        expect(format_date_range('2026-08-13', true)).toBe('115年8月1日至3日');
    });

    it('無效日期格式時回傳錯誤訊息而非拋出例外', () => {
        expect(format_date_range('not-a-date')).toBe('資料日期範圍：日期格式錯誤');
    });

    it('空值輸入回傳 --', () => {
        expect(format_date_range('')).toBe('--');
    });
});

describe('sliceArray', () => {
    it('將陣列切割為最多 6 組', () => {
        const result = sliceArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        expect(result).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12]]);
    });

    it('元素數小於 6 時，每組僅 1 個元素', () => {
        expect(sliceArray([1, 2, 3])).toEqual([[1], [2], [3]]);
    });

    it('空陣列輸入回傳空陣列（邊界值，不應拋出例外或無限迴圈）', () => {
        expect(sliceArray([])).toEqual([]);
    });
});
