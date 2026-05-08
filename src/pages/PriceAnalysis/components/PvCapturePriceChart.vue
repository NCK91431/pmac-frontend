<template>
  <div class="pv-capture-chart-container">
    <!-- 顶部信息栏 -->
    <div class="chart-info">
      <span class="selected-node">
        <i class="bi bi-node-plus"></i> 当前节点：{{ nodeName }}
      </span>
      <div class="date-info" v-if="dateValue">
        <div class="selected-date-display">
          <i class="bi bi-calendar-event me-1"></i>
          {{ dateValue }}
        </div>
        <div class="weekday">
          <i class="bi bi-calendar-week me-1"></i>
          {{ weekday }}
        </div>
        <div class="date-type" :class="dateType">
          <i
            class="me-1"
            :class="
              dateType === 'weekend' ? 'bi-emoji-sunglasses' : 'bi-briefcase'
            "
          ></i>
          {{ dateType === "weekend" ? "周末" : "工作日" }}
        </div>
      </div>
    </div>

    <!-- 指标卡片行 -->
    <div class="metric-cards">
      <div class="metric-card da-capture">
        <div class="card-header">
          <i class="bi bi-graph-up-arrow"></i>
          <span>日前捕获均价</span>
        </div>
        <div class="card-value">{{ formatPrice(dayAheadCaptureAvg) }}</div>
      </div>
      <div class="metric-card rt-capture">
        <div class="card-header">
          <i class="bi bi-graph-down-arrow"></i>
          <span>实时捕获均价</span>
        </div>
        <div class="card-value">{{ formatPrice(realTimeCaptureAvg) }}</div>
      </div>
      <div class="metric-card da-original">
        <div class="card-header">
          <i class="bi bi-calendar-check-fill"></i>
          <span>日前原始均价</span>
        </div>
        <div class="card-value">{{ formatPrice(dayAheadOriginalAvg) }}</div>
      </div>
      <div class="metric-card rt-original">
        <div class="card-header">
          <i class="bi bi-lightning-charge-fill"></i>
          <span>实时原始均价</span>
        </div>
        <div class="card-value">{{ formatPrice(realTimeOriginalAvg) }}</div>
      </div>
      <div class="metric-card spread">
        <div class="card-header">
          <i class="bi bi-arrow-left-right"></i>
          <span>捕获价差</span>
        </div>
        <div class="card-value" :class="spreadClass">
          {{ formatPrice(captureSpread) }}
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="chart-subtitle">加权贡献值，各时点求和即捕获均价</div>
    <div
      ref="chartRef"
      class="pv-capture-chart"
      :style="{ minHeight: chartHeight + 'px' }"
    ></div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import * as echarts from "echarts";

const props = defineProps({
  dayAheadCaptureData: {
    type: Array,
    default: () => [],
  },
  realTimeCaptureData: {
    type: Array,
    default: () => [],
  },
  dayAheadOriginalData: {
    type: Array,
    default: () => [],
  },
  realTimeOriginalData: {
    type: Array,
    default: () => [],
  },
  irradianceData: {
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
  dayAheadCaptureAvg: {
    type: Number,
    default: 0,
  },
  realTimeCaptureAvg: {
    type: Number,
    default: 0,
  },
  dateValue: {
    type: String,
    default: "",
  },
  weekday: {
    type: String,
    default: "",
  },
  dateType: {
    type: String,
    default: "weekday",
  },
  timeType: {
    type: String,
    default: "minute",
  },
});

const chartRef = ref(null);
let chartInstance = null;

const generateTimeAxis = (timeType) => {
  const count = timeType === "compute" ? 24 : 96;
  return Array.from({ length: count }, (_, i) => {
    if (timeType === "compute") {
      return `第${i + 1}时`;
    }
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });
};

const dayAheadOriginalAvg = computed(() => {
  const data = props.dayAheadOriginalData;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
});

const realTimeOriginalAvg = computed(() => {
  const data = props.realTimeOriginalData;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
});

const captureSpread = computed(() => {
  return props.dayAheadCaptureAvg - props.realTimeCaptureAvg;
});

const spreadClass = computed(() => {
  const val = captureSpread.value;
  if (val > 0) return "spread-positive";
  if (val < 0) return "spread-negative";
  return "spread-zero";
});

const formatPrice = (price) => {
  return typeof price === "number" ? price.toFixed(2) : "0.00";
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const timeAxis = generateTimeAxis(props.timeType);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: { color: "#999" },
      },
      formatter: (params) => {
        let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
        params.forEach((param) => {
          const color = param.color;
          const note =
            param.seriesName === "归一化辐照度" ? "" : "（加权贡献值）";
          result += `
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
              <span>${param.seriesName}: </span>
              <span style="font-weight: bold; margin-left: 8px;">${typeof param.value === "number" ? param.value.toFixed(4) : param.value}</span>
              <span style="margin-left: 4px;">${note}</span>
            </div>
          `;
        });
        result += `<div style="margin-top: 4px; font-size: 11px; color: #999;">* 加权贡献值=辐照度×电价，各点求和即捕获均价</div>`;
        return result;
      },
    },
    legend: {
      data: ["DA加权贡献值", "RT加权贡献值", "归一化辐照度"],
      bottom: "2%",
      icon: "circle",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: "3%",
      right: "10%",
      bottom: "10%",
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
        lineStyle: { color: "#dcdfe6" },
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "元/MWh",
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
          lineStyle: { color: "#dcdfe6" },
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#e0e0e0",
          },
        },
      },
      {
        type: "value",
        name: "辐照度",
        nameTextStyle: {
          fontSize: 12,
          color: "#9ca3af",
        },
        axisLabel: {
          color: "#9ca3af",
          fontSize: 12,
          formatter: "{value}",
        },
        axisLine: {
          show: true,
          lineStyle: { color: "#d1d5db" },
        },
        splitLine: {
          show: false,
        },
        min: 0,
        max: 1,
      },
    ],
    series: [
      {
        name: "DA加权贡献值",
        type: "line",
        step: "middle",
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: "#0D9488",
        },
        itemStyle: {
          color: "#0D9488",
        },
        data: props.dayAheadCaptureData,
      },
      {
        name: "RT加权贡献值",
        type: "line",
        step: "middle",
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: "#D97706",
        },
        itemStyle: {
          color: "#D97706",
        },
        data: props.realTimeCaptureData,
      },
      {
        name: "归一化辐照度",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          type: "dashed",
          color: "#9ca3af",
        },
        itemStyle: {
          color: "#9ca3af",
        },
        yAxisIndex: 1,
        data: props.irradianceData,
      },
    ],
  };

  chartInstance.setOption(option);
};

