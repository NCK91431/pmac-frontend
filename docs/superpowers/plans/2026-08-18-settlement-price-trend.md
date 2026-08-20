# 结算电价走势页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在「电价分析」模块下新增「结算电价走势」页面（`/price-analysis/settlement-trend`），100% 复刻原型图视觉，展示多日实际结算电价的日均趋势与 24 个分时电价图表。

**Architecture:** 后端在 `settlementPrice.js` 新增 `GET /api/settlement-price/trend`，逐日调用已验证可用的第三方接口 `all/price/chart`（`id='2'` 日前结算 / `id='4'` 实时结算）聚合为多日二维数组，前端一次请求获取后，用 ECharts 渲染主趋势图（平滑曲线 + 均值/最高/最低标注）与按尖峰/峰/平/谷分组的 24 个分时折线图（Y 轴上限红加粗 / 下限绿加粗）。

**Tech Stack:** Vue 3（`<script setup>`）、Element Plus（`el-select` 未使用，用原生控件复刻原型）、ECharts 5、Express、axios（`@/utils/request` 带动态签名）

**前置依赖（已验证，勿重复探索）：**
- 第三方接口 `all/price/chart` 由后端 `fetchSettlementChart(date)` 封装（`backend-code/routes/settlementPrice.js` 第 53-62 行）
- 前端请求封装 `@/utils/request`，响应拦截器返回**完整 response 对象**，调用处需 `res.data.data` 取业务数据；`PROTECTED_PATHS` 第 18 行控制动态签名
- 路由与侧边栏都在 `frontend-code/src/router/index.js`（routes 在 247-266 行、`sidebarMenuConfig.price_analysis` 在 435-444 行）
- Element Plus 已在 `src/main.js` 全局注册（`v-loading` 可用）
- 原型图：`frontend-code/新需求文档/结算电价走势/结算电价走势原型图.html`（设计文档：`docs/superpowers/specs/2026-08-18-settlement-price-trend-design.md`）

**验证方式（本项目无前端测试框架，后端仅 signature 测试）：**
- 后端：`node --check` 语法检查 + 启动服务后 curl 验证路由挂载（预期 400/401 而非 404）
- 前端：`npm run dev` 启动无编译错误
- 浏览器端到端验证与接口场景验证由**用户自行测试**（项目约定）

---

### Task 1: 后端新增多日聚合接口 `GET /api/settlement-price/trend`

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/routes/settlementPrice.js`（在 `/analysis` 路由之后、`module.exports` 之前追加）

- [ ] **Step 1: 在 settlementPrice.js 末尾（`module.exports = router;` 之前）追加 /trend 路由**

在现有 `/analysis` 路由（第 124 行 `});` 之后）插入以下代码：

```js
/**
 * 多日结算电价走势聚合接口
 * GET /api/settlement-price/trend?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * 逐日调用 all/price/chart，提取 id='2'（日前结算）与 id='4'（实时结算）的 24 点值；
 * 单日失败时该日数据为 null，不影响整体返回。
 */
