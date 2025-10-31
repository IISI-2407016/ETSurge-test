<template>
    <div>
        <div
            v-for="(item, num) in items[chart_type]"
            :key="num"
            class="float-left ml-4"
        >
            <span class="key-dot" :style="{ background: item.color }"></span>{{ item.text }}
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'

    const props = defineProps({
        chart_type: String
    });

    const items = ref({
        twelve_hour_chart: [
            { text: "觀測水位", color: "#0000FF" },
            { text: "預報水位", color: "#008000" },
            { text: "大潮注意值", color: "#FCDA59" },
            { text: "暴潮警戒", color: "#FF840B" },
        ],
        six_hour_chart: [
            { text: "觀測水位", color: "#0000FF" },
            { text: "暴潮模式+資料庫調和分析+修正", color: "#008000" },
            { text: "資料庫調和分析", color: "#32EEED" },
            { text: "模式暴潮+資料庫調和分析", color: "#BCBD6F" },
            { text: "預報暴潮偏差", color: "#C424C6" },
            { text: "暴潮警戒", color: "#FF840B" },
            { text: "大潮注意值", color: "#FCDA59" },
        ]
    })
</script>

<style scoped>
	.key-dot {
		display: inline-block;
		height: 10px;
		margin-right: .5em;
		width: 10px;
	}
</style>