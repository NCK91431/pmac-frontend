# 日前用电侧申报 V2 前端实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现日前用电侧申报 V2 完整前端功能，包括三步流程、AI 查询、多日期电价对比、16列策略申报表

**Architecture:** 在 `src/DailyDemandReportV2/` 下新建独立页面，不修改 v1 代码（`src/AuxiliaryTradingTools/DailyDemandReport.vue`）。使用 Pinia store 管理三步流程状态，新建 12 个组件（严格遵循设计稿），复用 4 个组件（不做任何修改），Vue Router 添加新路由 `/daily-demand-report-v2`

**Tech Stack:** Vue 3 (Composition API + script setup) + Element Plus + Bootstrap 5 + Pinia + ECharts 5 + Axios

---

## 文件结构

```
src/DailyDemandReportV2/
├── index.vue                    # 主页面容器，三步流程编排
├── api/
│   └── index.js                 # v2 接口封装
├── composables/
│   └── useStepNavigation.js     # 步骤导航逻辑
└── components/
    ├── StepBarV2.vue            # 步骤条（新建）
    ├── DateTargetBanner.vue     # 申报目标日期横幅（新建）
    ├── WeatherInfoV2.vue        # 天气信息增强版（新建）
    ├── PriceChartV2.vue         # 电价图表增强版（新建）
    ├── UnifiedDispatchChartV2.vue # 统调曲线增强版（新建）
    ├── AiQueryPanel.vue         # AI 查询面板（新建）
    ├── QueryResultTable.vue     # 查询结果表格（新建）
    ├── SelectedDatesTable.vue    # 已选中日期管理（新建）
    ├── PriceComparisonTable.vue # 多日期电价对比表（新建）
    ├── StrategyTableV2.vue      # 16列策略申报表（新建）
    ├── ConfirmModal.vue         # 确认弹窗（新建）
    └── SuccessModal.vue         # 成功弹窗（新建）

src/store/
└── dailyDeclarationV2.js        # v2 Pinia store（新建）

src/router/index.js              # 添加 v2 路由和侧边栏（修改）
src/components/Breadcrumb.vue    # 添加 v2 面包屑映射（修改）
```

### Task 1: Pinia Store — dailyDeclarationV2.js

**Files:**

- Create: `src/store/dailyDeclarationV2.js`

Store manages all state for the three-step wizard:

