# StrategyTableV2 调整申报比例列 — 交互重构设计

## 背景

`DailyDemandReportV2/components/StrategyTableV2.vue` 的"调整申报比例"列目前使用 `<el-input>` 纯文本输入编辑。
需要仿照 `AuxiliaryTradingTools/components/StrategyTable.vue` 中的同名列，改用 `<el-input-number>` + 图标按钮的交互模式，
并保持整体表格样式不变。

## 目标

- 编辑交互模式完全对齐参考组件
- 已调整/未调整状态视觉区分与参考组件一致
- 新增"恢复默认"按钮（含确认弹窗）
- 不影响其他 14 列的样式和逻辑

## 数据模型

| 字段 | 来源 | 格式 | 示例 | 用途 |
|------|------|------|------|------|
| `declared_ratio` | API strategy-data 响应 | 十进制小数 | `1.20` | 编辑列的初始默认值 |
| `suggested_adjust_ratio` | API strategy-data 响应 | 百分比字符串 | `"+20%"` | 仍在"建议调整比例"列显示，不参与编辑 |
| `store.adjustedRatios[period]` | 用户通过 ✓ 确认编辑后由 `setAdjustedRatio()` 写入 | 十进制小数 或 undefined | `1.05` / `undefined` | 用户调整值，提交时存在且 ≠ declared_ratio 的参与提交；不存在的 key 在序列化时 → `null` |

## 交互设计

### 编辑列状态机

```
 ┌──────────────────────────────┐
 │       非编辑模式             │
 │  [✎ Edit图标] [调整值文本]   │
 │        ↓ 点击 ✎ 图标         │
 │        ↓                   │
 │       编辑模式               │
 │  [el-input-number] [✓ 确认]  │
 │        ↓ 点击 ✓ 确认         │
 │        ↓                   │
 │       非编辑模式(更新值)      │
 └──────────────────────────────┘
  点击其他行或外部 → 自动确认当前编辑
```

### 编辑模式

- **进入**：点击 `✎`（el-icon Edit）按钮 → 该行进入编辑模式
  - 同一时间只能编辑一行（全局 `editingPeriod`）
  - 如果已在编辑另一行，先确认退出再进入新行
  - 点击其他行或表格外部区域，先确认当前编辑再切换
- **控件**：`<el-input-number>`，配置：
  - `:min="0.01"`，`:max="2.00"`，`:step="0.01"`，`:precision="2"`
  - 超出范围时自动限幅
- **确认**：点击 `✓`（el-icon CircleCheck）绿色按钮
  - 调用 `store.setAdjustedRatio(period, value)`
  - 自动计算出 `actual_quantity` 并调用 `store.setActualQuantity(period, qty)`
  - 退出编辑模式
- **取消/失焦**：输入框 blur 不做确认，只有点击 ✓ 才确认

### 非编辑模式（显示状态）

| 条件 | 文本样式 | ✎ 图标颜色 |
|------|---------|-----------|
| 未调整（adjustedRatios 中不存在该 period，值为 declared_ratio） | 灰色 `#94a3b8`，斜体 | 灰色 `#94a3b8` |
| 已调整 < 0.80 | 红色 `#ef4444`，粗体，圆角背景 | 蓝色 `#3b82f6` |
| 已调整 0.80 ~ 1.20 | 绿色 `#10b981`，粗体，圆角背景 | 蓝色 `#3b82f6` |
| 已调整 > 1.20 | 红色 `#ef4444`，粗体，圆角背景 | 蓝色 `#3b82f6` |

## 恢复默认按钮

### 位置

表格底部的操作按钮组（"一键复制结果" / "导出用电侧申报结果" 右侧），新增一个 `el-button`。

### 交互

1. 按钮文字："恢复默认调整申报比例"
2. 点击弹出 `ElMessageBox.confirm`
   - 标题："恢复默认"
   - 内容："确定要恢复所有调整比例为默认值吗？"
   - 确认按钮文字："确定"
   - 取消按钮文字："取消"
3. 确认后：
   - 清空 `store.adjustedRatios`（设为 `{}`）
   - 重置所有 `editingStates`
   - 显示 `ElMessage.success('已恢复所有默认比例')`

## 变更范围

### 仅修改 StrategyTableV2.vue

#### Template 改动

- 替换第 134~161 行的"调整申报比例"列 template
- 底部按钮组新增"恢复默认"按钮

#### Script 改动

| 改动项 | 说明 |
|--------|------|
| 替换 `editingPeriod` `editValue` | 改为 `editingPeriod`（只存当前编辑的 period 字符串） |
| 修改 `tableData` | `adjusted_ratio` fallback 从 `suggested_adjust_ratio` → `declared_ratio` |
| 新增 `getRatioValueClass(period)` | 根据 adjusted_ratio vs declared_ratio 返回 css class |
| 新增 `getDisplayRatio(period)` | 返回当前显示用的 ratio 值 |
| 新增 `enterEditMode(period)` | 进入编辑模式，如果已在别行先确认退出 |
| 新增 `confirmEdit(period)` | ✓ 按钮处理：setAdjustedRatio → setActualQuantity → 退出编辑 |
| 新增 `handleEditChange(value, period)` | el-input-number @change 时临时存储编辑值 |
| 新增 `resetAllRatios()` | ElMessageBox.confirm → 清空 store → ElMessage.success |
| 修改 `formatNum` | 添加 `formatRatio(val)` 方法格式化比小数显示 |

#### Style 改动

- 新增 `.ratio-not-adjusted` / `.ratio-low` / `.ratio-medium` / `.ratio-high` 样式
- 新增 `.edit-btn` / `.confirm-btn` 图标按钮样式
- 新增 `.edit-mode-row` 编辑态高亮背景

#### 不受影响的部分

- 其他 13 列（合约电量、用户评估电量、价差方向等）的 template 和逻辑
- 底部计算逻辑注解
- 底部配色说明
- 表格外层 wrapper 和整体样式覆盖

## 提交时序列化逻辑（本组件不涉及，供参考）

在 `DailyDemandReportV2/index.vue` 的 submit 函数中处理：

```js
const adjustedRatiosForSubmit = {}
strategyPeriods.forEach(p => {
  const adjusted = adjustedRatios.value[p.period]
  const original = p.declared_ratio
  if (adjusted !== undefined && adjusted !== original) {
    adjustedRatiosForSubmit[p.period] = adjusted
  } else {
    adjustedRatiosForSubmit[p.period] = null
  }
})
```

## 参考组件关键代码

参考 `AuxiliaryTradingTools/components/StrategyTable.vue` 第 150~227 行的实现，包括：
- el-icon Edit / CircleCheck 的使用
- el-input-number 的配置参数
- 编辑状态管理（editingStates）
- 确认逻辑（confirmEdit）
- 分档配色 CSS
