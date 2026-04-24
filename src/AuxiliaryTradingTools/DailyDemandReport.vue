<template>
  <!-- 头部 -->
  <div class="header-wrapper">
    <div class="header">
      <div class="header-content">
        <div class="title">⚡ 日前用电需求申报工作流</div>
        <div class="badge-wrapper">
          <span class="badge">🤖 预测算法 v1.0</span>
          <span class="badge">📊 支持日度申报</span>
          <span class="badge">📅 日期类型内置2024-2026</span>
        </div>
      </div>
      <div class="subtitle">
        基于EMS历史负荷数据智能预测次日用电量，一键生成申报表Excel
      </div>
    </div>
    <div class="btns">
      <!-- 进入历史申报页面 -->
      <el-button color="#626aef" :dark="isDark" @click="navigateToHistory">
        <span style="margin-right: 8px">查看历史申报</span>
        <el-icon><TopRight /></el-icon>
      </el-button>
      <!-- 查看收益分析按钮 -->
      <el-button color="#626aef" :dark="isDark" @click="navigateToAnalysis">
        <span style="margin-right: 8px">查看收益分析</span>
        <el-icon><TopRight /></el-icon>
      </el-button>
    </div>
  </div>

  <div class="main-container">
    <!-- 右侧板块：图表信息显示区 -->
    <div class="right-main-container">
      <!-- 天气信息 -->
      <div class="weather-container">
        <!-- 加载状态 -->
        <div v-if="weatherLoading" class="weather-loading">
          <div class="spinner"></div>
          <span>⏳ 正在加载天气数据...</span>
        </div>

        <!-- 错误信息 -->
        <div v-else-if="weatherError" class="weather-error">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <strong>天气数据加载失败</strong>
            <p>{{ weatherError }}</p>
            <button class="btn-retry" @click="fetchWeatherData">
              🔄 重新加载
            </button>
          </div>
        </div>

        <!-- 天气信息组件 -->
        <WeatherInfo
          v-else
          :date="declarationDate"
          :chart-data="weatherChartData"
          :summary-data="weatherSummaryData"
          :loading="weatherLoading"
          @export-data="handleWeatherExport"
          class="weather-info"
        />
      </div>
      <!-- 电价图表：日前预测电价和实时结算电价曲线图 -->
      <div class="price-container">
        <!-- 加载状态 -->
        <div v-if="priceLoading" class="price-loading">
          <div class="spinner"></div>
          <span>⏳ 正在加载电价数据...</span>
        </div>

        <!-- 错误信息 -->
        <div v-else-if="priceError" class="price-error">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <strong>电价数据加载失败</strong>
            <p>{{ priceError }}</p>
            <button class="btn-retry" @click="fetchPriceData">
              🔄 重新加载
            </button>
          </div>
        </div>

        <!-- 电价图表组件 -->
        <PriceChart
          v-else
          :date="declarationDate"
          :chart-data="priceChartData"
          :loading="priceLoading"
          @export-data="handlePriceExport"
          class="price-chart"
        />
      </div>
      <!-- 统调曲线图表 -->
      <div class="unified-dispatch-container">
        <!-- 加载状态 -->
        <div v-if="unifiedDispatchLoading" class="unified-dispatch-loading">
          <div class="spinner"></div>
          <span>⏳ 正在加载统调曲线数据...</span>
        </div>

        <!-- 错误信息 -->
        <div v-else-if="unifiedDispatchError" class="unified-dispatch-error">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <strong>统调曲线数据加载失败</strong>
            <p>{{ unifiedDispatchError }}</p>
            <button class="btn-retry" @click="fetchUnifiedDispatchData">
              🔄 重新加载
            </button>
          </div>
        </div>

        <!-- 统调曲线图表组件 -->
        <UnifiedDispatchChart
          v-else
          :date="declarationDate"
          :chart-data="unifiedDispatchChartData"
          :loading="unifiedDispatchLoading"
          @export-data="handleUnifiedDispatchExport"
          class="unified-dispatch-chart"
        />
      </div>
    </div>
    <!-- 右侧板块：主要参数配置区 -->
    <div class="left-main-container">
      <!-- 上面：配置网格 -->
      <div class="config-container">
        <div class="config-header">
          <h2>📋 申报参数配置</h2>
          <template v-if="workflowState == 0">
            <button
              type="button"
              class="btn btn-secondary"
              @click="resetAll"
              :disabled="isResetAllDisabled"
            >
              <el-icon><RefreshLeft /></el-icon> <text>重置为默认配置</text>
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="generateReportTable({ showMessage: true })"
              :disabled="isGenerateReportDisabled"
            >
              <el-icon><Coffee /></el-icon> <text>生成申报表</text>
            </button>
          </template>
          <!-- 撤销按钮：点击撤销至状态0 -->

          <el-button
            v-if="workflowState == 1"
            @click="handleUndoToInitial"
            type="info"
            :icon="RefreshLeft"
            dashed
            >返回到上一步</el-button
          >
        </div>
        <!-- 申报参数配置表单 -->
        <div
          class="config-grid"
          :class="{ 'config-disabled': isConfigFormDisabled }"
        >
          <!-- 左侧：申报日期和负荷模式 -->
          <div class="config-section left-section">
            <div class="field-group declaration-date-section">
              <label
                >📅 申报日期
                <span class="tooltip" title="必填，格式：YYYY-MM-DD"
                  >必填</span
                ></label
              >
              <input
                type="date"
                v-model="declarationDate"
                placeholder="YYYY-MM-DD"
                :disabled="isConfigFormDisabled"
              />
              <!-- 日期信息显示 -->
              <DateInfoDisplay
                class="date-info-wrapper"
                :date-info="dateInfo"
              />
            </div>

            <div class="field-group load-mode-section">
              <label
                >⚡ 负荷模式
                <span class="tooltip" title="选择负荷预测模式"
                  >默认算法预测</span
                ></label
              >
              <select v-model="loadMode" :disabled="isConfigFormDisabled">
                <option value="算法预测">算法预测</option>
                <option value="人工经验">人工经验</option>
              </select>
            </div>
          </div>

          <!-- 右侧：概率计算窗口配置 -->
          <div class="config-section middle-section">
            <div class="field-group probability-section">
              <label
                >🎯 概率计算窗口
                <span class="tooltip" title="配置历史数据筛选和时间范围"
                  >高级配置</span
                ></label
              >
              <!-- 概率计算方式 -->
              <div class="probability-method">
                <el-radio-group
                  v-model="mode_declaration"
                  :disabled="isConfigFormDisabled"
                >
                  <el-radio value="manual">人工计算</el-radio>
                  <el-radio value="algorithm">算法测算</el-radio>
                </el-radio-group>
              </div>

              <!-- 概率计算窗口配置（仅在人工计算时显示） -->
              <div
                class="probability-config"
                v-if="mode_declaration === 'manual'"
              >
                <!-- 时间范围类型 -->
                <div class="config-row">
                  <div class="config-item">
                    <div class="config-label">时间范围类型</div>
                    <select
                      v-model="timeRangeType"
                      :disabled="isConfigFormDisabled"
                    >
                      <option value="days">最近N天</option>
                      <option value="period">最近N个同类周期</option>
                    </select>
                  </div>
                </div>
                <!-- 日期筛选类型 -->
                <div class="config-row" v-if="timeRangeType === 'period'">
                  <div class="config-item">
                    <div class="config-label">日期筛选类型</div>
                    <select
                      v-model="probabilityWindow.type"
                      :disabled="isConfigFormDisabled"
                    >
                      <option value="all">不筛选（按自然日）</option>
                      <option value="workday">仅工作日</option>
                      <option value="monday">周一</option>
                      <option value="tuesday">周二</option>
                      <option value="wednesday">周三</option>
                      <option value="thursday">周四</option>
                      <option value="friday">周五</option>
                      <option value="saturday">周六</option>
                      <option value="sunday">周日</option>
                      <option value="legal_holiday">法定节假日</option>
                      <option value="adjusted_holiday">调休节假日</option>
                    </select>
                  </div>
                </div>
                <!-- 时间范围值 -->
                <div class="config-row">
                  <div class="config-item">
                    <div class="config-label" v-if="timeRangeType === 'days'">
                      最近天数
                    </div>
                    <div class="config-label" v-else>最近周期数</div>
                    <input
                      type="number"
                      v-model.number="timeRangeValue"
                      min="1"
                      max="30"
                      step="1"
                      :disabled="isConfigFormDisabled"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 下面：申报表格 -->
      <div class="table-container">
        <!-- 加载状态 -->
        <div v-if="strategyLoading" class="strategy-loading">
          <div class="spinner"></div>
          <span>⏳ 正在加载建议申报策略表格数据...</span>
        </div>

        <!-- 错误信息 -->
        <div v-else-if="strategyError" class="strategy-error">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <strong>表格数据加载失败</strong>
            <p>{{ strategyError }}</p>
            <button
              class="btn-retry"
              @click="generateReportTable({ showMessage: false })"
            >
              🔄 重新加载
            </button>
          </div>
        </div>
        <template v-else>
          <!-- 表格组件 -->
          <StrategyTable
            v-if="strategyTableData.length > 0"
            :table-data="strategyTableData"
            :ratios="ratios"
            :is-editing-disabled="workflowState === 2"
            @update:ratios="(newRatios) => (ratios = newRatios)"
            class="strategy-table"
          />
          <!-- 提示用户：申报参数配置后点击生成申报表，即可获取建议申报策略表格数据 -->
          <div class="strategy-table-hint" v-else>
            <div class="hint-content">
              <span class="hint-icon">📋</span>
              <p>
                请先配置申报参数，点击「生成申报表」后，即可获取建议申报策略表格数据。
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <!-- 结果展示区 -->
  <div class="result-section">
    <div class="title-bar">
      <h2>📎 申报结果 & 下载</h2>
      <!-- 提交按钮 -->
      <button
        v-if="workflowState == 1"
        class="btn btn-primary submit-btn"
        :disabled="loading || !declarationDate"
        @click="handleSubmit"
      >
        <span v-if="loading" class="spinner"></span>
        {{
          loading
            ? "正在调用EMS接口，生成中..."
            : "🚀 开始申报预测 & 生成Excel报表"
        }}
      </button>
      <!-- 撤销按钮：撤销至状态1 -->
      <el-button
        v-if="workflowState == 2"
        @click="handleUndo"
        type="info"
        :icon="RefreshLeft"
        dashed
        >返回到上一步</el-button
      >
    </div>
    <div id="resultContainer">
      <div class="strategy-table-hint" v-if="!result && !errorMsg">
        <div class="hint-content">
          <span class="hint-icon">⚡</span>
          <p>
            生成申报表后，调整申报比例，点击「开始申报预测」，系统将调用EMS接口分析并生成日前需求申报EXCEL表。
          </p>
        </div>
      </div>
      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>⏳ 正在获取历史负荷、分析预测并生成Excel报表，请稍候...</span>
      </div>
      <div v-else-if="errorMsg" class="error-box">
        <strong>❌ 申报失败</strong><br />
        {{ errorMsg }}
        <details v-if="lastPayload">
          <summary>查看请求参数</summary>
          <pre>{{ JSON.stringify(lastPayload, null, 2) }}</pre>
        </details>
        <div class="error-hint">
          💡 建议检查: 申报日期是否正确、参数格式是否符合要求
        </div>
      </div>
      <div v-else-if="result" class="result-area">
        <div class="result-header">
          <strong>✅ 申报预测已完成</strong>
          <span class="run-id">Run ID: {{ result.run_id || "—" }}</span>
          <!-- 确认保存此方案按钮 -->
          <button
            v-if="workflowState == 2"
            class="btn btn-success action-btn"
            @click="handleSaveConfirm"
          >
            💾 确认保存此方案
          </button>
        </div>
        <div v-if="result.output_file?.url" class="download-link">
          <div>
            📄 <strong>Excel 日前需求申报表</strong> ({{
              result.output_file.file_type
            }})<br />
            <span class="link-url">{{ result.output_file.url }}</span>
          </div>
          <div>
            <a
              :href="result.output_file.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary download-btn"
              >📥 下载文件</a
            >
            <button
              class="btn btn-secondary"
              @click="copyToClipboard(result.output_file.url)"
            >
              📋 复制链接
            </button>
          </div>
        </div>
        <div v-else class="error-box">⚠️ 未返回文件下载链接，请检查日志</div>
        <hr />
        <details>
          <summary class="payload-summary">📌 查看已提交的请求参数</summary>
          <pre class="payload-preview">{{
            JSON.stringify(lastPayload, null, 2)
          }}</pre>
        </details>
      </div>
      <footer>🌟 基于EMS历史负荷数据预测 | 文件链接有效期24小时</footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request"; // 根据实际路径调整
