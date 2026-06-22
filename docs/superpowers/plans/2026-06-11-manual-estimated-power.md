# 用户评估电量手动输入模式 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 StrategyTableV2 组件的用户评估电量列增加手动粘贴输入模式，支持粘贴后调后端接口重新计算全部字段。

**Architecture:** 前端 StrategyTableV2 组件管理 `api`/`manual` 两种模式状态；手动模式下列变为输入框 → 粘贴 → 确认 → 调后端 POST /strategy-data（带 `manual_user_estimated` 参数）→ 后端跳过 VPP API，用传入值重算全部字段。切换回 API 模式时不传 manual 参数，重新调 VPP API 获取原始数据。

**Tech Stack:** Vue 3 + Element Plus (StrategyTableV2), Node.js Express (后端路由/服务)

---

### Task 1: 后端 — 支持 manual_user_estimated 参数

**Files:**
- Modify: `backend-code/routes/dailyDeclarationV2.js`
- Modify: `backend-code/services/dailyStrategyService.js`

- [ ] **Step 1.1: 后端路由解析新增参数**

在 `backend-code/routes/dailyDeclarationV2.js` 第 160 行，从 `req.body` 中解构新增的 `manual_user_estimated`：

```js
// 修改前
const { declaration_date, price_spread_information } = req.body;

// 修改后
const { declaration_date, price_spread_information, manual_user_estimated } = req.body;
```

- [ ] **Step 1.2: 将 manual_user_estimated 传入 getStrategyData**

在第 176 行，将 `manual_user_estimated` 传入 `getStrategyData`：

```js
// 修改前
const result = await getStrategyData(declaration_date, spreadInfoObject);

// 修改后
const result = await getStrategyData(declaration_date, spreadInfoObject, manual_user_estimated);
```

- [ ] **Step 1.3: getStrategyData 增加第三个参数 + 条件跳过 VPP API**

在 `backend-code/services/dailyStrategyService.js` 第 136 行，修改函数签名和 `Promise.allSettled` 逻辑：

```js
// 修改前
async function getStrategyData(declarationDate, priceSpreadInformation) {
  const [c1, c2, c3, c4, estimationResult] = await Promise.allSettled([
    fetchTradingData(declarationDate, 2, 5),
    fetchTradingData(declarationDate, 3, 5),
    fetchTradingData(declarationDate, 4, 5),
    fetchTradingData(declarationDate, 5, 5),
    fetchUserEstimation(declarationDate),
  ]);
  // ...
  const estimationData = buildUserEstPeriodMap(estimationResult.status === 'fulfilled' ? estimationResult.value : null);

// 修改后
async function getStrategyData(declarationDate, priceSpreadInformation, manualUserEstimated = null) {
  let estimationData;

  if (manualUserEstimated && Array.isArray(manualUserEstimated) && manualUserEstimated.length === 24) {
    // 使用手动传入值，跳过 VPP API
    estimationData = buildManualEstPeriodMap(manualUserEstimated);
  } else {
    const estimationResult = await Promise.allSettled([
      fetchUserEstimation(declarationDate),
    ]);
    estimationData = buildUserEstPeriodMap(estimationResult[0].status === 'fulfilled' ? estimationResult[0].value : null);
  }

  const [c1, c2, c3, c4] = await Promise.allSettled([
    fetchTradingData(declarationDate, 2, 5),
    fetchTradingData(declarationDate, 3, 5),
    fetchTradingData(declarationDate, 4, 5),
    fetchTradingData(declarationDate, 5, 5),
  ]);
  // 以下计算逻辑完全不变...
```

- [ ] **Step 1.4: 新增 buildManualEstPeriodMap 辅助函数**

在 `dailyStrategyService.js` 中 `buildUserEstPeriodMap` 函数附近添加：

```js
function buildManualEstPeriodMap(manualValues) {
  // manualValues: [v0, v1, v2, ..., v23]
  const map = {};
  for (let i = 0; i < 24; i++) {
    const label = String(i).padStart(2, '0') + ':00';
    map[label] = manualValues[i] !== undefined && manualValues[i] !== null
      ? Number(manualValues[i])
      : 0;
  }
  return map;
}
```

- [ ] **Step 1.5: 验证后端改动**

检查文件语法：
```bash
cd /Users/guansiyu/Desktop/backend-code && node -c services/dailyStrategyService.js && node -c routes/dailyDeclarationV2.js
```
Expected: 无语法错误输出（仅输出文件名或空）

