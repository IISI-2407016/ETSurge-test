export const six_hour_table_header = [
    { title: '項目/時間', sortable: false, class: 'headCol_th' },
    { title: '排版用', sortable: false, class: 'hide_column' },
]

export const six_hour_table_item_data = {
    obs_water_level: {
        text: "觀測水位",
        color: "#0000ff",
    },
    surge_model_mod: {
        text: "暴潮模式+資料庫調和分析+修正",
        color: "#008000",
    },
    harmonic: {
        text: "資料庫調和分析",
        color: "#32eeed",
    },
    surge_model: {
        text: "模式暴潮+資料庫調和分析",
        color: "#BCBD6F",
    },
    fcst_surge_diff: {
        text:"預報暴潮偏差",
        color:"#c424c6",
    },
    getWarn: {
        text:"暴潮警戒",
        color:"#ff840b",
    },
    getAtte: {
        text:"大潮注意值",
        color:"#FCDA59",
    }
}

export const twelve_hour_chart = [
    { text: "觀測水位", color: "#0000FF" },
    { text: "預報水位", color: "#008000" },
    { text: "大潮注意值", color: "#FCDA59" },
    { text: "暴潮警戒", color: "#FF840B" },
]

export default { 
    six_hour_table_header, 
    six_hour_table_item_data,
    twelve_hour_chart
};