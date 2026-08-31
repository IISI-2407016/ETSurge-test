# CLAUDE.md — AI Agent 專案指引（ETsurge Frontend）

> 本檔案供 AI 開發助手（GitHub Copilot / Claude Code 等）讀取，作為 iisi-copilot 公版 agent/skill
> 導入本專案時的補充規範。**權威來源仍是 `README.md`**（Coding Style、命名規範、API/Store/Component
> 規範、Git Flow、禁止事項），本檔案不重複其內容，只做「引用 + 補充 + 落差備註」。

## 1. 必讀文件（依序）

1. `README.md` — 專案簡介、技術架構、Coding Style、命名規範、API/Store/Component 規範、
   Git Flow、修改原則、禁止事項、回覆方式。**所有規則以此檔為準。**
2. `API.md` — 後端 `surge_app` / `auth` API 完整規格（Request/Response、欄位說明、範例）。
3. `DESIGN.md`（本目錄）— 領域知識補充：警戒等級定義、KMZ/ssdvs.zip 封裝格式、
   `TyphoonFilterParameters` / `CountyTideWarning` 等核心資料模型。
4. `mock_server/` — 本機開發用假資料伺服器（Express, port 10008），驗證前端串接時可比對回應格式。

## 2. Git Flow 重點提醒（已同步更新於 README.md，2026-08-28）

- 分支命名：`<type>/<Issue編號>-<簡短描述>`（`feat`/`fix`/`chore`），從 `master` 切出，PR 合併回
  `master`；目前僅 `master` 為長期分支，無 `develop`/`release`。
- `README.md` 的「禁止事項」明確禁止 agent 自動 `git commit` / `git push` / `git merge`，
  **此規則優先度最高，任何自動化流程都不可繞過**，必須交由人工執行或明確被使用者要求才可執行。

## 3. 自動化流程對應（參考公司「AI自動化流程計畫書」）

| 計畫書階段 | 本專案對應資源 |
|---|---|
| ③ 執行開發 | 依 `README.md` 規範撰寫，Vue3 Options API 為主、Pinia store、`apiRequest()` 唯一入口 |
| ③ 產出驗證 | 對照 `API.md` schema + `mock_server/` 回應格式 |
| ④ 原掃 OWASP | 套用 iisi-copilot `agents/ssdlc/security-reviewer.agent.md`（SAST+SCA 完整複審已完成，見第 4 節與 `docs/security-reports/`） |
| ⑤ 單元測試 | `npm run test`（Vitest + @vue/test-utils），新測試放 `__tests__/`，不與原始檔 co-locate |
| ⑥ Code Review | 套用 iisi-copilot `agents/ssdlc/code-reviewer.agent.md` |
| ⑦ MD 文件同步 | 本檔案與 `DESIGN.md` 為同步對象；差異化更新，不整檔覆寫 |

## 4. 安全審查待辦（已由 security-reviewer agent 完整複審，2026-08-28；「立即」等級已修復，2026-08-31）

> 完整報告見 [`docs/security-reports/2026-08-28_security-review.md`](docs/security-reports/2026-08-28_security-review.md)（SAST+SCA，依 `agents/ssdlc/security-reviewer.agent.md` 格式）。
> 「立即」等級（Critical/High）與 `axiosConfig.js` 設定衝突已於 2026-08-31 修復並通過
> `npm run test` + `npm run build` 驗證；Checkmarx 正式複核仍待安排。

| 嚴重性 | SAST | SCA | 合計 | 狀態 |
|---|---|---|---|---|
| Critical | 0 | 1（`tar`） | 1 | ✅ 已修（`npm audit fix`） |
| High | 1（XSS，7 處 `v-html`） | 2（`picomatch`） | 3 | ✅ 已修 |
| Medium | 2（Token 存 localStorage、`axiosConfig.js` maxContentLength 設定衝突被覆蓋為 2000） | 1（`qs` 直接依賴） | 3 | `axiosConfig.js`／`qs` 已修，Token 儲存改 httpOnly cookie **尚未處理**（需後端協調） |
| Low | 1（`config.js` 內網 IP 洩漏） | 3（express 系列生產依賴錯置） | 4 | **尚未處理**（Backlog） |

**已完成修復**（2026-08-31）：
1. **XSS**：7 處 `v-html` 中，4 處（無需 HTML 格式的內容）改為 `{{ }}` 文字插值；
   3 處（需要 `<br>` 排版的內容）改用新增的 `src/utils/sanitize-html.js`
   （`sanitize_html()`，內部使用 `DOMPurify`，僅允許 `<br>` 標籤）消毒後再綁定 `v-html`。
   **例外說明**：README.md「Never」清單禁止新增第三方套件，但 XSS 消毒為安全性必要措施，
   已與使用者確認並取得同意，新增 `dompurify` 為此例外，往後如再需要新增套件仍須逐次確認。
2. **`npm audit fix`**：已修復 `tar`（Critical，路徑穿越/DoS）與 `picomatch`（High，
   Method Injection/ReDoS），`npm audit` 已不再列出這兩項。