### Task 2: 前端 API — 修改 strategyDataApi

**Files:**
- Modify: `frontend-code/src/DailyDemandReportV2/api/index.js`

- [ ] **Step 2.1: 增加可选的 manualUserEstimated 参数**

```js
// 修改前
export function strategyDataApi(declarationDate, priceSpreadInformation) {
  return request.post(`${BASE}/strategy-data`, {
    declaration_date: declarationDate,
    price_spread_information: priceSpreadInformation
  })
}

// 修改后
export function strategyDataApi(declarationDate, priceSpreadInformation, manualUserEstimated) {
  return request.post(`${BASE}/strategy-data`, {
    declaration_date: declarationDate,
    price_spread_information: priceSpreadInformation,
    ...(manualUserEstimated ? { manual_user_estimated: manualUserEstimated } : {}),
  })
}
```

### Task 3: 前端 Store — 透传 manualUserEstimated

**Files:**
- Modify: `frontend-code/src/store/dailyDeclarationV2.js`

- [ ] **Step 3.1: fetchStrategyData 增加第三个参数并透传**

```js
// 修改前
async function fetchStrategyData(declarationDate, spreadInfo) {
  const res = await strategyDataApi(declarationDate, spreadInfo)

// 修改后
async function fetchStrategyData(declarationDate, spreadInfo, manualUserEstimated) {
  const res = await strategyDataApi(declarationDate, spreadInfo, manualUserEstimated)
```

### Task 4: StrategyTableV2 组件 — 手动模式核心逻辑

**Files:**
- Modify: `frontend-code/src/DailyDemandReportV2/components/StrategyTableV2.vue`

- [ ] **Step 4.1: Script — 新增状态和事件**

在 `<script setup>` 中 `const emit = defineEmits(...)` 处，新增 emit 名称：

```js
// 修改前
const emit = defineEmits(["confirm-edit", "reset-all"]);

// 修改后
const emit = defineEmits(["confirm-edit", "reset-all", "confirm-manual-estimated", "switch-to-api-mode"]);
```

在 `const editingPeriod = ref(null);` 之后，新增模式状态：

```js
const userEstimatedMode = ref('api'); // 'api' | 'manual'
const userEstimatedConfirmed = ref(false); // 手动模式下是否已确认
const manualUserEstimated = ref(Array(24).fill(null)); // 24 个手动值
```

- [ ] **Step 4.2: Script — 新增函数：切换模式、粘贴处理、确认、取消**

在 `resetAllRatios` 函数之后添加：

```js
function toggleToManualMode() {
  userEstimatedMode.value = 'manual';
  userEstimatedConfirmed.value = false;
  manualUserEstimated.value = Array(24).fill(null);
}

function switchToApiMode() {
  userEstimatedMode.value = 'api';
  userEstimatedConfirmed.value = false;
  manualUserEstimated.value = Array(24).fill(null);
  emit('switch-to-api-mode');
}

function handlePasteOnFirstCell(event) {
  if (!userEstimatedConfirmed.value) {
    const text = event.clipboardData.getData('text');
    const lines = text.trim().split('\n');
    const values = [...manualUserEstimated.value];
    for (let i = 0; i < 24 && i < lines.length; i++) {
      const num = parseFloat(lines[i].trim());
      values[i] = isNaN(num) ? null : num;
    }
    manualUserEstimated.value = values;
    event.preventDefault();
  }
}

const canConfirmManual = computed(() => {
  return manualUserEstimated.value.every(v => v !== null && !isNaN(v));
});

function confirmManualEstimated() {
  if (!canConfirmManual.value) return;
  emit('confirm-manual-estimated', manualUserEstimated.value);
  userEstimatedConfirmed.value = true;
}
```

- [ ] **Step 4.3: Template — 修改 user_estimated 列头**

将第 60-74 行 `user_estimated` 列改为根据模式显示不同列头：

