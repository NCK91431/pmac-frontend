<template>
  <div class="daily-declaration-v2-page">
    <StepBarV2
      :current-step="store.currentStep"
      :completed-steps="store.completedSteps"
      @switch-step="handleSwitchStep"
    />

    <!-- 步骤1：选择申报日期 -->
    <template v-if="store.currentStep === 1">
      <div class="v2-step-title">
        <span class="step-badge s1">1</span>
        <span class="step-label">选择申报日期</span>
        <span class="step-tag"
          >限制：1.已申报过的日期不可重复申报，仅可申报未申报日期，如需修改请至“历史日前申报”。2.最晚可申报明日日期</span
        >
      </div>

      <DeclarationDateSection v-if="!isStep1Readonly" />
      <DateTargetBanner v-else :date-info="store.dateInfo" />

      <div class="v2-dashboard-header">
        <span class="dashboard-icon">📊</span>
        <span class="dashboard-title">数据看板</span>
        <span class="dashboard-tag">第三方 API · 只读</span>
      </div>

      <!-- 数据看板图表 -->
      <div v-if="store.dateInfo?.date" class="databoard-grid">
        <WeatherInfo
          :date="store.dateInfo?.date || ''"
          :chart-data="store.weatherData?.chartData || []"
          :summary-data="store.weatherData?.summaryData || []"
        />
        <PriceChart
          :date="store.dateInfo?.date || ''"
          :chart-data="store.priceChartData || []"
        />
        <UnifiedDispatchChart
          :date="store.dateInfo?.date || ''"
          :chart-data="store.dispatchData || []"
        />
      </div>
      <div v-else class="databoard-empty">
        <el-empty description="请先选择申报日期" :image-size="120">
          <p class="databoard-empty-hint">
            选择日期后将自动加载天气、电价预测及统调曲线数据
          </p>
        </el-empty>
      </div>

      <div v-if="!isStep1Readonly" class="step-nav">
        <el-button type="primary" @click="goToStep2" class="btn-next"
          >下一步：筛选可用数据源 →</el-button
        >
      </div>
    </template>

    <!-- 步骤2：筛选可用数据源 -->
    <template v-if="store.currentStep === 2">
      <div class="v2-step-title">
        <span class="step-badge s2">2</span>
        <span class="step-label">筛选可用数据源</span>
      </div>

      <DateTargetBanner :date-info="store.dateInfo" />

      <div class="existing-area">
        <h2>输入查询需求</h2>
        <AiQueryPanel :readonly="isStep2Readonly" />
      </div>

      <!-- 查询结果 -->
      <div class="v2-card v2-card-blue">
        <div class="v2-card-header">
          <div class="card-title">
            查询结果
            <span class="v2-badge blue">仅显示最近 2 年</span>
            <el-tag type="info" size="small"
              >共 {{ store.queryResults.length }} 条记录</el-tag
            >
          </div>
          <div class="card-actions">
            <el-button
              size="small"
              @click="store.selectAllQueryResults()"
              :disabled="isStep2Readonly"
              >全选</el-button
            >
            <el-button
              size="small"
              style="margin-left: 8px"
              @click="store.deselectAllQueryResults()"
              :disabled="isStep2Readonly"
              >取消全选</el-button
            >
          </div>
        </div>
        <div class="v2-card-body">
          <QueryResultTable
            :results="store.queryResults"
            :selected-date-set="selectedDateSet"
            :readonly="isStep2Readonly"
            @select="(row) => store.selectQueryResult(row)"
            @deselect="(row) => store.deselectQueryResult(row.date)"
          />
        </div>
      </div>

      <!-- 已选中日期 -->
      <div class="v2-card v2-card-green">
        <div class="v2-card-header">
          <div class="card-title">
            已选中日期
            <el-tag type="success" size="small"
              >共 {{ store.allSelectedDates.length }} 条记录</el-tag
            >
          </div>

          <div class="v2-selected-actions">
            <el-button
              size="small"
              type="primary"
              @click="showAddDialog = true"
              class="v2-btn-primary"
              :disabled="isStep2Readonly"
              >📅 新增日期</el-button
            >
            <el-button
              size="small"
              @click="handleClearAll"
              class="v2-btn-outline-gray"
              :disabled="isStep2Readonly"
              >🗑 移除全部</el-button
            >
          </div>
        </div>
        <div class="v2-card-body">
          <SelectedDatesTable
            :dates="store.allSelectedDates"
            :readonly="isStep2Readonly"
            @remove="(date) => store.removeSelectedDate(date)"
          />
          <AddDateDialog v-model="showAddDialog" />
        </div>
      </div>

      <!-- 价差表（步骤2） -->
      <div class="v2-card" style="border-color: #b7eb8f; margin-top: 16px">
        <div
          class="v2-card-header"
          style="padding: 16px 20px 0; border-bottom: none"
        >
          <div class="card-title">
            ⚡ 价差表
            <span
              class="v2-badge"
              style="background: #722ed1; color: #fff; border: none"
              >选中
              {{ store.priceComparisonData?.dates?.length || 0 }}
              天</span
            >
          </div>
          <div class="price-header-hints">
            <span>⬅ 时段固定</span>
            <span>➡ 低价方向/概率固定</span>
            <span>中间列可横向滚动</span>
          </div>
        </div>
        <PriceComparisonTable :data="store.priceComparisonData" />
      </div>

      <div v-if="!isStep2Readonly" class="step-nav">
        <el-button
          v-if="!isEditMode"
          @click="handleBackToStep1WithWarning"
          class="btn-prev"
          >← 上一步</el-button
        >
        <el-button
          type="primary"
          @click="handleGoToStep3"
          :loading="step3Loading"
          class="btn-next"
          >下一步：申报 →</el-button
        >
      </div>
    </template>

    <!-- 步骤3：申报 -->
    <template v-if="store.currentStep === 3">
      <div class="v2-step-title">
        <span class="step-badge s3">3</span>
        <span class="step-label">申报 — 策略申报表</span>
      </div>

      <DateTargetBanner :date-info="store.dateInfo" />

      <div class="v2-data-flow-bar">
        <span style="font-weight: 600">📊 数据流向：</span>
        <span class="flow-tag api">API</span>
        <span class="flow-target">日前出清电价</span>
        <span class="flow-arrow">→</span>
        <span class="flow-tag api">API</span>
        <span class="flow-target">日前负荷预测</span>
        <span class="flow-arrow">→</span>
        <span class="flow-tag sum">公式计算</span>
        <span class="flow-target">方案一 | 调整比例 | 方案二 | 日前申报</span>
        <span class="flow-arrow">→</span>
        <span class="flow-tag step2">导入</span>
        <span class="flow-target">价差</span>
        <span class="flow-arrow">→</span>
        <span class="flow-tag formula">自动计算</span>
        <span class="flow-target">策略申报系数</span>
        <span class="flow-arrow">→</span>
        <span class="flow-tag auto">自动</span>
        <span class="flow-target">生成策略申报表</span>
      </div>

      <!-- 价差表 -->
      <div class="v2-card" style="border-color: #b7eb8f">
        <div
          class="v2-card-header"
          style="padding: 16px 20px 0; border-bottom: none"
        >
          <div class="card-title">
            ⚡ 价差表
            <span
              class="v2-badge"
              style="background: #722ed1; color: #fff; border: none"
              >选中
              {{ store.priceComparisonData?.dates?.length || 0 }}
              天</span
            >
          </div>
          <div class="price-header-hints">
            <span>⬅ 时段固定</span>
            <span>➡ 低价方向/概率固定</span>
            <span>中间列可横向滚动</span>
          </div>
        </div>
        <PriceComparisonTable :data="store.priceComparisonData" />
      </div>

      <!-- 策略申报表 -->
      <div class="v2-card" style="border-color: #1d39c4">
        <div class="v2-card-header">
          <div class="card-title">
            📋 日前用电侧申报策略表
            <!-- <span
              class="v2-badge"
              style="background: #1d39c4; color: #fff; border: none"
              >16列 · 双表头</span
            > -->
            <template v-if="store.hkd_declaration">
              <span class="hkd-fetched-label">
                <el-icon :size="16"><CircleCheckFilled /></el-icon>
                已成功获取AI申报建议
              </span>
            </template>
            <el-button
              v-else
              @click="fetchHkdDeclaration"
              size="small"
              :icon="MagicStick"
              >获取AI申报建议</el-button
            >
            <span class="strategy-label">
              <el-icon :size="16"><Lightning /></el-icon>
              选择申报策略提供方：
            </span>
            <el-radio-group
              :model-value="store.strategy_provider"
              @change="onProviderChange"
              size="default"
            >
              <el-radio-button value="pilot">派诺方</el-radio-button>
              <el-radio-button value="hkd">华科方</el-radio-button>
            </el-radio-group>
          </div>
          <div
            style="
              display: flex;
              gap: 12px;
              align-items: center;
              font-size: 11px;
              color: #8c8c8c;
            "
          >
            <span>⬅ 时间固定</span>
            <span>➡ 调整申报比例 | 实际申报电量 两列固定</span>
            <span>⬅ ➡ 横向滚动</span>
          </div>
        </div>
        <StrategyTableV2
          ref="strategyTableRef"
          :periods="store.strategyPeriods"
          :summary="store.strategySummary"
          :declaration-date="store.declarationDate"
          :adjusted-ratios="store.adjustedRatios"
          :readonly="isStep3Readonly"
          :submitted="isStep3Submitted"
          :load-forecast="store.load_forecast"
          :price-forecast="store.price_forecast"
          :user-estimated-confirmed="store.userEstimatedConfirmed"
          :strategy-provider="store.strategy_provider"
          :hkd-declaration="store.hkd_declaration"
          @confirm-edit="
            (payload) => store.setAdjustedRatio(payload.period, payload.ratio)
          "
          @reset-all="store.resetAdjustedRatios"
          @confirm-manual-estimated="handleConfirmManualEstimated"
          @switch-load-forecast-mode="handleSwitchLoadForecastMode"
          @switch-price-forecast-mode="handleSwitchPriceForecastMode"
          @update-manual-estimated="
            (values) => store.setLoadForecast('manual_load_data', values)
          "
          @modify-manual-estimated="
            () => store.setUserEstimatedConfirmed(false)
          "
          @batch-set-ratios="handleBatchSetRatios"
        />
      </div>

      <div v-if="!isStep3Submitted" class="step-nav">
        <el-button @click="handleBackToStep2WithWarning" class="btn-prev"
          >← 上一步</el-button
        >
        <el-button @click="handleSubmit" class="btn-finish">
          {{ isEditMode ? "✔ 提交修改" : "✔ 完成并提交" }}
        </el-button>
      </div>
      <div v-else class="step-nav">
        <el-button @click="handleNewDeclaration" class="btn-prev"
          >新建申报</el-button
        >
        <el-button @click="handleViewHistory" class="btn-prev"
          >去历史记录查看</el-button
        >
      </div>
    </template>

    <ConfirmModal
      v-model="showConfirm"
      :summary="confirmSummary"
      @confirm="handleConfirmSubmit"
    />
    <SuccessModal v-model="showSuccess" />

    <div v-if="transitioning" class="v2-loading-overlay">
      <div class="v2-loading-content">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>{{ transitionMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Loading,
  Lightning,
  CircleCheckFilled,
  MagicStick,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useEditMode } from "@/DailyDemandReportV2/composables/useEditMode";
import {
  historyDetailApi,
  updateHistoryApi,
  hkdDeclarationApi,
} from "@/DailyDemandReportV2/api";

import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";
import { useStepNavigation } from "@/DailyDemandReportV2/composables/useStepNavigation";

import StepBarV2 from "@/DailyDemandReportV2/components/StepBarV2.vue";
import DeclarationDateSection from "@/DailyDemandReportV2/components/DeclarationDateSection.vue";
import DateTargetBanner from "@/DailyDemandReportV2/components/DateTargetBanner.vue";
import WeatherInfo from "@/DailyDemandReportV2/components/WeatherInfo.vue";
import PriceChart from "@/DailyDemandReportV2/components/PriceChart.vue";
import UnifiedDispatchChart from "@/DailyDemandReportV2/components/UnifiedDispatchChart.vue";
import AiQueryPanel from "@/DailyDemandReportV2/components/AiQueryPanel.vue";
import QueryResultTable from "@/DailyDemandReportV2/components/QueryResultTable.vue";
import SelectedDatesTable from "@/DailyDemandReportV2/components/SelectedDatesTable.vue";
import AddDateDialog from "@/DailyDemandReportV2/components/AddDateDialog.vue";
import PriceComparisonTable from "@/DailyDemandReportV2/components/PriceComparisonTable.vue";
import StrategyTableV2 from "@/DailyDemandReportV2/components/StrategyTableV2.vue";
import ConfirmModal from "@/DailyDemandReportV2/components/ConfirmModal.vue";
import SuccessModal from "@/DailyDemandReportV2/components/SuccessModal.vue";

import "@/DailyDemandReportV2/styles/index.scss";

const store = useDailyDeclarationV2Store();
const router = useRouter();
const { isEditMode, editDate, editDeclarantId } = useEditMode();
const strategyTableRef = ref(null);
const { goToStep2, goToStep3, goBackToStep1, goBackToStep2 } =
  useStepNavigation();

const step3Loading = ref(false);
const transitioning = ref(false);
const transitionMessage = ref("");
const showConfirm = ref(false);
const showSuccess = ref(false);
const showAddDialog = ref(false);

const isStep1Readonly = computed(
  () => store.isStepCompleted(1) && store.currentStep === 1,
);
const isStep2Readonly = computed(
  () => store.isStepCompleted(2) && store.currentStep === 2,
);
const isStep3Readonly = computed(
  () => store.isStepCompleted(3) && store.currentStep === 3,
);
const isStep3Submitted = computed(
  () => store.submitted && store.currentStep === 3,
);

const selectedDateSet = computed(
  () => new Set(store.allSelectedDates.map((d) => d.date)),
);

// 监听已选中日期变化，自动获取价差表数据（步骤2实时预览，独立于步骤3）
watch(
  () => store.allSelectedDates,
  async (dates) => {
    if (dates && dates.length > 0) {
      const dateList = dates.map((d) => d.date);
      try {
        const res = await store.fetchPriceComparison(dateList);
        if (!res.success) {
          store.priceComparisonData = null;
        }
      } catch (e) {
        console.error("获取价差表数据失败", e);
        store.priceComparisonData = null;
      }
    } else {
      store.priceComparisonData = null;
    }
  },
  { deep: true, immediate: true },
);

const confirmSummary = computed(() => {
  const periods = store.strategyPeriods;
  const provider = store.strategy_provider;
  const adjustedRatios = store.adjustedRatios;
  const loadForecast = store.load_forecast;
  const userEstimatedConfirmed = store.userEstimatedConfirmed;
  const hkdDeclaration = store.hkd_declaration;

  let total = 0;

  periods.forEach((row) => {
    const period = row.period;
    const idx = parseInt(period);
    let rowVal = 0;

    /* 获取调整后的申报比例 */
    let adjustedRatio = adjustedRatios?.[idx];
    if (adjustedRatio === null || adjustedRatio === undefined) {
      if (provider === "hkd") {
        const hkdRatio = hkdDeclaration?.points?.[period]?.hkd_declared_ratio;
        adjustedRatio = hkdRatio ?? row.declared_ratio;
      } else {
        adjustedRatio = row.declared_ratio;
      }
    }

    if (provider === "hkd") {
      const hkdRatio = row.hkd_declared_ratio;
      if (adjustedRatio === hkdRatio) {
        if (row.hkd_declared_quantity != null) {
          rowVal = Number(row.hkd_declared_quantity);
        }
      } else {
        if (
          row.hkd_user_estimated != null &&
          adjustedRatio != null &&
          adjustedRatio !== 0
        ) {
          rowVal = Number(row.hkd_user_estimated) * adjustedRatio;
        }
      }
    } else {
      /* 获取评估电量 */
      let estimatedMwh;
      if (
        loadForecast?.load_forecasting_method === "manual" &&
        userEstimatedConfirmed
      ) {
        estimatedMwh = loadForecast?.manual_load_data?.[period];
      } else {
        estimatedMwh = row.user_estimated;
      }

      const declaredQty = row.declared_quantity;
      const originalRatio = row.declared_ratio;

      if (adjustedRatio === originalRatio) {
        if (declaredQty != null && !isNaN(Number(declaredQty))) {
          rowVal = Number(declaredQty);
        }
      } else {
        if (
          estimatedMwh != null &&
          adjustedRatio != null &&
          adjustedRatio !== 0
        ) {
          rowVal = Number(estimatedMwh) * adjustedRatio;
        }
      }
    }

    /* 每行先四舍五入到2位小数再累加，与表格合计行保持一致 */
    total += Math.round(rowVal * 100) / 100;
  });

  return {
    declarationDate: store.declarationDate,
    dateCount: store.allSelectedDates.length,
    totalQuantity: total.toFixed(2),
  };
});

function handleSwitchStep(step) {
  if (step === store.currentStep) return;
  store.setCurrentStep(step);
}

function handleClearAll() {
  store.clearAllSelected();
}

async function handleGoToStep3() {
  step3Loading.value = true;
  transitioning.value = true;
  transitionMessage.value = "正在获取电价对比数据...";

  const success = await goToStep3((msg) => {
    transitionMessage.value = msg;
  });

  transitioning.value = false;
  step3Loading.value = false;

  if (!success) {
    ElMessage.error("进入申报步骤失败");
    return;
  }

  // 进入步骤 3 后自动拉取 AI 申报建议
  fetchHkdDeclaration();
}

function handleBackToStep1WithWarning() {
  ElMessageBox.confirm(
    "退回上一步将清空当前步骤（筛选可用数据源）的所有已编辑数据，包括 AI 查询结果和已选中的日期。",
    "确认退回",
    {
      confirmButtonText: "确认退回",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      goBackToStep1();
    })
    .catch(() => {});
}

function handleBackToStep2WithWarning() {
  ElMessageBox.confirm(
    "退回上一步将清空当前步骤（申报）的所有已编辑数据，包括策略申报表中已调整的「调整申报比例」值。",
    "确认退回",
    {
      confirmButtonText: "确认退回",
      cancelButtonText: "取消",
      type: "warning",
    },
  )
    .then(() => {
      goBackToStep2();
    })
    .catch(() => {});
}

async function fetchHkdDeclaration() {
  if (!store.declarationDate) {
    ElMessage.warning("请先选择申报日期");
    return;
  }
  try {
    const res = await hkdDeclarationApi(store.declarationDate);
    const body = res.data;
    if (body.code === 0 || body.success) {
      store.hkd_declaration = body.data;
      ElMessage.success("获取AI申报建议成功");
    } else {
      ElMessage.error(body.message || "获取AI申报建议失败");
    }
  } catch (err) {
    console.error("获取AI申报建议失败:", err);
    ElMessage.error("获取AI申报建议失败，请检查网络连接");
  }
}

async function onProviderChange(val) {
  const isHkdMode = val === "hkd";
  const msg = isHkdMode
    ? "确认选中AI申报建议将会重置调整申报比例列中所填入的所有内容"
    : "确认切回派诺方将重置调整申报比例列中所填入的所有内容";

  try {
    await ElMessageBox.confirm(msg, "确认切换", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });

    store.strategy_provider = val;

    const ratiosByPeriod = {};
    (store.strategyPeriods || []).forEach((p) => {
      ratiosByPeriod[p.period] = isHkdMode
        ? (store.hkd_declaration?.points?.[p.period]?.hkd_declared_ratio ??
          p.declared_ratio)
        : p.declared_ratio;
    });

    if (strategyTableRef.value?.batchSetRatios) {
      strategyTableRef.value.batchSetRatios(ratiosByPeriod);
    }
    ElMessage.success(`已切换至${isHkdMode ? "华科方" : "派诺方"}`);
  } catch {
    // 用户取消，不修改 store.strategy_provider
  }
}

