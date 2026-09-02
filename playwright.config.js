import { defineConfig, devices } from '@playwright/test';

// E2E 測試設定（依 iisi-copilot skills/collections/testing/e2e-testing-playwright 慣例）
// - webServer 同時啟動 vite dev server 與 mock_server（本機假資料），供測試連線
// - 若本機已手動啟動兩者（例如開發時常駐的 nodemon mock_server），會直接重用既有服務
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:8906/app/',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'npm run dev',
            url: 'http://localhost:8906/app/',
            reuseExistingServer: true,
            timeout: 60_000,
        },
        {
            command: 'node mock_server/mock.js',
            url: 'http://localhost:10008/surge_app/get_typhoon_info/',
            reuseExistingServer: true,
            timeout: 30_000,
        },
    ],
});