```html
<el-table-column prop="user_estimated" min-width="110">
  <template #header>
    <div class="copy-header">
      <div v-if="userEstimatedMode === 'api'">
        用户评估<br />电量(MWh)
      </div>
      <div v-else style="color: #d46b08">
        人工评估<br />电量(MWh){{ userEstimatedConfirmed ? ' ✓' : '' }}
      </div>
      <div
        v-if="userEstimatedMode === 'api'"
        class="copy-header-btn"
        @click.stop="copyColumnValues('user_estimated')"
      >
        <el-icon :size="12"><CopyDocument /></el-icon><span>复制</span>
      </div>
    </div>
  </template>
  <template #default="scope">
    <template v-if="userEstimatedMode === 'api'">
      {{ formatNum(scope.row.user_estimated) }}
    </template>
    <template v-else-if="!userEstimatedConfirmed">
      <el-input
        v-model="manualUserEstimated[parseInt(scope.row.period)]"
        :placeholder="scope.row.period"
        size="small"
        :style="{ width: '80px' }"
        :disabled="userEstimatedConfirmed"
        @paste="scope.$index === 0 && handlePasteOnFirstCell($event)"
      />
    </template>
    <template v-else>
      <span style="color: #d46b08; font-weight: 600">
        {{ formatNum(scope.row.user_estimated) }}
      </span>
    </template>
  </template>
</el-table-column>
```

注意：需要 import `onMounted` 吗？不需要，粘贴事件用 `@paste` 绑定即可。

- [ ] **Step 4.4: Template — 修改底部按钮区域**

在第 269 行「切换用户评估电量方式」注释处，替换为切换按钮：

将第 269-294 行替换为：

```html
<!-- 切换用户评估电量方式 -->
<span
  v-if="userEstimatedMode === 'api' && !readonly && !submitted"
  style="
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: #d46b08;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  "
  @click="toggleToManualMode"
>
  📋 手动输入评估电量
</span>
<span
  v-if="userEstimatedMode === 'manual' && !readonly && !submitted"
  style="
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: #52c41a;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  "
  :style="{ opacity: canConfirmManual ? 1 : 0.5, cursor: canConfirmManual ? 'pointer' : 'not-allowed' }"
  @click="confirmManualEstimated"
>
  ✅ 确认此人工评估电量
</span>
<span
  v-if="userEstimatedMode === 'manual' && !readonly && !submitted && !userEstimatedConfirmed"
  style="
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: #8c8c8c;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  "
  @click="switchToApiMode"
>
  ↩ 取消(返回API模式)
</span>
<span
  v-if="userEstimatedMode === 'manual' && userEstimatedConfirmed"
  style="
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: #d46b08;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  "
  @click="toggleToManualMode"
>
  📋 重新手动输入
</span>
<span
  v-if="userEstimatedMode === 'manual' && userEstimatedConfirmed"
  style="
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: #1890ff;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  "
  @click="switchToApiMode"
>
  🔄 重新从接口获取
</span>

<span
  style="
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    background: #1890ff;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  "
  @click="exportExcel"
>
  📥 导出申报结果 (电力交易中心版)
</span>
<el-button
  v-if="!readonly && !submitted"
  size="small"
  plain
  @click="resetAllRatios"
>
  🔄 恢复默认调整申报比例
</el-button>
```

- [ ] **Step 4.5: Script — calculateActualLoad 适配手动模式**

修改 `calculateActualLoad` 函数，在手动模式下取手动值：

```js
// 修改前
function calculateActualLoad(row) {
  const estimatedMwh = parseFloat(row.user_estimated);

// 修改后
function calculateActualLoad(row) {
  let estimatedMwh;
  if (userEstimatedMode.value === 'manual' && userEstimatedConfirmed.value) {
    const idx = parseInt(row.period);
    const val = manualUserEstimated.value[idx];
    estimatedMwh = val !== null && val !== undefined ? parseFloat(val) : NaN;
  } else {
    estimatedMwh = parseFloat(row.user_estimated);
  }
```

- [ ] **Step 4.6: Script — copyColumnValues 适配手动模式**

修改 `copyColumnValues` 中 `user_estimated` case，在手动已确认模式下使用手动值：

```js
// 修改前
case "user_estimated":
  values = periods.map((p) => formatNum(p.user_estimated));
  label = "用户评估电量";
  break;

// 修改后
case "user_estimated":
  if (userEstimatedMode.value === 'manual' && userEstimatedConfirmed.value) {
    values = manualUserEstimated.value.map(v => formatNum(v));
  } else {
    values = periods.map((p) => formatNum(p.user_estimated));
  }
  label = userEstimatedMode.value === 'manual' ? "人工评估电量" : "用户评估电量";
  break;
```

- [ ] **Step 4.7: Template — 底部注释适配**

