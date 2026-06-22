# 评估电量列交互优化设计

## 概述

优化"算法评估电量"与"人工评估电量"两列的交互方式，从原来的隐藏/显示+切换按钮模式，改为双列始终显示 + 可点击标题激活 + 行内编辑/确认/修改。

## 状态管理

保持不变，复用现有 store 状态：

| 状态 | 类型 | 用途 |
|------|------|------|
| `userEstimatedMode` | `'api' \| 'manual'` | 当前激活的评估模式 |
| `userEstimatedConfirmed` | `boolean` | 人工评估电量是否已确认 |
| `manualUserEstimated` | `Record<string, number>` (24个键值对，如 `{"00:00": 12.75, "01:00": 10.18, ...}`) | 用户输入的人工评估值 |

## 组件变化 (StrategyTableV2.vue)

### 1. 人工评估电量列 — 始终显示

- 删除列上的 `v-if="store.userEstimatedMode === 'manual'"` 条件
- 该列始终渲染在表格中

### 2. 标题可点击选中

**算法评估电量标题：**
- 未激活时：灰色文字 + cursor:pointer
- 激活时（`userEstimatedMode === 'api'`）：蓝色亮色文字
- 点击后 emit `switch-to-api-mode` 事件

**人工评估电量标题：**
- 仅当 `userEstimatedConfirmed === true` 时可点击
- 可点击时：灰色文字 + cursor:pointer
- 不可点击时：灰色文字 + cursor:not-allowed
- 激活时（`userEstimatedMode === 'manual'`）：蓝色亮色文字
- 点击后 emit `confirm-manual-estimated` 事件

### 3. 单元格背景高亮

沿用现有 `.forecast-active-row` 逻辑：
- 激活列的单元格背景色为橙色（#fef0e6 或类似）
- 未激活列无高亮

### 4. 人工评估电量列三种状态渲染

| 状态 | 条件 | 显示内容 |
|------|------|---------|
| 初始输入 | `!userEstimatedConfirmed` | 24个 `<el-input>` + "确认此人工评估电量" + "一键清空" |
| 已确认 | `userEstimatedConfirmed` | 数值展示 + "复制" + "修改" |
| 编辑修改 | 用户点击"修改"后 | 预填数据的24个 `<el-input>` + "确认此人工评估电量" + "一键清空" |

### 5. 操作按钮

**一键清空：**
- 仅出现在未确认状态下
- 点击后将 `manualUserEstimated` 全部24个键的值重置为 0
- 不清除确认状态（因为本来就是未确认状态）
- 不清除 `userEstimatedMode`

**修改：**
- 仅出现在已确认状态下，且仅当 `userEstimatedMode === 'api'` 时显示（即使用算法评估电量时才能修改）
- 点击后 `userEstimatedConfirmed = false`，回到编辑状态
- 保留 `manualUserEstimated` 现有数据，预填到 Input 中

**确认：**
- 仅出现在未确认状态下
- 校验24个值均非空，调用 `confirmManualEstimated()`

### 6. 删除旧切换按钮

删除原来 `#L416-L428` 的切换模式按钮（`✏️ 切换为手动输入模式 / 🔄 切换为API获取模式`）

## 数据流

```
┌──────────────┐   点击标题(人工,已确认)     ┌───────────────────┐
│              │ ──────────────────────────→ │  触发后端 POST     │
│  可点击标题   │                              │  (manual模式)      │
│              │   点击标题(算法)              │                    │
│              │ ──────────────────────────→ │  触发后端 POST     │
└──────────────┘                              │  (api模式)         │
                                              └───────────────────┘

┌──────────────┐   填写24个值 → 点击确认     ┌───────────────────┐
│  输入状态     │ ──────────────────────────→ │  emit('confirm-   │
│              │                              │  manual-estimated')│
│  24个Input   │   点击"一键清空"              │  → 清空所有值      │
│              │ ──────────────────────────→ │                    │
└──────────────┘                              └───────────────────┘

┌──────────────┐   点击"修改"                ┌───────────────────┐
│  已确认状态   │ ──────────────────────────→ │  confirmed=false  │
│  数值+复制   │                              │  回到输入状态      │
│  +修改       │                              │  预填已有值        │
└──────────────┘                              └───────────────────┘
```

## 父组件变化 (index.vue)

无新增逻辑。现有事件处理函数保持不变：
- `handleSwitchToApiMode` — 构造 `load_forecast: { load_forecasting_method: "api" }` 并 POST
- `handleConfirmManualEstimated` — 构造 `load_forecast: { load_forecasting_method: "manual", manual_load_data: {...} }` 并 POST

## 样式变更

新增样式类：
- `.column-header-inactive` — 灰色文字，pointer 光标（可点击但未激活）
- `.column-header-active` — 蓝色文字，pointer 光标（已激活选中）
- `.column-header-disabled` — 灰色文字，not-allowed 光标（人工列未确认，不可点击）
