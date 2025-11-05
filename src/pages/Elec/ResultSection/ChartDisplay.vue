<template>
    <div class="chart-display">
        <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>
    <ResultTable
        :predictionData="props.predictionData"
        :headerData="generateTimeSlots()"
        :unit="props.unit"
    />
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import ResultTable from "./ResultTable.vue";

const props = defineProps({
    predictionData: Array,
    date: String,
    capacity: {
        type: Number,
        default: 0,
    },
    unit: String,
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
    const option = getOption();
    chartInstance.setOption(option);
};

watch(
    () => props.predictionData,
    (newVal) => {
        if (chartInstance && newVal && newVal.length > 0) {
            // 使用 nextTick 确保 DOM 已更新
            nextTick(() => {
                const option = getOption();
                chartInstance.setOption(option, true); // true 表示不合并配置
            });
        }
    },
    { deep: true, immediate: true }
);

// 提取 option 生成逻辑到单独函数
const getOption = () => {
    return {
        tooltip: {
            trigger: "axis",
            formatter: function (params) {
                const time = params[0].axisValue;
                const value = params[0].data;
                return `
                 <div style="display: flex; align-items: center; margin: 5px 0;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #91CC75; margin-right: 8px;"></span>
                    <span style="margin-right: 15px;">${time}:</span>
                    <span style="font-weight: bold; color: #91CC75;">${value} ${
                    props.unit == "MWp" ? "MW" : "kW"
                }</span>
                </div>
                `;
            },
        },
        legend: {
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
            axisLine: {
                lineStyle: {
                    color: "#dcdfe6",
                },
            },
            axisLabel: {
                color: "#606266",
                interval: 2,
                fontSize: 11,
            },
            axisTick: {
                alignWithLabel: true,
            },
        },
        yAxis: {
            type: "value",
            name: `预测值 (${props.unit == "MWp" ? "MW" : "kW"})`,
            nameLocation: "middle",
            nameGap: 40,
            nameTextStyle: {
                fontSize: 12,
                color: "#606266",
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "#dcdfe6",
                },
            },
            axisLabel: {
                color: "#606266",
            },
            splitLine: {
                lineStyle: {
                    type: "dashed",
                    color: "#e4e7ed",
                },
            },
            max: props.capacity > 0 ? props.capacity : null,
            interval: props.capacity > 0 ? Math.ceil(props.capacity / 5) : null,
        },
        series: [
            {
                name: "预测值",
                type: "line",
                data: props.predictionData.map((item) => item.value),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#5470C6",
                    shadowColor: "rgba(84, 112, 198, 0.15)",
                    shadowBlur: 8,
                },
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
};

onMounted(() => {
    console.log("mounted", props);
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
