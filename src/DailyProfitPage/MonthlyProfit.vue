<template>
  <div class="monthly-profit-page">
    <!-- ========== 页面头部 ========== -->
    <div class="page-header">
      <div class="page-header-accent"></div>
      <div class="page-header-content">
        <div class="page-header-top">
          <el-icon class="page-header-icon"><Coin /></el-icon>
          <h1>月度收益</h1>
          <el-tag class="page-header-tag" size="small" type="primary"
            >月度汇总</el-tag
          >
        </div>
        <p class="page-header-subtitle">
          查看每月的电费收益构成明细，涵盖中长期市场、日前市场、实时市场的电费收支与偏差转移收益
        </p>
        <div class="page-header-meta">
          <span class="meta-item">
            <el-icon><DataLine /></el-icon>
            每日收益逐日展示
          </span>
          <span class="meta-divider"></span>
          <span class="meta-item">
            <el-icon><Coin /></el-icon>
            自动月度汇总交易收益与售电收入
          </span>
          <span class="meta-divider"></span>
          <span class="meta-item">
            <el-icon><List /></el-icon>
            多市场月度收益汇总一目了然
          </span>
        </div>
      </div>
    </div>

    <!-- ========== 年份/月份选择器 ========== -->
    <div class="month-selector-section">
      <div class="selector-inner">
        <div class="year-picker">
          <label class="selector-label">📅 选择年份</label>
          <el-select v-model="currentYear" class="year-select" size="small">
            <el-option
              v-for="year in availableYears"
              :key="year"
              :label="year"
              :value="year"
            />
          </el-select>
        </div>
        <div class="months-row">
          <button
            v-for="m in nowMonth"
            :key="m"
            class="month-btn"
            :class="{
              active: selectedMonth === m,
              disabled: m > nowMonth && currentYear === nowYear,
            }"
            :disabled="m > nowMonth && currentYear === nowYear"
            @click="selectMonth(m)"
          >
            {{ m }}月
          </button>
        </div>
      </div>
      <span class="days-info">{{ infoText }}</span>
    </div>

    <!-- ========== 数据展示区 ========== -->
    <template v-if="!loading">
      <!-- 概要统计卡片 -->
      <div v-if="monthlySummary" class="summary-cards">
        <!-- 月度售电收入 -->
        <div class="card card-revenue">
          <div class="card-label">月度售电收入</div>
          <div class="card-value">
            {{ formatMoney(monthlySummary.revenue) }}<unit>元</unit>
          </div>
        </div>
        <!-- 峰谷综合收益 -->
        <div class="card card-deviation-actual">
          <div class="card-label">峰谷综合收益</div>
          <div
            class="card-value"
            :class="{
              negative: monthlySummary.peakValleyComprehensiveProfit < 0,
            }"
          >
            {{ formatMoney(monthlySummary.peakValleyComprehensiveProfit)
            }}<unit>元</unit>
          </div>
        </div>

        <!-- 月度交易收益 -->
        <div class="card card-trading">
          <div class="card-label">月度交易收益</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.tradingProfit < 0 }"
          >
            {{ formatMoney(monthlySummary.tradingProfit) }}<unit>元</unit>
          </div>
        </div>
        <!-- 月度实际偏差收益 -->
        <div class="card card-deviation-actual">
          <div class="card-label">月度实际偏差收益</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.actualDeviationProfit < 0 }"
          >
            {{ formatMoney(monthlySummary.actualDeviationProfit)
            }}<unit>元</unit>
          </div>
        </div>

        <!-- 现货成本单价 -->
        <div class="card card-spot-cost">
          <div class="card-label">现货成本单价</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.spotCostUnitPrice < 0 }"
          >
            {{
              monthlySummary.spotCostUnitPrice != null
                ? formatMoney(monthlySummary.spotCostUnitPrice)
                : "-"
            }}<unit>元/Mwh</unit>
          </div>
        </div>

        <!-- 日前结算均价-->
        <div class="card card-spot-cost">
          <div class="card-label">日前结算均价</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.dayAheadSettlementPrice < 0 }"
          >
            {{ formatMoney(monthlySummary.dayAheadSettlementPrice)
            }}<unit>元/Mwh</unit>
          </div>
        </div>

        <!-- 实际用电量 -->
        <div class="card card-revenue">
          <div class="card-label">实际用电量</div>
          <div class="card-value">
            {{ formatMoney(monthlySummary.actualPower) }}<unit>MWh</unit>
          </div>
        </div>

        <!-- 峰谷电费 -->
        <div class="card card-deviation-actual">
          <div class="card-label">峰谷电费</div>
          <div
            class="card-value"
            :class="{
              negative: monthlySummary.peakValleyFee < 0,
            }"
          >
            {{ formatMoney(monthlySummary.peakValleyFee) }}<unit>元</unit>
          </div>
        </div>
        <!-- 日前产生电费 -->
        <div class="card card-spot-cost">
          <div class="card-label">日前电费合计</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.dayAheadFee < 0 }"
          >
            {{ formatMoney(monthlySummary.dayAheadFee) }}<unit>元</unit>
          </div>
        </div>
        <!-- 实时产生电费 -->
        <div class="card card-spot-cost">
          <div class="card-label">实时电费合计</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.realTimeFee < 0 }"
          >
            {{ formatMoney(monthlySummary.realTimeFee) }}<unit>元</unit>
          </div>
        </div>
        <!-- 转移偏差收益 -->
        <div class="card card-deviation-actual">
          <div class="card-label">转移偏差收益</div>
          <div
            class="card-value"
            :class="{ negative: monthlySummary.transferredDeviationProfit < 0 }"
          >
            {{ formatMoney(monthlySummary.transferredDeviationProfit)
            }}<unit>元</unit>
          </div>
        </div>

        <!-- 中长期合计电量 -->
        <div class="card card-revenue">
          <div class="card-label">中长期合计电量</div>
          <div class="card-value">
            {{ formatMoney(monthlySummary.midLongTotalPower) }}<unit>MWh</unit>
          </div>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="price-table-wrapper" v-if="dailySummaries.length > 0">
        <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          :summary-method="summaryMethod"
          show-summary
          size="small"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          default-align="right"
        >
          <!-- 日期（固定左） -->
          <el-table-column
            label="日期"
            prop="date"
            width="100"
            fixed="left"
            align="center"
            header-align="center"
          />

          <!-- 中长期市场 -->
          <el-table-column
            label="中长期市场"
            align="center"
            header-align="center"
            min-width="180"
          >
            <!-- 年度合约 -->
            <el-table-column
              label="年度合约电量"
              prop="yearlyContractPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >年度合约电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="年度合约价格"
              prop="yearlyContractPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >年度合约价格<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="长协结算电费"
              prop="yearlySettlementFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >长协结算电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <!-- 月度合约 -->
            <el-table-column
              label="月度合约电量"
              prop="monthlyContractPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >月度合约电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="月度合约价格"
              prop="monthlyContractPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >月度合约价格<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="月度结算电费"
              prop="monthlySettlementFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >月度结算电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <!-- 周合约 -->
            <el-table-column
              label="周合约电量"
              prop="weeklyContractPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >周合约电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="周合约价格"
              prop="weeklyContractPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >周合约价格<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="周结算电费"
              prop="weeklySettlementFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >周结算电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <!-- 多日合约 -->
            <el-table-column
              label="多日合约电量"
              prop="multiDayContractPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >多日合约电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="多日合约价格"
              prop="multiDayContractPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >多日合约价格<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="多日结算电费"
              prop="multiDaySettlementFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >多日结算电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <!-- 中长期合计 -->
            <el-table-column
              label="中长期合计电量"
              prop="midLongTotalPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >中长期合计电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="中长期平均价格"
              prop="midLongAvgPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >中长期均价<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="中长期合计电费"
              prop="midLongTotalFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >中长期合计电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
          </el-table-column>

          <!-- 日前市场 -->
          <el-table-column
            label="日前市场"
            align="center"
            header-align="center"
            min-width="120"
          >
            <el-table-column
              label="日前申报电量"
              prop="dayAheadDeclaredPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >日前申报电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="日前结算电价"
              prop="dayAheadSettlementPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >日前结算电价<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="日前产生电费"
              prop="dayAheadFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >日前产生电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
          </el-table-column>

          <!-- 实时市场 -->
          <el-table-column
            label="实时市场"
            align="center"
            header-align="center"
            min-width="120"
          >
            <el-table-column
              label="实际用电量"
              prop="actualPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >实际用电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="实时结算电价"
              prop="realTimeSettlementPrice"
              width="110"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >实时结算电价<br /><small>(元/MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="实时产生电费"
              prop="realTimeFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >实时产生电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
          </el-table-column>

          <!-- 峰谷平衡 -->
          <el-table-column
            label="峰谷平衡"
            align="center"
            header-align="center"
            min-width="180"
          >
            <el-table-column
              label="峰谷电量"
              prop="peakValleyPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >峰谷电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="峰谷电费"
              prop="peakValleyFee"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >峰谷电费<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
          </el-table-column>

          <!-- 偏差及转移收益 -->
          <el-table-column
            label="偏差及转移收益"
            align="center"
            header-align="center"
            min-width="180"
          >
            <el-table-column
              label="偏差电量"
              prop="deviationPower"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >偏差电量<br /><small>(MWh)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="偏差率"
              prop="deviationRate"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit">偏差率</span></template
              >
              <template #default="{ row }">
                {{ formatPercent(row.deviationRate) }}
              </template>
            </el-table-column>
            <el-table-column
              label="允许偏差收益"
              prop="allowedDeviationProfit"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >允许偏差收益<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="转移偏差收益"
              prop="transferredDeviationProfit"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >转移偏差收益<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="总偏差收益"
              prop="totalDeviationProfit"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >总偏差收益<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="扣除金额"
              prop="deductionAmount"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >扣除金额<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="实际偏差收益"
              prop="actualDeviationProfit"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >实际偏差收益<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
          </el-table-column>

          <!-- 汇总列（固定右） -->
          <el-table-column
            label="汇总"
            fixed="right"
            align="center"
            header-align="center"
            min-width="120"
          >
            <el-table-column
              label="绝对价格总成本"
              prop="absolutePriceTotalFee"
              width="115"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >绝对价格总成本<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="售电收入"
              prop="revenue"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >售电收入<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="交易收益"
              prop="tradingProfit"
              width="105"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >交易收益<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
            <el-table-column
              label="峰谷综合收益"
              prop="peakValleyComprehensiveProfit"
              width="115"
              align="right"
              header-align="center"
            >
              <template #header
                ><span class="header-unit"
                  >峰谷综合收益<br /><small>(元)</small></span
                ></template
              >
            </el-table-column>
          </el-table-column>

          <!-- 操作列（固定右） -->
          <el-table-column
            label="操作"
            width="120"
            fixed="right"
            align="center"
            header-align="center"
          >
            <template #default="{ row }">
              <button class="btn btn-small" @click="viewDailyDetail(row.date)">
                查看日详情
              </button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading && searched" class="empty-state">
        <el-empty description="暂无月度收益数据" />
      </div>
    </template>

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <el-loading :fullscreen="false" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { Coin, DataLine, List } from "@element-plus/icons-vue";
import { monthlySummaryApi } from "@/DailyDemandReportV2/api";

const router = useRouter();
const currentYear = ref(2026);
const selectedMonth = ref(dayjs().month() + 1);
const availableYears = [2026];
const nowYear = dayjs().format("YYYY");
const nowMonth = dayjs().month() + 1;

const currentMonth = computed(() => {
  if (!currentYear.value || !selectedMonth.value) return "";
  return `${currentYear.value}-${String(selectedMonth.value).padStart(2, "0")}`;
});

const dailySummaries = ref([]);
const monthlySummary = ref(null);
const totalDays = ref(0);
const confirmedCount = ref(0);
const loading = ref(false);
const searched = ref(false);

const infoText = computed(() => {
  const ym = currentMonth.value;
  if (!ym || !totalDays.value) return "";
  const [y, m] = ym.split("-");
  const label = `${y}年${m}月`;
  if (confirmedCount.value === totalDays.value) {
    return `${label}：当月共${totalDays.value}天，已全部确认`;
  }
  return `${label}：当月共${totalDays.value}天，已确认数据${confirmedCount.value}天（当月）`;
});

function selectMonth(m) {
  selectedMonth.value = m;
  sessionStorage.setItem("monthlyProfit_selectedMonth", currentMonth.value);
  fetchData();
}

const tableData = computed(() => {
  return dailySummaries.value.map((item) => ({
    date: item.date,
    ...item.dailySummary,
  }));
});

async function fetchData() {
  if (!currentMonth.value) {
    return;
  }
  loading.value = true;
  searched.value = true;
  dailySummaries.value = [];
  monthlySummary.value = null;
  try {
    const res = await monthlySummaryApi(currentMonth.value);
    if (res.data?.success && res.data.data) {
      dailySummaries.value = res.data.data.dailySummaries || [];
      monthlySummary.value = res.data.data.monthlySummary || null;
      totalDays.value = res.data.data.totalDays || 0;
      confirmedCount.value = dailySummaries.value.length;
    }
  } catch (error) {
    console.error("获取月度收益数据失败:", error);
  } finally {
    loading.value = false;
  }
}

function viewDailyDetail(date) {
  sessionStorage.setItem("monthlyProfit_selectedMonth", currentMonth.value);
  router.push(`/daily-profit?date=${date}&fromMonthly=1`);
}

function formatMoney(val) {
  if (val == null || isNaN(val)) return "-";
  return Number(val).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(val) {
  if (val == null || isNaN(val)) return "-";
  return (Number(val) * 100).toFixed(2) + "%";
}

/** 表头样式 */
function headerCellStyle({ columnIndex }) {
  return {
    background: "#f0f7ff",
    color: "#333",
    fontWeight: 600,
    fontSize: "12px",
    padding: "6px 0",
  };
}

/** 单元格样式 */
function cellStyle({ column }) {
  return {
    color: "#555",
    fontSize: "12px",
    padding: "6px 0",
  };
}

/** 汇总行计算（与 DailyProfitMainTable 一致） */
function summaryMethod({ columns }) {
  return columns.map((column, index) => {
    if (index === 0) {
      return "合计";
    }

    const prop = column.property;
    if (!prop) return "";

    // 所有汇总字段都从 monthlySummary 取
    if (prop in (monthlySummary.value || {})) {
      const val = monthlySummary.value[prop];
      if (prop === "deviationRate") {
        return formatPercent(val);
      }
      return formatMoney(val);
    }

    return "-";
  });
}

onMounted(() => {
  const savedMonth = sessionStorage.getItem("monthlyProfit_selectedMonth");
  if (savedMonth) {
    const [year, month] = savedMonth.split("-").map(Number);
    if (year && month && month >= 1 && month <= 12) {
      currentYear.value = year;
      selectedMonth.value = month;
    }
  }
  fetchData();
});
</script>

<style scoped lang="scss">
.monthly-profit-page {
  min-height: calc(100vh - 60px);
  background: #fff;
  padding: 0;

  .page-header {
    display: flex;
    align-items: stretch;
    gap: 16px;
    padding: 20px 24px 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;
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
      font-size: 20px;
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
  }
}

/* 月份选择器 */
.month-selector-section {
  background: #fff;
  border-radius: 12px;
  margin: 16px 24px;
  padding: 20px 24px;
  border: 1px solid #e8ecf1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .selector-inner {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  .year-picker {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .selector-label {
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: 0.3px;
  }

  :deep(.year-select) {
    width: 90px;

    .el-select__wrapper {
      border-radius: 8px;
      box-shadow: none;
      border: 1px solid #d9d9d9;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;

      &:hover {
        border-color: #1890ff;
      }

      &.is-focus {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
      }
    }

    .el-select__selected-item {
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .months-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .month-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 52px;
    padding: 7px 0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #e8ecf1;
    background: #fafbfc;
    color: #34495e;
    transition: all 0.25s ease;
    outline: none;
    line-height: 1.3;
    letter-spacing: 0.5px;

    &:hover:not(.disabled):not(.active) {
      border-color: #1890ff;
      color: #1890ff;
      background: #f0f7ff;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(24, 144, 255, 0.12);
    }

    &.active {
      background: #1890ff;
      color: #fff;
      border-color: #1890ff;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(24, 144, 255, 0.25);

      &:hover {
        background: #40a9ff;
        border-color: #40a9ff;
        transform: translateY(-1px);
        box-shadow: 0 3px 10px rgba(24, 144, 255, 0.35);
      }
    }

    &.disabled {
      background: #f8f9fa;
      color: #c0c4cc;
      border-color: #ebeef5;
      cursor: not-allowed;
      font-weight: 400;
    }
  }

  .days-info {
    font-size: 13px;
    color: #909399;
    white-space: nowrap;
    padding: 6px 12px;
    background: #f5f7fa;
    border-radius: 6px;
    font-weight: 500;
  }
}

/* 卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  row-gap: 8px;
  margin: 0 16px 12px;
}

.card {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #d6e8ff;
  margin-bottom: 0;
}

.card-revenue {
  background: linear-gradient(135deg, #e6f7ff, #f0f7ff);
}

.card-trading {
  background: linear-gradient(135deg, #f6ffed, #f0f7ff);
}

.card-spot-cost {
  background: linear-gradient(135deg, #fff7e6, #f0f7ff);
}

.card-deviation-actual {
  background: linear-gradient(135deg, #fff0f0, #f0f7ff);
}

.card-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a365d;
  line-height: 1.3;

  &.negative {
    color: #ff4d4f;
  }
}

unit {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  font-style: italic;
  margin-left: 6px;
}

/* 表格 */
.price-table-wrapper {
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;

  :deep(.el-table) {
    border: none;
  }

  :deep(.el-table th.el-table__cell) {
    user-select: none;
    background: #f0f7ff;
    color: #333;
    font-weight: 600;
    font-size: 12px;
  }

  :deep(.el-table thead.is-group th.el-table__cell) {
    border-bottom: 2px solid #d6e8ff;
  }

  :deep(.el-table__cell) {
    padding: 6px 0;
  }

  :deep(.el-table__cell > .cell) {
    padding: 0 2px;
    white-space: nowrap;
    line-height: 1.4;
    word-break: keep-all;
    text-align: right;
  }

  :deep(.el-table th.el-table__cell > .cell) {
    padding: 0 !important;
    text-align: center;
  }

  :deep(.el-table .el-table__body-wrapper tbody tr:hover > td) {
    background-color: #f0f7ff !important;
  }

  :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
    background-color: #fafafa;
  }

  :deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td) {
    background-color: #f0f7ff !important;
  }

  :deep(.el-table .el-table__footer-wrapper td) {
    background: #e6f7ff !important;
    font-weight: 700;
    color: #1a365d;
    border-top: 2px solid #d6e8ff;
  }

  :deep(.el-table .el-table__footer-wrapper tr:hover > td) {
    background: #e6f7ff !important;
  }

  :deep(.el-table .el-table__cell:first-child > .cell) {
    text-align: center;
  }

  .header-unit {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.3;

    small {
      font-weight: 400;
      font-size: 10px;
      color: #8c8c8c;
    }
  }
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-small {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &:hover {
    background: #40a9ff;
  }
}

/* 空状态 / Loading */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: #fff;
  margin: 0 24px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
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
</style>