```javascript
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  manualDateApi,
  priceComparisonApi,
  strategyDataApi,
  submitApi,
} from "@/DailyDemandReportV2/api";

export const useDailyDeclarationV2Store = defineStore(
  "dailyDeclarationV2",
  () => {
    const currentStep = ref(1);

    // Step 1 - 申报日期
    const declarationDate = ref("");
    const dateInfo = ref(null);
    const weatherData = ref(null);
    const priceData = ref(null);
    const dispatchData = ref(null);

    // Step 2 - AI 查询
    const aiQueryText = ref("");
    const queryResults = ref([]);
    const selectedDates = ref([]);
    const manualDates = ref([]);

    // Step 3 - 策略申报
    const priceComparisonData = ref(null);
    const strategyData = ref(null);
    const adjustedRatios = ref({});
    const actualQuantities = ref({});

    const allSelectedDates = computed(() => {
      const fromQuery = selectedDates.value.filter((d) => !d.isManual);
      const fromManual = manualDates.value.map((d) => ({
        ...d,
        isManual: true,
      }));
      const merged = [...fromQuery, ...fromManual];
      merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      return merged;
    });

    function setDeclarationDate(date) {
      declarationDate.value = date;
    }
    function setDateInfo(info) {
      dateInfo.value = info;
    }
    function setCurrentStep(step) {
      currentStep.value = step;
    }

    async function fetchDateInfo(date) {
      const res = await manualDateApi(date);
      if (res.success) {
        dateInfo.value = res.data;
      }
      return res;
    }

    async function fetchPriceComparison(dates) {
      const res = await priceComparisonApi(dates);
      if (res.success) {
        priceComparisonData.value = res.data;
      }
      return res;
    }

    async function fetchStrategyData(declarationDate, spreadInfo) {
      const res = await strategyDataApi(declarationDate, spreadInfo);
      if (res.success) {
        strategyData.value = res.data;
      }
      return res;
    }

    async function submitDeclaration(payload) {
      return await submitApi(payload);
    }

    function addQueryResult(item) {
      if (!selectedDates.value.find((d) => d.date === item.date)) {
        selectedDates.value.push({ ...item, isManual: false });
      }
    }

    function removeSelectedDate(date) {
      selectedDates.value = selectedDates.value.filter((d) => d.date !== date);
      manualDates.value = manualDates.value.filter((d) => d.date !== date);
    }

    function addManualDate(dateInfo) {
      if (!manualDates.value.find((d) => d.date === dateInfo.date)) {
        manualDates.value.push({ ...dateInfo, isManual: true });
      }
    }

    function clearAllSelected() {
      selectedDates.value = [];
      manualDates.value = [];
    }

    function setAdjustedRatio(period, ratio) {
      adjustedRatios.value[period] = ratio;
    }

    function setActualQuantity(period, quantity) {
      actualQuantities.value[period] = quantity;
    }

    function resetAll() {
      currentStep.value = 1;
      declarationDate.value = "";
      dateInfo.value = null;
      weatherData.value = null;
      priceData.value = null;
      dispatchData.value = null;
      aiQueryText.value = "";
      queryResults.value = [];
      selectedDates.value = [];
      manualDates.value = [];
      priceComparisonData.value = null;
      strategyData.value = null;
      adjustedRatios.value = {};
      actualQuantities.value = {};
    }

    return {
      currentStep,
      declarationDate,
      dateInfo,
      weatherData,
      priceData,
      dispatchData,
      aiQueryText,
      queryResults,
      selectedDates,
      manualDates,
      allSelectedDates,
      priceComparisonData,
      strategyData,
      adjustedRatios,
      actualQuantities,
      setDeclarationDate,
      setDateInfo,
      setCurrentStep,
      fetchDateInfo,
      fetchPriceComparison,
      fetchStrategyData,
      submitDeclaration,
      addQueryResult,
      removeSelectedDate,
      addManualDate,
      clearAllSelected,
      setAdjustedRatio,
      setActualQuantity,
      resetAll,
    };
  },
);
```

### Task 2: API 封装 — api/index.js

**Files:**

- Create: `src/DailyDemandReportV2/api/index.js`

```javascript
import request from "@/utils/request";

const BASE = "/api/daily-declaration/v2";

export function manualDateApi(date) {
  return request.post(`${BASE}/manual-date`, { date });
}

export function priceComparisonApi(dates) {
  return request.post(`${BASE}/price-comparison-table`, { dates });
}

export function strategyDataApi(declarationDate, priceSpreadInformation) {
  return request.post(`${BASE}/strategy-data`, {
    declaration_date: declarationDate,
    price_spread_information: priceSpreadInformation,
  });
}

export function submitApi(payload) {
  return request.post(`${BASE}/submit`, payload);
}

export function historyDatesApi() {
  return request.get(`${BASE}/history/dates`);
}

export function historyDetailApi(date) {
  return request.get(`${BASE}/history`, { params: { date } });
}
```

### Task 3: StepBarV2 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/StepBarV2.vue`

3-step indicator bar following design mockup:

- Step 1: "选择申报日期" (blue circle `1`)
- Step 2: "筛选可用数据源" (green circle `2`)
- Step 3: "申报 — 策略申报表" (purple circle `3`)
- Separator arrows `›` between steps
- Active/completed/disabled states

Props: `currentStep` (Number)
Emits: none (display only)

### Task 4: DateTargetBanner 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/DateTargetBanner.vue`

Gradient blue background banner showing target date info:

