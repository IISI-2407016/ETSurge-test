import { apiRequest } from "../utils/api-request.js";

export const post_auth_registration = (data) =>
  apiRequest("post", "/auth/registration/", data);

export const post_auth_login = (data) => apiRequest("post", "/auth/login/", data);