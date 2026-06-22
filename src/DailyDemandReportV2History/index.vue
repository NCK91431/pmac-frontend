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

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <!-- 无记录状态 -->
      <div v-else-if="!store.record" class="empty-state">
        <el-empty
          description="请从右侧日期列表中选择一天查看历史申报记录"
          :image-size="120"
        />
      </div>

      <!-- 有记录状态 -->
      <template v-else>
        <!-- 基本信息与功能banner -->
        <div class="record-banner">
          <div class="banner-left">
            <span class="banner-field">
              共{{ store.declarers.length }}人申报此目标日期
            </span>
            <el-select
              v-model="selectedDeclarerId"
              placeholder="选择申报人"
              size="small"
              style="width: 200px"
              @change="onDeclarerChange"
            >
              <el-option
                v-for="d in store.declarers"
                :key="d.declarant_id"
                :label="d.name"
                :value="d.declarant_id"
              >
                <span style="display: flex; align-items: center; gap: 6px">
                  <el-tag size="small">用户ID:{{ d.declarant_id }}</el-tag>
                  <span>{{ d.name }}</span>
                </span>
              </el-option>
            </el-select>
            <span class="banner-field">
              <el-icon><User /></el-icon>
              <span>申报人：{{ declarerName }}</span>
            </span>
            <span class="banner-divider"></span>
            <span class="banner-field">
              <el-icon><Clock /></el-icon>
              <span>申报时间：{{ submitTime }}</span>
            </span>
          </div>
          <div class="banner-right">
            <el-button v-if="isOwnRecord" type="primary" @click="handleModify"
              >修改申报</el-button
            >
            <el-button
              v-if="isOwnRecord"
              type="danger"
              plain
              @click="handleDelete"
              >删除此申报</el-button
            >
          </div>
        </div>

        <!-- 日期目标banner -->
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
            :user-estimated-confirmed="store.load_forecast?.load_forecasting_method === 'manual'"
            :price-forecast="store.price_forecast"
            :load-forecast="store.load_forecast"
          />
        </div>

        <!-- 日收益分析副表 -->
        <div class="v2-card" style="border-color: #f59e0b">
          <div class="v2-card-header">
            <div class="card-title">📊 日收益分析副表</div>
          </div>
          <DailyProfitSubTable
            :hourly-results="profitAnalysisData.subHourlyResults"
            :daily-summary="profitAnalysisData.subDailySummary"
          />
        </div>
      </template>
    </div>

    <DateSidebar
      :model-value="selectedDate"
      :max-month="maxMonth"
      @update:model-value="handleDateSelect"
      @collapse="panelCollapsed = $event"
    >
      <template #date-label="{ formattedDate }">
        <span v-if="historyDateSet.has(formattedDate)" class="cal-dot">
          {{ getDeclarerCount(formattedDate) }}人已报
        </span>
      </template>
    </DateSidebar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { Loading, Clock } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { useRouter } from "vue-router";
import { User } from "@element-plus/icons-vue";

import { useDailyDeclarationHistoryStore } from "@/store/dailyDeclarationHistory";

import DateTargetBanner from "@/DailyDemandReportV2/components/DateTargetBanner.vue";
import AiQueryTextViewer from "@/DailyDemandReportV2/components/AiQueryTextViewer.vue";
import QueryResultTable from "@/DailyDemandReportV2/components/QueryResultTable.vue";
import SelectedDatesTable from "@/DailyDemandReportV2/components/SelectedDatesTable.vue";
import PriceComparisonTable from "@/DailyDemandReportV2/components/PriceComparisonTable.vue";
import StrategyTableV2 from "@/DailyDemandReportV2/components/StrategyTableV2.vue";
import DailyProfitSubTable from "@/DailyDemandReportV2/components/DailyProfitSubTable.vue";
import DateSidebar from "@/components/DateSidebar.vue";
import { subTableDataApi } from "@/DailyDemandReportV2/api";

const store = useDailyDeclarationHistoryStore();

const router = useRouter();

const user = inject("user");

const selectedDeclarerId = ref(null);

const profitAnalysisData = ref({
  subHourlyResults: [],
  subDailySummary: {},
});

