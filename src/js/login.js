import { apiRequest } from "../utils/api-request.js";

// 註冊
export const post_auth_registration = (data) =>
  apiRequest("post", "/auth/register/", data);

// 登入
export const post_auth_login = (data) => apiRequest("post", "/auth/login/", data);

// 忘記密碼
export const post_auth_password_reset = (data) => apiRequest("post", "/auth/password/reset/", data);

// 重設密碼
export const post_auth_password_reset_confirm = (data) => apiRequest("post", "/auth/password/reset/confirm/", data);

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
