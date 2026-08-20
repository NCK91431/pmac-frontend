# 结算电价走势页面 · 设计文档

日期：2026-08-18

## 1. 背景与目标

在「电价分析」模块下新增第三个页面 **「结算电价走势」**（路由 `/price-analysis/settlement-trend`），用于多日维度的结算电价展示与分析：

- 支持按月份 / 近 7 / 15 / 30 天 / 自定义日期范围查看多日结算电价
- 展示区间日均价与各时段均价汇总卡片
- 展示日均结算电价趋势图（平滑曲线 + 均值 / 最高 / 最低标注）
- 展示 24 个分时电价图表（按尖峰 / 峰 / 平 / 谷分组，每行 3 个，180px 高）
- 页面 100% 复刻原型图 `/Users/guansiyu/Desktop/frontend-code/新需求文档/结算电价走势/结算电价走势原型图.html` 的视觉与交互

## 2. 决策记录（已与用户确认）

| 决策点 | 结论 |
|---|---|
| 数据字段 | 展示**实际结算电价**，复用已验证可用的第三方接口 `all/price/chart`，取 `id='2'`（日前结算）与 `id='4'`（实时结算） |
| 展示维度 | 提供**日前结算 / 实时结算**切换控件，**默认展示实时结算** |
| 多日数据获取 | **后端新增多日聚合接口** `/api/settlement-price/trend`，后端循环调用第三方接口，前端一次请求 |
| 数据滞后 | 实际结算电价滞后约 6 天公布，近期日期可能返回 null，前端图表按 null 断点处理 |
| 路由与菜单 | 新增路由 + `sidebarMenuConfig.price_analysis.children` 第三项 |
| 接口鉴权 | 沿用现有 `/analysis` 的 `requireSignature + verifyToken + requireMembership` |

## 3. 后端改造（backend-code/routes/settlementPrice.js）

### 3.1 新增接口 `GET /api/settlement-price/trend`

- 请求参数：`startDate`（YYYY-MM-DD，必填）、`endDate`（YYYY-MM-DD，必填）
- 参数校验：`DATE_RE` 正则；`endDate < startDate` 时返回 400
- 限制最大天数（如 45 天）防止循环过长
- 逻辑：串行循环 `startDate → endDate` 每日调用 `fetchSettlementChart(date)`，从返回数组中 `find(id === '2')` 提取日前结算、`find(id === '4')` 提取实时结算
- 容错：单日失败用 `Promise.allSettled`（或 try/catch）兜底，失败日期对应数据为 null，不影响整体返回
- 响应结构：

```json
{
  "success": true,
  "data": {
    "startDate": "2026-08-01",
    "endDate": "2026-08-15",
    "dates": ["2026-08-01", "2026-08-02", "..."],
    "dayAhead": [[24 个 value], [24 个 value], "..."],
    "realTime": [[24 个 value], [24 个 value], "..."]
  }
}
```

- 单日 24 个 value 顺序与第三方 `dataList` 保持一致（原型按 `HH:00` 顺序 0-23 点）
- 复用现有 `router.use(AuthController.verifyToken)` / `router.use(MembershipController.requireMembership)` 与 `requireSignature` 中间件

## 4. 前端改造（frontend-code）

### 4.1 新页面 src/pages/PriceAnalysis/SettlementTrend/index.vue（新建）

100% 复刻原型图视觉，替换模拟数据为真实接口，并新增「日前结算 / 实时结算」切换。

#### 4.1.1 页面头部

- 深色渐变页头（`linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`）
- 标题「⚡ 多日结算电价展示」（⚡ 用 `#53c1de`）
- 月份选择器：近 12 个月下拉，label「月份：」，选项如「2026年8月」
- 时间范围快捷按钮：「近7天」「近15天」（默认 active）「近30天」，active 样式 `background:#53c1de; color:#1a1a2e`
- 自定义日期：开始 / 结束两个 `el-date-picker`（或原生 date input），max = 今天，选完自动刷新并取消快捷按钮 active
- 模式标签 `.mode-tag`：
  - 夏季（7-9 月，按所选月份判断）→「尖峰平谷模式 (夏季)」，红底红字 `rgba(231,76,60,0.15)` / `#e74c3c`
  - 其他月份 →「峰平谷模式」，`rgba(83,193,222,0.15)` / `#53c1de`

#### 4.1.2 汇总卡片

- grid `repeat(auto-fit, minmax(180px, 1fr))`，卡片白底圆角 12px 阴影
- 「区间日均价」紫色（`#8e44ad`），值单位「元/MWh」
- 夏季额外显示「尖峰时段均价」深红（`#a93226`）；峰 `#bf4f00`；平 `#1f6391`；谷 `#1e8449`
- 时段均价 = 该时段所有时刻 × 所有日期的价格平均值

#### 4.1.3 日均结算电价趋势图（主图表）

- ECharts 平滑曲线，紫色 `#8e44ad`，线宽 3，白边圆形数据点（`symbolSize: 8`）
- 面积渐变填充 `rgba(142,68,173,0.25) → rgba(142,68,173,0.02)`
- X 轴日期 `MM-DD`；Y 轴「元/MWh」
- markLine 三条：
  - 均值线（紫色虚线，label「均值 XXX.XX」，`position: insideEndTop`）
  - 最高竖线（红色虚线，label「最高 XXX.XX」，`position: end`）
  - 最低竖线（绿色虚线，label「最低 XXX.XX」）
- 标题行右侧 span 显示「均值 XXX.XX 元/MWh」
- 高度 360px
- 数据处理：日均值 = 当日 24 个 value 非空值的平均；整日全空则该日 null（折线断点）

#### 4.1.4 分时电价图表（24 个）

