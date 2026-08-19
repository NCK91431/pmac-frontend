<template>
  <div class="settlement-trend-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1><span>⚡</span> 多日结算电价展示</h1>
      <div class="header-controls">
        <div class="control-group">
          <label>月份：</label>
          <select v-model="month" @change="handleChange">
            <option v-for="opt in monthOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="control-group">
          <label>时间范围：</label>
          <div class="quick-btns">
            <button v-for="d in [7, 15, 30]" :key="d" :class="{ active: quickDays === d && !dateRange }" @click="handleQuick(d)">近{{ d }}天</button>
          </div>
        </div>
        <div class="control-group">
          <label>自定义：</label>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disableFutureDate"
            style="width: 280px"
            @change="handleDateRangeChange"
          />
        </div>
        <div class="control-group">
          <label>电价类型：</label>
          <div class="price-type-btns">
            <button :class="{ active: priceType === 'dayAhead' }" @click="switchType('dayAhead')">日前结算</button>
            <button :class="{ active: priceType === 'realtime' }" @click="switchType('realtime')">实时结算</button>
          </div>
        </div>
        <div class="mode-tag" :class="isSharp ? 'mode-sharp' : 'mode-normal'">
          {{ isSharp ? '尖峰平谷模式 (夏季)' : '峰平谷模式' }}
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content" v-loading="loading" element-loading-text="数据加载中，请稍候..." element-loading-background="rgba(255,255,255,0.65)">
      <!-- 首次加载骨架屏 -->
      <div v-if="loading && !trendData" class="skeleton-block">
        <div class="summary-cards">
          <el-skeleton-item v-for="i in 5" :key="i" variant="rect" class="skeleton-card" />
        </div>
        <el-skeleton-item variant="rect" class="skeleton-main" />
        <div class="charts-grid skeleton-grid">
          <el-skeleton-item v-for="i in 6" :key="i" variant="rect" class="skeleton-cell" />
        </div>
      </div>

      <template v-else>
        <!-- 汇总卡片 -->
        <div class="summary-cards">
          <div v-for="card in summaryCards" :key="card.key" class="summary-card" :class="`card-${card.key}`">
            <div class="card-label">{{ card.label }}</div>
            <div class="card-value">{{ card.value }}<span class="card-unit">元/MWh</span></div>
          </div>
        </div>

        <!-- 日均结算电价趋势 -->
        <div class="section-title main-section-title">
          <span>日均结算电价趋势</span>
          <span class="main-chart-avg">均值 {{ mainAvgText }} 元/MWh</span>
        </div>
        <div class="chart-container">
          <div ref="mainChartEl" class="chart-main"></div>
        </div>

        <!-- 分时电价分组 -->
        <div v-for="group in groupSections" :key="group.type" class="group-section">
          <div class="section-title">
            <span>{{ group.label }}时段电价</span>
            <span class="badge" :class="`badge-${group.type}`">{{ group.slots.length }}个时刻</span>
          </div>
          <div class="charts-grid">
            <div v-for="slot in group.slots" :key="slot" class="chart-cell" :ref="(el) => setCellRef(group.type, slot, el)">
              <div class="chart-cell-title">
                <span class="dot" :class="`dot-${group.type}`"></span>
                <span>{{ slot }} ({{ group.label }})</span>
                <span class="avg-val">均值 {{ getSlotAvg(group.type, slot) }}</span>
              </div>
              <div class="chart-mini"></div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { getSettlementPriceTrend } from "./api.js";
import Decimal from "decimal.js";

// 精确舍入到 2 位小数，消除 JS 浮点精度误差（如 336.4558333333333333326 -> 336.46）；null 原样返回
function round2(v) {
  if (v == null) return null;
  return new Decimal(v).toDecimalPlaces(2).toNumber();
}
// 一组非空值的平均值（Decimal 精确计算，结果舍入 2 位）
function avgOf(values) {
  const valid = (values || []).filter((v) => v != null);
  if (!valid.length) return null;
  let sum = new Decimal(0);
  valid.forEach((v) => { sum = sum.plus(v); });
  return round2(sum.div(valid.length).toNumber());
}

// ========== 时段配置（与原型图一致） ==========
const TOU_CONFIG = {
  normal: {
    peak:   ['10:00','11:00','14:00','15:00','16:00','17:00','18:00'],
    valley: ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00'],
    normal: ['08:00','09:00','12:00','13:00','19:00','20:00','21:00','22:00','23:00']
  },
  sharp: {
    peak:   ['10:00','14:00','17:00','18:00'],
    valley: ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00'],
    normal: ['08:00','09:00','12:00','13:00','19:00','20:00','21:00','22:00','23:00'],
    sharp:  ['11:00','15:00','16:00']
  }
};

