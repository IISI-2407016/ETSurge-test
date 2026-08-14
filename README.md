# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## node version v18.20.7

## 專案資料夾結構
```
frontend/
├── mock_server/
    ├── mock.js/            # 模擬API

    src/
    ├── assets/             # 靜態資源（圖片、樣式）
    ├── components/         # 通用元件
    │   └── dialogs/        # pop視窗元件（ex: 註冊、忘記密碼、修改個人資料）
    ├── config/             # 初始預設
    │   └── axiosConfig.js  # 統一設定 axios 請求樣板
    │   └── config.js       # 設定 API 請求
    ├── views/              # 每個頁面
    ├── router/             # vue-router 設定檔
    │   └── index.js
    ├── stores/             # pinia 狀態管理
    │   └── station-store.js # 
    ├── utils/              # 通用工具管理
    │   └── api-request.js  # API 
    ├── App.vue             # 根元件
    └── main.js             # 進入點
```

## 本地自動化打包設定檔
- bash release.sh (執行前請注意是否為指定的打包路徑)

## 版本更新
- package.json【<b>version</b>】(更新時請調整)

## 專案簡介

暴潮系集展示系統（ETSurge Frontend）— 提供颱風系集路徑查詢、潮位觀測/預報時序圖比對、
縣市潮位警戒燈號，並可將預報結果傳送至官網/資料庫。服務對象為氣象/水利作業人員。

## 技術架構

- **框架**：Vue 3（Options API 為主）+ Vue Router 4 + Pinia（狀態管理，非 Vuex）
- **UI**：Vuetify 3 + Tailwind CSS v4（兩套並存，新元件優先用哪一套需與團隊確認）
- **繪圖**：D3.js（水位時序圖）、Leaflet（颱風路徑地圖）
- **HTTP**：Axios，統一封裝於 `src/utils/api-request.js`
- **建置**：Vite，`base: '/app'`，別名 `@` → `src/`
- **測試**：Vitest 3（設定寫在 `vite.config.js` 的 `test` 欄位，`environment: 'jsdom'`，無獨立 `vitest.config.js`）+ `@vue/test-utils`，指令 `npm run test`；目前僅 `src/utils/formatted-date.test.js` 一支測試，覆蓋率低
- **後端**：Django 風格 REST API（`/auth/...`、`/surge_app/...`），正式/測試環境與前端同網域部署
- **本機開發**：`mock_server/`（Express，port 10008）提供假資料，baseURL 由 `src/config/config.js` 依 `location.href` 自動切換
- **重要架構特色**：頁籤切換（UVP／潮位時序圖／燈號表格…）**不是** vue-router 路由，而是 `stores/use-app.js` 的 `current_tab` 驅動 `main.vue` 條件渲染

## Coding Style

- 縮排 4 個空白，語句結尾加分號
- 目前專案 **單引號 `'` 與雙引號 `"`混用**（例如 `stores/UVP-data.js` 用單引號、`js/light.js` 用雙引號）——新程式碼統一使用**單引號**
- Store 一律使用 Pinia Options-style（`defineStore(id, { state, actions })`），除非有特殊理由，否則不要混用 setup-style（目前只有 `alert.js` 是例外）
- 商業邏輯放在 store 的 actions，Vue Component 只負責畫面與呼叫 store，**不要**在 component 內直接 import `src/js/*.js` 或 axios
- 每個 state/変數若非顯而易見用途，加簡短中文註解說明（沿用現況風格，例如 `is_uvp_search: true // 判斷目前是颱風查詢還是系集查詢`）
- 使用 Composition API
- 不使用 any
- 優先沿用既有 Component
- 不修改需求外的程式

## 命名規範

> 現況本身**不一致**，以下為新程式碼建議遵循的標準，修改舊檔案時不強制重構既有命名。

- **變數 / 函式 / store state**：`snake_case`（例如 `current_tab`、`fetch_user_groups()`、`search_results`）
- **API 函式**：`動詞_名詞_ajax`，如 `post_typhoon_track_data_ajax`、`get_typhoon_name_data_ajax`
- **後端回傳欄位**（如 `TyNo`、`ModelNameList`、`CardinalDirection`）維持後端原始命名，不擅自轉換大小寫
- **檔案命名**：現況混合 kebab-case（`tide-level.js`、`api-request.js`）與 PascalCase/camelCase（`UVPView.vue`、`lightTableView.vue`）。建議：
  - `.vue` 頁面元件 → PascalCase 或既有 camelCase 皆可，但同資料夾內盡量一致
  - `.js`（store / api / utils）→ kebab-case
- **Store id**：與檔案主題一致的 snake_case（`uvp_data`、`tide_level`、`station_set_store`）
- 新檔案**避免**再出現「同功能多版本並存」的命名方式（現況 `sixHourChart.vue` / `_new` / `_old` 三版並存是反面案例，新增修改時應覆蓋既有檔案並清掉舊版，而不是複製一份加後綴）

## API 規範

