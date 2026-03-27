<template>
  <div ref="chartRef" class="price-spread-chart"></div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  computed,
} from "vue";
import * as echarts from "echarts";

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
    default: "",
  },
  timeType: {
    type: String,
    default: "minute",
  },
  chartHeight: {
    type: Number,
    default: 350,
  },
});

const chartRef = ref(null);
let chartInstance = null;

const showHourlyOnly = computed(() => props.timeType === "hour");

const generateTimeAxis = (hourlyOnly = false) => {
  const length = hourlyOnly ? 24 : 96;
  const timeAxis = Array.from({ length }, (_, i) => {
    let hour, minute;
    if (hourlyOnly) {
      hour = i;
      minute = 0;
    } else {
      hour = Math.floor(i / 4);
      minute = (i % 4) * 15;
    }
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });
  return timeAxis;
};

const calculateSpreadData = (hourlyOnly = false) => {
  const spreadData = [];
  const length = hourlyOnly ? 24 : 96;
  for (let i = 0; i < length; i++) {
    const dataIndex = hourlyOnly ? i * 4 : i;
    const realTime = props.realTimeData[dataIndex] || 0;
    const dayAhead = props.dayAheadData[dataIndex] || 0;
    spreadData.push(realTime - dayAhead);
  }
  return spreadData;
};

const findExtremePoints = (data) => {
  if (!data || data.length === 0) return { max: null, min: null };

  let maxIndex = 0;
  let minIndex = 0;
  let maxValue = data[0];
  let minValue = data[0];

  data.forEach((value, index) => {
    if (value > maxValue) {
      maxValue = value;
      maxIndex = index;
    }
    if (value < minValue) {
      minValue = value;
      minIndex = index;
    }
  });

  return {
    max: { index: maxIndex, value: maxValue },
    min: { index: minIndex, value: minValue },
  };
};

const isHourlyPoint = (index, hourlyOnly) => {
  return hourlyOnly ? true : index % 4 === 0;
};

const initChart = () => {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartRef.value);

  const timeAxis = generateTimeAxis(showHourlyOnly.value);
  const spreadData = calculateSpreadData(showHourlyOnly.value);
  const spreadExtremes = findExtremePoints(spreadData);

  const option = {
    title: {
      text: "价差 = 实时电价 - 日前电价",
      left: "center",
      textStyle: {
        fontSize: 14,
        fontWeight: 500,
        color: "#303133",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#999",
        },
      },
      formatter: (params) => {
        let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`;
        const spread = params[0].value;
        const color = spread >= 0 ? "#67c23a" : "#409eff";
        result += `
            <div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
              <span>价差: </span>
              <span style="font-weight: bold; margin-left: 8px; color: ${color};">${spread.toFixed(2)}</span>
              <span style="margin-left: 4px;">元/MWh</span>
            </div>
          `;
        return result;
      },
    },
    grid: {
      left: "3%",
      right: "10%",
      top: "15%",
      bottom: "12%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: true,
      data: timeAxis,
      axisLabel: {
        color: "#606266",
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#dcdfe6",
        },
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      name: "价差 (元/MWh)",
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
        lineStyle: {
          color: "#dcdfe6",
        },
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#e0e0e0",
        },
      },
    },
    series: [
      {
        name: "价差",
        type: "bar",
        barWidth: showHourlyOnly.value ? "70%" : "60%",
        itemStyle: {
          color: (params) => {
            return params.data >= 0 ? "#67c23a" : "#409eff";
          },
          borderRadius: [2, 2, 0, 0],
        },
        data: spreadData.map((value, index) => {
          const dataItem = {
            value: value,
            label: {
              show: isHourlyPoint(index, showHourlyOnly.value),
              position: value >= 0 ? "top" : "bottom",
              formatter: value.toFixed(2),
              fontSize: 10,
              color: value >= 0 ? "#67c23a" : "#409eff",
            },
            itemStyle: {
              color: value >= 0 ? "#67c23a" : "#409eff",
            },
          };
          return dataItem;
        }),
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: {
            type: "solid",
            width: 2,
            color: "#909399",
          },
          data: [
            {
              yAxis: 0,
              name: "零轴",
            },
          ],
        },
        markPoint: {
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: (params) => {
              return params.data.value >= 0 ? "#67c23a" : "#409eff";
            },
            borderWidth: 0,
          },
          label: {
            formatter: (params) => {
              const icon = "←";
              const value = params.data.value.toFixed(2);
              return `${icon}价差${params.data.name} ${value}`;
            },
            color: (params) => {
              return params.data.value >= 0 ? "#67c23a" : "#409eff";
            },
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: [2, 4],
            position: (params) =>
              params.data.name === "最高" ? "top" : "bottom",
          },
          data: [
            ...(spreadExtremes.max
              ? [
                  {
                    name: "最高",
                    coord: [spreadExtremes.max.index, spreadExtremes.max.value],
                    value: spreadExtremes.max.value,
                  },
                ]
              : []),
            ...(spreadExtremes.min
              ? [
                  {
                    name: "最低",
                    coord: [spreadExtremes.min.index, spreadExtremes.min.value],
                    value: spreadExtremes.min.value,
                  },
                ]
              : []),
          ],
        },
      },
    ],
  };

  chartInstance.setOption(option, true);
};

watch(
  () => [props.dayAheadData, props.realTimeData, props.timeType],
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

// 暴露resize方法给父组件
defineExpose({
  resize: handleResize,
});
</script>

<style scoped lang="scss">
.price-spread-chart {
  width: 100%;
  height: 100%;
  min-height: v-bind(chartHeight + "px");
}
</style>
