# 历史面板 el-calendar 改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将历史查询右侧面板的自定义日期网格替换为 el-calendar，面板加宽至 450px，收起按钮移到标题右侧。

**Architecture:** 单文件改动（`DailyDemandReportV2History/index.vue`），Vue 3 Composition API + el-calendar 组件 + SCSS 样式。移除手动日期网格渲染逻辑，用 el-calendar 的 `#date-cell` 插槽自定义有记录/选中高亮样式。

**Tech Stack:** Vue 3, Element Plus (el-calendar), SCSS

---

### Task 1: 修改模板 — 面板标题 + 收起按钮

**Files:**
- Modify: `src/DailyDemandReportV2History/index.vue:L96-L106`

- [ ] **Step 1: 替换面板标题区域和收起按钮**

将当前 `.right-panel` 中的 `.toggle-btn`（L97-99）和 `.panel-header`（L101-106）替换为：

```html
<div class="right-panel" :class="{ collapsed: panelCollapsed }">
  <div class="panel-header">
    <h3>历史申报日期</h3>
    <el-tag size="small" type="success"
      >{{ store.historyDates.length }} 天</el-tag
    >
    <button class="collapse-btn" @click="panelCollapsed = !panelCollapsed">
      ▶
    </button>
  </div>
```

- [ ] **Step 2: 完成后检查**

保存文件，确认 `.right-panel` 内的 `<button class="toggle-btn"` 已移除。

---

### Task 2: 修改模板 — 用 el-calendar 替换 .day-list

**Files:**
- Modify: `src/DailyDemandReportV2History/index.vue:L132-L153`

- [ ] **Step 1: 替换日期网格**

将 L132-L153 的 `.day-list` 区域（`v-show="expandedMonth === ..."` 内部的 `div.day-list`）替换为：

```html
<div
  v-show="
    expandedMonth === `${year}-${String(month).padStart(2, '0')}`
  "
  class="month-detail"
>
  <el-calendar v-model="calendarDate" class="history-calendar">
    <template #date-cell="{ data }">
      <div
        class="cal-cell"
        :class="{
          'has-record': hasRecordByDate(data.date),
          'is-selected': selectedDate === formatCalendarDate(data.date),
        }"
        @click="selectFromCalendar(data.date)"
      >
        {{ data.day.split('-').pop() }}
        <span v-if="hasRecordByDate(data.date)" class="cal-dot">✓</span>
      </div>
    </template>
  </el-calendar>
</div>
```

替换完成后，L136-153 原先的 `div.day-list` + `div.day-item` + `span.day-text` + `span.check-mark` 全部移除。

- [ ] **Step 2: 在模板中移除 `selectDate` 和 `formatDate` 引用**

L146 的 `@click="selectDate(year, month, day)"` 已被替换，因此 `selectDate` 函数不再被模板调用。

- [ ] **Step 3: 完成后检查**

确认 `.day-list`、`.day-item`、`.day-text`、`.check-mark` 不再出现在 template 中。

---

### Task 3: 修改脚本 — 新增 cal 相关变量和函数

**Files:**
- Modify: `src/DailyDemandReportV2History/index.vue:L162-L267`

- [ ] **Step 1: 在 `const store = ...` 之后新增 `calendarDate` ref**

在 L177 `const panelCollapsed = ref(false);` 之前插入：

```js
const calendarDate = ref(new Date());
```

- [ ] **Step 2: 新增 `formatCalendarDate` 函数**

在 `const historyDateSet = computed(...)`（L195）之后、`const selectedDateSet = computed(...)`（L197）之前插入：

```js
function formatCalendarDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
```

- [ ] **Step 3: 新增 `hasRecordByDate` 函数**

在 `formatCalendarDate` 之后插入：

```js
function hasRecordByDate(date) {
  return historyDateSet.value.has(formatCalendarDate(date));
}
```

- [ ] **Step 4: 新增 `selectFromCalendar` 函数**

在 `hasRecordByDate` 之后插入：

```js
function selectFromCalendar(date) {
  const dateStr = formatCalendarDate(date);
  if (!hasRecordByDate(date)) {
    ElMessage.info("该日期暂无申报记录");
    return;
  }
  selectedDate.value = dateStr;
  loading.value = true;
  store.fetchRecord(dateStr).finally(() => {
    loading.value = false;
  });
}
```

- [ ] **Step 5: 修改 `toggleMonth` 同步 calendarDate**

将 L227-L235 的 `toggleMonth` 改为：

```js
function toggleMonth(year, month) {
  const key = `${year}-${String(month).padStart(2, "0")}`;
  if (expandedMonth.value === key) {
    expandedMonth.value = null;
  } else {
    expandedYear.value = year;
    expandedMonth.value = key;
    calendarDate.value = new Date(year, month - 1, 1);
  }
}
```

- [ ] **Step 6: 修改 `onMounted` 设置 calendarDate**

