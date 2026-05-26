# 历史日前申报查询 - 右侧面板改造为 el-calendar

## 概述

将历史查询页面右侧面板中的自定义年-月-日树形选择器（`.day-list` 日期网格）替换为 Element Plus 的 `el-calendar` 日历组件。手风琴年份/月份结构保持不变，展开月份后不再显示手动构建的日期网格，而是显示 `el-calendar`。同时将右侧面板加宽至 450px，收起按钮移到标题右侧。

## 动机

- 现有自定义日期网格样式简陋，交互体验不够专业
- `el-calendar` 提供了标准的月份日历布局、星期表头和自动日期计算
- 减少手写日期网格的维护成本

## 改动范围

仅涉及一个文件：
- `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2History/index.vue`

无新增文件，无路由/Store 改动。

## 详细设计

### 1. 面板宽度调整

| 属性 | 当前值 | 修改后 |
|------|--------|--------|
| 面板宽度 | `280px` | `450px` |
| SCSS 变量 | `$panel-width: 280px` | `$panel-width: 450px` |

收起状态宽度保持 `20px` 不变。

### 2. 收起按钮位置

**当前**：浮动在面板左边缘（`.toggle-btn`，`position: fixed; right: ...`）
**修改后**：移到面板标题栏右侧，与"历史申报日期"和 Tag 同行

```html
<div class="panel-header">
  <h3>历史申报日期</h3>
  <el-tag size="small" type="success">{{ store.historyDates.length }} 天</el-tag>
  <button class="collapse-btn" @click="panelCollapsed = !panelCollapsed">▶</button>
</div>
```

展开时显示 `▶`，收起时面板变为窄条，按钮翻转指向。

### 3. 手风琴结构变化

**当前**：.year-list → .year-item → .month-list → .month-item → .day-list（日期网格）
**修改后**：.year-list → .year-item → .month-list → .month-item → .month-detail（el-calendar）

每个月份展开后内部不再渲染 `.day-list`，改为：

```html
<div v-show="expandedMonth === key" class="month-detail">
  <el-calendar v-model="calendarDate" class="history-calendar">
    <template #date-cell="{ data }">
      <div class="cal-cell"
           :class="{
             'has-record': hasRecordByDate(data.date),
             'is-selected': selectedDate === formatCalendarDate(data.date),
           }"
           @click="selectFromCalendar(data.date)">
        {{ data.day.split('-').pop() }}
        <span v-if="hasRecordByDate(data.date)" class="cal-dot">✓</span>
      </div>
    </template>
  </el-calendar>
</div>
```

### 4. 脚本变化

#### 新增变量

```js
const calendarDate = ref(new Date());
```

#### 新增函数

```js
function formatCalendarDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hasRecordByDate(date) {
  return historyDateSet.value.has(formatCalendarDate(date));
}

function selectFromCalendar(date) {
  const dateStr = formatCalendarDate(date);
  if (!hasRecordByDate(date)) {
    ElMessage.info("该日期暂无申报记录");
    return;
  }
  selectedDate.value = dateStr;
  loading.value = true;
  store.fetchRecord(dateStr).finally(() => { loading.value = false; });
}
```

#### 修改 `selectMonth()`

当用户点击月份标签时，不仅展开/折叠该月份，还同步 `calendarDate`：

```js
function selectMonth(year, month) {
  const key = `${year}-${String(month).padStart(2, '0')}`;
  if (expandedMonth.value === key) {
    expandedMonth.value = null;
  } else {
    expandedYear.value = year;
    expandedMonth.value = key;
    calendarDate.value = new Date(year, month - 1, 1);
  }
}
```

#### 移除非必要函数

- `daysInMonth()` — el-calendar 自动处理
- `formatDate()` — 替换为 `formatCalendarDate()`
- `hasRecord()` — 参数不同，拆分为 `hasRecordByDate()`

### 5. 样式变化

#### 面板容器

```scss
$panel-width: 450px;

.right-panel {
  width: $panel-width;
  transition: width 0.3s ease;

  &.collapsed {
    width: 20px;

    .collapse-btn {
      transform: rotate(180deg);
    }
  }
}
```

#### 收起按钮

```scss
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

#### 移除的样式

- `.day-list` — 整个移除
- `.day-item` — 整个移除
- `.day-text` — 整个移除
- `.check-mark` — 整个移除
- `.toggle-btn` — 移除（替换为 `.collapse-btn`）

#### 新增 el-calendar 样式

```scss
.history-calendar {
  --el-calendar-border: none;
  width: 100%;
  padding: 4px 8px 12px;

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

### 6. onMounted 兼容

`onMounted` 中已有 `expandedMonth` 的默认设置逻辑。需要额外设置 `calendarDate`：

```js
onMounted(async () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  expandedYear.value = currentYear;
  const defaultMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  expandedMonth.value = defaultMonth;
  calendarDate.value = new Date(currentYear, currentMonth - 1, 1);

  await store.fetchHistoryDates();
  // ... 其余不变
});
```

## 向后兼容

- 所有 Props 和 Emit 接口不变
- Store 接口不变
- 路由不变
- 其他组件不变
