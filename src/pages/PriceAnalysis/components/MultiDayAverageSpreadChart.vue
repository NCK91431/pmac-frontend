<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">
        <i class="bi bi-arrow-left-right"></i> 每日均价价差图
      </span>
    </div>
    <div ref="averageSpreadChartRef" class="chart-container"></div>
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

const averageSpreadChartRef = ref(null);
let averageSpreadChart = null;

const generateDailySpreadData = () => {
  const dates = [];
  const spreadData = [];

  if (!props.priceData || props.priceData.length === 0) {
    return { dates, spreadData };
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
    const spread = parseFloat((rtAvg - daAvg).toFixed(2));
    spreadData.push({
      value: spread,
      itemStyle: {
        color: spread >= 0 ? "#67c23a" : "#409eff",
      },
    });
  });

  return { dates, spreadData };
};

function renderAverageSpreadChart() {
  if (!averageSpreadChartRef.value) return;

  if (!averageSpreadChart) {
    averageSpreadChart = echarts.init(averageSpreadChartRef.value);
  }

  const { dates, spreadData } = generateDailySpreadData();

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
          type: "dashed",
          width: 1,
        },
        label: {
          backgroundColor: "#6a7985",
        },
      },
      formatter: (params) => {
        const val = params[0].value;
        const color = val >= 0 ? "#67c23a" : "#409eff";
        return `
          <div>${params[0].axisValue}</div>
          <div style="display:flex;align-items:center;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>
            <span>价差: <b style="color:${color}">${val.toFixed(2)}</b> 元/MWh</span>
          </div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "8%",
      top: "8%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        rotate: 30,
      },
      axisPointer: {
        show: true,
        type: "shadow",
      },
    },
    yAxis: {
      type: "value",
      name: "价差 (元/MWh)",
      axisPointer: {
        show: true,
        type: "line",
      },
    },
    series: [
      {
        name: "均价价差",
        type: "bar",
        barWidth: "50%",
        data: spreadData,
        label: {
          show: true,
          position: "top",
          formatter: (p) => `${p.value.toFixed(2)}`,
          fontSize: 11,
          color: "#606266",
        },
      },
    ],
  };

  averageSpreadChart.setOption(option, true);
}

const handleResize = () => {
  averageSpreadChart?.resize();
};

watch(
  [() => props.dateRange, () => props.priceData],
  () => {
    nextTick(() => {
      renderAverageSpreadChart();
    });
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    renderAverageSpreadChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  averageSpreadChart?.dispose();
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
