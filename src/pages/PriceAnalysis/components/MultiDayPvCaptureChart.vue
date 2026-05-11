<template>
  <div class="multi-day-pv-chart">
    <div ref="chartRef" class="chart-content"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  dailyData: {
    type: Array,
    default: () => [],
  },
});

const chartRef = ref(null);
let chartInstance = null;

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const initChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const xAxisData = props.dailyData.map((item) => formatDate(item.date));
  const dayAheadData = props.dailyData.map((item) => item.dayAheadCaptureAvg);
  const realTimeData = props.dailyData.map((item) => item.realTimeCaptureAvg);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' },
      },
      formatter: (params) => {
        let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
        params.forEach((param) => {
          const color = param.color;
          result += `
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
              <span>${param.seriesName}: </span>
              <span style="font-weight: bold; margin-left: 8px;">${param.value.toFixed(2)} 元/MWh</span>
            </div>
          `;
        });
        return result;
      },
    },
    legend: {
      data: ['日前捕获均价', '实时捕获均价'],
      bottom: '2%',
      icon: 'circle',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: '#606266',
        fontSize: 12,
        rotate: xAxisData.length > 10 ? 45 : 0,
      },
      axisLine: {
        lineStyle: { color: '#dcdfe6' },
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: '元/MWh',
      nameTextStyle: {
        fontSize: 12,
        color: '#606266',
      },
      axisLabel: {
        color: '#606266',
        fontSize: 12,
        formatter: '{value}',
      },
      axisLine: {
        show: true,
        lineStyle: { color: '#dcdfe6' },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e0e0e0',
        },
      },
    },
    series: [
      {
        name: '日前捕获均价',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#0D9488',
        },
        itemStyle: {
          color: '#0D9488',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(13, 148, 136, 0.2)' },
            { offset: 1, color: 'rgba(13, 148, 136, 0.05)' },
          ]),
        },
        data: dayAheadData,
      },
      {
        name: '实时捕获均价',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#D97706',
        },
        itemStyle: {
          color: '#D97706',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(217, 119, 6, 0.2)' },
            { offset: 1, color: 'rgba(217, 119, 6, 0.05)' },
          ]),
        },
        data: realTimeData,
      },
    ],
  };

  chartInstance.setOption(option);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

watch(
  () => props.dailyData,
  () => {
    nextTick(() => {
      initChart();
    });
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

defineExpose({
  resize: handleResize,
});
</script>

<style scoped lang="scss">
.multi-day-pv-chart {
  width: 100%;
  height: 100%;
  min-height: 350px;

  .chart-content {
    width: 100%;
    height: 100%;
  }
}
</style>