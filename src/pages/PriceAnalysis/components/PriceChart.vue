<template>
    <div ref="chartRef" class="price-chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import * as echarts from "echarts";

const props = defineProps({
    dayAheadData: {
        type: Array,
        default: () => [],
    },
    realTimeData: {
        type: Array,
        default: () => [],
    },
    nodeName: {
        type: String,
        default: "",
    },
    chartHeight: {
        type: Number,
        default: 350,
    },
});

// 响应式数据
const chartRef = ref(null);
let chartInstance = null;

// 生成时间轴 - 始终生成96个点的时间轴
const generateTimeAxis = () => {
    const timeAxis = Array.from({ length: 96 }, (_, i) => {
        const hour = Math.floor(i / 4);
        const minute = (i % 4) * 15;
        return `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
    });
    // 始终返回96个点的时间轴（分钟级）
    return timeAxis;
};

// 查找极值点
const findExtremePoints = (data) => {
    if (!data || data.length === 0) return { max: null, min: null };

    let maxIndex = 0;
    let minIndex = 0;
    let maxValue = data[0];
    let minValue = data[0];

    data.forEach((value, index) => {
        if (value > maxValue) {
            maxValue = value;
            maxIndex = index;
        }
        if (value < minValue) {
            minValue = value;
            minIndex = index;
        }
    });

    return {
        max: { index: maxIndex, value: maxValue },
        min: { index: minIndex, value: minValue },
    };
};

// 计算均值的函数
const calculateAverage = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
};

// 初始化图表
const initChart = () => {
    if (!chartRef.value) return;

    chartInstance = echarts.init(chartRef.value);

    const timeAxis = generateTimeAxis();
    const dayAheadExtremes = findExtremePoints(props.dayAheadData);
    const realTimeExtremes = findExtremePoints(props.realTimeData);

    // 计算均价
    const dayAheadAverage = calculateAverage(props.dayAheadData);
    const realTimeAverage = calculateAverage(props.realTimeData);

    // 准备极值点数据
    const dayAheadMaxPoints = [];
    const dayAheadMinPoints = [];
    const realTimeMaxPoints = [];
    const realTimeMinPoints = [];

    if (dayAheadExtremes.max) {
        dayAheadMaxPoints.push({
            coord: [dayAheadExtremes.max.index, dayAheadExtremes.max.value],
            value: dayAheadExtremes.max.value,
        });
    }

    if (dayAheadExtremes.min) {
        dayAheadMinPoints.push({
            coord: [dayAheadExtremes.min.index, dayAheadExtremes.min.value],
            value: dayAheadExtremes.min.value,
        });
    }

    if (realTimeExtremes.max) {
        realTimeMaxPoints.push({
            coord: [realTimeExtremes.max.index, realTimeExtremes.max.value],
            value: realTimeExtremes.max.value,
        });
    }

    if (realTimeExtremes.min) {
        realTimeMinPoints.push({
            coord: [realTimeExtremes.min.index, realTimeExtremes.min.value],
            value: realTimeExtremes.min.value,
        });
    }

    // 准备均价线数据
    const averageLines = [
        {
            name: "realTimeAverage",
            seriesName: "实时节点电价",
            average: realTimeAverage,
            color: "#409eff",
        },
        {
            name: "dayAheadAverage",
            seriesName: "日前节点电价",
            average: dayAheadAverage,
            color: "#67c23a",
        },
    ];

    const option = {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                crossStyle: {
                    color: "#999",
                },
            },
            formatter: (params) => {
                let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
                params.forEach((param) => {
                    const icon = param.seriesName.includes("实时")
                        ? "⚡"
                        : "📅";
                    const color = param.color;
                    result += `
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
              <span>${param.seriesName}: </span>
              <span style="font-weight: bold; margin-left: 8px;">${param.value}</span>
              <span style="margin-left: 4px;">元/MWh</span>
            </div>
          `;
                });
                return result;
            },
        },
        legend: {
            data: ["实时节点电价", "日前节点电价"],
             bottom: "6%", 
            icon: "circle",
            itemWidth: 12,
            itemHeight: 12,
                // backgroundColor: 'rgba(255,0,0,0.3)', // 临时背景色
            textStyle: {
                fontSize: 12,
            },
        },
        grid: {
            left: "3%",
            right: "10%",
            bottom: "12%",    // 增大底部留白
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: timeAxis,
            axisLabel: {
                color: "#606266",
                fontSize: 12,
            },
            axisLine: {
                lineStyle: {
                    color: "#dcdfe6",
                },
            },
            axisTick: {
                show: true,
                alignWithLabel: true,
            },
        },
        yAxis: {
            type: "value",
            name: "电价 (元/MWh)",
            nameTextStyle: {
                fontSize: 12,
                color: "#606266",
            },
            axisLabel: {
                color: "#606266",
                fontSize: 12,
                formatter: "{value}",
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "#dcdfe6",
                },
            },
            splitLine: {
                lineStyle: {
                    type: "dashed",
                    color: "#e0e0e0",
                },
            },
        },
        series: [
            {
                name: "实时节点电价",
                type: "line",
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 3,
                    color: "#409eff",
                },
                itemStyle: {
                    color: "#409eff",
                },
                data: props.realTimeData,
                markLine: {
                    silent: true,
                    symbol: "none",
                    lineStyle: {
                        type: "dashed",
                        width: 1,
                        color: "#409eff",
                        opacity: 0.7,
                    },
                    label: {
                        formatter: (params) => {
                            return `实时均价: ${params.value.toFixed(2)}`;
                        },
                        position: "end",
                        color: "#333",
                        fontSize: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        padding: [2, 4],
                        borderColor: "#ddd",
                        borderWidth: 1,
                        borderRadius: 2,
                    },
                    data: [
                        {
                            yAxis: realTimeAverage,
                            name: "实时均价线",
                        },
                    ],
                },
                markPoint: {
                    symbol: "circle",
                    symbolSize: 6,
                    itemStyle: {
                        color: "#409eff", // 蓝色
                        borderWidth: 0,
                    },
                    label: {
                        formatter: (params) => {
                            // 根据参数判断是最高点还是最低点，返回对应的图标和数值
                            const icon =
                                params.data.name === "最高" ? "←" : "←";
                            const value = params.data.value.toFixed(2);
                            return `${icon}实时${params.data.name} ${value}`;
                        },
                        color: "#409eff", // 蓝色
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        padding: [2, 4],
                        position: (params) =>
                            params.data.name === "最高" ? "top" : "bottom",
                    },
                    data: [
                        ...realTimeMaxPoints.map((point) => ({
                            name: "最高",
                            coord: point.coord,
                            value: point.value,
                        })),
                        ...realTimeMinPoints.map((point) => ({
                            name: "最低",
                            coord: point.coord,
                            value: point.value,
                        })),
                    ],
                },
            },
            {
                name: "日前节点电价",
                type: "line",
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 3,
                    color: "#67c23a",
                },
                itemStyle: {
                    color: "#67c23a",
                },
                data: props.dayAheadData,
                markLine: {
                    silent: true,
                    symbol: "none",
                    lineStyle: {
                        type: "dashed",
                        width: 1,
                        color: "#67c23a",
                        opacity: 0.7,
                    },
                    label: {
                        formatter: (params) => {
                            return `日前均价: ${params.value.toFixed(2)}`;
                        },
                        position: "end",
                        color: "#333",
                        fontSize: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        padding: [2, 4],
                        borderColor: "#ddd",
                        borderWidth: 1,
                        borderRadius: 2,
                    },
                    data: [
                        {
                            yAxis: dayAheadAverage,
                            name: "日前均价线",
                        },
                    ],
                },
                markPoint: {
                    symbol: "circle",
                    symbolSize: 6,
                    itemStyle: {
                        color: "#67c23a", // 绿色
                        borderWidth: 0,
                    },
                    label: {
                        formatter: (params) => {
                            const icon =
                                params.data.name === "最高" ? "←" : "←";
                            const value = params.data.value.toFixed(2);
                            return `${icon}日前${params.data.name} ${value}`;
                        },
                        color: "#67c23a", // 绿色
                        backgroundColor: "transparent",
                        borderWidth: 0,
                        padding: [2, 4],
                        position: (params) =>
                            params.data.name === "最高" ? "top" : "bottom",
                    },
                    data: [
                        ...dayAheadMaxPoints.map((point) => ({
                            name: "最高",
                            coord: point.coord,
                            value: point.value,
                        })),
                        ...dayAheadMinPoints.map((point) => ({
                            name: "最低",
                            coord: point.coord,
                            value: point.value,
                        })),
                    ],
                },
            },
        ],
        /* 暂不支持
        dataZoom: [
            {
                type: "inside",
                xAxisIndex: 0,
                zoomLock: false,
            },
            {
                type: "slider",
                xAxisIndex: 0,
                bottom: "2%",
                height: 20,
                borderColor: "transparent",
                fillerColor: "rgba(64, 158, 255, 0.1)",
                handleStyle: {
                    color: "#409eff",
                },
            },
        ],
		*/
    };

    chartInstance.setOption(option);
    // 监听legend切换事件
    chartInstance.on("legendselectchanged", (params) => {
        const selectedSeries = Object.keys(params.selected).filter(
            (name) => params.selected[name]
        );

        // 获取当前图表的option
        const currentOption = chartInstance.getOption();

        // 根据选中状态设置均价线显示
        currentOption.series.forEach((series, index) => {
            if (series.markLine) {
                const seriesName = series.name;
                const isSelected = params.selected[seriesName];

                // 如果该系列被选中，则显示其均价线，否则隐藏
                series.markLine.lineStyle.opacity = isSelected ? 1 : 0;
                series.markLine.label.opacity = isSelected ? 1 : 0;

                // 也要隐藏箭头符号
                if (series.markLine.symbol) {
                    series.markLine.symbolSize = isSelected ? [0, 8] : [0, 0];
                }
            }
        });

        chartInstance.setOption(currentOption);
    });
};

// 监听数据变化
watch(
    () => [props.dayAheadData, props.realTimeData],
    () => {
        nextTick(() => {
            if (chartInstance) {
                initChart();
            }
        });
    },
    { deep: true }
);

// 生命周期
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

// 处理窗口大小变化
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};
</script>

<style scoped lang="scss">
.price-chart {
    width: 100%;
    height: 100%;
    min-height: v-bind(chartHeight + 'px');
}
</style>