- 按尖峰 / 峰 / 平 / 谷分组渲染，每组标题「XX时段电价」+ badge「N个时刻」
- 每组内部 grid `repeat(3, 1fr)`、gap 6px；每个 cell 白底圆角 6px，图表高 180px
- 每个 cell：
  - 标题行：彩色圆点 + 「HH:00 (尖峰/峰/平/谷)」+ 右侧「均值 XXX」
  - 折线：非平滑（`smooth: false`），分组颜色，小圆点 `symbolSize: 4`
  - markLine 三条：均值虚线（分组颜色，label「均值 XXX」）、最高竖线（红）、最低竖线（绿）
- **Y 轴特殊刻度**：
  - `yLower = floor(minVal / 100) * 100`、`yUpper = ceil(maxVal / 100) * 100`
  - axisLabel formatter 按 `matchThreshold = max(yRange / 10, 1)` 匹配：上限刻度 `{max|值}`（红加粗 `#e74c3c`）、下限刻度 `{min|值}`（绿加粗 `#2ecc71`）、其他 `{normal|值}`（灰 `#999`）
- X 轴刻度 rotate 45、`fontSize: 14`
- 图表实例统一管理（数组收集 + resize 监听 + 组件卸载 dispose）

### 4.2 时段配置 TOU_CONFIG（迁移原型图）

```js
const TOU_CONFIG = {
  normal: { // 峰平谷模式（非夏季）
    peak:   ['10:00','11:00','14:00','15:00','16:00','17:00','18:00'], // 7 个
    valley: ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00'], // 8 个
    normal: ['08:00','09:00','12:00','13:00','19:00','20:00','21:00','22:00','23:00'] // 9 个
  },
  sharp: { // 尖峰平谷模式（夏季 7-9 月）
    peak:   ['10:00','14:00','17:00','18:00'], // 4 个
    valley: ['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00'], // 8 个
    normal: ['08:00','09:00','12:00','13:00','19:00','20:00','21:00','22:00','23:00'], // 9 个
    sharp:  ['11:00','15:00','16:00'] // 3 个
  }
};
```

### 4.3 类型元信息 TYPE_META

```js
const TYPE_META = {
  sharp:  { label: '尖峰', color: '#a93226', bg: '#fde8e8' },
  peak:   { label: '峰',   color: '#bf4f00', bg: '#fef3e2' },
  normal: { label: '平',   color: '#1f6391', bg: '#e8f4fd' },
  valley: { label: '谷',   color: '#1e8449', bg: '#e8f8f0' }
};
```

分组渲染顺序：夏季 `['sharp', 'peak', 'normal', 'valley']`，非夏季 `['peak', 'normal', 'valley']`。

### 4.4 API 封装 src/pages/PriceAnalysis/SettlementTrend/api.js（新建）

```js
import request from '@/utils/request'
const BASE = '/api/settlement-price'
export function getSettlementPriceTrend({ startDate, endDate }) {
  return request.get(`${BASE}/trend`, { params: { startDate, endDate } })
}
```

### 4.5 路由与侧边栏（src/router/index.js）

- 新增路由：

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
}
```

- `sidebarMenuConfig.price_analysis.children` 追加：`{ title: "结算电价走势", route: "/price-analysis/settlement-trend" }`

### 4.6 签名路径注册（src/utils/request.js）

`PROTECTED_PATHS` 数组追加 `"/api/settlement-price/trend"`（与 `/analysis` 一致，带动态签名）。

## 5. 数据与交互细节

| 项 | 说明 |
|---|---|
| 日期范围计算 | 快捷按钮：以今天为 end，往前推 N-1 天；自定义：用户所选起止，max=今天 |
| 月份选择 | 仅影响模式标签（夏季判断），日期范围由快捷按钮/自定义决定（与原型一致） |
| 切换月份 | 自动更新模式标签与所有图表（重新拉取数据） |
| 日前/实时切换 | 主趋势图与全部分时图、汇总卡片数据源随之切换，默认实时 |
| Tooltip | 深色底 `rgba(26,26,46,0.9)`，白字；主图表显示日期 + 系列 + 值；分时图显示日期 + 值 |
| null 值处理 | 图表数据含 null 时折线断点；统计值（均值/最高/最低）仅基于非空值 |
| 加载状态 | 请求期间 loading 遮罩，防止切换时图表闪烁 |
| 接口失败 | 提示错误信息，保留上一次成功渲染 |

## 6. 错误处理

| 场景 | 行为 |
|---|---|
| 单日第三方接口失败 | 该日数据 null，不影响整体 |
| startDate/endDate 缺失或格式错误 | 400 提示 |
| endDate < startDate | 400 提示 |
| 范围超过 45 天 | 400 提示（限制循环请求量） |
| 会员未开通 / token 过期 | 沿用现有中间件与 request.js 全局处理 |

## 7. 验证场景

1. 进入「结算电价走势」页面 → 默认近 15 天、实时结算、非夏季模式标签
2. 切换月份到 7-9 月 → 模式标签变红「尖峰平谷模式 (夏季)」，出现尖峰分组与第 5 张汇总卡片
3. 点击近 7 / 30 天 → 日期范围变化、图表刷新
4. 自定义起止日期 → 自动刷新
5. 切换日前/实时 → 全部图表数据源切换
6. 主图表：平滑紫色曲线、均值线、最高/最低竖线、标题行均值
7. 分时图：3 列布局、180px 高、Y 轴上限红加粗 / 下限绿加粗
8. 跨月范围（如 6 月底 7 月初）→ 模式按所选月份判断（与原型一致，按 month 而非范围）

## 8. 范围外（YAGNI）

- 不做多日对比/导出功能
- 不改造现有「结算电价预测与查看」页面
- 不修改第三方接口，仅通过现有 `all/price/chart` 聚合
