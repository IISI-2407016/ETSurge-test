import { apiRequest } from "../utils/api-request.js";

// 計算並取得各縣市12小時間隔的潮位警戒資料
export const post_county_tide_warnings_ajax = (send_data) => 
    apiRequest("post", "/surge_app/get_county_tide_warnings/", send_data);

// 直接讀取已儲存的縣市潮位警戒資料（不重新計算）
export const post_county_tide_warnings_result_ajax = (send_data) => 
    apiRequest("post", "/surge_app/get_county_tide_warnings_result/", send_data);