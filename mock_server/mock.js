import { createRequire } from "module";
import { reactive } from "vue";
const require = createRequire(import.meta.url);

let port = 10008;

let http = require('http')
let url = require('url')

let host = '127.0.0.1'

let cors = require('cors')
let express = require('express')

let app = express()
app.use(cors())

let session = require('express-session');

// small_chart_data 1226,1566,1206,1146,1786,1386
const small_chart_data_1226 = require('./small_chart/1226.json');
const small_chart_data_1566 = require('./small_chart/1566.json');
const small_chart_data_1206 = require('./small_chart/1206.json');
const small_chart_data_1146 = require('./small_chart/1146.json');
const small_chart_data_1786 = require('./small_chart/1786.json');
const small_chart_data_1386 = require('./small_chart/1386.json');
// no_fcst_data 1226,1566,1206,1146,1786,1386
const no_fcst_data_1226 = require('./no_fcst/1226.json');
const no_fcst_data_1566 = require('./no_fcst/1566.json');
const no_fcst_data_1206 = require('./no_fcst/1206.json');
const no_fcst_data_1146 = require('./no_fcst/1146.json');
const no_fcst_data_1786 = require('./no_fcst/1786.json');
const no_fcst_data_1386 = require('./no_fcst/1386.json');
// typhoon data
const typhoon_average_data = require('./typhoon_data/average_grid_data_by_filtered_typhoon_track_model_data.json');
const typhoon_track_data = require('./typhoon_data/model_data_by_track.json');
const typhoon_info_data = require('./typhoon_data/typhoon_info.json');
const typhoon_track_info_data = require('./typhoon_data/typhoon_track_info.json');


let bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

// 登入

// 【颱風】
// 取得颱風的基本資訊
app.get('/surge_app/get_typhoon_info/', function(req, res) {
    res.send(typhoon_info_data);
});

// 取得颱風的路徑資料
app.post('/surge_app/get_typhoon_track_info/', function(req, res) {
    res.send(typhoon_track_info_data);
});

// 颱風模式資料(預覽資料)
app.post('/surge_app/get_model_data_by_track/', function(req, res) {
    res.send(typhoon_track_data);
});

// 計算並產製模式平均網格資料
app.post('/surge_app/average_grid_data_by_filtered_typhoon_track_model_data/', function(req, res) {
    res.send(typhoon_average_data);
});


app.use('/public_auth_key/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        var auth_key = req.body.auth_key;
        req.session.is_public = auth_key; 
        res.send({"status": "success", "failed_code": ""});
    }
})  

app.get('/public/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    //res.render('index', {});
    res.send({"is_auth": true, "is_staff":false, 'name':'taoyuan', 'is_private':false});
    //res.sendFile('../index.html');
    
}) 


app.use('/logout/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({"status": "success"});
    }
})  

app.use('/login/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.username == 'ccc' && req.body.password == 'cccc') {
            res.send({"status": "success", "name":"ccc", "is_staff":true, "is_auth":true });
        } else {
            res.send({"status": "success", "is_staff":false, "is_auth":false });
        }
    }
})
app.use('/user_signup/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account != 'sunday') {
            res.send({
                "status": "success", 
                "data": "註冊成功",
            });
        } else {
            res.send({"status": "failed", "failed_code": "帳號重複"});
        }
    }
})
app.use('/user_logout/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
        });
    }
})

