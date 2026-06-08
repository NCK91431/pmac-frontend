<template>
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
    default-align="right"
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
      <template #header>
        <div class="header-cell-content">时段</div>
      </template>
    </el-table-column>

    <!-- ==================== 中长期市场 ==================== -->
    <el-table-column
      label="中长期市场"
      align="center"
      header-align="center"
      min-width="180"
    >
      <el-table-column
        label="价差模式切换中长期部分"
        align="center"
        header-align="center"
      >
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
      </el-table-column>

      <el-table-column
        label="现货模式交易中长期部分"
        align="center"
        header-align="center"
      >
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
      </el-table-column>

      <!-- 中长期合计 -->
      <el-table-column label="中长期合计" align="center" header-align="center">
        <el-table-column
          label="中长期合计电量"
          prop="midLongTotalPower"
          width="115"
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
          width="120"
          align="right"
          header-align="center"
        >
          <template #header
            ><span class="header-unit"
              >中长期平均价格<br /><small>(元/MWh)</small></span
            ></template
          >
        </el-table-column>
        <el-table-column
          label="中长期合计电费"
          prop="midLongTotalFee"
          width="110"
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
    </el-table-column>

    <!-- ==================== 日前市场 ==================== -->
    <el-table-column
      label="日前市场"
      align="center"
      header-align="center"
      min-width="150"
    >
      <el-table-column
        label="日前申报电量"
        prop="dayAheadDeclaredPower"
        width="110"
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
        width="115"
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

    <!-- ==================== 实时市场 ==================== -->
    <el-table-column
      label="实时市场"
      align="center"
      header-align="center"
      min-width="150"
    >
      <el-table-column
        label="实际用电量"
        prop="actualPower"
        width="100"
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
        width="115"
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

    <!-- ==================== 偏差转移收益 ==================== -->
    <el-table-column
      label="偏差转移收益"
      align="center"
      header-align="center"
      min-width="180"
    >
      <el-table-column
        label="偏差电量"
        prop="deviationPower"
        width="100"
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
        width="85"
        align="right"
        header-align="center"
      >
        <template #header><span class="header-unit">偏差率</span></template>
        <template #default="{ row }">
          <span
            :class="{ 'deviation-high': Math.abs(row.deviationRate) > 0.2 }"
          >
            {{ formatPercent(row.deviationRate) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="允许偏差收益"
        prop="allowedDeviationProfit"
        width="105"
        align="right"
        header-align="center"
      >
        <template #default="{ row }">
          <span class="fee-positive">{{
            formatNumber(row.allowedDeviationProfit)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="转移偏差收益"
        prop="transferredDeviationProfit"
        width="105"
        align="right"
        header-align="center"
      >
        <template #default="{ row }">
          <span
            :class="{
              'fee-positive': row.transferredDeviationProfit >= 0,
              'fee-negative': row.transferredDeviationProfit < 0,
            }"
          >
            {{ formatNumber(row.transferredDeviationProfit) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="总偏差收益"
        prop="totalDeviationProfit"
        width="105"
        align="right"
        header-align="center"
      >
        <template #default="{ row }">
          <span
            :class="{
              'fee-positive': row.totalDeviationProfit >= 0,
              'fee-negative': row.totalDeviationProfit < 0,
            }"
          >
            {{ formatNumber(row.totalDeviationProfit) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="扣除金额"
        prop="deductionAmount"
        width="100"
        align="right"
        header-align="center"
      >
        <template #default="{ row }">
          <span class="fee-negative">{{
            formatNumber(row.deductionAmount)
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="实际偏差收益"
        prop="actualDeviationProfit"
        width="105"
        align="right"
        header-align="center"
      >
        <template #default="{ row }">
          <span
            :class="{
              'fee-positive': row.actualDeviationProfit >= 0,
              'fee-negative': row.actualDeviationProfit < 0,
            }"
          >
            {{ formatNumber(row.actualDeviationProfit) }}
          </span>
        </template>
      </el-table-column>
    </el-table-column>

    <!-- ==================== 汇总列（固定右侧） ==================== -->
    <el-table-column
      label="绝对价格模式总成本电费"
      prop="absolutePriceTotalFee"
      width="140"
      align="right"
      header-align="center"
      fixed="right"
    >
      <template #header
        ><span class="header-unit"
          >绝对价格模式总成本电费<br /><small>(元)</small></span
        ></template
      >
      <template #default="{ row }">
        <span class="fee-highlight">{{
          formatNumber(row.absolutePriceTotalFee)
        }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="售电收入"
      prop="revenue"
      width="100"
      align="right"
      header-align="center"
      fixed="right"
    >
      <template #header
        ><span class="header-unit"
          >售电收入<br /><small>(元)</small></span
        ></template
      >
      <template #default="{ row }">
        <span class="fee-positive">{{ formatNumber(row.revenue) }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="交易收益"
      prop="tradingProfit"
      width="100"
      align="right"
      header-align="center"
      fixed="right"
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
          {{ formatNumber(row.tradingProfit) }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { computed } from "vue";

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

/** 表头样式 */
function headerCellStyle({ columnIndex, rowIndex }) {
  const base = {
    backgroundColor: "#1a365d",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "11px",
    borderColor: "#2a4a7f",
    transition: "background-color 0.2s",
  };

  // 第一级表头（rowIndex 0）- 更深色
  if (rowIndex === 0) {
    return {
      ...base,
      backgroundColor: "#0f2440",
      fontSize: "12px",
    };
  }

  // 第二级表头（rowIndex 1）
  if (rowIndex === 1) {
    return {
      ...base,
      backgroundColor: "#1a365d",
    };
  }

  // 第三级表头（rowIndex 2）- 叶子节点
  return {
    ...base,
    backgroundColor: "#254a7a",
  };
}

/** 数据单元格样式 */
function cellStyle({ column, row }) {
  const style = {
    fontSize: "12px",
    fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    borderColor: "#e8e8e8",
  };

  // 时段列左对齐
  if (column.property === "period" || column.label === "时段") {
    return {
      ...style,
      textAlign: "center",
      fontFamily: "inherit",
      fontWeight: 600,
    };
  }

  // 交易收益列特殊样式
  if (column.property === "tradingProfit") {
    return { ...style, fontWeight: 700 };
  }

  return style;
}

/** 格式化数字 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return Number(value).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/** 格式化百分比 */
function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return (Number(value) * 100).toFixed(2) + "%";
}

/** 汇总行计算 */
function summaryMethod({ columns, data }) {
  const count = data.length || 1;

  return columns.map((column, index) => {
    if (index === 0) {
      return "合计";
    }

    const prop = column.property;
    if (!prop || !data.length) return "";

    // 求和类字段
    const summableFields = [
      "yearlyContractPower", // 年度合约电量
      "yearlySettlementFee", // 长协结算电费
      "monthlyContractPower", // 月度合约电量
      "monthlySettlementFee", // 月度结算电费
      "weeklyContractPower", // 周合约电量
      "weeklySettlementFee", // 周结算电费
      "multiDayContractPower", // 多日合约电量
      "multiDaySettlementFee", // 多日结算电费
      "midLongTotalPower", // 中长期合计电量
      "midLongTotalFee", // 中长期合计电费
      "dayAheadDeclaredPower", // 日前申报电量
      "dayAheadFee", // 日前产生电费
      "actualPower", // 实际用电量
      "realTimeFee", // 实时产生电费
      "deviationPower", // 偏差电量
      "allowedDeviationProfit", // 允许偏差收益
      "transferredDeviationProfit", // 转移偏差收益
      "totalDeviationProfit", // 总偏差收益
      "deductionAmount", // 扣除金额
      "actualDeviationProfit", // 实际偏差收益
      "absolutePriceTotalFee", // 绝对价格模式总成本电费
      "revenue", // 售电收入
      "tradingProfit", // 交易收益
      "spotPower", // 现货电量
      "spotFee", // 现货电费
    ];

    // 求均值类字段（价格/比率）
    const averageFields = [
      "yearlyContractPrice", // 年度合约平均价格
      "monthlyContractPrice", // 月度合约平均价格
      "weeklyContractPrice", // 周合约平均价格
      "multiDayContractPrice", // 多日合约平均价格
      "midLongAvgPrice", // 中长期平均价格均值
      "dayAheadSettlementPrice", // 日前结算电价均值
      "realTimeSettlementPrice", // 实时结算电价均值
      "deviationRate", // 偏差率均值
    ];

    if (summableFields.includes(prop)) {
      const sum = data.reduce((acc, row) => {
        const val = Number(row[prop]);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      return formatNumber(sum);
    }

    if (averageFields.includes(prop)) {
      const total = data.reduce((acc, row) => {
        const val = Number(row[prop]);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      const avg = total / count;
      if (prop === "deviationRate") {
        return formatPercent(avg);
      }
      return formatNumber(avg);
    }

    // 其他非汇总字段（如 ratio 类）显示 '-'
    return "-";
  });
}
</script>

<style scoped>
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  user-select: none;
}

:deep(.el-table__cell) {
  padding: 4px 3px;
}

:deep(.el-table__cell > .cell) {
  padding: 0 2px;
  white-space: nowrap;
  line-height: 1.4;
  word-break: keep-all;
  text-align: center;
}

:deep(.el-table th.el-table__cell > .cell) {
  padding: 0 !important;
}

:deep(.el-table .el-table__header-wrapper th) {
  transition: background-color 0.2s;
}

:deep(.el-table .el-table__body-wrapper tbody tr:hover > td) {
  background-color: #eef2ff !important;
  cursor: default;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f8faff;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td) {
  background-color: #eef2ff !important;
}

:deep(.el-table .el-table__footer-wrapper td) {
  background-color: #f0f4f8 !important;
  font-weight: 700;
  color: #1a365d;
  border-top: 2px solid #1a365d;
}

/* 固定列阴影 */
:deep(.el-table__fixed-right::before),
:deep(.el-table__fixed::before) {
  background-color: transparent;
}

/* 表头单元格内边距 */
.header-unit {
  line-height: 1.3;
  display: inline-block;
}

.header-unit small {
  font-weight: 400;
  opacity: 0.8;
  font-size: 10px;
}

/* 时段文本 */
.period-text {
  font-weight: 600;
  color: #1a365d;
  font-size: 12px;
}

/* 正负值颜色 */
.profit-positive {
  color: #16a34a;
}

.profit-negative {
  color: #dc2626;
}

.fee-positive {
  color: #16a34a;
}

.fee-negative {
  color: #dc2626;
}

.fee-highlight {
  color: #1a365d;
  font-weight: 600;
}

.trading-profit {
  font-weight: 700;
}

/* 偏差率过高警告 */
.deviation-high {
  color: #dc2626;
  font-weight: 600;
}

/* 表格滚动条美化 */
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
