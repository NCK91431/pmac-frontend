# 算法电价预测功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在电价预测上新增算法电价预测（第三方接口），支持切换人工/算法模式，扩展 POST /strategy-data 接口。

**Architecture:** 后端统一集成第三方 API（方案 A），在 `dailyStrategyService.js` 新增 `fetchPriceSpreadSuggestion()`，`getStrategyData()` 中始终返回两套价差数据。前端新增 `priceForecastingMode` store 字段、可点击表头切换、算法电价预测两列。

**Tech Stack:** Node.js/Express (backend), Vue 3/Pinia/Element Plus (frontend), axios/fetchWithAuth (第三方 API 调用)

---

### Task 1: 后端 — 新增 `fetchPriceSpreadSuggestion` 函数

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/services/dailyStrategyService.js`

- [ ] **Step 1: 在 `dailyStrategyService.js` 中新增 `fetchPriceSpreadSuggestion` 函数**

在文件末尾（`module.exports` 之前）添加：

```js
/*
 * 从第三方接口获取价差方向与日前低概率（算法电价预测）
 * @param {string} declarationDate - YYYY-MM-DD
 * @returns {Promise<Object|null>} { [period]: { spread_direction: boolean, low_probability: number } } 或 null
 */
async function fetchPriceSpreadSuggestion(declarationDate) {
  try {
    const url = `${VPP_BASE_URL}/api/vpp-manage/v1/ps/bidding/strategy/suggest/table`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      data: { startTime: declarationDate },
    });
    const body = response.data;
    if (body.status !== 0 || !Array.isArray(body.data)) {
      console.warn('[fetchPriceSpreadSuggestion] 第三方接口返回异常:', body);
      return null;
    }
    const result = {};
    for (const item of body.data) {
      const period = item.dateTime; // "HH:00"
      result[period] = {
        spread_direction: item.priceDirection === '日前低',
        low_probability: parseFloat(item.spreadProbability) || 0,
      };
    }
    return result;
  } catch (error) {
    console.error('[fetchPriceSpreadSuggestion] 调用第三方接口失败:', error.message);
    return null;
  }
}
```

- [ ] **Step 2: 导出新函数**

在文件末尾的 `module.exports` 中添加 `fetchPriceSpreadSuggestion`。

---

### Task 2: 后端 — 修改 `getStrategyData` 函数

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/services/dailyStrategyService.js`

- [ ] **Step 1: 修改函数签名，新增 `priceForecastingMethod` 参数**

将 line 146：
```js
async function getStrategyData(declarationDate, priceSpreadInformation, loadEstimationMethod = 'api', manualEstimatedLoad = null) {
```
改为：
```js
async function getStrategyData(declarationDate, priceSpreadInformation, loadEstimationMethod = 'api', manualEstimatedLoad = null, priceForecastingMethod = 'manual') {
```

- [ ] **Step 2: 在函数开头调用第三方 API 获取算法价差数据**

在 `const periods = [];` 之前（line 171 附近）插入：

```js
  // 始终获取算法电价预测数据（第三方接口）
  const apiSpreadSuggestion = await fetchPriceSpreadSuggestion(declarationDate);
  
  // 根据 priceForecastingMethod 决定用于策略计算的价差数据
  let calcSpreadInfo;
  if (priceForecastingMethod === 'api' && apiSpreadSuggestion) {
    calcSpreadInfo = apiSpreadSuggestion;
  } else {
    calcSpreadInfo = priceSpreadInformation;
  }
```

- [ ] **Step 3: 修改循环内计算逻辑，使用 `calcSpreadInfo` 替代 `priceSpreadInformation`**

将 line 187：
```js
    const spreadInfo = priceSpreadInformation[label] || { spread_direction: false, low_probability: 0 };
```
改为：
```js
    const spreadInfo = calcSpreadInfo[label] || { spread_direction: false, low_probability: 0 };
```

- [ ] **Step 4: 在 periods.push 中新增 `api_spread_direction` 和 `api_spread_probability`**

在 line 241-242 后面添加：
```js
      api_spread_direction: apiSpreadSuggestion && apiSpreadSuggestion[label] ? apiSpreadSuggestion[label].spread_direction : null,
      api_spread_probability: apiSpreadSuggestion && apiSpreadSuggestion[label] ? apiSpreadSuggestion[label].low_probability : null,
```

- [ ] **Step 5: 构建 `price_forecast` 返回对象**

在 return 语句中，修改为：

