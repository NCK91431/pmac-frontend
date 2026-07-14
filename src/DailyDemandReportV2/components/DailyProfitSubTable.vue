<template>
  <div class="daily-profit-sub-table">
    <el-table
      ref="tableRef"
      :data="hourlyResults"
      border
      stripe
      style="width: 100%"
      :summary-method="summaryMethod"
      show-summary
      :cell-style="cellStyle"
      :header-cell-style="headerCellStyle"
      size="small"
      row-key="period"
    >
      <!-- 时段（固定列） -->
      <el-table-column
        label="时段"
        width="70"
        fixed="left"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          <span class="period-text">{{ row.period }}</span>
        </template>
      </el-table-column>

      <!-- ==================== 仓位分析 ==================== -->
      <el-table-column
        label="仓位分析"
        align="center"
        header-align="center"
        min-width="200"
      >
        <el-table-column
          label="中长期合计电量"
          prop="midLongTotalPower"
          width="auto"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >中长期合计<br />电量 <small>(MWh)</small></span
            ></template
          >
          <template #default="{ row }">
            {{ formatNumber(row.midLongTotalPower, 2) }}
          </template>
        </el-table-column>
        <el-table-column
          label="现货电量"
          prop="spotPower"
          width="auto"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >现货电量<br /><small>(MWh)</small></span
            ></template
          >
          <template #default="{ row }">
            <span class="fee-highlight">{{
              formatNumber(row.spotPower, 2)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="实际用电量"
          prop="actualPower"
          width="auto"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >实际用电量<br /><small>(MWh)</small></span
            ></template
          >
          <template #default="{ row }">
            {{ formatNumber(row.actualPower, 2) }}
          </template>
        </el-table-column>
        <el-table-column
          label="用户评估用电量"
          prop="userEstimatedPower"
          width="auto"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >用户评估<br />电量 <small>(MWh)</small></span
            ></template
          >
        </el-table-column>
        <el-table-column
          label="日前申报电量"
          prop="dayAheadDeclaredPower"
          width="auto"
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
          label="中长期仓位比例"
          prop="midLongPositionRatio"
          width="auto"
          align="center"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">中长期<br />仓位比例</span></template
          >
          <template #default="{ row }">
            <span
              :class="{
                'position-high': row.midLongPositionRatio > 1,
                'position-low': row.midLongPositionRatio < 1,
              }"
            >
              {{ formatPercent(row.midLongPositionRatio) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="申报比例"
          prop="declarationRatio"
          width="auto"
          align="center"
          header-align="center"
        >
          <template #header><span class="header-unit">申报比例</span></template>
          <template #default="{ row }">
            <span class="ratio-value">{{
              formatNumber(row.declarationRatio)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="实际申报比例"
          prop="actualDeclarationRatio"
          width="auto"
          align="center"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">实际申报比例</span></template
          >
          <template #default="{ row }">
            <span
              :class="{
                'ratio-high': row.actualDeclarationRatio > 1,
                'ratio-low': row.actualDeclarationRatio < 1,
              }"
            >
              {{ formatPercent(row.actualDeclarationRatio) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="日前结算电价"
          prop="dayAheadSettlementPrice"
          width="auto"
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
          label="实时结算电价"
          prop="realTimeSettlementPrice"
          width="auto"
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
          label="出清价差价"
          prop="clearingPriceSpread"
          width="100"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >出清价差价<br /><small>(元/MWh)</small></span
            ></template
          >
          <template #default="{ row }">
            <span
              :class="{
                'spread-positive': row.clearingPriceSpread >= 0,
                'spread-negative': row.clearingPriceSpread < 0,
              }"
            >
              {{ formatNumber(row.clearingPriceSpread) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="现货电费"
          prop="spotFee"
          width="105"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >现货电费<br /><small>(元)</small></span
            ></template
          >
          <template #default="{ row }">
            <span class="fee-highlight">{{
              formatNumber(row.spotFee, 2)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="现货单价"
          prop="spotUnitPrice"
          width="100"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >现货单价<br /><small>(元/MWh)</small></span
            ></template
          >
          <template #default="{ row }">
            {{ formatNumber(row.spotUnitPrice, 2) }}
          </template>
        </el-table-column>
        <el-table-column
          label="日前低概率"
          prop="spreadProbability"
          width="55"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">日前低<br />概率</span></template
          >
          <template #default="{ row }">
            <span class="probability-badge">{{
              formatPercent(row.spreadProbability)
            }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- ==================== 交易收益 ==================== -->
      <el-table-column
        label="交易收益"
        prop="tradingProfit"
        width="120"
        align="right"
        header-align="center"
      >
        <template #header
          ><span class="header-unit"
            >交易收益<br /><small>(元)</small></span
          ></template
        >
        <template #default="{ row }">
          <span
            :class="{
              'profit-positive': row.tradingProfit >= 0,
              'profit-negative': row.tradingProfit < 0,
            }"
            class="trading-profit"
          >
            {{ formatNumber(row.tradingProfit, 2) }}
          </span>
        </template>
      </el-table-column>

      <!-- ==================== 电价方向分析（单层标题） ==================== -->
      <el-table-column
        label="电价方向分析"
        align="center"
        header-align="center"
        min-width="auto"
      >
        <el-table-column
          label="申报预估低电价方向"
          prop="declaredLowPriceDirection"
          width="auto"
          align="center"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">申报预估低价方向</span></template
          >
          <template #default="{ row }">
            <el-tag
              :type="
                row.declaredLowPriceDirection === '日前' ? 'warning' : 'info'
              "
              size="small"
              effect="plain"
            >
              {{ row.declaredLowPriceDirection }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="实际申报低电价方向"
          prop="actualDeclaredLowPriceDirection"
          width="auto"
          align="center"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">实际申报低价方向</span></template
          >
          <template #default="{ row }">
            <el-tag
              :type="
                row.actualDeclaredLowPriceDirection === '日前'
                  ? 'warning'
                  : 'info'
              "
              size="small"
              effect="plain"
            >
              {{ row.actualDeclaredLowPriceDirection }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="实际低电价方向"
          prop="actualLowPriceDirection"
          width="auto"
          align="center"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">实际低价方向</span></template
          >
          <template #default="{ row }">
            <el-tag
              :type="
                row.actualLowPriceDirection === '日前' ? 'warning' : 'info'
              "
              size="small"
              effect="plain"
            >
              {{ row.actualLowPriceDirection }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- ==================== 电价方向分析（双层标题） ==================== -->
        <!-- 申报价差捕获率 -->
        <el-table-column
          label="申报价差捕获率"
          prop="declaredSpreadCaptureRate"
          width="110"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">申报价差捕获率</span></template
          >
          <template #default="{ row }">
            <span
              :class="{
                'capture-high': row.declaredSpreadCaptureRate >= 0,
                'capture-low': row.declaredSpreadCaptureRate < 0,
              }"
            >
              {{ formatNumber(row.declaredSpreadCaptureRate, 2) }}
            </span>
          </template>
        </el-table-column>
        <!-- 实际价差捕获率 -->
        <el-table-column
          label="实际价差捕获率"
          prop="actualSpreadCaptureRate"
          width="110"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit">实际价差捕获率</span></template
          >
          <template #default="{ row }">
            <span
              :class="{
                'capture-high': row.actualSpreadCaptureRate >= 0,
                'capture-low': row.actualSpreadCaptureRate < 0,
              }"
            >
              {{ formatNumber(row.actualSpreadCaptureRate, 2) }}
            </span>
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
const props = defineProps({
  hourlyResults: {
    type: Array,
    default: () => [],
  },
  dailySummary: {
    type: Object,
    default: () => ({}),
  },
});

/** 表头样式 - 墨绿色主题 */
function headerCellStyle({ columnIndex, rowIndex }) {
  if (rowIndex === 0) {
    return {
      backgroundColor: "#0d3b2e",
      color: "#ffffff",
      fontWeight: 600,
      fontSize: "13px",
      padding: "6px 4px",
      borderColor: "#1a5a48",
    };
  }
  return {
    backgroundColor: "#1a7a5e",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "11px",
    padding: "5px 4px",
    borderColor: "#208a6c",
  };
}

/** 数据单元格样式 */
function cellStyle({ column, row }) {
  return {
    padding: "5px 6px",
    fontSize: "14px",
    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    borderColor: "#e8e8e8",
  };
}

/** 格式化数字 */
function formatNumber(value, fractionDigits) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  if (fractionDigits !== undefined) {
    return Number(value).toLocaleString("zh-CN", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/** 格式化百分比 */
function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return Math.round(Number(value) * 100) + "%";
}

/** 汇总行计算 */
function summaryMethod({ columns, data }) {
  return columns.map((column, index) => {
    if (index === 0) return "合计";

    const prop = column.property;
    if (!prop || !data.length) return "";

    // 不需要汇总的字段
    const nonSummable = [
      "midLongPositionRatio",
      "declarationRatio",
      "actualDeclarationRatio",
      "spreadProbability",
      "dayAheadSettlementPrice",
      "realTimeSettlementPrice",
      "clearingPriceSpread",
      "spotUnitPrice",
      "declaredLowPriceDirection",
      "actualDeclaredLowPriceDirection",
      "actualLowPriceDirection",
    ];

    if (nonSummable.includes(prop)) return "-";

    // 价差捕获率合计：正数之和 / 绝对值总和
    if (
      prop === "declaredSpreadCaptureRate" ||
      prop === "actualSpreadCaptureRate"
    ) {
      const values = data
        .map((row) => Number(row[prop]))
        .filter((v) => !isNaN(v));
      if (values.length === 0) return "-";
      const positiveSum = values
        .filter((v) => v > 0)
        .reduce((a, b) => a + b, 0);
      const absSum = values.reduce((a, b) => a + Math.abs(b), 0);
      if (absSum === 0) return "-";
      return Math.round((positiveSum / absSum) * 100) + "%";
    }

    // 电量类、电费类字段汇总
    const sum = data.reduce((acc, row) => {
      const val = Number(row[prop]);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    if (
      prop === "midLongTotalPower" ||
      prop === "spotPower" ||
      prop === "actualPower" ||
      prop === "spotFee" ||
      prop === "tradingProfit"
    )
      return formatNumber(sum, 2);
    return formatNumber(sum);
  });
}
</script>

<style scoped>
.daily-profit-sub-table {
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  background: #fff;
}

:deep(.el-table) {
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  user-select: none;
}

:deep(.el-table th.el-table__cell > .cell) {
  padding: 0 !important;
}

:deep(.el-table .el-table__body-wrapper tbody tr:hover > td) {
  background-color: #d1fae5 !important;
  cursor: default;
  border-top: 1px solid #6ee7b7 !important;
  border-bottom: 1px solid #6ee7b7 !important;
  border-right: 1px solid #6ee7b7 !important;
}

:deep(.el-table .el-table__body-wrapper tbody tr:hover > td:first-child) {
  border-left: 3px solid #059669 !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f6fdf9;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td) {
  background-color: #d1fae5 !important;
  border-top: 1px solid #6ee7b7 !important;
  border-bottom: 1px solid #6ee7b7 !important;
  border-right: 1px solid #6ee7b7 !important;
}

:deep(
  .el-table--striped
    .el-table__body
    tr.el-table__row--striped:hover
    td:first-child
) {
  border-left: 3px solid #059669 !important;
}

:deep(.el-table .el-table__footer-wrapper td) {
  background-color: #f0f8f4 !important;
  font-weight: 700;
  color: #0d3b2e;
  border-top: 2px solid #0d3b2e;
}

.header-unit {
  line-height: 1.3;
  display: inline-block;
}

.header-unit small {
  font-weight: 400;
  opacity: 0.8;
  font-size: 10px;
}

.period-text {
  font-weight: 600;
  color: #0d3b2e;
  font-size: 12px;
}

.position-high {
  color: #dc2626;
  font-weight: 600;
}

.position-low {
  color: #16a34a;
  font-weight: 600;
}

.ratio-high {
  color: #dc2626;
  font-weight: 600;
}

.ratio-low {
  color: #16a34a;
  font-weight: 600;
}

.ratio-value {
  font-weight: 500;
}

.probability-badge {
  color: #1a7a5e;
  font-weight: 600;
}

.capture-high {
  color: #16a34a;
  font-weight: 600;
}

.capture-low {
  color: #dc2626;
  font-weight: 600;
}

.spread-positive {
  color: #d97706;
  font-weight: 600;
}

.spread-negative {
  color: #16a34a;
  font-weight: 600;
}

.fee-highlight {
  color: #0d3b2e;
  font-weight: 600;
}

.profit-positive {
  color: #16a34a;
}

.profit-negative {
  color: #dc2626;
}

.trading-profit {
  font-weight: 700;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #c1c8d6;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #a0aab8;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f0f2f5;
  border-radius: 4px;
}
</style>
