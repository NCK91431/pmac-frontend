<template>
  <div class="right-panel" :class="{ collapsed: collapsed }">
    <div class="panel-header">
      <h3><slot name="header">日期选择</slot></h3>
      <button class="collapse-btn" @click="toggleCollapse">▶</button>
    </div>

    <div class="year-list">
      <div v-for="year in yearList" :key="year" class="year-item">
        <div
          class="year-label"
          :class="{ 'year-disabled': isYearDisabled(year) }"
          @click="toggleYear(year)"
        >
          <span>{{ year }}年</span>
          <span class="expand-icon">{{
            expandedYear === year ? '−' : '+'
          }}</span>
        </div>

        <div v-show="expandedYear === year" class="month-list">
          <div
            v-for="month in 12"
            :key="`${year}-${String(month).padStart(2, '0')}`"
            class="month-item"
          >
            <div
              class="month-label"
              :class="{ 'month-disabled': isMonthDisabled(year, month) }"
              @click="toggleMonth(year, month)"
            >
              <span>{{ month }}月</span>
              <span class="expand-icon">{{
                expandedMonth === `${year}-${String(month).padStart(2, '0')}`
                  ? '−'
                  : '+'
              }}</span>
            </div>

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
                      'is-selected': modelValue === formatCalendarDate(data.date),
                      'other-month': !isCurrentMonth(data.date),
                      'is-disabled': isDateDisabled(data.date),
                    }"
                    @click="selectDate(data.date)"
                  >
                    {{ data.day.split('-').pop() }}
                    <span
                      v-if="isCurrentMonth(data.date)"
                      class="cal-dot"
                    >
                      <slot
                        name="date-label"
                        :date="data.date"
                        :formattedDate="formatCalendarDate(data.date)"
                      ></slot>
                    </span>
                  </div>
                </template>
              </el-calendar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-if="collapsed"
    class="expand-btn"
    @click="expandPanel"
  >
    ◀
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  maxMonth: {
    type: String,
    default: '',
  },
  maxDate: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'collapse', 'month-change'])

const collapsed = ref(false)
const calendarDate = ref(new Date())
const expandedYear = ref(null)
const expandedMonth = ref(null)

const currentYearVal = new Date().getFullYear()
const currentMonthVal = new Date().getMonth() + 1

// Initialize expanded state
expandedYear.value = currentYearVal
const defaultMonth = `${currentYearVal}-${String(currentMonthVal).padStart(2, '0')}`
expandedMonth.value = defaultMonth
calendarDate.value = new Date(currentYearVal, currentMonthVal - 1, 1)

// 挂载后通知父组件初始展开月份
onMounted(() => {
  emit('month-change', defaultMonth)
})

const yearList = computed(() => {
  const years = []
  for (let y = 2026; y <= currentYearVal; y++) {
    years.push(y)
  }
  return years.reverse()
})

function isYearDisabled(year) {
  if (!props.maxMonth) return false
  return `${year}` > props.maxMonth.slice(0, 4)
}

function isMonthDisabled(year, month) {
  if (!props.maxMonth) return false
  const ym = `${year}-${String(month).padStart(2, '0')}`
  return ym > props.maxMonth
}

function isDateDisabled(date) {
  if (!props.maxDate) return false
  const dateStr = formatCalendarDate(date)
  return dateStr >= props.maxDate
}

function formatCalendarDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isCurrentMonth(date) {
  const calendarMonthVal = calendarDate.value.getMonth()
  const calendarYearVal = calendarDate.value.getFullYear()
  const dateMonth = date.getMonth()
  const dateYear = date.getFullYear()
  return calendarYearVal === dateYear && calendarMonthVal === dateMonth
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
  emit('collapse', collapsed.value)
}

function expandPanel() {
  collapsed.value = false
  emit('collapse', false)
}

function toggleYear(year) {
  if (isYearDisabled(year)) return
  if (expandedYear.value === year) {
    expandedYear.value = null
    expandedMonth.value = null
  } else {
    expandedYear.value = year
    expandedMonth.value = null
  }
}

function toggleMonth(year, month) {
  if (isMonthDisabled(year, month)) return
  const key = `${year}-${String(month).padStart(2, '0')}`
  if (expandedMonth.value === key) {
    expandedMonth.value = null
  } else {
    expandedYear.value = year
    expandedMonth.value = key
    calendarDate.value = new Date(year, month - 1, 1)
    // 展开新月份时通知父组件刷新确认状态
    emit('month-change', key)
  }
}

function selectDate(date) {
  const dateStr = formatCalendarDate(date)
  if (isDateDisabled(date)) return
  if (!isCurrentMonth(date)) return
  emit('update:modelValue', dateStr)
}
</script>

<style scoped lang="scss">
$panel-width: 450px;

.right-panel {
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

.expand-btn {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
  width: 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-right: none;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  color: #bfbfbf;
  font-size: 12px;
  transition: all 0.2s;
  box-shadow: -1px 0 4px rgba(0, 0, 0, 0.06);

  &:hover {
    color: #1890ff;
    background: #f0f5ff;
  }
}

.year-list {
  padding: 8px 0;
}

.year-item {
  border-bottom: 1px solid #f5f5f5;
}

.year-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &.year-disabled {
    color: #ccc;
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
}

.expand-icon {
  font-size: 12px;
  color: #bfbfbf;
  width: 16px;
  text-align: center;
}

.month-list {
  padding-left: 0;
}

.month-item {
  border-top: 1px solid #fafafa;
}

.month-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px 28px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f5f7fa;
  }

  &.month-disabled {
    color: #ccc;
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
}

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

    thead th {
      text-align: center;
      font-size: 14px;
    }

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
      color: red;
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

  &.other-month {
    color: #ccc;
    pointer-events: none;
  }

  &.is-disabled {
    color: #ccc;
    pointer-events: none;
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
</style>
