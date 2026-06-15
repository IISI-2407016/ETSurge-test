import { apiRequest } from "../utils/api-request.js";

// [設定] 颱風名稱設定
export const get_typhoon_name_data_ajax = () => 
    apiRequest("get", "/surge_app/get_typhoon_info/");

// [設定] 颱風路徑資料
export const post_typhoon_track_data_ajax = (send_data) => 
    apiRequest("post", "/surge_app/get_typhoon_track_info/", send_data);

// [UVP設定] 從 Tafis API 取得颱風預報路徑參數(快速查詢)
export const post_typhoon_filter_parameters_from_tafis_ajax = (send_data) =>
    apiRequest("post", "/surge_app/get_filter_parameters_from_tafis/", send_data);

// 預覽查詢
export const post_uvp_preview_ajax = (send_data) =>
    apiRequest("post", "/surge_app/get_model_data_by_track/", send_data);

// 計算系集平均
export const post_uvp_average_ajax = (send_data) =>
    apiRequest("post", "/surge_app/get_average_grid_data_by_filtered_typhoon_track_model_data/", send_data);