import { ElMessage, ElMessageBox } from "element-plus";
import StrategyTable from "./components/StrategyTable.vue";
import WeatherInfo from "./components/WeatherInfo.vue";
import PriceChart from "./components/PriceChart.vue";
import UnifiedDispatchChart from "./components/UnifiedDispatchChart.vue";
import { Coffee, RefreshLeft, TopRight } from "@element-plus/icons-vue";
import DateInfoDisplay from "./components/DateInfoDisplay.vue";

import { useRouter } from "vue-router";
const router = useRouter();

// ---------- 响应式数据 ----------
const declarationDate = ref("");
const loadMode = ref("算法预测");
const probabilityWindow = ref({ type: "all" });
const timeRangeType = ref("days");
const timeRangeValue = ref(7);
const ratios = ref(new Array(24).fill(null));
const mode_declaration = ref("manual"); // 概率计算方式：manual(人工) 或 algorithm(算法)

// VPP接口相关数据
const accessToken = ref("");
const strategyTableData = ref([]);
const strategyLoading = ref(false);
const strategyError = ref("");

// 天气数据
const weatherChartData = ref([]);
const weatherSummaryData = ref([]);
const weatherLoading = ref(false);
const weatherError = ref("");

// 电价数据
const priceChartData = ref([]);
const priceLoading = ref(false);
const priceError = ref("");

