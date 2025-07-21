<template>
    <div class="chart-display">
        <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>
    <LoadTable :predictionData="props.predictionData" />
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import LoadTable from "@/components/LoadTable.vue";

const props = defineProps({
    predictionData: Array,
    date: String,
});

const chartEl = ref(null);
let chartInstance = null;
const x_data = Array(24)
    .fill()
    .map((_, i) => `${i}:00`);
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
                    color: "#91cc75",
                },
                // symbol: "emptyCircle",
                symbol: "circle",
                symbolSize: 8,
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
