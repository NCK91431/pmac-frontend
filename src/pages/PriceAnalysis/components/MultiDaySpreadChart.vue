<template>
  <div class="chart-card">
    <div class="chart-header">
      <span class="chart-title">
        <i class="bi bi-arrow-left-right"></i> 价差图（实时 - 日前）
      </span>
    </div>
    <div ref="spreadChartRef" class="chart-container"></div>
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

const spreadChartRef = ref(null);
let spreadChart = null;

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

// 生成价差数据
const generateSpreadData = () => {
  const spreadData = [];

  if (!props.priceData || props.priceData.length === 0) {
    return spreadData;
  }

  props.priceData.forEach((dayData) => {
    for (let i = 0; i < 96; i++) {
      const dayAheadValue = dayData.dayAheadData[i] || 0;
      const realTimeValue = dayData.realTimeData[i] || 0;
      spreadData.push({
        value: realTimeValue - dayAheadValue,
        itemStyle: {
          color: realTimeValue - dayAheadValue >= 0 ? "#67c23a" : "#409eff",
        },
      });
    }
  });

  return spreadData;
};

function renderSpreadChart() {
  if (!spreadChartRef.value) return;

  if (!spreadChart) {
    spreadChart = echarts.init(spreadChartRef.value);
  }

  const timeLabels = generateTimeLabels();
  const spreadData = generateSpreadData();

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        const val =
          params[0].value.value !== undefined
            ? params[0].value.value
            : params[0].value;
        const displayVal = typeof val === "number" ? val.toFixed(2) : val;
        const color =
          typeof val === "number" && val >= 0 ? "#67c23a" : "#409eff";
        return `
          <div>${params[0].axisValue}</div>
          <div style="display:flex;align-items:center;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${params[0].color};margin-right:6px;"></span>
            <span>价差: <b style="color:${color}">${displayVal}</b> 元/MWh</span>
          </div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "8%",
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
      },
    },
    yAxis: {
      type: "value",
      name: "价差 (元/MWh)",
    },
    series: [
      {
        name: "价差",
        type: "bar",
        barWidth: "60%",
        data: spreadData,
      },
    ],
  };

  spreadChart.setOption(option, true);
}

const handleResize = () => {
  spreadChart?.resize();
};

watch(
  [() => props.dateRange, () => props.priceData],
  () => {
    nextTick(() => {
      renderSpreadChart();
    });
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  nextTick(() => {
    renderSpreadChart();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  spreadChart?.dispose();
});

// 暴露resize方法给父组件
defineExpose({
  resize: handleResize
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
