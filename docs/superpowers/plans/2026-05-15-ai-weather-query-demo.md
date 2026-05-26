# AI 智能天气查询 Demo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个自然语言天气查询 Demo，用户输入口语化查询条件，大模型自动生成 SQL 并返回结果

**Architecture:** Vue3 前台页面 → Express 后端路由 → DeepSeek API 生成 SQL → 安全校验 → 执行 MySQL 查询 → 返回结构化 JSON

**Tech Stack:** Vue 3 + Element Plus + Express 5 + MySQL2 + DeepSeek (OpenAI-compatible API)

---

### Task 1: 后端 — 创建 aiService.js（调用 DeepSeek API）

**Files:**
- Create: `/Users/guansiyu/Desktop/backend-code/services/aiService.js`

- [ ] **Step 1: 创建 aiService.js 文件**

```javascript
const axios = require('axios');

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-v4-pro';

function buildSystemPrompt() {
  return `你是一个 SQL 查询专家。数据库中有两张表：

1. vpp_weather_records（别名 w）- 天气数据表
   w.date (DATE, 日期), w.temperatureMin (DECIMAL, 最小温度°C),
   w.temperatureMax (DECIMAL, 最大温度°C),
   w.cloudCoverEarlyMorning (INT, 凌晨云量%),
   w.cloudCoverMorning (INT, 上午云量%),
   w.cloudCoverAfternoon (INT, 下午云量%),
   w.cloudCoverEvening (INT, 晚上云量%),
   w.windSpeed (DECIMAL, 风速km/h),
   w.windDirection (INT, 风向°),
   w.weather (VARCHAR, 天气状况)

2. auxiliary_date_info（别名 a）- 日期分类表
   a.date (DATE, 日期), a.date_type (VARCHAR, 可选值: 法定节假日|调休节假日|工作日|周六|周日),
   a.holiday_name (VARCHAR, 节假日名称如'元旦', 非节假日为NULL)

两张表通过 w.date = a.date 进行 INNER JOIN。

约束条件：
- 只返回纯 SQL SELECT 语句，不要任何其他文字、注释或 Markdown 标记
- 查询字段顺序：w.date, a.date_type, a.holiday_name, w.temperatureMin, w.temperatureMax, w.cloudCoverEarlyMorning, w.cloudCoverMorning, w.cloudCoverAfternoon, w.cloudCoverEvening, w.windSpeed, w.windDirection, w.weather
- 查询范围限定在 vpp_weather_records 表中已有的数据日期范围内
- 结果按 w.date DESC 排序
- 使用 LIMIT 限制结果数量
- regionPkId 固定为 '440400'
- 日期分类的概念：今天是 {new Date().toISOString().split('T')[0]}`;
}

async function queryDeepSeek(userPrompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未配置');
  }

  const systemPrompt = buildSystemPrompt();

  const response = await axios.post(
    DEEPSEEK_API_URL,
    {
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      stream: false
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 30000
    }
  );

  const sql = response.data.choices[0].message.content.trim();
  return sql;
}

module.exports = { queryDeepSeek };
```

- [ ] **Step 2: 验证文件语法**

Run: `node -c /Users/guansiyu/Desktop/backend-code/services/aiService.js`
Expected: 无错误输出

---

### Task 2: 后端 — 创建 queryService.js（SQL 校验 + 执行）

**Files:**
- Create: `/Users/guansiyu/Desktop/backend-code/services/queryService.js`

- [ ] **Step 1: 创建 queryService.js 文件**

```javascript
const db = require('../config/db');

function validateSQL(sql) {
  const upper = sql.toUpperCase().trim();

  if (!upper.startsWith('SELECT')) {
    return { valid: false, message: '只允许执行 SELECT 查询' };
  }

  const forbiddenKeywords = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER',
    'TRUNCATE', 'CREATE', 'REPLACE', 'GRANT', 'EXECUTE'
  ];

  for (const keyword of forbiddenKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql) && !regex.test('SELECT')) {
      const withoutSelect = sql.replace(/SELECT[\s\S]*?FROM/i, '');
      if (regex.test(withoutSelect)) {
        return { valid: false, message: `查询包含不允许的关键字: ${keyword}` };
      }
    }
  }

  if (sql.includes(';') && sql.trim().endsWith(';') === false) {
    return { valid: false, message: '不支持多条 SQL 语句' };
  }

  if (sql.includes('--') || sql.includes('/*')) {
    return { valid: false, message: '查询包含注释内容' };
  }

  return { valid: true };
}

function getDayOfWeek(dateStr) {
  const day = new Date(dateStr).getDay();
  return day === 0 ? 7 : day;
}

async function executeQuery(sql) {
  const validation = validateSQL(sql);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const cleanSql = sql.trim().replace(/;$/, '');
  const [rows] = await db.query(cleanSql);

  return rows.map(row => ({
    date: row.date,
    date_type: row.date_type,
    day_of_the_week: getDayOfWeek(row.date),
    holiday_name: row.holiday_name || null,
    temperatureMin: row.temperatureMin,
    temperatureMax: row.temperatureMax,
    cloudCoverEarlyMorning: row.cloudCoverEarlyMorning,
    cloudCoverMorning: row.cloudCoverMorning,
    cloudCoverAfternoon: row.cloudCoverAfternoon,
    cloudCoverEvening: row.cloudCoverEvening,
    windSpeed: row.windSpeed,
    windDirection: row.windDirection,
    weather: row.weather
  }));
}

module.exports = { validateSQL, executeQuery };
```

