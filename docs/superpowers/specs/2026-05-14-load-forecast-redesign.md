# 负荷预测模块重构设计方案

## 概述

将原有单页面（`LoadPre.vue`）通过 `activeTab` + `stage` 多状态变量切换"新建模型"和"已建模型"的混乱逻辑，拆分为两个独立页面。同时解决原有 Bootstrap `card` + `mb-3` 布局导致页面两侧空白过多的问题，改为全宽流体布局。

***

## 一、路由结构

### 嵌套路由方案（已确认）

```
/loadpre              → LoadPre.vue          （新建模型 - 步骤流向导）
/loadpre/history      → LoadHistory.vue      （已建模型 - 左右布局）
```

### 路由配置变更

**新增路由**（`router/index.js`）：

```js
{
    path: "/loadpre/history",
    name: "loadpre_history",
    component: () => import("@/pages/Load/LoadHistory.vue"),
    meta: {
        module: "load",
        breadcrumb: {
            title: "已建模型",
            icon: "bi bi-clock-history",
        },
    },
}
```

**面包屑配置**（`Breadcrumb.vue`）：

在 `routeToBreadcrumb` 对象中新增条目：

```js
loadpre_history: {
    title: "已建模型",
    icon: "bi bi-clock-history",
    hasBackBtn: true,
},
```

在 `updateBreadcrumbs` 函数中新增父级面包屑逻辑：

```js
if (routeName === "loadpre_history") {
    crumbs.push(routeToBreadcrumb["loadpre"]);
}
```

**侧边栏配置变更**：在 `load` 模块 children 中增加「已建模型」条目：

```js
load: {
    title: "负荷预测",
    icon: "bi-bar-chart-line",
    children: [
        { title: "案例展示", route: "/load_example" },
        { title: "新建模型", route: "/loadpre" },
        { title: "已建模型", route: "/loadpre/history" },
    ]
},
```

### 删除内容

- `LoadPre.vue` 中与 `activeTab === 'history'` 相关的所有逻辑和渲染
- `store/load.js` 中的 `activeTab` 状态（不再需要 upload/history 切换）

***

## 二、/loadpre（新建模型）页面设计

### 2.1 整体布局

全宽流体布局，不再使用 Bootstrap `container`、`card`、`mb-3` 等约束性类。步骤条 Element Plus `el-steps` 始终可见于页面顶部。

```
┌──────────────────────────────────────────────────────────────┐
│  [步骤条: 模型配置 → 训练中 → 查看结果]                     │  ← 始终可见
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  根据 stage 渲染不同内容                                      │
│                                                              │
│  stage ==  0:  ChooseMode(上) + Prompt | ConfigForm | FileUpload(下三列) │
│  stage ==  1:  Configuration(顶部) + LoadingOverlay(下方)       │
│  stage ==  2:  Configuration(顶部) + Analysis + ExceptionPrompt + ResultSection │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 步骤条

- 组件：Element Plus `el-steps` + `el-step`
- 步骤标签：`模型配置` → `训练中` → `查看结果`
- 始终可见（所有 stage 下均显示）
- 当前激活步骤由 `stage` 直接映射（stage 值 0/1/2 对应 el-steps 的 0-based 索引）
  - `stage == 0` → 激活"模型配置"
  - `stage == 1` → 激活"训练中"
  - `stage == 2` → 激活"查看结果"
- 颜色：`#2c6fbb`（蓝色系）

### 2.3 Stage 0：模型配置（原选择模式 + 配置参数合并）

页面分为上下两部分：

**上半部分：模式选择**

- 全宽渲染 `ChooseMode` 组件
- 两个模式选择卡片（总负荷预测 / 分项负荷预测）横向排布
- 移除原 Bootstrap card 包裹

**下半部分：配置参数（三列布局）**

| 左侧 (~20%)   | 中间 (~40%)       | 右侧 (~40%)       |
| ------------ | ---------------- | ---------------- |
| `Prompt.vue` | `ConfigForm.vue` | `FileUpload.vue` |
| 要求/介绍/提示内容   | 配置表单字段           | 文件上传区域           |

- 使用 CSS Grid 或 flex 实现三列
- **只**在左侧（Prompt）与中间（ConfigForm）之间放置分割线
  - 中间（ConfigForm）与右侧（FileUpload）同属用户操作区域，之间无分割线
