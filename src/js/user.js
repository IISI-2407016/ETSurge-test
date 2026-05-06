import axios from "axios";
import { axiosConfig } from "../config/axiosConfig.js";
import { use_user_store } from "../stores/user.js";
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
// 取的單一帳號資訊
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

// 取得群組功能的可選項目清單
export const get_group_function_options = () => {
    return apiRequest("get", "/groups/options/");
}

// 登出
export async function user_logout_ajax() {
    const user_store = use_user_store();
    let send_data = {};

    return axios
        .post("/user_logout/", send_data, axiosConfig)
        .then((res) => {
            let data =
                typeof res.data === "object"
                    ? res.data
                    : JSON.parse(res.data);

            // @TODO: 登出成功後的動作
            if (data["status"] == "success") {
                user_store.logout();
                return { status: "success" };
            } else if (data["status"] == "failed") {
                console.log("登出失敗");
                return { status: "failed" };
            }
        })
        .catch(function(error) {
            console.error("API user_logout_ajax:::", error);
        });
}

export async function user_login_ajax(account, password) {
  const send_data = { account, password }

  try {
    const response = await axios.post("/user_login/", send_data, axiosConfig)
    const data = typeof response.data === "object" ? response.data : JSON.parse(response.data)

    if (data.status === "success") {
      if (data.data.status === "啟用") {
        return { status: "success", user: data.data }
      } else {
        return { status: "not_active", message: `帳號${data.data.status}` }
      }
    } else {
      return { status: "failed", message: "登入失敗" }
    }
  } catch (error) {
    console.error(error)
    return { status: "error", message: "系統錯誤" }
  }
}

export async function check_login_status_ajax() {
    const send_data = {}
    const response = await axios.post('/cls/', send_data, axiosConfig)

    const data = typeof response.data === 'object' ? response.data : JSON.parse(response.data)

    if (data.status === 'success') {
        return { success: true, user: data.data }
    } else {
        return { success: false }
    }
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
export async function change_password_ajax(forgot) {
    await this.$recaptchaLoaded();
    const token = await this.$recaptcha('login');
    // if (!token) return console.log('驗證錯誤');
    let send_data = {
        account: forgot.account,
        email: forgot.email,
        verify_code: forgot.verify_code,
        password: forgot.password,
        token
    };
    return axios
        .post("/change_password/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);

                if (data["status"] == "success") {
                    return {
                        status: data["status"],
                    };
                } else {
                    return {
                        status: data["status"],
                        failed_code: data["failed_code"],
                    };
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.log(error);
        });
}

export async function get_all_user_json() {
    const user_store = use_user_store()
  try {
    const response = await axios.post('/get_all_user/', {}, axiosConfig);
    let data = typeof response.data === 'object' ? response.data : JSON.parse(response.data);

    if (data.status === 'success') {
      const all_user = [];
      const all_user_maps = {};

      data.users.forEach(user => {
        if (!user.group_names || user.group_names.length <= 0) {
          user.group_names = '';
        } else {
          user.group_names = user.group_names[0];
        }

        all_user.push({
          account: user.account,
          name: user.name,
          work_unit: user.work_unit,
          email: user.email,
          group_names: user.group_names,
          level: user.level,
          status: user.status,
        });

        all_user_maps[user.account] = user;
      });

      // 這裡直接呼叫 Pinia store action
      user_store.set_users(all_user);
      user_store.set_users_map(all_user_maps);

      return { status: 'success' };
    } else {
      return {
        status: data.status,
        failed_code: data.failed_code,
      };
    }
  } catch (error) {
    console.error(error);
    return { status: 'error', message: error.message };
  }
}

export function get_all_group_json() {
    const user_store = use_user_store()
    let send_data = {};

    return axios
        .post("/get_all_group/", send_data, axiosConfig)
        .then(function (response) {
            let data = typeof response.data === "object"
                ? response.data
                : JSON.parse(response.data);
            if (data["status"] === "success") {
                if (!data["groups"]) data["groups"] = [];

                data["groups"].forEach((group) => {
                    if (group.stids[0] === "") group.stids = [];
                    if (group.function_list[0] === "") group.function_list = [];
                });

                user_store.set_groups(data["groups"]);
                } else {
                    console.log("取得錯誤:", data["failed_code"]);
                }
            })
            .catch(function (error) {
            console.log("Error:get_all_group_json API:::", error);
        });
}

export function update_user_info_ajax (send_data) {
    return axios
        .post("/update_user_info/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);

                if (data["status"] == "success") {
                    return {
                        status: data["status"],
                    };
                } else if (data["status"] == "failed") {
                    return {
                        status: data["status"],
                        failed_code: data["failed_code"],
                    };
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.warn('update_user api error:', error);
        });
}
export function change_user_status_ajax(account, user_status) {
    let send_data = {
        account: account,
        status: user_status,
    };
    return axios
        .post("/change_user_status/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);

                if (data["status"] == "success") {
                    return {
                        status: data["status"],
                    };
                } else if (data["status"] == "failed") {
                    return {
                        status: data["status"],
                        failed_code: data["failed_code"],
                    };
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.log(error);
        });
}
export function change_user_group_json(account, group_names) {
    let send_data = {
        account: account,
        group_names: JSON.stringify(group_names),
    };
    return axios
        .post("/change_user_group/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);
                if (data["status"] == "success") {
                    return {
                        status: data["status"],
                    };
                } else {
                    return {
                        status: data["status"],
                        failed_code: data["failed_code"],
                    };
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.log(error);
        });
}

export function add_group_json() {
    let send_data = {
        name: this.edit_group.name,
        stids: JSON.stringify(this.edit_group.stids),
        function_list: JSON.stringify(this.edit_group.function_list),
    };
    if (this.orign_name) {
        if(this.orign_name != this.edit_group.name) {
            
            send_data.name = this.orign_name;
            send_data.new_name = this.edit_group.name;
        }
    }
    return axios
        .post("/add_group/", send_data, axiosConfig)
        .then(
            function(response) {
                let data =
                    typeof response.data === "object"
                        ? response.data
                        : JSON.parse(response.data);
                if (data["status"] == "success") {
                    let newGroup = {
                        name: this.edit_group.name,
                        stids: this.edit_group.stids,
                        function_list: this.edit_group.function_list,
                    };
                    this.$emit("new_group_confirm", newGroup);
                } else {
                    console.log("失敗回傳訊息:", data["failed_code"]);
                    this.error_msg = "新增失敗";
                    setTimeout(() => {
                        this.error_msg = "";
                    }, 1500);
                }
            }.bind(this)
        )
        .catch(function(error) {
            console.log(error);
        });
}

export function set_have_groups(groups, group_names) {
    let have_stids_title = [];
    let have_function_list_title = [];
    let select_groups = [];
    let map = {};
    if (groups.length <= 0)
        return {
            have_stids_title: have_stids_title,
            have_function_list_title: have_function_list_title,
            select_groups: select_groups,
        };
    groups.forEach((group) => {
        map[group.name] = group;
        select_groups.push({ text: group.name });
    });

    if (group_names.length >= 0)
        group_names.forEach((group_name) => {
            map[group_name]["stids"].forEach((stid) => {
                if (have_stids_title.indexOf(stid) == -1) {
                    have_stids_title.push(stid);
                }
            });
            map[group_name].function_list.forEach((func) => {
                if (have_function_list_title.indexOf(func) == -1) {
                    have_function_list_title.push(func);
                }
            });
        });
    return {
        have_stids_title: have_stids_title,
        have_function_list_title: have_function_list_title,
        select_groups: select_groups,
    };
}
