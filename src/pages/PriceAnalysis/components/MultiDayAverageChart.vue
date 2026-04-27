<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">
        <i class="bi bi-graph-up"></i> 每日均价对比图
      </span>
    </div>
    <div ref="averageChartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
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

const averageChartRef = ref(null);
let averageChart = null;

const generateDailyAverageData = () => {
  const dates = [];
  const dayAheadAvgData = [];
  const realTimeAvgData = [];

  if (!props.priceData || props.priceData.length === 0) {
    return { dates, dayAheadAvgData, realTimeAvgData };
  }

  props.priceData.forEach((dayData) => {
    dates.push(dayData.date);
    const daAvg =
      dayData.dayAheadData.length > 0
        ? dayData.dayAheadData.reduce((a, b) => a + b, 0) /
          dayData.dayAheadData.length
        : 0;
    const rtAvg =
      dayData.realTimeData.length > 0
        ? dayData.realTimeData.reduce((a, b) => a + b, 0) /
          dayData.realTimeData.length
        : 0;
    dayAheadAvgData.push(parseFloat(daAvg.toFixed(2)));
    realTimeAvgData.push(parseFloat(rtAvg.toFixed(2)));
  });

  return { dates, dayAheadAvgData, realTimeAvgData };
};

const findMaxMinPoints = (data, dates) => {
  if (data.length === 0) return { max: null, min: null };
  let maxIdx = 0;
  let minIdx = 0;
  data.forEach((val, idx) => {
    if (val > data[maxIdx]) maxIdx = idx;
    if (val < data[minIdx]) minIdx = idx;
  });
  return {
    max: { value: data[maxIdx], coord: [dates[maxIdx], data[maxIdx]] },
    min: { value: data[minIdx], coord: [dates[minIdx], data[minIdx]] },
  };
};

function renderAverageChart() {
  if (!averageChartRef.value) return;

  if (!averageChart) {
    averageChart = echarts.init(averageChartRef.value);
  }

  const { dates, dayAheadAvgData, realTimeAvgData } =
    generateDailyAverageData();

  const daPoints = findMaxMinPoints(dayAheadAvgData, dates);
  const rtPoints = findMaxMinPoints(realTimeAvgData, dates);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    legend: {
      data: ["日前均价", "实时均价"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "8%",
      top: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        rotate: 30,
      },
    },
    yAxis: {
      type: "value",
      name: "电价 (元/MWh)",
    },
    series: [
      {
        name: "日前均价",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: "#409eff",
        },
        itemStyle: {
          color: "#409eff",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(64, 158, 255, 0.15)" },
            { offset: 1, color: "rgba(64, 158, 255, 0.02)" },
          ]),
        },
        data: dayAheadAvgData,
        markPoint: {
          data: [
            {
              name: "最高",
              type: "max",
              symbol: "pin",
              symbolSize: 40,
              label: {
                formatter: (p) => `${p.value.toFixed(2)}`,
                fontSize: 10,
              },
            },
            {
              name: "最低",
              type: "min",
              symbol: "pin",
              symbolSize: 40,
              label: {
                formatter: (p) => `${p.value.toFixed(2)}`,
                fontSize: 10,
              },
            },
          ],
        },
      },
      {
        name: "实时均价",
        type: "line",
        smooth: true,
        symbol: "diamond",
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: "#67c23a",
        },
        itemStyle: {
          color: "#67c23a",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(103, 194, 58, 0.15)" },
            { offset: 1, color: "rgba(103, 194, 58, 0.02)" },
          ]),
        },
        data: realTimeAvgData,
        markPoint: {
          data: [
            {
              name: "最高",
              type: "max",
              symbol: "pin",
              symbolSize: 40,
              label: {
                formatter: (p) => `${p.value.toFixed(2)}`,
                fontSize: 10,
              },
            },
            {
              name: "最低",
              type: "min",
              symbol: "pin",
              symbolSize: 40,
              label: {
                formatter: (p) => `${p.value.toFixed(2)}`,
                fontSize: 10,
              },
            },
          ],
        },
      },
    ],
  };

  averageChart.setOption(option, true);
}

const handleResize = () => {
  averageChart?.resize();
};

watch(
  [() => props.dateRange, () => props.priceData],
  () => {
    nextTick(() => {
      renderAverageChart();
    });
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    renderAverageChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  averageChart?.dispose();
});

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