```js
  // 构建 api_forecasting_data
  const apiForecastingData = [];
  if (apiSpreadSuggestion) {
    for (let i = 0; i < 24; i++) {
      const label = String(i).padStart(2, '0') + ':00';
      const data = apiSpreadSuggestion[label];
      if (data) {
        apiForecastingData.push({
          period: label,
          priceDirection: data.spread_direction ? '日前低' : '日前高',
          spreadProbability: String(data.low_probability),
        });
      }
    }
  }

  return {
    periods,
    summary: {
      total_periods: 24,
      adjusted_count: adjustedCount,
      default_count: defaultCount,
    },
    price_forecast: {
      price_forecasting_method: priceForecastingMethod,
      api_forecasting_data: apiForecastingData,
    },
  };
```

---

### Task 3: 后端 — 更新路由层

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/routes/dailyDeclarationV2.js`

- [ ] **Step 1: 从请求中提取 `price_forecasting_method` 参数**

在 line 162：
```js
const { declaration_date, price_spread_information, load_forecasting } = req.body;
```
改为：
```js
const { declaration_date, price_spread_information, load_forecasting, price_forecasting_method } = req.body;
```

- [ ] **Step 2: 弱化 `price_spread_information` 必填校验**

将 line 166-168：
```js
if (!price_spread_information || !Array.isArray(price_spread_information)) {
  return res.status(400).json({ success: false, error: '缺少必填参数 price_spread_information（数组格式）' });
}
```
改为：
```js
if (!price_spread_information || !Array.isArray(price_spread_information)) {
  if (price_forecasting_method !== 'api') {
    return res.status(400).json({ success: false, error: '缺少必填参数 price_spread_information（数组格式）' });
  }
}
```

- [ ] **Step 3: 修改 `spreadInfoObject` 构建逻辑，当 `price_forecasting_method === 'api'` 时使用空对象**

将 line 170-176：
```js
const spreadInfoObject = {};
for (const item of price_spread_information) {
  spreadInfoObject[item.period] = {
    spread_direction: item.spread_direction,
    low_probability: item.low_probability
  };
}
```
改为：
```js
const spreadInfoObject = {};
if (price_spread_information && Array.isArray(price_spread_information)) {
  for (const item of price_spread_information) {
    spreadInfoObject[item.period] = {
      spread_direction: item.spread_direction,
      low_probability: item.low_probability
    };
  }
}
```

- [ ] **Step 4: 透传 `price_forecasting_method` 给 service**

将 line 181：
```js
const result = await getStrategyData(declaration_date, spreadInfoObject, loadEstimationMethod, manualEstimatedLoad);
```
改为：
```js
const result = await getStrategyData(declaration_date, spreadInfoObject, loadEstimationMethod, manualEstimatedLoad, price_forecasting_method || 'manual');
```

- [ ] **Step 5: 在响应中返回 `price_forecast`**

将 line 183-188：
```js
res.json({
  success: true,
  data: result.periods,
  summary: result.summary,
  load_forecasting: load_forecasting || null,
});
```
改为：
```js
res.json({
  success: true,
  data: result.periods,
  summary: result.summary,
  load_forecasting: load_forecasting || null,
  price_forecast: result.price_forecast || null,
});
```

---

### Task 4: 前端 — 更新 API 层

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2/api/index.js`

- [ ] **Step 1: `strategyDataApi` 新增 `priceForecastingMethod` 参数**

将 line 17-28：
```js
export function strategyDataApi(declarationDate, priceSpreadInformation, loadForecasting) {
  const requestBody = {
    declaration_date: declarationDate,
    price_spread_information: priceSpreadInformation,
    load_forecasting: loadForecasting,
  };
  console.log("[API] strategyDataApi requestBody:", JSON.stringify(requestBody, (key, val) => {
    if (key === 'price_spread_information' || key === 'manual_estimated_load') return Array.isArray(val) ? `Array(${val.length})` : val;
    return val;
  }));
  return request.post(`${BASE}/strategy-data`, requestBody)
}
```
改为：
```js
export function strategyDataApi(declarationDate, priceSpreadInformation, loadForecasting, priceForecastingMethod) {
  const requestBody = {
    declaration_date: declarationDate,
    price_spread_information: priceSpreadInformation,
    load_forecasting: loadForecasting,
    price_forecasting_method: priceForecastingMethod || 'manual',
  };
  console.log("[API] strategyDataApi requestBody:", JSON.stringify(requestBody, (key, val) => {
    if (key === 'price_spread_information' || key === 'manual_estimated_load') return Array.isArray(val) ? `Array(${val.length})` : val;
    return val;
  }));
  return request.post(`${BASE}/strategy-data`, requestBody)
}
```

---