// 统调曲线数据
const unifiedDispatchChartData = ref([]);
const unifiedDispatchLoading = ref(false);
const unifiedDispatchError = ref("");

// 日期信息数据
const dateInfo = ref(null);
const dateInfoLoading = ref(false);
const dateInfoError = ref("");

const loading = ref(false);
const result = ref(null);
const errorMsg = ref("");
const lastPayload = ref(null);
const tempFileInfo = ref(null); // 临时文件信息

// ---------- 工作流状态管理 ----------
// 状态定义：0-初始状态，1-配置锁定状态，2-申报提交状态
const workflowState = ref(0); // 0: INITIAL, 1: CONFIG_LOCKED, 2: SUBMITTED

// 计算当前选择的申报日期
const currentTargetDate = computed(() => {
  if (!declarationDate.value) {
    return "未选择申报日期（必填）";
  }
  const [year, month, day] = declarationDate.value.split("-");
  return `${year}年${month}月${day}日`;
});

// 状态相关计算属性
const isConfigFormDisabled = computed(() => workflowState.value >= 1);
const isGenerateReportDisabled = computed(() => workflowState.value >= 1);
const isResetAllDisabled = computed(() => workflowState.value >= 1);
const isStrategyTableVisible = computed(() => workflowState.value >= 1);
const isSubmitButtonDisabled = computed(() => workflowState.value !== 1);
const showActionButtons = computed(() => workflowState.value === 2);

// ---------- 辅助函数 ----------
function getTomorrowStr() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

// 重置所有
function resetAll() {
  // 重置参数
  declarationDate.value = getTomorrowStr();
  loadMode.value = "算法预测";
  probabilityWindow.value = { type: "all" };
  timeRangeType.value = "days";
  timeRangeValue.value = 7;
  ratios.value = new Array(24).fill(null);
  errorMsg.value = "";
  result.value = null;
  lastPayload.value = null;
  tempFileInfo.value = null;

  // 重置工作流状态到初始状态
  workflowState.value = 0;

  // 清空策略数据
  strategyTableData.value = [];
  strategyError.value = "";
}

// 复制链接
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  // 可添加提示，这里省略
}

