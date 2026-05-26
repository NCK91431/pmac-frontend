# AI 智能天气查询 Demo 设计文档

## 1. 概述

基于 DeepSeek 大模型构建一个智能天气查询 Demo 应用，用户通过自然语言描述查询需求，大模型自动生成 SQL 查询数据库并返回结构化结果。

### 1.1 目标

- 在 `frontend-code/src/pages/demo/` 下创建一个 Demo 页面
- 后端新增 AI 查询接口，对接 DeepSeek API
- 支持用户以口语化自然语言进行天气数据查询
- 返回完整的日期 + 天气信息并以表格展示

### 1.2 用户示例输入

- "参考近5个天气类型为雨天的工作日"
- "与明天最高温接近的近5个工作日"
- "与明天天气类型相似的近5个工作日"
- "筛选近7个晴天的法定节假日"
- "选取近3个温度区间15-25℃的调休节假日"
- "相邻日里最高温度后一天比前一天高于3度的"

## 2. 架构方案

### 2.1 方案选择：方案 A — 大模型直接生成 SQL

用户输入自然语言 → DeepSeek 根据表结构生成 SQL → 后端校验并执行 SQL → 返回结果。

**优势：**
- 灵活性最高，SQL 能表达的任何查询都能处理
- DeepSeek 作为代码生成模型，SQL 生成准确率高
- 零表达能力损失，无需预定义查询模式

**安全措施：**
- 后端严格校验：只允许执行 `SELECT` 语句
- 拦截 `INSERT/UPDATE/DELETE/DROP/ALTER/TRUNCATE` 等操作
- 使用正则表达式做第一层过滤

### 2.2 端到端数据流

```
用户输入 → 前端 DEMO 页面 → POST /api/ai/query
  → 后端拼接 System Prompt + 用户输入 → 调用 DeepSeek API
  → DeepSeek 返回 SQL → 后端校验 SQL（仅 SELECT）→ 执行 SQL
  → 计算 day_of_the_week → 返回 JSON 给前端 → 前端 el-table 渲染
```

## 3. 数据库

### 3.1 vpp_weather_records（天气数据表）

```sql
CREATE TABLE `vpp_weather_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL COMMENT '数据日期',
  `regionPkId` varchar(10) NOT NULL DEFAULT '440400' COMMENT '区域ID',
  `temperatureMin` decimal(5,1) DEFAULT NULL COMMENT '最小温度：°C',
  `temperatureMax` decimal(5,1) DEFAULT NULL COMMENT '最大温度：°C',
  `cloudCoverEarlyMorning` int(11) DEFAULT NULL COMMENT '凌晨云量：%',
  `cloudCoverMorning` int(11) DEFAULT NULL COMMENT '上午云量：%',
  `cloudCoverAfternoon` int(11) DEFAULT NULL COMMENT '下午云量：%',
  `cloudCoverEvening` int(11) DEFAULT NULL COMMENT '晚上云量：%',
  `windSpeed` decimal(5,1) DEFAULT NULL COMMENT '风速：km/h',
  `windDirection` int(11) DEFAULT NULL COMMENT '风向：°',
  `weather` varchar(50) DEFAULT NULL COMMENT '天气状况',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_regionPkId` (`date`, `regionPkId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='VPP天气数据记录表';
```

### 3.2 auxiliary_date_info（日期信息表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| date | date | 日期值 (YYYY-MM-DD) |
| date_type | varchar | 日期分类：法定节假日/调休节假日/工作日/周六/周日 |
| holiday_name | varchar | 节假日名称（如"元旦"），非节假日为 NULL |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### 3.3 关联方式

两张表通过 `date` 字段进行 `INNER JOIN`。

## 4. 后端设计

### 4.1 新增文件

| 文件 | 路径 | 用途 |
|------|------|------|
| 路由 | `routes/aiQuery.js` | POST /api/ai/query 入口，编排流程 |
| Service | `services/aiService.js` | 拼接 System Prompt，调用 DeepSeek Chat API |
| Service | `services/queryService.js` | SQL 安全校验、执行查询、day_of_the_week 计算 |

### 4.2 API 接口

**`POST /api/ai/query`**（Demo 模式，无需 JWT 认证）

请求体：
```json
{
  "prompt": "查找前7个星期三且是雨天且温度在23至26度之间的日期"
}
```

成功响应：
```json
{
  "status": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "date": "2024-01-03",
      "date_type": "工作日",
      "day_of_the_week": 3,
      "holiday_name": null,
      "temperatureMin": 23.5,
      "temperatureMax": 25.8,
      "cloudCoverEarlyMorning": 90,
      "cloudCoverMorning": 85,
      "cloudCoverAfternoon": 99,
      "cloudCoverEvening": 100,
      "windSpeed": 16.4,
      "windDirection": 126,
      "weather": "大雨"
    }
  ]
}
```

失败响应：
```json
{
  "status": 1,
  "msg": "错误描述信息",
  "data": []
}
```

### 4.3 System Prompt 设计

发送给 DeepSeek 的 Prompt 结构：

**System Prompt：**
```
你是一个 SQL 查询专家。数据库中有两张表：

1. vpp_weather_records - 天气数据表
   date (DATE, 日期), temperatureMin (DECIMAL, 最小温度°C),
   temperatureMax (DECIMAL, 最大温度°C),
   cloudCoverEarlyMorning (INT, 凌晨云量%),
   cloudCoverMorning (INT, 上午云量%),
   cloudCoverAfternoon (INT, 下午云量%),
   cloudCoverEvening (INT, 晚上云量%),
   windSpeed (DECIMAL, 风速km/h),
   windDirection (INT, 风向°),
   weather (VARCHAR, 天气状况)