### Task 5: 前端 — 更新 Store

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/store/dailyDeclarationV2.js`

- [ ] **Step 1: 新增 `priceForecastingMode` 和 `apiPriceForecast` ref**

在 `const responseLoadForecasting = ref(null)` 之后添加：
```js
const priceForecastingMode = ref('manual') // 'manual' | 'api'
const apiPriceForecast = ref(null)         // 后端返回的 price_forecast 对象
```

- [ ] **Step 2: 更新 `fetchStrategyData` 签名和逻辑**

将 line 155-171：
```js
async function fetchStrategyData(declarationDate, spreadInfo, loadForecasting) {
  console.log("[Store] fetchStrategyData called with loadForecasting:", JSON.stringify(loadForecasting));
  const res = await strategyDataApi(declarationDate, spreadInfo, loadForecasting)
  const body = res.data
  if (body.success) {
    strategyPeriods.value = body.data
    strategySummary.value = body.summary
    responseLoadForecasting.value = body.load_forecasting || null
    const ratios = new Array(24)
    ;(body.data || []).forEach(p => {
      ratios[parseInt(p.period)] = p.declared_ratio
    })
    adjustedRatios.value = ratios
    actualQuantities.value = {}
  }
  return body
}
```
改为：
```js
async function fetchStrategyData(declarationDate, spreadInfo, loadForecasting, priceForecastingMethod) {
  console.log("[Store] fetchStrategyData called with loadForecasting:", JSON.stringify(loadForecasting));
  const res = await strategyDataApi(declarationDate, spreadInfo, loadForecasting, priceForecastingMethod)
  const body = res.data
  if (body.success) {
    strategyPeriods.value = body.data
    strategySummary.value = body.summary
    responseLoadForecasting.value = body.load_forecasting || null
    apiPriceForecast.value = body.price_forecast || null
    const ratios = new Array(24)
    ;(body.data || []).forEach(p => {
      ratios[parseInt(p.period)] = p.declared_ratio
    })
    adjustedRatios.value = ratios
    actualQuantities.value = {}
  }
  return body
}
```

- [ ] **Step 3: 在 `resetAll` 中重置新字段**

在 `resetAll` 函数中，`resetManualMode()` 之前添加：
```js
    priceForecastingMode.value = 'manual'
    apiPriceForecast.value = null
```

- [ ] **Step 4: 导出新字段**

在 return 语句中，`responseLoadForecasting` 后面添加 `priceForecastingMode` 和 `apiPriceForecast`，并在方法中补充 `fetchStrategyData` 的透传（不需要额外修改，因为所有函数都已在 return 中）。

---

### Task 6: 前端 — 更新 StrategyTableV2.vue（表头切换 + 算法列）

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2/components/StrategyTableV2.vue`

- [ ] **Step 1: 添加 emit 事件**

在 line 498-503 的 emits 数组中添加 `"price-forecasting-change"`：
```js
const emit = defineEmits([
  "confirm-edit",
  "reset-all",
  "confirm-manual-estimated",
  "switch-to-api-mode",
  "price-forecasting-change",
]);
```

- [ ] **Step 2: 替换「人工电价预测」表头为可点击样式**

将 line 159-165：
```html
        <!-- 人工电价预测 -->
        <el-table-column
          v-if="!isManualInputMode"
          label="人工电价预测"
          align="center"
        >
        <!-- 在这里添加选择使用人工电价预测或算法电价预测的单选 -->
```
改为：
```html
        <!-- 人工电价预测 -->
        <el-table-column
          v-if="!isManualInputMode"
          align="center"
        >
          <template #header>
            <div
              class="price-forecast-header"
              :class="{ active: store.priceForecastingMode === 'manual' }"
              @click="onPriceForecastingModeChange('manual')"
            >
              人工电价预测
            </div>
          </template>
```

- [ ] **Step 3: 在「人工电价预测」列之后新增「算法电价预测」列**

将 line 196（`<!-- 新增:算法电价预测 -->`）替换为完整的新列：

```html
        <!-- 算法电价预测 -->
        <el-table-column
          v-if="!isManualInputMode"
          align="center"
        >
          <template #header>
            <div
              class="price-forecast-header"
              :class="{ active: store.priceForecastingMode === 'api' }"
              @click="onPriceForecastingModeChange('api')"
            >
              算法电价预测
            </div>
          </template>
          <!-- 低价方向 -->
          <el-table-column prop="api_spread_direction" min-width="70">
            <template #header>低价方向</template>
            <template #default="scope">
              <span v-if="scope.row.api_spread_direction" class="spread-low">日前</span>
              <span v-else class="spread-high">实时</span>
            </template>
          </el-table-column>
          <!-- 日低价概率 -->
          <el-table-column prop="api_spread_probability" min-width="70">
            <template #header>
              <div class="copy-header">
                <div>日前低概率</div>
                <div
                  class="copy-header-btn"
                  @click.stop="copyColumnValues('api_spread_probability')"
                >
                  <el-icon :size="12"><CopyDocument /></el-icon><span>复制</span>
                </div>
              </div>
            </template>
            <template #default="scope">
              {{ formatPct(scope.row.api_spread_probability) }}
            </template>
          </el-table-column>
        </el-table-column>
```