app.use('/user_login/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account == 'sunday' && req.body.password == '111') {
            res.send({
                "status": "success", 
                "data": {
                    "account": "sunday", 
                    "name": "Sunny", 
                    "group_names": ["海象中心"],
                    "level": "user",
                    "status": "啟用",
                    "work_unit": "weather",
                    "email": "email@email.com"
                },
            });
        } else if(req.body.account == 'admin' && req.body.password == 'admin') {
            res.send({
                "status": "success", 
                "data": {
                    "account": "admin", 
                    "name": "admin", 
                    "group_names": [],
                    "level": "admin",
                    "status": "啟用",
                    "work_unit": "weather",
                    "email": "email@email.com"
                },
            });
        }else {
            if(req.body.account != 'sunday') {
                res.send({"status": "failed", "failed_code": "無此帳號"});
                return;
            }
            if(req.body.password != '111') {
                res.send({"status": "failed", "failed_code": "密碼錯誤"});
                return;
            }
        }
    }
})
app.use('/cls/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
            // res.send({
            //     "status": "success", 
            //     "data": 
            //     {
            //         "account": "sunday", 
            //         "name": "Sunny", 
            //         "group_names": ["海象中心"],
            //         "level": "user",
            //         "status": "啟用",
            //     },
            // });
            res.send({
                "status": "success", 
                "data": 
                {
                    "account": "admin", 
                    "name": "admin", 
                    "group_names": ["海象中心"],
                    "level": "user",
                    "status": "啟用",
                    "work_unit": "weather",
                    "email": "email@email.com"
                },
            });
            // res.send({
            //     "status": "failed", 
            // });
    }
})
app.use('/update_user_info/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
            res.send({
                "status": "success", 
            });
            // res.send({"status": "failed", "failed_code": "驗證錯誤"});
    }
})
app.use('/forgot_password/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account == 'sunny' && req.body.email == 'sun@qqq.com' && req.body.verify_code == '1234') {
            res.send({
                "status": "success",
            });
        } else {
            res.send({"status": "failed", "failed_code": "驗證錯誤"});
        }
    }
})
app.use('/send_verify_code/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account == 'sunny' && req.body.email == 'sun@qqq.com') {
            res.send({
                "status": "success",
            });
        } else {
            res.send({"status": "failed", "failed_code": "資訊錯誤"});
        }
    }
})
app.use('/change_password/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account == 'sunny' && req.body.email == 'sun@qqq.com' && req.body.verify_code == '1234'  ) {
            res.send({
                "status": "success",
            });
        } else {
            res.send({"status": "failed", "failed_code": "資訊錯誤"});
        }
    }
})

app.use('/get_all_user/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
            "users": [
                {
                    "account": "admin", 
                    "name": "admin", 
                    "work_unit": "weather",
                    "email": "ad@qqq.com",
                    "group_names": [],
                    "level": "admin",
                    "status": "啟用",
                },
                {
                    "account": "sunday", 
                    "name": "Sunny", 
                    "work_unit": "weather",
                    "email": "sun@qqq.com",
                    "group_names": ["預報員"],
                    "level": "user",
                    "status": "啟用",
                },
                {
                    "account": "sunday1", 
                    "name": "Sunny1", 
                    "work_unit": "weather",
                    "email": "sun1@qqq.com",
                    "group_names": ["海象中心"],
                    "level": "user",
                    "status": "啟用",
                },
                {
                    "account": "sunday2", 
                    "name": "Sunny2", 
                    "work_unit": "weather",
                    "email": "sun2@qqq.com",
                    "group_names": ["預報員"],
                    "level": "user",
                    "status": "停用",
                },
                {
                    "account": "sunday3", 
                    "name": "Sunny3", 
                    "work_unit": "weather",
                    "email": "sun3@qqq.com",
                    "group_names": [],
                    "level": "user",
                    "status": "未審核",
                },
            ],
        });
    }
})
app.use('/get_all_group/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
            "groups":[
                {
                    "name": "海象中心",
                    "stids":[
                        "傳送官網設定",
                        "網站顯示測站設定",
                        "傳送報潮水位設定",
                        "帳號管理"
                    ],
                    "function_list": [
                        "傳送水位至資料課",
                        "傳送颱風期間圖檔(zip),傳送圖檔至CEOC,傳送KMZ至NCDR",
                        "傳送颱風期間,不含表格圖檔(zip)",
                        "傳送非颱風期間圖檔(zip)",
                    ],
                },
                {
                    "name": "測試空值",
                    "stids":[""
                    ],
                    "function_list": [""
                    ],
                },
            ],
        });
    }
})
app.use('/change_user_status/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account == 'sunday') {
            res.send({
                "status": "success",
            });
        } else {
            res.send({"status": "failed", "failed_code": "改變狀態錯誤"});
        }
    }
})
app.use('/change_user_group/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.account == 'sunday') {
            res.send({
                "status": "success",
            });
        } else {
            res.send({"status": "failed", "failed_code": "改變群組錯誤"});
        }
    }
})
app.use('/add_group/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        
        res.send({
            "status": "success",
        });
    }
})

