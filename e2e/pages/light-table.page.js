// Page Object：系集燈號表格頁面（lightTableView.vue）
// 依 e2e-testing-playwright skill 慣例：測試案例只描述業務流程，頁面互動細節封裝於此
export class LightTablePage {
    /** @param {import('@playwright/test').Page} page */
    constructor(page) {
        this.page = page;
        this.light_tab = page.getByRole('tab', { name: '系集燈號表格預覧' });
        this.typhoon_select = page.locator('.v-select').first();
        this.initial_time_select = page.locator('.v-select').nth(1);
        this.draw_button = page.getByRole('button', { name: '繪製' });
        // 空狀態訊息（含 mdi-table-off 圖示），需與圖例列表中同文字的「無資料」燈號註記區分
        this.no_data_message = page.locator('div:has(> .mdi-table-off)');
        this.light_table = page.locator('table');
    }

    async goto() {
        await this.page.goto('/');
    }

    async open_light_tab() {
        await this.light_tab.click();
    }

    async select_typhoon(title) {
        await this.typhoon_select.click();
        await this.page.getByRole('option', { name: title, exact: true }).click();
    }

    async select_initial_time(title) {
        await this.initial_time_select.click();
        await this.page.getByRole('option', { name: title, exact: true }).click();
    }

    async click_draw() {
        await this.draw_button.click();
    }
}
