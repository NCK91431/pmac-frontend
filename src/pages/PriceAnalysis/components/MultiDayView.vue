<template>
  <div class="multi-day-view">
    <!-- 多日电价图 -->
    <div class="chart-card">
      <div class="chart-header">
        <span class="chart-title">
          <i class="bi bi-graph-up"></i> 实时 & 日前电价对比（{{ dayCount }}天）
        </span>
        <div class="date-legend">
          <span
            v-for="(date, idx) in dateList"
            :key="date"
            class="legend-item"
            :style="{ color: colorPalette[idx % colorPalette.length] }"
          >
            <i class="bi bi-calendar-day"></i>
            {{ formatDateShort(date) }}
            <span class="day-type">{{ getDayType(date) }}</span>
          </span>
        </div>
      </div>
      <div
        ref="priceChartRef"
        v-loading="priceLoading"
        class="chart-container"
      ></div>
    </div>

    <!-- 多日价差图 -->
    <div class="chart-card">
      <div class="chart-header">
        <span class="chart-title">
          <i class="bi bi-arrow-left-right"></i> 价差图（实时 - 日前）
        </span>
        <div class="date-legend">
          <span
            v-for="(date, idx) in dateList"
            :key="date"
            class="legend-item"
            :style="{ color: colorPalette[idx % colorPalette.length] }"
          >
            <i class="bi bi-calendar-day"></i>
            {{ formatDateShort(date) }}
          </span>
        </div>
      </div>
      <div
        ref="spreadChartRef"
        v-loading="spreadLoading"
        class="chart-container"
      ></div>
    </div>

    <!-- 智能分析结果及建议 -->
    <div class="analysis-card">
      <div class="analysis-header">
        <i class="bi bi-magic"></i>
        <span>智能分析结果及建议</span>
      </div>
      <div class="analysis-content">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">最高实时电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.maxRealTime.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.maxRealTime.date }} {{ stats.maxRealTime.time }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最低实时电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.minRealTime.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.minRealTime.date }} {{ stats.minRealTime.time }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最高日前电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.maxDayAhead.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.maxDayAhead.date }} {{ stats.maxDayAhead.time }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最低日前电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.minDayAhead.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.minDayAhead.date }} {{ stats.minDayAhead.time }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最大价差</div>
            <div
              class="stat-value"
              :class="stats.maxSpread.value > 0 ? 'positive' : 'negative'"
            >
              {{ formatPrice(stats.maxSpread.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.maxSpread.date }} {{ stats.maxSpread.time }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最小价差</div>
            <div
              class="stat-value"
              :class="stats.minSpread.value > 0 ? 'positive' : 'negative'"
            >
              {{ formatPrice(stats.minSpread.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.minSpread.date }} {{ stats.minSpread.time }}
            </div>
          </div>
        </div>
        <div class="advice-section">
          <div class="advice-title">📊 运营建议</div>
          <div class="advice-text">{{ adviceText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import * as echarts from "echarts";
import { ElLoading } from "element-plus";
import request from "@/utils/request"; // 假设已有请求工具

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  nodeName: {
    type: String,
    default: "",
  },
  dateRange: {
    type: Array,
    default: () => [],
  },
  timeType: {
    type: String,
    default: "hour", // 'hour' 或 'minute'
  },
});

// 内部状态
const priceChartRef = ref(null);
const spreadChartRef = ref(null);
let priceChart = null;
let spreadChart = null;

const priceLoading = ref(false);
const spreadLoading = ref(false);

// 存储多日数据 { date: { dayAhead: [], realTime: [] } }
const multiDayData = ref({});

// 生成日期列表（最多7天）
const dateList = computed(() => {
  if (!props.dateRange || props.dateRange.length !== 2) return [];
  const start = props.dateRange[0];
  const end = props.dateRange[1];
  const dates = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last && dates.length < 7) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
});

const dayCount = computed(() => dateList.value.length);

// 颜色调色板（最多7天，每个日期一个主色）
const colorPalette = [
  "#5470c6",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
];

// 辅助函数：格式化日期 YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 获取日期类型（模拟：周末返回"周末"，否则"工作日"；实际可根据节假日接口扩展）
function getDayType(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 周日, 6 周六
  return day === 0 || day === 6 ? "周末" : "工作日";
}

// 简短日期格式 MM-DD
function formatDateShort(dateStr) {
  return dateStr.slice(5); // "02-01"
}

// 获取时间轴（根据 timeType）
const timeAxis = computed(() => {
  const length = props.timeType === "hour" ? 24 : 96;
  return Array.from({ length }, (_, i) => {
    if (props.timeType === "hour") {
      return `${i.toString().padStart(2, "0")}:00`;
    } else {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
  });
});

// 获取多日数据（模拟或真实请求）
async function fetchMultiDayData() {
  if (!props.nodeId || dateList.value.length === 0) return;

  priceLoading.value = true;
  spreadLoading.value = true;

  try {
    // 实际场景应调用后端批量接口，此处模拟构造数据
    const promises = dateList.value.map((date) => fetchDayData(date));
    const results = await Promise.all(promises);

    const dataMap = {};
    results.forEach((res, idx) => {
      dataMap[dateList.value[idx]] = res;
    });
    multiDayData.value = dataMap;

    // 数据获取后渲染图表
    nextTick(() => {
      renderPriceChart();
      renderSpreadChart();
    });
  } catch (error) {
    console.error("获取多日电价数据失败", error);
  } finally {
    priceLoading.value = false;
    spreadLoading.value = false;
  }
}

// 模拟单日数据获取（实际应替换为API调用）
async function fetchDayData(date) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 50));

  // 生成伪数据：日前电价在 200~400 之间，实时电价波动更大
  const points = props.timeType === "hour" ? 24 : 96;
  const dayAhead = [];
  const realTime = [];

  const base = 300 + Math.sin(new Date(date).getDate()) * 50; // 日期相关波动
  for (let i = 0; i < points; i++) {
    const hourFactor = Math.sin((i / 12) * Math.PI) * 50; // 日内峰谷
    dayAhead.push(base + hourFactor + (Math.random() * 20 - 10));
    realTime.push(base + hourFactor * 1.5 + (Math.random() * 40 - 20));
  }

  return { dayAhead, realTime };
}

