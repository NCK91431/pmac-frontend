<template>
  <div class="price-chart-container">
    <!-- 电价曲线图 -->
    <div class="price-chart-section">
      <div class="section-header">
        <h4>📈 电价预测曲线</h4>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color day-ahead"></span>
            <span>日前预测电价</span>
          </div>
          <div class="legend-item">
            <span class="legend-color real-time"></span>
            <span>实时预测电价</span>
          </div>
        </div>
      </div>
      <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>

    <!-- 24小时电价数据表格 -->
    <div class="price-table-section">
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        max-height="400"
      >
        <el-table-column
          prop="time"
          label="时间"
          width="80"
          align="center"
          fixed="left"
        >
          <template #default="{ row }">
            <div class="time-cell">{{ row.time }}</div>
          </template>
        </el-table-column>

        <!-- 动态生成24小时列 -->
        <el-table-column
          v-for="hour in 24"
          :key="hour"
          :label="`${String(hour - 1).padStart(2, '0')}:00`"
          width="75"
          align="center"
        >
          <template #default="{ row }">
            <div
              v-if="row.type === 'dayAhead'"
              class="hour-data day-ahead-data"
            >
              {{ formatNumber(row.data[hour - 1]) }}
            </div>
            <div
              v-else-if="row.type === 'realTime'"
              class="hour-data real-time-data"
            >
              {{ formatNumber(row.data[hour - 1]) }}
            </div>
            <div v-else class="hour-data time-label">
              {{ row.data[hour - 1] }}
            </div>
          </template>
        </el-table-column>
      </el-table>
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
  // 电价数据
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

// 计算属性：表格数据
const tableData = computed(() => {
  const data = [];

  // 提取日前和实时电价数据
  let dayAheadData = [];
  let realTimeData = [];
  let timeLabels = [];

  // 查找日前预测电价数据（id: "1"）
  const dayAheadItem = props.chartData.find((item) => item.id === "1");
  if (dayAheadItem && dayAheadItem.dataList) {
    dayAheadData = dayAheadItem.dataList.map((item) => item.value);
    timeLabels = dayAheadItem.dataList.map((item) => item.label);
  }

  // 查找实时预测电价数据（id: "3"）
  const realTimeItem = props.chartData.find((item) => item.id === "3");
  if (realTimeItem && realTimeItem.dataList) {
    realTimeData = realTimeItem.dataList.map((item) => item.value);
  }

  // 第一行：日前预测电价数据
  data.push({
    type: "dayAhead",
    time: "日前预测电价",
    dayAheadPrice: "—",
    realTimePrice: "—",
    data: dayAheadData,
  });

  // 第二行：实时预测电价数据
  data.push({
    type: "realTime",
    time: "实时预测电价",
    dayAheadPrice: "—",
    realTimePrice: "—",
    data: realTimeData,
  });

  return data;
});

// 计算属性：图表数据
const chartSeriesData = computed(() => {
  const dayAheadData = [];
  const realTimeData = [];
  const timeLabels = [];

  // 查找日前预测电价数据（id: "1"）
  const dayAheadItem = props.chartData.find((item) => item.id === "1");
  if (dayAheadItem && dayAheadItem.dataList) {
    dayAheadItem.dataList.forEach((item) => {
      dayAheadData.push(item.value);
      timeLabels.push(item.label);
    });
  }

  // 查找实时预测电价数据（id: "3"）
  const realTimeItem = props.chartData.find((item) => item.id === "3");
  if (realTimeItem && realTimeItem.dataList) {
    realTimeItem.dataList.forEach((item) => {
      realTimeData.push(item.value);
    });
  }
  return { dayAheadData, realTimeData, timeLabels };
});

// 初始化图表
const initChart = () => {
  if (!chartEl.value) return;

  chartInstance = echarts.init(chartEl.value);

  const { dayAheadData, realTimeData, timeLabels } = chartSeriesData.value;

  // 日前预测电价颜色（橙色）
  const dayAheadColor = "#e6a23c";
  // 实时预测电价颜色（绿色）
  const realTimeColor = "#67c23a";

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
          const icon = param.seriesName === "日前预测电价" ? "🔶" : "🟢";
          result += `${icon} ${param.seriesName}: <span style="font-weight:bold;color:${param.color}">${param.value} 元/MW</span><br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["日前预测电价", "实时预测电价"],
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
      name: "电价(元/MW)",
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
        name: "日前预测电价",
        type: "line",
        data: dayAheadData,
        smooth: true,
        lineStyle: {
          width: 3,
          color: dayAheadColor,
          shadowColor: "rgba(230, 162, 60, 0.5)",
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        symbol: "circle",
        symbolSize: 7,
        itemStyle: {
          color: dayAheadColor,
          borderWidth: 0,
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: "rgba(230, 162, 60, 0.8)",
          },
        },
        animationDuration: 2000,
        animationEasing: "cubicOut",
      },
      {
        name: "实时预测电价",
        type: "line",
        data: realTimeData,
        smooth: true,
        lineStyle: {
          width: 3,
          color: realTimeColor,
          shadowColor: "rgba(103, 194, 58, 0.5)",
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        symbol: "circle",
        symbolSize: 7,
        itemStyle: {
          color: realTimeColor,
          borderWidth: 0,
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: "rgba(103, 194, 58, 0.8)",
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

// 表头样式
const headerCellStyle = () => ({
  backgroundColor: "#f5f7fa",
  color: "#303133",
  fontWeight: "600",
  fontSize: "14px",
  borderColor: "#ebeef5",
  textAlign: "center",
});

// 单元格样式
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  const style = {
    borderColor: "#ebeef5",
    padding: "8px 4px",
    fontSize: "12px",
    textAlign: "center",
  };

  // 不同类型数据不同样式
  if (row.type === "dayAhead") {
    style.backgroundColor = "#fff7ed";
  } else if (row.type === "realTime") {
    style.backgroundColor = "#f0f9eb";
  }

  return style;
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
  console.log("组件挂载完成,props.chartData:", props.chartData);
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
.price-chart-container {
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
  .price-chart-section {
    margin-bottom: 32px;

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

        &.day-ahead {
          background: linear-gradient(90deg, #e6a23c, #f0c78a);
        }

        &.real-time {
          background: linear-gradient(90deg, #67c23a, #a4da89);
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

  // 表格区域
  .price-table-section {
    .hour-data {
      font-size: 11px;
      font-weight: 500;

      &.day-ahead-data {
        color: #e6a23c;
      }

      &.real-time-data {
        color: #67c23a;
      }

      &.time-label {
        color: #606266;
        font-weight: 600;
      }
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

    .price-chart-section {
      .chart-legend {
        justify-content: space-around;
        width: 100%;
      }
    }

    .price-table-section {
      :deep(.el-table) {
        font-size: 11px;

        .el-table__body-wrapper {
          overflow-x: auto;
        }
      }
    }
  }
}
</style>
