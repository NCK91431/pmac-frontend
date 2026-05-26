<template>
  <div class="history-layout">
    <div class="history-main" :class="{ 'panel-collapsed': panelCollapsed }">
      <div class="page-header">
        <div class="page-header-accent"></div>
        <div class="page-header-content">
          <div class="page-header-top">
            <el-icon class="page-header-icon"><Clock /></el-icon>
            <h1>历史日前申报查询</h1>
          </div>
          <p class="page-header-subtitle">查看和管理历史日前用电侧申报记录</p>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="!store.record" class="empty-state">
        <el-empty
          description="请从右侧日期列表中选择一天查看历史申报记录"
          :image-size="120"
        />
      </div>

      <template v-else>
        <DateTargetBanner :date-info="store.dateInfo" />

        <AiQueryTextViewer v-if="store.aiQueryText" :text="store.aiQueryText" />

        <div class="v2-card v2-card-blue">
          <div class="v2-card-header">
            <div class="card-title">
              查询结果
              <el-tag type="info" size="small"
                >共 {{ store.queryResults.length }} 条记录</el-tag
              >
            </div>
          </div>
          <div class="v2-card-body">
            <QueryResultTable
              :results="store.queryResults"
              :selected-date-set="selectedDateSet"
              :readonly="true"
            />
          </div>
        </div>

        <div class="v2-card v2-card-green">
          <div class="v2-card-header">
            <div class="card-title">
              已选中日期
              <el-tag type="success" size="small"
                >共 {{ store.allSelectedDates.length }} 条记录</el-tag
              >
            </div>
          </div>
          <div class="v2-card-body">
            <SelectedDatesTable
              :dates="store.allSelectedDates"
              :readonly="true"
            />
          </div>
        </div>

        <div class="v2-card" style="border-color: #b7eb8f">
          <div
            class="v2-card-header"
            style="padding: 16px 20px 0; border-bottom: none"
          >
            <div class="card-title">⚡ 价差表</div>
          </div>
          <PriceComparisonTable :data="store.priceComparisonData" />
        </div>

        <div class="v2-card" style="border-color: #1d39c4">
          <div
            class="v2-card-header"
            style="padding: 16px 20px 0; border-bottom: none"
          >
            <div class="card-title">📋 日前用电侧申报策略表</div>
          </div>
          <StrategyTableV2
            :periods="store.strategyPeriods"
            :summary="store.strategySummary"
            :declaration-date="store.currentDate"
            :adjusted-ratios="store.adjustedRatios"
            :readonly="true"
            :submitted="true"
          />
        </div>
      </template>
    </div>

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

      <div class="year-list">
        <div v-for="year in yearList" :key="year" class="year-item">
          <div class="year-label" @click="toggleYear(year)">
            <span>{{ year }}年</span>
            <span class="expand-icon">{{
              expandedYear === year ? "−" : "+"
            }}</span>
          </div>

          <div v-show="expandedYear === year" class="month-list">
            <div
              v-for="month in 12"
              :key="`${year}-${String(month).padStart(2, '0')}`"
              class="month-item"
            >
              <div class="month-label" @click="toggleMonth(year, month)">
                <span>{{ month }}月</span>
                <span class="expand-icon">{{
                  expandedMonth === `${year}-${String(month).padStart(2, "0")}`
                    ? "−"
                    : "+"
                }}</span>
              </div>

              <div
                v-show="
                  expandedMonth === `${year}-${String(month).padStart(2, '0')}`
                "
                class="day-list"
              >
                <div
                  v-for="day in daysInMonth(year, month)"
                  :key="formatDate(year, month, day)"
                  class="day-item"
                  :class="{
                    'has-record': hasRecord(year, month, day),
                    selected: selectedDate === formatDate(year, month, day),
                  }"
                  @click="selectDate(year, month, day)"
                >
                  <span class="day-text">{{ day }}日</span>
                  <span v-if="hasRecord(year, month, day)" class="check-mark"
                    >✓</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Loading, Clock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import { useDailyDeclarationHistoryStore } from "@/store/dailyDeclarationHistory";

import DateTargetBanner from "@/DailyDemandReportV2/components/DateTargetBanner.vue";
import AiQueryTextViewer from "@/DailyDemandReportV2/components/AiQueryTextViewer.vue";
import QueryResultTable from "@/DailyDemandReportV2/components/QueryResultTable.vue";
import SelectedDatesTable from "@/DailyDemandReportV2/components/SelectedDatesTable.vue";
import PriceComparisonTable from "@/DailyDemandReportV2/components/PriceComparisonTable.vue";
import StrategyTableV2 from "@/DailyDemandReportV2/components/StrategyTableV2.vue";

