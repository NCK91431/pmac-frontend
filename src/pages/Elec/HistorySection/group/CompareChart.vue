<template>
    <div class="compare-chart">
        <div ref="chartEl" class="chart-container" style="height: 450px"></div>
        <CompareTable
            :actual-data="props.actualData"
            :prediction-data="props.predictionData"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import CompareTable from "./CompareTable.vue";
import * as echarts from "echarts";

const props = defineProps({
    actualData: {
        type: Array,
        default: () => [],
    },
    predictionData: {
        type: Array,
        default: () => [],
    },
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
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e4e7ed",
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
                color: "#606266",
            },
            axisPointer: {
                type: "line",
                lineStyle: {
                    color: "#2c6fbb",
                    width: 2,
                    type: "dashed",
                },
                shadowStyle: {
                    color: "rgba(200, 200, 200, 0.2)",
                },
            },
            formatter: function (params) {
                const actualData = params[0];
                const predictionData = params[1];

                return `
                <div style="font-weight: bold; margin-bottom: 8px; color: #303133;">${
                    actualData.name
                }</div>
                <div style="display: flex; align-items: center; margin: 5px 0;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #5470C6; margin-right: 8px;"></span>
                    <span style="margin-right: 15px;">实际值:</span>
                    <span style="font-weight: bold; color: #5470C6;">${
                        actualData.value
                    } kW</span>
                </div>
                <div style="display: flex; align-items: center; margin: 5px 0;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #91CC75; margin-right: 8px;"></span>
                    <span style="margin-right: 15px;">预测值:</span>
                    <span style="font-weight: bold; color: #91CC75;">${
                        predictionData.value
                    } kW</span>
                </div>
                <div style="display: flex; align-items: center; margin: 5px 0;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ff6b6b; margin-right: 8px;"></span>
                    <span style="margin-right: 15px;">误差:</span>
                    <span style="font-weight: bold; color: #ff6b6b;">${Math.abs(
                        actualData.value - predictionData.value
                    ).toFixed(2)} kW</span>
                </div>
                `;
            },
        },
        legend: {
            data: ["实际值", "预测值"],
            bottom: 10,
            itemGap: 20,
            itemWidth: 15,
            itemHeight: 15,
            textStyle: {
                fontSize: 13,
                fontWeight: 500,
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            top: "12%",
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
                interval: 0,
                fontSize: 11,
                formatter: function (value) {
                    return value.replace(":00", "h");
                },
            },
            axisTick: {
                alignWithLabel: true,
            },
        },
        yAxis: {
            type: "value",
            name: "发电功率 (kW)",
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
        },
        series: [
            {
                name: "实际值",
                type: "line",
                data: props.actualData,
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#5470C6",
                    shadowColor: "rgba(84, 112, 198, 0.3)",
                    shadowBlur: 8,
                    shadowOffsetY: 3,
                },
                symbol: "emptyCircle",
                symbolSize: 7,
                itemStyle: {
                    color: "#5470C6",
                    borderWidth: 2,
                    borderColor: "#fff",
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(84, 112, 198, 0.4)" },
                        { offset: 1, color: "rgba(84, 112, 198, 0.1)" },
                    ]),
                },
                emphasis: {
                    itemStyle: {
                        color: "#fff",
                        borderColor: "#5470C6",
                        borderWidth: 2,
                        shadowColor: "rgba(84, 112, 198, 0.8)",
                        shadowBlur: 10,
                    },
                    lineStyle: {
                        width: 4,
                    },
                },
            },
            {
                name: "预测值",
                type: "line",
                data: props.predictionData,
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#91CC75",
                    shadowColor: "rgba(145, 204, 117, 0.3)",
                    shadowBlur: 8,
                    shadowOffsetY: 3,
                },
                symbol: "emptyCircle",
                symbolSize: 7,
                itemStyle: {
                    color: "#91CC75",
                    borderWidth: 2,
                    borderColor: "#fff",
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(145, 204, 117, 0.4)" },
                        { offset: 1, color: "rgba(145, 204, 117, 0.1)" },
                    ]),
                },
                emphasis: {
                    itemStyle: {
                        color: "#fff",
                        borderColor: "#91CC75",
                        borderWidth: 2,
                        shadowColor: "rgba(145, 204, 117, 0.8)",
                        shadowBlur: 10,
                    },
                    lineStyle: {
                        width: 4,
                    },
                },
            },
        ],
    };

    chartInstance.setOption(option);
};

watch(
    () => [props.actualData, props.predictionData],
    () => {
        if (chartInstance) {
            chartInstance.dispose();
            initChart();
        }
    },
    { deep: true }
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
.compare-chart {
    position: relative;

    .chart-container {
        width: 100%;
        background-color: #fff;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid #eaeaea;
    }
}
</style>
