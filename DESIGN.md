# DESIGN.md — 領域知識與資料模型（ETsurge Frontend）

> 補充 `README.md`（技術規範）與 `API.md`（API 規格）未系統整理的領域知識，供 AI agent 與新進
> 開發者快速理解「暴潮系集展示系統」的業務概念。內容依 `API.md` 現有描述整理，若後端有異動，
> 需同步更新本檔案（見 CLAUDE.md 第 3 節「MD 文件同步」）。

## 1. 系統定位

暴潮系集展示系統（ETSurge）提供：颱風系集路徑查詢、潮位觀測/預報時序圖比對、縣市潮位警戒燈號，
並可將預報結果傳送至官網/資料庫。服務對象為氣象/水利作業人員。

## 2. 核心資料模型

### `TyphoonFilterParameters`
- 代表一次「颱風篩選/計算」的參數集合，幾乎所有下游 API（打包傳送、警戒計算、資料匯出）都需要
  `parameters_id` 作為關聯鍵。
- 必須 `IsFileReady=True` 才可用於後續打包/傳送流程。
- 非颱風期間（`SentTyphoonPicturesNontableView` 等 non-typhoon 情境）不需要
  `TyphoonFilterParameters` 記錄，改用固定範本圖檔。

### `CountyTideWarning`
- 由 `GetCountyTideWarningsView`（`/surge_app/get_county_tide_warnings/`）計算並落地。
- 每個縣市切分為 6 個「12 小時區間」，各區間計算：
  - `time_range`：時間區間 `[開始時間, 結束時間]`（台北時間）
  - `warning_level`：警戒等級（見下方定義）
  - `max_time` / `max_value` / `max_station`：該區間最大潮位發生時間、數值（公尺）、測站
- `DataSource` 欄位記錄產生最大值測站所使用的資料來源（`surge_model` 或 `surge_model_mod`），
  依 `UserTideStationConfig` 設定，未設定則 fallback 為 `surge_model_mod`。

### 警戒等級（`warning_level`）— 唯一權威定義

| 等級 | 中文 | 條件 |
|---|---|---|
| `gray` | 正常 | 低於注意水位 |
| `yellow` | 黃色警戒 | 超過注意水位 |
| `orange` | 橙色警戒 | 超過警戒水位 |
| `red` | 紅色警戒 | 預留（目前尚未啟用判定邏輯） |

> 前端顯示燈號、排序、樣式時，一律以此 4 級為準，不可自行新增中間等級。

## 3. 官方圖套件封裝格式（`SendOfficialImagesView` 系列）

從 `UploadForecastImagesView` 落地目錄讀取測站時序圖與縣市警戒圖，依 `CwaUserSentConfig` 的
地區-測站對應，組成以下三種封裝格式，分別傳送給不同下游：

| 封裝格式 | 說明 | 傳送對象 |
|---|---|---|
| **KMZ** | Google Earth 格式 | NCDR targets |
| **picture zip**（`ssdvs.zip`） | CEOC 格式 | CEOC targets |
| **ssdvs.zip** | CWA 官網格式 | CWA targets |

### 目錄與命名規則
- 落地圖片目錄：`{FORECAST_IMAGES_PATH}/{TyNo}_{InitialTime}_{Category}_{ParametersHash}/`
- 測站時序圖：`station_charts/{StationID}_zh.png`（中文）／`station_charts/{StationID}_en.png`（英文）
- ssdvs 目錄結構：
  - `cht/route/HSU{AreaCode:02d}.jpg`（中文地區路線圖）
  - `eng/route/HSU{AreaCode:02d}.jpg`（英文地區路線圖）
  - `cht/route/Surge.png`（縣市警戒圖）
- KMZ 圖片命名：`TideSurge_{StationEngName}Color_cht.png`
- 範本讀取路徑：HTML/HTM 從 `settings.SSDVS_TEMPLATE_PATH`；KML 從
  `settings.KMZ_TEMPLATE_PATH/doc.kml`
- 變體流程：
  - `SentTyphoonPicturesNontableView` 只送測站時序圖（`HSU*.jpg`），不含 `Surge.png`，只送 CWA
  - 呼叫 `_build_ssdvs_dir` 時帶 `include_surge=False` 的情境，不複製縣市警戒圖，只傳 `ssdvs.zip`
    給 CWA targets（不產生 KMZ 與 CEOC picture zip）

## 4. 前端架構特殊規則（與 README.md 對照，避免遺漏）

- 分頁切換（UVP／潮位時序圖／燈號表格…）**不是** vue-router 路由，而是 `stores/use-app.js` 的
  `current_tab` 驅動 `main.vue` 條件渲染。新增分頁功能請走此模式，不要另建路由。
- API 唯一入口 `src/utils/api-request.js` 的 `apiRequest()`，回應統一用 `wrap_api_response()` 包裝。
- 權限相關欄位 `stids` / `function_list` 定義在 `src/config/setting.js`，異動需同步確認
  `userManage.vue` / `groupManage.vue` 顯示邏輯。

## 5. 待補充（隨導入落差蒐集持續更新）

- KMZ/ssdvs.zip 產出結果在前端如何呈現/下載（若前端有對應 UI，需補充串接細節）
- `red` 警戒等級的判定邏輯一旦後端啟用，需同步更新本檔案與前端燈號顯示規則
