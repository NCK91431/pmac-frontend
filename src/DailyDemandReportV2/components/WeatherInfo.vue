<template>
  <div class="weather-info-container">
    <!-- 天气统计信息 -->
    <div class="weather-summary-section">
      <div class="section-header">
        <h4>📋 天气统计信息</h4>
      </div>
      <div class="summary-grid">
        <!-- 温度范围 -->
        <div class="summary-card">
          <div class="summary-content">
            <div class="summary-header">
              <el-icon class="summary-label-icon"><Sunny /></el-icon>
              <div class="summary-label">温度范围</div>
            </div>
            <div class="summary-value">
              {{ formatNumber(weatherSummary.temperatureMin) }}°C -
              {{ formatNumber(weatherSummary.temperatureMax) }}°C
            </div>
          </div>
        </div>

        <!-- 天气状况 -->
        <div class="summary-card">
          <div class="summary-content">
            <div class="summary-header">
              <el-icon class="summary-label-icon"><PartlyCloudy /></el-icon>
              <div class="summary-label">天气状况</div>
            </div>
            <div class="summary-value-with-icon">
              <el-icon class="weather-status-icon">
                <component :is="getWeatherIcon(weatherSummary.weather)" />
              </el-icon>
              <span class="summary-value-text">{{
                weatherSummary.weather || "—"
              }}</span>
            </div>
          </div>
        </div>

        <!-- 云量情况 -->
        <div class="summary-card">
          <div class="summary-content">
            <div class="summary-header">
              <el-icon class="summary-label-icon"><Cloudy /></el-icon>
              <div class="summary-label">云量情况</div>
            </div>
            <div class="summary-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">凌晨</span>
                  <span class="detail-value"
                    >{{ weatherSummary.cloudCoverEarlyMorning || "—" }}%</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">上午</span>
                  <span class="detail-value"
                    >{{ weatherSummary.cloudCoverMorning || "—" }}%</span
                  >
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">下午</span>
                  <span class="detail-value"
                    >{{ weatherSummary.cloudCoverAfternoon || "—" }}%</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">晚上</span>
                  <span class="detail-value"
                    >{{ weatherSummary.cloudCoverEvening || "—" }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 风力风向 -->
        <div class="summary-card">
          <div class="summary-content">
            <div class="summary-header">
              <el-icon class="summary-label-icon"><WindPower /></el-icon>
              <div class="summary-label">风力风向</div>
            </div>
            <div class="summary-details">
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">风速</span>
                  <span class="detail-value"
                    >{{ formatNumber(weatherSummary.windSpeed) }} km/h</span
                  >
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-item">
                  <span class="detail-label">风向</span>
                  <span class="detail-value"
                    >{{ weatherSummary.windDirection }}°</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 温度和辐照度曲线图 -->
    <div class="weather-chart-section">
      <div class="section-header">
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color temperature"></span>
            <span>温度(℃)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color irradiation"></span>
            <span>辐照度(W/m²)</span>
          </div>
        </div>
      </div>
      <div ref="chartEl" class="chart-container" style="height: 400px"></div>
    </div>

    <!-- 24小时数据表格 -->
    <div class="weather-table-section">
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        max-height="400"
      >
        <el-table-column
          prop="time"
          label="时间"
          width="80"
          align="center"
          fixed="left"
        >
          <template #default="{ row }">
            <div style="font-size: 11px">{{ row.time }}</div>
          </template>
        </el-table-column>

        <!-- 动态生成24小时列 -->
        <el-table-column
          v-for="hour in 24"
          :key="hour"
          :label="`${String(hour - 1).padStart(2, '0')}:00`"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <div
              v-if="row.type === 'temperature'"
              class="hour-data temperature-data"
            >
              {{ formatNumber(row.data[hour - 1]) }}
            </div>
            <div
              v-else-if="row.type === 'irradiation'"
              class="hour-data irradiation-data"
            >
              {{ formatNumber(row.data[hour - 1]) }}
            </div>
            <div v-else class="hour-data time-label">
              {{ row.data[hour - 1] }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, computed } from "vue";
import * as echarts from "echarts";
import {
  Download,
  Sunny,
  PartlyCloudy,
  Cloudy,
  WindPower,
} from "@element-plus/icons-vue";

// Props定义
const props = defineProps({
  // 申报日期
  date: {
    type: String,
    default: "",
  },
  // 温度和辐照度曲线数据
  chartData: {
    type: Array,
    default: () => [],
  },
  // 天气统计信息
  summaryData: {
    type: Array,
    default: () => [],
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
});

// Emits定义
const emit = defineEmits(["export-data"]);

// 图表实例
const chartEl = ref(null);
let chartInstance = null;

// 计算属性：天气统计信息（取第一条数据）
const weatherSummary = computed(() => {
  if (props.summaryData.length > 0) {
    return props.summaryData[0];
  }
  return {
    temperatureMin: 0,
    temperatureMax: 0,
    weather: "",
    cloudCoverEarlyMorning: 0,
    cloudCoverMorning: 0,
    cloudCoverAfternoon: 0,
    cloudCoverEvening: 0,
    windSpeed: 0,
    windDirection: 0,
  };
});

// 根据天气状况返回对应的图标组件
const getWeatherIcon = (weather) => {
  if (!weather) return Sunny;

  const weatherLower = weather.toLowerCase();
  if (weatherLower.includes("晴")) return Sunny;
  if (weatherLower.includes("多云")) return PartlyCloudy;
  if (weatherLower.includes("阴") || weatherLower.includes("云")) return Cloudy;
  // 对于其他天气状况，使用Cloudy作为后备
  return Cloudy;
};

// 计算属性：表格数据
const tableData = computed(() => {
  const data = [];

  // 提取温度和辐照度数据
  let temperatureData = [];
  let irradiationData = [];
  let timeLabels = [];

  if (props.chartData.length >= 2) {
    // 温度数据
    const tempItem = props.chartData.find((item) => item.id === "温度");
    if (tempItem && tempItem.dataList) {
      temperatureData = tempItem.dataList.map((item) => item.value);
      timeLabels = tempItem.dataList.map((item) => item.label);
    }

    // 辐照度数据
    const irrItem = props.chartData.find((item) => item.id === "辐照度");
    if (irrItem && irrItem.dataList) {
      irradiationData = irrItem.dataList.map((item) => item.value);
    }
  }

  // 第一行：温度数据
  data.push({
    type: "temperature",
    time: "温度(°C)",
    temperature: "—",
    irradiation: "—",
    data: temperatureData,
  });

  // 第二行：辐照度数据
  data.push({
    type: "irradiation",
    time: "辐照度(W/m²)",
    temperature: "—",
    irradiation: "—",
    data: irradiationData,
  });

  return data;
});

// 计算属性：图表数据
const chartSeriesData = computed(() => {
  const temperatureData = [];
  const irradiationData = [];
  const timeLabels = [];

  if (props.chartData.length >= 2) {
    // 温度数据
    const tempItem = props.chartData.find((item) => item.id === "温度");
    if (tempItem && tempItem.dataList) {
      tempItem.dataList.forEach((item) => {
        temperatureData.push(item.value);
        timeLabels.push(item.label);
      });
    }

    // 辐照度数据
    const irrItem = props.chartData.find((item) => item.id === "辐照度");
    if (irrItem && irrItem.dataList) {
      irrItem.dataList.forEach((item) => {
        irradiationData.push(item.value);
      });
    }
  }

  return { temperatureData, irradiationData, timeLabels };
});

// 初始化图表
const initChart = () => {
  if (!chartEl.value) return;

  chartInstance = echarts.init(chartEl.value);

  const { temperatureData, irradiationData, timeLabels } =
    chartSeriesData.value;

  // 温度颜色渐变
  const temperatureGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "rgba(84, 112, 198, 0.8)" },
    { offset: 1, color: "rgba(84, 112, 198, 0.1)" },
  ]);

  // 辐照度颜色渐变
  const irradiationGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: "rgba(145, 204, 117, 0.8)" },
    { offset: 1, color: "rgba(145, 204, 117, 0.1)" },
  ]);

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#eee",
      borderWidth: 1,
      textStyle: {
        color: "#333",
      },
      formatter: function (params) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param) => {
          const unit = param.seriesName === "温度" ? "℃" : "W/m²";
          const icon = param.seriesName === "温度" ? "🌡️" : "☀️";
          result += `${icon} ${param.seriesName}: <span style="font-weight:bold;color:${param.color}">${param.value} ${unit}</span><br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ["温度", "辐照度"],
      bottom: 10,
      textStyle: {
        color: "#6c757d",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timeLabels,
      axisLine: {
        lineStyle: {
          color: "#dee2e6",
        },
      },
      axisLabel: {
        color: "#6c757d",
        interval: 3, // 只显示整点标签（每4个点显示一个，假设有96个点）
        fontSize: 11,
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "温度(℃)",
        position: "left",
        nameTextStyle: {
          color: "#5470C6",
          fontWeight: "bold",
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#5470C6",
          },
        },
        axisLabel: {
          color: "#5470C6",
          formatter: "{value}°",
        },
        splitLine: {
          lineStyle: {
            color: "#f0f0f0",
            type: "dashed",
          },
        },
      },
      {
        type: "value",
        name: "辐照度(W/m²)",
        position: "right",
        nameTextStyle: {
          color: "#91CC75",
          fontWeight: "bold",
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#91CC75",
          },
        },
        axisLabel: {
          color: "#91CC75",
          formatter: "{value}",
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: "温度",
        type: "line",
        yAxisIndex: 0,
        data: temperatureData,
        smooth: true,
        lineStyle: {
          width: 3,
          color: "#5470C6",
          shadowColor: "rgba(84, 112, 198, 0.5)",
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        symbol: "circle",
        symbolSize: 7,
        itemStyle: {
          color: "#5470C6",
          borderWidth: 0,
          opacity: 0.8,
        },
        areaStyle: {
          color: temperatureGradient,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: "rgba(84, 112, 198, 0.8)",
          },
        },
        animationDuration: 2000,
        animationEasing: "cubicOut",
      },
      {
        name: "辐照度",
        type: "line",
        yAxisIndex: 1,
        data: irradiationData,
        smooth: true,
        lineStyle: {
          width: 4,
          color: "#91CC75",
          shadowColor: "rgba(145, 204, 117, 0.5)",
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        symbol: "circle",
        symbolSize: 7,
        itemStyle: {
          color: "#91CC75",
          borderWidth: 0,
          opacity: 0.8,
        },
        areaStyle: {
          color: irradiationGradient,
        },
        emphasis: {
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: "rgba(145, 204, 117, 0.8)",
          },
        },
        animationDuration: 2000,
        animationEasing: "cubicOut",
        animationDelay: 300,
      },
    ],
    backgroundColor: "#fff",
    textStyle: {
      fontFamily: "inherit",
    },
  };

  chartInstance.setOption(option);
};

// 格式化数字
const formatNumber = (value) => {
  if (value === null || value === undefined) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(1);
};

// 表头样式
const headerCellStyle = () => ({
  backgroundColor: "#f5f7fa",
  color: "#303133",
  fontWeight: "600",
  fontSize: "14px",
  borderColor: "#ebeef5",
  textAlign: "center",
});

// 单元格样式
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  const style = {
    borderColor: "#ebeef5",
    padding: "8px 4px",
    fontSize: "12px",
    textAlign: "center",
  };

  // 不同类型数据不同样式
  if (row.type === "temperature") {
    style.backgroundColor = "#f0f7ff";
  } else if (row.type === "irradiation") {
    style.backgroundColor = "#f0fff4";
  }

  return style;
};

// 监听数据变化，更新图表
watch(
  () => props.chartData,
  () => {
    if (chartInstance) {
      chartInstance.dispose();
      initChart();
    }
  },
  { deep: true },
);

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 生命周期
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
</script>

<style lang="scss" scoped>
.weather-info-container {
  background: white;
  padding: 24px;
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      color: #2c3e50;
      font-weight: 600;
      margin: 0;
      font-size: 1.1rem;
    }
  }

  // 图表区域
  .weather-chart-section {
    margin-bottom: 32px;

    .chart-legend {
      display: flex;
      gap: 20px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: #6c757d;
      }

      .legend-color {
        display: inline-block;
        width: 16px;
        height: 4px;
        border-radius: 2px;

        &.temperature {
          background: linear-gradient(90deg, #5470c6, #9cb4e6);
        }

        &.irradiation {
          background: linear-gradient(90deg, #91cc75, #c2e0a8);
        }
      }
    }

    .chart-container {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e9edf2;
    }
  }

  // 表格区域
  .weather-table-section {
    .hour-data {
      font-size: 11px;
      font-weight: 500;

      &.temperature-data {
        color: #5470c6;
      }

      &.irradiation-data {
        color: #91cc75;
      }

      &.time-label {
        color: #606266;
        font-weight: 600;
      }
    }
  }

  // 统计信息区域
  .weather-summary-section {
    margin-bottom: 12px;
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 5px;

      .summary-card {
        display: flex;
        flex-direction: column;
        padding: 6px 8px;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
        min-height: 50px; /* 进一步减小高度 */
        height: auto;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1;
        }

        .summary-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;

          .summary-header {
            display: flex;
            align-items: center;
            margin-bottom: 2px;
            gap: 3px;

            .summary-label-icon {
              font-size: 10px;
              color: #64748b;
              opacity: 0.9;
            }

            .summary-label {
              font-size: 14px;
              color: #64748b;
              font-weight: 500;
              line-height: 1.1;
            }
          }

          .summary-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 16px;
            line-height: 1.1;
            justify-self: center;
            margin-top: auto;
            margin-bottom: auto;
            align-self: center;
          }

          .summary-value-with-icon {
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            justify-self: center;
            align-self: center;
            margin-top: auto;
            margin-bottom: auto;

            .summary-value-text {
              font-weight: 600;
              color: #1e293b;
              line-height: 1.1;
            }

            .weather-status-icon {
              font-size: 16px;
              color: #f59e0b;
            }
          }

          .summary-details {
            margin-top: 3px;
            display: flex;
            flex-direction: column;

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;

              &:last-child {
                margin-bottom: 0;
              }

              .detail-item {
                flex: 1;
                display: flex;
                gap: 4px;
                align-items: center;
                padding: 0;

                .detail-label {
                  font-size: 0.65rem;
                  color: #64748b;
                  font-weight: 400;
                }

                .detail-value {
                  font-size: 0.7rem;
                  font-weight: 600;
                  color: #1e293b;
                  margin-left: 3px;
                }
              }
            }
          }
        }

        // 不同卡片的主题颜色
        &:nth-child(1) {
          .summary-label-icon {
            color: #f97316; // 橙色 - 温度
          }
        }

        &:nth-child(2) {
          .summary-label-icon {
            color: #3b82f6; // 蓝色 - 天气
          }

          .weather-status-icon {
            color: #3b82f6;
          }
        }

        &:nth-child(3) {
          .summary-label-icon {
            color: #8b5cf6; // 紫色 - 云量
          }
        }

        &:nth-child(4) {
          .summary-label-icon {
            color: #10b981; // 绿色 - 风力
          }
        }
      }
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    padding: 16px;

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .weather-chart-section {
      .chart-legend {
        justify-content: space-around;
        width: 100%;
      }
    }

    .weather-table-section {
      :deep(.el-table) {
        font-size: 11px;

        .el-table__body-wrapper {
          overflow-x: auto;
        }
      }
    }
  }
}
</style>