function handleBatchSetRatios(ratiosByPeriod) {
  Object.entries(ratiosByPeriod).forEach(([period, ratio]) => {
    store.setAdjustedRatio(period, ratio);
  });
}

function buildPayload() {
  return {
    declaration_date: store.declarationDate,
    dateInfo: store.dateInfo,
    aiQueryText: store.aiQueryText,
    queryResults: store.queryResults,
    allSelectedDates: store.allSelectedDates,
    priceComparisonData: store.priceComparisonData,
    strategyPeriods: store.strategyPeriods,
    adjustedRatios: store.adjustedRatios,
    price_forecast: store.price_forecast,
    load_forecast: store.load_forecast,
    hkd_declaration: store.hkd_declaration,
    strategy_provider: store.strategy_provider,
  };
}

/*
 * 确认手动输入的负荷预测数据 点击“确认此人工评估电量”
 */
function handleConfirmManualEstimated() {
  store.setUserEstimatedConfirmed(true);
}
/*
 * 切换负荷预测模式 选中标题“算法评估电量”- manual “人工评估电量” - api
 */
async function handleSwitchLoadForecastMode(mode) {
  store.setLoadForecast("load_forecasting_method", mode);
  await store.fetchStrategyData();
}
/*
 * 切换电价预测模式 选中标题“算法电价预测”- manual “人工电价预测” - api
 */