const TYPE_META = {
  sharp:  { label: '尖峰', color: '#a93226', bg: '#fde8e8' },
  peak:   { label: '峰',   color: '#bf4f00', bg: '#fef3e2' },
  normal: { label: '平',   color: '#1f6391', bg: '#e8f4fd' },
  valley: { label: '谷',   color: '#1e8449', bg: '#e8f8f0' }
};

// ========== 状态 ==========
const now = new Date();
const month = ref(now.getMonth() + 1);
const quickDays = ref(15);
const dateRange = ref(null); // [start, end]，格式 YYYY-MM-DD
const priceType = ref("dayAhead"); // 'dayAhead' | 'realtime'（默认日前结算）
const loading = ref(false);
const trendData = ref(null); // { dates, dayAhead, realTime }

// 实际结算电价滞后 6 天才公布，最新可用结算数据为 D-6（如 8/18 只出到 8/12）
const dataLatestStr = (() => {
  const t = new Date(Date.now() - 6 * 86400000);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
})();

// ========== 工具函数 ==========
const isSharpMonth = (m) => m >= 7 && m <= 9;
const isSharp = computed(() => isSharpMonth(month.value));
const config = computed(() => (isSharp.value ? TOU_CONFIG.sharp : TOU_CONFIG.normal));
const groupOrder = computed(() => (isSharp.value ? ["sharp", "peak", "normal", "valley"] : ["peak", "normal", "valley"]));

const monthOptions = computed(() => {
  const list = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push({ value: d.getMonth() + 1, label: `${d.getFullYear()}年${d.getMonth() + 1}月` });
  }
  return list;
});

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 禁止选择最新可用结算数据（D-6）之后的日期
function disableFutureDate(date) {
  return date.getTime() > new Date(dataLatestStr + "T00:00:00").getTime();
}

function getDateRange() {
  if (dateRange.value && dateRange.value.length === 2) {
    return { startDate: dateRange.value[0], endDate: dateRange.value[1] };
  }
  // 快捷范围以 D-6 为结束日往前推 N 天
  const endStr = dataLatestStr;
  const startStr = fmtDate(new Date(new Date(endStr + "T00:00:00").getTime() - (quickDays.value - 1) * 86400000));
  return { startDate: startStr, endDate: endStr };
}

// ========== 数据获取 ==========
async function fetchData() {
  const { startDate, endDate } = getDateRange();
  loading.value = true;
  try {
    const res = await getSettlementPriceTrend({ startDate, endDate });
    const data = res.data?.data;
    if (!data || !Array.isArray(data.dates)) throw new Error("返回数据为空");
    trendData.value = data;
    await renderAll();
  } catch (err) {
    if (err.__membershipGate) return;
    ElMessage.error(`获取结算电价数据失败：${err.message || "未知错误"}`);
  } finally {
    loading.value = false;
  }
}

// ========== 派生数据 ==========
const matrix = computed(() => {
  const data = trendData.value;
  if (!data) return [];
  return priceType.value === "realtime" ? data.realTime : data.dayAhead;
});

const dateLabels = computed(() => (trendData.value?.dates || []).map((d) => d.slice(5))); // MM-DD

// hourly: { 'HH:00': { type, prices: [每日值或 null] } }
const hourly = computed(() => {
  const m = matrix.value;
  const result = {};
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, "0") + ":00";
    let type = "normal";
    for (const [t, slots] of Object.entries(config.value)) {
      if (slots.includes(key)) { type = t; break; }
    }
    result[key] = { type, prices: m.map((row) => (Array.isArray(row) ? row[h] : null)) };
  }
  return result;
});

// daily: 每日 24 点非空值的平均（Decimal 精确计算）；整日全空为 null
const daily = computed(() =>
  matrix.value.map((row) => {
    if (!Array.isArray(row)) return null;
    return avgOf(row);
  })
);

const avgAll = computed(() => avgOf(daily.value));

const mainAvgText = computed(() => (avgAll.value == null ? "--" : avgAll.value.toFixed(2)));