async function fetchProfitAnalysis() {
  if (!store.currentDate || !selectedDeclarerId.value) {
    return;
  }
  try {
    const subResponse = await subTableDataApi(
      store.currentDate,
      selectedDeclarerId.value,
    );

    if (subResponse.data && subResponse.data.success && subResponse.data.data) {
      profitAnalysisData.value = {
        subHourlyResults: subResponse.data.data.hourlyResults,
        subDailySummary: subResponse.data.data.dailySummary,
      };
    }
  } catch (error) {
    console.error("获取日收益分析副表数据失败:", error);
  }
}

const isOwnRecord = computed(() => {
  return store.selectedDeclarer?.declarant_id === user.value?.id;
});

const declarerName = computed(() => {
  return store.selectedDeclarer?.name || user.value?.name || "—";
});

const submitTime = computed(() => {
  if (!store.record?.created_at) return "—";
  const d = new Date(store.record.created_at);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${mi}`;
});

function handleModify() {
  router.push({
    path: "/daily-demand-report-v2",
    query: {
      mode: "edit",
      date: store.currentDate,
      declarant_id: store.selectedDeclarer?.declarant_id,
    },
  });
}

async function onDeclarerChange(declarantId) {
  const declarer = store.declarers.find((d) => d.declarant_id === declarantId);
  if (!declarer) return;
  store.selectedDeclarer = declarer;
  loading.value = true;
  try {
    await store.fetchRecord(store.currentDate, declarantId);
    await fetchProfitAnalysis();
  } finally {
    loading.value = false;
  }
}

function handleDelete() {
  ElMessageBox.confirm(
    "确定要删除该日期的申报记录吗？此操作不可恢复。",
    "确认删除",
    {
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
      type: "warning",
      confirmButtonClass: "el-button--danger",
    },
  )
    .then(async () => {
      await store.deleteRecord(store.currentDate);
      ElMessage.success("申报记录已删除");
      store.record = null;
      store.currentDate = "";
      store.selectedDeclarer = null;
      selectedDeclarerId.value = null;
      await store.fetchAllDeclaredDates();
    })
    .catch(() => {});
}

const panelCollapsed = ref(false);
const loading = ref(false);
const selectedDate = ref("");

const maxMonth = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
});

const historyDateSet = computed(() => {
  const dates = store.allDeclaredDates.map((d) => d.declaration_date);
  return new Set(dates);
});

function getDeclarerCount(dateStr) {
  const item = store.allDeclaredDates.find(
    (d) => d.declaration_date === dateStr,
  );
  return item ? item.declarer_count : 0;
}

function hasRecordByDate(dateStr) {
  return historyDateSet.value.has(dateStr);
}

async function handleDateSelect(dateStr) {
  if (!hasRecordByDate(dateStr)) {
    ElMessage.info("该日期暂无申报记录");
    return;
  }
  selectedDate.value = dateStr;
  loading.value = true;
  try {
    const records = await store.fetchDeclarers(dateStr);
    if (records && records.length > 0) {
      const selfRecord = records.find((r) => r.declarant_id === user.value?.id);
      const target = selfRecord || records[0];
      store.selectedDeclarer = target;
      selectedDeclarerId.value = target.declarant_id;
      await store.fetchRecord(dateStr, target.declarant_id);
      await fetchProfitAnalysis();
    }
  } finally {
    loading.value = false;
  }
}

const selectedDateSet = computed(() => {
  if (!store.allSelectedDates || store.allSelectedDates.length === 0) {
    return new Set();
  }
  return new Set(store.allSelectedDates.map((d) => d.date));
});

onMounted(async () => {
  await store.fetchAllDeclaredDates();

  if (store.allDeclaredDates.length > 0) {
    const firstDate = store.allDeclaredDates[0].declaration_date;
    selectedDate.value = firstDate;
    loading.value = true;
    try {
      const records = await store.fetchDeclarers(firstDate);
      if (records && records.length > 0) {
        const selfRecord = records.find(
          (r) => r.declarant_id === user.value?.id,
        );
        const target = selfRecord || records[0];
        store.selectedDeclarer = target;
        selectedDeclarerId.value = target.declarant_id;
        await store.fetchRecord(firstDate, target.declarant_id);
        await fetchProfitAnalysis();
      }
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped lang="scss">
.record-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 8px;
  margin-bottom: 16px;

  .banner-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .banner-field {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #303133;

    .el-icon {
      font-size: 16px;
      color: #1890ff;
    }
  }

  .banner-divider {
    width: 1px;
    height: 20px;
    background: #91d5ff;
  }

  .banner-right {
    display: flex;
    gap: 8px;
  }
}
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
  max-width: calc(100% - 450px);

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
