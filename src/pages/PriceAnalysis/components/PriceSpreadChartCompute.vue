<template>
  <div ref="chartRef" class="price-spread-chart" :style="{ height: chartHeight + 'px' }"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  dayAheadData: {
    type: Array,
    default: () => [],
  },
  realTimeData: {
    type: Array,
    default: () => [],
  },
  nodeName: {
    type: String,
    default: '',
  },
  chartHeight: {
    type: Number,
    default: 350,
  },
});

const chartRef = ref(null);
let chartInstance = null;

// 计算24个整点均值
const computeHourlyAverage = (data) => {
  const hourlyData = [];
  for (let i = 0; i < 24; i++) {
    let sum = 0;
    for (let j = 0; j < 4; j++) {
      const index = i * 4 + j;
      sum += data[index] || 0;
    }
    hourlyData.push(sum / 4);
  }
  return hourlyData;
};

// 计算价差
const computeSpread = (dayAheadData, realTimeData) => {
  const dayAheadHourly = computeHourlyAverage(dayAheadData);
  const realTimeHourly = computeHourlyAverage(realTimeData);
  return dayAheadHourly.map((dayAhead, index) => realTimeHourly[index] - dayAhead);
};

// 生成时间轴标签
const generateTimeLabels = () => {
  const labels = [];
  for (let i = 0; i < 24; i++) {
    labels.push(`第${i + 1}时`);
  }
  return labels;
};

const initChart = () => {
  if (!chartRef.value) return;

  // 销毁现有实例
  if (chartInstance) {
    chartInstance.dispose();
  }

  // 创建新实例
  chartInstance = echarts.init(chartRef.value);

  // 计算数据
  const spreadData = computeSpread(props.dayAheadData, props.realTimeData);
  const timeLabels = generateTimeLabels();

  // 计算平均价差
  const avgSpread = spreadData.reduce((sum, val) => sum + val, 0) / 24;

  // 配置选项
  const option = {
    title: {
      text: `${props.nodeName || '节点'} - 整点均值价差`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const spread = params[0].value;
        const direction = spread >= 0 ? '上涨' : '下跌';
        return `${params[0].name}<br/>${params[0].marker} 价差: ${spread.toFixed(2)} 元/MWh<br/>${direction} ${Math.abs(spread).toFixed(2)} 元/MWh`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '价差 (元/MWh)',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '价差',
        type: 'bar',
        data: spreadData,
        itemStyle: {
          color: function (params) {
            return params.value >= 0 ? '#409eff' : '#67c23a';
          },
        },
        label: {
          show: true,
          position: 'top',
          formatter: function(params) {
            return params.value.toFixed(2);
          },
          fontSize: 10,
        },
      },
      {
        name: '平均价差',
        type: 'line',
        data: Array(24).fill(avgSpread),
        symbol: 'none',
        lineStyle: {
          color: '#e6a23c',
          type: 'dashed',
          width: 1,
        },
        label: {
          show: true,
          position: 'end',
          formatter: `平均价差: ${avgSpread.toFixed(2)}`,
          fontSize: 10,
          color: '#e6a23c',
        },
      },
    ],
  };

  // 渲染图表
  chartInstance.setOption(option);

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
};

const handleResize = () => {
  chartInstance && chartInstance.resize();
};

// 监听数据变化
watch(
  [() => props.dayAheadData, () => props.realTimeData],
  () => {
    nextTick(() => {
      initChart();
    });
  },
  { deep: true }
);

// 监听图表高度变化
watch(
  () => props.chartHeight,
  () => {
    nextTick(() => {
      initChart();
    });
  }
);

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped lang="scss">
.price-spread-chart {
  width: 100%;
  height: 100%;
}
</style>