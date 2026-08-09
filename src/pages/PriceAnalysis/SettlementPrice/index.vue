<template>
  <div class="settlement-price-page">
    <div class="app-container">
      <div v-if="errorMsg" class="error-banner">
        <span>{{ errorMsg }}</span>
      </div>

      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <h1 class="header-title">结算电价预测与查看</h1>
          <p class="header-subtitle">
            <template v-if="dateTag">
              <span class="highlight"> {{ dateTag }}</span>
              &nbsp;&middot;&nbsp;
            </template>
            <span class="highlight">{{ selectedDateDisplay }}</span>
            &nbsp;&middot;&nbsp;
            <span>24时段电价走势</span>
          </p>
        </div>
        <div class="date-selector">
          <label for="dateInput">选择日期</label>
          <el-date-picker
            id="dateInput"
            v-model="selectedDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            :clearable="false"
            :disabled-date="disabledDate"
            @change="handleDateChange"
          />
        </div>
      </div>

      <!-- Stats Bar -->
      <div
        class="stats-bar"
        v-loading="loading"
        element-loading-text="数据加载中..."
        element-loading-background="rgba(245,247,250,0.6)"
      >
        <div class="stat-card animate-in">
          <div class="stat-card-title">预测日均价</div>
          <div class="stat-grid">
            <div class="stat-cell">
              <div class="stat-cell-label">实时</div>
              <div class="stat-value">
                {{ statText.avgRT }}<span class="stat-unit">元/MWh</span>
              </div>
              <div class="stat-change" :class="statText.avgRTChangeClass">
                {{ statText.avgRTChange }}
              </div>
            </div>
            <div class="stat-cell">
              <div class="stat-cell-label">日前</div>
              <div class="stat-value">
                {{ statText.avgDA }}<span class="stat-unit">元/MWh</span>
              </div>
              <div class="stat-change" :class="statText.avgDAChangeClass">
                {{ statText.avgDAChange }}
              </div>
            </div>
          </div>
        </div>
        <div class="stat-card animate-in">
          <div class="stat-card-title">预测实时极值</div>
          <div class="stat-grid">
            <div class="stat-cell">
              <div class="stat-cell-label">最高价</div>
              <div class="stat-value">
                {{ statText.peakRT }}<span class="stat-unit">元/MWh</span>
              </div>
              <div class="stat-change up">{{ statText.peakRTTime }}</div>
            </div>
            <div class="stat-cell">
              <div class="stat-cell-label">最低价</div>
              <div class="stat-value">
                {{ statText.valleyRT }}<span class="stat-unit">元/MWh</span>
              </div>
              <div class="stat-change down">{{ statText.valleyRTTime }}</div>
            </div>
          </div>
        </div>
        <div class="stat-card animate-in">
          <div class="stat-card-title">预测日前极值</div>
          <div class="stat-grid">
            <div class="stat-cell">
              <div class="stat-cell-label">最高价</div>
              <div class="stat-value">
                {{ statText.peakDA }}<span class="stat-unit">元/MWh</span>
              </div>
              <div class="stat-change up">{{ statText.peakDATime }}</div>
            </div>
            <div class="stat-cell">
              <div class="stat-cell-label">最低价</div>
              <div class="stat-value">
                {{ statText.valleyDA }}<span class="stat-unit">元/MWh</span>
              </div>
              <div class="stat-change down">{{ statText.valleyDATime }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prediction Section -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon predict">&#9670;</span>
          <span class="section-title">预测结算电价</span>
          <span class="section-badge predict">
            {{ dateTag ? dateTag : selectedDateDisplay }}
          </span>
        </div>
        <div class="chart-grid">
          <SettlementChart
            title="实时电价预测"
            tag-text="REAL-TIME"
            tag-type="realtime"
            color-hex="#0891b2"
            :data="predictRT"
            :date-str="selectedDate"
          />
          <SettlementChart
            title="日前电价预测"
            tag-text="DAY-AHEAD"
            tag-type="dayahead"
            color-hex="#d97706"
            :data="predictDA"
            :date-str="selectedDate"
          />
        </div>
        <!-- Prediction Data Table -->
        <div class="data-table-section">
          <div class="data-table-toolbar">
            <span class="data-table-toolbar-title">预测数据明细</span>
            <div class="copy-btn-group">
              <button
                class="copy-btn"
                :class="{ copied: copyState.predictH }"
                @click="handleCopy('predict', 'horizontal')"
              >
                <svg
                  v-if="!copyState.predictH"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                  />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{ copyState.predictH ? "已复制" : "横向复制" }}
              </button>
              <button
                class="copy-btn"
                :class="{ copied: copyState.predictV }"
                @click="handleCopy('predict', 'vertical')"
              >
                <svg
                  v-if="!copyState.predictV"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                  />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{ copyState.predictV ? "已复制" : "竖向复制" }}
              </button>
            </div>
          </div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>时段</th>
                  <th v-for="h in HOURS" :key="h">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr class="row-rt">
                  <td>实时电价预测</td>
                  <td
                    v-for="(v, i) in predictRT"
                    :key="'rt' + i"
                    :class="cellCls(v, predictRTStat)"
                  >
                    {{ fmtValue(v) }}
                  </td>
                </tr>
                <tr class="row-da">
                  <td>日前电价预测</td>
                  <td
                    v-for="(v, i) in predictDA"
                    :key="'da' + i"
                    :class="cellCls(v, predictDAStat)"
                  >
                    {{ fmtValue(v) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Actual Section -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon actual">&#9679;</span>
          <span class="section-title">实际结算电价</span>
          <span class="section-badge actual">
            {{ dateTag ? dateTag : selectedDateDisplay }}</span
          >
        </div>
        <!-- 实际结算电价滞后 6 天公布：所选日期晚于可查看日期时，展示提示而非图表/表格 -->
        <div v-if="actualUnavailable" class="actual-unavailable-tip">
          <div class="actual-unavailable-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p class="actual-unavailable-title">实际结算电价尚未公布</p>
          <p class="actual-unavailable-desc">
            因结算电价会滞后 6 天才公布，{{ formatCnDate(selectedDate) }}
            的实际结算电价要到
            <span class="actual-unavailable-date">{{
              actualAvailableDisplay
            }}</span>
            才能查看
          </p>
        </div>
        <template v-else>
          <div class="chart-grid">
            <SettlementChart
              title="实际实时结算电价"
              tag-text="REAL-TIME"
              tag-type="realtime"
              color-hex="#0891b2"
              :data="actualRT"
              :date-str="selectedDate"
              :compare-data="predictRT"
              compare-label="预测实时电价"
            />
            <SettlementChart
              title="实际日前结算电价"
              tag-text="DAY-AHEAD"
              tag-type="dayahead"
              color-hex="#d97706"
              :data="actualDA"
              :date-str="selectedDate"
              :compare-data="predictDA"
              compare-label="预测日前电价"
            />
          </div>
          <!-- Actual Data Table -->
          <div class="data-table-section">
            <div class="data-table-toolbar">
              <span class="data-table-toolbar-title">实际数据明细</span>
              <div class="copy-btn-group">
                <button
                  class="copy-btn"
                  :class="{ copied: copyState.actualH }"
                  @click="handleCopy('actual', 'horizontal')"
                >
                  <svg
                    v-if="!copyState.actualH"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path
                      d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ copyState.actualH ? "已复制" : "横向复制" }}
                </button>
                <button
                  class="copy-btn"
                  :class="{ copied: copyState.actualV }"
                  @click="handleCopy('actual', 'vertical')"
                >
                  <svg
                    v-if="!copyState.actualV"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path
                      d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ copyState.actualV ? "已复制" : "竖向复制" }}
                </button>
              </div>
            </div>
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>时段</th>
                    <th v-for="h in HOURS" :key="h">{{ h }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="row-rt">
                    <td>实际实时结算</td>
                    <td
                      v-for="(v, i) in actualRT"
                      :key="'art' + i"
                      :class="cellCls(v, actualRTStat)"
                    >
                      {{ fmtValue(v) }}
                    </td>
                  </tr>
                  <tr class="row-da">
                    <td>实际日前结算</td>
                    <td
                      v-for="(v, i) in actualDA"
                      :key="'ada' + i"
                      :class="cellCls(v, actualDAStat)"
                    >
                      {{ fmtValue(v) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import SettlementChart from "./SettlementChart.vue";
import { getSettlementPriceAnalysis } from "./api";

const HOURS = Array.from(
  { length: 24 },
  (_, i) => String(i).padStart(2, "0") + ":00",
);

// ===== 日期工具 =====
function localDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(dateStr, delta) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return localDateStr(dt);
}
function formatDateDisplay(dateStr) {
  if (!dateStr) return "--";
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}年${String(m).padStart(2, "0")}月${String(d).padStart(2, "0")}日`;
}

// ===== 日期选择 =====
const today = localDateStr(new Date());
// 默认选中明天（预测数据当天可查，实际数据滞后 6 天仍走提示逻辑）
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const selectedDate = ref(localDateStr(tomorrow));

// 最多选到明天，最早可选 30 天前
function disabledDate(date) {
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const min = new Date(tomorrowStart);
  min.setDate(min.getDate() - 31);
  return date > tomorrowStart || date < min;
}

const selectedDateDisplay = computed(() =>
  formatDateDisplay(selectedDate.value),
);

// 相对日期标签：仅当所选日期为昨日/今日/明日时显示，否则不显示
const dateTag = computed(() => {
  if (selectedDate.value === addDays(today, -1)) return "昨天";
  if (selectedDate.value === today) return "今天";
  if (selectedDate.value === addDays(today, 1)) return "明天";
  return "";
});

// ===== 实际结算电价滞后 6 天公布 =====
// 例：今天 8/6 最多可查看 7/31（今天 - 6 天）的实际结算电价
const actualLatestDate = addDays(today, -6);
const actualUnavailable = computed(() => selectedDate.value > actualLatestDate);
// 提示用户可查看的日期 = 所选日期 + 6 天
function formatCnDate(dateStr) {
  if (!dateStr) return "--";
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}年${String(m).padStart(2, "0")}月${String(d).padStart(2, "0")}日`;
}
const actualAvailableDisplay = computed(() =>
  formatCnDate(addDays(selectedDate.value, 6)),
);

// ===== 数据获取 =====
const loading = ref(false);
const errorMsg = ref("");
const data = ref(null);

async function fetchData(date) {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await getSettlementPriceAnalysis(date);
    const body = res.data || {};
    if (body.success === false) {
      errorMsg.value = body.error || body.message || "获取数据失败";
      data.value = null;
    } else {
      data.value = body.data || null;
    }
  } catch (e) {
    errorMsg.value =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e.message ||
      "获取数据失败";
    data.value = null;
  } finally {
    loading.value = false;
  }
}

