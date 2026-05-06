export const stids = [
    {
        key: "official_station",
        title: "傳送官網設定",
    },
    {
        key: "web_station",
        title: "網站顯示測站設定",
    },
    {
        key: "model_station",
        title: "傳送報潮水位設定",
    },
    {
        key: "user_manage",
        title: "帳號管理",
    },
    {
        key: "group_manage",
        title: "群組管理",
    },
]

export const function_list = [
    {
        key: "sent_water_level",
        title: "傳送水位",
    },
    {
        key: "sent_all_data",
        title: "傳送颱風期間圖檔"
    },
    {
        key: "sent_typhoon_pictures_nontable",
        title: "傳送颱風期間圖檔(不包含表格)"
    },
    {
        key: "sent_typhoon_period_chart",
        title: "傳送非颱風期間圖檔"
    }
]

export const password_rules = [
    v => !!v || '請輸入8~16個字元，需包含數字和英文字母及符號',
    v =>
        /^((?=.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*|(?=.{8,}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!"#$%&'()*+,./:;<=>?@[\\]^_`{|}~-])).*$/.test(v) 
        || 
        '密碼需包含英文大寫、英文小寫、數字和特殊字元其中三種',
    v => v.length >= 8 || '請輸入8~16個字元，需包含數字和英文字母及符號'
]

export const reset_password_rules = [
    v => !v || v.length >= 8 || '密碼至少 8 碼',
    v => !v || 
        /^((?=.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*|(?=.{8,}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!"#$%&'()*+,./:;<=>?@[\\]^_`{|}~-])).*$/.test(v)
        || 
        '密碼需包含英文大寫、英文小寫、數字和特殊字元其中三種'
]