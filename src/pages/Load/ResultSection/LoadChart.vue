<template>
    <div class="chart-display">
        <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>
    <LoadTable
        :loads="props.loads"
        :headerData="x_data"
        :similarDayLoad="props.similarDayLoad"
        :unit="unit"
    />
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import LoadTable from "./LoadTable.vue";

const props = defineProps({
    loads: Array,
    date: String,
    similarDayLoad: {
        type: Array,
        default: () => [],
    },
    unit: String,
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
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "#e4e7ed",
            borderWidth: 1,
            textStyle: {
                color: "#606266",
                fontSize: 12,
            },
            formatter: function (params) {
                let result = `<div style="font-weight: 600; margin-bottom: 8px; color: #303133;">${params[0].axisValue}</div>`;
                params.forEach((item) => {
                    const color = item.color;
                    const value =
                        item.value !== null && item.value !== undefined
                            ? `${item.value} ${props.unit}`
                            : "暂无数据";

                    result += `
                        <div style="display: flex; align-items: center; margin: 6px 0;">
                            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
                            <span style="flex: 1; color: #606266;">${item.seriesName}:</span>
                            <span style="font-weight: 600; color: #303133; margin-left: 8px;">${value}</span>
                        </div>
                    `;
                });
                return result;
            },
            extraCssText:
                "box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border-radius: 6px; padding: 12px;",
        },
        legend: {
            data: ["预测负荷", "同类型日负荷"],
            selected: {
                预测负荷: true,
                同类型日负荷: false, // 默认不显示同类型日负荷
            },
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
            data: x_data, // 横坐标数据
            axisLabel: {
                interval: 0,
            },
        },
        yAxis: {
            type: "value",
            name: `负荷值 (${props.unit})`,
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
                data: props.loads, // 纵坐标数据
                smooth: true,
                lineStyle: {
                    width: 3,
                    // type: "dashed",
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
            {
                name: "同类型日负荷",
                type: "line",
                data: props.similarDayLoad,
                smooth: true,
                lineStyle: {
                    width: 2,
                    color: "#FF9800",
                    type: "dashed",
                },
                symbol: "emptyCircle",
                symbolSize: 6,
                itemStyle: {
                    color: "#FF9800",
                    borderWidth: 1,
                    borderColor: "#fff",
                },
                emphasis: {
                    itemStyle: {
                        color: "#fff",
                        borderColor: "#FF9800",
                        borderWidth: 2,
                    },
                    lineStyle: {
                        width: 3,
                    },
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
.chart-container {
    width: 100%;
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    // border: 1px solid #eee;
}
</style>
