import axios from "axios";
import { axiosConfig } from "../config/axiosConfig.js";

// 創建 axios 實例
const apiClient = axios.create(axiosConfig);

// 請求 interceptor：自動加 Authorization header
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => Promise.reject(error))

// 回應 interceptor：若 401 則清除 token
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        }
        return Promise.reject(error)
    }
)

export async function apiRequest(method, url, data = null) {
    try {
        const options = {
            method,
            url
        };
        if (data) options.data = data;

        const res = await apiClient(options);
        const result = typeof res.data === "object" ? res.data : JSON.parse(res.data);

        return result;
    } catch (error) {
        console.error(`API Request Error [${method.toUpperCase()} ${url}] :::`, error.response);
        return {
            status: 'error',
            data: JSON.parse(error.response?.data || '{}'),
            message: error.message || '網路請求失敗',
            error: error
        };
    }
}

// 包裝 API 回傳結果
export function wrap_api_response(result, successMsg = '', failMsg = '') {
    if (result.status === 'success') {
        return { 
            success: 'success', 
            data: result.data, 
            message: successMsg || result.message
        };
    }
    return { 
        success: 'error', 
        data: null, 
        message: failMsg || result.message, error: result.data 
    };
}