<template>
    <div class="chart-display">
        <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>
    <ResultTable
        :predictionData="props.predictionData"
        :headerData="generateTimeSlots()"
    />
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import ResultTable from "./ResultTable.vue";

const props = defineProps({
    predictionData: Array,
    date: String,
});

const chartEl = ref(null);
let chartInstance = null;

const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 96; i++) {
        const hours = Math.floor((i * 15) / 60)
            .toString()
            .padStart(2, "0");
        const minutes = ((i * 15) % 60).toString().padStart(2, "0");
        slots.push(`${hours}:${minutes}`);
    }
    return slots;
};

const x_data = generateTimeSlots();
const initChart = () => {
    if (!chartEl.value) return;

    chartInstance = echarts.init(chartEl.value);

    const option = {
        tooltip: {
            trigger: "axis",
            formatter: "{b}: {c} kW",
        },
        legend: {
            // data: ["实际负荷", "预测负荷"],
            data: ["预测负荷"],
            bottom: 10,
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            top: "10%",
            containLabel: true,
        },
        dataZoom: [
            {
                type: "inside", // 内置缩放（鼠标滚轮）
                start: 0,
                end: 20,
            },
            {
                type: "slider", // 底部滑动条
                show: true,
                bottom: "5%",
                start: 0,
                end: 50,
                height: 20,
            },
        ],
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: x_data,
            axisLabel: {
                interval: 0,
            },
        },
        yAxis: {
            type: "value",
            name: "负荷值 (kW)",
            nameLocation: "middle",
            nameGap: 40,
            axisLine: {
                show: true,
            },
        },
        series: [
            {
                name: "预测负荷",
                type: "line",
                data: props.predictionData.map((item) => item.value),
                smooth: true,
                lineStyle: {
                    width: 3,
                    // type: "dashed",
                    // color: "#91cc75",
                    color: "#5470c6",
                },
                // symbol: "emptyCircle",
                symbol: "circle",
                symbolSize: 8,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(84, 112, 198, 0.5)" },
                        { offset: 1, color: "rgba(84, 112, 198, 0.1)" },
                    ]),
                },
            },
        ],
    };

    chartInstance.setOption(option);
};

watch(
    () => props.date,
    () => {
        if (chartInstance) {
            chartInstance.dispose();
            initChart();
        }
    }
);

onMounted(() => {
    initChart();
    window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
    }
    window.removeEventListener("resize", handleResize);
});

const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};
</script>

<style lang="scss" scoped>
.chart-container {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    // border: 1px solid #eee;
}
</style>