3. **`qs` 升級**：`^6.14.0` → `^6.16.0`（符合建議的 `^6.15.2` 以上）。
4. **`axiosConfig.js` maxContentLength 衝突**：移除第 115 行重複賦值的 `maxContentLength: 2000`
   （axios 官方範例殘留），讓第 21 行的 `Infinity` 生效，避免大型 API 回應被靜默截斷。

**尚未處理**（短期/長期，詳見完整報告「修正優先序」）：
- Token 存於 `localStorage` 改 `httpOnly` cookie（需後端協調）
- `config.js` 內網 IP 洩漏於註解、`express`/`express-session`/`cors` 搬移至 `devDependencies`

## 5. 待確認疑問（測試過程中發現，非本次修改範圍）

- **`src/utils/tool-box.js` 的 `format_date_range()` 農曆分支疑似邏輯瑕疵**：`startMonth`/
  `endMonth` 不論 `is_lunar` 為 true/false，皆固定用 `getMonth() + 1` 計算，只有「日」透過
  `is_lunar ? getDay() : getDate()` 切換農曆/國曆。實測 `format_date_range('2026-08-13', true)`
  回傳 `115年8月1日至3日`——「8月」是國曆月份索引（Lunar 物件的 `getMonth()` 與 `getFullYear()`
  行為與 `Date` 物件不同，此處恰好巧合疊加），「1日至3日」才是農曆日。是否為既有已知行為或
  真實 bug，需與需求方確認後再決定是否修正（見 `__tests__/tool-box.test.js` 的
  `is_lunar=true` 測試案例與註解）。

## 6. 執行進度紀錄（AI自動化流程計畫書導入，暫停點）

> 本節記錄「AI自動化流程計畫書」九階段導入的實際執行進度，供下次接續時快速回復脈絡，
> 不需重新從頭探索。已使用/尚未使用的 iisi-copilot agent/skill 完整清單見
> [`docs/iisi-copilot-usage-log.md`](docs/iisi-copilot-usage-log.md)。

### 已完成
- **① 分支規範**：已修正 `README.md` Git Flow 章節，改為符合實際慣例的
  `<type>/<Issue編號>-<簡短描述>` 命名規則
- **② Issue 撰寫模板**：**跳過**（GitLab 專案本身已有 Issue Template 機制，不在此重複建立）
- **④ 原掃 OWASP**：已完成 `dependency-scanning`（`npm audit`）+ `owasp-top10`/`security-reviewer`
  完整 SAST+SCA 複審（見第 4 節），且「立即」等級（XSS、`tar`/`picomatch`、`qs`、
  `axiosConfig.js` maxContentLength 衝突）已於 2026-08-31 修復並通過測試/build 驗證；
  Checkmarx 正式複核仍待安排
- **⑤ 單元測試**：執行 `npm run test` 全數通過；並用 `test-generator` agent 為
  `src/utils/tool-box.js` 補上 `__tests__/tool-box.test.js`（18 個測試），已通過
  `code-reviewer` agent 審查（✅ Approved）
- **⑦ MD 文件同步**：建立 `CLAUDE.md`（本檔案）、`DESIGN.md`（領域知識），持續差異化更新中

### 尚未開始
- **③ Agent 任務解析 / 呼叫 skill 開發**：尚未實際跑一個 Issue 走完整開發流程
- **⑥ Code Review**：僅對「新增的測試程式碼」做過 review，**尚未對既有 `src/` 程式碼做完整 code-reviewer 審查**
- **⑧ 失敗處理迴圈**、**⑨ 人工最終審核**：尚未設計/演練

### 待辦與待確認（累積，詳見第 5、6 節）
1. 第 4 節安全審查「短期」（Token 存 localStorage 改 httpOnly cookie，需後端協調）與
   「長期」（`config.js` IP 洩漏、express 系列搬到 devDependencies）項目**尚未修復**
2. 第 5 節 `format_date_range()` 農曆分支邏輯疑問，待與需求方確認是否為 bug
3. 第 7 節：原掃工具選型、CI Runner 網路權限、Issue 模板落地與否，均待確認
4. 本次安全修復新增了 `dompurify` 依賴，屬 README.md「Never」清單「禁止新增第三方套件」的
   例外情況（XSS 消毒必要性，已取得使用者同意），往後若再需要新增套件仍須逐次向使用者確認
5. 本次所有變更（README.md、CLAUDE.md、DESIGN.md、`__tests__/tool-box.test.js`、
   `docs/security-reports/`、XSS 修復的 6 個檔案 + 新增的 `sanitize-html.js`、
   `package.json`/`package-lock.json`、`axiosConfig.js`）已取得使用者明確指示，即將 commit

### 建議的下一步（供接續時參考，非強制順序）
- 選項 A：處理第 4 節安全審查「短期/長期」剩餘項目
- 選項 B：套用 `code-reviewer` agent 對既有 `src/` 程式碼做一次完整審查（階段⑥）
- 選項 C：實際挑一個 Issue 走完整開發流程（階段③）

## 7. 尚待確認（見公司計畫書「待確認事項清單」）

- 原掃工具選型與 CI Runner 網路權限（目前本 repo 無 `.gitlab-ci.yml`）
- Issue 撰寫模板：優先確認 GitLab 專案本身是否已設定 `.gitlab/issue_templates/`，
  再評估是否需要補充讓 agent 穩定解析所需欄位，不重複造輪子