- 移除全部 Bootstrap card 包裹

### 2.4 Stage 1：训练中

两部分垂直堆叠：

1. **顶部**：`Configuration.vue`（配置信息 + 文件信息）
   - 与 Stage 2 共享同一套 Configuration 组件
   - Configuration 组件由原 FinishView\.vue **剥离** Analysis + 异常提示后更名而来，仅保留配置信息 + 文件信息
   - 关键要求：配置信息在 Stage 1→2 切换时持续可见（不消失）
2. **下方**：`LoadingOverlay` 加载动画

### 2.5 Stage 2：查看结果

四部分垂直堆叠：

1. **顶部**：`Configuration.vue`（配置信息 + 文件信息，与 Stage 1 相同）
2. **第二部分**：`Analysis` 组件（负荷特性分析：`load_stabilityindex` + `predictaBility`）
3. **第三部分**：`ExceptionPrompt.vue`（数据异常提示——由原 FinishView\.vue 中的异常提示部分抽离独立）
4. **底部**：`ResultSection`（预测结果图表 + 天气信息）

***

## 三、/loadpre/history（已建模型）页面设计

### 3.1 整体布局

左右两栏布局：

```
┌────────────────────┬───────────────────────────────────────────┐
│  左侧：历史记录导航   │  右侧：详情内容                           │
│                    │                                           │
│  ┌ 条目1 2026-05-14 │  ┌ [删除] [回测分析] [继续预测] ────────┐ │  ← 功能按钮区(右对齐)
│  │ 广州A区变电站    │  ├─基本信息（宽而矮的信息预览行）───────┤ │
│  ├──────────────── │  │ ID | 模式 | 名称✏️ | 范围 | 预测日... │ │
│  ┌ 条目2 2026-05-13 │  │ 创建时间: 2026-05-14 14:30           │ │
│  │        深圳     │  └────────────────────────────────────┘  │
│  ├──────────────── │                                           │
│  ┌ 条目3 2026-05-12 │  ┌ 负荷特性分析 ────────────────────────┐  │
│  │        东莞     │  │ Analysis 组件                        │  │
│  │   (children...) │  └────────────────────────────────────┘  │
│  └──────────────── │                                           │
│                    │  ┌ [D+1] [D+2] [D+3] ──── 数据切换控件 ─┐  │  ← 独立行，全局控制器
│                    │  ├─────────────────────────────────────┤  │
│                    │  │ 负荷预测结果                          │  │
│                    │  │ LoadChart + 下载按钮                 │  │
│                    │  └────────────────────────────────────┘  │
│                    │                                           │
│                    │  ┌ ─── 天气信息 ────────────────────────┐  │
│                    │  │ WeatherInfo（4项横向水平排布）         │  │
│                    │  ├────────────────────────────────────┘  │
│                    │  │ WeatherChart                          │  │
│                    │  └────────────────────────────────────┘  │
└────────────────────┴───────────────────────────────────────────┘
```

### 3.2 左侧：历史记录树状列表导航

- **数据来源**：`HistoryRecordsList.vue` 中的 `fetchRecords()` 获取的树状数据
- **组件**：`el-tree`，但大幅简化
- **展示内容**：只展示简要信息
  - 有自定义名称时：`创建时间  |  自定义名称`
  - 无自定义名称时：`创建时间  |  地点`
  - 格式示例：`2026-05-14 14:30  |  广州A区变电站`
- **无操作按钮**：左侧导航列表中不展示任何操作按钮（删除、回测分析、继续预测等）
  - 这些按钮统一移至右侧内容区，放在基本信息条的**右上方独立区域**（见 3.3）
- **无缩进**：所有节点在同一缩进层级（扁平列表），不通过缩进区分父子关系。如需区分层级，用左侧细边框或图标等细微视觉提示
- **无表头行**：移除 `table-header` 行
- **高亮**：选中项使用蓝色背景高亮（`#f0f7ff`）
- **宽度**：固定 280px 左右，带滚动条

### 3.3 右侧：基本信息条 + 功能按钮区

右侧顶部整体布局如下：

