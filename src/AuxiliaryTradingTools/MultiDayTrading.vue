<template>
  <div class="main" :style="{ height: mainHeight + 'px' }">
    <div class="topbar" ref="topbarRef">
      <h1 class="page-title">多日交易</h1>
      <div class="date-control">
        <label>决策起点日</label>
        <input type="date" id="originDate" v-model="originDate" />
        <button class="btn-fetch" id="btnFetch" @click="onFetch">查询</button>
      </div>
    </div>
    <div class="meta-bar" ref="metaBarRef">
      <span
        ><span class="meta-label">市场 </span
        ><span class="meta-value" id="metaMarket">{{ metaMarket }}</span></span
      >
      <span
        ><span class="meta-label">算法 </span
        ><span class="meta-value" id="metaAlgo">{{ metaAlgo }}</span></span
      >
      <span
        ><span class="meta-label">单位 </span
        ><span class="meta-value">CNY/MWh</span></span
      >
      <span
        ><span class="meta-label">生成 </span
        ><span class="meta-value" id="metaGenerated">{{
          metaGenerated
        }}</span></span
      >
    </div>
    <div class="legend-bar" ref="legendBarRef">
      <span style="font-weight: 600; color: #475569">数轴图例：</span>
      <span
        class="legend-circle"
        style="border-color: #7890d6; background: #9fb3e8"
      ></span>
      P05/P95
      <span
        class="legend-circle"
        style="border-color: #4e66b2; background: #6c82c9"
      ></span>
      P10/P90
      <span
        class="legend-circle"
        style="border-color: #2c4084; background: #3d549e"
      ></span>
      P25/P75
      <span class="legend-diamond"></span>
      <span style="color: #c2410c; font-weight: 600">P50 中位数</span>
    </div>
    <!-- 失败提示 -->
    <div
      class="query-error-container"
      v-if="queryError"
      :style="{ height: tableHeight + 'px' }"
    >
      <div class="query-error">
        <span class="query-error-icon">!</span>
        <div class="query-error-body">
          <div class="query-error-title">多日交易策略查询失败</div>
          <div class="query-error-detail">{{ queryError }}</div>
        </div>
      </div>
    </div>
    <!-- 具体数值 -->
    <div
      v-if="!queryError"
      class="columns-container"
      id="columnsContainer"
      ref="columnsContainer"
      :style="{ height: tableHeight + 'px' }"
    ></div>
    <!--  -->
    <div class="footer-bar" ref="footerBarRef">
      DC-2 多日电价预测 · 仅供研究参考
    </div>
  </div>
  <div
    class="loading-overlay hidden"
    id="loading"
    ref="loading"
    :class="{ hidden: !loading }"
  >
    <div style="text-align: center"><div class="spinner"></div></div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import * as echarts from "echarts";
import request from "@/utils/request";
import { ElMessage } from "element-plus";

const charts = [];
const columnsContainer = ref(null);
const loading = ref(false);
const originDate = ref("2026-08-08");
const metaMarket = ref("广东");
const metaAlgo = ref("DC-2");
const metaGenerated = ref("2026-08-08 12:32");
// 查询失败时展示的第三方返回 detail 内容（为空表示当前无错误）
const queryError = ref("");

// 高度计算：仅 columns-container 内部滚动，高度 = 100vh - universal-header - topbar - meta-bar - legend-bar - footer-bar
const headerHeight = inject("headerHeight");
const mainHeight = ref(window.innerHeight);
const tableHeight = ref(0);
const topbarRef = ref(null);
const metaBarRef = ref(null);
const legendBarRef = ref(null);
const footerBarRef = ref(null);

function calcHeights() {
  const headerH = headerHeight?.value || 0;
  mainHeight.value = window.innerHeight - headerH;
  const barsH =
    (topbarRef.value?.offsetHeight || 0) +
    (metaBarRef.value?.offsetHeight || 0) +
    (legendBarRef.value?.offsetHeight || 0) +
    (footerBarRef.value?.offsetHeight || 0);
  tableHeight.value = Math.max(mainHeight.value - barsH, 0);
}

function disposeAll() {
  charts.forEach((c) => c.dispose());
  charts.length = 0;
}

function renderAll(products) {
  disposeAll();
  const byDate = {};
  products.forEach((p) => {
    (byDate[p.targetDate] ||= []).push(p);
  });
  const dates = Object.keys(byDate).sort();
  const container = columnsContainer.value;
  container.innerHTML = "";

  dates.forEach((date) => {
    const items = byDate[date].sort((a, b) => a.hour - b.hour);
    const leadDay = items[0].leadDay;

    // 以 P50 为中心对齐：计算所有小时中分位数偏离 P50 的最大距离
    let maxDev = 0;
    items.forEach((it) => {
      const p50 = it.p50CnyMwh;
      Object.values(it.quantilesCnyMwh).forEach((v) => {
        maxDev = Math.max(maxDev, Math.abs(v - p50));
      });
    });
    const offset = maxDev * 1.15;

    const col = document.createElement("div");
    col.className = "day-column";
    col.innerHTML = `<div class="day-header"><span class="date">${date}</span><span class="tag">D+${leadDay}</span></div><div class="day-body"></div>`;
    const body = col.querySelector(".day-body");

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "hour-row";
      row.innerHTML = `<div class="hour-label">${item.hour}</div><div class="hour-chart"></div><div class="hour-p50">${item.p50CnyMwh.toFixed(0)}</div>`;
      body.appendChild(row);
      const chartDom = row.querySelector(".hour-chart");
      requestAnimationFrame(() => makeChart(chartDom, item, offset));
    });
    container.appendChild(col);
  });
}