app.use('/register/', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        if (req.body.user == 'ccc' && req.body.password == 'cccc') {
            res.send({"status": "failed", "failed_code": "username" });
        } else {
            res.send({"status": "success" });
        }
    }
}
)

//app authority end

// 共用
app.use('/load_station_data/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send(
            {"status": "success", "failed_code": "", "data": {"station_list": [{"stid": "1102", "stnac": "\u6de1\u6c34", "stnae": "Danshuei", "key": "W14", "order": 14, "sent_water_level_type": "surge_model_mod"}, {"stid": "1116", "stnac": "\u7af9\u570d", "stnae": "Dayuan", "key": "W15", "order": 15, "sent_water_level_type": "surge_model_mod"}, {"stid": "112", "stnac": "\u65b0\u7af9", "stnae": "Hsinchu", "key": "W16", "order": 16, "sent_water_level_type": "surge_model_mod"}, {"stid": "113", "stnac": "\u5916\u57d4", "stnae": "Waipu", "key": "W17", "order": 17, "sent_water_level_type": "surge_model_mod"}, {"stid": "1156", "stnac": "\u81fa\u897f", "stnae": "Taixi", "key": "W21", "order": 21, "sent_water_level_type": "surge_model_mod"}, {"stid": "1166", "stnac": "\u6771\u77f3", "stnae": "Dongshi", "key": "W22", "order": 22, "sent_water_level_type": "surge_model_mod"}, {"stid": "1176", "stnac": "\u5c07\u8ecd", "stnae": "Jiangjun", "key": "W23", "order": 23, "sent_water_level_type": "surge_model_mod"}, {"stid": "1186", "stnac": "\u6771\u6e2f", "stnae": "Donggang", "key": "W27", "order": 27, "sent_water_level_type": "surge_model_mod"}, {"stid": "1196", "stnac": "\u5f8c\u58c1\u6e56", "stnae": "SouthBay", "key": "W30", "order": 30, "sent_water_level_type": "surge_model_mod"}, {"stid": "1206", "stnac": "\u9e9f\u5c71\u9f3b", "stnae": "Shimen", "key": "W13", "order": 13, "sent_water_level_type": "surge_model_mod"}, {"stid": "1226", "stnac": "\u9f8d\u6d1e", "stnae": "Longdong", "key": "W1", "order": 1, "sent_water_level_type": "surge_model_mod"}, {"stid": "1236", "stnac": "\u70cf\u77f3", "stnae": "Toucheng", "key": "W4", "order": 4, "sent_water_level_type": "surge_model_mod"}, {"stid": "1246", "stnac": "\u8607\u6fb3", "stnae": "Suao", "key": "W5", "order": 5, "sent_water_level_type": "surge_model_mod"}, {"stid": "1256", "stnac": "\u82b1\u84ee", "stnae": "Hualien", "key": "W6", "order": 6, "sent_water_level_type": "surge_model_mod"}, {"stid": "1276", "stnac": "\u6210\u529f", "stnae": "Chengkung", "key": "W8", "order": 8, "sent_water_level_type": "surge_model_mod"}, {"stid": "1356", "stnac": "\u6f8e\u6e56", "stnae": "Penghu", "key": "W32", "order": 32, "sent_water_level_type": "surge_model_mod"}, {"stid": "1386", "stnac": "\u5c0f\u7409\u7403", "stnae": "XiaoLiuqiu", "key": "W31", "order": 31, "sent_water_level_type": "surge_model_mod"}, {"stid": "1396", "stnac": "\u862d\u5dbc", "stnae": "Lanyu", "key": "W12", "order": 12, "sent_water_level_type": "surge_model_mod"}, {"stid": "1436", "stnac": "\u81fa\u4e2d\u6e2f", "stnae": "Wuqi", "key": "W18", "order": 18, "sent_water_level_type": "surge_model_mod"}, {"stid": "1146", "stnac": "\u9e7f\u6e2f", "stnae": "LUGANG", "key": "W19", "order": 19, "sent_water_level_type": "surge_model_mod"}, {"stid": "1456", "stnac": "\u9ea5\u5bee", "stnae": "Mailiao", "key": "W20", "order": 20, "sent_water_level_type": "surge_model_mod"}, {"stid": "1473", "stnac": "\u5b89\u5e73", "stnae": "Anping", "key": "W24", "order": 24, "sent_water_level_type": "surge_model_mod"}, {"stid": "1486", "stnac": "\u9ad8\u96c4", "stnae": "Kaohsiung", "key": "W26", "order": 26, "sent_water_level_type": "surge_model_mod"}, {"stid": "1496", "stnac": "\u87f3\u5ee3\u5634", "stnae": "Xunguangzuei", "key": "W29", "order": 29, "sent_water_level_type": "surge_model_mod"}, {"stid": "1516", "stnac": "\u57fa\u9686", "stnae": "Keelung", "key": "W2", "order": 2, "sent_water_level_type": "surge_model_mod"}, {"stid": "1566", "stnac": "\u77f3\u68af", "stnae": "Shiti", "key": "W7", "order": 7, "sent_water_level_type": "surge_model_mod"}, {"stid": "1586", "stnac": "\u81fa\u6771", "stnae": "Taitung", "key": "W9", "order": 9, "sent_water_level_type": "surge_model_mod"}, {"stid": "1596", "stnac": "\u5927\u6b66", "stnae": "Dawu", "key": "W10", "order": 10, "sent_water_level_type": "surge_model_mod"}, {"stid": "1676", "stnac": "\u7da0\u5cf6", "stnae": "Ludao", "key": "W11", "order": 11, "sent_water_level_type": "surge_model_mod"}, {"stid": "1786", "stnac": "\u6c38\u5b89", "stnae": "Yongan", "key": "W25", "order": 25, "sent_water_level_type": "surge_model_mod"}, {"stid": "198", "stnac": "\u6771\u6c99\u5cf6", "stnae": "DongShaDao", "key": "W28", "order": 28, "sent_water_level_type": "surge_model_mod"}, {"stid": "1826", "stnac": "\u798f\u9686", "stnae": "Fulong", "key": "W3", "order": 3, "sent_water_level_type": "surge_model_mod"}, {"stid": "1926", "stnac": "\u99ac\u7956", "stnae": "Matsu", "key": "W34", "order": 34, "sent_water_level_type": "surge_model_mod"}, {"stid": "1956", "stnac": "\u6599\u7f85\u7063", "stnae": "Kinmen", "key": "W33", "order": 33, "sent_water_level_type": "surge_model_mod"}], "show_on_web": ["1102", "1116", "112", "113", "1156", "1166", "1176", "1186", "1196", "1206", "1226", "1236", "1246", "1256", "1276", "1356", "1386", "1396", "1436", "1146", "1456", "1473", "1486", "1496", "1516", "1566", "1586", "1596", "1676", "1786", "198", "1826", "1926", "1956"], "sent_to_web": ["1102", "1156", "1176", "1186", "1226", "1256", "1276", "1356"], "regional_station_list": [{"area_id": 2, "text": "\u57fa\u9686\u5730\u5340", "selected_station": "1226", "stations": [{"stid": "1226", "text": "\u9f8d\u6d1e"}, {"stid": "1516", "text": "\u57fa\u9686"}, {"stid": "1826", "text": "\u798f\u9686"}]}, {"area_id": 6, "text": "\u82b1\u84ee\u5730\u5340", "selected_station": "1256", "stations": [{"stid": "1256", "text": "\u82b1\u84ee"}, {"stid": "1566", "text": "\u77f3\u68af"}]}, {"area_id": 9, "text": "\u81fa\u6771\u5730\u5340", "selected_station": "1276", "stations": [{"stid": "1196", "text": "\u5f8c\u58c1\u6e56"}, {"stid": "1276", "text": "\u6210\u529f"}, {"stid": "1586", "text": "\u81fa\u6771"}, {"stid": "1596", "text": "\u5927\u6b66"}]}, {"area_id": 14, "text": "\u6de1\u6c34\u5730\u5340", "selected_station": "1102", "stations": [{"stid": "1102", "text": "\u6de1\u6c34"}, {"stid": "1206", "text": "\u9e9f\u5c71\u9f3b"}]}, {"area_id": 21, "text": "\u81fa\u897f\u5730\u5340", "selected_station": "1156", "stations": [{"stid": "1156", "text": "\u81fa\u897f"}, {"stid": "1456", "text": "\u9ea5\u5bee"}]}, {"area_id": 23, "text": "\u5c07\u8ecd\u5730\u5340", "selected_station": "1176", "stations": [{"stid": "1166", "text": "\u6771\u77f3"}, {"stid": "1176", "text": "\u5c07\u8ecd"}]}, {"area_id": 26, "text": "\u9ad8\u96c4\u5730\u5340", "selected_station": "1186", "stations": [{"stid": "1186", "text": "\u6771\u6e2f"}, {"stid": "1486", "text": "\u9ad8\u96c4"}]}, {"area_id": 32, "text": "\u6f8e\u6e56\u5730\u5340", "selected_station": "1356", "stations": [{"stid": "1356", "text": "\u6f8e\u6e56"}]}]}}
        );
    }
})

