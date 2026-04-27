<template>
  <div class="price-analysis-chart" :style="{ height: chartHeight + 'px' }" ref="chartContainer"></div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  gdDayAhead: {
    type: Array,
    default: () => [],
  },
  gdRealTime: {
    type: Array,
    default: () => [],
  },
  nodeDayAhead: {
    type: Array,
    default: () => [],
  },
  nodeRealTime: {
    type: Array,
    default: () => [],
  },
  chartHeight: {
    type: Number,
    default: 400,
  },
});

const chartContainer = ref(null);
let chart = null;
const timeLabels = ref([]);

const generateTimeLabels = (count) => {
  const labels = [];
  for (let i = 0; i < count; i++) {
    const totalMinutes = i * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    labels.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    );
  }
  return labels;
};

const initChart = () => {
  if (!chartContainer.value) return;
  chart = echarts.init(chartContainer.value);
  updateChart();
  window.addEventListener("resize", handleWindowResize);
};

const updateChart = () => {
  if (!chart) return;

  const dataCount = props.gdDayAhead.length || 96;
  timeLabels.value = generateTimeLabels(dataCount);

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = `${params[0].name}<br/>`;
        params.forEach((item) => {
          const marker = item.marker || "";
          result += `${marker} ${item.seriesName}: ${Number(item.value).toFixed(2)} 元/MWh<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["广东省日前均价", "广东省实时均价", "所选节点日前均价", "所选节点实时均价"],
      top: 0,
      itemWidth: 20,
      itemHeight: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timeLabels.value,
      axisLabel: {
        fontSize: 11,
        interval: 3,
      },
    },
    yAxis: {
      type: "value",
      name: "元/MWh",
      axisLabel: {
        formatter: "{value}",
      },
    },
    series: [
      {
        name: "广东省日前均价",
        type: "line",
        data: props.gdDayAhead,
        smooth: true,
        lineStyle: {
          color: "#409eff",
          width: 2,
        },
        itemStyle: {
          color: "#409eff",
        },
        showSymbol: false,
      },
      {
        name: "广东省实时均价",
        type: "line",
        data: props.gdRealTime,
        smooth: true,
        lineStyle: {
          color: "#73c0de",
          width: 2,
          type: "dashed",
        },
        itemStyle: {
          color: "#73c0de",
        },
        showSymbol: false,
      },
      {
        name: "所选节点日前均价",
        type: "line",
        data: props.nodeDayAhead,
        smooth: true,
        lineStyle: {
          color: "#e6a23c",
          width: 2,
        },
        itemStyle: {
          color: "#e6a23c",
        },
        showSymbol: false,
      },
      {
        name: "所选节点实时均价",
        type: "line",
        data: props.nodeRealTime,
        smooth: true,
        lineStyle: {
          color: "#f56c6c",
          width: 2,
          type: "dashed",
        },
        itemStyle: {
          color: "#f56c6c",
        },
        showSymbol: false,
      },
    ],
  };

  chart.setOption(option);
};

const handleWindowResize = () => {
  if (chart) {
    chart.resize();
  }
};

const resize = () => {
  if (chart) {
    chart.resize();
  }
};

defineExpose({ resize });

watch(
  () => [
    props.gdDayAhead,
    props.gdRealTime,
    props.nodeDayAhead,
    props.nodeRealTime,
  ],
  () => {
    if (chart) {
      updateChart();
    }
  },
  { deep: true }
);

watch(
  () => props.chartHeight,
  () => {
    resize();
  }
);

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chart) {
    chart.dispose();
  }
  window.removeEventListener("resize", handleWindowResize);
});
</script>

<style scoped lang="scss">
.price-analysis-chart {
  width: 100%;
  min-height: 0;
  flex: 1;
}
</style>