router.get('/trend', requireSignature, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate || !DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
      return res.status(400).json({ success: false, error: '缺少必填参数 startDate/endDate（格式 YYYY-MM-DD）' });
    }
    if (endDate < startDate) {
      return res.status(400).json({ success: false, error: 'endDate 不能早于 startDate' });
    }
    const MAX_DAYS = 45;
    const total = Math.round((new Date(endDate + 'T00:00:00') - new Date(startDate + 'T00:00:00')) / 86400000) + 1;
    if (total > MAX_DAYS) {
      return res.status(400).json({ success: false, error: `日期范围不能超过 ${MAX_DAYS} 天` });
    }

    const dates = [];
    const dayAhead = [];
    const realTime = [];
    for (let i = 0; i < total; i++) {
      const date = addDays(startDate, i);
      dates.push(date);
      try {
        const chartData = await fetchSettlementChart(date);
        const rows = Array.isArray(chartData) ? chartData : [];
        const daily = (rows.find((e) => e.id === '2') || {}).dataList || [];
        const real = (rows.find((e) => e.id === '4') || {}).dataList || [];
        dayAhead.push(daily.map((p) => (p && p.value != null ? p.value : null)));
        realTime.push(real.map((p) => (p && p.value != null ? p.value : null)));
      } catch (err) {
        console.error(`[settlementPrice] /trend 单日 ${date} 获取失败:`, err.message);
        dayAhead.push(null);
        realTime.push(null);
      }
    }

    res.json({ success: true, data: { startDate, endDate, dates, dayAhead, realTime } });
  } catch (error) {
    handleError(res, error, '获取多日结算电价失败');
  }
});
```

- [ ] **Step 2: 语法检查**

Run: `node --check /Users/guansiyu/Desktop/backend-code/routes/settlementPrice.js`
Expected: 无输出、退出码 0（语法正确）

- [ ] **Step 3: 启动后端并验证路由挂载（非 404）**

Run: `cd /Users/guansiyu/Desktop/backend-code && npm run dev`（非阻塞）
在另一终端：`curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/settlement-price/trend"`
Expected: `401`（无 token，路由已挂载且过了签名/鉴权中间件）——若返回 `404` 说明路由未生效，检查挂载位置（`app.js` 第 126 行 `app.use("/api/settlement-price", settlementPriceRouter)` 已存在，无需改动）

- [ ] **Step 4: Commit**

```bash
cd /Users/guansiyu/Desktop/backend-code && git add routes/settlementPrice.js && git commit -m "feat: 新增多日结算电价聚合接口 /trend"
```

---

### Task 2: 前端 API 封装、签名注册、路由与侧边栏菜单

**Files:**
- Create: `/Users/guansiyu/Desktop/frontend-code/src/pages/PriceAnalysis/SettlementTrend/api.js`
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/utils/request.js`（第 18 行 `PROTECTED_PATHS`）
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/router/index.js`（routes 266 行后新增路由；435-444 行 `price_analysis.children` 追加菜单项）

- [ ] **Step 1: 创建 api.js**

```js
import request from '@/utils/request'

const BASE = '/api/settlement-price'

// 多日结算电价走势（后端逐日聚合 all/price/chart，id='2' 日前结算 / id='4' 实时结算）
// 响应拦截器返回完整 response 对象，调用处需用 res.data.data 取业务数据
export function getSettlementPriceTrend({ startDate, endDate }) {
    return request.get(`${BASE}/trend`, { params: { startDate, endDate } })
}
```

- [ ] **Step 2: request.js 注册受保护路径**

将第 18 行：

```js
const PROTECTED_PATHS = ["/api/node-price/price-chart", "/api/settlement-price/analysis"];
```

改为：

```js
const PROTECTED_PATHS = ["/api/node-price/price-chart", "/api/settlement-price/analysis", "/api/settlement-price/trend"];
```

- [ ] **Step 3: 新增路由（router/index.js 第 266 行 `},` 之后、第 267 行 `{` 之前插入）**

```js
        {
            path: "/price-analysis/settlement-trend",
            name: "PriceAnalysisSettlementTrend",
            component: () => import("@/pages/PriceAnalysis/SettlementTrend/index.vue"),
            meta: {
                module: "trading",
                requiresMembership: true,
                breadcrumb: { title: "结算电价走势", icon: "bi bi-graph-up-arrow", parentRouteName: "price_analysis" },
            },
        },
```

- [ ] **Step 4: 侧边栏菜单追加第三项（router/index.js 第 441-443 行）**

将：

```js
        children: [
            { title: "节点电价查询", route: "/price-analysis" },
            { title: "结算电价预测与查看", route: "/price-analysis/settlement" },
        ]
```

改为：

```js
        children: [
            { title: "节点电价查询", route: "/price-analysis" },
            { title: "结算电价预测与查看", route: "/price-analysis/settlement" },
            { title: "结算电价走势", route: "/price-analysis/settlement-trend" },
        ]
```