```
┌─────────────────────────────────────────────────────┐
│  [功能按钮区: 删除 | 回测分析 | 继续预测 | ...]        │  ← 独立行，右对齐
├─────────────────────────────────────────────────────┤
│  [基本信息条] ID | 模式 | 名称✏️ | 数据范围📎 | ...   │  ← 宽而矮的信息预览行
│  创建时间: 2026-05-14 14:30                          │
└─────────────────────────────────────────────────────┘
```

**功能按钮区**（独立一行，在基本信息条上方或与基本信息条同行右对齐）：

- 包含：删除、回测分析、继续预测等操作按钮
- **编辑名称按钮**保留在基本信息条内部原有的位置

### 3.4 基本信息条

- **内容来源**：`RecordDetail.vue` L13-L172 的 card-body 部分
  - ID、预测模式、自定义名称（可编辑）、上传数据范围（可下载）、预测日、客户类型（S模式）、光伏配置（S模式）、装机容量（S模式且有光伏）、地点、预测类型
  - 底部：创建时间
- **布局**：占满右侧剩余宽度，高度很矮（约 80-100px 左右）
- **样式**：水平排列的标签-值对，使用 flex 换行排列，紧凑型

### 3.5 右侧：负荷特性分析

- **组件**：`Analysis`（`ConfigSection/components/Analysis.vue`）
- **参数**：`load_stabilityindex` + `predictaBility`

### 3.6 右侧：负荷预测结果 + 天气数据切换控件

- **组件**：`LoadChart`
- **D+1/D+2/D+3 选择器（全局数据切换控件）**：放在"负荷特性分析"与"负荷预测结果"之间的独立行，作为控制"负荷预测结果"和"天气信息"两个区域数据切换的全局控制器
  - 该选择器不属于"负荷预测结果"区域内部，也不属于"天气信息"区域内部
  - 切换 D+1/D+2/D+3 时，下方的负荷预测图表和天气数据同步变化
- **信息**：预测日期显示、日期类型（工作日/周末/节假日）
- **异常提示**：`dataAnomaly` 告警（如存在）
- **操作**：下载预测结果按钮

### 3.7 右侧：天气信息（改动部分）

- **原布局**（RecordDetail.vue）：
  ```
  左列: WeatherInfo（卡片内垂直网格） | 右列: WeatherChart
  ```
- **新布局**：
  ```
  横向 WeatherInfo（4项元素水平排布）  ← 放在天气图表上方
  ─────────────────────────────────
  WeatherChart（温度曲线+辐照度曲线）
  ```
- **WeatherInfo 横向排布**：将原来 WeatherInfo 内部 `weather-grid` 的 `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` 改为水平 flex 行，4 个天气指标（温度范围、天气状况、云量情况、风力风向）横向等分布置
- **城市选择器**：保持在天气图表区域的左上角

***

## 四、组件文件变更清单

### 新增文件

| 文件路径                                               | 说明                                            |
| -------------------------------------------------- | --------------------------------------------- |
| `src/pages/Load/LoadPre.vue`                       | **重写**：拆除 history 相关逻辑，改为全宽 steps 布局          |
| `src/pages/Load/LoadHistory.vue`                   | **新建**：已建模型独立页面，左右布局                          |
| `src/pages/Load/HistorySection/HistorySidebar.vue` | **全新创建**：简化版树状列表导航，不修改 HistoryRecordsList.vue |
| `src/pages/Load/ConfigSection/ExceptionPrompt.vue` | **新建**：从原 FinishView\.vue 抽离的数据异常提示组件         |

### 修改文件

| 文件路径                                             | 变更内容                                                         |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `src/pages/Load/ConfigSection/ConfigSection.vue` | Stage 0 改为三列布局（Prompt + ConfigForm + FileUpload）             |
| `src/pages/Load/ConfigSection/FinishView.vue`    | **更名为** `Configuration.vue`，剥离 Analysis 和异常提示，仅保留配置信息 + 文件信息 |
| `src/pages/Load/ResultSection/WeatherInfo.vue`   | 支持横向水平排列模式（props 控制）                                         |
| `src/pages/Load/ResultSection/ResultSection.vue` | WeatherInfo 移至 WeatherChart 上方水平排列                           |
| `src/store/load.js`                              | 移除 `activeTab` 状态，清理相关 action                                |
| `src/router/index.js`                            | 添加 `/loadpre/history` 路由，更新 sidebar 菜单                       |
| `src/pages/Load/HistorySection/RecordDetail.vue` | 在新页面中不再直接使用，其内容被拆解复用                                         |