const summaryCards = computed(() => {
  const cards = [];
  cards.push({ key: "avg", label: "区间日均价", value: avgAll.value == null ? "--" : avgAll.value.toFixed(2) });
  for (const type of groupOrder.value) {
    if (!config.value[type]) continue;
    const slots = config.value[type];
    const allValues = [];
    for (const slot of slots) {
      allValues.push(...(hourly.value[slot]?.prices || []));
    }
    const avg = avgOf(allValues);
    cards.push({ key: type, label: `${TYPE_META[type].label}时段均价`, value: avg == null ? "--" : avg.toFixed(2) });
  }
  return cards;
});

const groupSections = computed(() =>
  groupOrder.value
    .filter((t) => config.value[t])
    .map((t) => ({ type: t, label: TYPE_META[t].label, slots: config.value[t] }))
);

function getSlotAvg(type, slot) {
  const avg = avgOf(hourly.value[slot]?.prices || []);
  return avg == null ? "--" : avg.toFixed(2);
}

// ========== ECharts 实例管理 ==========
const mainChartEl = ref(null);
let mainChart = null;
const miniCharts = [];
const cellEls = new Map(); // key: `${type}-${slot}` -> cell DOM

function setCellRef(type, slot, el) {
  if (el) cellEls.set(`${type}-${slot}`, el);
  else cellEls.delete(`${type}-${slot}`);
}

function disposeAll() {
  if (mainChart) { mainChart.dispose(); mainChart = null; }
  miniCharts.forEach((c) => c.dispose());
  miniCharts.length = 0;
  cellEls.clear();
}

// ========== 主图表（日均结算电价趋势） ==========
function renderMainChart() {
  const el = mainChartEl.value;
  if (!el) return;
  mainChart = echarts.init(el);
  const labels = dateLabels.value;
  const data = daily.value;
  const valid = data.filter((v) => v != null);

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(26,26,46,0.9)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 14 },
      formatter(params) {
        let s = `<div style="font-weight:600;margin-bottom:6px">${params[0].axisValue}</div>`;
        params.forEach((p) => {
          s += `<div style="display:flex;align-items:center;gap:6px;margin:3px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span>${p.seriesName}</span>
            <span style="font-weight:600;margin-left:auto">${p.value == null ? "--" : round2(p.value)} 元/MWh</span>
          </div>`;
        });
        return s;
      }
    },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: "#e0e0e0" } },
      axisLabel: { color: "#666", fontSize: 14 },
      axisTick: { show: false }
    },
    yAxis: {
      type: "value",
      name: "元/MWh",
      nameTextStyle: { color: "#999", fontSize: 12, padding: [0, 0, 0, -40] },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
      axisLabel: { color: "#666", fontSize: 14 }
    },
    series: [{
      name: "日均结算电价",
      type: "line",
      data,
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 3, color: "#8e44ad" },
      itemStyle: { color: "#8e44ad", borderWidth: 2, borderColor: "#fff" },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(142,68,173,0.25)" },
          { offset: 1, color: "rgba(142,68,173,0.02)" }
        ])
      },
      markLine: valid.length
        ? {
            silent: true,
            symbol: "none",
            data: (() => {
              const maxVal = round2(Math.max(...valid));
              const minVal = round2(Math.min(...valid));
              const avgVal = avgOf(valid);
              return [
                {
                  yAxis: avgVal,
                  label: { show: true, position: "insideEndTop", formatter: "均值 " + avgVal.toFixed(2), color: "#8e44ad", fontSize: 12, fontWeight: "bold" },
                  lineStyle: { color: "#8e44ad", type: "dashed", opacity: 0.5 }
                },
                {
                  xAxis: labels[data.indexOf(maxVal)],
                  label: { show: true, position: "end", formatter: "最高 " + maxVal.toFixed(2), color: "#a93226", fontSize: 14, fontWeight: "bold" },
                  lineStyle: { color: "#a93226", type: "dashed", width: 2 }
                },
                {
                  xAxis: labels[data.indexOf(minVal)],
                  label: { show: true, position: "end", formatter: "最低 " + minVal.toFixed(2), color: "#1e8449", fontSize: 14, fontWeight: "bold" },
                  lineStyle: { color: "#1e8449", type: "dashed", width: 2 }
                }
              ];
            })()
          }
        : undefined
    }]
  };
  mainChart.setOption(option);
}

