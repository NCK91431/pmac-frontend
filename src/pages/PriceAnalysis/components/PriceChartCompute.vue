<template>
  <div ref="chartRef" class="price-chart" :style="{ height: chartHeight + 'px' }"></div>
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

  // 计算整点均值
  const dayAheadHourly = computeHourlyAverage(props.dayAheadData);
  const realTimeHourly = computeHourlyAverage(props.realTimeData);
  const timeLabels = generateTimeLabels();

  // 计算均价
  const dayAheadAvg = dayAheadHourly.reduce((sum, val) => sum + val, 0) / 24;
  const realTimeAvg = realTimeHourly.reduce((sum, val) => sum + val, 0) / 24;

  // 配置选项
  const option = {
    title: {
      text: `${props.nodeName || '节点'} - 整点均值电价`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        let result = `${params[0].name}<br/>`;
        params.forEach((item) => {
          result += `${item.marker} ${item.seriesName}: ${item.value.toFixed(2)} 元/MWh<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['日前节点电价', '实时节点电价'],
      top: 30,
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
      name: '电价 (元/MWh)',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: [
      {
        name: '日前节点电价',
        type: 'line',
        data: dayAheadHourly,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#67c23a',
          width: 2,
        },
        itemStyle: {
          color: '#67c23a',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(103, 194, 58, 0.3)',
            },
            {
              offset: 1,
              color: 'rgba(103, 194, 58, 0.05)',
            },
          ]),
        },
      },
      {
        name: '实时节点电价',
        type: 'line',
        data: realTimeHourly,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#409eff',
          width: 2,
        },
        itemStyle: {
          color: '#409eff',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)',
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0.05)',
            },
          ]),
        },
      },
      {
        name: '日前均价',
        type: 'line',
        data: Array(24).fill(dayAheadAvg),
        symbol: 'none',
        lineStyle: {
          color: '#67c23a',
          type: 'dashed',
          width: 1,
        },
        label: {
          show: true,
          position: 'end',
          formatter: `日前均价: ${dayAheadAvg.toFixed(2)}`,
          fontSize: 10,
          color: '#67c23a',
        },
      },
      {
        name: '实时均价',
        type: 'line',
        data: Array(24).fill(realTimeAvg),
        symbol: 'none',
        lineStyle: {
          color: '#409eff',
          type: 'dashed',
          width: 1,
        },
        label: {
          show: true,
          position: 'end',
          formatter: `实时均价: ${realTimeAvg.toFixed(2)}`,
          fontSize: 10,
          color: '#409eff',
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
.price-chart {
  width: 100%;
  height: 100%;
}
</style>