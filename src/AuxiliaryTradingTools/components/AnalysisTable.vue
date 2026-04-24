<template>
  <div class="analysis-table-container">
    <el-table
      :data="tableData"
      border
      stripe
      highlight-current-row
      style="width: 100%"
      :header-cell-style="headerCellStyle"
      :cell-style="cellStyle"
      :show-summary="true"
      :summary-method="getSummaries"
      size="small"
    >
      <el-table-column
        prop="time"
        label="时间"
        width="60"
        align="center"
        fixed="left"
      >
        <template #default="{ row }">
          <span class="time-cell">{{ row.time }}</span>
        </template>
      </el-table-column>

      <el-table-column label="日前申报" align="center">
        <el-table-column
          prop="declaration_mwh"
          label="申报电量"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.declaration_mwh) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="spread" label="价差" width="70" align="center">
          <template #default="{ row }">
            <el-tag
              :type="spreadTagType(row.spread)"
              size="small"
              effect="dark"
              disable-transitions
            >
              {{ spreadLabel(row.spread) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="年度合约" align="center">
        <el-table-column
          prop="yearly_hourly"
          label="电量"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.yearly_hourly) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="yearly_price"
          label="价格"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.yearly_price) }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="月度合约" align="center">
        <el-table-column
          prop="monthly_hourly"
          label="电量"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.monthly_hourly) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="monthly_price"
          label="价格"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.monthly_price) }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="多日合约" align="center">
        <el-table-column
          prop="duori_hourly"
          label="电量"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.duori_hourly) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="duori_price"
          label="价格"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.duori_price) }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="周合约" align="center">
        <el-table-column
          prop="week_hourly"
          label="电量"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.week_hourly) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="week_price"
          label="价格"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.week_price) }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="备用合约" align="center">
        <el-table-column
          prop="jiaoyi3_hourly"
          label="电量"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.jiaoyi3_hourly) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="jiaoyi3_price"
          label="价格"
          width="70"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.jiaoyi3_price) }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="实际 / 出清" align="center">
        <el-table-column
          prop="actual_hourly"
          label="实际用电"
          width="75"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{ formatNum(row.actual_hourly) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="dayahead_set_price"
          label="日前出清"
          width="75"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{
              formatNum(row.dayahead_set_price)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="realtime_set_price"
          label="实时出清"
          width="75"
          align="center"
        >
          <template #default="{ row }">
            <span class="value-cell">{{
              formatNum(row.realtime_set_price)
            }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column
        prop="profit"
        label="收益(元)"
        width="100"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <span :class="profitClass(row.profit)">{{
            formatProfit(row.profit)
          }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
});

const formatNum = (val) => {
  if (val === null || val === undefined) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return n.toFixed(2);
};

const formatProfit = (val) => {
  if (val === null || val === undefined) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
};

const profitClass = (val) => {
  const n = parseFloat(val);
  if (isNaN(n)) return "profit-neutral";
  if (n > 0) return "profit-positive";
  if (n < 0) return "profit-negative";
  return "profit-neutral";
};

const spreadTagType = (val) => {
  if (val === null || val === undefined) return "info";
  if (val === -1) return "danger";
  if (val === 1) return "success";
  return "warning";
};

const spreadLabel = (val) => {
  if (val === null || val === undefined) return "未知";
  if (val === -1) return "实时高";
  if (val === 1) return "日前高";
  return "持平";
};

const headerCellStyle = () => ({
  backgroundColor: "#f5f7fa",
  color: "#303133",
  fontWeight: "600",
  fontSize: "12px",
  borderColor: "#ebeef5",
  textAlign: "center",
  padding: "6px 0",
});

const cellStyle = ({ rowIndex }) => {
  const style = {
    borderColor: "#ebeef5",
    padding: "4px 2px",
    fontSize: "12px",
  };
  if (rowIndex % 2 === 0) {
    style.backgroundColor = "#ffffff";
  } else {
    style.backgroundColor = "#fafafa";
  }
  return style;
};

const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = "合计";
      return;
    }
    const prop = column.property;
    if (!prop || prop === "time" || prop === "spread") {
      sums[index] = "";
      return;
    }
    const vals = data.map((row) => parseFloat(row[prop]) || 0);
    const sum = vals.reduce((a, b) => a + b, 0);
    sums[index] = sum.toFixed(2);
  });
  return sums;
};
</script>

<style lang="scss" scoped>
.analysis-table-container {
  width: 100%;
  background: white;
  overflow-x: auto;

  :deep(.el-table) {
    .el-table__header-wrapper {
      .el-table__header {
        th.el-table__cell {
          background-color: #f5f7fa;
          .cell {
            font-size: 12px;
            font-weight: 600;
            color: #303133;
            padding: 0 2px;
          }
        }
        th.el-table__cell.is-leaf {
          border-bottom: 1px solid #ebeef5;
        }
      }
    }
    .el-table__body-wrapper {
      .el-table__body {
        td.el-table__cell {
          padding: 4px 0;
          .cell {
            padding: 0 2px;
          }
        }
      }
    }
    .el-table__footer-wrapper {
      background-color: #f8fafc;
      border-top: 2px solid #3b82f6;
      .el-table__footer {
        .cell {
          font-weight: 700;
          color: #1e293b;
          font-size: 12px;
        }
      }
    }
  }

  .time-cell {
    font-weight: 600;
    color: #1e3c72;
    font-size: 12px;
  }

  .value-cell {
    color: #475569;
    font-size: 12px;
  }

  .profit-positive {
    color: #10b981;
    font-weight: 700;
    font-size: 13px;
  }

  .profit-negative {
    color: #ef4444;
    font-weight: 700;
    font-size: 13px;
  }

  .profit-neutral {
    color: #94a3b8;
    font-size: 12px;
  }
}
</style>
