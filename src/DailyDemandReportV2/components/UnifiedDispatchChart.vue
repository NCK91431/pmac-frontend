<template>
  <div class="unified-dispatch-chart-container">
    <!-- 统调曲线图 -->
    <div class="dispatch-chart-section">
      <div class="section-header">
        <h4>📈 统调曲线</h4>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color predicted"></span>
            <span>预测负荷（蓝色实线实点）</span>
          </div>
          <div class="legend-item">
            <span class="legend-color actual"></span>
            <span>实际负荷（灰色虚线无点）</span>
          </div>
        </div>
      </div>
      <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from "vue";
import * as echarts from "echarts";

// Props定义
const props = defineProps({
  // 申报日期
  date: {
    type: String,
    default: "",
  },
  // 统调曲线数据
  chartData: {
    type: Array,
    default: () => [],
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
});

// Emits定义
const emit = defineEmits(["export-data"]);

// 图表实例
const chartEl = ref(null);
let chartInstance = null;

// 计算属性：图表数据
const chartSeriesData = computed(() => {
  const predictedData = [];
  const actualData = [];
  const timeLabels = [];

  // 根据接口返回数据结构提取预测和实际负荷数据
  // 假设数据格式与其他图表接口类似：包含id、name、dataList字段
  // 预测负荷可能是id: "1"或其他标识，需要根据实际接口调整
  const predictedItem = props.chartData.find(
    (item) => item.id === "1" || item.name === "预测负荷",
  );
  const actualItem = props.chartData.find(
    (item) => item.id === "2" || item.name === "实际负荷",
  );

  if (predictedItem && predictedItem.dataList) {
    predictedItem.dataList.forEach((item) => {
      predictedData.push(item.value);
      timeLabels.push(item.label);
    });
  }

  if (actualItem && actualItem.dataList) {
    actualItem.dataList.forEach((item) => {
      actualData.push(item.value);
    });
  }

  return { predictedData, actualData, timeLabels };
});

// 初始化图表
const initChart = () => {
  if (!chartEl.value) return;

  chartInstance = echarts.init(chartEl.value);

  const { predictedData, actualData, timeLabels } = chartSeriesData.value;

  // 预测负荷颜色（蓝色）
  const predictedColor = "#5470c6";
  // 实际负荷颜色（灰色）
  const actualColor = "#909399";

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
          const icon = param.seriesName === "预测负荷" ? "🔵" : "⚫";
          result += `${icon} ${param.seriesName}: <span style="font-weight:bold;color:${param.color}">${param.value} MW</span><br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["预测负荷", "实际负荷"],
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
      data: timeLabels,
      axisLine: {
        lineStyle: {
          color: "#dee2e6",
        },
      },
      axisLabel: {
        color: "#6c757d",
        interval: 3, // 只显示整点标签（每4个点显示一个，假设有96个点）
        fontSize: 11,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      name: "统调负荷(MW)",
      nameTextStyle: {
        color: "#606266",
        fontWeight: "bold",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#909399",
        },
      },
      axisLabel: {
        color: "#606266",
        formatter: "{value}",
      },
      splitLine: {
        lineStyle: {
          color: "#f0f0f0",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "预测负荷",
        type: "line",
        data: predictedData,
        smooth: true,
        lineStyle: {
          width: 3,
          color: predictedColor,
          shadowColor: "rgba(84, 112, 198, 0.5)",
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        symbol: "circle",
        symbolSize: 7,
        itemStyle: {
          color: predictedColor,
          borderWidth: 0,
          opacity: 0.8,
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
        name: "实际负荷",
        type: "line",
        data: actualData,
        smooth: true,
        lineStyle: {
          width: 2,
          color: actualColor,
          type: "dashed",
          shadowColor: "rgba(144, 147, 153, 0.3)",
          shadowBlur: 5,
          shadowOffsetY: 2,
        },
        symbol: "none", // 灰色虚线无点
        itemStyle: {
          color: actualColor,
          borderWidth: 0,
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 2,
            shadowBlur: 8,
            shadowColor: "rgba(144, 147, 153, 0.6)",
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

// 格式化数字
const formatNumber = (value) => {
  if (value === null || value === undefined) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(2);
};

// 导出数据
const exportChartData = () => {
  emit("export-data", {
    chartData: props.chartData,
    seriesData: chartSeriesData.value,
  });
};

// 监听数据变化，更新图表
watch(
  () => props.chartData,
  () => {
    if (chartInstance) {
      chartInstance.dispose();
      initChart();
    }
  },
  { deep: true },
);

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

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
</script>

<style lang="scss" scoped>
.unified-dispatch-chart-container {
  background: white;
  padding: 24px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      color: #2c3e50;
      font-weight: 600;
      margin: 0;
      font-size: 1.1rem;
    }
  }

  // 图表区域
  .dispatch-chart-section {
    .chart-legend {
      display: flex;
      gap: 20px;

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

        &.predicted {
          background: linear-gradient(90deg, #5470c6, #91cc75);
        }

        &.actual {
          background: linear-gradient(90deg, #909399, #c0c4cc);
          border-style: dashed;
          border-width: 2px;
          background: repeating-linear-gradient(
            90deg,
            #909399,
            #909399 4px,
            transparent 4px,
            transparent 8px
          );
          height: 2px;
        }
      }
    }

    .chart-container {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9edf2;
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    padding: 16px;

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .dispatch-chart-section {
      .chart-legend {
        justify-content: space-around;
        width: 100%;
      }
    }
  }
}
</style>
