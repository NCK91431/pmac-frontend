<template>
  <div class="card-body" style="padding: 8px 0 20px">
    <div class="strategy-table-wrapper">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :cell-style="cellStyle"
        header-row-class-name="strategy-header"
        size="small"
        row-key="period"
        :show-summary="!isManualInputMode"
        :summary-method="summaryMethod"
      >
        <el-table-column fixed="left" prop="period" width="60">
          <template #header>
            <div style="line-height: 1.3">时间</div>
          </template>
          <template #default="scope">
            {{ scope.row.period }}
          </template>
        </el-table-column>
        <el-table-column min-width="350">
          <template #header>
            <div
              class="hydl-title"
              @click="showContractDetails = !showContractDetails"
            >
              <span>合约电量</span>

              <el-text size="small" type="primary">
                <el-icon :size="14">
                  <View v-if="!showContractDetails" />
                  <Hide v-else />
                </el-icon>
                {{ showContractDetails ? "隐藏" : "查看" }}
              </el-text>
            </div>
          </template>
          <el-table-column
            v-if="showContractDetails"
            prop="contract_multi_day"
            min-width="70"
          >
            <template #header>多日<br />合约电量</template>
            <template #default="scope">
              {{ formatNum(scope.row.contract_multi_day) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="showContractDetails"
            prop="contract_weekly"
            min-width="70"
          >
            <template #header>周<br />合约电量</template>
            <template #default="scope">
              {{ formatNum(scope.row.contract_weekly) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="showContractDetails"
            prop="contract_monthly"
            min-width="70"
          >
            <template #header>月度<br />合约电量</template>
            <template #default="scope">
              {{ formatNum(scope.row.contract_monthly) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="showContractDetails"
            prop="contract_yearly"
            min-width="70"
          >
            <template #header>年度<br />合约电量</template>
            <template #default="scope">
              {{ formatNum(scope.row.contract_yearly) }}
            </template>
          </el-table-column>
          <el-table-column prop="contract_long_term" min-width="70">
            <template #header>中长期<br />合约电量</template>
            <template #default="scope">
              <span style="font-weight: 600; color: #1d39c4">{{
                formatNum(scope.row.contract_long_term)
              }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <!-- （算法）用户评估电量 -->
        <el-table-column prop="user_estimated" min-width="120">
          <template #header>
            <div
              class="evaluation-column-header"
              :class="{ active: userEstimatedMode === 'api' }"
              @click="handleAlgorithmHeaderClick"
            >
              <div>
                <el-icon v-if="userEstimatedMode === 'api'"
                  ><CircleCheckFilled
                /></el-icon>
                算法评估电量<br />(MWh)
              </div>
              <div
                class="copy-header-btn"
                @click.stop="copyColumnValues('user_estimated')"
              >
                <el-icon :size="12"><CopyDocument /></el-icon><span>复制</span>
              </div>
            </div>
          </template>
          <template #default="scope">
            {{ formatNum(scope.row.user_estimated) }}
          </template>
        </el-table-column>
        <!-- 人工评估电量（始终显示） -->
        <el-table-column prop="manual_estimated" min-width="130">
          <template #header>
            <div class="manual-estimated-header">
              <div
                class="evaluation-column-header"
                :class="{
                  active: userEstimatedMode === 'manual',
                  clickable: props.userEstimatedConfirmed,
                  'not-clickable': !props.userEstimatedConfirmed,
                }"
                @click="handleManualHeaderClick"
              >
                <div>
                  <el-icon v-if="userEstimatedMode === 'manual'"
                    ><CircleCheckFilled
                  /></el-icon>
                  人工评估电量<br />(MWh)
                </div>
              </div>
              <!-- 已确认：复制 + 修改（仅 api 模式） -->
              <template v-if="props.userEstimatedConfirmed">
                <div class="header-actions">
                  <div
                    class="copy-header-btn"
                    @click.stop="copyColumnValues('manual_user_estimated')"
                  >
                    <el-icon :size="12"><CopyDocument /></el-icon
                    ><span>复制</span>
                  </div>
                  <div
                    v-if="userEstimatedMode === 'api'"
                    class="copy-header-btn"
                    @click.stop="handleModifyManualEstimated"
                  >
                    <el-icon :size="12"><Edit /></el-icon><span>修改</span>
                  </div>
                </div>
              </template>
              <!-- 未确认（编辑态）：确认 + 一键清空 -->
              <template v-else>
                <div class="header-actions">
                  <div
                    class="copy-header-btn"
                    :class="{ 'is-disabled': !canConfirmManual }"
                    @click.stop="canConfirmManual && confirmManualEstimated()"
                  >
                    <el-icon :size="12"><CircleCheckFilled /></el-icon
                    ><span>确认此人工评估电量</span>
                  </div>
                  <div
                    class="copy-header-btn"
                    @click.stop="handleClearManualEstimated"
                  >
                    <el-icon :size="12"><Delete /></el-icon
                    ><span>一键清空</span>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template #default="scope">
            <template v-if="!props.userEstimatedConfirmed">
              <el-input
                :model-value="
                  props.loadForecast?.manual_load_data?.[scope.row.period]
                "
                @update:model-value="
                  (val) => handleManualInput(scope.row.period, val)
                "
                size="small"
                placeholder="输入或粘贴"
                @paste.prevent="
                  scope.$index === 0 ? handlePasteOnFirstCell($event) : null
                "
              />
            </template>
            <template v-else>
              {{
                formatNum(
                  props.loadForecast?.manual_load_data?.[scope.row.period],
                )
              }}
            </template>
          </template>
        </el-table-column>
        <!-- 人工电价预测（表头切换） -->
        <el-table-column v-if="!isManualInputMode" align="center">
          <template #header>
            <div
              class="evaluation-column-header"
              :class="{ active: priceForecastingMode === 'manual' }"
              @click="onPriceForecastingModeChange('manual')"
            >
              <div>
                <el-icon v-if="priceForecastingMode === 'manual'"
                  ><CircleCheckFilled
                /></el-icon>
                人工电价预测<br />(元/MWh)
              </div>
            </div>
          </template>

          <!-- 低价方向 -->
          <el-table-column prop="spread_direction" min-width="70">
            <template #header>低价方向</template>
            <template #default="scope">
              <span v-if="scope.row.spread_direction" class="spread-low"
                >日前</span
              >
              <span v-else class="spread-high">实时</span>
            </template>
          </el-table-column>
          <!-- 日低价概率 -->
          <el-table-column prop="spread_probability" min-width="70">
            <template #header>
              <div class="copy-header">
                <div>日前低概率</div>
                <div
                  class="copy-header-btn"
                  @click.stop="copyColumnValues('spread_probability')"
                >
                  <el-icon :size="12"><CopyDocument /></el-icon
                  ><span>复制</span>
                </div>
              </div>
            </template>
            <template #default="scope">
              {{ formatPct(scope.row.spread_probability) }}
            </template>
          </el-table-column>
        </el-table-column>
        <!-- 算法电价预测（表头切换） -->
        <el-table-column v-if="!isManualInputMode" align="center">
          <template #header>
            <div
              class="evaluation-column-header"
              :class="{ active: priceForecastingMode === 'api' }"
              @click="onPriceForecastingModeChange('api')"
            >
              <div>
                <el-icon v-if="priceForecastingMode === 'api'"
                  ><CircleCheckFilled
                /></el-icon>
                算法电价预测<br />(元/MWh)
              </div>
            </div>
          </template>

          <!-- 低价方向 -->
          <el-table-column prop="api_spread_direction" min-width="70">
            <template #header>低价方向</template>
            <template #default="scope">
              <span
                v-if="scope.row.api_spread_direction === true"
                class="spread-low"
                >日前</span
              >
              <span
                v-else-if="scope.row.api_spread_direction === false"
                class="spread-high"
                >实时</span
              >
              <span v-else class="no-data">—</span>
            </template>
          </el-table-column>
          <!-- 日低价概率 -->
          <el-table-column prop="api_spread_probability" min-width="70">
            <template #header>
              <div class="copy-header">
                <div>日前低概率</div>
                <div
                  class="copy-header-btn"
                  @click.stop="copyColumnValues('api_spread_probability')"
                >
                  <el-icon :size="12"><CopyDocument /></el-icon
                  ><span>复制</span>
                </div>
              </div>
            </template>
            <template #default="scope">
              {{ formatPct(scope.row.api_spread_probability) }}
            </template>
          </el-table-column>
        </el-table-column>

        <!-- 方案一 -->
        <el-table-column v-if="!isManualInputMode" prop="plan_a" min-width="65">
          <template #header>方案一</template>
          <template #default="scope">
            {{ formatNum(scope.row.plan_a) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isManualInputMode"
          prop="suggested_adjust_ratio"
          min-width="65"
        >
          <template #header>建议调整<br />比例</template>
          <template #default="scope">
            {{ scope.row.suggested_adjust_ratio }}
          </template>
        </el-table-column>
        <el-table-column v-if="!isManualInputMode" prop="plan_b" min-width="65">
          <template #header>方案二</template>
          <template #default="scope">
            {{ formatNum(scope.row.plan_b) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isManualInputMode"
          prop="declared_quantity"
          min-width="75"
        >
          <template #header>日前申报<br />电量</template>
          <template #default="scope">
            {{ formatNum(scope.row.declared_quantity) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isManualInputMode"
          prop="declared_ratio"
          min-width="65"
        >
          <template #header>申报<br />比例</template>
          <template #default="scope">
            <span class="pct-value">{{
              formatDeclaredRatio(scope.row.declared_ratio)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!isManualInputMode" fixed="right" width="130">
          <template #header>
            <div class="copy-header">
              <div>调整申报<br />比例</div>
              <div
                class="copy-header-btn"
                @click.stop="copyColumnValues('adjusted_ratio')"
              >
                <el-icon :size="12"><CopyDocument /></el-icon><span>复制</span>
              </div>
            </div>
          </template>
          <template #default="scope">
            <div class="adjust-ratio-cell">
              <template v-if="readonly || submitted">
                <div
                  class="adjusted-val"
                  :class="getRatioValueClass(scope.row.period)"
                >
                  {{ getDisplayRatio(scope.row.period) }}
                </div>
              </template>
              <template v-else-if="editingPeriod !== scope.row.period">
                <div
                  class="edit-btn"
                  @click.stop="enterEditMode(scope.row.period, scope.row)"
                >
                  <el-icon><Edit /></el-icon>
                </div>
                <div
                  class="adjusted-val"
                  :class="getRatioValueClass(scope.row.period)"
                >
                  {{ getDisplayRatio(scope.row.period) }}
                </div>
              </template>
              <template v-else>
                <el-input-number
                  v-model="editValue"
                  size="small"
                  :precision="2"
                  :min="0.01"
                  :max="2"
                  :step="0.01"
                ></el-input-number>
                <div
                  class="confirm-btn"
                  @click.stop="confirmEdit(scope.row.period, scope.row)"
                >
                  <el-icon><CircleCheck></CircleCheck></el-icon>
                </div>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="actual_load" fixed="right" min-width="90">
          <template #header>
            <div class="copy-header">
              <div>实际申报<br />电量(MWh)</div>
              <div
                class="copy-header-btn"
                @click.stop="copyColumnValues('actual_load')"
              >
                <el-icon :size="12"><CopyDocument /></el-icon><span>复制</span>
              </div>
            </div>
          </template>
          <template #default="scope">
            <span :class="getActualLoadClass(scope.row)">{{
              calculateActualLoad(scope.row)
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div
      v-if="props.summary"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 20px 0;
        flex-wrap: wrap;
        gap: 8px;
      "
    >
      <div style="display: flex; gap: 12px; font-size: 12px">
        <span
          style="
            background: #f5f7fa;
            padding: 4px 12px;
            border-radius: 4px;
            color: #8c8c8c;
          "
        >
          总时段数: {{ props.summary?.total_periods }}
        </span>
        <span
          style="
            background: #f6ffed;
            padding: 4px 12px;
            border-radius: 4px;
            color: #52c41a;
          "
        >
          已调整: {{ adjustedCount }}
        </span>
        <span
          style="
            background: #fff7e6;
            padding: 4px 12px;
            border-radius: 4px;
            color: #fa8c16;
          "
        >
          默认比例: {{ defaultCount }}
        </span>
      </div>
      <div
        style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap"
      >
        <!-- 导出申报结果 -->
        <span
          style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 6px 16px;
            background: #1890ff;
            color: #fff;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
          "
          @click="exportExcel"
        >
          📥 导出申报结果 (电力交易中心版)
        </span>
        <el-button
          v-if="!readonly && !submitted"
          size="small"
          plain
          @click="resetAllRatios"
        >
          🔄 恢复默认调整申报比例
        </el-button>
      </div>
    </div>

    <div style="padding: 12px 20px 0">
      <div
        class="annotation"
        style="
          background: #f0f5ff;
          border-color: #adc6ff;
          color: #1d39c4;
          margin-bottom: 6px;
        "
      >
        <span>🧮</span>
        <span>
          <strong>计算逻辑：</strong> 方案一 = max(中长期电量, 用户评估电量)
          &nbsp;|&nbsp; 建议调整比例 R 查表(日前低概率 P) &nbsp;|&nbsp; 方案二 =
          方案一 × (1+R) &nbsp;|&nbsp; 日前申报电量 = 限幅(方案二,
          B×0.80~B×1.20) &nbsp;|&nbsp; 申报比例 = 日前申报电量 ÷ 用户评估电量
        </span>
      </div>
      <div
        style="
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #8c8c8c;
          flex-wrap: wrap;
          margin-top: 6px;
        "
      >
        <span><strong>固定列：</strong> 时间（首列，左固定）</span>
        <span>
          <strong>配色说明：</strong>
          <span
            style="
              background: #f0f5ff;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 11px;
            "
            >🔵 蓝色背景</span
          >
          = 合约电量子表头 &nbsp;|&nbsp;
          <span
            style="
              background: #fff7e6;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 11px;
            "
            >🟠 黄色背景</span
          >
          = 可编辑列
        </span>
        <span>
          <strong>数据来源：</strong> 合约电量 ×4 &nbsp;|&nbsp;
          <template v-if="userEstimatedMode === 'api'"
            >用户评估电量来自第三方 API</template
          >
          <template v-else>人工评估电量由用户粘贴输入</template>
          &nbsp;|&nbsp; 低价方向/日前低概率从 Step 2 导入 &nbsp;|&nbsp;
          其余为公式自动计算
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from "vue";
import {
  Edit,
  Delete,
  CircleCheckFilled,
  CircleCheck,
  CopyDocument,
  View,
  Hide,
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import Decimal from "decimal.js";
import * as XLSX from "xlsx";

const props = defineProps({
  periods: { type: Array, default: () => [] },
  summary: { type: Object, default: null },
  declarationDate: { type: String, default: "" },
  adjustedRatios: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
  submitted: { type: Boolean, default: false },
  priceForecast: { type: Object, default: null },
  loadForecast: { type: Object, default: null },
  userEstimatedConfirmed: { type: Boolean, default: false },
});

const emit = defineEmits([
  "confirm-edit",
  "reset-all",
  "confirm-manual-estimated",
  "switch-load-forecast-mode",
  "switch-price-forecast-mode",
  "update-manual-estimated",
  "modify-manual-estimated",
]);

const editingPeriod = ref(null);
const editValue = ref(1);
const showContractDetails = ref(false); // 是否显示4列合约电量详情

// 从 props 派生的模式状态
const userEstimatedMode = computed(
  () => props.loadForecast?.load_forecasting_method,
);
const priceForecastingMode = computed(
  () => props.priceForecast?.price_forecasting_method,
);

// 手动待确认态时隐藏部分列
const isManualInputMode = computed(() => {
  return userEstimatedMode.value === "manual" && !props.userEstimatedConfirmed;
});

const tableData = computed(() => {
  return props.periods || [];
});

const adjustedCount = computed(() => {
  const periods = props.periods || [];
  return periods.filter((p) => isAdjusted(p.period)).length;
});

const defaultCount = computed(() => {
  const total = (props.periods || []).length;
  return total - adjustedCount.value;
});

const canConfirmManual = computed(() => {
  const values = props.loadForecast?.manual_load_data ?? {};
  const keys = Object.keys(values);
  if (keys.length !== 24) return false;
  return Object.values(values).every(
    (v) => v !== null && v !== "" && v !== undefined,
  );
});

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

function getAdjustedRatioValue(period) {
  const idx = parseInt(period);
  const adjusted = props.adjustedRatios[idx];
  if (adjusted !== null && adjusted !== undefined) return adjusted;
  const periodData = props.periods.find((p) => p.period === period);
  return periodData ? periodData.declared_ratio : 1;
}

function onPriceForecastingModeChange(mode) {
  if (mode === priceForecastingMode.value) return; // 已经是该模式，不重复触发
  emit("switch-price-forecast-mode", mode);
  const label = mode === "api" ? "算法电价预测" : "人工电价预测";
  ElMessage.success(`已成功切换到${label}模式`);
}

// 处理第一个输入框的粘贴事件 — 自动填充全部24行
function handlePasteOnFirstCell(event) {
  const pastedText = (event.clipboardData || window.clipboardData).getData(
    "text",
  );
  const values = pastedText
    .split(/[\n\r]+/)
    .map((v) => v.trim())
    .filter((v) => v !== "")
    .map((v) => {
      const num = parseFloat(v);
      return isNaN(num) ? null : num;
    })
    .filter((v) => v !== null);

  if (values.length === 0) return;

  const newValues = {};
  const periods = props.periods || [];
  for (let i = 0; i < Math.min(periods.length, values.length); i++) {
    newValues[periods[i].period] = values[i];
  }
  emit("update-manual-estimated", newValues);
  event.preventDefault();
}

// 确认人工评估电量（仅本地确认，不触发后端请求）
function confirmManualEstimated() {
  if (!canConfirmManual.value) return;
  emit("confirm-manual-estimated");
}

function getEstimatedValue(row) {
  if (userEstimatedMode.value === "manual" && props.userEstimatedConfirmed) {
    return props.loadForecast?.manual_load_data?.[row.period];
  }
  return row.user_estimated;
}

// 点击算法评估电量标题 — 切换到 API 模式并触发后端请求
function handleAlgorithmHeaderClick() {
  if (userEstimatedMode.value === "api") return;
  emit("switch-load-forecast-mode", "api");
  ElMessage.success("已成功切换到算法评估电量模式");
}

// 点击人工评估电量标题（仅已确认时可点击）— 切换到人工模式并触发后端请求
function handleManualHeaderClick() {
  if (!props.userEstimatedConfirmed) return;
  emit("switch-load-forecast-mode", "manual");
  ElMessage.success("已成功切换到人工评估电量模式");
}

// 一键清空人工评估电量（编辑态）
function handleClearManualEstimated() {
  emit("update-manual-estimated", {});
}

// 修改人工评估电量（确认态 → 编辑态）
function handleModifyManualEstimated() {
  emit("modify-manual-estimated");
}

function calculateActualLoad(row) {
  const estimatedMwh = getEstimatedValue(row);
  const declaredQty = row.declared_quantity;
  const adjustedRatio = getAdjustedRatioValue(row.period);
  const originalRatio = row.declared_ratio;

  if (adjustedRatio === originalRatio) {
    if (declaredQty == null || isNaN(Number(declaredQty))) return "—";
    return formatNum(declaredQty);
  }
  if (estimatedMwh == null || adjustedRatio == null || adjustedRatio === 0)
    return "—";
  const result = new Decimal(estimatedMwh).mul(adjustedRatio).toFixed(2);
  return result;
}

function isAdjusted(period) {
  const periodData = props.periods.find((p) => p.period === period);
  if (!periodData) return false;
  return getAdjustedRatioValue(period) !== periodData.declared_ratio;
}

function enterEditMode(period, row) {
  if (editingPeriod.value !== null && editingPeriod.value !== period) {
    confirmEdit(
      editingPeriod.value,
      props.periods.find((p) => p.period === editingPeriod.value),
    );
  }
  editingPeriod.value = period;
  const current = getDisplayRatio(period);
  editValue.value = typeof current === "number" ? current : 1;
}

function confirmEdit(period, row) {
  if (editingPeriod.value !== period) return;
  editingPeriod.value = null;
  const newVal = editValue.value;
  if (newVal === null || newVal === undefined) return;
  emit("confirm-edit", { period, ratio: newVal });
}

function getDisplayRatio(period) {
  return getAdjustedRatioValue(period);
}

function getRatioValueClass(period) {
  const periodData = props.periods.find((p) => p.period === period);
  if (!periodData) return "ratio-not-adjusted";
  const original = periodData.declared_ratio;
  const current = getDisplayRatio(period);
  if (!isAdjusted(period) || current === original) return "ratio-not-adjusted";
  if (current < 0.8) return "ratio-low";
  if (current <= 1.2) return "ratio-medium";
  return "ratio-high";
}

function resetAllRatios() {
  ElMessageBox.confirm("确定要恢复所有调整比例为默认值吗？", "恢复默认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      emit("reset-all");
      editingPeriod.value = null;
      ElMessage.success("已恢复所有默认比例");
    })
    .catch(() => {});
}

function getActualLoadClass(row) {
  if (!isAdjusted(row.period)) {
    return "actual-load-default";
  }
  const current = getAdjustedRatioValue(row.period);
  const original = row.declared_ratio;
  if (current > original) {
    return "actual-load-up";
  }
  return "actual-load-down";
}

function copyColumnValues(type) {
  const periods = props.periods || [];
  let values;
  let label;
  switch (type) {
    case "user_estimated":
      values = periods.map((p) => formatNum(p.user_estimated));
      label = "用户评估电量";
      break;
    case "manual_user_estimated":
      values = (props.periods || []).map((p) => formatNum(p.manual_estimated));
      label = "人工评估电量";
      break;
    case "spread_probability":
      values = periods.map((p) => formatPct(p.spread_probability));
      label = "日前低概率";
      break;
    case "api_spread_probability":
      values = periods.map((p) => formatPct(p.api_spread_probability));
      label = "算法日前低概率";
      break;
    case "adjusted_ratio":
      if (editingPeriod.value !== null) {
        ElMessage.warning(
          "复制失败，还有未确认的申报比例时段，需确认该时段的调整比例值完成才复制",
        );
        return;
      }
      values = periods.map((p) => {
        const ratio = getAdjustedRatioValue(p.period);
        if (ratio === null || ratio === undefined) return "0";
        return String(ratio);
      });
      label = "调整申报比例";
      break;
    case "actual_load":
      values = periods.map((p) => calculateActualLoad(p));
      label = "实际申报电量";
      break;
    default:
      values = [];
      label = "";
  }
  const text = values.join("\n");
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success("成功复制：" + label);
    })
    .catch(() => {
      ElMessage.error("复制失败，请手动复制");
    });
}

function exportExcel() {
  if (editingPeriod.value !== null) {
    ElMessage.warning(
      "您还有未确认的申报比例时段，需确认该时段的调整比例值，才可导出",
    );
    return;
  }
  const workbook = XLSX.utils.book_new();
  const periods = props.periods || [];
  const header = ["时刻", "电量(MWh)"];
  const rows = [header];
  for (let i = 0; i < 24; i++) {
    const row = periods[i];
    const timeLabel = String(i).padStart(2, "0") + ":00";
    const val = row ? calculateActualLoad(row) : "—";
    rows.push([timeLabel, val]);
  }
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, worksheet, "用电侧申报结果");
  const fileName = "用电侧申报结果_" + props.declarationDate + ".xlsx";
  XLSX.writeFile(workbook, fileName);
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
        "求和",
      );
      return;
    }
    // contract_multi_day / weekly / monthly / yearly
    if (
      [
        "contract_multi_day",
        "contract_weekly",
        "contract_monthly",
        "contract_yearly",
      ].includes(prop)
    ) {
      let total = 0;
      data.forEach((row) => {
        const val = parseFloat(row[prop]);
        if (!isNaN(val)) total += val;
      });
      sums[index] = styledCell(formatNum(total), "#000");
      return;
    }
    // user_estimated (always from third-party API)
    if (prop === "user_estimated") {
      let total = 0;
      data.forEach((row) => {
        const val = parseFloat(row[prop]);
        if (!isNaN(val)) total += val;
      });
      sums[index] = styledCell(formatNum(total), "#52c41a");
      return;
    }
    // manual_estimated (人工评估电量)
    if (prop === "manual_estimated") {
      let total = 0;
      const manualData = props.loadForecast?.manual_load_data ?? {};
      Object.values(manualData).forEach((val) => {
        const num = parseFloat(val);
        if (!isNaN(num)) total += num;
      });
      sums[index] = styledCell(formatNum(total), "#000");
      return;
    }
    // manual input column (no prop) — skip
    if (!prop) {
      sums[index] = "";
      return;
    }
    // spread_direction / plan_a / plan_b
    if (
      ["spread_direction", "api_spread_direction", "plan_a", "plan_b"].includes(
        prop,
      )
    ) {
      let total = 0;
      data.forEach((row) => {
        const val = parseFloat(row[prop]);
        if (!isNaN(val)) total += val;
      });
      sums[index] = styledCell(formatNum(total), "#000");
      return;
    }
    // declared_quantity (绿色)
    if (prop === "declared_quantity") {
      let total = 0;
      data.forEach((row) => {
        const val = parseFloat(row[prop]);
        if (!isNaN(val)) total += val;
      });
      sums[index] = styledCell(formatNum(total), "#52c41a");
      return;
    }
    // actual_load
    if (prop === "actual_load") {
      let total = 0;
      data.forEach((row) => {
        const val = parseFloat(calculateActualLoad(row));
        if (!isNaN(val)) total += val;
      });
      sums[index] = styledCell(formatNum(total), "#d46b08");
      return;
    }
    sums[index] = "";
  });
  return sums;
}

function cellStyle({ row, column, rowIndex, columnIndex }) {
  const style = {};
  // 根据当前评估电量模式高亮对应列
  if (
    userEstimatedMode.value === "api" &&
    column.property === "user_estimated"
  ) {
    style.background = "#fff7e6";
  } else if (
    userEstimatedMode.value === "manual" &&
    column.property === "manual_estimated"
  ) {
    style.background = "#fff7e6";
  } else if (
    priceForecastingMode.value === "manual" &&
    (column.property === "spread_direction" ||
      column.property === "spread_probability")
  ) {
    style.background = "#fff7e6";
  } else if (
    priceForecastingMode.value === "api" &&
    (column.property === "api_spread_direction" ||
      column.property === "api_spread_probability")
  ) {
    style.background = "#fff7e6";
  } else if (rowIndex % 2 === 1) {
    style.background = "#fafafa";
  }
  return style;
}

defineExpose({
  hasUnconfirmedEdit: computed(() => editingPeriod.value !== null),
});
</script>

<style scoped lang="scss">
.card-body {
  padding: 8px 0 20px;
}

.strategy-table-wrapper {
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 6px;

  :deep(.el-table) {
    font-size: 16px;
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
    }

    thead tr:first-child th {
      font-size: 12px;
      background: #f0f5ff;
    }

    thead tr:nth-child(2) th {
      font-size: 10px;
      font-weight: 500;
      background: #f5f7fa;
    }

    td.el-table__cell {
      color: #606266;
    }

    .el-table__body-wrapper tbody tr:hover td {
      background: #e6f7ff !important;
      border-top: 1px solid #1da3fd !important;
      border-bottom: 1px solid #1da3fd !important;
    }

    .el-table__body-wrapper tbody tr:nth-child(even) td.el-table__cell {
      background: #fafafa;
    }

    .el-table__body-wrapper tbody tr:nth-child(even):hover td.el-table__cell {
      background: #e6f7ff !important;
      border-top: 1px solid #1da3fd !important;
      border-bottom: 1px solid #1da3fd !important;
    }

    thead tr:first-child th:first-child {
      background: #f0f5ff !important;
    }

    thead tr:first-child th:nth-child(2) {
      background: #e6f0ff !important;
    }

    thead tr:nth-child(2) th:nth-child(14) {
      background: #f0f5ff !important;
    }

    .el-table__body-wrapper tbody tr td:first-child {
      font-weight: 600;
      color: #303133;
    }

    .el-table__cell.is-right {
      border-right: 1px solid #ebeef5;
    }

    thead tr:first-child th:nth-child(2) .cell {
      color: #1d39c4;
      font-weight: 700;
    }

    .el-table__cell.is-leaf:last-child {
      border-right: none;
    }
  }

  :deep(.el-table::before) {
    display: none;
  }

  :deep(.el-table__fixed-right) {
    box-shadow: none;
  }

  :deep(.el-table__fixed-right::before),
  :deep(.el-table__fixed::before) {
    display: none;
  }

  :deep(.el-table__fixed-right th.el-table__cell),
  :deep(.el-table__fixed th.el-table__cell) {
    background: #f5f7fa !important;
  }

  :deep(.el-table__fixed-right td.el-table__cell),
  :deep(.el-table__fixed td.el-table__cell) {
    background: #fff !important;
  }

  :deep(.el-table__fixed-right th.el-table__cell:first-child .cell) {
    text-align: left;
  }

  :deep(
    .el-table__body-wrapper
      tbody
      tr:hover
      .el-table__fixed-right
      td.el-table__cell
  ),
  :deep(
    .el-table__body-wrapper tbody tr:hover .el-table__fixed td.el-table__cell
  ) {
    background: #f5f7fa !important;
  }

  :deep(
    .el-table__body-wrapper
      tbody
      tr:nth-child(odd):hover
      .el-table__fixed-right
      td.el-table__cell
  ),
  :deep(
    .el-table__body-wrapper
      tbody
      tr:nth-child(odd):hover
      .el-table__fixed
      td.el-table__cell
  ) {
    background: #f5f7fa !important;
  }

  :deep(
    .el-table__body-wrapper
      tbody
      tr:nth-child(even):hover
      .el-table__fixed-right
      td.el-table__cell
  ),
  :deep(
    .el-table__body-wrapper
      tbody
      tr:nth-child(even):hover
      .el-table__fixed
      td.el-table__cell
  ) {
    background: #f0f5ff !important;
  }

  :deep(.el-table__fixed-right thead tr:nth-child(2) th:first-child) {
    background: #fff7e6 !important;
    color: #d48806;
  }

  :deep(.el-table__fixed-right thead tr:first-child th:first-child) {
    background: #f0f5ff !important;
  }

  :deep(.el-table__fixed-right thead tr:first-child th:nth-child(2)) {
    background: #f0f5ff !important;
  }

  :deep(.el-table--border .el-table__cell) {
    border-right: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-table--border) {
    border: none;
  }

  :deep(.el-table__footer-wrapper td),
  :deep(.el-table__fixed-footer-wrapper td),
  :deep(.el-table__fixed-right-footer-wrapper td) {
    background: #f0f5ff !important;
  }
}

.spread-high {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #d46b08;
  background: #fff7e6;
  border: 1px solid #ffd591;
}

.spread-low {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #389e0d;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.pct-value {
  font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
  font-size: 16px;
  color: #666;
}

.adjust-ratio-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  color: #3b82f6;
  font-size: 14px;
  flex-shrink: 0;

  &:hover {
    background: #eff6ff;
  }
}

.hydl-title {
  color: #303133;
  line-height: 1.3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.confirm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  color: #10b981;
  font-size: 14px;
  flex-shrink: 0;

  &:hover {
    background: #ecfdf5;
  }
}

.adjusted-val {
  font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
  font-size: 15px;
  font-weight: 600;
  padding: 0 2px;
}

.ratio-not-adjusted {
  color: #94a3b8;
  font-style: italic;
  font-weight: 400;
}

.ratio {
  &-low {
    color: #ef4444;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 1px 4px;
  }

  &-medium {
    color: #10b981;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 4px;
    padding: 1px 4px;
  }

  &-high {
    color: #ef4444;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 1px 4px;
  }
}

.annotation {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 12px;
  color: #8c6b00;
  display: flex;
  align-items: center;
  gap: 8px;
}

// 实际申报电量
.actual-load {
  &-default {
    font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
    font-size: 15px;
    color: #606266;
    font-weight: 600;
  }

  &-up {
    font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
    font-size: 15px;
    font-weight: 600;
    color: #d46b08;
  }

  &-down {
    font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
    font-size: 15px;
    font-weight: 600;
    color: #5586e4;
  }
}

.copy-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.copy-header-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: #1890ff;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  padding: 1px 6px;
  border-radius: 3px;
  transition: background 0.2s;

  &:hover {
    background: #e6f7ff;
  }

  &:active {
    background: #bae7ff;
  }

  &.is-disabled {
    color: #ccc;
    cursor: not-allowed;
    pointer-events: none;
  }
}

// 电价预测切换表头
.price-forecast-header {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  font-weight: 600;
  color: #8c8c8c;
  background: #f5f7fa;
  border: 1px solid #d9d9d9;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #1890ff;
    border-color: #1890ff;
  }

  &.active {
    color: #fff;
    background: #1890ff;
    border-color: #1890ff;
  }
}

.no-data {
  color: #d9d9d9;
}

// 评估电量列标题 — 可点击
.evaluation-column-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  color: #8c8c8c;
  transition: color 0.2s;

  &:hover {
    color: #595959;
  }

  &.active {
    color: #d46b08;
    font-weight: 700;
  }

  &.not-clickable {
    cursor: not-allowed;
    color: #bfbfbf;

    &:hover {
      color: #bfbfbf;
    }
  }
}

.manual-estimated-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
