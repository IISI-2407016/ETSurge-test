import { apiRequest } from "../utils/api-request.js";

// 獲取縣市潮位警報資料
export const post_county_tide_warnings_ajax = (send_data) => 
    apiRequest("post", "/surge_app/get_county_tide_warnings/", send_data);