- [ ] **Step 2: 验证文件语法**

Run: `node -c /Users/guansiyu/Desktop/backend-code/services/queryService.js`
Expected: 无错误输出

---

### Task 3: 后端 — 创建 aiQuery.js 路由

**Files:**
- Create: `/Users/guansiyu/Desktop/backend-code/routes/aiQuery.js`

- [ ] **Step 1: 创建 aiQuery.js 文件**

```javascript
const express = require('express');
const router = express.Router();
const { queryDeepSeek } = require('../services/aiService');
const { executeQuery } = require('../services/queryService');

router.post('/ai/query', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.json({
        status: 1,
        msg: '请输入查询内容',
        data: []
      });
    }

    if (prompt.length > 500) {
      return res.json({
        status: 1,
        msg: '查询内容过长，请精简后重试',
        data: []
      });
    }

    const sql = await queryDeepSeek(prompt.trim());

    const results = await executeQuery(sql);

    return res.json({
      status: 0,
      msg: 'SUCCESS',
      data: results
    });
  } catch (error) {
    console.error('AI 查询失败:', error.message);

    let msg = '查询失败，请稍后重试';
    if (error.message.includes('未配置')) {
      msg = '系统配置错误，请联系管理员';
    } else if (error.message.includes('只允许') || error.message.includes('不允许') || error.message.includes('不支持') || error.message.includes('包含注释')) {
      msg = '大模型生成的查询未通过安全校验，请尝试重新描述查询条件';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      msg = '大模型服务暂时不可用，请稍后重试';
    } else if (error.message.includes('SQL') || error.message.includes('syntax')) {
      msg = '数据库查询异常，请尝试重新描述查询条件';
    }

    return res.json({
      status: 1,
      msg,
      data: []
    });
  }
});

module.exports = router;
```

- [ ] **Step 2: 验证文件语法**

Run: `node -c /Users/guansiyu/Desktop/backend-code/routes/aiQuery.js`
Expected: 无错误输出

---