- [ ] **Step 5: 验证前端编译**

Run: `cd /Users/guansiyu/Desktop/frontend-code && npm run dev`（非阻塞）
Expected: Vite 启动成功无报错（此时 index.vue 尚不存在，路由为懒加载，编译期不报错；Task 3 完成后路由可正常访问）

- [ ] **Step 6: Commit**

```bash
cd /Users/guansiyu/Desktop/frontend-code && git add src/pages/PriceAnalysis/SettlementTrend/api.js src/utils/request.js src/router/index.js && git commit -m "feat: 结算电价走势页面 API 封装、签名注册与路由菜单"
```

---

### Task 3: 前端主页面 SettlementTrend/index.vue（100% 复刻原型图）

**Files:**
- Create: `/Users/guansiyu/Desktop/frontend-code/src/pages/PriceAnalysis/SettlementTrend/index.vue`

- [ ] **Step 1: 创建 index.vue（完整代码如下）**

```vue
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
            <button v-for="d in [7, 15, 30]" :key="d" :data-days="d" :class="{ active: quickDays === d && !customStart && !customEnd }" @click="handleQuick(d)">近{{ d }}天</button>
          </div>
        </div>
        <div class="control-group">
          <label>自定义：</label>
          <input type="date" v-model="customStart" :max="todayStr" @change="handleCustomChange" />
          <span class="sep">~</span>
          <input type="date" v-model="customEnd" :max="todayStr" @change="handleCustomChange" />
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
    <div class="main-content" v-loading="loading">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { getSettlementPriceTrend } from "./api.js";

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
const customStart = ref("");
const customEnd = ref("");
const priceType = ref("realtime"); // 'dayAhead' | 'realtime'
const loading = ref(false);
const trendData = ref(null); // { dates, dayAhead, realTime }

const todayStr = (() => {
  const t = new Date();
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

function getDateRange() {
  const endStr = customEnd.value || todayStr;
  const startStr = customStart.value || fmtDate(new Date(new Date(endStr + "T00:00:00").getTime() - (quickDays.value - 1) * 86400000));
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

// daily: 每日 24 点非空值的平均；整日全空为 null
const daily = computed(() =>
  matrix.value.map((row) => {
    if (!Array.isArray(row)) return null;
    const valid = row.filter((v) => v != null);
    if (!valid.length) return null;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  })
);

const avgAll = computed(() => {
  const valid = daily.value.filter((v) => v != null);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
});

const mainAvgText = computed(() => (avgAll.value == null ? "--" : avgAll.value.toFixed(2)));

const summaryCards = computed(() => {
  const cards = [];
  cards.push({ key: "avg", label: "区间日均价", value: avgAll.value == null ? "--" : avgAll.value.toFixed(2) });
  for (const type of groupOrder.value) {
    if (!config.value[type]) continue;
    const slots = config.value[type];
    let sum = 0, count = 0;
    for (const slot of slots) {
      const valid = (hourly.value[slot]?.prices || []).filter((v) => v != null);
      sum += valid.reduce((a, b) => a + b, 0);
      count += valid.length;
    }
    cards.push({ key: type, label: `${TYPE_META[type].label}时段均价`, value: count ? (sum / count).toFixed(2) : "--" });
  }
  return cards;
});

const groupSections = computed(() =>
  groupOrder.value
    .filter((t) => config.value[t])
    .map((t) => ({ type: t, label: TYPE_META[t].label, slots: config.value[t] }))
);

function getSlotAvg(type, slot) {
  const valid = (hourly.value[slot]?.prices || []).filter((v) => v != null);
  if (!valid.length) return "--";
  return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
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
            <span style="font-weight:600;margin-left:auto">${p.value == null ? "--" : p.value} 元/MWh</span>
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
              const maxVal = Math.max(...valid);
              const minVal = Math.min(...valid);
              const avgVal = valid.reduce((s, v) => s + v, 0) / valid.length;
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
  const maxVal = valid.length ? Math.max(...valid) : null;
  const minVal = valid.length ? Math.min(...valid) : null;
  const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;

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
        xAxis: labels[prices.indexOf(maxVal)],
        lineStyle: { color: "#e74c3c", type: "dashed", width: 1.5 },
        label: { formatter: "最高 " + maxVal.toFixed(2), color: "#e74c3c", position: "end", fontSize: 14 }
      },
      {
        xAxis: labels[prices.indexOf(minVal)],
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
        return `<div style="font-weight:600">${params[0].axisValue}</div><div>${params[0].value == null ? "--" : params[0].value} 元/MWh</div>`;
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
  customStart.value = "";
  customEnd.value = "";
  fetchData();
}

function handleCustomChange() {
  if (!customStart.value || !customEnd.value) return;
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
.control-group select,
.control-group input[type="date"] {
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
.control-group select:hover,
.control-group input[type="date"]:hover { border-color: #53c1de; }
.control-group select option { background: #1a1a2e; color: #fff; }
.control-group input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
.control-group .sep { color: rgba(255, 255, 255, 0.5); }
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
```