watch(
  () => [
    props.dayAheadCaptureData,
    props.realTimeCaptureData,
    props.irradianceData,
    props.timeType,
  ],
  () => {
    nextTick(() => {
      if (chartInstance) {
        initChart();
      }
    });
  },
  { deep: true },
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

defineExpose({
  resize: handleResize,
});
</script>

<style scoped lang="scss">
.pv-capture-chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .chart-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .selected-node {
      background: #f0f7ff;
      padding: 8px 16px;
      border-radius: 20px;
      color: #409eff;
      font-weight: 500;
      font-size: 14px;
      i {
        margin-right: 6px;
      }
    }

    .date-info {
      display: flex;
      gap: 8px;
      text-align: center;
      transform: scale(0.8);
      transform-origin: right center;

      .selected-date-display,
      .weekday,
      .date-type {
        display: flex;
        align-items: center;
        min-height: 30px;
        font-size: 16px;
      }

      .selected-date-display {
        color: #1890ff;
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 600;
        background-color: rgba(24, 144, 255, 0.1);
        border: 1px solid rgba(24, 144, 255, 0.2);
      }

      .weekday {
        padding: 3px 10px;
        background: rgba(44, 111, 187, 0.1);
        border-radius: 4px;
        color: #2c6fbb;
        font-weight: 500;
        border: 1px solid rgba(44, 111, 187, 0.2);
      }

      .date-type {
        padding: 3px 10px;
        border-radius: 4px;
        font-weight: 500;

        &.weekday {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.2);
        }

        &.weekend {
          background: rgba(156, 39, 176, 0.1);
          color: #9c27b0;
          border: 1px solid rgba(156, 39, 176, 0.2);
        }
      }
    }
  }

  .metric-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 12px;

    .metric-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .card-header {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;

        i {
          font-size: 16px;
        }
      }

      .card-value {
        font-size: 22px;
        font-weight: 700;
        color: #303133;

        &.spread-positive {
          color: #c026d3;
        }

        &.spread-negative {
          color: #f9a8d4;
        }

        &.spread-zero {
          color: #909399;
        }
      }

      &.da-capture {
        .card-header i {
          color: #0d9488;
        }
        .card-value {
          color: #0d9488;
        }
      }

      &.rt-capture {
        .card-header i {
          color: #d97706;
        }
        .card-value {
          color: #d97706;
        }
      }

      &.da-original {
        .card-header i {
          color: #409eff;
        }
        .card-value {
          color: #409eff;
        }
      }

      &.rt-original {
        .card-header i {
          color: #67c23a;
        }
        .card-value {
          color: #67c23a;
        }
      }

      &.spread {
        .card-header i {
          color: #606266;
        }
      }
    }
  }

  .chart-subtitle {
    font-size: 12px;
    color: #909399;
    text-align: center;
    margin-bottom: 8px;
  }

  .pv-capture-chart {
    width: 100%;
    flex: 1;
    min-height: v-bind(chartHeight + "px");
  }
}
</style>