function handleDateChange() {
  if (selectedDate.value) fetchData(selectedDate.value);
}

// ===== 数据取值 =====
const predictRT = computed(() => data.value?.forecast?.realTime || []);
const predictDA = computed(() => data.value?.forecast?.dayAhead || []);
const actualRT = computed(() => data.value?.actual?.realTime || []);
const actualDA = computed(() => data.value?.actual?.dayAhead || []);

// ===== 统计（四个卡片） =====
function mean(arr) {
  const valid = (arr || []).filter((v) => v != null);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}
function changePct(cur, prev) {
  if (cur == null || prev == null || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}
function changeText(pct) {
  if (pct == null) return "--";
  return (pct > 0 ? "+" : "") + pct.toFixed(1) + "% vs 前日";
}
function changeClass(pct) {
  if (pct == null) return "stat-change";
  return pct > 0 ? "stat-change up" : "stat-change down";
}

// 单数组求最高/最低及其出现时段（忽略空值）
function range(arr) {
  let max = null;
  let min = null;
  let maxIdx = -1;
  let minIdx = -1;
  (arr || []).forEach((v, i) => {
    if (v == null) return;
    if (max == null || v > max) {
      max = v;
      maxIdx = i;
    }
    if (min == null || v < min) {
      min = v;
      minIdx = i;
    }
  });
  return { max, min, maxIdx, minIdx };
}

const statText = computed(() => {
  const rt = predictRT.value;
  const da = predictDA.value;
  const prevRT = data.value?.forecast?.prevRealTime || [];
  const prevDA = data.value?.forecast?.prevDayAhead || [];

  const avgRT = mean(rt);
  const avgDA = mean(da);
  const pctRT = changePct(avgRT, mean(prevRT));
  const pctDA = changePct(avgDA, mean(prevDA));

  const rtRange = range(rt);
  const daRange = range(da);
  const timeText = (idx) =>
    idx >= 0 ? "出现在 " + String(idx).padStart(2, "0") + ":00" : "--";

  return {
    avgRT: avgRT == null ? "--" : avgRT.toFixed(2),
    avgDA: avgDA == null ? "--" : avgDA.toFixed(2),
    avgRTChange: changeText(pctRT),
    avgDAChange: changeText(pctDA),
    avgRTChangeClass: changeClass(pctRT),
    avgDAChangeClass: changeClass(pctDA),
    // 实时预测极值
    peakRT: rtRange.max == null ? "--" : rtRange.max.toFixed(2),
    valleyRT: rtRange.min == null ? "--" : rtRange.min.toFixed(2),
    peakRTTime: timeText(rtRange.maxIdx),
    valleyRTTime: timeText(rtRange.minIdx),
    // 日前预测极值
    peakDA: daRange.max == null ? "--" : daRange.max.toFixed(2),
    valleyDA: daRange.min == null ? "--" : daRange.min.toFixed(2),
    peakDATime: timeText(daRange.maxIdx),
    valleyDATime: timeText(daRange.minIdx),
  };
});

// ===== 表格 =====
function fmtValue(v) {
  return v == null ? "—" : Number(v).toFixed(2);
}
function rowStat(arr) {
  const valid = (arr || []).filter((v) => v != null);
  if (!valid.length) return { max: null, min: null };
  return { max: Math.max(...valid), min: Math.min(...valid) };
}
function cellCls(v, stat) {
  if (v == null) return "";
  if (v === stat.max) return "val-high";
  if (v === stat.min) return "val-low";
  return "";
}
// 表格各行独立标出本行最高价（红）/最低价（绿）
const predictRTStat = computed(() => rowStat(predictRT.value));
const predictDAStat = computed(() => rowStat(predictDA.value));
const actualRTStat = computed(() => rowStat(actualRT.value));
const actualDAStat = computed(() => rowStat(actualDA.value));

// ===== 复制功能 =====
const copyState = reactive({
  predictH: false,
  predictV: false,
  actualH: false,
  actualV: false,
});

function buildTableText(tableKey, mode) {
  const isPredict = tableKey === "predict";
  const rtData = isPredict ? predictRT.value : actualRT.value;
  const daData = isPredict ? predictDA.value : actualDA.value;
  const rtLabel = isPredict ? "实时电价预测" : "实际实时结算";
  const daLabel = isPredict ? "日前电价预测" : "实际日前结算";

  const lines = [];
  if (mode === "horizontal") {
    // 表头行 + 每行整体（tab 分隔）
    lines.push(["时段", ...HOURS].join("\t"));
    lines.push([rtLabel, ...rtData.map(fmtValue)].join("\t"));
    lines.push([daLabel, ...daData.map(fmtValue)].join("\t"));
  } else {
    // 每个时段一行（表头 + 时段 + 各价格）
    lines.push(["时段", rtLabel, daLabel].join("\t"));
    for (let i = 0; i < HOURS.length; i++) {
      lines.push(
        [HOURS[i], fmtValue(rtData[i]), fmtValue(daData[i])].join("\t"),
      );
    }
  }
  return lines.join("\n");
}

function showCopySuccess(key) {
  copyState[key] = true;
  setTimeout(() => {
    copyState[key] = false;
  }, 1500);
}

function fallbackCopy(text, key) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    showCopySuccess(key);
  } catch (e) {
    // 静默失败
  }
  document.body.removeChild(textarea);
}