- "🎯 申报目标日期" label
- Date, weekday, date type, temperature, weather
- White separator lines between fields

Props: `dateInfo` (Object)

### Task 5: WeatherInfoV2 / PriceChartV2 / UnifiedDispatchChartV2 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/WeatherInfoV2.vue`
- Create: `src/DailyDemandReportV2/components/PriceChartV2.vue`
- Create: `src/DailyDemandReportV2/components/UnifiedDispatchChartV2.vue`

These are wrapper components that import the original components from `AuxiliaryTradingTools/components/` and add the design mockup's title bar and data source labels.

### Task 6: AiQueryPanel 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/AiQueryPanel.vue`

Card with:

- Title "💬 输入查询需求"
- Textarea with placeholder "例如：查找前7个星期三且是雨天且温度在23至26度之间的日期"
- "发送查询" button → POST /api/ai/query
- Loading state while querying

Props: none
Emits: `query-results` (Array)

### Task 7: QueryResultTable 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/QueryResultTable.vue`

15-column table showing AI query results:

- Columns: #/日期/星期/日期类型/节假日/最低温/最高温/凌云量/上午云量/下午云量/晚上云量/风速/风向°/天气/操作
- Blue row for selected items
- "☑ 全选" / "⬜ 取消全选" buttons in header
- Row actions: "＋选中" / "✔ 已选"

Props: `results` (Array), `selectedDates` (Array)
Emits: `select`, `deselect`, `select-all`, `deselect-all`

### Task 8: SelectedDatesTable 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/SelectedDatesTable.vue`

Blue-bordered card with:

- Title "📋 已选中日期" + badge "共 N 条记录"
- Toolbar: date picker + "确认添加" + "🗑 移除全部"
- Same 15-column table
- Blue rows (from query), orange rows (manual)
- Row action: "✕ 移除"
- Legend: color explanations + sort note

Props: `selectedDates` (Array)
Emits: `remove`, `add-manual`, `remove-all`

### Task 9: PriceComparisonTable 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/PriceComparisonTable.vue`

Green-bordered card with nested header table:

- Title "⚡ 多日期电价横向对比表" + badge "el-table 嵌套表头"
- 电价列取值逻辑说明行 (4 colored tag-pills)
- Nested dual-header: left fixed "时段" → N dates × 3 columns (日前节点/实时节点/价差) → right fixed "价差方向"/"日前低概率"
- Price rules annotations

Props: `data` (Object), `dates` (Array)
Emits: none

### Task 10: StrategyTableV2 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/StrategyTableV2.vue`

Deep blue-purple bordered card with:

- Title "📋 日前用电侧申报策略表" + badge "16列 · 双表头"
- Fixed column hints
- Dual-header 16 columns: 时间(fixed) → 合约电量×5(蓝底) → 用户评估 → 价差方向 → 日前低概率 → 方案一 → 建议调整比例 → 方案二 → 日前申报电量 → 申报比例 → 调整申报比例(黄底, editable, right-fixed) → 实际申报电量(right-fixed)
- Editable cells (✎ marker, yellow background)
- Stats bar: 总时段数/已调整/默认比例
- Action buttons: "📋 一键复制结果" / "📥 导出用电侧申报结果"
- Calculation logic annotations

Props: `data` (Array), `summary` (Object), `ratios` (Object), `quantities` (Object)
Emits: `update-ratio`, `update-quantity`

### Task 11: ConfirmModal / SuccessModal 组件

**Files:**

- Create: `src/DailyDemandReportV2/components/ConfirmModal.vue`
- Create: `src/DailyDemandReportV2/components/SuccessModal.vue`

ConfirmModal:

- Title "确认操作", body with custom message
- "取消" / "确认" buttons
- Props: `visible` (Boolean), `message` (String)
- Emits: `confirm`, `cancel`

SuccessModal:

- Title "申报已完成 ✓"
- Body with success message
- "继续查看" / "查看历史记录" buttons
- Props: `visible` (Boolean)
- Emits: `continue`, `view-history`

