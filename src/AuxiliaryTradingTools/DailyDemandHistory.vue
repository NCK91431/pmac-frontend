<template>
  <!-- 头部 -->
  <div class="header-wrapper">
    <div class="header">
      <div class="header-content">
        <div class="title">⚡ 每日需求申报历史</div>
      </div>
      <div class="subtitle">
        查看每日需求申报历史记录，包括申报日期、申报公司、申报量、电价等信息
      </div>
    </div>
    <!-- 日期选择器区域 -->
    <div class="date-picker-container">
      <div class="title">
        <icon><Calendar /></icon>
        <span>请选择申报日期:</span>
      </div>
      <el-date-picker
        v-model="declarationDate"
        type="date"
        placeholder="选择申报日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :disabled-date="disabledDate"
        :clearable="false"
        :editable="false"
        size="large"
        class="history-date-picker"
      >
        <template #prefix>
          <el-icon><Calendar /></el-icon>
        </template>
      </el-date-picker>

      <div class="date-display" v-if="declarationDate">
        <span class="date-label">当前选择：</span>
        <span class="date-value">{{ currentTargetDate }}</span>
      </div>
    </div>
  </div>

  <div class="main-container">
    <!---------------------------- 左侧板块：三大图表显示区---------------------------- -->
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

    <!---------------------------- 右侧板块：主要参数配置区---------------------------- -->

    <div class="left-main-container">
      <!-- 加载状态（至少显示2秒钟） -->
      <div v-if="historyLoading" class="history-loading">
        <div class="spinner"></div>
        <span>⏳ 正在加载历史申报记录...</span>
      </div>
      <template v-else>
        <template v-if="hasHistoryFlag">
          <!-- 上面：配置网格 -->
          <div class="config-container">
            <div class="config-header">
              <h2>🔨 参数配置</h2>
            </div>
            <!-- 申报参数配置展示组件 -->
            <ConfigDisplay
              :dateInfo="dateInfo"
              :loadMode="historyData?.load_mode || loadMode"
              :probabilityWindow="
                historyData?.probability_window || probabilityWindow
              "
              :modeDeclaration="
                historyData?.probability_window?.mode_declaration ||
                mode_declaration
              "
            />
          </div>
          <!-- 中间：申报表格 -->
          <div class="table-header">
            <h2>🗓️ 申报表格</h2>
          </div>
          <div class="table-container">
            <!-- 加载状态 -->
            <div v-if="strategyLoading" class="strategy-loading">
              <div class="spinner"></div>
              <span>⏳ 正在加载建议申报策略表格数据...</span>
            </div>
            <!-- 只读申报策略表格 -->
            <OnlyReadStrategyTable
              v-else-if="historyData?.strategy_table_data"
              :tableData="historyData.strategy_table_data"
              :ratios="historyData.ratio_settings || []"
            />
            <!-- 无数据提示 -->
            <div v-else class="no-data-hint">
              <span class="hint-icon">📊</span>
              <p>暂无申报策略表格数据</p>
            </div>
          </div>
          <!-- 下面：Excel报表链接下载区 -->
          <div class="result-section">
            <div class="result-area">
              <div class="result-header">
                <div class="title-bar">📎 申报结果 & 下载</div>
                <span class="run-id"
                  >Run ID: {{ historyData?.file_info?.run_id || "—" }}</span
                >
              </div>
              <div v-if="historyData?.file_info?.url" class="download-link">
                <div>
                  📄 <strong>Excel 日前需求申报表</strong><br />
                  <span class="link-url">{{
                    historyData?.file_info?.url
                  }}</span>
                </div>
                <div>
                  <button
                    class="btn btn-primary download-btn"
                    @click="
                      downloadFile(
                        historyData?.file_info?.url,
                        historyData?.file_info?.file_name,
                      )
                    "
                  >
                    📥 下载文件
                  </button>
                  <button
                    class="btn btn-secondary"
                    @click="copyToClipboard(historyData?.file_info?.url)"
                  >
                    📋 复制链接
                  </button>
                </div>
              </div>
              <div v-else class="error-box">
                ⚠️ 未返回文件下载链接，请检查日志
              </div>
              <hr />
            </div>
          </div>
        </template>
        <!-- 无历史记录提示 -->
        <template v-else>
          <div class="no-data-hint">
            <span class="hint-icon">📊</span>
            <p>暂无申报历史记录</p>
          </div>
        </template>
      </template>
    </div>
  </div>
  <footer>🌟 基于EMS历史负荷数据预测 | 文件链接有效期24小时</footer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request"; // 根据实际路径调整
import { ElMessage, ElMessageBox } from "element-plus";
import OnlyReadStrategyTable from "./components/OnlyReadStrategyTable.vue";
import WeatherInfo from "./components/WeatherInfo.vue";
import PriceChart from "./components/PriceChart.vue";
import UnifiedDispatchChart from "./components/UnifiedDispatchChart.vue";
import { Calendar } from "@element-plus/icons-vue";
import ConfigDisplay from "./components/ConfigDisplay.vue";