// stationSet.js
app.use('/update_official_station/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
            "failed_code": "",
        });
    }
})

app.use('/update_web_station/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
            "failed_code": "",
        });
    }
})

app.use('/update_model_station/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
            "failed_code": "",
        });
    }
})

// main.js
let all_data_count = [];
app.use('/load_all_data/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        const stations = req.body.stations;
        const small_chart_data_list = {
            1226: small_chart_data_1226,
            1566: small_chart_data_1566,
            1206: small_chart_data_1206,
            1146: small_chart_data_1146,
            1786: small_chart_data_1786,
            1386: small_chart_data_1386
        }
        const no_fcst_data_list = {
            1226: no_fcst_data_1226,
            1566: no_fcst_data_1566,
            1206: no_fcst_data_1206,
            1146: no_fcst_data_1146,
            1786: no_fcst_data_1786,
            1386: no_fcst_data_1386
        }
        const station = stations.split(',')[0];
        all_data_count.push(station);
        const reg = `/${station}{2}/gi`;
        let data = small_chart_data_list[station];

        // all_data_count = [];
        // data = no_fcst_data_list[station];

        setTimeout(() => {
            res.send(data);
        }, 5000)

    }
})

// menuFunction.js
app.use('/sent_water_level/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "failed",
            "failed_code": "傳送 官網 XXXXXXXX不成功\n傳送 官網 XXXXXXXX不成功\n",
        });
    }
})

app.use('/sent_non_typhoon_pictures/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success",
            "message": "成功傳送",
            "failed_code": "傳送失敗",
        });
    }
})

app.use('/sent_all_data/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method == 'POST') {
        res.send({
            "status": "success"
        });
    }
})

app.listen(port,(err) => {
    if (err) {
        return console.log('bad');
    }
})
