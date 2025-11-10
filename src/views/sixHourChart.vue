<template>
    <div>
        <v-col v-show="!is_loading" class="place-items-center">
            <item-legend chart_type="six_hour_chart" />
        </v-col>
        <div :id="chartId" class="six-hour-chart"></div>
        <div v-show="is_loading" class="loading-content">
            <v-icon>mdi-loading fa-spin</v-icon>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
    import itemLegend from '../components/itemLegend.vue';
    import * as d3 from 'd3';
    
    // Props 定義
    const props = defineProps({
        big_info: {
            type: Object,
            default: () => ({})
        },
        big_chart_data: {
            type: Object,
            default: () => ({})
        },
        stop_draw: {
            type: Boolean,
            default: false
        },
        is_loading: {
            type: Boolean,
            default: false
        }
    });

    // Emits 定義
    const emit = defineEmits(['update:is_loading', 'loading-completed']);

    // 生成唯一的圖表 ID
    const chartId = ref(`six-hour-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    // Reactive data
    const items_info = ref({
        obs_water_level: {
            id: "obs_water_level",
            text: "觀測水位",
            color: "#0000ff",
            type: "dot",
            data: "",
        },
        surge_model_mod: {
            id: "surge_model_mod",
            text: "暴潮模式+資料庫調和分析+修正",
            color: "#008000",
            type: "line",
            data: "",
        },
        harmonic: {
            id: "harmonic",
            text: "資料庫調和分析",
            color: "#32eeed",
            type: "line",
            data: "",
        },
        surge_model: {
            id: "surge_model",
            text: "模式暴潮+資料庫調和分析",
            color: "#BCBD6F",
            type: "line",
            data: "",
        },
        fcst_surge_diff: {
            id: "fcst_surge_diff",
            text: "預報暴潮偏差",
            color: "#c424c6",
            type: "line",
            data: "",
        },
        getWarn: {
            id: "getWarn",
            text: "暴潮警戒",
            color: "#ff840b",
            type: "baseline",
            data: "",
            axis: "y",
        },
        getAtte: {
            id: "getAtte",
            text: "大潮注意值",
            color: "#FCDA59",
            type: "baseline",
            data: "",
            axis: "y",
        },
    });

    const mouse_line_date = ref("");
    const All_chart = ref(null);
    const xaxis = ref(null);
    const height = ref(0);
    const multi_graphic = ref([]);

    // Computed properties
    const is_loading_status = computed({
        get: () => props.is_loading,
        set: (value) => {
            emit('update:is_loading', value);
            if (!value) {
                emit('loading-completed', props.big_info.stid);
            }
        }
    });

    // Watchers
    watch(() => props.big_chart_data, () => {
        const chartElement = document.getElementById(chartId.value);
        if (chartElement) {
            chartElement.innerHTML = "";
            makeBigChart();
        }
    }, { deep: true });

    watch(() => props.stop_draw, (newVal) => {
        if (newVal) {
            is_loading_status.value = false;
        }
    });

    watch(() => mouse_line_date.value, () => {
        get_data_rect();
    });

    // Lifecycle hooks
    onMounted(() => {
        if (props.big_chart_data && Object.keys(props.big_chart_data).length > 0) {
            makeBigChart();
        }
    });

    onUnmounted(() => {
        // 清理事件監聽器
        d3.select("body").on('keydown', null);
    });

    // Methods
    const makeBigChart = () => {
        try {
            const model_time = props.big_info.model_time;
            const multi_graphic_data = get_bigchart_multi_graphic();
            const clientHeight = 350;
            const clientWidth = 900;

            const margin = {top: 20, right: 40, bottom: 50, left: 40};
            const width = clientWidth - margin.left - margin.right;
            const chart_height = clientHeight - margin.top - margin.bottom;

            multi_graphic.value = multi_graphic_data;
            height.value = chart_height;

            const svg = d3.select(`#${chartId.value}`).append("svg")
                .attr("width", clientWidth)
                .attr("height", clientHeight)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const x = d3.scaleTime().range([0, width]);
            const x2 = d3.scaleTime().range([0, width]);
            const y = d3.scaleLinear().range([chart_height, 0]);

            const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d"));
            const yAxis = d3.axisLeft(y);

            const zoom = d3.zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([[0, 0], [width, chart_height]])
                .extent([[0, 0], [width, chart_height]])
                .on("zoom", zoomed);

            const line = d3.line()
                .x((d) => x(new Date(d.time)))
                .y((d) => y(d.val));

            const clip = svg.append("defs").append("svg:clipPath")
                .attr("id", `clip-${chartId.value}`)
                .append("svg:rect")
                .attr("width", width)
                .attr("height", chart_height)
                .attr("x", 0)
                .attr("y", 0);

            const all_chart = svg.append("g")
                .attr("class", "focus")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("clip-path", `url(#clip-${chartId.value})`);

            All_chart.value = all_chart;

            const focus = svg.append("g")
                .attr("class", "focus")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain(get_x_domain(model_time));
            x2.domain(x.domain());
            y.domain(get_y_domain(multi_graphic_data)).nice();

            xaxis.value = x;

            focus.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + chart_height + ")")
                .call(xAxis);

            focus.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

            const date_line_data = get_date_line_data(get_x_domain(model_time));
            draw_all();
            get_xaxis_text();

            svg.append("rect")
                .attr("class", "zoom")
                .attr("width", width)
                .attr("height", chart_height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .on('mouseout', function(event) {
                    d3.select(".mouse-line").remove();
                    d3.selectAll(".hover_text").remove();
                    d3.selectAll(".hover_rect").remove();
                })
                .on('mouseover', function(event) {
                    d3.select(".mouse-line").remove();
                    d3.selectAll(".hover_text").remove();
                    d3.selectAll(".hover_rect").remove();

                    all_chart.append("path")
                        .attr("class", "mouse-line")
                        .style("stroke", "black")
                        .style("stroke-width", "1px");
                })
                .on('mousemove', function(event) {
                    d3.selectAll('.hover_text').remove();
                    d3.selectAll(".hover_rect").remove();

                    const mouse = d3.pointer(event);
                    d3.select(".mouse-line")
                        .attr("d", () => {
                            const d = "M" + mouse[0] + "," + chart_height;
                            return d + " " + mouse[0] + "," + 0;
                        });

                    mouse_line_date.value = get_point_date(x);
                    move_model_line(x, mouse_line_date.value, chart_height);
                })
                .call(zoom);

            d3.select("body")
                .on('keydown', function(event) {
                    const buttons = ["ArrowRight", "ArrowLeft"];
                    const button = event.key;
                    if (buttons.indexOf(button) !== -1) {
                        const keydown_date = get_point_date(x, button);
                        move_model_line(x, keydown_date, chart_height);
                    }
                });

            function zoomed(event) {
                d3.selectAll(".hover_text").remove();
                d3.selectAll(".hover_rect").remove();
                // if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
                // const t = d3.event.transform;
                if (event.sourceEvent && event.sourceEvent.type === "brush") return;
                var t = event.transform;
                
                x.domain(t.rescaleX(x2).domain());
                all_chart.selectAll(".line").attr("d", line);
                focus.select(".axis--x").call(xAxis);
                d3.selectAll('.xbaseline').remove();
                d3.selectAll('.model_text').remove();
                d3.selectAll('.big-line-circle').remove();
                d3.selectAll('.xaxis_text').remove();
                draw_all();
                get_xaxis_text();
            }

            function draw_all() {
                date_line_data.forEach(day_data => {
                    draw_baseline("x", new Date(day_data), "#ccc");
                });

                const modeltime = d3.timeFormat("%m/%d %H:%M");
                draw_baseline("x", new Date(model_time), "#000");
                all_chart.append("text")
                    .attr("class", "model_text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", x(new Date(model_time)) - 14)
                    .attr("x", 0 - chart_height)
                    .attr("dy", "1em")
                    .attr("font-size", "12")
                    .text("MODEL(" + modeltime(new Date(model_time)) + ")");

                multi_graphic_data.forEach((d) => {
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
                            break;
                    }
                });
            }

            function draw_baseline(axis_type, value, color) {
                if (axis_type === "x") {
                    all_chart.append('line')
                        .attr("class", "xbaseline")
                        .attr('x1', x(value))
                        .attr('y1', 0)
                        .attr('x2', x(value))
                        .attr('y2', chart_height)
                        .attr('stroke-width', '1')
                        .attr('stroke', color);
                } else {
                    all_chart.append('line')
                        .attr('x1', 0)
                        .attr('y1', y(value))
                        .attr('x2', width)
                        .attr('y2', y(value))
                        .attr('stroke-width', '1.5')
                        .attr('stroke', color);
                }
            }

            function draw_line(line_data, color) {
                all_chart.append("path")
                    .datum(line_data)
                    .attr("class", "line")
                    .attr('fill', "none")
                    .attr("d", line)
                    .attr('stroke-width', '1')
                    .style("stroke", color);
            }

            function draw_dot(line_data, color) {
                all_chart.selectAll("big-line-circle")
                    .data(line_data)
                    .enter().append("circle")
                    .attr('class', "big-line-circle")
                    .attr('r', 2)
                    .attr('transform', (d) => {
                        return 'translate(' + x(new Date(d.time)) + ',' + y(d.val) + ')';
                    })
                    .attr('fill', color);
            }

            function get_xaxis_text() {
                svg.append("g")
                    .attr("class", "xaxis_text")
                    .attr("transform", "translate(" + margin.left + "," + (chart_height + margin.top) + ")")
                    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M")))
                    .selectAll("text")
                    .attr("font-size", "10")
                    .attr("dy", "1.8em");
            }

            // 載入完成後設為 false
            is_loading_status.value = false;

        } catch (error) {
            console.error('Chart loading error:', error);
            is_loading_status.value = false;
        }
    };

    const get_bigchart_multi_graphic = () => {
        const multi_graphic_data = [];
        const item_info = items_info.value;
        const data = props.big_chart_data;

        if (!data) return multi_graphic_data;
        
        for (const item in item_info) {
            if (item in data) {
                const item_copy = { ...item_info[item] };
                item_copy.data = data[item];
                multi_graphic_data.push(item_copy);
            }
        }

        return multi_graphic_data;
    };

    const get_x_domain = (model_time) => {
        Date.prototype.addHours = function(h) {
            this.setHours(this.getHours() + h);
            return this;
        };

        const start_time = new Date(model_time).addHours(-6);
        const end_time = new Date(model_time).addHours(72);

        return [start_time, end_time];
    };

    const get_y_domain = () => {
        return [-3.5, 3.5];
    };

    const get_date_line_data = (time_interval) => {
        const days = [];
        for (let i = 0; i < 4; i++) {
            const start_day = new Date(time_interval[0]);
            start_day.setDate(start_day.getDate() + i);
            start_day.setHours(0, 0, 0, 0);

            const day_data = start_day;
            if ((day_data >= time_interval[0]) && (day_data <= time_interval[1])) {
                days.push(day_data);
            }
        }

        return days;
    };

    const move_model_line = (x, date, chart_height) => {
        d3.selectAll('.hover_text').remove();
        d3.selectAll(".hover_rect").remove();

        d3.select(".mouse-line")
            .attr("d", () => {
                const d = "M" + x(new Date(date)) + "," + chart_height;
                return d + " " + x(new Date(date)) + "," + 0;
            });

        mouse_line_date.value = new Date(date);
    };

    const get_point_date = (x, button) => {
        const mouse_date = get_mouse_line_date(x);
        const minute = mouse_date.getMinutes();
        const difference = minute % 6;
        let point_date = mouse_date.setSeconds(0, 0, 0, 0);
        
        Date.prototype.addMinutes = function(m) {
            this.setMinutes(this.getMinutes() + m);
            return this;
        };

        switch(button) {
            case "ArrowRight":
                point_date = mouse_date.addMinutes(6 - difference);
                break;
            case "ArrowLeft":
                const diff = difference === 0 ? 6 : difference;
                point_date = mouse_date.addMinutes(-diff);
                break;
            default:
                const adjust = difference > 3 ? difference - 6 : -difference;
                point_date = mouse_date.addMinutes(adjust);
        }

        return point_date;
    };

    const get_mouse_line_date = (x) => {
        const d_split = d3.select(".mouse-line").attr("d").split(",");
        const date = x.invert(d_split[0].slice(1));
        return date;
    };

    const get_data_rect = () => {
        const chart_height = height.value;
        const x = xaxis.value;
        const date = mouse_line_date.value;
        const all_chart = All_chart.value;
        const multi_graphic_data = multi_graphic.value;
        const item_info = items_info.value;

        if (!all_chart || !x || !date) return;

        const x_width = x(date);
        const difference = x_width > 680 ? 150 : 0;

        get_rect();
        get_time_text();
        let item_count = 0;
        for (const item in item_info) {
            const item_data = item_info[item];
            get_item_rect(date, item_count, item_data, difference);
            get_item_text(date, item_count, item_data, difference);
            item_count++;
        }

        multi_graphic_data.forEach(e => {
            if ((e.id === "getWarn") || (e.id === "getAtte")) {
                d3.select(".hover_" + e.id).text(e.data);
                return;
            }

            const xMin = date.getMinutes();
            if ((xMin % 6) === 0) {
                const val = get_hover_val(date, e.data);
                if (val) {
                    d3.select(".hover_" + e.id).text(val);
                }
            }
        });

        function get_rect() {
            all_chart.append("rect")
                .attr("class", "hover_rect")
                .attr("x", x(date) + 20 - difference)
                .attr("y", chart_height / 4)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 120)
                .attr("height", 150)
                .style("stroke-width", 2)
                .style("fill", "#FFF")
                .style('stroke', "#666");
        }

        function get_time_text() {
            const xMin = date.getMinutes();
            const parseDate = d3.timeFormat("%Y-%m-%d %H:%M");
            if ((xMin % 6) === 0) {
                const time_text = parseDate(date);
                all_chart.append("text")
                    .attr("class", "hover_text")
                    .attr("x", x(date) + 20 - difference)
                    .attr("y", chart_height / 4 - 10)
                    .attr("font-size", "16")
                    .style('fill', "#000")
                    .text(time_text);
            }
        }

        function get_item_rect(date, item_count, item_data, difference) {
            all_chart.append("rect")
                .attr("class", "hover_rect")
                .attr("x", x(date) + 30 - difference)
                .attr("y", chart_height / 4 + 12 + item_count * 20)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", item_data.color);
        }

        function get_item_text(date, item_count, item_data, difference) {
            all_chart.append("text")
                .attr("class", "hover_text hover_" + item_data.id)
                .attr("x", x(date) + 50 - difference)
                .attr("y", chart_height / 4 + 22 + item_count * 20)
                .attr("font-size", "14")
                .style('fill', "#000")
                .text("null");
        }

        function get_hover_val(date, data) {
            let val = "";
            date.setSeconds(0, 0, 0, 0);
            data.forEach(e => {
                const time = new Date(e.time);
                if (time.getTime() === date.getTime()) {
                    val = e.val;
                }
            });
            return val;
        }
    };
</script>

<style scoped>
    .six-hour-chart {
        position: relative;
    }

    .loading-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.9);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        z-index: 10;
    }

    .loading-content i {
        font-size: 2rem;
        color: #1976d2;
    }
</style>

<style>
    .line {
        fill: none;
        stroke: steelblue;
        stroke-width: 1.5px;
    }
    .zoom {
        cursor: move;
        fill: none;
        pointer-events: all;
    }
</style>