// ---------- 响应式数据 ----------
const declarationDate = ref("");
const loadMode = ref("算法预测");
const probabilityWindow = ref({ type: "all" });
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

// 历史记录数据
const historyLoading = ref(false);
const historyError = ref("");
const historyData = ref(null);

// 计算当前选择的申报日期
const currentTargetDate = computed(() => {
  if (!declarationDate.value) {
    return "未选择申报日期（必填）";
  }
  const [year, month, day] = declarationDate.value.split("-");
  return `${year}年${month}月${day}日`;
});

// ---------- 辅助函数 ----------
function getTomorrowStr() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

// 日期选择器禁用日期规则（禁用今天之后的日期）
function disabledDate(time) {
  // 禁用明天之后的日期（即只能选择今天及明天的日期）
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return time.getTime() > tomorrow.getTime();
}

// 复制链接
function copyToClipboard(text) {
  if (!text) {
    ElMessage.warning("链接为空，无法复制");
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success("链接已复制到剪贴板");
    })
    .catch((err) => {
      console.error("复制失败:", err);
      ElMessage.error("复制失败，请手动复制");
    });
}

// 通过二进制流下载文件（带认证令牌）
async function downloadFile(url, fileName) {
  if (!url) {
    ElMessage.warning("下载链接为空");
    return;
  }
  try {
    const response = await request.get(url, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "download.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    ElMessage.success("文件下载成功");
  } catch (error) {
    console.error("文件下载失败:", error);
    ElMessage.error(
      error.response?.data?.message || "文件下载失败，请稍后重试",
    );
  }
}
// 获取历史申报记录
const hasHistoryFlag = ref(false); //True or False
async function fetchHistoryRecord(date) {
  try {
    historyLoading.value = true;
    historyError.value = "";

    // 创建一个2秒的延迟Promise
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    // 并行执行API请求和延迟
    const [response] = await Promise.all([
      request.get(`/api/daily-declaration/history`, {
        params: { date },
      }),
      delayPromise,
    ]);

    hasHistoryFlag.value = response.data.success; //True or False
    if (response.data.success && response.data.declaration) {
      historyData.value = response.data.declaration;
      // 如果历史记录中包含策略表格数据，可以更新表格
      if (response.data.declaration.strategy_table_data) {
        // 这里可以更新策略表格数据
        // strategyTableData.value = response.declaration.strategy_table_data;
      }

      // 如果历史记录中包含用户调整比例，可以更新ratios
      if (response.declaration.ratio_settings) {
        // ratios.value = response.declaration.ratio_settings;
      }
    }

    return response;
  } catch (error) {
    console.error("加载历史记录失败:", error);
    historyError.value = error.message || "加载历史记录失败";

    // 如果是401未登录，可以提示用户登录
    if (error.response?.status === 401) {
      ElMessage.warning("请先登录后再查看历史记录");
    }

    // 如果是404无记录，暂时不处理（用户要求先不判断是否有历史记录）

    return null;
  } finally {
    historyLoading.value = false;
  }
}

/* ------------------------ End  ------------------------  */

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

    // 加载历史记录数据
    fetchHistoryRecord(declarationDate.value);
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

    // 清空历史记录数据
    historyData.value = null;
    historyError.value = "";
  }
});
</script>

<style lang="scss" scoped>
// 完全保留原始样式，仅将 CSS 转换为 SCSS 嵌套结构，不改变任何视觉表现

.header-wrapper {
  background-color: white;
  padding-left: 20px;
  padding-top: 16px;
  padding-bottom: 16px;
  display: flex;
  justify-content: space-between;
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
    margin-bottom: 20px;
  }

  .date-picker-container {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-right: 15px;

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #1e3c72;
      letter-spacing: -0.2px;

      icon {
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 16px;
          height: 16px;
          color: #409eff;
        }
      }
    }

    .history-date-picker {
      width: 220px;

      :deep(.el-input__wrapper) {
        border-radius: 8px;
        border: 1px solid #dcdfe6;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
        }

        .el-input__prefix {
          display: flex;
          align-items: center;
          padding-left: 10px;
          color: #409eff;
        }
      }

      :deep(.el-input__inner) {
        font-weight: 500;
        color: #2c3e50;
      }
    }

    .date-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: linear-gradient(135deg, #f0f7ff, #e6f7ff);
      border-radius: 8px;
      border: 1px solid #d1e9ff;

      .date-label {
        color: #666;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .date-value {
        color: #1e3c72;
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.3px;
      }
    }
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
  .table-header {
    padding: 12px 16px 8px 16px;
    border-top: 1px solid #eff3f8;
    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
  .table-container {
    padding: 0 15px;
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

/* 无数据提示样式 */
.history-loading,
.no-data-hint {
  margin: 30px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;

  .hint-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.7;
  }

  p {
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
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
  justify-self: flex-start;
  margin-right: auto;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
/* 结果展示区域 */
.result-section {
  margin: 30px 15px;
  background: white;
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

footer {
  background-color: #f8fafc;
  text-align: center;
  font-size: 0.7rem;
  color: #6c757d;
  padding: 12px 0;
}
</style>