2. auxiliary_date_info - 日期分类表
   date (DATE, 日期), date_type (VARCHAR, 可选值: 法定节假日|调休节假日|工作日|周六|周日),
   holiday_name (VARCHAR, 节假日名称如'元旦', 非节假日为NULL)

两张表通过 date 字段 INNER JOIN。

规则：
- 只返回纯 SQL SELECT 语句，不要任何其他文字、注释或 Markdown
- 查询字段顺序：w.date, a.date_type, a.holiday_name, w.temperatureMin, w.temperatureMax, w.cloudCoverEarlyMorning, w.cloudCoverMorning, w.cloudCoverAfternoon, w.cloudCoverEvening, w.windSpeed, w.windDirection, w.weather
- 使用 vpp_weather_records 的别名 w，auxiliary_date_info 的别名 a
- 查询范围限定在 vpp_weather_records 表中已有的数据日期范围内
- 结果按 w.date DESC 排序
- 使用 LIMIT 限制结果数量
- regionPkId 统一使用 '440400'
```

**User Message：** 用户输入的自然语言查询

### 4.4 DeepSeek API 调用

- **Base URL:** `https://api.deepseek.com`
- **接口:** `/chat/completions`
- **模型:** `deepseek-v4-pro`
- **认证:** Bearer Token 方式传入 API Key
- **方式:** 使用 `axios` 直接调用 HTTP API（项目中已有 axios 依赖）

### 4.5 SQL 安全校验规则

后端对 DeepSeek 返回的 SQL 做以下检查：

1. 必须包含 `SELECT`（不区分大小写）
2. 不能包含以下关键字：`INSERT`、`UPDATE`、`DELETE`、`DROP`、`ALTER`、`TRUNCATE`、`CREATE`、`REPLACE`、`GRANT`、`EXECUTE`
3. 不能包含 `;`（分号，防止多条语句）
4. 不能包含注释符号 `--` 或 `/*`
5. 如果校验不通过，返回友好错误提示

### 4.6 day_of_the_week 计算

后端在获取 SQL 查询结果后，用 JavaScript 的 `new Date(date).getDay()` 计算星期几，转换为 1~7（星期一~星期日）：

```javascript
function getDayOfWeek(dateStr) {
  const day = new Date(dateStr).getDay()
  return day === 0 ? 7 : day
}
```

### 4.7 错误处理

| 场景 | 处理方式 |
|------|----------|
| DeepSeek API 调用失败 | 捕获异常，返回 "大模型服务暂时不可用，请稍后重试" |
| DeepSeek 返回非 SQL 内容 | 返回 "大模型未能生成有效查询，请尝试重新描述" |
| SQL 安全校验不通过 | 返回 "查询请求未通过安全校验" |
| SQL 执行报错 | 捕获异常，返回 "数据库查询异常" |
| 查询结果为空 | 返回空数组，前端展示 "暂无数据" |

## 5. 前端设计

### 5.1 新增文件

| 文件 | 路径 | 用途 |
|------|------|------|
| 页面 | `src/pages/demo/index.vue` | Demo 页面（自包含组件） |
| 路由 | `src/router/index.js` | 新增 `/demo` 路由 |

### 5.2 页面布局

页面分三个区域：

1. **顶部说明区** — 介绍 Demo 能力
2. **聊天输入区** — 文本输入框 + 发送按钮，支持回车发送
3. **结果展示区** — el-table 展示 13 列数据

### 5.3 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| `prompt` | string | 用户输入文本 |
| `loading` | boolean | 请求加载状态 |
| `tableData` | array | 查询结果数据 |
| `errorMsg` | string | 错误信息 |

### 5.4 交互流程

1. 用户输入自然语言 → 点击"发送查询"或按回车
2. 按钮切换为加载状态，显示"大模型分析中..."
3. 调用 `POST /api/ai/query`
4. 成功 → 表格渲染数据
5. 失败 → el-alert 显示错误 + "重试"按钮
6. 空结果 → 显示"暂无数据"提示

### 5.5 表格列定义（13列）

| 列名 | 字段 | 宽度 |
|------|------|------|
| 日期 | date | 100px |
| 星期 | day_of_the_week | 60px |
| 日期类型 | date_type | 80px |
| 节假日 | holiday_name | 80px |
| 最低温 | temperatureMin | 70px |
| 最高温 | temperatureMax | 70px |
| 凌晨云量 | cloudCoverEarlyMorning | 70px |
| 上午云量 | cloudCoverMorning | 70px |
| 下午云量 | cloudCoverAfternoon | 70px |
| 晚上云量 | cloudCoverEvening | 70px |
| 风速 | windSpeed | 70px |
| 风向 | windDirection | 70px |
| 天气 | weather | 80px |

### 5.6 使用的 Element Plus 组件

- `el-input`（输入框，type="textarea", :rows="2"）
- `el-button`（发送按钮，type="primary", :loading）
- `el-table` / `el-table-column`
- `el-alert`（错误提示，type="error"）
- `v-loading` 指令（加载覆盖）

## 6. 环境变量

后端 `.env` 新增：
```
DEEPSEEK_API_KEY=sk-11d7588c6d834c27abcb0bb160769286
```

## 7. 路由挂载

### 后端 (app.js)

```javascript
const aiQueryRouter = require('./routes/aiQuery')
app.use('/api', aiQueryRouter)
```

### 前端 (router/index.js)

```javascript
{
  path: '/demo',
  name: 'Demo',
  component: () => import('../pages/demo/index.vue')
}
```
