"use strict";
export const ajaxTimeout = 300000;

// 正式機 https://61.56.11.143:8000/
// 測試機 https://61.56.11.143/app/
// swagger https://61.56.11.143/swagger/

let temp_ajax_url = window.location.href.match('http(s?)://(.*?)/')[0];

// local
if  (window.location.href.includes("localhost")) {
    temp_ajax_url = "http://localhost:10008";
}

export const ajaxURL = temp_ajax_url;