// 渲染多日电价图
function renderPriceChart() {
  if (!priceChartRef.value) return;
  if (!priceChart) {
    priceChart = echarts.init(priceChartRef.value);
  }

  const series = [];
  dateList.value.forEach((date, idx) => {
    const data = multiDayData.value[date];
    if (!data) return;

    const color = colorPalette[idx % colorPalette.length];

    // 实时电价系列（实线）
    series.push({
      name: `${date} 实时`,
      type: "line",
      smooth: true,
      symbol: "none",
      lineStyle: { width: 2, color, type: "solid" },
      data: data.realTime,
    });

    // 日前电价系列（虚线）
    series.push({
      name: `${date} 日前`,
      type: "line",
      smooth: true,
      symbol: "none",
      lineStyle: { width: 2, color, type: "dashed" },
      data: data.dayAhead,
    });
  });

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        let res = `<div>${params[0].axisValue}</div>`;
        params.forEach((p) => {
          res += `<div style="display:flex;align-items:center;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px;"></span>
            <span>${p.seriesName}: <b>${p.value.toFixed(2)}</b> 元/MWh</span>
          </div>`;
        });
        return res;
      },
    },
    legend: { show: false }, // 使用自定义图例
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: timeAxis.value,
      axisLabel: {
        rotate: props.timeType === "hour" ? 0 : 30,
        interval: props.timeType === "hour" ? 0 : 3,
      },
    },
    yAxis: {
      type: "value",
      name: "电价 (元/MWh)",
    },
    series,
  };

  priceChart.setOption(option, true);
}

// 渲染多日价差图
function renderSpreadChart() {
  if (!spreadChartRef.value) return;
  if (!spreadChart) {
    spreadChart = echarts.init(spreadChartRef.value);
  }

  const series = [];
  dateList.value.forEach((date, idx) => {
    const data = multiDayData.value[date];
    if (!data) return;

    const spread = data.realTime.map((rt, i) => rt - data.dayAhead[i]);

    series.push({
      name: date,
      type: "line",
      smooth: true,
      symbol: "none",
      lineStyle: { width: 2, color: colorPalette[idx % colorPalette.length] },
      data: spread,
    });
  });

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params) => {
        let res = `<div>${params[0].axisValue}</div>`;
        params.forEach((p) => {
          const val = p.value.toFixed(2);
          const color = val >= 0 ? "#67c23a" : "#409eff";
          res += `<div style="display:flex;align-items:center;margin:2px 0;">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px;"></span>
            <span>${p.seriesName}: <b style="color:${color}">${val}</b> 元/MWh</span>
          </div>`;
        });
        return res;
      },
    },
    legend: { show: false },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: {
      type: "category",
      data: timeAxis.value,
      axisLabel: {
        rotate: props.timeType === "hour" ? 0 : 30,
        interval: props.timeType === "hour" ? 0 : 3,
      },
    },
    yAxis: {
      type: "value",
      name: "价差 (元/MWh)",
    },
    series,
  };

  spreadChart.setOption(option, true);
}