将 L252-L267 的 `onMounted` 改为：

```js
onMounted(async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  expandedYear.value = currentYear;
  const defaultMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  expandedMonth.value = defaultMonth;
  calendarDate.value = new Date(currentYear, currentMonth - 1, 1);

  await store.fetchHistoryDates();

  if (store.historyDates.length > 0) {
    const firstDate = store.historyDates[0];
    selectedDate.value = firstDate;
    loading.value = true;
    try {
      await store.fetchRecord(firstDate);
    } finally {
      loading.value = false;
    }
  }
});
```

- [ ] **Step 7: 移除不再需要的函数**

删除以下函数（已不再被 template 调用）：
- `daysInMonth`（L204-206）
- `formatDate`（L208-210）
- `hasRecord`（L212-215）
- `selectDate`（L237-250）

- [ ] **Step 8: 完成后检查**

保存文件，确认无未定义的变量引用。

---

### Task 4: 修改 SCSS — 面板宽度 + 移除旧样式 + 新增 el-calendar 样式

**Files:**
- Modify: `src/DailyDemandReportV2History/index.vue:L270-L582`

- [ ] **Step 1: 面板宽度 280px → 450px + 移除 .toggle-btn**

将 L360 `$panel-width: 280px;` 改为 `$panel-width: 450px;`

将 L383-L408 的 `.toggle-btn { ... }` 整个移除。

- [ ] **Step 2: 修改 .panel-header 和 .right-panel 样式**

将 L359-L381 的 `.right-panel { ... }` 和 L410-L423 的 `.panel-header { ... }` 替换为：

```scss
.right-panel {
  $panel-width: 450px;

  width: $panel-width;
  flex-shrink: 0;
  position: fixed;
  right: 0;
  top: 60px;
  height: calc(100vh - 60px);
  background: #fff;
  border-left: 1px solid #e8e8e8;
  z-index: 1000;
  overflow-y: auto;
  transition:
    transform 0.3s ease,
    width 0.3s ease;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);

  &.collapsed {
    transform: translateX($panel-width - 20px);
    width: 20px;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    font-size: 15px;
    color: #303133;
    font-weight: 600;
  }
}

.collapse-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 14px;
  color: #bfbfbf;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #1890ff;
    background: #f0f5ff;
  }
}
```

- [ ] **Step 3: 修改 .history-main 的 max-width**

将 L282 `max-width: calc(100% - 280px);` 改为 `max-width: calc(100% - 450px);`

- [ ] **Step 4: 移除旧日期网格样式**

删除以下选择器及其内容（L484-L543）：
- `.day-list { ... }`
- `.day-item { ... }`
- `.day-text { ... }`
- `.check-mark { ... }`

- [ ] **Step 5: 新增 el-calendar 样式**

在 `.month-label`（L482）结束之后、`.v2-card`（L545）之前插入：

```scss
.month-detail {
  padding: 4px 8px 12px 28px;
}

.history-calendar {
  --el-calendar-border: none;
  width: 100%;

  :deep(.el-calendar__header) {
    display: none;
  }

  :deep(.el-calendar-table) {
    border: none;

    .el-calendar-day {
      padding: 2px;
      height: auto;
      min-height: 30px;
      border: none;
    }

    .el-calendar-table__row {
      &:not(:last-child) .el-calendar-day {
        border-bottom: none;
      }
    }

    td {
      border: none;
    }

    td.is-today {
      color: #1890ff;
      font-weight: 600;
    }
  }
}

.cal-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;

  &.has-record {
    color: #1890ff;
    font-weight: 500;

    .cal-dot {
      color: #1890ff;
    }
  }

  &.is-selected {
    background: #1890ff;
    color: #fff;
    font-weight: 600;

    .cal-dot {
      color: #fff;
    }

    &:hover {
      background: #40a9ff;
    }
  }

  &:hover {
    background: #f0f5ff;
  }
}

.cal-dot {
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
}
```

- [ ] **Step 6: 完成后检查**

保存文件，用 `GetDiagnostics` 检查零错误。

---

### Task 5: 验证

**Files:**
- Verify: `src/DailyDemandReportV2History/index.vue`

- [ ] **Step 1: 检查诊断**

```bash
# 在 VS Code 中用 GetDiagnostics 验证
```

预期：零错误、零警告（仅允许已有的 summary-method Hint）。

- [ ] **Step 2: 手动检查模板结构**

确认：
- `.right-panel` 中 `.toggle-btn` 已移除，`.collapse-btn` 在 `.panel-header` 内部
- `.day-list` / `.day-item` / `.day-text` / `.check-mark` 已移除
- `el-calendar` 在 `v-show` 的 `.month-detail` 内
- `.cal-cell` 中绑定 `has-record`、`is-selected` 类名和 `@click`
- `.cal-dot` 在有记录时渲染