// 构建请求 payload
function buildRequestPayload(OUTPUT_FORMAT = "excel") {
  if (!declarationDate.value) {
    throw new Error("请选择申报日期");
  }
  const ModeDeclarationMap = {
    manual: "人工计算",
    algorithm: "算法测算",
  };
  const payload = {
    declaration_date: declarationDate.value,
    load_mode: loadMode.value,
    mode_declaration: ModeDeclarationMap[mode_declaration.value],
  };

  //如果是人工计算，添加概率计算窗口参数:
  if (mode_declaration.value === "manual") {
    payload.probability_window = {};
    // 添加日期筛选类型
    payload.probability_window.type = probabilityWindow.value.type;
    if (probabilityWindow.value.type == "all") {
      payload.probability_window.days = timeRangeValue.value;
    } else {
      payload.probability_window.period = timeRangeValue.value;
    }
  }

  // 添加调整比例，将等于原始比例的值转换为null（视为未调整）
  if (OUTPUT_FORMAT == "excel") {
    payload.ratio = ratios.value.map((ratio, index) =>
      ratio == strategyTableData.value[index]?.ratio ? null : ratio,
    );
  }

  return payload;
}

/* ------------------------ 点击按钮： 开始申报预测 & 生成Excel报表  ------------------------  */
async function handleSubmit() {
  let payload = null;
  try {
    payload = buildRequestPayload("excel");
  } catch (err) {
    errorMsg.value = err.message;
    result.value = null;
    lastPayload.value = null;
    tempFileInfo.value = null;
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  result.value = null;
  tempFileInfo.value = null;
  lastPayload.value = payload;

  try {
    const res = await request({
      method: "POST",
      url: "/api/daily-declaration/generate", // 请根据实际后端路径调整
      data: payload,
    });

    result.value = res.data;

    // 存储临时文件信息（供保存方案时使用）
    if (res.data.output_file && res.data.output_file.temp_token) {
      tempFileInfo.value = {
        temp_token: res.data.output_file.temp_token,
        run_id: res.data.run_id,
        file_name:
          res.data.output_file.file_name ||
          `日前申报表_${declarationDate.value}.xlsx`,
        url: res.data.output_file.url,
        declaration_date: res.data.declaration_date || declarationDate.value,
      };
      console.log("临时文件信息已存储:", tempFileInfo.value);
    }

    // 状态转换：1 → 2 (申报提交状态)
    workflowState.value = 2;
  } catch (err) {
    console.error(err);
    errorMsg.value =
      err.response?.data?.message || err.message || "网络异常或服务端错误";
    result.value = null;
    tempFileInfo.value = null;
  } finally {
    loading.value = false;
  }
}
/* ------------------------ End  ------------------------  */

/* ------------------------ 点击按钮：回到配置锁定状态 状态转换：2 -> 1   ------------------------  */
const handleUndo = () => {
  ElMessageBox.confirm(
    "确定要撤销到可编辑状态吗？这将清空当前的申报结果，但保留配置和表格调整。",
    "确认撤销",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    },
  ).then(async () => {
    try {
      // 如果有临时文件，尝试清理
      if (tempFileInfo.value?.temp_token) {
        try {
          await request.delete(
            `/api/daily-declaration/temp/${tempFileInfo.value.temp_token}`,
          );
          console.log("临时文件已清理:", tempFileInfo.value.temp_token);
        } catch (cleanupError) {
          console.warn("清理临时文件失败:", cleanupError.message);
          // 清理失败不影响主要流程
        }
      }

      // 状态转换：2 → 1 (回到配置锁定状态)
      workflowState.value = 1;
      // 清空申报结果和下载内容
      result.value = null;
      errorMsg.value = "";
      lastPayload.value = null;
      tempFileInfo.value = null;

      ElMessage.success("已撤销到可编辑状态，可继续调整申报比例");
    } catch (error) {
      console.error("撤销操作失败:", error);
      ElMessage.error("撤销操作失败，请重试");
    }
  });
};

// 撤销至初始状态
const handleUndoToInitial = () => {
  ElMessageBox.confirm(
    "确定要撤销到初始状态吗？这将撤销申报表格，但保留已配置的申报参数。",
    "确认撤销",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    },
  ).then(() => {
    // 状态转换：1 → 0 (回到初始状态)
    workflowState.value = 0;
    // 清空策略表格数据
    strategyTableData.value = [];
    strategyError.value = "";
    strategyLoading.value = false;
    // 重置调整比例为默认值
    ratios.value = new Array(24).fill(null);
    // 清理临时文件信息（如果存在）
    tempFileInfo.value = null;
    ElMessage.success("已撤销到初始状态，申报表格已撤销");
  });
};

// 重新申报
const handleReDeclare = () => {
  ElMessageBox.confirm(
    "确定要重新申报吗？这将重置所有配置和调整，当前申报结果将丢失。",
    "确认重新申报",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    },
  ).then(() => {
    resetAll();
    ElMessage.success("已重置，可重新开始申报流程");
  });
};

