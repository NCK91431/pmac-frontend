<template>
    <div class="case-container">
        <!-- 图表容器 -->
        <div class="chart-container">
            <div ref="chartRef" class="chart" style="height: 400px"></div>
        </div>

        <!-- 提示语 -->
        <div class="tip-container" :class="tipType">
            <div class="tip-content">
                <i class="tip-icon" :class="tipIcon"></i>
                <div class="tip-text">
                    {{ tipMessage }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import * as echarts from "echarts";

const props = defineProps({
    caseData: {
        type: Object,
        default: () => ({}),
    },
});

const chartRef = ref(null);
let chartInstance = null;

// 计算提示语类型和内容
const tipType = computed(() => {
    const days = props.caseData?.load_days || 0;
    return days >= 270 ? "success-tip" : "warning-tip";
});

const tipIcon = computed(() => {
    return tipType.value === "success-tip"
        ? "bi-check-circle-fill"
        : "bi-info-circle-fill";
});

const tipMessage = computed(() => {
    const days = props.caseData?.load_days || 0;
    if (days >= 270) {
        return `智能多场景优化已完成！基于您提供的${days}天负荷结合当地天气数据，系统进行1000+随机场景生成，确保配置方案在各种情况下都能保持优异性能。`;
    } else {
        return `基于您提供的${days}日负荷数据，我们已为您优化出最佳光储配置方案。建议上传全年负荷数据，系统将自动分析不同季节和天气条件下的运行场景，以获得更精准的优化结果。`;
    }
});

// 处理数据，确保所有数组都是24个点
const processChartData = (data) => {
    const timePoints = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    // 确保所有数据数组都是24个点
    const ensure24Points = (arr) => {
        if (!arr || !Array.isArray(arr)) return new Array(24).fill(0);
        if (arr.length === 24) return arr;
        // 如果长度不足24，用0填充
        return [...arr, ...new Array(24 - arr.length).fill(0)];
    };

    // 确保柱状图数据为非负数
    const ensureNonNegative = (arr) => {
        return ensure24Points(arr).map((val) => Math.max(0, val));
    };

    // 将放电数据转换为负数
    const processDischargeData = (arr) => {
        return ensure24Points(arr).map((val) => -Math.abs(val)); // 确保为负值
    };

    return {
        timePoints,
        pv_data: ensure24Points(data?.pv_data),
        load_data: ensure24Points(data?.load_data),
        operating_status: ensure24Points(data?.operating_status),
        pch_data: ensureNonNegative(data?.pch_data),
        pdis_data: processDischargeData(data?.pdis_data), // 放电数据为负数
    };
};

// 计算y轴的最大最小值，确保正负轴对称
const calculateYAxisRange = (data) => {
    const chartData = processChartData(data);
    const allValues = [
        ...chartData.pv_data,
        ...chartData.load_data,
        ...chartData.operating_status,
        ...chartData.pch_data,
        ...chartData.pdis_data.map((val) => Math.abs(val)), // 取绝对值计算范围
    ];

    const maxValue = Math.max(...allValues);
    const roundedMax = Math.ceil(maxValue / 100) * 100; // 向上取整到最近的100
    return [-roundedMax, roundedMax];
};

// 初始化图表
const initChart = () => {
    if (!chartRef.value) return;

    chartInstance = echarts.init(chartRef.value);

    const chartData = processChartData(props.caseData);
    const yAxisRange = calculateYAxisRange(props.caseData);

    const option = {
        title: {
            text: "光储系统运行场景示例",
            left: "center",
            textStyle: {
                fontSize: 16,
                fontWeight: "bold",
                color: "#333",
            },
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                label: {
                    backgroundColor: "#6a7985",
                },
            },
            backgroundColor: "rgba(255,255,255,0.95)",
            borderWidth: 1,
            borderColor: "#ddd",
            textStyle: {
                color: "#333",
            },
            formatter: function (params) {
                let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].name}</div>`;
                params.forEach((param) => {
                    let value =
                        param.value !== null && param.value !== undefined
                            ? param.value.toFixed(2)
                            : "-";
                    let displayValue = value;

                    // 对于放电数据，显示绝对值但标注为放电
                    if (param.seriesName === "储能放电") {
                        displayValue = Math.abs(value).toFixed(2);
                    }

                    result += `
                        <div style="display: flex; align-items: center; margin: 2px 0;">
                            <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                            <span style="flex: 1;">${param.seriesName}:</span>
                            <span style="font-weight: bold; margin-left: 10px;">${displayValue} kW</span>
                        </div>
                    `;
                });
                return result;
            },
        },
        legend: {
            data: ["光伏功率", "负荷功率", "购电功率", "储能充电", "储能放电"],
            top: 30,
            textStyle: {
                fontSize: 12,
            },
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: 80,
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: true,
            data: chartData.timePoints,
            axisLine: {
                lineStyle: {
                    color: "#999",
                },
            },
            axisLabel: {
                color: "#666",
                interval: 2,
                rotate: 45,
                margin: 10,
            },
            axisTick: {
                alignWithLabel: true,
            },
        },
        yAxis: {
            type: "value",
            name: "功率 (kW)",
            nameTextStyle: {
                color: "#666",
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "#999",
                },
            },
            axisLabel: {
                color: "#666",
                formatter: function (value) {
                    return Math.abs(value); // 显示绝对值，因为放电在负轴
                },
            },
            splitLine: {
                lineStyle: {
                    color: "#f0f0f0",
                    type: "dashed",
                },
            },
            min: yAxisRange[0],
            max: yAxisRange[1],
        },
        series: [
            {
                name: "光伏功率",
                type: "line",
                data: chartData.pv_data,
                smooth: true,
                lineStyle: {
                    width: 2,
                    color: "#FFB74D",
                },
                itemStyle: {
                    color: "#FFB74D",
                },
                symbol: "circle",
                symbolSize: 4,
                z: 3,
            },
            {
                name: "负荷功率",
                type: "line",
                data: chartData.load_data,
                smooth: true,
                lineStyle: {
                    width: 2,
                    color: "#64B5F6",
                },
                itemStyle: {
                    color: "#64B5F6",
                },
                symbol: "circle",
                symbolSize: 4,
                z: 3,
            },
            {
                name: "购电功率",
                type: "line",
                data: chartData.operating_status,
                smooth: true,
                lineStyle: {
                    width: 2,
                    color: "#4CAF50",
                },
                itemStyle: {
                    color: "#4CAF50",
                },
                symbol: "circle",
                symbolSize: 4,
                z: 3,
            },
            {
                name: "储能充电",
                type: "bar",
                data: chartData.pch_data,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(149, 117, 205, 0.8)" },
                        { offset: 1, color: "rgba(126, 87, 194, 0.8)" },
                    ]),
                },
                barWidth: "40%",
                barGap: "-100%", // 让后续系列与第一个系列重叠
                z: 2,
            },
            {
                name: "储能放电",
                type: "bar",
                data: chartData.pdis_data,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(244, 143, 177, 0.8)" },
                        { offset: 1, color: "rgba(236, 64, 122, 0.8)" },
                    ]),
                },
                barWidth: "40%",
                barGap: "-100%", // 让后续系列与第一个系列重叠
                z: 2,
            },
        ],
        color: ["#FFB74D", "#64B5F6", "#4CAF50", "#9575CD", "#F48FB1"],
    };

    chartInstance.setOption(option);
};

// 监听数据变化更新图表
watch(
    () => props.caseData,
    (newVal) => {
        if (chartInstance && newVal) {
            const chartData = processChartData(newVal);
            const yAxisRange = calculateYAxisRange(newVal);
            const option = {
                xAxis: {
                    data: chartData.timePoints,
                },
                yAxis: {
                    min: yAxisRange[0],
                    max: yAxisRange[1],
                },
                series: [
                    { data: chartData.pv_data },
                    { data: chartData.load_data },
                    { data: chartData.operating_status },
                    { data: chartData.pch_data },
                    { data: chartData.pdis_data },
                ],
            };
            chartInstance.setOption(option);
        }
    },
    { deep: true }
);

// 响应式调整图表大小
const handleResize = () => {
    if (chartInstance) {
        chartInstance.resize();
    }
};

onMounted(() => {
    initChart();
    window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener("resize", handleResize);
});
</script>

<style lang="scss" scoped>
.case-container {
    margin-top: 24px;
}

.chart-container {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;
    border: 1px solid #e8e8e8;
}

.chart {
    width: 100%;
}

.tip-container {
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
    border: 1px solid;
    transition: all 0.3s ease;

    &.success-tip {
        background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
        border-color: #91d5ff;

        .tip-icon {
            color: #1890ff;
        }
    }

    &.warning-tip {
        background: linear-gradient(135deg, #fff7e6 0%, #fff2e8 100%);
        border-color: #ffd591;

        .tip-icon {
            color: #fa8c16;
        }
    }
}

.tip-content {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.tip-icon {
    font-size: 20px;
    margin-top: 2px;
    flex-shrink: 0;
}

.tip-text {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    font-weight: 500;
}

// 响应式设计
@media (max-width: 768px) {
    .chart-container {
        padding: 12px;
    }

    .tip-content {
        flex-direction: column;
        text-align: center;
        gap: 8px;
    }

    .tip-icon {
        margin-top: 0;
    }
}
</style>
