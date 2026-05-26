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
        <span class="step-tag">自 DailyDemandReport.vue 已有组件</span>
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

      <div v-if="!isStep2Readonly" class="step-nav">
        <el-button @click="handleBackToStep1WithWarning" class="btn-prev"
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
            <span>➡ 价差方向/概率固定</span>
            <span>中间列可横向滚动</span>
          </div>
        </div>
        <PriceComparisonTable :data="store.priceComparisonData" />
      </div>

      <!-- 策略申报表 -->
      <div class="v2-card" style="border-color: #1d39c4">
        <div
          class="v2-card-header"
          style="padding: 16px 20px 0; border-bottom: none"
        >
          <div class="card-title">
            📋 日前用电侧申报策略表
            <span
              class="v2-badge"
              style="background: #1d39c4; color: #fff; border: none"
              >16列 · 双表头</span
            >
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
          @confirm-edit="(payload) => store.setAdjustedRatio(payload.period, payload.ratio)"
          @reset-all="store.resetAdjustedRatios"
        />
      </div>

      <div v-if="!isStep3Submitted" class="step-nav">
        <el-button @click="handleBackToStep2WithWarning" class="btn-prev"
          >← 上一步</el-button
        >
        <el-button @click="handleSubmit" class="btn-finish"
          >✔ 完成并提交</el-button
        >
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
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";
import { useStepNavigation } from "@/DailyDemandReportV2/composables/useStepNavigation";

import StepBarV2 from "@/DailyDemandReportV2/components/StepBarV2.vue";
import DeclarationDateSection from "@/DailyDemandReportV2/components/DeclarationDateSection.vue";
import DateTargetBanner from "@/DailyDemandReportV2/components/DateTargetBanner.vue";
import WeatherInfo from "@/AuxiliaryTradingTools/components/WeatherInfo.vue";
import PriceChart from "@/AuxiliaryTradingTools/components/PriceChart.vue";
import UnifiedDispatchChart from "@/AuxiliaryTradingTools/components/UnifiedDispatchChart.vue";
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

const confirmSummary = computed(() => ({
  declarationDate: store.declarationDate,
  dateCount: store.allSelectedDates.length,
  totalQuantity: store.strategyPeriods
    .reduce((sum, p) => sum + (Number(p.declared_quantity) || 0), 0)
    .toFixed(2),
}));

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
  }
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
  const result = await store.submitDeclaration();
  if (result.success) {
    store.markStepCompleted(3);
    store.setSubmitted(true);
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

onMounted(() => {
  store.resetAll();
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
</style>
