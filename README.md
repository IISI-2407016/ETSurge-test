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