// ========== 分时图表 ==========
function renderMiniChart(type, slot, cellEl) {
  const chartEl = cellEl.querySelector(".chart-mini");
  if (!chartEl) return;
  const chart = echarts.init(chartEl);
  miniCharts.push(chart);
  const meta = TYPE_META[type];
  const labels = dateLabels.value;
  const prices = hourly.value[slot]?.prices || [];
  const valid = prices.filter((v) => v != null);
  const maxRaw = valid.length ? Math.max(...valid) : null; // 原始值用于竖线定位
  const minRaw = valid.length ? Math.min(...valid) : null;
  const maxVal = round2(maxRaw);
  const minVal = round2(minRaw);
  const avg = avgOf(prices);

  const yLower = valid.length ? Math.floor(minVal / 100) * 100 : 0;
  let yUpper = valid.length ? Math.ceil(maxVal / 100) * 100 : 1;
  if (yUpper <= yLower) yUpper = yLower + 100;
  const yRange = yUpper - yLower;
  const matchThreshold = Math.max(yRange / 10, 1);

  const markData = [];
  if (valid.length) {
    markData.push(
      {
        yAxis: avg,
        lineStyle: { color: meta.color, type: "dashed", opacity: 0.5 },
        label: { formatter: "均值 " + avg.toFixed(2), color: meta.color, position: "insideEndBottom", fontSize: 14 }
      },
      {
        xAxis: labels[prices.indexOf(maxRaw)],
        lineStyle: { color: "#e74c3c", type: "dashed", width: 1.5 },
        label: { formatter: "最高 " + maxVal.toFixed(2), color: "#e74c3c", position: "end", fontSize: 14 }
      },
      {
        xAxis: labels[prices.indexOf(minRaw)],
        lineStyle: { color: "#2ecc71", type: "dashed", width: 1.5 },
        label: { formatter: "最低 " + minVal.toFixed(2), color: "#2ecc71", position: "end", fontSize: 14 }
      }
    );
  }

  chart.setOption({
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(26,26,46,0.9)",
      borderColor: "transparent",
      textStyle: { color: "#fff", fontSize: 14 },
      formatter(params) {
        return `<div style="font-weight:600">${params[0].axisValue}</div><div>${params[0].value == null ? "--" : round2(params[0].value)} 元/MWh</div>`;
      }
    },
    grid: { left: 55, right: 16, top: 50, bottom: 50 },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: "#e8e8e8" } },
      axisLabel: { color: "#999", fontSize: 14, rotate: 45 },
      axisTick: { show: false }
    },
    yAxis: {
      type: "value",
      name: "元/MWh",
      nameTextStyle: { color: "#bbb", fontSize: 12, padding: [0, 0, 0, -35] },
      min: yLower,
      max: yUpper,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: "#f5f5f5", type: "dashed" } },
      axisLabel: {
        fontSize: 14,
        formatter(value) {
          if (Math.abs(value - yUpper) < matchThreshold) return "{max|" + value + "}";
          if (Math.abs(value - yLower) < matchThreshold) return "{min|" + value + "}";
          return "{normal|" + value + "}";
        },
        rich: {
          max: { color: "#e74c3c", fontWeight: "bold", fontSize: 14 },
          min: { color: "#2ecc71", fontWeight: "bold", fontSize: 14 },
          normal: { color: "#999", fontSize: 14 }
        }
      }
    },
    series: [{
      type: "line",
      data: prices,
      smooth: false,
      symbol: "circle",
      symbolSize: 4,
      lineStyle: { width: 2, color: meta.color },
      itemStyle: { color: meta.color },
      markLine: markData.length
        ? { silent: true, symbol: "none", lineStyle: { width: 1.5 }, label: { fontSize: 14 }, data: markData }
        : undefined
    }]
  });
}

function renderHourlyCharts() {
  for (const group of groupSections.value) {
    for (const slot of group.slots) {
      const cellEl = cellEls.get(`${group.type}-${slot}`);
      if (cellEl) renderMiniChart(group.type, slot, cellEl);
    }
  }
}

// ========== 渲染入口 ==========
async function renderAll() {
  disposeAll();
  await nextTick();
  renderMainChart();
  renderHourlyCharts();
}

// ========== 交互 ==========
function handleChange() {
  fetchData();
}

function handleQuick(days) {
  quickDays.value = days;
  dateRange.value = null;
  fetchData();
}

function handleDateRangeChange(val) {
  if (!val || val.length !== 2) return;
  quickDays.value = 0;
  fetchData();
}

function switchType(type) {
  if (priceType.value === type) return;
  priceType.value = type;
  renderAll();
}

function handleResize() {
  if (mainChart) mainChart.resize();
  miniCharts.forEach((c) => c.resize());
}

// ========== 生命周期 ==========
onMounted(() => {
  fetchData();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  disposeAll();
});
</script>