// 确认保存此方案
const handleSaveConfirm = () => {
  ElMessageBox.confirm(
    "确认保存当前申报方案吗？保存后可在历史记录中查看。",
    "确认保存",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    },
  ).then(async () => {
    try {
      // 检查是否有临时文件信息
      if (!tempFileInfo.value) {
        ElMessage.error("未找到临时文件信息，请先生成申报表");
        return;
      }

      // 检查是否有策略表格数据
      if (!strategyTableData.value || strategyTableData.value.length === 0) {
        ElMessage.error("未找到申报表格数据，请先生成申报表");
        return;
      }

      // 构建probability_window对象
      const probability_window = {
        mode_declaration: mode_declaration.value,
      };

      if (mode_declaration.value === "manual") {
        // 人工计算
        probability_window.type = probabilityWindow.value.type || "all";

        if (timeRangeType.value === "days") {
          // 最近N天
          probability_window.days = timeRangeValue.value;
        } else {
          // 最近N个同类周期
          probability_window.period = timeRangeValue.value;
        }
      }
      // 算法计算：只需mode_declaration字段

      // 构建保存请求数据
      const saveData = {
        declaration_date: declarationDate.value,
        load_mode: loadMode.value,
        probability_window,
        ratio_settings: ratios.value.map((ratio, index) =>
          ratio == strategyTableData.value[index]?.ratio ? null : ratio,
        ), //这里是调整比例而不是原始比例
        strategy_table_data: strategyTableData.value,
        temp_token: tempFileInfo.value.temp_token,
        run_id: tempFileInfo.value.run_id,
      };

      console.log("保存方案请求数据:", saveData);

      // 检查是否已有相同日期的申报记录
      try {
        const checkResponse = await request.get(
          `/api/daily-declaration/history`,
          {
            params: { date: declarationDate.value },
          },
        );

        // 如果接口返回成功且有数据，说明存在记录
        if (checkResponse.data.success && checkResponse.data.declaration) {
          // 提示用户是否覆盖
          const confirmOverwrite = await ElMessageBox.confirm(
            `日期 ${declarationDate.value} 已有申报记录，是否覆盖？`,
            "确认覆盖",
            {
              confirmButtonText: "覆盖",
              cancelButtonText: "取消",
              type: "warning",
            },
          ).catch(() => false); // 用户点击取消时返回false

          if (!confirmOverwrite) {
            ElMessage.info("保存已取消");
            return;
          }
        }
      } catch (checkError) {
        // 如果接口返回404，表示没有记录，可以继续保存
        // 其他错误则直接抛出
        if (checkError.response?.status !== 404) {
          console.error("检查历史记录失败:", checkError);
          // 继续保存流程，让后端处理错误
        }
      }

      // 调用保存接口
      const response = await request.post(
        "/api/daily-declaration/save",
        saveData,
      );

      // 根据是否更新显示不同的成功消息
      const message = response.data.is_update
        ? `方案更新成功！已覆盖原有记录。ID: ${response.data.id}`
        : `方案保存成功！ID: ${response.data.id}`;

      ElMessage.success(message);
      console.log("方案保存响应:", response.data);

      // 保存成功后重置状态到初始化状态
      resetAll();
    } catch (error) {
      console.error("保存方案失败:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "保存失败";
      ElMessage.error(`保存失败: ${errorMessage}`);
    }
  });
};

// 获取VPP系统accessToken
const fetchAccessToken = async () => {
  try {
    console.log("正在获取VPP系统accessToken...");
    const response = await request.post("/api/vpp/pbp-system/v1/user/login", {
      userName: "vpp",
      password:
        "1701f6e61930d52216bb3fe93e414bd0956583ddc37dc1c69db7abff79243bd2",
      r: Date.now().toString(),
    });
    console.log(response.data.data[0]);
    if (response.data.msg === "SUCCESS") {
      accessToken.value = response.data.data[0].accessToken;
      console.log("VPP系统accessToken获取成功");
      return response.data.data[0].accessToken;
    } else {
      throw new Error("接口未返回accessToken");
    }
  } catch (error) {
    console.error("获取VPP系统accessToken失败:", error);
    strategyError.value = "获取系统认证失败，表格数据将无法加载";
    return null;
  }
};

// 点击生成申报表，获取建议申报策略表格数据
const generateReportTable = async (options = {}) => {
  const { showMessage = false } = options;

  if (!declarationDate.value) {
    const errorMsg = "请先选择申报日期";
    if (showMessage) {
      ElMessage.error(errorMsg);
    } else {
      strategyError.value = errorMsg;
    }
    return null;
  }

  // 新版接口不需要accessToken，移除token相关逻辑
  strategyLoading.value = true;
  strategyError.value = "";

  try {
    console.log(`正在获取策略数据，申报日期: ${declarationDate.value}`);

    // 构建请求参数
    const payload = buildRequestPayload("table");

    console.log("策略数据请求参数:", payload);

    const response = await request.post("/api/daily-declaration/data", payload);

    if (
      response.data &&
      response.data.success === true &&
      Array.isArray(response.data.data)
    ) {
      // 处理数据（保留两位小数）
      const newRatios = response.data.data.map((item) => {
        // 保留两位小数
        item.ratio = parseFloat(item.ratio).toFixed(2);
        return item.ratio;
      });
      console.log("newRatios----->:", newRatios);
      //把declaration_mwh字段四舍五入精度为两位小数
      response.data.data.forEach((item) => {
        item.declaration_mwh = parseFloat(item.declaration_mwh).toFixed(2);
      });
      //把estimated_mwh字段四舍五入精度为两位小数
      response.data.data.forEach((item) => {
        item.estimated_mwh = parseFloat(item.estimated_mwh).toFixed(2);
      });
      //把probability字段四舍五入精度为两位小数
      response.data.data.forEach((item) => {
        item.probability = parseFloat(item.probability).toFixed(2);
      });
      //把ratio字段四舍五入精度为两位小数
      response.data.data.forEach((item) => {
        item.ratio = parseFloat(item.ratio).toFixed(2);
      });

      // 更新数据
      strategyTableData.value = response.data.data;
      console.log("strategyTableData.value----->:", strategyTableData.value);

      ratios.value = newRatios;

      console.log(`策略数据获取成功，共${response.data.data.length}条记录`);

      // 显示成功消息（如果需要）
      if (showMessage) {
        ElMessage.success("申报表生成成功");
      }

      strategyError.value = "";

      // 状态转换：0 → 1 (配置锁定状态)
      workflowState.value = 1;

      return response.data.data;
    } else {
      throw new Error("接口返回数据格式错误");
    }
  } catch (error) {
    console.error("获取策略数据失败:", error);
    const errorMsg =
      error.response?.data?.message || error.message || "获取数据失败";

    if (showMessage) {
      ElMessage.error(errorMsg);
    } else {
      strategyError.value = errorMsg;
      strategyTableData.value = [];
    }

    return null;
  } finally {
    strategyLoading.value = false;
  }
};

