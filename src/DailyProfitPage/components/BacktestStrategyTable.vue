<template>
  <div class="backtest-strategy-table">
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      size="small"
      row-key="period"
      :summary-method="summaryMethod"
      :show-summary="true"
    >
      <el-table-column fixed="left" prop="period" width="60" label="时段">
        <template #default="scope">
          {{ scope.row.period }}
        </template>
      </el-table-column>

      <!-- AI策略：仅显示4个AI字段 -->
      <template v-if="isAI">
        <el-table-column
          prop="hkd_user_estimated"
          min-width="100"
          label="AI预估用电量(MWh)"
        >
          <template #default="scope">
            {{ formatNum(scope.row.hkd_user_estimated) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="hkd_spread_direction"
          min-width="80"
          label="AI低价方向"
        >
          <template #default="scope">
            <span
              v-if="scope.row.hkd_spread_direction === true"
              class="spread-low"
              >日前</span
            >
            <span
              v-else-if="scope.row.hkd_spread_direction === false"
              class="spread-high"
              >实时</span
            >
            <span v-else class="no-data">—</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="hkd_declared_quantity"
          min-width="100"
          label="AI申报电量(MWh)"
        >
          <template #default="scope">
            <span style="font-weight: 600; color: #52c41a">
              {{ formatNum(scope.row.hkd_declared_quantity) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="hkd_declared_ratio"
          min-width="70"
          label="AI申报比例"
        >
          <template #default="scope">
            <span class="pct-value">{{
              formatDeclaredRatio(scope.row.hkd_declared_ratio)
            }}</span>
          </template>
        </el-table-column>
      </template>

      <!-- 非AI策略：原有字段 -->
      <template v-else>
        <el-table-column
          prop="contract_long_term"
          min-width="90"
          label="中长期合约电量(MWh)"
        >
          <template #default="scope">
            <span style="font-weight: 600; color: #1d39c4">
              {{ formatNum(scope.row.contract_long_term) }}
            </span>
          </template>
        </el-table-column>

        <!-- 评估电量（根据加载方法决定显示哪种） -->
        <el-table-column :prop="loadProp" min-width="110" :label="loadLabel">
          <template #default="scope">
            <span
              :style="{
                color: loadMethod === 'manual' ? '#d46b08' : '#52c41a',
              }"
            >
              {{ formatNum(scope.row[loadProp]) }}
            </span>
          </template>
        </el-table-column>

        <!-- 低价方向（根据电价方法决定显示哪种） -->
        <el-table-column
          :prop="spreadDirProp"
          min-width="80"
          :label="priceLabel + '低价方向'"
        >
          <template #default="scope">
            <span
              v-if="getSpreadDirection(scope.row) === true"
              class="spread-low"
              >日前</span
            >
            <span
              v-else-if="getSpreadDirection(scope.row) === false"
              class="spread-high"
              >实时</span
            >
            <span v-else class="no-data">—</span>
          </template>
        </el-table-column>

        <!-- 日前低概率 -->
        <el-table-column
          :prop="spreadProbProp"
          min-width="80"
          :label="priceLabel + '日前低概率'"
        >
          <template #default="scope">
            {{ formatPct(scope.row[spreadProbProp]) }}
          </template>
        </el-table-column>

        <el-table-column prop="plan_a" min-width="70" label="方案一">
          <template #default="scope">
            {{ formatNum(scope.row.plan_a) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="suggested_adjust_ratio"
          min-width="75"
          label="建议调整比例"
        >
          <template #default="scope">
            {{ scope.row.suggested_adjust_ratio }}
          </template>
        </el-table-column>

        <el-table-column prop="plan_b" min-width="70" label="方案二">
          <template #default="scope">
            {{ formatNum(scope.row.plan_b) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="declared_quantity"
          min-width="80"
          label="日前申报电量(MWh)"
        >
          <template #default="scope">
            <span style="font-weight: 600; color: #52c41a">
              {{ formatNum(scope.row.declared_quantity) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="declared_ratio" min-width="70" label="申报比例">
          <template #default="scope">
            <span class="pct-value">{{
              formatDeclaredRatio(scope.row.declared_ratio)
            }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script setup>
import { computed, h } from "vue";

const props = defineProps({
  periods: { type: Array, default: () => [] },
  loadMethod: { type: String, default: "api" },
  priceMethod: { type: String, default: "api" },
  scenarioName: { type: String, default: "" },
});

const isAI = computed(() => props.scenarioName === "AI策略");

const tableData = computed(() => props.periods || []);

const loadProp = computed(() =>
  props.loadMethod === "manual" ? "manual_estimated" : "user_estimated",
);

const loadLabel = computed(() =>
  props.loadMethod === "manual" ? "人工评估电量(MWh)" : "算法评估电量(MWh)",
);

const priceLabel = computed(() =>
  props.priceMethod === "manual" ? "人工" : "算法",
);

const spreadDirProp = computed(() =>
  props.priceMethod === "manual" ? "spread_direction" : "api_spread_direction",
);

const spreadProbProp = computed(() =>
  props.priceMethod === "manual"
    ? "spread_probability"
    : "api_spread_probability",
);

function getSpreadDirection(row) {
  if (props.priceMethod === "manual") {
    return row.spread_direction;
  }
  return row.api_spread_direction;
}

function formatNum(val) {
  if (val === null || val === undefined || val === 0) return "0.00";
  return Number(val).toFixed(2);
}

function formatPct(val) {
  if (val === null || val === undefined) return "0%";
  return Math.round(val * 100) + "%";
}

function formatDeclaredRatio(val) {
  return formatPct(val);
}

function styledCell(text, color) {
  return h("span", { style: { color, fontWeight: "bold" } }, text);
}

function summaryMethod({ columns, data }) {
  const sums = [];
  columns.forEach((column, index) => {
    const prop = column.property;
    if (index === 0) {
      sums[index] = h(
        "span",
        { style: { color: "#999", fontWeight: "bold", fontStyle: "italic" } },
        "合计",
      );
      return;
    }
    if (
      [
        "contract_long_term",
        "user_estimated",
        "manual_estimated",
        "plan_a",
        "plan_b",
        "declared_quantity",
        "hkd_user_estimated",
        "hkd_declared_quantity",
      ].includes(prop)
    ) {
      let total = 0;
      data.forEach((row) => {
        const val = parseFloat(row[prop]);
        if (!isNaN(val)) total += val;
      });
      const color =
        prop === "declared_quantity" ||
        prop === "user_estimated" ||
        prop === "hkd_declared_quantity" ||
        prop === "hkd_user_estimated"
          ? "#52c41a"
          : "#000";
      sums[index] = styledCell(formatNum(total), color);
      return;
    }
    sums[index] = "";
  });
  return sums;
}
</script>

<style scoped lang="scss">
.backtest-strategy-table {
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;

  :deep(.el-table) {
    font-size: 14px;
    border: none;

    .el-table__cell {
      padding: 4px 3px;
    }

    .el-table__cell > .cell {
      padding: 0 2px;
      white-space: nowrap;
      line-height: 1.4;
      word-break: keep-all;
      text-align: center;
    }

    th.el-table__cell {
      background: #f5f7fa;
      color: #303133;
      font-weight: 600;
      font-size: 12px;
    }

    td.el-table__cell {
      color: #606266;
    }
  }

  :deep(.el-table::before) {
    display: none;
  }

  :deep(.el-table__footer-wrapper td) {
    background: #f0f5ff !important;
  }
}

.spread-high {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #d46b08;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.spread-low {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #389e0d;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.pct-value {
  font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
  font-size: 14px;
  color: #666;
}

.no-data {
  color: #d9d9d9;
}
</style>
