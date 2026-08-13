import { describe, it, expect } from 'vitest';
import { format_date } from './formatted-date.js';

describe('format_date', () => {
    it('將 Date 物件格式化為 yyyy/mm/dd', () => {
        expect(format_date(new Date(2026, 7, 13))).toBe('2026/08/13');
    });

    it('空值輸入回傳空字串', () => {
        expect(format_date('')).toBe('');
        expect(format_date(null)).toBe('');
    });
});