// 获取日期信息
const fetchDateInfo = async () => {
  if (!declarationDate.value) {
    dateInfo.value = null;
    dateInfoError.value = "请先选择申报日期";
    return;
  }

  dateInfoLoading.value = true;
  dateInfoError.value = "";

  try {
    console.log(`正在获取日期信息，申报日期: ${declarationDate.value}`);

    const response = await request.get("/api/auxiliaray_date_info", {
      params: {
        date: declarationDate.value,
      },
    });

    if (response.data && response.data.date) {
      dateInfo.value = response.data;
      console.log("日期信息获取成功", response.data);
    } else {
      throw new Error("日期信息接口返回数据格式错误");
    }
  } catch (error) {
    console.error("获取日期信息失败:", error);
    dateInfoError.value =
      error.response?.data?.message || error.message || "获取日期信息失败";
    dateInfo.value = null;
  } finally {
    dateInfoLoading.value = false;
  }
};

// 获取天气数据（曲线图和统计信息）
const fetchWeatherData = async () => {
  if (!declarationDate.value) {
    weatherError.value = "请先选择申报日期";
    return;
  }

  if (!accessToken.value) {
    const token = await fetchAccessToken();
    if (!token) return;
  }

  weatherLoading.value = true;
  weatherError.value = "";

  try {
    console.log(
      `正在获取天气数据，申报日期: ${declarationDate.value}`,
      accessToken.value,
    );

    // 使用Promise.all同时获取两个接口数据
    const [chartResponse, summaryResponse] = await Promise.all([
      request.get("/api/vpp/vpp-manage/v1/weather/chart", {
        params: {
          regionPkId: "440400",
          startDate: declarationDate.value,
          token: accessToken.value,
        },
      }),
      request.get("/api/vpp/vpp-manage/v1/weather/summary", {
        params: {
          regionPkId: "440400",
          startDate: declarationDate.value,
          token: accessToken.value,
        },
      }),
    ]);

    // 处理温度辐照度曲线数据
    if (
      chartResponse.data &&
      chartResponse.data.status === 0 &&
      Array.isArray(chartResponse.data.data)
    ) {
      weatherChartData.value = chartResponse.data.data;
      console.log("温度和辐照度曲线数据获取成功", chartResponse.data.data);
    } else {
      throw new Error("天气曲线接口返回数据格式错误");
    }

    // 处理天气统计信息数据
    if (
      summaryResponse.data &&
      summaryResponse.data.status === 0 &&
      Array.isArray(summaryResponse.data.data)
    ) {
      weatherSummaryData.value = summaryResponse.data.data;
      console.log("天气统计信息数据获取成功", summaryResponse.data.data);
    } else {
      throw new Error("天气统计接口返回数据格式错误");
    }

    weatherError.value = "";
  } catch (error) {
    console.error("获取天气数据失败:", error);
    weatherError.value =
      error.response?.data?.message || error.message || "获取天气数据失败";
    weatherChartData.value = [];
    weatherSummaryData.value = [];
  } finally {
    weatherLoading.value = false;
  }
};

// 处理天气数据导出
const handleWeatherExport = (data) => {
  console.log("导出天气数据:", data);
  // 这里可以实现导出到Excel或下载功能
  alert(
    `天气数据导出成功！\n包含${data.chartData.length}条曲线数据和${data.summaryData.length}条统计信息`,
  );
};

// 获取电价数据
const fetchPriceData = async () => {
  if (!declarationDate.value) {
    priceError.value = "请先选择申报日期";
    return;
  }

  if (!accessToken.value) {
    const token = await fetchAccessToken();
    if (!token) return;
  }

  priceLoading.value = true;
  priceError.value = "";

  try {
    console.log(
      `正在获取电价数据，申报日期: ${declarationDate.value}`,
      accessToken.value,
    );

    const response = await request.get(
      "/api/vpp/vpp-manage/v1/price/analysis/all/price/chart",
      {
        params: {
          startDate: declarationDate.value,
          token: accessToken.value,
        },
      },
    );

    // 处理电价曲线数据
    if (
      response.data &&
      response.data.status === 0 &&
      Array.isArray(response.data.data)
    ) {
      priceChartData.value = response.data.data;
      console.log("电价曲线数据获取成功", response.data);
      console.log("日前预测电价数据:", response.data.data[0].dataList);
    } else {
      throw new Error("电价曲线接口返回数据格式错误");
    }

    priceError.value = "";
  } catch (error) {
    console.error("获取电价数据失败:", error);
    priceError.value =
      error.response?.data?.message || error.message || "获取电价数据失败";
    priceChartData.value = [];
  } finally {
    priceLoading.value = false;
  }
};

// 处理电价数据导出
const handlePriceExport = (data) => {
  console.log("导出电价数据:", data);
  // 这里可以实现导出到Excel或下载功能
  alert(`电价数据导出成功！\n包含${data.priceData.length}条曲线数据`);
};

