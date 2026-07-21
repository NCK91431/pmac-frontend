<template>
  <div class="daily-profit-layout">
    <!-- 主内容区域 -->
    <div
      class="daily-profit-main"
      :class="{ 'panel-collapsed': panelCollapsed }"
    >
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="page-header-accent"></div>
        <div class="page-header-content">
          <div class="page-header-top">
            <el-icon class="page-header-icon"><Coin /></el-icon>
            <h1>每日收益分析</h1>
            <div class="page-header-meta">
              <span class="meta-item">
                <el-icon><DataLine /></el-icon>
                24小时时段收益逐时展示
              </span>
              <span class="meta-divider"></span>
              <span class="meta-item">
                <el-icon><Coin /></el-icon>
                自动计算交易收益与售电收入
              </span>
              <span class="meta-divider"></span>
              <span class="meta-item">
                <el-icon><List /></el-icon>
                多市场收益汇总一目了然
              </span>
            </div>
          </div>
        </div>
        <!-- 功能按钮：确认/取消确认 -->
        <div class="page-header-actions">
          <template v-if="store.currentDate && !store.loading">
            <el-button
              type="primary"
              size="small"
              @click="openBatchDialog('confirm')"
              :loading="store.confirmLoading"
            >
              批量确认数据
            </el-button>
            <el-button
              size="small"
              @click="openBatchDialog('unconfirm')"
              :loading="store.confirmLoading"
            >
              批量取消确认
            </el-button>
          </template>
        </div>
      </div>

      <div class="top-banner">
        <!-- 日期目标展示：当前日期、目标日期、确认状态 -->
        <DateTargetBanner :date-info="store.dateInfo" />
        <!-- 申报人选择器：根据日期展示可选择的申报人 -->
        <DeclarerSelector
          v-model="store.selectedDeclarerId"
          :declarers="store.declarers"
          :declarer-name="declarerName"
          :total-count="store.declarers.length"
          :show-submit-time="false"
          :show-actions="false"
          @change="onDeclarerChange"
        />
      </div>

      <template v-if="!store.loading">
        <!-- 横向页面导航栏 -->
        <div class="page-nav">
          <div class="page-nav-inner">
            <button
              class="page-nav-item"
              :class="{ active: store.activeTab === 'profitQuery' }"
              @click="store.activeTab = 'profitQuery'"
            >
              <svg
                class="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>收益查询</span>
              <span class="nav-badge" v-if="store.hourlyResults.length > 0"
                >{{ store.hourlyResults.length }}h</span
              >
            </button>
            <button
              class="page-nav-item"
              :class="{ active: store.activeTab === 'profitAnalysis' }"
              @click="store.activeTab = 'profitAnalysis'"
            >
              <svg
                class="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
              <span>收益分析</span>
            </button>
            <button
              class="page-nav-item"
              :class="{ active: store.activeTab === 'backtest' }"
              @click="store.activeTab = 'backtest'"
            >
              <svg
                class="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>回溯对比分析</span>
            </button>
            <div
              class="page-nav-indicator"
              :class="'indicator-' + store.activeTab"
            ></div>
          </div>
        </div>

        <!-- 收益结果查询 -->
        <div v-show="store.activeTab === 'profitQuery'" class="tab-content">
          <!-- 关键指标概览 -->
          <div
            class="summary-cards"
            v-if="Object.keys(store.dailySummary).length"
          >
            <!-- 日前市场 -->
            <div class="summary-card card-day-ahead">
              <div class="card-header">
                <svg
                  class="card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  />
                </svg>
                <span>日前市场</span>
              </div>
              <div class="card-body">
                <div class="metric-item">
                  <span class="metric-label">日前申报电量</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.dayAheadDeclaredPower)
                    }}<span class="metric-unit"> MWh</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">日前结算均价</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.dayAheadSettlementPrice)
                    }}<span class="metric-unit"> 元/MWh</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">日前产生电费</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.dayAheadFee)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
              </div>
            </div>
            <!-- 实时市场 -->
            <div class="summary-card card-real-time">
              <div class="card-header">
                <svg
                  class="card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>实时市场</span>
              </div>
              <div class="card-body">
                <div class="metric-item">
                  <span class="metric-label">实际用电量</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.actualPower)
                    }}<span class="metric-unit"> MWh</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">实时结算均价</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.realTimeSettlementPrice)
                    }}<span class="metric-unit"> 元/MWh</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">实时产生电费</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.realTimeFee)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
              </div>
            </div>
            <!-- 偏差收益 -->
            <div class="summary-card card-deviation">
              <div class="card-header">
                <svg
                  class="card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span>偏差收益</span>
              </div>
              <div class="card-body">
                <div class="metric-item">
                  <span class="metric-label">转移偏差收益</span>
                  <span class="metric-value"
                    >{{
                      formatNum(store.dailySummary.transferredDeviationProfit)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">总偏差收益</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.totalDeviationProfit)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">实际偏差收益</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.actualDeviationProfit)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
              </div>
            </div>
            <!-- 综合收益 -->
            <div class="summary-card card-comprehensive">
              <div class="card-header">
                <svg
                  class="card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>综合收益</span>
              </div>
              <div class="card-body">
                <div class="metric-item">
                  <span class="metric-label">绝对价格成本电费</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.absolutePriceTotalFee)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">售电收入</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.revenue)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">交易收益</span>
                  <span class="metric-value"
                    >{{ formatNum(store.dailySummary.tradingProfit)
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
                <div class="metric-item">
                  <span class="metric-label">峰谷综合收益</span>
                  <span class="metric-value"
                    >{{
                      formatNum(
                        store.dailySummary.peakValleyComprehensiveProfit,
                      )
                    }}<span class="metric-unit"> 元</span></span
                  >
                </div>
              </div>
            </div>
          </div>
          <!-- 展示收益结果 -->
          <DailyProfitMainTable
            v-if="store.hourlyResults.length > 0"
            :hourly-results="store.hourlyResults"
            :daily-summary="store.dailySummary"
          />
          <el-empty v-else description="该日期未出收益结果" />
        </div>

        <!-- 收益分分析 -->
        <div v-show="store.activeTab === 'profitAnalysis'" class="tab-content">
          <div class="sub-section">
            <DailyProfitSubTable
              v-if="store.selectedDeclarerId"
              :hourly-results="subHourlyResults"
              :daily-summary="subDailySummary"
            />
            <el-empty
              v-else
              description="该日期暂无申报记录，无法查看收益分析副表"
            />
          </div>
        </div>

        <!-- 回溯对比分析 -->
        <div v-show="store.activeTab === 'backtest'" class="tab-content">
          <!-- 回溯关键信息对比展示 -->
          <div class="backtest-section">
            <!-- 2026-05-23 及之后的日期展示 -->
            <template
              v-if="store.currentDate && store.currentDate >= '2026-05-23'"
            >
              <!-- 有申报人时即展示 -->
              <template v-if="store.selectedDeclarerId">
                <!-- 多场景关键指标对比 -->
                <div
                  v-if="store.backtestScenarios.length >= 2"
                  class="backtest-comparison"
                >
                  <div class="comparison-title-row">
                    <el-icon :size="15"><TrendCharts /></el-icon>
                    <span>多场景关键指标对比</span>
                  </div>
                  <div class="comparison-scroll-wrap">
                    <table class="comparison-table">
                      <thead>
                        <tr>
                          <th class="th-label">指标</th>
                          <th
                            v-for="(s, i) in store.backtestScenarios"
                            :key="i"
                            class="th-value"
                            :class="'scenario-col-' + i"
                          >
                            <div class="scenario-name">{{ s.name }}</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="metric in comparisonMetrics"
                          :key="metric.key"
                        >
                          <td class="td-label">
                            <el-icon :size="13" class="metric-icon">
                              <component :is="metric.icon" />
                            </el-icon>
                            <span>{{ metric.label }}</span>
                            <span class="unit">{{ metric.unit }}</span>
                          </td>
                          <td
                            v-for="(s, j) in store.backtestScenarios"
                            :key="j"
                            class="td-value"
                            :class="[
                              'scenario-col-' + j,
                              { 'is-winner': metricWinners[metric.key] === j },
                            ]"
                          >
                            <span class="val-text">{{
                              getMetricValue(s, metric.key)
                            }}</span>
                            <span
                              v-if="metricWinners[metric.key] === j"
                              class="winner-badge"
                              >胜出</span
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <el-tabs
                  v-model="store.activeScenario"
                  v-if="store.backtestScenarios.length > 0"
                  type="border-card"
                >
                  <el-tab-pane
                    v-for="(scenario, idx) in store.backtestScenarios"
                    :key="idx"
                    :label="scenario.name"
                    :name="String(idx)"
                  >
                    <!-- 回溯收益表 -->
                    <DailyProfitMainTable
                      :hourly-results="scenario.hourly_results"
                      :daily-summary="scenario.daily_summary"
                    />
                    <!-- 回溯收益分析副表 -->
                    <DailyProfitSubTable
                      :hourly-results="scenario.subProfitTableData"
                      :daily-summary="scenario.subProfitTableSummary"
                      :scenario-name="scenario.name"
                    />
                    <!-- 回溯申报策略表 -->
                    <el-collapse v-model="store.activeStrategyPanels">
                      <el-collapse-item name="strategy">
                        <template #title>
                          <h4 class="scenario-section-title">申报策略表</h4>
                        </template>
                        <BacktestStrategyTable
                          :periods="scenario.strategy_periods"
                          :load-method="scenario.load_method"
                          :price-method="scenario.price_method"
                          :scenario-name="scenario.name"
                        />
                      </el-collapse-item>
                    </el-collapse>
                  </el-tab-pane>
                </el-tabs>
              </template>
              <!-- 无申报人时即展示 -->
              <el-empty
                v-else
                description="该日期暂无申报记录，无法查看回溯收益分析"
              />
            </template>
            <!-- 2026-05-23之前日期日期展示 -->
            <el-empty
              v-else
              description="需2026-05-23及之后日期才能查看回溯收益分析，该日期暂无回溯收益分析数据"
            />
          </div>
        </div>
      </template>
      <!-- 加载中状态 -->
      <div v-else class="page-loading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">数据加载中...</p>
      </div>
    </div>
    <!-- 右侧边栏日期选择器 -->
    <DateSidebar
      v-model="store.currentDate"
      :max-month="maxMonth"
      :max-date="maxDate"
      :default-collapsed="!!route.query.date"
      @collapse="panelCollapsed = $event"
      @month-change="store.fetchConfirmedDates"
    >
      <template #date-label="{ formattedDate }">
        <span
          v-if="store.confirmedDatesSet.has(formattedDate)"
          class="cal-dot confirmed"
          >✓</span
        >
        <span v-else-if="formattedDate <= maxDate" class="cal-dot unconfirmed"
          >未确认</span
        >
      </template>
    </DateSidebar>

    <!-- 批量确认/取消确认弹窗 -->
    <el-dialog
      v-model="batchDialogVisible"
      :title="batchDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item :label="batchDialogLabel">
          <el-date-picker
            v-model="batchDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            @change="onDateRangeChange"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="doBatchAction"
          :loading="store.confirmLoading"
        >
          {{ batchDialogConfirmText }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import {
  Aim,
  Coin,
  DataLine,
  List,
  Lightning,
  Timer,
  Refresh,
  TrendCharts,
  Sunny,
} from "@element-plus/icons-vue";
import { useDailyProfitStore } from "@/store/dailyProfit";
import DateSidebar from "@/components/DateSidebar.vue";
import DateTargetBanner from "@/DailyDemandReportV2/components/DateTargetBanner.vue";
import DailyProfitMainTable from "@/DailyDemandReportV2/components/DailyProfitMainTable.vue";
import DailyProfitSubTable from "@/DailyDemandReportV2/components/DailyProfitSubTable.vue";
import DeclarerSelector from "@/components/DeclarerSelector.vue";
import {
  mainTableDataApi,
  historyDeclarersApi,
  confirmStatusApi,
} from "@/DailyDemandReportV2/api";
import BacktestStrategyTable from "./components/BacktestStrategyTable.vue";
import { ElMessage } from "element-plus";

const store = useDailyProfitStore();
const route = useRoute();

const today = dayjs();
const maxMonth = today.format("YYYY-MM");
const maxDate = today.subtract(6, "day").format("YYYY-MM-DD");
const panelCollapsed = ref(!!route.query.date);

const user = inject("user");

// 副表数据（从 store 中读取）
const subHourlyResults = computed(() => store.subProfitTableData);
const subDailySummary = computed(() => store.subProfitTableSummary);

// 回溯收益数据由 store 保管

const declarerName = computed(() => {
  if (store.selectedDeclarer) return store.selectedDeclarer.name;
  return user.value?.name || "—";
});

async function fetchAllProfitData(date) {
  try {
    const res = await historyDeclarersApi(date);
    if (res.data?.success) {
      const records = res.data.data?.records;
      store.declarers = Array.isArray(records) ? records : [];
      // 有申报人时，可展示收益分析和回溯收益分析数据
      if (store.declarers.length > 0) {
        // 申报人优先选中当前用户，否则选第一个
        const selfRecord = store.declarers.find(
          (r) => r.declarant_id === user.value?.id,
        );
        const target = selfRecord || store.declarers[0];
        store.selectedDeclarer = target;
        store.selectedDeclarerId = target.declarant_id;
        //fetchProfitAnalysis获取收益查询与收益分析数据，store.fetchBacktestData获取回溯收益分析数据
        await Promise.all([
          fetchProfitAnalysis(date, target.declarant_id),
          store.fetchBacktestData(date, target.declarant_id),
        ]);
      } else {
        // 没有申报人，只加载收益查询数据
        await fetchProfitAnalysis(date);
      }
    } else {
    }
  } catch (error) {
    console.error("[fetchAllProfitData] 获取收益数据失败:", error);
    store.loading = false;
  }
}

async function fetchProfitAnalysis(date, declarantId) {
  try {
    const res = await mainTableDataApi(date, declarantId);
    if (res.data?.success && res.data.data) {
      const data = res.data.data;
      // 更新主表数据（store）
      store.hourlyResults = data.hourlyResults || [];
      store.dailySummary = data.dailySummary || {};
      // 更新副表数据（store）
      store.subProfitTableData = data.subProfitTableData || [];
      store.subProfitTableSummary = data.subProfitTableSummary || {};
      // 将主表的交易收益合并到副表数据中（按时段匹配）
      mergeTradingProfit();
    }
  } catch (error) {
    console.error("获取日收益分析数据失败:", error);
  }
}

/** 从主表数据中提取 tradingProfit，按 period 合并到副表 */
function mergeTradingProfit() {
  if (!subHourlyResults.value.length || !store.hourlyResults.length) return;
  const mainMap = new Map(
    store.hourlyResults.map((r) => [r.period, r.tradingProfit]),
  );
  subHourlyResults.value.forEach((row) => {
    const profit = mainMap.get(row.period);
    if (profit !== undefined) {
      row.tradingProfit = profit;
    }
  });
}

/** 格式化数字：保留2位小数，千分位分隔 */
function formatNum(val) {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 回溯对比指标定义 */
const comparisonMetrics = computed(() => [
  {
    key: "declaredSpreadCaptureRate",
    label: "申报价差捕获率",
    unit: "%",
    icon: Aim,
  },
  {
    key: "actualSpreadCaptureRate",
    label: "实际价差捕获率",
    unit: "%",
    icon: Aim,
  },
  {
    key: "dayAheadDeclaredPower",
    label: "日前申报电量",
    unit: "MWh",
    icon: Lightning,
  },
  { key: "dayAheadFee", label: "日前产生电费", unit: "元", icon: Coin },
  { key: "realTimeFee", label: "实时产生电费", unit: "元", icon: Timer },
  {
    key: "transferredDeviationProfit",
    label: "转移偏差收益",
    unit: "元",
    icon: Refresh,
  },
  {
    key: "actualDeviationProfit",
    label: "实际偏差收益",
    unit: "元",
    icon: Coin,
  },
  {
    key: "totalDeviationProfit",
    label: "总偏差收益",
    unit: "元",
    icon: DataLine,
  },

  { key: "powerPurchaseCost", label: "现货购电成本", unit: "元", icon: Coin },
  {
    key: "absolutePriceTotalFee",
    label: "绝对价格成本电费",
    unit: "元",
    icon: Coin,
  },
  { key: "tradingProfit", label: "交易收益", unit: "元", icon: TrendCharts },
  {
    key: "peakValleyComprehensiveProfit",
    label: "峰谷综合收益",
    unit: "元",
    icon: Sunny,
  },
]);

/** 获取某场景指定指标的原始数值 */
function getRawMetricValue(scenario, key) {
  if (!scenario?.daily_summary) return 0;
  if (key === "powerPurchaseCost") {
    return (
      (Number(scenario.daily_summary.dayAheadFee) || 0) +
      (Number(scenario.daily_summary.realTimeFee) || 0) +
      (Number(scenario.daily_summary.transferredDeviationProfit) || 0)
    );
  }
  return Number(scenario.daily_summary[key]) || 0;
}

/** 获取某场景指定指标的格式化值 */
function getMetricValue(scenario, key) {
  if (!scenario?.daily_summary) return "—";
  const val = getRawMetricValue(scenario, key);
  if (
    key === "declaredSpreadCaptureRate" ||
    key === "actualSpreadCaptureRate"
  ) {
    return Math.round(val * 100) + "%";
  }
  return formatNum(val);
}

/** 收益类指标 key（数值越大越好，打胜出标签） */
const higherBetterKeys = [
  "declaredSpreadCaptureRate",
  "actualSpreadCaptureRate",
  "transferredDeviationProfit",
  "totalDeviationProfit",
  "actualDeviationProfit",
  "tradingProfit",
  "peakValleyComprehensiveProfit",
];

/** 成本类指标 key（数值越小越好，打胜出标签） */
const lowerBetterKeys = ["powerPurchaseCost", "absolutePriceTotalFee"];

/** 需要打胜出标签的所有指标 key */
const winnerMetricKeys = [...higherBetterKeys, ...lowerBetterKeys];

/** 每个指标对应的最优场景索引 */
const metricWinners = computed(() => {
  const result = {};
  comparisonMetrics.value.forEach((metric) => {
    if (!winnerMetricKeys.includes(metric.key)) {
      result[metric.key] = -1;
      return;
    }
    const isHigherBetter = higherBetterKeys.includes(metric.key);
    let bestIdx = -1;
    let bestVal = isHigherBetter ? -Infinity : Infinity;
    store.backtestScenarios.forEach((s, i) => {
      const val = getRawMetricValue(s, metric.key);
      const isBetter = isHigherBetter ? val > bestVal : val < bestVal;
      if (isBetter) {
        bestVal = val;
        bestIdx = i;
      }
    });
    result[metric.key] = bestIdx;
  });
  return result;
});

function onDeclarerChange(declarantId) {
  const target = store.declarers.find((d) => d.declarant_id === declarantId);
  if (target) {
    store.selectedDeclarer = target;
    fetchProfitAnalysis(store.currentDate, declarantId);
    store.fetchBacktestData(store.currentDate, declarantId);
  }
}

// 批量确认/取消确认弹窗
const batchDialogVisible = ref(false);
const batchActionMode = ref("confirm"); // 'confirm' | 'unconfirm'
const batchDateRange = ref([]);

/** 当前日期是否已确认 */
const isConfirmed = computed(() => {
  if (!store.currentDate) return false;
  return store.confirmedDatesSet.has(store.currentDate);
});

/** 获取上个月的日期范围 */
function getLastMonthRange() {
  const now = dayjs();
  const lastMonth = now.subtract(1, "month");
  const start = lastMonth.startOf("month").format("YYYY-MM-DD");
  const end = lastMonth.endOf("month").format("YYYY-MM-DD");
  return [start, end];
}

const batchDialogTitle = computed(() =>
  batchActionMode.value === "confirm" ? "批量确认数据" : "批量取消确认",
);

const batchDialogLabel = computed(() =>
  batchActionMode.value === "confirm" ? "确认日期范围" : "取消确认日期范围",
);

const batchDialogConfirmText = computed(() =>
  batchActionMode.value === "confirm" ? "确认数据" : "取消确认",
);

/** 禁止选择未来日期和超过 maxDate 的日期 */
function disabledDate(time) {
  const maxDate = dayjs().subtract(6, "day").endOf("day").toDate();
  const minDate = dayjs().startOf("year").toDate();
  return (
    time.getTime() > maxDate.getTime() || time.getTime() < minDate.getTime()
  );
}

/** 日期范围变化时：非本月自动扩展为整月 */
function onDateRangeChange(range) {
  if (!range || range.length !== 2) return;
  let [start, end] = range;
  const currentMonth = dayjs().format("YYYY-MM");
  const startMonth = dayjs(start).format("YYYY-MM");
  const endMonth = dayjs(end).format("YYYY-MM");
  let changed = false;

  if (startMonth !== currentMonth) {
    const firstDay = dayjs(start).startOf("month").format("YYYY-MM-DD");
    if (firstDay !== start) {
      start = firstDay;
      changed = true;
    }
  }
  if (endMonth !== currentMonth) {
    const lastDay = dayjs(end).endOf("month").format("YYYY-MM-DD");
    if (lastDay !== end) {
      end = lastDay;
      changed = true;
    }
  }

  if (changed) {
    batchDateRange.value = [start, end];
    ElMessage.info("非本月已自动扩展为整月选择");
  }
}

/** 打开批量操作弹窗 */
function openBatchDialog(mode) {
  batchActionMode.value = mode;
  batchDateRange.value = getLastMonthRange();
  batchDialogVisible.value = true;
}

/** 执行批量操作 */
async function doBatchAction() {
  if (!batchDateRange.value || batchDateRange.value.length !== 2) {
    ElMessage.warning("请选择日期范围");
    return;
  }
  const [startDate, endDate] = batchDateRange.value;

  if (batchActionMode.value === "confirm") {
    // 检查已确认的月份
    const months = getMonthsInRange(startDate, endDate);
    const confirmedMonths = [];

    for (const month of months) {
      try {
        const res = await confirmStatusApi(month);
        const confirmedDates = res.data?.data || [];
        // 计算该月在当前范围内的所有日期
        const monthDates = getDatesInMonth(startDate, endDate, month);
        const allConfirmed = monthDates.every((d) =>
          confirmedDates.includes(d),
        );
        if (allConfirmed && monthDates.length > 0) {
          confirmedMonths.push(month);
        }
      } catch {
        // 查询失败则跳过检查，继续执行
      }
    }

    if (confirmedMonths.length > 0) {
      const msg = confirmedMonths
        .map((m) => `${dayjs(m).format("M")}月数据已确认过`)
        .join("，");
      ElMessage.warning(msg);
      batchDialogVisible.value = false;
      return;
    }

    const res = await store.batchConfirmData(startDate, endDate);
    if (res) {
      ElMessage.success(res.message || "批量确认完成");
    } else {
      ElMessage.error("批量确认数据失败");
    }
  } else {
    const res = await store.batchUnconfirmData(startDate, endDate);
    if (res) {
      ElMessage.success(res.message || "批量取消确认完成");
    } else {
      ElMessage.error("批量取消确认失败");
    }
  }
  batchDialogVisible.value = false;
}

/** 获取日期范围内涉及的所有月份 YYYY-MM */
function getMonthsInRange(start, end) {
  const months = [];
  let current = dayjs(start).startOf("month");
  const endMonth = dayjs(end).endOf("month");
  while (current.isBefore(endMonth) || current.isSame(endMonth, "month")) {
    months.push(current.format("YYYY-MM"));
    current = current.add(1, "month");
  }
  return months;
}

/** 获取指定月份在日期范围内的所有日期 */
function getDatesInMonth(start, end, month) {
  const dates = [];
  const monthStart = dayjs(month).startOf("month");
  const monthEnd = dayjs(month).endOf("month");
  const rangeStart = monthStart.isAfter(dayjs(start))
    ? monthStart
    : dayjs(start);
  const rangeEnd = monthEnd.isBefore(dayjs(end)) ? monthEnd : dayjs(end);
  let current = dayjs(rangeStart);
  const last = dayjs(rangeEnd);
  while (current.isBefore(last) || current.isSame(last, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
}

watch(
  () => store.currentDate,
  async (newDate) => {
    if (newDate) {
      // 重置副表状态
      store.declarers = [];
      store.selectedDeclarerId = null;
      store.selectedDeclarer = null;
      store.subProfitTableData = [];
      store.subProfitTableSummary = {};
      store.backtestScenarios = [];
      store.activeScenario = "0";
      store.activeStrategyPanels = [];

      store.loading = true;
      store.activeTab = "profitQuery";
      try {
        await Promise.all([
          store.fetchDateInfo(newDate),
          fetchAllProfitData(newDate),
        ]);
      } finally {
        store.loading = false;
      }
      // 月份切换的确认状态刷新已由 DateSidebar 的 @month-change 事件处理
    }
  },
);

/** 从 URL 查询参数 ?date= 初始化当前日期；无参数时默认选择允许查看范围最后一天 */
onMounted(() => {
  const dateParam = route.query.date;
  if (dateParam && typeof dateParam === "string") {
    store.currentDate = dateParam;
  } else {
    // 侧边导航栏直接进入时，默认选择允许查看范围中的最后一天
    store.currentDate = maxDate;
  }
});

/** 监听路由参数变化（同一页面内 URL 变化时） */
watch(
  () => route.query.date,
  (newDate) => {
    if (
      newDate &&
      typeof newDate === "string" &&
      newDate !== store.currentDate
    ) {
      store.currentDate = newDate;
    }
  },
);
</script>

<style scoped lang="scss">
.daily-profit-layout {
  display: flex;
  min-height: calc(100vh - 60px);
  position: relative;
  background-color: #fff;
}

.daily-profit-main {
  flex: 1;
  margin-right: 460px;
  max-width: calc(100% - 460px);
  position: relative;
  transition:
    margin-right 0.3s ease,
    max-width 0.3s ease;
  background: linear-gradient(
    90deg,
    rgba(24, 144, 255, 0.05) 0%,
    rgba(24, 144, 255, 0.025) 40%,
    transparent 60%
  );

  &.panel-collapsed {
    margin-right: 0;
    max-width: 100%;
  }
}

.page-header {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 10px 24px 10px 24px;
  // border-bottom: 1px solid #f0f0f0;
  position: relative;

  &-accent {
    width: 4px;
    background: linear-gradient(180deg, #1890ff 0%, #91d5ff 100%);
    border-radius: 2px;
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &-icon {
    font-size: 25px;
    color: #1890ff;
    background: #e6f7ff;
    padding: 6px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  h1 {
    font-size: 22px;
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.3;
    background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &-tag {
    margin-left: 4px;
    font-weight: 400;
  }

  &-subtitle {
    margin: 0 0 0 0;
    font-size: 13px;
    color: #8c8c8c;
    font-weight: 400;
    line-height: 1.5;
  }

  &-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 2px;
    margin-left: 15px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #bfbfbf;

      .el-icon {
        font-size: 13px;
        color: #1890ff;
      }
    }

    .meta-divider {
      width: 1px;
      height: 12px;
      background: #e8e8e8;
    }
  }

  &-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    .confirmed-label {
      font-size: 13px;
      color: #52c41a;
      font-weight: 600;
    }
  }
}

.top-banner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px;
}

/* 横向页面导航栏 */
.page-nav {
  padding: 0 24px 0;

  .page-nav-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f7f8fa;
    padding: 4px;
    position: relative;
    border: 1px solid #eef0f2;
  }

  .page-nav-item {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 18px;
    border: none;
    background: transparent;
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    color: #6b7280;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
    white-space: nowrap;
    font-family: inherit;
    flex: 1;
    justify-content: center;

    &:hover {
      color: #374151;
      background: rgba(255, 255, 255, 0.6);
    }

    &.active {
      color: #1a365d;
      font-weight: 600;

      &:hover {
        color: #1a365d;
        background: transparent;
      }
    }

    .nav-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    &.active .nav-icon {
      opacity: 1;
      color: #2563eb;
    }

    .nav-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 18px;
      padding: 0 5px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 3px;
      background: #eef0f2;
      color: #6b7280;
      line-height: 1;
    }

    &.active .nav-badge {
      background: #e0e7ff;
      color: #4f46e5;
    }
  }

  .page-nav-indicator {
    position: absolute;
    bottom: 4px;
    left: 4px;
    height: calc(100% - 8px);
    background: #e0e7ff;
    border-radius: 9px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.04);
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;

    &.indicator-profitQuery {
      width: calc(33.333% - 4px);
      transform: translateX(0);
    }

    &.indicator-profitAnalysis {
      width: calc(33.333% - 4px);
      transform: translateX(calc(100% + 4px));
    }

    &.indicator-backtest {
      width: calc(33.333% - 6px);
      transform: translateX(calc(200% + 8px));
    }
  }
}

.tab-content {
  padding: 10px 24px 24px;
}

.sub-section {
  margin-top: 16px;
}

.v2-card {
  background: #fff;

  overflow: hidden;

  &.sub-card {
    // border-color: #f59e0b;
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    flex-wrap: wrap;
    gap: 8px;
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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-overlay {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  z-index: 999;
}

.initial-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;

  .initial-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .initial-state-icon {
    font-size: 48px;
    color: #d9d9d9;
  }

  .initial-state-text {
    margin: 0;
    font-size: 15px;
    color: #bfbfbf;
    font-weight: 400;
  }
}

// DateSidebar 日期状态样式（通过 :deep 穿透到插槽内容）
:deep(.cal-dot) {
  font-size: 11px;
  margin-left: 4px;

  &.confirmed {
    color: #52c41a;
    font-weight: 700;
  }

  &.unconfirmed {
    color: #bfbfbf;
    font-weight: 400;
  }
}

/* 回溯收益分析区域 */
.backtest-section {
  margin-top: 0;

  .scenario-section-title {
    margin: 16px 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    padding-left: 8px;
    border-left: 3px solid #1890ff;
    line-height: 1.4;
  }

  .el-tabs {
    margin-top: 8px;
  }
}

/* 回溯多场景关键指标对比 */
.backtest-comparison {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;

  .comparison-title-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;

    .el-icon {
      color: #1890ff;
    }
  }

  .comparison-scroll-wrap {
    overflow-x: auto;
    padding: 0 4px;
  }

  .comparison-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
      padding: 4px 10px;
      text-align: right;
      font-size: 12px;
      white-space: nowrap;
      border-bottom: 1px solid #f0f0f0;
    }

    .th-label {
      width: 140px;
      min-width: 140px;
      text-align: left;
      color: #606266;
      font-weight: 500;
      background: #fafafa;
    }

    .th-value {
      width: 120px;
      min-width: 120px;
      font-weight: 500;
      background: #fafafa;

      .scenario-name {
        display: inline-block;
        padding: 1px 8px;
        border-radius: 3px;
        font-size: 11px;
        line-height: 1.8;
        background: #f0f0f0;
        color: #606266;
        font-weight: 600;
      }
    }

    // 各场景列主题色
    $scenario-colors: (#1890ff, #52c41a, #faad14, #722ed1);

    @each $color in $scenario-colors {
      $i: index($scenario-colors, $color) - 1;

      th.scenario-col-#{$i} {
        .scenario-name {
          background: rgba($color, 0.1);
          color: $color;
        }
      }

      td.scenario-col-#{$i} {
        color: $color;
      }

      tbody tr:hover td.scenario-col-#{$i} {
        background: rgba($color, 0.04);
      }
    }

    .td-label {
      text-align: left;
      color: #303133;
      font-weight: 500;

      .metric-icon {
        vertical-align: -2px;
        margin-right: 4px;
        color: #909399;
      }

      .unit {
        font-weight: 400;
        color: #bfbfbf;
        font-size: 11px;
        margin-left: 2px;
      }
    }

    .td-value {
      color: #303133;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      position: relative;

      .val-text {
        display: inline-block;
      }

      .winner-badge {
        display: inline-block;
        margin-left: 4px;
        padding: 0 5px;
        font-size: 10px;
        font-weight: 600;
        line-height: 16px;
        color: #fff;
        background: linear-gradient(135deg, #f5222d, #fa8c16);
        border-radius: 3px;
        vertical-align: middle;
        animation: winnerPopIn 0.3s ease-out;
      }

      &.is-winner {
        background: rgba(245, 34, 45, 0.04);
      }
    }

    @keyframes winnerPopIn {
      0% {
        transform: scale(0.5);
        opacity: 0;
      }
      70% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:hover td {
      background: #f5f7fa;
    }
  }
}

