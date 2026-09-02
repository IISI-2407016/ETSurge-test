import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock apiRequest 以隔離對 axios/後端的真實呼叫，僅驗證呼叫的 method/endpoint/payload
vi.mock('@/utils/api-request.js', () => ({
    apiRequest: vi.fn(),
}));

import { apiRequest } from '@/utils/api-request.js';
import {
    post_county_tide_warnings_ajax,
    post_county_tide_warnings_result_ajax,
} from '@/js/light.js';
import { use_light_store } from '@/stores/light.js';

// test-generator agent 產生：涵蓋正常路徑、邊界值（空資料）、異常路徑（API 失敗）
describe('post_county_tide_warnings_ajax', () => {
    beforeEach(() => {
        apiRequest.mockReset();
    });

    it('呼叫會重新計算的 get_county_tide_warnings endpoint', () => {
        post_county_tide_warnings_ajax({ parameters_id: 1, data_source: 'surge_model_mod' });
        expect(apiRequest).toHaveBeenCalledWith(
            'post',
            '/surge_app/get_county_tide_warnings/',
            { parameters_id: 1, data_source: 'surge_model_mod' }
        );
    });
});

describe('post_county_tide_warnings_result_ajax', () => {
    beforeEach(() => {
        apiRequest.mockReset();
    });

    it('呼叫唯讀的 get_county_tide_warnings_result endpoint（不重新計算）', () => {
        post_county_tide_warnings_result_ajax({ parameters_id: 1 });
        expect(apiRequest).toHaveBeenCalledWith(
            'post',
            '/surge_app/get_county_tide_warnings_result/',
            { parameters_id: 1 }
        );
    });
});

describe('use_light_store().get_county_tide_warnings_result', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        apiRequest.mockReset();
    });

    it('正常路徑：成功時寫入 light_list 並回傳 success:true', async () => {
        const mock_data = [{ city: '基隆', order: 1, data: [] }];
        apiRequest.mockResolvedValueOnce({ status: 'success', data: mock_data });

        const light_store = use_light_store();
        const result = await light_store.get_county_tide_warnings_result({ parameters_id: 1 });

        expect(result).toEqual({ success: true, data: mock_data });
        expect(light_store.light_list).toEqual(mock_data);
    });

    it('邊界值：回傳空陣列時仍視為成功（空陣列在 JS 為 truthy）', async () => {
        apiRequest.mockResolvedValueOnce({ status: 'success', data: [] });

        const light_store = use_light_store();
        const result = await light_store.get_county_tide_warnings_result({ parameters_id: 1 });

        expect(result).toEqual({ success: true, data: [] });
        expect(light_store.light_list).toEqual([]);
    });

    it('異常路徑：API 回傳 status 非 success 時回傳 success:false', async () => {
        apiRequest.mockResolvedValueOnce({ status: 'error', message: '找不到指定的颱風過濾參數' });

        const light_store = use_light_store();
        const result = await light_store.get_county_tide_warnings_result({ parameters_id: 999 });

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
    });

    it('異常路徑：apiRequest 拋出例外時不會向外拋出，回傳 success:false', async () => {
        apiRequest.mockRejectedValueOnce(new Error('Network Error'));

        const light_store = use_light_store();
        const result = await light_store.get_county_tide_warnings_result({ parameters_id: 1 });

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(Error);
    });
});
