<template>
    <div class="chart-header">
        <div class="chart-legend">
            <div class="legend-item">
                <span class="legend-color temperature"></span>
                <span>温度(℃)</span>
            </div>
            <div class="legend-item">
                <span class="legend-color irradiation"></span>
                <span>辐照度(W/m²)</span>
            </div>
        </div>
    </div>
    <div ref="chartEl" class="chart-container" style="height: 450px"></div>
    <WeatherTable
        :temperature-data="temperatureData"
        :irradiation-data="irradiationData"
    />
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import WeatherTable from "./WeatherTable.vue";

const props = defineProps({
    temperatureData: {
        type: Array,
        default: () => [],
    },
    irradiationData: {
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

    // 温度颜色渐变
    const temperatureGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(84, 112, 198, 0.8)" },
        { offset: 1, color: "rgba(84, 112, 198, 0.1)" },
    ]);

    // 辐照度颜色渐变
    const irradiationGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: "rgba(145, 204, 117, 0.8)" },
        { offset: 1, color: "rgba(145, 204, 117, 0.1)" },
    ]);

    const option = {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                label: {
                    backgroundColor: "#6a7985",
                },
            },
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderColor: "#eee",
            borderWidth: 1,
            textStyle: {
                color: "#333",
            },
            formatter: function (params) {
                let result = `${params[0].axisValue}<br/>`;
                params.forEach((param) => {
                    const unit = param.seriesName === "温度" ? "℃" : "W/m²";
                    const icon = param.seriesName === "温度" ? "🌡️" : "☀️";
                    result += `${icon} ${param.seriesName}: <span style="font-weight:bold;color:${param.color}">${param.value} ${unit}</span><br/>`;
                });
                return result;
            },
        },
        legend: {
            data: ["温度", "辐照度"],
            bottom: 10,
            textStyle: {
                color: "#6c757d",
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            top: "15%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: x_data,
            axisLine: {
                lineStyle: {
                    color: "#dee2e6",
                },
            },
            axisLabel: {
                color: "#6c757d",
                interval: 2,
                fontSize: 11,
            },
            axisTick: {
                alignWithLabel: true,
            },
        },
        yAxis: [
            {
                type: "value",
                name: "温度(℃)",
                position: "left",
                nameTextStyle: {
                    color: "#5470C6",
                    fontWeight: "bold",
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#5470C6",
                    },
                },
                axisLabel: {
                    color: "#5470C6",
                    formatter: "{value}°",
                },
                splitLine: {
                    lineStyle: {
                        color: "#f0f0f0",
                        type: "dashed",
                    },
                },
            },
            {
                type: "value",
                name: "辐照度(W/m²)",
                position: "right",
                nameTextStyle: {
                    color: "#91CC75",
                    fontWeight: "bold",
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#91CC75",
                    },
                },
                axisLabel: {
                    color: "#91CC75",
                    formatter: "{value}",
                },
                splitLine: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: "温度",
                type: "line",
                yAxisIndex: 0,
                data: props.temperatureData,
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#5470C6",
                    shadowColor: "rgba(84, 112, 198, 0.5)",
                    shadowBlur: 10,
                    shadowOffsetY: 5,
                },
                symbol: "circle",
                symbolSize: 7,
                itemStyle: {
                    color: "#5470C6",
                    borderWidth: 0,
                    opacity: 0.8, // 稍微透明
                },
                areaStyle: {
                    color: temperatureGradient,
                },
                emphasis: {
                    itemStyle: {
                        borderWidth: 3,
                        shadowBlur: 10,
                        shadowColor: "rgba(84, 112, 198, 0.8)",
                    },
                },
                animationDuration: 2000,
                animationEasing: "cubicOut",
            },
            {
                name: "辐照度",
                type: "line",
                yAxisIndex: 1,
                data: props.irradiationData,
                smooth: true,
                lineStyle: {
                    width: 4,
                    color: "#91CC75",
                    shadowColor: "rgba(145, 204, 117, 0.5)",
                    shadowBlur: 10,
                    shadowOffsetY: 5,
                },
                symbol: "circle",
                symbolSize: 7,
                itemStyle: {
                    color: "#91CC75",
                    borderWidth: 0,
                    opacity: 0.8,
                },
                areaStyle: {
                    color: irradiationGradient,
                },
                emphasis: {
                    itemStyle: {
                        borderWidth: 3,
                        shadowBlur: 10,
                        shadowColor: "rgba(145, 204, 117, 0.8)",
                    },
                },
                animationDuration: 2000,
                animationEasing: "cubicOut",
                animationDelay: 300,
            },
        ],
        backgroundColor: "#fff",
        textStyle: {
            fontFamily: "inherit",
        },
    };

    chartInstance.setOption(option);
};

watch(
    () => [props.temperatureData, props.irradiationData],
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
.weather-chart {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 20px;
    margin-bottom: 24px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
        color: #2c3e50;
        font-weight: 600;
        margin: 0;
        font-size: 1.25rem;
    }
}

.chart-legend {
    display: flex;
    gap: 20px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #6c757d;
}

.legend-color {
    display: inline-block;
    width: 16px;
    height: 4px;
    border-radius: 2px;

    &.temperature {
        background: linear-gradient(90deg, #5470c6, #9cb4e6);
    }

    &.irradiation {
        background: linear-gradient(90deg, #91cc75, #c2e0a8);
    }
}

.chart-container {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
}

@media (max-width: 768px) {
    .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .chart-legend {
        align-self: stretch;
        justify-content: space-around;
    }
}
</style>