// 获取统调曲线数据
const fetchUnifiedDispatchData = async () => {
  if (!declarationDate.value) {
    unifiedDispatchError.value = "请先选择申报日期";
    return;
  }

  if (!accessToken.value) {
    const token = await fetchAccessToken();
    if (!token) return;
  }

  unifiedDispatchLoading.value = true;
  unifiedDispatchError.value = "";

  try {
    console.log(
      `正在获取统调曲线数据，申报日期: ${declarationDate.value}`,
      accessToken.value,
    );

    const response = await request.get(
      "/api/vpp/vpp-manage/v1/price/analysis/unified/dispatch/chart",
      {
        params: {
          startDate: declarationDate.value,
          token: accessToken.value,
        },
      },
    );

    // 处理统调曲线数据
    if (
      response.data &&
      response.data.status === 0 &&
      Array.isArray(response.data.data)
    ) {
      unifiedDispatchChartData.value = response.data.data;
      console.log("统调曲线数据获取成功", response.data.data);
    } else {
      throw new Error("统调曲线接口返回数据格式错误");
    }

    unifiedDispatchError.value = "";
  } catch (error) {
    console.error("获取统调曲线数据失败:", error);
    unifiedDispatchError.value =
      error.response?.data?.message || error.message || "获取统调曲线数据失败";
    unifiedDispatchChartData.value = [];
  } finally {
    unifiedDispatchLoading.value = false;
  }
};

// 处理统调曲线数据导出
const handleUnifiedDispatchExport = (data) => {
  console.log("导出统调曲线数据:", data);
  // 这里可以实现导出到Excel或下载功能
  alert(`统调曲线数据导出成功！\n包含${data.chartData.length}条曲线数据`);
};

// 初始化默认值并获取token
onMounted(async () => {
  // 初始化默认申报日期为明天
  declarationDate.value = getTomorrowStr();

  // 获取token
  await fetchAccessToken();

  // 获取日期信息、天气数据、电价数据和统调曲线数据（不获取策略表格数据）
  if (declarationDate.value) {
    await Promise.all([
      fetchDateInfo(),
      fetchWeatherData(),
      fetchPriceData(),
      fetchUnifiedDispatchData(),
    ]);
  }
});

// 监听申报日期变化，重新获取数据
watch(declarationDate, (newDate) => {
  if (newDate) {
    // 获取日期信息、天气数据、电价数据和统调曲线数据（不获取策略表格数据）
    fetchDateInfo();
    fetchWeatherData();
    fetchPriceData();
    fetchUnifiedDispatchData();
  } else {
    dateInfo.value = null;
    dateInfoError.value = "请选择申报日期";
    strategyTableData.value = [];
    strategyError.value = "请选择申报日期";
    weatherChartData.value = [];
    weatherSummaryData.value = [];
    weatherError.value = "请选择申报日期";
    priceChartData.value = [];
    priceError.value = "请选择申报日期";
    unifiedDispatchChartData.value = [];
    unifiedDispatchError.value = "请选择申报日期";
  }
});

// 导航到历史申报页面
const navigateToHistory = () => {
  router.push({ name: "DailyDemandHistory" });
};
//进入收益分析页面
const navigateToAnalysis = () => {
  router.push({
    name: "DailyRevenueAnalysis",
  });
};
</script>

<style lang="scss" scoped>
// 完全保留原始样式，仅将 CSS 转换为 SCSS 嵌套结构，不改变任何视觉表现

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding-left: 20px;
  padding-top: 16px;
  padding-bottom: 16px;
  .header-content {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .title {
      font-size: 1.5em;
      font-weight: 600;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      letter-spacing: -0.3px;
    }
    .badge-wrapper {
      margin-left: 16px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }
  .subtitle {
    color: #475569;
    font-size: 0.95rem;
  }
  .btns {
    margin-right: 20px;
  }
}

.badge {
  background: #eef2ff;
  color: #1e40af;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}
/* 主要配置区域 */
.main-container {
  background: white;
  display: flex;
}

/* 左侧板块：图表信息显示区 */
.left-main-container {
  border: 1px solid #e9edf2;
  display: flex;
  width: 50%;
  flex-direction: column;

  .config-header {
    padding: 12px 16px 8px 16px;
    border-bottom: 1px solid #eff3f8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      &.btn-secondary {
        justify-self: flex-end;
        margin-right: 10px;
        margin-left: auto;
      }
    }

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px 32px;

    &.config-disabled {
      opacity: 0.7;

      input,
      select {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
      }
    }
  }

  .config-section {
    &.left-section {
      .field-group {
        margin-bottom: 16px;
      }
      .date-info-wrapper {
        margin-top: 10px;
      }
    }

    &.middle-section {
      border-left: 1px solid #e9edf2;
      padding-left: 20px;
    }
  }

  .strategy-table-hint {
    padding: 16px;
    margin: 16px;

    .hint-content {
      flex-direction: column;
      text-align: center;
      gap: 12px;

      .hint-icon {
        width: 40px;
        height: 40px;
        font-size: 20px;
        background: #718096;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(113, 128, 150, 0.2);
        transition: all 0.3s ease;
      }

      p {
        font-size: 14px;
      }
    }
  }
}

.right-main-container {
  border: 1px solid #e9edf2;
  display: flex;
  width: 50%;
  flex-direction: column;
}

/* 策略表格样式 */
.strategy-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  span {
    color: #475569;
    font-size: 14px;
    font-weight: 500;
  }
}

.strategy-error {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  border: 1px solid #fbbf24;

  .error-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .error-content {
    flex: 1;

    strong {
      display: block;
      font-size: 16px;
      color: #92400e;
      margin-bottom: 8px;
    }

    p {
      color: #b45309;
      font-size: 14px;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .btn-retry {
      background: #d97706;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #b45309;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(212, 126, 10, 0.3);
      }
    }
  }
}

