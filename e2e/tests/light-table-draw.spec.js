import { test, expect } from '@playwright/test';
import { LightTablePage } from '../pages/light-table.page.js';

// E2E 測試（Issue #4：系集燈號表格「繪製」功能）
// 驗證使用者故事：選擇颱風與初始時間後點擊「繪製」，應顯示各縣市暴潮預警燈號表格，
// 且必須呼叫唯讀的 get_county_tide_warnings_result（不可誤觸發會重新計算的
// get_county_tide_warnings），避免每次預覽都不必要地觸發後端重新運算。
test.describe('系集燈號表格 - 繪製功能', () => {
    test('選擇颱風/初始時間後點擊繪製，應呼叫唯讀 API 並顯示各縣市燈號表格', async ({ page }) => {
        const light_table_page = new LightTablePage(page);

        await light_table_page.goto();
        await light_table_page.open_light_tab();

        // 進頁面時應已無資料
        await expect(light_table_page.no_data_message).toBeVisible();
        await expect(light_table_page.draw_button).toBeEnabled();

        // 監聽「繪製」觸發的後端呼叫，斷言使用唯讀查詢 API，而非會重新計算的 API
        const result_request = page.waitForRequest(
            (req) =>
                req.url().includes('/surge_app/get_county_tide_warnings_result/') &&
                req.method() === 'POST'
        );
        const recompute_requests = [];
        page.on('request', (req) => {
            if (req.url().includes('/surge_app/get_county_tide_warnings/') && req.method() === 'POST') {
                recompute_requests.push(req.url());
            }
        });

        await light_table_page.click_draw();
        await result_request;

        // 繪製完成後，無資料訊息應消失，改為顯示縣市燈號表格
        await expect(light_table_page.no_data_message).toBeHidden();
        await expect(light_table_page.light_table).toBeVisible();
        await expect(light_table_page.light_table).toContainText('基隆');

        // 「繪製」預覽不應觸發會重新計算的 get_county_tide_warnings
        expect(recompute_requests).toHaveLength(0);
    });
});