function makeChart(dom, item, offset) {
  const chart = echarts.init(dom, null, { renderer: "canvas" });
  charts.push(chart);

  const q = item.quantilesCnyMwh;
  const keys = ["p05", "p10", "p25", "p50", "p75", "p90", "p95"];
  const vals = keys.map((k) => q[k]);
  const p50 = item.p50CnyMwh;
  // 以 P50 为中心，对称设置 x 轴范围 → 所有行的 P50 纵向对齐
  const xMin = p50 - offset;
  const xMax = p50 + offset;

  const scatterData = keys.map((k) => {
    const isP50 = k === "p50";
    // 各分位数圆点填充色（靛蓝），按由浅到深：P05/P95 → P10/P90 → P25/P75（最重）
    const pointColor = isP50
      ? "#c2410c"
      : k === "p05" || k === "p95"
        ? "#9fb3e8"
        : k === "p10" || k === "p90"
          ? "#6c82c9"
          : "#3d549e";
    const pointBorder = isP50
      ? "#fff"
      : k === "p05" || k === "p95"
        ? "#7890d6"
        : k === "p10" || k === "p90"
          ? "#4e66b2"
          : "#2c4084";
    return {
      value: [q[k], 0],
      _name: k.toUpperCase(),
      _val: q[k],
      _isP50: isP50,
      symbol: "circle",
      symbolSize: 7,
      itemStyle: isP50
        ? {
            color: pointColor,
            borderColor: "#fff",
            borderWidth: 2,
            shadowBlur: 6,
            shadowColor: "rgba(194,65,12,0.35)",
          }
        : {
            color: pointColor,
            borderColor: pointBorder,
            borderWidth: 1.5,
            shadowBlur: 2,
            shadowColor: "rgba(78,102,178,0.15)",
          },
      label: {
        show: true,
        // 上下交替排布，避免相邻分位数标注重叠：p50/p10/p90 在轴下方，其余在轴上方
        position: k === "p50" || k === "p10" || k === "p90" ? "bottom" : "top",
        distance: 5,
        // formatter 必须为 string | Function，传数字会被忽略而回退默认值（y=0）
        formatter: () => Math.round(q[k]),
        fontSize: 13,
        fontWeight: isP50 ? 700 : 500,
        // 标注数值颜色与对应圆点颜色保持一致
        color: pointColor,
      },
    };
  });

  chart.setOption({
    animation: false,
    grid: { left: 4, right: 4, top: 20, bottom: 20 },
    xAxis: {
      type: "value",
      min: xMin,
      max: xMax,
      axisLine: { show: true, lineStyle: { color: "#4e66b2", width: 1.5 } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    yAxis: { type: "value", show: false, min: -1, max: 1 },
    series: [
      {
        type: "line",
        data: vals.map((v) => [v, 0]),
        lineStyle: { color: "#4e66b2", width: 1.5 },
        symbol: "none",
        silent: true,
        z: 1,
      },
      // P25→P50 段加粗（仅包含两端点，覆盖在基础线上方）
      {
        type: "line",
        data: [
          [q.p25, 0],
          [q.p50, 0],
        ],
        lineStyle: { color: "#3d549e", width: 4 },
        symbol: "none",
        silent: true,
        z: 3,
      },
      // P75→P50 段加粗
      {
        type: "line",
        data: [
          [q.p75, 0],
          [q.p50, 0],
        ],
        lineStyle: { color: "#3d549e", width: 4 },
        symbol: "none",
        silent: true,
        z: 3,
      },
      {
        type: "scatter",
        data: scatterData,
        silent: true,
        z: 5,
      },
    ],
  });
}

async function fetchForecast(date) {
  // 通过后端代理接口获取（后端持有第三方鉴权，避免令牌暴露在前端）
  const res = await request.get("/api/multiday-forecast", {
    params: { originDate: date },
  });
  const j = res.data;
  // 成功标志：message 为 "ok"（code 为 0）
  if (j.message !== "ok") {
    throw new Error(j.detail || j.message || "查询失败");
  }
  return j.data;
}

// 从异常中提取第三方返回的 detail 内容（兼容 HTTP 错误响应与业务错误体）
function extractErrorDetail(err) {
  const data = err?.response?.data;
  if (data) {
    if (typeof data.detail === "string" && data.detail) return data.detail;
    if (data.detail != null) return JSON.stringify(data.detail);
    if (typeof data.message === "string" && data.message) return data.message;
  }
  return err?.message || "未知错误";
}

function updateMeta(d) {
  metaMarket.value = d.market === "guangdong" ? "广东" : d.market;
  metaAlgo.value = d.algorithm?.algorithmId || "-";
  metaGenerated.value = (d.generatedAt || "")
    .replace("T", " ")
    .replace(/\.\d+/, "")
    .replace(/\+\d+:\d+$/, "");
}

async function loadData(date) {
  loading.value = true;
  queryError.value = "";
  try {
    const data = await fetchForecast(date);
    updateMeta(data);
    renderAll(data.products);
    ElMessage.success(`${date} 的多日交易策略查询成功`);
  } catch (e) {
    console.warn("多日交易查询失败:", e.message);
    // 查询失败：弹出错误提示，并在页面展示第三方返回的 detail 内容
    queryError.value = extractErrorDetail(e);
    ElMessage.error(`${date} 的多日交易策略查询失败`);
  } finally {
    loading.value = false;
  }
}

function onFetch() {
  const d = originDate.value;
  if (d) loadData(d);
}

function onResize() {
  calcHeights();
  charts.forEach((c) => c.resize());
}

onMounted(() => {
  nextTick(calcHeights);
  // universal-header 高度可能在其自身挂载后才上报，变化时重新计算
  if (headerHeight) watch(headerHeight, calcHeights);
  loadData("2026-08-08");
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  disposeAll();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei",
    sans-serif;
  background: #f5f6f8;
  color: #1e293b;
}

.topbar {
  background: #fff;
  border-bottom: 1px solid #e2e5ea;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.date-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.date-control label {
  font-size: 13px;
  color: #64748b;
}
.date-control input[type="date"] {
  padding: 5px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}
.btn-fetch {
  padding: 6px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}
.btn-fetch:hover {
  background: #2563eb;
}

.meta-bar {
  background: #f8fafc;
  border-bottom: 1px solid #e2e5ea;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #64748b;
}
.meta-bar > span {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 0 20px;
  border-right: 1px solid #e5e9f0;
}
.meta-bar > span:first-child {
  padding-left: 0;
}
.meta-bar > span:last-child {
  border-right: none;
}
.meta-label {
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 0.5px;
}
.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  font-variant-numeric: tabular-nums;
}

.legend-bar {
  padding: 8px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  color: #94a3b8;
}
.legend-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid;
  display: inline-block;
}
.legend-diamond {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c2410c;
  display: inline-block;
}

.columns-container {
  padding: 0 16px 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  overflow-y: scroll;
}
.query-error-container {
  padding: 0 16px 16px;
  overflow-y: auto;
}

/* 查询失败提示条：展示第三方返回的 detail 内容（横跨三列 grid） */
.query-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  border-radius: 6px;
}
.query-error-icon {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 18px;
  margin-top: 1px;
}
.query-error-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.query-error-title {
  font-size: 13px;
  font-weight: 600;
  color: #b91c1c;
}
.query-error-detail {
  font-size: 12px;
  color: #7f1d1d;
  word-break: break-all;
}
.day-column {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e5ea;
  /* 不能设 overflow: hidden：它会使 grid 子项 min-height:auto 失效（自动最小尺寸变 0），
     导致列被压缩到容器高度、内容被裁剪，且 columns-container 无溢出无法滚动 */
}
.day-header {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e5ea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafbfc;
  /* 列头背景补齐顶部圆角（列高由内容决定后不再依赖 overflow 裁剪） */
  border-radius: 7px 7px 0 0;
}
.day-header .date {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}
.day-header .tag {
  font-size: 12px;
  padding: 1px 7px;
  border-radius: 8px;
  background: #f0f2f5;
  color: #64748b;
  font-weight: 600;
}

.hour-row {
  display: flex;
  align-items: center;
  padding: 10px 6px 10px 8px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s ease;
}
.hour-row:last-child {
  border-bottom: none;
}
.hour-row:hover {
  background: #eef1f8;
  box-shadow: inset 2px 0 0 #3d549e;
}
.hour-label {
  width: 30px;
  font-size: 15px;
  font-weight: 500;
  color: #606162;
  flex-shrink: 0;
  text-align: right;
  padding-right: 6px;
}
.hour-chart {
  flex: 1;
  height: 54px;
}
.hour-p50 {
  width: 44px;
  font-size: 15px;
  font-weight: 600;
  color: #c2410c;
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.loading-overlay.hidden {
  display: none;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e5ea;
  border-top-color: #475569;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer-bar {
  padding: 8px 24px;
  text-align: center;
  font-size: 11px;
  color: #b0b8c4;
  background: #fff;
  border-top: 1px solid #e2e5ea;
}
</style>
