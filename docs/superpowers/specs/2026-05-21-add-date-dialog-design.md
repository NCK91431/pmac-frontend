# 新增日期弹窗（AddDateDialog）设计方案

## 概述

为「日前用电侧申报V2」的 Step 2「已选中日期」卡片中的"新增日期"按钮增加弹窗交互流程。用户点击按钮后弹出 Dialog，在 Dialog 中选择日期并调用 `POST /api/daily-declaration/v2/manual-date` 接口获取该日期的完整信息（星期、日期类型、节假日、温度、云量、风速、风向、天气），以单行预览表格形式展示，确认后将该日期及其所有信息添加至已选中日期表格。

## 组件架构

```
src/DailyDemandReportV2/components/
  ├── SelectedDatesTable.vue    （已有，不变）
  └── AddDateDialog.vue         （新建）
```

- **AddDateDialog.vue** — 弹窗组件，包含日期选择、API 调用、预览展示、确定添加
- **index.vue** — 导入 AddDateDialog，用 `v-model` 控制显隐，替换原有日期选择器+新增按钮区域

## 弹窗布局

```
┌────────────────────────────────────────────────┐
│  📅 新增日期                        ✕          │  Dialog header
├────────────────────────────────────────────────┤
│                                                 │
│  【选择日期】  [  📆 请选择日期  ]              │  el-date-picker
│                                                 │
│  ─── 日期信息预览 ───                           │  分隔标题
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ # │ 日期│ 星期│日期类型│节假日│...│天气│操作│ │  预览表格
│  │ 1 │05-17│ 周日│ 节假日 │  —   │...│ ☀️│ — │ │  （单行）
│  └────────────────────────────────────────────┘ │
│                                                 │
│  [取消]              [✔ 确定添加]               │  底部按钮
└────────────────────────────────────────────────┘
```

## 数据流

1. 用户点击「新增日期」→ `showDialog = true`
2. 弹窗打开，用户从 el-date-picker 选择日期 → 触发 change 事件
3. 调用 `manualDateApi(date)` → 获取日期完整信息
4. 预览表格展示该日期全部字段
5. 用户点击「确定添加」→ `store.addManualDate(data)` → 关闭弹窗
6. 切换日期 → 重新调用 API，预览内容更新
7. 取消/关闭 → 不做任何操作，重置状态

## 预览表格列定义

列顺序与 SelectedDatesTable 表格一致：

| 列       | 说明                   |
| -------- | ---------------------- |
| #        | 序号（固定 1）         |
| 日期     | date                   |
| 星期     | day_of_the_week        |
| 日期类型 | date_type              |
| 节假日   | holiday_name           |
| 最低温   | temperatureMin         |
| 最高温   | temperatureMax         |
| 凌晨云量 | cloudCoverEarlyMorning |
| 上午云量 | cloudCoverMorning      |
| 下午云量 | cloudCoverAfternoon    |
| 晚上云量 | cloudCoverEvening      |
| 风速     | windSpeed              |
| 风向°    | windDirection          |
| 天气     | weather                |

## 错误处理

- **API 调用失败** → 预览区域显示 `el-alert type="error"` 错误提示，确定按钮禁用
- **日期已存在**（`allSelectedDates` 中已有该日期）→ 显示 `el-alert type="warning"` 提示"该日期已添加"，确定按钮禁用
- **未选择日期** → 确定按钮禁用
- **加载中** → 预览区显示 `v-loading`，确定按钮 loading 状态

## 边界情况

- 后端返回 `null` 字段 → 显示 `—` 占位符
- 快速切换日期 → 用 loading 状态防止竞态（每次 API 调用独立，以最后响应的结果为准）
- 弹窗关闭后重置：清空选中日期、预览数据、错误状态

## 涉及的修改文件

1. **新建** `src/DailyDemandReportV2/components/AddDateDialog.vue`
2. **修改** `src/DailyDemandReportV2/index.vue` — 替换原有日期选择器+新增按钮，使用 AddDateDialog
