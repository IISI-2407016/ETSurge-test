<template>
    <v-card class="small-chart" width="500">
        <v-col class="pb-0">
            {{ station_name }}
        </v-col>
        <v-col v-show="!is_loading" class="place-items-center">
            <item-legend chart_type="twelve_hour_chart" />
        </v-col>
        <div :id="div_name"></div>
        <div v-show="is_loading" class="loading-content">
            <v-icon>mdi-loading fa-spin</v-icon>
        </div>
    </v-card>
</template>

<script setup>
    import { ref, computed, watch, onMounted } from 'vue';
    import itemLegend from '../components/itemLegend.vue';
    import * as d3 from 'd3';
    
    // Props 定義
    const props = defineProps({
        model_time: {
            type: String,
            default: () => new Date().toISOString()
        },
        station_name: {
            type: String,
            default: ''
        },
        station_list: {
            type: Array,
            default: () => []
        },
        info: {
            type: Object,
            default: () => ({})
        },
        web_chart_data: {
            type: Object,
            default: () => ({})
        },
        is_loading: {
            type: Boolean,
            default: false
        },
        stop_draw: {
            type: Boolean,
            default: false
        }
    });

    // Emits 定義
    const emit = defineEmits(['update:is_loading', 'loading-completed']);
    // Reactive data
    const items_info = ref({
        obs_water_level: {
            id: 'obs_water_level',
            text: "觀測水位",
            color: "#0000ff",
            type: "dot"
        },
        fcst_water_level: {
            id: 'fcst_water_level',
            text: "預報水位",
            color: "#008000",
            type: "line"
        },
        getWarn: {
            id: "getWarn",
            text: "暴潮警戒",
            color: "#ff840b",
            type: "baseline",
            axis: "y"
        },
        getAtte: {
            id: "getAtte",
            text: "大潮注意值",
            color: "#FCDA59",
            type: "baseline",
            axis: "y"
        }
    });

    const div_name = ref("");
    const chart_info = ref({});
    const multi_graphic = ref([]);

    // Store 相關 (如果需要的話，可以改用 Pinia)
    const empty_fcst_water_level_alert_dialog_lock = ref(false);

    // Computed properties
    const is_loading_status = computed({
        get: () => props.is_loading,
        set: (value) => {
            emit('update:is_loading', value);
            if (!value) {
                emit('loading-completed', props.info.stid);
            }
        }
    });

    watch(() => props.stop_draw, (newVal) => {
        if (newVal) {
            is_loading_status.value = false;
        }
    });

    watch(() => props.web_chart_data, async () => {
        try {
            get_multi_graphic();
            init_chart();
            // 載入完成後設為 false
            is_loading_status.value = false;
        } catch (error) {
            console.error('Chart loading error:', error);
            is_loading_status.value = false;
        }
    });

    // Lifecycle hooks
    onMounted(() => {
        div_name.value = props.info.div_name;
        get_chart_info(props.info);
        init_chart();
    });
    // Methods
    const set_empty_fcst_water_level_alert_dialog_lock = (value) => {
        empty_fcst_water_level_alert_dialog_lock.value = value;
    };

    const set_empty_fcst_water_level_alert_dialog = (value) => {
        // 這裡可以添加對話框邏輯
        console.log('Set empty fcst water level alert dialog:', value);
    };

    const init_chart = () => {
        make_chart();
    };

    const make_chart = () => {
        let chartInfo = chart_info.value;
        let multiGraphic = multi_graphic.value;

        let div = document.getElementById(div_name.value);
        if (!div) return;
        
        div.innerHTML = "";
        let clientHeight = multiGraphic.length !== 0 ? 320 : 40; 
        let clientWidth = div.clientWidth;

        let margin = {top: 60, right: 40, bottom: 70, left: 65};
        let width = clientWidth - margin.left - margin.right;
        let height = clientHeight - margin.top - margin.bottom;

        let svg_base = d3.selectAll("#" + div_name.value).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        svg_base.append("rect")
            .attr("width", 500)
            .attr("height", clientHeight)
            .attr("fill", "white");

        let svg = svg_base.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //標題
        svg.append("text")
            .attr("x", 0 - (margin.left - 15))
            .attr("y", 0 - (margin.top / 2))
            .style("font-size", "1.17em")
            .attr("font-weight", "bold")
            .text(chartInfo['title']?.text || '');

        if (!(multiGraphic.length !== 0)) return;

        // set the ranges
        let xLine = d3.scaleTime().range([0, width]);
        let yLine = d3.scaleLinear().range([height, 0]);

        // Scale the range of the data
        xLine.domain(get_x_domain(props.model_time));
        yLine.domain([-3.5, 3.5]).nice();

        draw_baseline("x", new Date(props.model_time), "#000");
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", xLine(new Date(props.model_time)) - 14)
            .attr("x", 0 - height)
            .attr("dy", "1em")
            .attr("font-size", "12")
            .text("MODEL");

        let date_line_data = get_date_line_data(get_x_domain(props.model_time));
        date_line_data.forEach(day_data => {
            draw_baseline("x", new Date(day_data), "#ccc");
        });

        multiGraphic.forEach(function(d, i) {
            switch(d.type) {
                case "baseline":
                    draw_baseline(d.axis, d.data, d.color);
                    break;
                case "line":
                    draw_line(d.data, d.color, d.id);
                    break;
                case "dot":
                    draw_dot(d.data, d.color, d.id);
                    break;
                default:
            }
        });

        let x_tickValues = get_x_tickvalues(props.model_time);
        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xLine).tickValues(x_tickValues).tickFormat(d3.timeFormat("%H:%M")))
            .selectAll("text")
            .attr("font-size", "12")
            .attr("dy", "1.8em")
            .style("text-anchor", "middle");

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xLine).tickValues(x_tickValues).tickFormat(d3.timeFormat("%m/%d")))
            .selectAll("text")
            .attr("font-size", "12")
            .style("text-anchor", "middle");

        svg.append("text")
            .attr("transform", "translate(0," + height + ")")
            .attr("x", width / 2 )
            .attr("font-size", "14")
            .attr("dy", "3.6em")
            .style("text-anchor", "middle")
            .text(chartInfo['xLabel']?.text || '');

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(yLine))
            .attr("font-size", "14");

        // Add the Y Axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left*0.9)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .attr("font-size", "14")
            .style("text-anchor", "middle")
            .text(chartInfo['yLabel']?.text || '');

        //functions
        function draw_baseline(axis_type, value, color, label){
            if(axis_type === "x"){
                svg.append('line')
                    .attr('x1',  xLine(value))
                    .attr('y1', 0)
                    .attr('x2',  xLine(value))
                    .attr('y2', height)
                    .attr('stroke-width', '1')
                    .attr('stroke', color);
            }else {
                svg.append('line')
                    .attr('x1', 0)
                    .attr('y1', yLine(value))
                    .attr('x2', width)
                    .attr('y2', yLine(value))
                    .attr('stroke-width', '1.5')
                    .attr('stroke', color);
            }
        }

        function draw_line(line_data, color, id){
            let valueline = d3.line()
                .curve(d3.curveBasis)
                .x((d) => xLine(new Date(d.time)))
                .y((d) => yLine(d.val));

            let g = svg.selectAll(".line" + id)
                .data([line_data])
                .enter().append("g")
                .attr("class", "line")
                .attr('fill', "none");

            g.append("path")
                .attr("d", valueline)
                .style("stroke", color);
        }

        function draw_dot(line_data, color, id){
            svg.selectAll("line-circle")
            .data(line_data)
            .enter().append("circle")
            .attr('class', "line-circle")
            .attr('r', 1.5)
            .attr('transform', function(d){
                return 'translate(' + xLine(new Date(d.time)) +',' + yLine(d.val) + ')';
            })
            .attr('fill', color);
        }
    };

    const get_x_domain = (model_time) => {
        Date.prototype.addHours = function(h){
            this.setHours(this.getHours() + h);
            return this;
        }

        let start_time = new Date(model_time).addHours(-12);
        let end_time = new Date(model_time).addHours(72);

        return [start_time, end_time];
    };

    const get_date_line_data = (time_interval) => {
        let days = [];
        for(let i = 0; i < 4; i++){
            let start_day = new Date(time_interval[0]);
            start_day.setDate(start_day.getDate() + i);
            start_day.setHours(0,0,0,0);

            let day_data = start_day;
            if((day_data >= time_interval[0]) && (day_data <= time_interval[1])){
                days.push(day_data);
            }
        }

        return days;
    };

    const get_x_tickvalues = (model_time) => {
        Date.prototype.addHours = function(h){
            this.setHours(this.getHours() + h);
            return this;
        }

        //過去12小時，未來72小時
        let tickvalues = [];
        for(let i = -1; i <= 6; i++){
            let tickvalue = new Date(model_time).addHours( i * 12 );
            tickvalues.push(tickvalue);
        }

        return tickvalues;
    };

    const get_multi_graphic = () => {
        if (!props.web_chart_data) {
            multi_graphic.value = [];
            return;
        }
        
        let multiGraphicData = [];
        let itemsInfo = items_info.value;

        for(let item in itemsInfo){
            if (item in props.web_chart_data){
                let item_data = {};
                item_data = Object.assign({}, itemsInfo[item]);
                item_data['data'] = props.web_chart_data[item];
                multiGraphicData.push(item_data);
            }
            if (
                item === 'fcst_water_level' && 
                !empty_fcst_water_level_alert_dialog_lock.value && 
                !props.web_chart_data[item]?.length
            ) {
                // @TODO 顯示預報水位資料為空的對話框
                set_empty_fcst_water_level_alert_dialog_lock(true);
                set_empty_fcst_water_level_alert_dialog(true);
            }
        }

        multi_graphic.value = multiGraphicData;
    };

    const get_chart_info = (info) => {
        let lan = info.lan;
        let chartInfoData = {
            "stid": info.stid,
            "title": { 
                "text": get_station_text(info.stid, lan)
            },
            "xLabel": {
                "text": lan === "e" ? "time" : "時間"
            },
            "yLabel": {
                "text": lan === "e" ? "WaterLevel(meter)" : "潮高(公尺)"
            }
        };

        chart_info.value = chartInfoData;
    };

    const get_station_text = (stid, language_selected) => {
        let lan = {'c': 'stnac', 'e': 'stnae'};
        let station_list = props.station_list;
        let text = "";
        
        station_list.forEach((e) => {
            if (e.stid === stid) {
                text = e[lan[language_selected]];
            }
        });

        return text;
    };
</script>

<style scoped>
    .loading-content {
        padding: 30px 0;
        background: #fff;
        text-align: center;
    }
    .loading-content i {
        font-size: 3rem;
    }
</style>