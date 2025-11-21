import { apiRequest } from "../utils/api-request.js";

// 註冊
export const post_auth_registration = (data) =>
  apiRequest("post", "/auth/registration/", data);

// 登入
export const post_auth_login = (data) => apiRequest("post", "/auth/login/", data);

// 檢查登入 (驗證 access token)
export const post_check_login = () => {
  return apiRequest("post", "/auth/token/verify/")
}

// token 刷新
export const post_auth_token_refresh = () => {
  return apiRequest("post", "/auth/token/refresh/");
}

// 登出
export const post_auth_logout = () => {
  return apiRequest("post", "/auth/logout/");
}