function handleCopy(tableKey, mode) {
  const text = buildTableText(tableKey, mode);
  const key = `${tableKey}${mode === "horizontal" ? "H" : "V"}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showCopySuccess(key))
      .catch(() => fallbackCopy(text, key));
  } else {
    fallbackCopy(text, key);
  }
}

onMounted(() => {
  fetchData(selectedDate.value);
});
</script>

<style scoped>
.settlement-price-page {
  background: #f5f7fa;
  min-height: 100vh;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.app-container {
  max-width: 100%;
  margin: 0;
  padding: 28px 16px 48px;
}
.error-banner {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 500;
}

/* ===== Header ===== */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.header-title {
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.3px;
  margin: 0;
}
.header-subtitle {
  font-size: 14px;
  color: #475569;
  font-weight: 400;
  margin: 0;
  margin-top: 4px;
}
.header-subtitle .highlight {
  color: #0891b2;
  font-weight: 600;
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e9f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  padding: 8px 16px;
}
.date-selector label {
  font-size: 13px;
  color: #475569;
  white-space: nowrap;
  font-weight: 500;
}
.date-selector :deep(.el-date-editor) {
  width: 160px;
}
.date-selector :deep(.el-input__wrapper) {
  background: #f5f7fa;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  box-shadow: none;
  padding: 0 12px;
  height: 34px;
  transition: border-color 0.2s;
}
.date-selector :deep(.el-input__wrapper.is-focus) {
  border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
}
.date-selector :deep(.el-input__inner) {
  color: #1e293b;
  font-size: 14px;
  font-family: "Inter", monospace;
}

/* ===== Stats Bar ===== */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #ffffff;
  border: 1px solid #e5e9f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 18px 20px;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
.stat-card-title {
  font-size: 12px;
  color: #64748b;
  letter-spacing: 0.3px;
  margin-bottom: 10px;
  font-weight: 600;
}
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stat-cell {
  background: #f5f7fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
}
.stat-cell-label {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
  font-weight: 500;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1e293b;
  letter-spacing: -0.3px;
}
.stat-unit {
  font-size: 12px;
  font-weight: 400;
  color: #475569;
  margin-left: 3px;
}
.stat-change {
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}
.stat-change.up {
  color: #dc2626;
}
.stat-change.down {
  color: #059669;
}

/* ===== Section ===== */
.section {
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}
.section-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.section-icon.predict {
  background: rgba(8, 145, 178, 0.1);
  color: #0891b2;
}
.section-icon.actual {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}
.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
}
.section-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.section-badge.predict {
  background: rgba(8, 145, 178, 0.1);
  color: #0891b2;
}
.section-badge.actual {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}
.section-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 32px 0;
}

/* ===== 实际结算电价滞后提示 ===== */
.actual-unavailable-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #ffffff;
  border: 1px dashed #e5e9f0;
  border-radius: 14px;
  padding: 56px 24px;
}
.actual-unavailable-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.actual-unavailable-icon svg {
  width: 24px;
  height: 24px;
}
.actual-unavailable-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px;
}
.actual-unavailable-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}
.actual-unavailable-date {
  color: #d97706;
  font-weight: 600;
}

/* ===== Chart Grid ===== */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* ===== Data Table ===== */
.data-table-section {
  margin-top: 20px;
}
.data-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.data-table-toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
.data-table-wrapper {
  background: #ffffff;
  border: 1px solid #e5e9f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow-x: auto;
}
.copy-btn-group {
  display: flex;
  gap: 8px;
}
.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  border: 1px solid #e5e9f0;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.copy-btn:hover {
  border-color: #0891b2;
  color: #0891b2;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.12);
}
.copy-btn.copied {
  border-color: #059669;
  color: #059669;
  background: rgba(5, 150, 105, 0.08);
}
.copy-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.data-table thead th {
  background: #f5f7fa;
  color: #475569;
  font-weight: 600;
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 1;
}
.data-table thead th:first-child {
  text-align: left;
  padding-left: 16px;
  min-width: 100px;
  position: sticky;
  left: 0;
  z-index: 2;
  background: #f5f7fa;
}
.data-table tbody td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  font-weight: 500;
}
.data-table tbody td:first-child {
  text-align: left;
  padding-left: 16px;
  font-weight: 600;
  color: #475569;
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 1;
}
.data-table tbody tr:last-child td {
  border-bottom: none;
}
.data-table tbody tr:hover td {
  background: rgba(8, 145, 178, 0.03);
}
.data-table tbody td:first-child:hover {
  background: rgba(8, 145, 178, 0.06);
}
.data-table .val-high {
  color: #dc2626;
  font-weight: 600;
}
.data-table .val-low {
  color: #059669;
  font-weight: 600;
}
.data-table .row-rt td:first-child {
  color: #0891b2;
}
.data-table .row-da td:first-child {
  color: #d97706;
}

/* ===== 动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-in {
  animation: fadeInUp 0.4s ease-out forwards;
  opacity: 0;
}
.animate-in:nth-child(1) {
  animation-delay: 0.05s;
}
.animate-in:nth-child(2) {
  animation-delay: 0.1s;
}
.animate-in:nth-child(3) {
  animation-delay: 0.15s;
}
.animate-in:nth-child(4) {
  animation-delay: 0.2s;
}
.animate-in:nth-child(5) {
  animation-delay: 0.25s;
}
.animate-in:nth-child(6) {
  animation-delay: 0.3s;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .app-container {
    padding: 16px 8px;
  }
  .stats-bar {
    grid-template-columns: 1fr;
  }
  .chart-grid {
    grid-template-columns: 1fr;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