const store = useDailyDeclarationHistoryStore();

const panelCollapsed = ref(false);
const loading = ref(false);
const expandedYear = ref(null);
const expandedMonth = ref(null);
const selectedDate = ref("");

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const yearList = computed(() => {
  const years = [];
  for (let y = 2026; y <= currentYear; y++) {
    years.push(y);
  }
  return years.reverse();
});

const historyDateSet = computed(() => new Set(store.historyDates));

const selectedDateSet = computed(() => {
  if (!store.allSelectedDates || store.allSelectedDates.length === 0) {
    return new Set();
  }
  return new Set(store.allSelectedDates.map((d) => d.date));
});

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function hasRecord(year, month, day) {
  const dateStr = formatDate(year, month, day);
  return historyDateSet.value.has(dateStr);
}

function toggleYear(year) {
  if (expandedYear.value === year) {
    expandedYear.value = null;
    expandedMonth.value = null;
  } else {
    expandedYear.value = year;
    expandedMonth.value = null;
  }
}

function toggleMonth(year, month) {
  const key = `${year}-${String(month).padStart(2, "0")}`;
  if (expandedMonth.value === key) {
    expandedMonth.value = null;
  } else {
    expandedYear.value = year;
    expandedMonth.value = key;
  }
}

async function selectDate(year, month, day) {
  const dateStr = formatDate(year, month, day);
  if (!hasRecord(year, month, day)) {
    ElMessage.info("该日期暂无申报记录");
    return;
  }
  selectedDate.value = dateStr;
  loading.value = true;
  try {
    await store.fetchRecord(dateStr);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  expandedYear.value = currentYear;
  expandedMonth.value = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
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
</script>

<style scoped lang="scss">
.history-layout {
  background: #fbfbfb;
  display: flex;
  min-height: calc(100vh - 60px);
  position: relative;
}

.history-main {
  flex: 1;
  padding: 24px 32px;
  transition: margin-right 0.3s ease;
  max-width: calc(100% - 280px);

  &.panel-collapsed {
    max-width: 100%;
  }
}

.page-header {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  &-accent {
    width: 4px;
    background: linear-gradient(180deg, #1890ff 0%, #69c0ff 100%);
    border-radius: 2px;
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &-icon {
    font-size: 22px;
    color: #1890ff;
    background: #e6f7ff;
    padding: 6px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  h1 {
    font-size: 22px;
    color: #1a1a2e;
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.3;
  }

  &-subtitle {
    margin: 0 0 0 38px;
    font-size: 13px;
    color: #8c8c8c;
    font-weight: 400;
    line-height: 1.5;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
  color: #8c8c8c;
}

.empty-state {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.right-panel {
  $panel-width: 280px;

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

.toggle-btn {
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 48px;
  border: 1px solid #e8e8e8;
  border-right: none;
  background: #fff;
  cursor: pointer;
  font-size: 10px;
  color: #8c8c8c;
  border-radius: 4px 0 0 4px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.04);

  &:hover {
    color: #1890ff;
    background: #f0f5ff;
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

  &.active {
    color: #1890ff;
    font-weight: 600;
  }
}

.day-list {
  display: flex;
  flex-wrap: wrap;
  padding: 4px 16px 8px 32px;
  gap: 2px;
}

.day-item {
  $day-width: 20%;
  width: calc($day-width - 2px);
  padding: 4px 2px;
  font-size: 11px;
  color: #8c8c8c;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: all 0.15s;
  position: relative;

  &:hover {
    background: #f0f5ff;
    color: #1890ff;
  }

  &.has-record {
    color: #1890ff;
    font-weight: 500;

    .check-mark {
      color: #1890ff;
    }
  }

  &.selected {
    background: #1890ff;
    color: #fff;
    font-weight: 600;

    &:hover {
      background: #40a9ff;
    }

    .check-mark {
      color: #fff;
    }
  }
}

.day-text {
  flex-shrink: 0;
}

.check-mark {
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.v2-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  margin-bottom: 16px;
  overflow: hidden;

  &-blue {
    border-color: #91d5ff;
  }

  &-green {
    border-color: #b7eb8f;
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    flex-wrap: wrap;
    gap: 8px;
  }

  &-body {
    padding: 0 20px 16px;
  }
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
