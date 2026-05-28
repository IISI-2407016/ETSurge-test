import axios from "axios";
import { axiosConfig } from "../config/axiosConfig.js";
import { apiRequest } from "../utils/api-request.js";

// 更新使用者資料
export const post_auth_update_user = (id, data) => {
  return apiRequest("patch", `/users/${id}/`, data);
}

// 變更使用者密碼
export const post_auth_change_password = (data) => {
  return apiRequest("post", "/auth/password/change/", data);
}

//【帳號管理】
// 取得所有帳號
export const get_user_info = () => {
    return apiRequest("get", "/users/");
}

// 取得帳號資訊
export const get_user_me_info = () => {
    return apiRequest("get", "/users/me/");
}

// 取得單一帳號資訊
export const get_user_id_info = (id) => {
    return apiRequest("get", `/users/${id}/`);
}

// 指定用戶加入群組
export const post_user_join_group = (id, group_id) => {
  return apiRequest("post", `/users/${id}/groups/`, group_id );
}

// 指定用戶離開群組
export const delete_user_leave_group = (id, group_id) => {
  return apiRequest("delete", `/users/${id}/groups/`, group_id );
}

//【群組管理】
// 取得所有群組
export const get_group_info = () => {
    return apiRequest("get", "/groups/");
}

// 取得指定用戶的群組資訊
export const get_user_groups = (user_id) => {
    return apiRequest("get", `/users/${user_id}/groups/`);
}

// 取得群組功能的可選項目清單
export const get_group_function_options = () => {
    return apiRequest("get", "/groups/options/");
}

// 新增群組
export const post_groups_create = (data) => {
    return apiRequest("post", "/groups/", data);
}

// 編輯、刪除群組
export const patch_groups_update = (id, data) => {
    return apiRequest("patch", `/groups/${id}/`, data);
}



export function forgot_password_ajax() {
    let send_data = {
        account: this.forgot.account,
        email: this.forgot.email,
        verify_code: this.forgot.verify_code,
    };
    return axios
        .post("/forgot_password/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);

                if (data["status"] == "success") {
                    this.$store.commit("SHOW_CHANGE_PASSWORD_DIALOG");
                    let forgot = {
                        account: this.forgot.account,
                        email: this.forgot.email,
                        verify_code: this.forgot.verify_code,
                    };
                    this.$store.commit("SET_FORGOT", forgot);
                    this.forgot_password_dialog = false;
                    this.$refs.forgot_password_form.reset();
                    this.$refs.verify_code_form.reset();
                    this.$store.commit("CURRENT_PAGE", "ChangePassword");
                } else {
                    this.verify_lock_message = "驗證碼錯誤";
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.log(error);
        });
}
// 忘記密碼重新申請
export function send_verify_code_ajax() {
    let send_data = {
        account: this.forgot.account,
        email: this.forgot.email,
    };
    return axios
        .post("/send_verify_code/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);

                if (data["status"] == "success") {
                    this.verify_lock_message =
                        "( 請至信箱領取驗證信，<br>驗證碼 5分鐘後失效! )";
                    this.send_verify_lock = true;
                    setTimeout(() => {
                        this.verify_lock_message = "";
                        this.send_verify_lock = false;
                    }, 50000);
                } else {
                    this.verify_lock_message = "帳號和信箱錯誤";
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.log(error);
        });
}