- [ ] **Step 4: 在 script 中添加 `onPriceForecastingModeChange` 方法**

在 `isManualInputMode` computed 之后添加：
```js
function onPriceForecastingModeChange(mode) {
  if (store.priceForecastingMode === mode) return; // 已选中则忽略
  store.priceForecastingMode = mode;
  emit("price-forecasting-change", mode);
}
```

- [ ] **Step 5: 更新 `summaryMethod`**

在 `summaryMethod` 函数的 `if (["spread_direction","plan_a","plan_b"].includes(prop))` 处，添加 `api_spread_direction` 和 `api_spread_probability`：
```js
if (["spread_direction", "api_spread_direction", "api_spread_probability", "plan_a", "plan_b"].includes(prop)) {
  sums[index] = { text: "", class: "summary-black" };
  return;
}
```

- [ ] **Step 6: 添加 `.price-forecast-header` 样式**

在 `<style>` 标签中添加：
```css
.price-forecast-header {
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s;
  user-select: none;
  font-size: 13px;
  white-space: nowrap;
}
.price-forecast-header.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
.price-forecast-header:not(.active):hover {
  border-color: #409eff;
  color: #409eff;
}
```

---

### Task 7: 前端 — 更新 index.vue 处理切换事件

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2/index.vue`

- [ ] **Step 1: 在 StrategyTableV2 组件上监听事件**

在 line 273-287 的模板中，添加 `@price-forecasting-change` 事件监听：
```html
<StrategyTableV2
  ref="strategyTableRef"
  :periods="store.strategyPeriods"
  :summary="store.summary"
  :declaration-date="store.declarationDate"
  :adjusted-ratios="store.adjustedRatios"
  :readonly="isStep3Readonly"
  :submitted="isStep3Submitted"
  @confirm-edit="
    (payload) => store.setAdjustedRatio(payload.period, payload.ratio)
  "
  @reset-all="store.resetAdjustedRatios"
  @confirm-manual-estimated="handleConfirmManualEstimated"
  @switch-to-api-mode="handleSwitchToApiMode"
  @price-forecasting-change="onPriceForecastingChange"
/>
```

- [ ] **Step 2: 添加 `onPriceForecastingChange` 方法**

在 script 中添加：
```js
async function onPriceForecastingChange(mode) {
  const periods = store.priceComparisonData?.periods || []
  const spreadInfo = periods.map(p => ({
    period: p.period,
    spread_direction: p.spread_direction,
    low_probability: p.low_probability
  }))
  const loadForecasting = { load_estimation_method: 'api' };
  await store.fetchStrategyData(store.declarationDate, spreadInfo, loadForecasting, mode)
}
```

---

### Task 8: 前端 — 更新 useStepNavigation.js

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2/composables/useStepNavigation.js`

- [ ] **Step 1: 在 `goToStep3` 中传入 `priceForecastingMode`**

将 line 49：
```js
const strategyRes = await store.fetchStrategyData(store.declarationDate, spreadInfo, loadForecasting)
```
改为：
```js
const strategyRes = await store.fetchStrategyData(store.declarationDate, spreadInfo, loadForecasting, store.priceForecastingMode)
```

---

## 验证清单

完成后验证以下场景：

1. **默认加载**：进入 Step 3，「人工电价预测」表头为选中（蓝色），「算法电价预测」为未选中（灰色边框）
2. **点击切换**：点击「算法电价预测」表头 → 触发 `@price-forecasting-change` → 重新调用接口 → 表格更新
3. **响应中包含算法数据**：检查 `api_spread_direction` 和 `api_spread_probability` 在前端正确显示
4. **计算差异**：切换后，方案一/方案二/申报电量等列的值应随价差数据变化
5. **`price_forecast` 对象**：确认 `apiPriceForecast` store 字段保存了返回的 `api_forecasting_data`
6. **降级处理**：第三方接口不可用时，`apiSpreadSuggestion` 返回 null，`api_spread_direction/probability` 为 null，不影响人工模式使用