### Task 12: useStepNavigation composable

**Files:**

- Create: `src/DailyDemandReportV2/composables/useStepNavigation.js`

```javascript
import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";
import { useRouter } from "vue-router";

export function useStepNavigation() {
  const store = useDailyDeclarationV2Store();
  const router = useRouter();

  async function goToStep2() {
    if (!store.declarationDate) return;
    const res = await store.fetchDateInfo(store.declarationDate);
    if (res.success) {
      store.currentStep.value = 2;
    }
  }

  async function goToStep3() {
    store.currentStep.value = 3;
    const dates = store.allSelectedDates.map((d) => d.date);
    const priceRes = await store.fetchPriceComparison(dates);
    if (priceRes.success && priceRes.data?.periods) {
      const spreadInfo = priceRes.data.periods.map((p) => ({
        period: p.period,
        spread_direction: p.spread_direction,
        low_probability: p.low_probability,
      }));
      await store.fetchStrategyData(store.declarationDate, spreadInfo);
    }
  }

  function goBackToStep1() {
    store.currentStep.value = 1;
  }

  function goBackToStep2() {
    store.currentStep.value = 2;
  }

  function goToHistory() {
    router.push("/daily-demand-report/history");
  }

  return { goToStep2, goToStep3, goBackToStep1, goBackToStep2, goToHistory };
}
```

### Task 13: 主页面 — index.vue

**Files:**

- Create: `src/DailyDemandReportV2/index.vue`

Main page container orchestrating all three steps:

- Uses `useDailyDeclarationV2Store` and `useStepNavigation`
- StepBarV2 at top
- Step 1: Date input + DateInfoDisplay + 3 data dashboard cards (WeatherInfoV2, PriceChartV2, UnifiedDispatchChartV2) + Next button
- Step 2: DateTargetBanner + AiQueryPanel + QueryResultTable + SelectedDatesTable + Nav buttons
- Step 3: Data flow bar + DateTargetBanner + PriceComparisonTable + StrategyTableV2 + Nav buttons
- ConfirmModal and SuccessModal

### Task 14: Router 和 Breadcrumb 修改

**Files:**

- Modify: `src/router/index.js` — add v2 route + sidebar entry
- Modify: `src/components/Breadcrumb.vue` — add breadcrumb mapping

### Task 15: 设计稿 CSS 样式文件

**Files:**

- Create: `src/DailyDemandReportV2/styles/index.css`

Global styles for v2 components matching the design mockup:

- StepBar styles (step-item, step-num circle, step-arrow)
- DateTargetBanner gradient background
- Card borders (green #52c41a, blue, deep blue-purple #1d39c4)
- Table row colors (blue row-selected, orange row-added)
- Stat bar styles
- Annotation styles
- Modal styles

---

## Task Dependencies

```
Task 1 (Store) ────┐
Task 2 (API) ──────┤
                    ├── Task 13 (index.vue) ─── Task 14 (Router)
Task 3-12 (Comps) ──┘
Task 15 (Styles) ───┘
```

Tasks 1-12 and 15 can be implemented in parallel. Task 13 depends on all of them. Task 14 is independent.

## 关键约束

1. **严格遵循设计稿**：所有新建组件（12 个）必须 100% 按照 `新需求文档/日前用电侧申报V2设计稿.html` 实现
2. **复用组件不修改**：DateInfoDisplay/WeatherInfo/PriceChart/UnifiedDispatchChart 保持原始样式
3. **不修改 v1 代码**：不能改动 `src/AuxiliaryTradingTools/DailyDemandReport.vue`
4. **全屏布局**：页面使用全屏布局
5. **JWT 认证**：strategy-data 和 submit 接口需要 Bearer Token
6. **链式调用**：Step 2 → Step 3 先调 price-comparison-table，成功后调 strategy-data
7. **布局**：Element Plus el-container/el-main + Bootstrap flex/grid
