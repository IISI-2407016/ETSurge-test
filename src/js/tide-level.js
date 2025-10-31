import { apiRequest } from "../utils/api-request.js";

// 取得颱風篩選參數資料
export const get_typhoon_filter_parameters_ajax = () => 
    apiRequest("get", "/surge_app/get_typhoon_filter_parameters/");