// 智能分析统计
const stats = computed(() => {
  const result = {
    maxRealTime: { value: -Infinity, date: "", time: "" },
    minRealTime: { value: Infinity, date: "", time: "" },
    maxDayAhead: { value: -Infinity, date: "", time: "" },
    minDayAhead: { value: Infinity, date: "", time: "" },
    maxSpread: { value: -Infinity, date: "", time: "" },
    minSpread: { value: Infinity, date: "", time: "" },
  };

  dateList.value.forEach((date) => {
    const data = multiDayData.value[date];
    if (!data) return;

    data.realTime.forEach((val, idx) => {
      const time = timeAxis.value[idx];
      if (val > result.maxRealTime.value) {
        result.maxRealTime = { value: val, date, time };
      }
      if (val < result.minRealTime.value) {
        result.minRealTime = { value: val, date, time };
      }
    });

    data.dayAhead.forEach((val, idx) => {
      const time = timeAxis.value[idx];
      if (val > result.maxDayAhead.value) {
        result.maxDayAhead = { value: val, date, time };
      }
      if (val < result.minDayAhead.value) {
        result.minDayAhead = { value: val, date, time };
      }
    });

    data.realTime.forEach((rt, idx) => {
      const spread = rt - data.dayAhead[idx];
      const time = timeAxis.value[idx];
      if (spread > result.maxSpread.value) {
        result.maxSpread = { value: spread, date, time };
      }
      if (spread < result.minSpread.value) {
        result.minSpread = { value: spread, date, time };
      }
    });
  });

  // 处理无数据情况
  if (result.maxRealTime.value === -Infinity) result.maxRealTime.value = 0;
  if (result.minRealTime.value === Infinity) result.minRealTime.value = 0;
  if (result.maxDayAhead.value === -Infinity) result.maxDayAhead.value = 0;
  if (result.minDayAhead.value === Infinity) result.minDayAhead.value = 0;
  if (result.maxSpread.value === -Infinity) result.maxSpread.value = 0;
  if (result.minSpread.value === Infinity) result.minSpread.value = 0;

  return result;
});

// 格式化价格
function formatPrice(val) {
  return (val || 0).toFixed(2) + " 元/MWh";
}

// 生成建议文本
const adviceText = computed(() => {
  const s = stats.value;
  if (!s.maxRealTime.value) return "暂无足够数据生成建议。";

  const lines = [];

  // 最高电价建议
  if (s.maxRealTime.value > 400) {
    lines.push(
      `⚠️ 实时电价在 ${s.maxRealTime.date} ${s.maxRealTime.time} 达到峰值 ${s.maxRealTime.value.toFixed(2)} 元/MWh，建议避开该时段用电。`,
    );
  } else {
    lines.push(
      `✅ 实时电价整体平稳，最高 ${s.maxRealTime.value.toFixed(2)} 元/MWh，可正常安排生产。`,
    );
  }

  // 价差套利机会
  if (s.maxSpread.value > 50) {
    lines.push(
      `💰 实时高于日前最大价差达 ${s.maxSpread.value.toFixed(2)} 元/MWh（${s.maxSpread.date} ${s.maxSpread.time}），可考虑减少实时市场购电。`,
    );
  }
  if (s.minSpread.value < -50) {
    lines.push(
      `💡 实时低于日前最大价差为 ${s.minSpread.value.toFixed(2)} 元/MWh（${s.minSpread.date} ${s.minSpread.time}），适合增加实时市场购电。`,
    );
  }

  // 周末工作日对比
  const weekendDays = dateList.value.filter((d) => getDayType(d) === "周末");
  if (weekendDays.length > 0) {
    lines.push(
      `📅 包含 ${weekendDays.length} 天周末，通常周末电价较低，可适当调整生产计划至周末。`,
    );
  }

  if (lines.length === 0) {
    lines.push("电价波动较小，建议保持当前用电策略。");
  }

  return lines.join(" ");
});

// 监听 props 变化重新获取数据
watch(
  () => [props.nodeId, props.dateRange, props.timeType],
  () => {
    fetchMultiDayData();
  },
  { immediate: true, deep: true },
);

// 窗口大小自适应
const handleResize = () => {
  priceChart?.resize();
  spreadChart?.resize();
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  priceChart?.dispose();
  spreadChart?.dispose();
});
</script>

<style scoped lang="scss">
.multi-day-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  gap: 12px;
  overflow-y: auto;
  background: #f5f7fa;

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

      .date-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;

        .legend-item {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;

          i {
            font-size: 14px;
          }

          .day-type {
            color: #909399;
            font-size: 11px;
            background: #f2f6fc;
            padding: 2px 6px;
            border-radius: 10px;
            margin-left: 4px;
          }
        }
      }
    }

    .chart-container {
      width: 100%;
      height: 280px;
    }
  }

  .analysis-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .analysis-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 16px;

      i {
        color: #9c27b0;
        font-size: 20px;
      }
    }

    .analysis-content {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;

        .stat-item {
          background: #f8fafd;
          border-radius: 8px;
          padding: 12px;
          text-align: center;

          .stat-label {
            font-size: 12px;
            color: #606266;
            margin-bottom: 6px;
          }

          .stat-value {
            font-size: 18px;
            font-weight: 700;
            line-height: 1.4;

            &.positive {
              color: #409eff;
            }
            &.negative {
              color: #67c23a;
            }
          }

          .stat-meta {
            font-size: 11px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }

      .advice-section {
        background: #f0f9f0;
        border-left: 4px solid #67c23a;
        padding: 14px 18px;
        border-radius: 6px;

        .advice-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .advice-text {
          font-size: 13px;
          line-height: 1.6;
          color: #3c4b5e;
          white-space: pre-wrap;
        }
      }
    }
  }
}
</style>