async function handleSwitchPriceForecastMode(mode) {
  store.setPriceForecast("price_forecasting_method", mode);
  await store.fetchStrategyData();
}

function handleSubmit() {
  if (strategyTableRef.value?.hasUnconfirmedEdit) {
    ElMessageBox.alert(
      "还有未确认的调整申报比例时段，需全部确认才可完成申报",
      "提示",
      {
        confirmButtonText: "知道了",
        type: "warning",
      },
    );
    return;
  }
  showConfirm.value = true;
}

async function handleConfirmSubmit() {
  showConfirm.value = false;
  let result;
  if (isEditMode.value) {
    const payload = buildPayload();
    const res = await updateHistoryApi(payload);
    result = res.data;
  } else {
    result = await store.submitDeclaration();
  }
  if (result.success) {
    store.markStepCompleted(3);
    store.setSubmitted(true);
    store.priceComparisonData = null;
    store.selectedDates = [];
    store.manualDates = [];
    showSuccess.value = true;
  } else {
    ElMessage.error("提交失败");
  }
}

function handleNewDeclaration() {
  store.resetAll();
}

function handleViewHistory() {
  router.push("/daily-demand-report-v2/history");
}

onMounted(async () => {
  store.resetAll();

  if (isEditMode.value && editDate.value) {
    store.setDeclarationDate(editDate.value);
    try {
      const res = await historyDetailApi(editDate.value, editDeclarantId.value);
      if (res.data.success && res.data.data) {
        store.prefillFromRecord(res.data.data);
        store.markStepCompleted(1);
        store.markStepCompleted(2);
        store.setCurrentStep(3);
      } else {
        ElMessage.error(
          res.data.error || "未找到该日期的申报记录，无法进入编辑模式",
        );
      }
    } catch (err) {
      console.error("[编辑模式] 获取历史记录失败:", err);
      ElMessage.error("获取历史申报记录失败，请检查网络连接");
    }
  }
});
</script>

<style scoped lang="scss">
.v2-selected-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v2-btn-primary {
  background: #1890ff;
  border-color: #1890ff;
}

.v2-btn-outline-gray {
  color: #666;
  border-color: #d9d9d9;
  background: #fff;
}

/* 策略提供方选择 */
.strategy-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 0.3px;
  user-select: none;
  margin-left: 4px;
}

.hkd-fetched-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #67c23a;
  background: #f0f9eb;
  padding: 5px 12px;
  border-radius: 20px;
  line-height: 1;
  white-space: nowrap;
}

:deep(.el-radio-button__inner) {
  font-size: 13px;
  padding: 8px 16px;
}
</style>