在第 350 行附近，根据模式更新数据来源文字：

```html
<span>
  <strong>数据来源：</strong> 合约电量 ×4 / 用户评估电量
  <template v-if="userEstimatedMode === 'manual'">
    使用 <strong style="color:#d46b08">人工输入值</strong>
  </template>
  <template v-else>
    来自第三方API
  </template>
  &nbsp;|&nbsp; 价差方向/日前低概率从 Step 2 导入 &nbsp;|&nbsp;
  其余为公式自动计算
</span>
```

### Task 5: 父组件 — 事件处理

**Files:**
- Modify: `frontend-code/src/DailyDemandReportV2/index.vue`

- [ ] **Step 5.1: Template — 绑定新事件**

在 `DailyDemandReportV2/index.vue` 中找到 `StrategyTableV2` 组件标签，增加两个事件监听：

```html
<StrategyTableV2
  ref="strategyTableRef"
  :periods="store.strategyPeriods"
  :summary="store.strategySummary"
  :declaration-date="store.declarationDate"
  :adjusted-ratios="store.adjustedRatios"
  :readonly="isStep3Readonly"
  :submitted="isStep3Submitted"
  @confirm-edit="(payload) => store.setAdjustedRatio(payload.period, payload.ratio)"
  @reset-all="store.resetAdjustedRatios"
  @confirm-manual-estimated="handleConfirmManualEstimated"
  @switch-to-api-mode="handleSwitchToApiMode"
/>
```

- [ ] **Step 5.2: Script — 新增事件处理函数**

在 `DailyDemandReportV2/index.vue` 的 `<script setup>` 中，找到现有的事件处理区域，新增：

```js
async function handleConfirmManualEstimated(manualValues) {
  try {
    const spreadInfo = (store.priceComparisonData?.periods || []).map(p => ({
      period: p.period,
      spread_direction: p.spread_direction,
      low_probability: p.low_probability
    }));
    await store.fetchStrategyData(store.declarationDate, spreadInfo, manualValues);
    ElMessage.success('已使用人工评估电量重新计算');
  } catch (e) {
    console.error('确认人工评估电量失败', e);
    ElMessage.error('确认人工评估电量失败，请重试');
  }
}

async function handleSwitchToApiMode() {
  try {
    const spreadInfo = (store.priceComparisonData?.periods || []).map(p => ({
      period: p.period,
      spread_direction: p.spread_direction,
      low_probability: p.low_probability
    }));
    await store.fetchStrategyData(store.declarationDate, spreadInfo);
  } catch (e) {
    console.error('重新获取策略数据失败', e);
    ElMessage.error('重新获取策略数据失败，请重试');
  }
}
```

- [ ] **Step 5.3: 检查 Step 加载状态**

在 `DailyDemandReportV2/index.vue` 中，`step3Loading` 是否已存在？如果已有 loading 状态，确认事件处理函数中使用了该状态防止重复点击。搜索 `step3Loading`：

如果已存在，则在两个处理函数中加入 `step3Loading.value = true/finally = false` 包裹。如果不存在，则不需要添加（用户已确认可以在子组件级别控制）。

### Task 6: 自审与验证

- [ ] **Step 6.1: 检查所有改动文件语法**

```bash
# 后端
cd /Users/guansiyu/Desktop/backend-code && node -c services/dailyStrategyService.js && node -c routes/dailyDeclarationV2.js

# 前端 — 检查是否存在明显的语法错误
cd /Users/guansiyu/Desktop/frontend-code && npx vue-tsc --noEmit --skipLibCheck src/DailyDemandReportV2/components/StrategyTableV2.vue 2>&1 || true
```

- [ ] **Step 6.2: 手动测试流程验证**

确认以下流程：
1. 页面加载 → API 模式 → 正常显示 user_estimated 列 ✅
2. 点击「手动输入评估电量」→ 列变输入框、列头变「人工评估电量」✅
3. 粘贴 24 个值到第一个输入框 → 自动填充全部 24 行 ✅
4. 「确认此人工评估电量」按钮可用 → 点击 → 调接口 → 刷新数据 → 列变纯文本显示已确认值 ✅
5. 点击「重新从接口获取」→ 调接口 → 切回 API 模式 ✅
6. 点击「取消(返回API模式)」→ 不调接口？不对，根据 spec 是调接口。确认：取消也是调 VPP API 重新获取数据 ✅