<style scoped>
.settlement-trend-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: #f0f2f5;
  color: #1a1a2e;
  min-height: 100vh;
}
.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 1px;
  margin: 0;
}
.page-header h1 span { color: #53c1de; }
.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.control-group { display: flex; align-items: center; gap: 6px; }
.control-group label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
}
.control-group select {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.control-group select:hover { border-color: #53c1de; }
.control-group select option { background: #1a1a2e; color: #fff; }
/* 自定义日期范围（el-date-picker）深色主题适配 */
.control-group :deep(.el-date-editor) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  transition: border-color 0.2s;
}
.control-group :deep(.el-date-editor:hover) { border-color: #53c1de; }
.control-group :deep(.el-date-editor .el-input__wrapper) {
  background: transparent;
  box-shadow: none;
  padding: 0;
}
.control-group :deep(.el-date-editor .el-range-input) {
  background: transparent;
  color: #fff;
  font-size: 13px;
  height: 26px;
}
.control-group :deep(.el-date-editor .el-range-input::placeholder) { color: rgba(255, 255, 255, 0.45); }
.control-group :deep(.el-date-editor .el-range-separator) { color: rgba(255, 255, 255, 0.5); font-size: 13px; }
.control-group :deep(.el-date-editor .el-range__icon),
.control-group :deep(.el-date-editor .el-range__close-icon) { color: rgba(255, 255, 255, 0.6); }
.quick-btns, .price-type-btns { display: flex; gap: 4px; }
.quick-btns button, .price-type-btns button {
  padding: 5px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.quick-btns button:hover, .price-type-btns button:hover { border-color: #53c1de; color: #53c1de; }
.quick-btns button.active, .price-type-btns button.active {
  background: #53c1de;
  color: #1a1a2e;
  border-color: #53c1de;
  font-weight: 600;
}
.mode-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.mode-tag.mode-normal { background: rgba(83, 193, 222, 0.15); color: #53c1de; }
.mode-tag.mode-sharp { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
.main-content { padding: 12px 8px; }
/* 首次加载骨架屏 */
.skeleton-block { padding: 4px 0; }
.skeleton-card, .skeleton-main, .skeleton-cell {
  background: linear-gradient(90deg, #f2f3f5 25%, #e4e7ec 50%, #f2f3f5 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s infinite;
}
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton-card { width: 100%; height: 110px; border-radius: 12px; }
.skeleton-main { width: 100%; height: 360px; border-radius: 8px; margin-bottom: 16px; }
.skeleton-grid { margin-bottom: 16px; }
.skeleton-cell { width: 100%; height: 180px; border-radius: 6px; }
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}
.summary-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); }
.summary-card .card-label { font-size: 13px; color: #8c8c8c; margin-bottom: 8px; }
.summary-card .card-value { font-size: 28px; font-weight: 700; }
.summary-card .card-unit { font-size: 13px; color: #8c8c8c; margin-left: 4px; }
.card-sharp .card-value { color: #a93226; }
.card-peak .card-value { color: #bf4f00; }
.card-normal .card-value { color: #1f6391; }
.card-valley .card-value { color: #1e8449; }
.card-avg .card-value { color: #8e44ad; }
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 8px;
  padding-left: 10px;
  border-left: 3px solid #53c1de;
  display: flex;
  align-items: center;
  gap: 8px;
}
.main-section-title { display: flex; align-items: center; justify-content: space-between; }
.main-chart-avg { font-size: 14px; color: #666; font-weight: normal; }
.section-title .badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.badge-sharp { background: #fde8e8; color: #a93226; }
.badge-peak { background: #fef3e2; color: #bf4f00; }
.badge-normal { background: #e8f4fd; color: #1f6391; }
.badge-valley { background: #e8f8f0; color: #1e8449; }
.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.chart-main { height: 360px; }
.group-section { margin-bottom: 16px; }
.charts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.chart-cell {
  background: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.chart-cell:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.chart-cell-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.chart-cell-title .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.chart-cell-title .avg-val { font-size: 12px; font-weight: 500; margin-left: auto; color: #888; }
.dot-sharp { background: #a93226; }
.dot-peak { background: #bf4f00; }
.dot-normal { background: #1f6391; }
.dot-valley { background: #1e8449; }
.chart-mini { height: 180px; }
@media (max-width: 768px) {
  .page-header { padding: 10px 12px; }
  .page-header h1 { font-size: 16px; }
  .main-content { padding: 8px 4px; }
  .charts-grid { grid-template-columns: 1fr; }
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