### 删除/废弃逻辑

| 文件                  | 删除内容                                                    |
| ------------------- | ------------------------------------------------------- |
| `LoadPre.vue`       | `activeTab` 切换逻辑、`history` tab 渲染、`onClickHistoryTab()` |
| `store/load.js`     | `activeTab`、`setActiveTab()`                            |
| `ConfigSection.vue` | stage 0 原二列布局（改为三列）                                     |
| `FinishView.vue`    | **更名为** `Configuration.vue`，原文件废弃                       |

***

## 五、数据流与状态管理

### 5.1 /loadpre 页面状态

- `stage`：0（模型配置）/ 1（训练中）/ 2（完成）——由 `forecastStore.stage` 控制
- `mode`：T / S——由 `forecastStore.mode` 控制
- 表单数据：`forecastStore.formData`
- 文件数据：`forecastStore.uploadedFile` + `forecastStore.excelInfo`
- 预测结果：`forecastStore.responseData`

### 5.2 /loadpre/history 页面状态

- 选中的历史记录 ID：`forecastStore.activeHistoryRecordId`
- 选中的历史记录数据：`forecastStore.activeHistoryRecord`
- **新增**：`selectedDay`（D+1/D+2/D+3）——仅页面局部状态，不放入 store

### 5.3 页面间独立

- 两个页面使用相同的 Pinia store，但状态互不冲突
- `/loadpre/history` 页面不需要 `stage`、`formData`、`uploadedFile` 等状态
- 导航到 `/loadpre/history` 时不会影响 `/loadpre` 的填写状态

***

## 六、不可触碰的样式约束（★ 最重要的原则）

> **此次改动的全部目标是布局改变和交互逻辑改变，绝对不修改现有的任何文字、图标、标签、图表、表格的样式。**

具体包括但不限于：

- **文字**：所有文本内容、字体大小、颜色、粗细、行高等均保持原样
- **图标**：所有 Bootstrap Icons 图标选择、大小、颜色保持原样
- **标签**：所有表单标签、按钮文字、标题文字的内容和样式保持原样
- **图表**：ECharts 图表（LoadChart、WeatherChart 等）的所有配置、颜色、数据格式保持原样
- **表格**：所有表格的列定义、数据格式、样式保持原样
- **颜色**：各组件内部使用的颜色值均保持原样（主色 `#2c6fbb` 等）

唯一允许的样式变化：**完全移除所有 Bootstrap 布局约束类**，包括但不限于 `container`、`container-fluid`、`row`、`col-*`、`card`、`card-body`、`card-header`、`mb-3`、`my-4`、`flex-grow-1`、`shadow-sm`、`border-0` 等所有 Bootstrap 布局和卡片类。所有布局使用自定义 CSS 实现（flexbox / grid + 自定义间距类），保持代码清爽、轻量。

同时，**清除所有层层套叠的过度包装**——例如 `card` 套 `container` 再套 `card-body` 之类的多层嵌套。每个区块只保留一层最必要的容器，拒绝臃肿，追求清爽。
 

***

## 七、视觉设计规范

- **主色**：`#2c6fbb`（延续现有蓝色系）
- **背景**：`#f5f7fa`（页面底色）
- **卡片**：白色背景，`border-radius: 8px`，轻微阴影（`box-shadow: 0 2px 8px rgba(0,0,0,0.06)`）
- **间距**：使用 `gap` / `padding` 统一间距（16px / 20px），不再使用 `mb-3` 等 Bootstrap 间距类
- **步骤条**：Element Plus `el-steps`，激活色 `#2c6fbb`
- **字体**：保持现有系统字体栈

***

## 八、不在此次设计范围内的内容

- 历史记录数据获取逻辑（`fetchRecords()` API 调用保持原有）
- 预测提交逻辑（`handleSubmit()` 保持不变）
- 下载功能（upload / prediction Excel 下载保持不变）
- 回测分析页面（`LoadCompare.vue` 保持不变）
- 编辑名称弹窗（保持原有实现）
- 案例展示页面（`Publicity.vue` 保持不变）

