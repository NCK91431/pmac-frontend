# 算法电价预测功能设计文档

## 概述

在电价预测上，除了现有的人工电价预测（前端将 spreadInfo 传给 /strategy-data 接口），新增从第三方获取"算法电价预测"数据，展示在表格中，并支持切换使用人工或算法电价数据来计算后续策略列（方案一、方案二等）。

## 设计决策

| 决策 | 选择 |
|------|------|
| 数据返回策略 | 始终返回两套数据（人工 + 算法），前端同时展示两列 |
| 切换触发方式 | 切换即触发，无需额外确认按钮 |
| 表头样式 | 两个合并父表头「人工电价预测」「算法电价预测」，表头行可点击切换 |
| 默认模式 | 人工电价预测（manual） |
| 后端方案 | 后端统一集成第三方 API（方案 A） |

## 后端改动

### 路由层 `dailyDeclarationV2.js`

`POST /strategy-data` 新增请求参数：

```json
{
  "price_forecasting_method": "manual" | "api"
}
```

透传给 `getStrategyData()` 服务函数。

### 服务层 `dailyStrategyService.js`

#### 新增函数 `fetchPriceSpreadSuggestion(declarationDate)`

- 调用第三方接口：`POST https://ems.pmac.com.cn/api/vpp-manage/v1/ps/bidding/strategy/suggest/table`
- 请求参数：`{ startTime: "YYYY-MM-DD" }`
- 响应字段：`priceDirection`（"日前高"|"日前低"）、`spreadProbability`（0-1 小数）
- 为每个 period（00:00-23:00）获取数据
- 映射规则：`priceDirection === "日前低"` → `spread_direction = true`，否则 `false`

#### `getStrategyData()` 改动

- 新增参数 `priceForecastingMethod`（默认 `'manual'`）
- 当 `priceForecastingMethod === 'api'`：使用第三方 API 返回的价差数据参与计算（方案一、方案二、日前申报电量等）
- 当 `priceForecastingMethod === 'manual'`：使用前端传入的 `priceSpreadInformation` 参与计算（现有逻辑）
- **始终返回两套价差数据**到每个 period item 中：
  - `spread_direction` / `spread_probability`：人工数据（来自前端传入）
  - `api_spread_direction` / `api_spread_probability`：算法数据（来自第三方 API）

### 响应结构

顶层新增字段：

```json
{
  "success": true,
  "data": [
    {
      "period": "00:00",
      "spread_direction": false,
      "spread_probability": 0.43,
      "api_spread_direction": true,
      "api_spread_probability": 0.51,
      "plan_a": 123.45,
      "plan_b": 67.89,
      "declared_quantity": 95.67,
      ...
    }
  ],
  "price_forecast": {
    "price_forecasting_method": "api",
    "api_forecasting_data": [
      { "period": "00:00", "priceDirection": "日前低", "spreadProbability": "0.51" },
      { "period": "01:00", "priceDirection": "日前高", "spreadProbability": "0.40" },
      ...
    ]
  }
}
```

## 前端改动

### Store `dailyDeclarationV2.js`

新增字段：

```js
const priceForecastingMode = ref('manual')  // 'manual' | 'api'
const apiPriceForecast = ref(null)          // 后端返回的 price_forecast 对象
```

`fetchStrategyData()` 新增参数 `priceForecastingMethod`，保存响应中的 `price_forecast`。

`resetAll()` 中重置这两个字段。

### API 层 `api/index.js`

`strategyDataApi` 新增参数 `priceForecastingMethod`，传入请求 body 的 `price_forecasting_method` 字段。

### StrategyTableV2.vue

#### 可点击的表头切换

- 「人工电价预测」合并父表头：点击选中 `priceForecastingMode = 'manual'`
- 「算法电价预测」合并父表头：点击选中 `priceForecastingMode = 'api'`
- 选中的表头有蓝色填充样式（`.active`），未选中的为灰色边框
- 切换时触发 `onPriceForecastingModeChange(mode)`，emit 事件给父组件

#### 新增「算法电价预测」列

在「人工电价预测」列之后新增，结构与人工列对称：

- `api_spread_direction`：价差方向（日前/实时）
- `api_spread_probability`：日前低概率（百分比格式，可复制）

#### 事件处理

```js
function onPriceForecastingModeChange(mode) {
  store.priceForecastingMode = mode
  emit('price-forecasting-change', mode)
}
```

### 父组件 `index.vue`

监听 `@price-forecasting-change` 事件，使用当前已有参数 + 新 mode 重新调用 `store.fetchStrategyData()`。

### `useStepNavigation.js`

`goToStep3` 中传入 `store.priceForecastingMode`：

```js
await store.fetchStrategyData(declarationDate, spreadInfo, loadForecasting, store.priceForecastingMode)
```

## 联动效果

| 列 | 切换影响 |
|------|---------|
| 人工电价预测（价差方向 + 日前低概率）| 始终显示，不变 |
| 算法电价预测（价差方向 + 日前低概率）| 始终显示，不变 |
| 方案一 / 建议调整比例 / 方案二 | 根据选中模式用对应价差数据重新计算 |
| 日前申报电量 / 申报比例 | 跟随方案变化 |

## 样式

`.price-forecast-header` 样式规则：

```css
.price-forecast-header {
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s;
  user-select: none;
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

## cellStyle & summaryMethod

- `api_spread_direction`、`api_spread_probability` 在 `summaryMethod` 中不求和，显示为空
- 两列不需要特殊高亮，沿用斑马纹
