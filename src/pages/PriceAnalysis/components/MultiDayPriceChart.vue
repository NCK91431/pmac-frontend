<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">
        <i class="bi bi-graph-up"></i> 实时 & 日前电价对比
      </span>
    </div>
    <div ref="priceChartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import * as echarts from "echarts";

const props = defineProps({
  dateRange: {
    type: Array,
    default: () => [],
  },
  priceData: {
    type: Array,
    default: () => [],
  },
});

const priceChartRef = ref(null);
let priceChart = null;

// 生成所有时间点的标签
const generateTimeLabels = () => {
  const labels = [];
  if (!props.priceData || props.priceData.length === 0) return labels;

  props.priceData.forEach((dayData) => {
    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      labels.push(`${dayData.date} ${timeStr}`);
    }
  });

  return labels;
};

// 查找每天数据的最高点
const findDailyMaxPoints = () => {
  const dayAheadMaxPoints = [];
  const realTimeMaxPoints = [];
  let dataIndex = 0;

  if (!props.priceData || props.priceData.length === 0) {
    return { dayAheadMaxPoints, realTimeMaxPoints };
  }

  props.priceData.forEach((dayData) => {
    // 查找日前电价的最高点
    let dayAheadMax = { value: -Infinity, index: 0 };
    dayData.dayAheadData.forEach((value, index) => {
      if (value > dayAheadMax.value) {
        dayAheadMax = { value, index: dataIndex + index };
      }
    });
    dayAheadMaxPoints.push(dayAheadMax);

    // 查找实时电价的最高点
    let realTimeMax = { value: -Infinity, index: 0 };
    dayData.realTimeData.forEach((value, index) => {
      if (value > realTimeMax.value) {
        realTimeMax = { value, index: dataIndex + index };
      }
    });
    realTimeMaxPoints.push(realTimeMax);

    dataIndex += 96; // 每天96个数据点
  });

  return { dayAheadMaxPoints, realTimeMaxPoints };
};

// 生成图表数据
const generateChartData = () => {
  const dayAheadData = [];
  const realTimeData = [];

  if (!props.priceData || props.priceData.length === 0) {
    return { dayAheadData, realTimeData };
  }

  props.priceData.forEach((dayData) => {
    dayAheadData.push(...dayData.dayAheadData);
    realTimeData.push(...dayData.realTimeData);
  });

  return { dayAheadData, realTimeData };
};

function renderPriceChart() {
  if (!priceChartRef.value) return;

  if (!priceChart) {
    priceChart = echarts.init(priceChartRef.value);
  }

  const timeLabels = generateTimeLabels();
  const { dayAheadData, realTimeData } = generateChartData();
  const { dayAheadMaxPoints, realTimeMaxPoints } = findDailyMaxPoints();

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        let res = `<div>${params[0].axisValue}</div>`;
        params.forEach((p) => {
          res += `<div style="display:flex;align-items:center;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px;"></span>
            <span>${p.seriesName}: <b>${p.value.toFixed(2)}</b> 元/MWh</span>
          </div>`;
        });
        return res;
      },
    },
    legend: {
      data: ["日前电价", "实时电价"],
      top: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "12%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 100,
      },
    ],
    xAxis: {
      type: "category",
      data: timeLabels,
      axisLabel: {
        rotate: 60,
        interval: Math.floor(timeLabels.length / 6),
        formatter: (value) => {
          return value;
        },
      },
    },
    yAxis: {
      type: "value",
      name: "电价 (元/MWh)",
    },
    series: [
      {
        name: "日前电价",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 2,
          color: "#409eff",
        },
        itemStyle: {
          color: "#409eff",
        },
        data: dayAheadData,
        markPoint: {
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: "#409eff",
            borderWidth: 0,
          },
          label: {
            formatter: (params) => {
              return `${params.data.value.toFixed(2)}`;
            },
            color: "#409eff",
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: [2, 4],
            position: "top",
          },
          data: dayAheadMaxPoints.map((point) => ({
            name: "最高",
            coord: [point.index, point.value],
            value: point.value,
          })),
        },
      },
      {
        name: "实时电价",
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 2,
          color: "#67c23a",
        },
        itemStyle: {
          color: "#67c23a",
        },
        data: realTimeData,
        markPoint: {
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: "#67c23a",
            borderWidth: 0,
          },
          label: {
            formatter: (params) => {
              return `${params.data.value.toFixed(2)}`;
            },
            color: "#67c23a",
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: [2, 4],
            position: "top",
          },
          data: realTimeMaxPoints.map((point) => ({
            name: "最高",
            coord: [point.index, point.value],
            value: point.value,
          })),
        },
      },
    ],
  };

  priceChart.setOption(option, true);
}

const handleResize = () => {
  priceChart?.resize();
};

watch(
  [() => props.dateRange, () => props.priceData],
  () => {
    nextTick(() => {
      renderPriceChart();
    });
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    renderPriceChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  priceChart?.dispose();
});

// 暴露resize方法给父组件
defineExpose({
  resize: handleResize,
});
</script>

<style scoped lang="scss">
.chart-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .chart-title {
      font-weight: 600;
      color: #2c3e50;
      i {
        margin-right: 6px;
        color: #409eff;
      }
    }
  }

  .chart-container {
    width: 100%;
    height: 350px;
  }
}
</style>