/* 电价图表样式 */
.price-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  span {
    color: #475569;
    font-size: 14px;
    font-weight: 500;
  }
}

.price-error {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  border: 1px solid #fbbf24;

  .error-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .error-content {
    flex: 1;

    strong {
      display: block;
      font-size: 16px;
      color: #92400e;
      margin-bottom: 8px;
    }

    p {
      color: #b45309;
      font-size: 14px;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .btn-retry {
      background: #d97706;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #b45309;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(212, 126, 10, 0.3);
      }
    }
  }
}

.unified-dispatch-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  span {
    color: #475569;
    font-size: 14px;
    font-weight: 500;
  }
}

.unified-dispatch-error {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: 12px;
  border: 1px solid #fbbf24;

  .error-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .error-content {
    flex: 1;

    strong {
      display: block;
      font-size: 16px;
      color: #92400e;
      margin-bottom: 8px;
    }

    p {
      color: #b45309;
      font-size: 14px;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .btn-retry {
      background: #d97706;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #b45309;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(212, 126, 10, 0.3);
      }
    }
  }
}

.strategy-table {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.strategy-table-hint {
  margin-top: 20px;
  background: #f8f9fa;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .hint-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .hint-icon {
      font-size: 24px;
      flex-shrink: 0;
      background: #718096;
      color: white;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 8px rgba(113, 128, 150, 0.2);
      transition: all 0.3s ease;

      .strategy-table-hint:hover & {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(113, 128, 150, 0.3);
      }
    }

    p {
      margin: 0;
      font-size: 15px;
      line-height: 1.5;
      color: #4a5568;
      font-weight: 500;
    }
  }
}
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 16px 8px 16px;
  border-bottom: 1px solid #eff3f8;
  h2 {
    justify-self: flex-start;
    margin-right: auto;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
/* 结果展示区域 */
.result-section {
  background: white;
  border: 1px solid #e9edf2;
  .result-header {
    border-bottom: 1px solid #eff3f8;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    .run-id {
      margin-left: 20px;
      background: #e9ecef;
      padding: 1px 8px;
      border-radius: 6px;
      font-size: 0.7rem;
    }
    .btn {
      justify-self: flex-end;
      margin-left: auto;
      cursor: pointer;
    }
  }

  #resultContainer {
    padding: 16px;
  }
}

.field-group {
  margin-bottom: 16px;

  label {
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #1e293b;

    .tooltip {
      font-size: 0.7rem;
      font-weight: 400;
      background: #eef2ff;
      padding: 1px 6px;
      border-radius: 4px;
      color: #2563eb;
      cursor: help;
    }
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #cfdee9;
    border-radius: 6px;
    font-size: 0.8rem;
    transition: 0.2s;
    background: #fff;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
  }
}

.probability-config {
  background: #f8fafc;
  border: 1px solid #e9edf2;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;

  .config-row {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-item {
    .config-label {
      font-size: 0.7rem;
      margin-bottom: 3px;
      font-weight: 500;
    }
  }
}
.probability-method {
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  background: #f1f5f9;
  color: #1e293b;

  &.btn-primary {
    background: #2563eb;
    color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
  }

  &.btn-secondary {
    background: #f8fafc;
    border: 1px solid #cbd5e1;

    &:hover {
      background: #eef2ff;
      border-color: #94a3b8;
    }
  }

  &.small {
    padding: 4px 10px;
    font-size: 0.7rem;
  }
}

.submit-btn {
  background: linear-gradient(95deg, #1e4620, #2a6e3a);
  color: white;
  padding: 10px 24px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:disabled {
    opacity: 0.6;
    transform: none;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 6px;
    vertical-align: middle;
  }
}

.result-area,
.error-box,
.loading-state {
  background: #f8fafd;
  border-radius: 8px;
  padding: 16px;
}

.download-link {
  background: #e6f9ed;
  border-left: 4px solid #2b9348;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  .link-url {
    word-break: break-all;
    font-family: monospace;
    font-size: 0.7rem;
    background: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    display: inline-block;
    margin-top: 6px;
  }

  .download-btn {
    background: #0b5e2e;
    text-decoration: none;
    display: inline-block;
    margin-right: 16px;
  }
}

.error-box {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
  color: #c53030;

  details {
    margin-top: 10px;
  }

  .error-hint {
    margin-top: 12px;
    font-size: 0.8rem;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #2c3e66;
  font-size: 0.8rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

hr {
  margin: 12px 0;
  border-color: #eef2f8;
}

.payload-summary {
  cursor: pointer;
  font-size: 0.7rem;
  color: #4b5563;
}

.payload-preview {
  background: #1e293b;
  color: #e2e8f0;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.65rem;
  margin-top: 10px;
}

footer {
  text-align: center;
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 16px;
}

.action-btn {
  margin-left: 10px;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;

  &.btn-warning {
    background-color: #f59e0b;
    color: white;

    &:hover:not(:disabled) {
      background-color: #d97706;
    }
  }

  &.btn-success {
    background-color: #10b981;
    color: white;

    &:hover:not(:disabled) {
      background-color: #059669;
    }
  }

  &.btn-secondary {
    background-color: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.undo-btn {
  margin-bottom: 16px;
  display: inline-block;
}

@media (max-width: 700px) {
  body {
    padding: 16px 12px;
  }
  .card-body {
    padding: 14px;
  }
  .config-grid {
    grid-template-columns: 1fr;
  }
  .config-section {
    &.middle-section {
      border-left: none;
      padding-left: 0;
      border-top: 1px solid #e9edf2;
      padding-top: 16px;
    }
  }
}
</style>
