"use strict";
export const ajaxTimeout = 300000;

// 正式機 https://61.56.11.143:8000/
// 測試機 https://61.56.11.143:5566/
// swagger https://61.56.11.143/swagger/

let temp_ajax_url = window.location.href.match('http(s?)://(.*?)/')[0];

// local
if  (window.location.href.includes("localhost")) {
    temp_ajax_url = "http://127.0.0.1:10008";
}

export const ajaxURL = temp_ajax_url;
