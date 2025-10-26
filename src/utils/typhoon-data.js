import { apiRequest } from "./api-request.js";

// [設定] 颱風名稱設定
export const get_typhoon_name_data_ajax = () => 
    apiRequest("get", "/surge_app/get_typhoon_info/");

// [設定] 颱風路徑資料
export const post_typhoon_track_data_ajax = (send_data) => 
    apiRequest("post", "/surge_app/get_typhoon_track_info/", send_data);


// 預覽查詢
export const post_uvp_preview_ajax = (send_data) =>
    apiRequest("post", "/surge_app/get_model_data_by_track/", send_data);

// 計算系集平均
export const post_uvp_average_ajax = (send_data) =>
    apiRequest("post", "/surge_app/average_grid_data_by_filtered_typhoon_track_model_data/", send_data);