- [ ] **Step 2: 验证编译**

Run: `cd /Users/guansiyu/Desktop/frontend-code && npm run dev`（非阻塞）
Expected: Vite 编译成功，无 import 报错、无语法错误；浏览器访问 `/price-analysis/settlement-trend` 页面正常渲染（用户自测）

- [ ] **Step 3: Commit**

```bash
cd /Users/guansiyu/Desktop/frontend-code && git add src/pages/PriceAnalysis/SettlementTrend/index.vue && git commit -m "feat: 结算电价走势页面（多日趋势 + 24 分时图，100% 复刻原型图）"
```

---

## Self-Review

**1. Spec 覆盖自查：**
- 页面头部（标题/月份/快捷按钮/自定义日期/模式标签）→ Task 3 模板 + 状态逻辑 ✔
- 汇总卡片（4/5 张、颜色）→ `summaryCards` computed + CSS ✔
- 日均趋势图（平滑/面积/白边圆点/三条 markLine/标题行均值）→ `renderMainChart` ✔
- 分时图表（分组/badge/3列/180px/非平滑/均值线/最高最低竖线/Y 轴红绿刻度）→ `renderMiniChart` + `charts-grid` ✔
- 时段配置 TOU_CONFIG / TYPE_META / 颜色方案 → Task 3 Step 1 顶部常量 ✔
- 交互（月份/快捷/自定义/日前实时切换/Tooltip）→ `handleChange/handleQuick/handleCustomChange/switchType` + tooltip 配置 ✔
- 后端聚合接口 → Task 1 ✔
- 路由/侧边栏/签名注册 → Task 2 ✔
- null 值处理（滞后 6 天）→ `daily`/`hourly` 过滤非空、`valid.length` 守卫 markLine 与 Y 轴 ✔

**2. 占位符扫描：** 无 TODO/TBD；所有代码步骤含完整可执行代码。

**3. 类型/命名一致性：** 
- `getSettlementPriceTrend({startDate, endDate})`（api.js）↔ 前端调用 `getSettlementPriceTrend({ startDate, endDate })` ✔
- 后端返回 `data.dates / dayAhead / realTime` ↔ 前端 `trendData.value.dates / realTime / dayAhead`、`matrix` 选择 `priceType` ✔
- `setCellRef(type, slot, el)` ↔ 模板 `:ref` 绑定 ✔
- `renderMiniChart(type, slot, cellEl)` 从 `cellEl.querySelector(".chart-mini")` 取图表容器 ↔ 模板 cell 内 `.chart-mini` div ✔
- `fetchData` 中 `await renderAll()` → `disposeAll()` + `nextTick()` 后再 init，避免实例与 DOM 不同步 ✔

**4. 已知取舍：** 分时图 `avg` 用 `toFixed(2)` 展示，原型为 `Math.round(...*100)/100`（数值上等价）；快捷按钮 active 条件加 `!customStart && !customEnd`（自定义日期时取消快捷高亮，符合原型交互）。
