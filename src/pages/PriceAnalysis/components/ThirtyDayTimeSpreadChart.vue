<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">
        <i class="bi bi-graph-up"></i> 连续30天分时价差均值对比图
      </span>
    </div>
    <div ref="timeSpreadChartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  timeSpreadData: {
    type: Array,
    default: () => [],
  },
});

const timeSpreadChartRef = ref(null);
let timeSpreadChart = null;

const findMaxMinPoints = (data) => {
  if (data.length === 0) return { max: null, min: null };
  let maxIdx = 0;
  let minIdx = 0;
  data.forEach((val, idx) => {
    if (val.spreadAvg > data[maxIdx].spreadAvg) maxIdx = idx;
    if (val.spreadAvg < data[minIdx].spreadAvg) minIdx = idx;
  });
  return {
    max: {
      value: data[maxIdx].spreadAvg,
      coord: [data[maxIdx].time, data[maxIdx].spreadAvg],
    },
    min: {
      value: data[minIdx].spreadAvg,
      coord: [data[minIdx].time, data[minIdx].spreadAvg],
    },
  };
};

function renderChart() {
  if (!timeSpreadChartRef.value) return;

  if (!timeSpreadChart) {
    timeSpreadChart = echarts.init(timeSpreadChartRef.value);
  }

  const times = props.timeSpreadData.map((d) => d.time);
  const values = props.timeSpreadData.map((d) => d.spreadAvg);
  const points = findMaxMinPoints(props.timeSpreadData);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        const val = params[0].value;
        const color = val >= 0 ? "#67c23a" : "#409eff";
        return `
          <div>${params[0].axisValue}</div>
          <div style="display:flex;align-items:center;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params[0].color};margin-right:6px;"></span>
            <span>价差均值: <b style="color:${color}">${val.toFixed(2)}</b> 元/MWh</span>
          </div>
        `;
      },
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
      data: times,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: "value",
      name: "价差均值 (元/MWh)",
    },
    series: [
      {
        name: "分时价差均值",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          color: (params) => {
            return params.value >= 0 ? "#67c23a" : "#409eff";
          },
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(103, 194, 58, 0.2)" },
            { offset: 0.5, color: "rgba(64, 158, 255, 0.1)" },
            { offset: 1, color: "rgba(64, 158, 255, 0.02)" },
          ]),
        },
        data: values,
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
        markLine: {
          silent: true,
          label: {
            fontSize: 10,
          },
          data: [
            {
              type: "average",
              name: "均值",
              label: {
                formatter: (p) => `均值: ${p.value.toFixed(2)}`,
              },
            },
          ],
        },
      },
    ],
  };

  timeSpreadChart.setOption(option, true);
}

const handleResize = () => {
  timeSpreadChart?.resize();
};

watch(
  () => props.timeSpreadData,
  () => {
    nextTick(() => {
      renderChart();
    });
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    renderChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  timeSpreadChart?.dispose();
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