- **唯一入口**：所有 API 呼叫一律透過 `src/utils/api-request.js` 的 `apiRequest(method, url, data)`，禁止在 component/store 中直接 `import axios`
- **檔案組織**：依業務模組拆檔於 `src/js/`（`login.js`、`user.js`、`tide-level.js`、`typhoon-data.js`、`setting.js`、`light.js`），新業務模組請新增對應檔案，不要塞進既有不相關檔案
- **路徑前綴**：認證相關 `/auth/...`，業務相關 `/surge_app/...`
- **回應處理**：store 呼叫 API 後統一用 `wrap_api_response(result, successMsg, failMsg)` 包裝，成功/失敗訊息透過 `use_alert_store().show_alert()` 顯示，**不要**在 component 內用 `alert()` 或自行 try/catch 顯示錯誤
- **Query 陣列參數**：交由 `qs`（`brackets` 格式）處理，不要手動拼字串
- **Token**：由 request/response 攔截器自動處理（帶 `Authorization` header、401 時清除 token），業務程式碼不需手動操作 token

## Store 規範

- 一個業務模組一個 store 檔案，放在 `src/stores/`，`defineStore(id, {...})` 的 `id` 與檔名主題一致
- state 初始值需明確給型別對應的預設值（陣列給 `[]`、物件給 `{}`），避免 `undefined`
- actions 內對外部 API 的呼叫，遵循「呼叫 `src/js/*.js` → `wrap_api_response` → 更新 state → 視需要呼叫 alert store」的固定流程
- 新增 store 前檢查 `src/stores/station.js` 這類舊版/未整合 store 是否已有相同用途，避免重複造輪子；若確認是遺留程式碼，修改前先向使用者確認是否可以整併或移除
- 全域 UI 狀態（如目前頁籤、loading）維持現有的 `use-app.js` 模式，不要另外用 `provide/inject` 或全域變數繞過 Pinia
- 使用 Pinia
- 不直接修改 State
- Action 命名遵守既有風格

## Component 規範

- `views/` 放頁面層元件（對應頁籤/功能），`components/` 放跨頁面共用元件，`components/dialogs/` 放彈窗
- 新增彈窗一律放 `components/dialogs/`，優先重用 `popFormDialog.vue` / `messageDialog.vue`，不要每個功能各自刻一個彈窗元件
- 下拉多選需要「全選」功能時重用 `multiSelectWithAll.vue`
- 查詢條件卡片型 UI 優先參考/重用 `searchCard.vue` 的結構
- 元件內**不要**直接寫商業邏輯或 API 呼叫，透過 store 的 action 與 computed state 溝通
- 新頁籤功能請走 `use-app.js` 的 `current_tab` 模式（於 `main.vue` 加 `v-else-if` 分支），**不要**另外新增 vue-router 路由，除非該功能本來就需要獨立可分享的網址

## Git Flow
禁止：
- git push
- git merge
- git commit

除非我明確要求。

- 目前為單一 `master` 分支開發，commit 直接建立在 `master` 上（未觀察到 feature branch 慣例），如需變更此流程請先與使用者確認
- **Commit message 慣例**（Conventional Commits 精簡版，中文描述）：
  - `feat: 新增XXX功能`
  - `fix: 調整/優化XXX`
  - `chore: 整理/設定類變更`
  - 不使用 scope（沒有 `feat(xxx):` 格式），描述簡短、動詞開頭
- 沒有 PR/Code Review 紀錄可循，若使用者要求開 PR，依當下指示的目標分支操作，不要自行假設有 `develop`/`release` 分支存在

## 修改原則

- 修改前先確認是否有多版本並存的情況（如 `sixHourChart*.vue`），避免改錯版本或又新增一份
- 涉及 API 路徑或後端合約的變更，需確認 `/surge_app/...` 端點是否也要同步告知後端／更新 mock_server 假資料
- 涉及權限（`stids` / `function_list`，定義於 `src/config/setting.js`）的變更，需同步確認 `userManage.vue` / `groupManage.vue` 的顯示邏輯
- 不確定某個檔案（如 `stores/station.js`、`utils/station-set.js`、`js/user.js` 內的舊式函式）是否仍在使用時，先用 grep 確認實際 import 情況，再決定是否修改或清除，不要假設「看起來像舊的」就直接刪除
- UI 變更遵循目前 Vuetify + Tailwind 混用的現況，不要引入第三套 CSS 方案

## 禁止事項

- 禁止在 component 中直接 `import axios` 或繞過 `apiRequest()` 發請求
- 禁止在 `.env` 之外硬編碼正式環境網址／機敏資訊到程式碼中（目前 baseURL 已是硬編碼於 `config.js`，新增設定值不要延續此壞習慣，除非使用者確認維持現況）
- 禁止未經確認直接刪除看似重複/舊版的檔案（`sixHourChart_old.vue` 等）
- 禁止引入 Vuex（本專案狀態管理已統一為 Pinia）
- 禁止在 store action 外（component 內）直接呼叫 `wrap_api_response` 或處理 alert 顯示邏輯
- 禁止使用 `git push --force`、`git reset --hard` 等破壞性指令，除非使用者明確要求
- 未經使用者同意，禁止修改 `release.sh` 內寫死的本機部署路徑

## Never

不要：

- 修改需求以外程式
- 更改API格式
- 重構大型Component
- 修改CSS命名
- 新增第三方套件
- 自動Commit
- 自動Push

## 回覆方式

每次修改請提供：

1. 修改原因
2. 修改檔案
3. 修改內容摘要
4. 風險
5. 建議測試項目