### Task 4: 后端 — 配置环境变量 + 挂载路由

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/.env`
- Modify: `/Users/guansiyu/Desktop/backend-code/app.js`

- [ ] **Step 1: 在 .env 末尾添加 DEEPSEEK_API_KEY**

在 `/Users/guansiyu/Desktop/backend-code/.env` 末尾添加一行：

```
DEEPSEEK_API_KEY=sk-11d7588c6d834c27abcb0bb160769286
```

- [ ] **Step 2: 在 app.js 中引入并挂载 aiQuery 路由**

在 `app.js` 第 28 行附近（其他 require 之后），添加：

```javascript
const aiQueryRouter = require('./routes/aiQuery');
```

在 `app.js` 第 101 行附近（其他 app.use 之后），添加：

```javascript
app.use('/api', aiQueryRouter); // AI 智能查询路由
```

- [ ] **Step 3: 重启后端服务器验证**

Run: `cd /Users/guansiyu/Desktop/backend-code && node app.js`
Expected: "成功连接到MySQL数据库" + "服务器运行在 http://localhost:3001"
Then stop with Ctrl+C

---

### Task 5: 前端 — 创建 Demo 页面

**Files:**
- Create: `/Users/guansiyu/Desktop/frontend-code/src/pages/demo/index.vue`

- [ ] **Step 1: 创建 demo/index.vue 页面**

```vue
<template>
  <div class="ai-demo-container">
    <div class="header-section">
      <h1 class="title">智能天气查询 Demo</h1>
      <p class="subtitle">基于 DeepSeek 大模型，用自然语言查询天气数据</p>
    </div>

    <div class="input-section">
      <div class="input-label">输入你的查询需求</div>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="2"
        placeholder="例如：查找前7个星期三且是雨天且温度在23至26度之间的日期"
        :disabled="loading"
        @keyup.enter="handleSearch"
      />
      <div class="input-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!prompt.trim()"
          @click="handleSearch"
        >
          {{ loading ? '大模型分析中...' : '发送查询' }}
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="result-section">
      <div v-if="errorMsg" class="error-section">
        <el-alert
          :title="errorMsg"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button
          type="primary"
          plain
          size="small"
          style="margin-top: 12px"
          @click="handleSearch"
        >
          重试
        </el-button>
      </div>

      <div v-else-if="tableData.length > 0" class="table-section">
        <div class="table-header">
          <span class="table-title">查询结果</span>
          <span class="table-count">共 {{ tableData.length }} 条记录</span>
        </div>
        <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
          size="small"
        >
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="day_of_the_week" label="星期" width="60">
            <template #default="scope">
              {{ dayMap[scope.row.day_of_the_week] || scope.row.day_of_the_week }}
            </template>
          </el-table-column>
          <el-table-column prop="date_type" label="日期类型" width="90" />
          <el-table-column prop="holiday_name" label="节假日" width="80">
            <template #default="scope">
              {{ scope.row.holiday_name || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="temperatureMin" label="最低温" width="70" />
          <el-table-column prop="temperatureMax" label="最高温" width="70" />
          <el-table-column prop="cloudCoverEarlyMorning" label="凌云量" width="70">
            <template #default="scope">
              {{ scope.row.cloudCoverEarlyMorning }}%
            </template>
          </el-table-column>
          <el-table-column prop="cloudCoverMorning" label="上午云量" width="70">
            <template #default="scope">
              {{ scope.row.cloudCoverMorning }}%
            </template>
          </el-table-column>
          <el-table-column prop="cloudCoverAfternoon" label="下午云量" width="70">
            <template #default="scope">
              {{ scope.row.cloudCoverAfternoon }}%
            </template>
          </el-table-column>
          <el-table-column prop="cloudCoverEvening" label="晚云量" width="70">
            <template #default="scope">
              {{ scope.row.cloudCoverEvening }}%
            </template>
          </el-table-column>
          <el-table-column prop="windSpeed" label="风速" width="70">
            <template #default="scope">
              {{ scope.row.windSpeed }} km/h
            </template>
          </el-table-column>
          <el-table-column prop="windDirection" label="风向°" width="65" />
          <el-table-column prop="weather" label="天气" width="80" />
        </el-table>
      </div>

      <div v-else-if="searched" class="empty-section">
        <el-empty description="暂无数据，请尝试其他查询条件" />
      </div>

      <div v-else class="placeholder-section">
        <el-empty description="输入查询条件后点击「发送查询」" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/utils/request'

const prompt = ref('')
const loading = ref(false)
const tableData = ref([])
const errorMsg = ref('')
const searched = ref(false)

const dayMap = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日'
}

async function handleSearch() {
  const text = prompt.value.trim()
  if (!text || loading.value) return

  loading.value = true
  errorMsg.value = ''
  tableData.value = []
  searched.value = true

  try {
    const res = await request.post('/api/ai/query', { prompt: text })
    const response = res.data

    if (response.status === 0) {
      tableData.value = response.data
    } else {
      errorMsg.value = response.msg || '查询失败'
    }
  } catch (error) {
    errorMsg.value = '网络请求失败，请检查网络连接后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ai-demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a56db;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.input-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.result-section {
  min-height: 200px;
}

.table-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.table-count {
  font-size: 13px;
  color: #6b7280;
}

.error-section {
  text-align: center;
  padding: 20px 0;
}

.empty-section {
  padding: 40px 0;
}

.placeholder-section {
  padding: 40px 0;
}
</style>
```

- [ ] **Step 2: 验证页面语法**

Run: `cd /Users/guansiyu/Desktop/frontend-code && npx vue-tsc --noEmit src/pages/demo/index.vue` (如失败用 `npx vite build` 验证)
Expected: 无错误

---

### Task 6: 前端 — 注册 /demo 路由

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/router/index.js`

- [ ] **Step 1: 在 router/index.js 的 routes 数组中末尾添加新路由**

在 `routes: [...]` 数组中，在最后一个路由对象之后（第 305 行的 `]` 之前），添加：

```javascript
        {
            path: "/demo",
            name: "demo",
            component: () => import("@/pages/demo/index.vue"),
            meta: {
                breadcrumb: { title: "AI 天气查询 Demo", icon: "bi bi-sun" },
            },
        },
```

- [ ] **Step 2: 验证路由配置**

Run: `cd /Users/guansiyu/Desktop/frontend-code && npx vite build 2>&1 | tail -20`
Expected: 构建成功，无错误

---

### Task 7: 端到端验证

- [ ] **Step 1: 启动后端服务**

Run: `cd /Users/guansiyu/Desktop/backend-code && node app.js`
Expected: "成功连接到MySQL数据库" + "服务器运行在 http://localhost:3001"

- [ ] **Step 2: 启动前端开发服务器**

Run: `cd /Users/guansiyu/Desktop/frontend-code && npx vite --port 5173`
Expected: 开发服务器启动成功

- [ ] **Step 3: 打开浏览器访问 http://localhost:5173/demo**

Expected: 看到 AI 天气查询 Demo 页面

- [ ] **Step 4: 在输入框输入 "查找近5个天气类型为雨天的工作日" 并点击发送**

Expected: 表格展示 5 条符合条件的数据记录

- [ ] **Step 5: 验证返回数据完整性**

Expected: 每条记录包含所有 13 个字段：date, day_of_the_week, date_type, holiday_name, temperatureMin, temperatureMax, cloudCoverEarlyMorning, cloudCoverMorning, cloudCoverAfternoon, cloudCoverEvening, windSpeed, windDirection, weather