/* 页面级加载动画 */
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  border-top-color: #818cf8;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
  letter-spacing: 0.3px;
}

/* ========== 关键指标概览卡片 ========== */
.summary-cards {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.summary-card {
  flex: 1;
  min-width: 0;

  &:last-child {
    flex: 1.5;
  }
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 7px 10px;
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border-color: #e8e8e8;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    letter-spacing: 0.3px;

    .card-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  }

  .card-body {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .metric-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    min-width: 0;

    .metric-label {
      font-size: 12px;
      color: #8c8c8c;
      white-space: nowrap;
      line-height: 1.6;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: #262626;
      font-variant-numeric: tabular-nums;
      line-height: 1.4;
    }

    .metric-unit {
      font-weight: 400;
      color: #bfbfbf;
      font-size: 11px;
    }
  }

  // 各卡片主题色 — 左侧色条
  $card-colors: (
    "day-ahead": #1890ff,
    "real-time": #52c41a,
    "deviation": #faad14,
    "comprehensive": #722ed1,
  );

  @each $name, $color in $card-colors {
    &.card-#{$name} {
      border-left: 3px solid $color;
      background: rgba($color, 0.06);
      .card-header {
        color: $color;
        .card-icon {
          color: inherit;
        }
      }
    }
  }
}
</style>
