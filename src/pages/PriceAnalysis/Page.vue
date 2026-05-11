<template>
  <div class="price-analysis-container" :style="containerStyle">
    <div class="analysis-content" :class="{ collapsed: isCollapsed }">
      <!-- 左侧：节点树 -->
      <div class="left-panel" :class="{ collapsed: isCollapsed }">
        <NodeTree
          :nodes="nodeTreeData"
          @node-select="handleNodeSelect"
          :cur_node_id="cur_node_id"
          @toggle-collapse="handleToggleCollapse"
        />
      </div>
      <!-- 固定位置的展开/折叠按钮 -->
      <div
        class="collapse-toggle-btn"
        :class="{ expanded: !isCollapsed }"
        @click="toggleSidebar"
      >
        <i
          class="bi"
          :class="isCollapsed ? 'bi-arrow-right' : 'bi-arrow-left'"
        ></i>
      </div>
      <div class="main-wrapper">
        <!-- 控制条 -->
        <div class="control-bar">
          <div class="control-bar-left">
            <!-- 模式选择 -->
            <el-radio-group v-model="mode" @change="handleModeChange">
              <el-radio-button value="single">单日模式</el-radio-button>
              <el-radio-button value="single-history"
                >溯前30天模式</el-radio-button
              >
              <el-radio-button value="multi">多日模式</el-radio-button>
              <el-radio-button value="analysis"
                >单节点与省份节点对比模式</el-radio-button
              >
              <el-radio-button value="pv-capture">光伏捕获电价</el-radio-button>
              <el-radio-button value="multi-pv-capture"
                >多日光伏捕获电价</el-radio-button
              >
            </el-radio-group>
            <!-- 日期选择器 -->
            <div class="date-picker-container">
              <i class="bi bi-calendar"></i>
              <!-- 单日/光伏捕获电价模式下显示 -->
              <template
                v-if="
                  mode === 'single' ||
                  mode === 'single-history' ||
                  mode === 'pv-capture'
                "
              >
                <el-date-picker
                  v-model="selectedDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </template>
              <!-- 多日模式/分析模式/多日光伏捕获电价模式下显示 -->
              <template v-else>
                <el-date-picker
                  v-model="selectedDateRange"
                  type="daterange"
                  placeholder="选择日期范围"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                  @change="handleDateRangeChange"
                />
              </template>
            </div>
          </div>
          <div class="control-bar-right">
            <div
              class="time-type-selector"
              v-if="
                mode == 'single' ||
                mode == 'single-history' ||
                mode == 'pv-capture'
              "
            >
              <i class="bi bi-clock"></i>
              <el-radio-group v-model="timeType" @change="handleTimeTypeChange">
                <el-radio-button label="minute">96点</el-radio-button>
                <el-tooltip
                  effect="dark"
                  content="此值为96个点中每四个点算出一个平均值"
                  placement="top"
                >
                  <el-radio-button label="compute">24点</el-radio-button>
                </el-tooltip>
              </el-radio-group>
            </div>
            <!-- 这里在切换模式的情况下，单日模式调用exportToExcel，多日模式/分析模式调用exportToExcelRange -->
            <el-button
              type="primary"
              plain
              size="small"
              v-if="
                mode !== 'multi-pv-capture' || multiPvCaptureRef?.hasCompleted
              "
              @click="handleExportData()"
              :loading="exportLoading"
            >
              <i class="bi bi-download"></i> 导出数据
            </el-button>
          </div>
        </div>
        <!-- 主要内容区域：图表和表格 -->
        <div
          class="main"
          :class="{
            'multi-day':
              mode === 'multi' ||
              mode === 'analysis' ||
              mode === 'multi-pv-capture',
          }"
        >
          <!-- 单日模式 -->
          <template v-if="mode === 'single'">
            <!-- 中间：图表区域 -->
            <div class="middle-panel">
              <div class="chart-container">
                <ChartInfoBar
                  type="date"
                  :navText="nav_text"
                  :dateValue="dateInfo.dateValue"
                  :weekday="dateInfo.weekday"
                  :dateType="dateInfo.dateType"
                />
                <div
                  v-loading="chartLoading"
                  element-loading-text="图表数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  class="charts-wrapper"
                >
                  <div class="chart-item" ref="priceChartItem">
                    <template v-if="timeType === 'compute'">
                      <PriceChartCompute
                        ref="priceChartRef"
                        :dayAheadData="currentDayAheadData"
                        :realTimeData="currentRealTimeData"
                        :nodeName="selectedNodeName"
                        :chartHeight="chartItemHeight"
                      />
                    </template>
                    <template v-else>
                      <PriceChart
                        ref="priceChartRef"
                        :dayAheadData="currentDayAheadData"
                        :realTimeData="currentRealTimeData"
                        :nodeName="selectedNodeName"
                        :chartHeight="chartItemHeight"
                      />
                    </template>
                  </div>
                  <div class="chart-item" ref="spreadChartItem">
                    <template v-if="timeType === 'compute'">
                      <PriceSpreadChartCompute
                        ref="spreadChartRef"
                        :dayAheadData="currentDayAheadData"
                        :realTimeData="currentRealTimeData"
                        :nodeName="selectedNodeName"
                        :chartHeight="chartItemHeight"
                      />
                    </template>
                    <template v-else>
                      <PriceSpreadChart
                        ref="spreadChartRef"
                        :dayAheadData="currentDayAheadData"
                        :realTimeData="currentRealTimeData"
                        :nodeName="selectedNodeName"
                        :timeType="timeType"
                        :chartHeight="chartItemHeight"
                      />
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：表格区域 -->
            <div class="right-panel">
              <div class="table-container">
                <div
                  v-loading="tableLoading"
                  element-loading-text="表格数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  style="height: 100%; width: 100%"
                >
                  <PriceTable
                    :dayAheadData="currentDayAheadData"
                    :realTimeData="currentRealTimeData"
                    :timeType="timeType"
                  />
                </div>
              </div>
            </div>
          </template>
          <!-- 溯前30天模式 -->
          <template v-else-if="mode === 'single-history'">
            <div class="middle-panel">
              <div class="chart-container">
                <ChartInfoBar
                  type="history"
                  :navText="nav_text"
                  :dateRange="historyDateRange"
                />
                <div
                  v-loading="historyChartLoading"
                  element-loading-text="图表数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  class="history-charts-wrapper"
                >
                  <div class="history-chart-item" ref="historyAvgChartItem">
                    <MultiDayAverageChart
                      ref="historyAvgChartRef"
                      :dateRange="historyDateRange"
                      :priceData="historyChartProcessedData"
                    />
                  </div>
                  <div class="history-chart-item" ref="historySpreadChartItem">
                    <MultiDayAverageSpreadChart
                      ref="historySpreadChartRef"
                      :dateRange="historyDateRange"
                      :priceData="historyChartProcessedData"
                    />
                  </div>
                  <div
                    class="history-chart-item"
                    ref="historyTimeSpreadChartItem"
                  >
                    <ThirtyDayTimeSpreadChart
                      ref="historyTimeSpreadChartRef"
                      :timeSpreadData="historyDisplayTimeSpreadAvg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="right-panel">
              <div class="table-container">
                <div
                  v-loading="historyTableLoading"
                  element-loading-text="表格数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  style="height: 100%; width: 100%"
                >
                  <ThirtyDayTable
                    :tableData="historyDisplayTableData"
                    :timeType="timeType"
                    :nodeName="selectedNodeName"
                    :endDate="historyEndDate"
                  />
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="mode === 'multi'">
            <!-- 多日模式 -->
            <MultiDayView
              ref="multiDayViewRef"
              :node-id="selectedNodeId"
              :node-name="selectedNodeName"
              :date-range="selectedDateRange"
            />
          </template>
          <template v-else-if="mode === 'analysis'">
            <!-- 单节点与省份节点对比模式 -->
            <SingleNodeAnalysis
              ref="analysisViewRef"
              :node-id="selectedNodeId"
              :node-name="selectedNodeName"
              :date-range="selectedDateRange"
            />
          </template>
          <template v-else-if="mode === 'pv-capture'">
            <!-- 中间：图表区域 -->
            <div class="middle-panel">
              <div class="chart-container">
                <div
                  v-loading="chartLoading"
                  element-loading-text="图表数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  class="charts-wrapper"
                >
                  <div class="chart-item" ref="pvCaptureChartItem">
                    <PvCapturePriceChart
                      ref="pvCaptureChartRef"
                      :dayAheadCaptureData="pvDisplayDayAheadCapture"
                      :realTimeCaptureData="pvDisplayRealTimeCapture"
                      :dayAheadOriginalData="pvDisplayDayAheadOriginal"
                      :realTimeOriginalData="pvDisplayRealTimeOriginal"
                      :irradianceData="pvIrradianceData"
                      :nodeName="nav_text"
                      :chartHeight="chartItemHeight"
                      :dayAheadCaptureAvg="pvDisplayDayAheadCaptureAvg"
                      :realTimeCaptureAvg="pvDisplayRealTimeCaptureAvg"
                      :dateValue="selectedDate"
                      :weekday="dateInfo.weekday"
                      :dateType="dateInfo.dateType"
                      :timeType="timeType"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：表格区域 -->
            <div class="right-panel">
              <div class="table-container">
                <div
                  v-loading="tableLoading"
                  element-loading-text="表格数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  style="height: 100%; width: 100%"
                >
                  <PvCapturePriceTable
                    :dayAheadOriginalData="pvDisplayDayAheadOriginal"
                    :realTimeOriginalData="pvDisplayRealTimeOriginal"
                    :dayAheadCaptureData="pvDisplayDayAheadCapture"
                    :realTimeCaptureData="pvDisplayRealTimeCapture"
                    :irradianceData="pvIrradianceData"
                    :timeType="timeType"
                  />
                </div>
              </div>
            </div>
          </template>
          <!-- 多日光伏捕获电价模式 -->
          <template v-else-if="mode === 'multi-pv-capture'">
            <MultiDayPvCaptureAnalysis
              ref="multiPvCaptureRef"
              :node-id="selectedNodeId"
              :node-name="selectedNodeName"
              :date-range="selectedDateRange"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  inject,
  nextTick,
  onBeforeUnmount,
} from "vue";
import NodeTree from "./components/NodeTree.vue";
import PriceChart from "./components/PriceChart.vue";
import PriceSpreadChart from "./components/PriceSpreadChart.vue";
import PriceChartCompute from "./components/PriceChartCompute.vue";
import PriceSpreadChartCompute from "./components/PriceSpreadChartCompute.vue";
import PriceTable from "./components/PriceTable.vue";
import * as XLSX from "xlsx";
import request from "@/utils/request";
import { ElMessage, ElLoading } from "element-plus";
import MultiDayView from "./components/MultiDayView.vue";
import SingleNodeAnalysis from "./components/SingleNodeAnalysis.vue";
import PvCapturePriceChart from "./components/PvCapturePriceChart.vue";
import PvCapturePriceTable from "./components/PvCapturePriceTable.vue";
import ChartInfoBar from "./components/ChartInfoBar.vue";
import MultiDayPvCaptureAnalysis from "./components/MultiDayPvCaptureAnalysis.vue";
import MultiDayAverageChart from "./components/MultiDayAverageChart.vue";
import MultiDayAverageSpreadChart from "./components/MultiDayAverageSpreadChart.vue";
import ThirtyDayTimeSpreadChart from "./components/ThirtyDayTimeSpreadChart.vue";
import ThirtyDayTable from "./components/ThirtyDayTable.vue";

// 注入高度
const headerHeight = inject("headerHeight", 0);
const breadcrumbHeight = inject("breadcrumbHeight", 0);

// 计算容器高度
const containerStyle = computed(() => {
  const totalHeight = `calc(100vh - ${headerHeight.value}px - ${breadcrumbHeight.value}px)`;
  return {
    height: totalHeight,
    overflow: "hidden",
  };
});

// 计算前天的日期（格式：YYYY-MM-DD）
function getTwoDaysAgoDate() {
  const date = new Date();
  date.setDate(date.getDate() - 2); // 减去2天
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 计算前天往前7天的日期范围（包含前天）
function getDefaultDateRange() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2); // 前天

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // 往前6天，加上前天共7天

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return [formatDate(startDate), formatDate(endDate)];
}

// 计算日期信息
const dateInfo = computed(() => {
  if (!selectedDate.value) {
    return {
      dateValue: "",
      weekday: "",
      dateType: "",
    };
  }

  const date = new Date(selectedDate.value);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = `星期${weekdays[date.getDay()]}`;
  const day = date.getDay();
  const dateType = day === 0 || day === 6 ? "weekend" : "weekday";

  return {
    dateValue: selectedDate.value,
    weekday,
    dateType,
  };
});

// 响应式数据
const selectedNodeName = ref("请选择节点");
const selectedNodeId = ref("");
const selectedDate = ref(getTwoDaysAgoDate()); // 默认选中前天
const timeType = ref("minute");
const currentDayAheadData = ref([]);
const currentRealTimeData = ref([]);

// 光伏捕获电价数据
const pvDayAheadCaptureData = ref([]);
const pvRealTimeCaptureData = ref([]);
const pvDayAheadOriginalData = ref([]);
const pvRealTimeOriginalData = ref([]);

// 溯前30天模式数据
const historyPriceData = ref(null);
const historyDateRange = ref(null);
const historyChartLoading = ref(false);
const historyTableLoading = ref(false);
// 辐照度固定从 weights.json 取值，完全不依赖 API
const PV_WEIGHTS = {
  hourly_weights: [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.02, 0.05, 0.1, 0.14, 0.16, 0.17, 0.15,
    0.12, 0.07, 0.02, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  ],
  quarter_hourly_weights: [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.022, 0.039,
    0.06, 0.085, 0.114, 0.146, 0.182, 0.221, 0.263, 0.308, 0.355, 0.404, 0.455,
    0.507, 0.559, 0.612, 0.664, 0.715, 0.764, 0.811, 0.855, 0.896, 0.933, 0.966,
    0.994, 1.0, 0.994, 0.979, 0.957, 0.929, 0.896, 0.859, 0.819, 0.777, 0.733,
    0.688, 0.642, 0.596, 0.55, 0.504, 0.46, 0.417, 0.376, 0.337, 0.3, 0.265,
    0.232, 0.202, 0.174, 0.148, 0.125, 0.104, 0.085, 0.068, 0.053, 0.04, 0.029,
    0.02, 0.012, 0.006, 0.002, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
  ],
};
const pvIrradianceData = computed(() => {
  return timeType.value === "compute"
    ? PV_WEIGHTS.hourly_weights
    : PV_WEIGHTS.quarter_hourly_weights;
});

function aggregateToHourly(arr) {
  const result = [];
  for (let i = 0; i < 24; i++) {
    let sum = 0;
    for (let j = 0; j < 4; j++) {
      sum += arr[i * 4 + j] || 0;
    }
    result.push(sum / 4);
  }
  return result;
}

function computeHourlyCapture(originalArr) {
  const hourlyAvg = aggregateToHourly(originalArr);
  return hourlyAvg.map((avg, i) => PV_WEIGHTS.hourly_weights[i] * avg);
}

const pvDisplayDayAheadOriginal = computed(() => {
  if (timeType.value !== "compute") return pvDayAheadOriginalData.value;
  return aggregateToHourly(pvDayAheadOriginalData.value);
});

const pvDisplayRealTimeOriginal = computed(() => {
  if (timeType.value !== "compute") return pvRealTimeOriginalData.value;
  return aggregateToHourly(pvRealTimeOriginalData.value);
});

const pvDisplayDayAheadCapture = computed(() => {
  if (timeType.value !== "compute") return pvDayAheadCaptureData.value;
  return computeHourlyCapture(pvDayAheadOriginalData.value);
});

const pvDisplayRealTimeCapture = computed(() => {
  if (timeType.value !== "compute") return pvRealTimeCaptureData.value;
  return computeHourlyCapture(pvRealTimeOriginalData.value);
});

const pvDisplayDayAheadCaptureAvg = computed(() => {
  const data = pvDisplayDayAheadCapture.value;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0);
});

const pvDisplayRealTimeCaptureAvg = computed(() => {
  const data = pvDisplayRealTimeCapture.value;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0);
});

const pvDayAheadCaptureAvg = ref(0);
const pvRealTimeCaptureAvg = ref(0);

// 计算溯前30天日期范围
const computeHistoryDateRange = (endDate) => {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  const format = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return [format(start), format(end)];
};

const historyEndDate = computed(() => {
  return historyDateRange.value ? historyDateRange.value[1] : "";
});

const historyChartProcessedData = computed(() => {
  return historyPriceData.value?.processedData || [];
});

const historyDisplayTimeSpreadAvg = computed(() => {
  if (!historyPriceData.value) return [];
  return timeType.value === "compute"
    ? historyPriceData.value.timeSpreadAvg_compute_hour
    : historyPriceData.value.timeSpreadAvg_quarter;
});

const historyDisplayTableData = computed(() => {
  if (!historyPriceData.value) return [];
  return timeType.value === "compute"
    ? historyPriceData.value.tableData_compute_hour
    : historyPriceData.value.tableData_quarter;
});
const nodeTreeData = ref([]);
const cur_node_id = ref(""); //当前被选中的节点ID
const cur_chain = ref([]); //当前被选中节点的路径

// 左侧面板折叠状态
const isCollapsed = ref(localStorage.getItem("nodeTreeCollapsed") === "true");

// 处理折叠状态变化
function handleToggleCollapse(collapsed) {
  isCollapsed.value = collapsed;
  saveCollapseState();
  // 触发图表重绘
  setTimeout(() => {
    updateChartItemHeight();
  }, 300);
}

// 切换侧边栏状态
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
  saveCollapseState();
  // 触发图表重绘
  setTimeout(() => {
    updateChartItemHeight();
  }, 300);
}

// 保存折叠状态到localStorage
function saveCollapseState() {
  localStorage.setItem("nodeTreeCollapsed", isCollapsed.value);
}

const chartLoading = ref(false); // 图表加载状态
const tableLoading = ref(false); // 表格加载状态
const exportLoading = ref(false); // 导出按钮加载状态

const mode = ref("single"); // 模式：single 单日模式，multi 多日模式，analysis 单节点与省份节点对比模式

// 切换模式
const handleModeChange = (newMode) => {
  if (newMode === "single-history") {
    if (selectedNodeId.value && selectedDate.value) {
      fetchHistoryData(selectedNodeId.value, selectedDate.value);
    }
  } else if (
    newMode === "pv-capture" &&
    selectedNodeId.value &&
    selectedDate.value
  ) {
    fetchPvCapturePriceData(selectedNodeId.value, selectedDate.value);
  }
  // 切换模式后触发图表resize
  setTimeout(() => {
    updateChartItemHeight();
  }, 300);
};

const selectedDateRange = ref(getDefaultDateRange()); // 多日模式下选中的日期范围

// 日期禁用函数
const disabledDate = (time) => {
  // 将传入的时间转为日期字符串（YYYY-MM-DD）以便比较
  const dateStr = formatDate(time);

  // 今天日期字符串
  const todayStr = formatDate(new Date());

  // 1. 禁用未来日期
  if (dateStr > todayStr) {
    return true;
  }

  // 2. 如果已经选择了开始日期，但还没有选择结束日期，则限制结束日期的可选范围为前后7天
  if (
    selectedDateRange.value &&
    selectedDateRange.value[0] &&
    !selectedDateRange.value[1]
  ) {
    const startStr = selectedDateRange.value[0];
    const startDate = new Date(startStr + "T00:00:00"); // 避免时区问题

    // 计算开始日期前后7天的范围
    const minDate = new Date(startDate);
    minDate.setDate(startDate.getDate() - 6); // 7天范围，所以减去6天
    const maxDate = new Date(startDate);
    maxDate.setDate(startDate.getDate() + 6); // 7天范围，所以加上6天

    const minDateStr = formatDate(minDate);
    const maxDateStr = formatDate(maxDate);

    // 如果日期小于最小日期或大于最大日期，则禁用
    if (dateStr < minDateStr || dateStr > maxDateStr) {
      return true;
    }
  }

  // 其他情况（未选开始，或已选完范围）仅受未来日期限制
  return false;
};

// 辅助函数：将 Date 对象转为 YYYY-MM-DD 格式
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 处理多日模式下日期范围改变
const handleDateRangeChange = (val) => {
  selectedDateRange.value = val;
};

// 图表容器引用和高度
const priceChartItem = ref(null);
const spreadChartItem = ref(null);
const chartItemHeight = ref(350); // 默认高度

// 图表组件引用
const priceChartRef = ref(null);
const spreadChartRef = ref(null);
const multiDayViewRef = ref(null);
const analysisViewRef = ref(null);
const pvCaptureChartRef = ref(null);
const pvCaptureChartItem = ref(null);
const multiPvCaptureRef = ref(null);

// 溯前30天模式图表引用
const historyAvgChartRef = ref(null);
const historySpreadChartRef = ref(null);
const historyTimeSpreadChartRef = ref(null);
const historyAvgChartItem = ref(null);
const historySpreadChartItem = ref(null);
const historyTimeSpreadChartItem = ref(null);

// 图表重绘函数
const updateChartItemHeight = () => {
  // 直接触发图表resize以适应新的宽度
  if (mode.value === "single") {
    // 单日模式
    if (priceChartRef.value) {
      priceChartRef.value.resize();
    }
    if (spreadChartRef.value) {
      spreadChartRef.value.resize();
    }
  } else if (mode.value === "single-history") {
    // 溯前30天模式
    if (historyAvgChartRef.value) {
      historyAvgChartRef.value.resize();
    }
    if (historySpreadChartRef.value) {
      historySpreadChartRef.value.resize();
    }
    if (historyTimeSpreadChartRef.value) {
      historyTimeSpreadChartRef.value.resize();
    }
  } else if (mode.value === "multi") {
    // 多日模式
    if (multiDayViewRef.value) {
      multiDayViewRef.value.resize();
    }
  } else if (mode.value === "analysis") {
    // 单节点与省份节点对比模式
    if (analysisViewRef.value) {
      analysisViewRef.value.resize();
    }
  } else if (mode.value === "pv-capture") {
    // 光伏捕获电价模式
    if (pvCaptureChartRef.value) {
      pvCaptureChartRef.value.resize();
    }
  } else if (mode.value === "multi-pv-capture") {
    // 多日光伏捕获电价模式
    if (multiPvCaptureRef.value) {
      multiPvCaptureRef.value.resize();
    }
  }
};

// 窗口 resize 时更新高度
const handleWindowResize = () => {
  updateChartItemHeight();
};

const nav_text = computed(() => {
  const arr = cur_chain.value.map((node) => node.treeNodeName);
  return arr.join(` -> `);
});

// 获取所有节点数据
async function fetchAllNodeData() {
  try {
    // 节点树的loading状态
    const loadingInstance = ElLoading.service({
      target: ".left-panel",
      text: "节点列表加载中...",
      background: "rgba(255, 255, 255, 0.7)",
    });

    //请求接口：
    const response = await request.get("/api/node-price/tree");

    if (response.data.status === 0) {
      // 1. 将广东省排在最前面
      const provinces = response.data.data || [];
      const sortedProvinces = provinces.sort((a, b) => {
        if (a.treeNodeName === "广东省") return -1;
        if (b.treeNodeName === "广东省") return 1;
        return a.treeNodeName.localeCompare(b.treeNodeName, "zh-CN");
      });

      nodeTreeData.value = sortedProvinces;

      // 2. 找到广东省的第一个叶子节点作为默认选中
      const guangdong = sortedProvinces.find(
        (p) => p.treeNodeName === "广东省",
      );
      if (guangdong && guangdong.children && guangdong.children.length > 0) {
        // 注意：现在广东省的第一个子节点是广东省自身的拷贝，我们需要跳过它
        // 查找第一个真正的叶子节点（从第二个子节点开始）
        let firstLeafNode = null;

        // 从第一个子节点开始查找（索引为0）
        for (let i = 0; i < guangdong.children.length; i++) {
          const child = guangdong.children[i];
          if (isLeaf(child)) {
            firstLeafNode = child;
            break;
          }
        }

        if (firstLeafNode) {
          cur_node_id.value = firstLeafNode.treeNodeId;
          // 默认选中第一个叶子节点
          handleNodeSelect({
            id: firstLeafNode.treeNodeId,
            name: firstLeafNode.treeNodeName,
          });
        } else {
          // 如果没有找到叶子节点，则选中广东省的拷贝节点
          const guangdongCopy = guangdong.children[0];
          cur_node_id.value = guangdongCopy.treeNodeId;
          handleNodeSelect({
            id: guangdongCopy.treeNodeId,
            name: guangdongCopy.treeNodeName,
          });
        }
      } else if (guangdong && isLeaf(guangdong)) {
        // 如果广东省本身就是叶子节点，则选中广东省
        cur_node_id.value = guangdong.treeNodeId;
        handleNodeSelect({
          id: guangdong.treeNodeId,
          name: guangdong.treeNodeName,
        });
      }

      ElMessage.success("节点数据加载成功");
    } else {
      ElMessage.warning(response.data.msg || "节点数据加载失败");
    }

    loadingInstance.close(); //关闭加载状态
  } catch (error) {
    console.error("加载节点数据失败:", error);
    ElMessage.error("节点数据加载失败");

    loadingInstance.close(); //关闭加载状态
  }
}

// 获取节点电价数据
async function fetchNodePriceData(nodeId, date) {
  const nodePkId = nodeId.endsWith("_copy") ? nodeId.slice(0, -5) : nodeId;
  // 开始加载
  chartLoading.value = true;
  tableLoading.value = true;

  try {
    const response = await request.get("/api/node-price/price-chart", {
      params: {
        nodePkId,
        startDate: date,
      },
    });

    if (response.data.status === 0) {
      const priceData = response.data.data;
      currentDayAheadData.value =
        priceData.dayAheadData || new Array(96).fill(0);
      currentRealTimeData.value =
        priceData.realTimeData || new Array(96).fill(0);
      ElMessage.success("电价数据加载成功");
    } else {
      ElMessage.warning(response.data.msg || "电价数据加载失败");
      currentDayAheadData.value = new Array(96).fill(0);
      currentRealTimeData.value = new Array(96).fill(0);
    }
  } catch (error) {
    console.error("加载电价数据失败:", error);
    ElMessage.error("电价数据加载失败");
    currentDayAheadData.value = new Array(96).fill(0);
    currentRealTimeData.value = new Array(96).fill(0);
  } finally {
    // 无论成功失败，都结束加载
    chartLoading.value = false;
    tableLoading.value = false;
  }
}

// 获取光伏捕获电价数据
async function fetchPvCapturePriceData(nodeId, date) {
  const nodePkId = nodeId.endsWith("_copy") ? nodeId.slice(0, -5) : nodeId;
  chartLoading.value = true;
  tableLoading.value = true;

  try {
    const response = await request.get("/api/node-price/pv-capture-price", {
      params: { nodePkId, startDate: date },
    });

    if (response.data.status === 0) {
      const data = response.data.data;
      pvDayAheadCaptureData.value = data.dayAheadCaptureData || [];
      pvRealTimeCaptureData.value = data.realTimeCaptureData || [];
      pvDayAheadOriginalData.value = data.dayAheadOriginalData || [];
      pvRealTimeOriginalData.value = data.realTimeOriginalData || [];
      pvDayAheadCaptureAvg.value = data.dayAheadCaptureAvg || 0;
      pvRealTimeCaptureAvg.value = data.realTimeCaptureAvg || 0;
    } else {
      ElMessage.warning(response.data.msg || "光伏捕获电价数据加载失败");
    }
  } catch (error) {
    console.error("获取光伏捕获电价数据失败:", error);
    ElMessage.error("光伏捕获电价数据加载失败");
  } finally {
    chartLoading.value = false;
    tableLoading.value = false;
  }
}

// 获取溯前30天模式数据
async function fetchHistoryData(nodeId, date) {
  const nodePkId = nodeId.endsWith("_copy") ? nodeId.slice(0, -5) : nodeId;
  const range = computeHistoryDateRange(date);
  historyDateRange.value = range;

  historyChartLoading.value = true;
  historyTableLoading.value = true;

  try {
    const response = await request.post(
      "/api/node-price/single-history-range",
      {
        nodePkId,
        startDate: range[0],
        endDate: range[1],
        regionPkId: "440000",
      },
    );

    if (response.data.status === 0) {
      historyPriceData.value = response.data.data;
    } else {
      ElMessage.warning(response.data.msg || "溯前模式数据加载失败");
      historyPriceData.value = null;
    }
  } catch (error) {
    console.error("加载溯前模式数据失败:", error);
    ElMessage.error("溯前模式数据加载失败");
    historyPriceData.value = null;
  } finally {
    historyChartLoading.value = false;
    historyTableLoading.value = false;
  }
}

// 日期改变处理
function handleDateChange(date) {
  if (selectedNodeId.value) {
    if (mode.value === "single-history") {
      fetchHistoryData(selectedNodeId.value, date);
    } else if (mode.value === "pv-capture") {
      fetchPvCapturePriceData(selectedNodeId.value, date);
    } else {
      fetchNodePriceData(selectedNodeId.value, date);
    }
  }
}

// 节点选择事件
function handleNodeSelect(node) {
  selectedNodeName.value = node.name;
  selectedNodeId.value = node.id;

  if (selectedDate.value) {
    if (mode.value === "single-history") {
      fetchHistoryData(node.id, selectedDate.value);
    } else if (mode.value === "pv-capture") {
      fetchPvCapturePriceData(node.id, selectedDate.value);
    } else {
      fetchNodePriceData(node.id, selectedDate.value);
    }
  }

  // 找到父节点树的链
  const node_chain = getParentNodeChain(node.id, nodeTreeData.value);
  cur_chain.value = node_chain;
}

function handleTimeTypeChange(type) {
  timeType.value = type;
}

// 生成指定时间类型的表格数据
function generateTableDataWithDiff(timeTypeValue) {
  const timePoints = [];
  let dataPoints = [];

  if (timeTypeValue === "hour") {
    for (let i = 0; i < 24; i++) {
      timePoints.push(`${i.toString().padStart(2, "0")}:00`);
    }
    dataPoints = Array.from({ length: 24 }, (_, i) => i);
  } else if (timeTypeValue === "minute") {
    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      timePoints.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      );
    }
    dataPoints = Array.from({ length: 96 }, (_, i) => i);
  } else if (timeTypeValue === "compute") {
    for (let i = 0; i < 24; i++) {
      timePoints.push(`第${i + 1}时`);
    }
    dataPoints = Array.from({ length: 24 }, (_, i) => i);
  }

  return timePoints.map((time, index) => {
    let realTimePrice, dayAheadPrice;

    if (timeTypeValue === "compute") {
      // 计算整点均值
      let realTimeSum = 0;
      let dayAheadSum = 0;
      for (let j = 0; j < 4; j++) {
        const dataIndex = index * 4 + j;
        realTimeSum += currentRealTimeData.value[dataIndex] || 0;
        dayAheadSum += currentDayAheadData.value[dataIndex] || 0;
      }
      realTimePrice = realTimeSum / 4;
      dayAheadPrice = dayAheadSum / 4;
    } else {
      const dataIndex = timeTypeValue === "hour" ? index * 4 : index;
      realTimePrice = currentRealTimeData.value[dataIndex] || 0;
      dayAheadPrice = currentDayAheadData.value[dataIndex] || 0;
    }

    const rawDiff = realTimePrice - dayAheadPrice;
    const rawChangeRate =
      dayAheadPrice > 0 ? (rawDiff / dayAheadPrice) * 100 : 0;

    return [
      time,
      Number(realTimePrice.toFixed(2)),
      Number(dayAheadPrice.toFixed(2)),
      Number(rawDiff.toFixed(2)),
      Number(rawChangeRate.toFixed(2)),
    ];
  });
}

/* ------------------------------------ 导出数据 ------------------------------------ */
async function handleExportData() {
  switch (mode.value) {
    case "single-history":
      await exportToExcelHistory();
      break;
    case "pv-capture":
      await exportToExcelPvCapture();
      break;
    case "multi-pv-capture":
      await exportToExcelMultiPvCapture();
      break;
    case "analysis":
      await exportToExcelAnalysis();
      break;
    case "single":
      await exportToExcel();
      break;
    default:
      await exportToExcelRange();
  }
}

// 单节点电价模式导出数据
async function exportToExcel() {
  if (!selectedNodeId.value) {
    ElMessage.warning("请先选择节点");
    return;
  }

  exportLoading.value = true;

  try {
    const wb = XLSX.utils.book_new();

    // 为两种时间类型创建sheet
    const timeTypes = [
      { value: "minute", name: "96点" },
      { value: "compute", name: "24点" },
    ];

    timeTypes.forEach((type) => {
      const wsData = [
        [
          "时间",
          "实时节点电价(元/MWh)",
          "日前节点电价(元/MWh)",
          "价差(元/MWh)",
          "变化率(%)",
        ],
        ...generateTableDataWithDiff(type.value),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, type.name);
    });

    XLSX.writeFile(
      wb,
      `${selectedNodeName.value}_${selectedDate.value}_电价数据.xlsx`,
    );

    ElMessage.success("数据导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("数据导出失败");
  } finally {
    exportLoading.value = false;
  }
}

// 光伏捕获电价模式导出数据
async function exportToExcelPvCapture() {
  if (!selectedNodeId.value) {
    ElMessage.warning("请先选择节点");
    return;
  }

  exportLoading.value = true;

  try {
    const wb = XLSX.utils.book_new();

    // 96点 sheet
    const wsData96 = [
      [
        "时间",
        "DA原始电价(元/MWh)",
        "RT原始电价(元/MWh)",
        "归一化辐照度",
        "DA加权贡献值(元/MWh)",
        "RT加权贡献值(元/MWh)",
      ],
    ];

    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4);
      const minute = (i % 4) * 15;
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      wsData96.push([
        time,
        Number((pvDayAheadOriginalData.value[i] || 0).toFixed(2)),
        Number((pvRealTimeOriginalData.value[i] || 0).toFixed(2)),
        Number((PV_WEIGHTS.quarter_hourly_weights[i] || 0).toFixed(4)),
        Number((pvDayAheadCaptureData.value[i] || 0).toFixed(2)),
        Number((pvRealTimeCaptureData.value[i] || 0).toFixed(2)),
      ]);
    }

    const ws96 = XLSX.utils.aoa_to_sheet(wsData96);
    XLSX.utils.book_append_sheet(wb, ws96, "96点");

    // 24点 sheet
    const hourlyDayAheadOriginal = aggregateToHourly(
      pvDayAheadOriginalData.value,
    );
    const hourlyRealTimeOriginal = aggregateToHourly(
      pvRealTimeOriginalData.value,
    );
    const hourlyDayAheadCapture = computeHourlyCapture(
      pvDayAheadOriginalData.value,
    );
    const hourlyRealTimeCapture = computeHourlyCapture(
      pvRealTimeOriginalData.value,
    );

    const wsData24 = [
      [
        "时间",
        "DA原始电价(元/MWh)",
        "RT原始电价(元/MWh)",
        "归一化辐照度",
        "DA加权贡献值(元/MWh)",
        "RT加权贡献值(元/MWh)",
      ],
    ];

    for (let i = 0; i < 24; i++) {
      wsData24.push([
        `第${i + 1}时`,
        Number((hourlyDayAheadOriginal[i] || 0).toFixed(2)),
        Number((hourlyRealTimeOriginal[i] || 0).toFixed(2)),
        Number((PV_WEIGHTS.hourly_weights[i] || 0).toFixed(4)),
        Number((hourlyDayAheadCapture[i] || 0).toFixed(2)),
        Number((hourlyRealTimeCapture[i] || 0).toFixed(2)),
      ]);
    }

    const ws24 = XLSX.utils.aoa_to_sheet(wsData24);
    XLSX.utils.book_append_sheet(wb, ws24, "24点");

    XLSX.writeFile(
      wb,
      `${selectedNodeName.value}_${selectedDate.value}_光伏捕获电价数据.xlsx`,
    );

    ElMessage.success("数据导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("数据导出失败");
  } finally {
    exportLoading.value = false;
  }
}

// 单节点与省份节点对比模式导出数据
async function exportToExcelAnalysis() {
  if (!selectedNodeId.value) {
    ElMessage.warning("请先选择节点");
    return;
  }

  if (!selectedDateRange.value || selectedDateRange.value.length !== 2) {
    ElMessage.warning("请选择日期范围");
    return;
  }

  const analysisRef = analysisViewRef.value;
  if (
    !analysisRef ||
    !analysisRef.gdDayAheadSeries ||
    analysisRef.gdDayAheadSeries.length === 0
  ) {
    ElMessage.warning("请先点击'开始计算'获取分析数据");
    return;
  }

  exportLoading.value = true;

  try {
    const dataCount = analysisRef.gdDayAheadSeries.length;
    const timeLabels = [];
    for (let i = 0; i < dataCount; i++) {
      const totalMinutes = i * 15;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      timeLabels.push(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      );
    }

    const wsData = [
      [
        "时间",
        "广东省日前均价(元/MWh)",
        "广东省实时均价(元/MWh)",
        `${selectedNodeName.value}日前均价(元/MWh)`,
        `${selectedNodeName.value}实时均价(元/MWh)`,
      ],
    ];

    for (let i = 0; i < dataCount; i++) {
      wsData.push([
        timeLabels[i],
        Number((analysisRef.gdDayAheadSeries[i] || 0).toFixed(2)),
        Number((analysisRef.gdRealTimeSeries[i] || 0).toFixed(2)),
        Number((analysisRef.nodeDayAheadSeries[i] || 0).toFixed(2)),
        Number((analysisRef.nodeRealTimeSeries[i] || 0).toFixed(2)),
      ]);
    }

    wsData.push([]);
    wsData.push(["汇总信息"]);
    wsData.push([
      "广东加权日前均价",
      Number(analysisRef.gdDayAheadAvg.toFixed(2)),
    ]);
    wsData.push([
      "广东加权实时均价",
      Number(analysisRef.gdRealTimeAvg.toFixed(2)),
    ]);
    wsData.push([
      `${selectedNodeName.value}加权日前均价`,
      Number(analysisRef.nodeDayAheadAvg.toFixed(2)),
    ]);
    wsData.push([
      `${selectedNodeName.value}加权实时均价`,
      Number(analysisRef.nodeRealTimeAvg.toFixed(2)),
    ]);
    wsData.push([
      "日前加权差异值",
      `${analysisRef.dayAheadDiff >= 0 ? "+" : ""}${Number(analysisRef.dayAheadDiff.toFixed(2))}`,
      analysisRef.gdDayAheadAvg > 0
        ? `${(analysisRef.dayAheadDiff / analysisRef.gdDayAheadAvg) * 100 >= 0 ? "+" : ""}${Number(((analysisRef.dayAheadDiff / analysisRef.gdDayAheadAvg) * 100).toFixed(1))}%`
        : "—",
    ]);
    wsData.push([
      "实时加权差异值",
      `${analysisRef.realTimeDiff >= 0 ? "+" : ""}${Number(analysisRef.realTimeDiff.toFixed(2))}`,
      analysisRef.gdRealTimeAvg > 0
        ? `${(analysisRef.realTimeDiff / analysisRef.gdRealTimeAvg) * 100 >= 0 ? "+" : ""}${Number(((analysisRef.realTimeDiff / analysisRef.gdRealTimeAvg) * 100).toFixed(1))}%`
        : "—",
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "对比分析数据");
    XLSX.writeFile(
      wb,
      `${selectedNodeName.value}_${selectedDateRange.value[0]}_${selectedDateRange.value[1]}_对比分析数据.xlsx`,
    );

    ElMessage.success("对比分析数据导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("数据导出失败");
  } finally {
    exportLoading.value = false;
  }
}

// 多日模式导出数据
async function exportToExcelRange() {
  if (!selectedNodeId.value) {
    ElMessage.warning("请先选择节点");
    return;
  }

  if (!selectedDateRange.value || selectedDateRange.value.length !== 2) {
    ElMessage.warning("请选择日期范围");
    return;
  }

  exportLoading.value = true;

  try {
    const nodePkId = selectedNodeId.value.endsWith("_copy")
      ? selectedNodeId.value.slice(0, -5)
      : selectedNodeId.value;

    // 调用后端接口获取多日数据
    const response = await request.get("/api/node-price/price-chart-range", {
      params: {
        nodePkId,
        startDate: selectedDateRange.value[0],
        endDate: selectedDateRange.value[1],
        regionPkId: "440000", // 默认广东省
      },
    });

    if (response.data.status === 0 && response.data.data) {
      const { dayAhead, realTime } = response.data.data;

      // 整理数据
      const wsData = [
        ["日期", "时间", "实时节点电价(元/MWh)", "日前节点电价(元/MWh)"],
      ];

      // 处理日前数据
      const dayAheadMap = {};
      dayAhead.forEach((item) => {
        dayAheadMap[item.dataTime] = item.dataValues || [];
      });

      // 处理实时数据并合并
      realTime.forEach((item) => {
        const date = item.dataTime;
        const realTimeValues = item.dataValues || [];
        const dayAheadValues = dayAheadMap[date] || [];

        realTimeValues.forEach((rtItem, index) => {
          const daItem = dayAheadValues[index] || { value: 0 };
          wsData.push([
            date,
            rtItem.time,
            rtItem.value || 0,
            daItem.value || 0,
          ]);
        });
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "多日电价数据");
      XLSX.writeFile(
        wb,
        `${selectedNodeName.value}_${selectedDateRange.value[0]}_${selectedDateRange.value[1]}_多日电价数据.xlsx`,
      );

      ElMessage.success("多日数据导出成功");
    } else {
      ElMessage.warning("获取数据失败，无法导出");
    }
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("数据导出失败");
  } finally {
    exportLoading.value = false;
  }
}

// 溯前30天模式导出数据
async function exportToExcelHistory() {
  if (!selectedNodeId.value) {
    ElMessage.warning("请先选择节点");
    return;
  }
  if (!historyPriceData.value) {
    ElMessage.warning("暂无历史数据可导出");
    return;
  }

  exportLoading.value = true;

  try {
    const wb = XLSX.utils.book_new();

    const quarterData = historyPriceData.value.tableData_quarter || [];
    const computeData = historyPriceData.value.tableData_compute_hour || [];

    const quarterRows = [
      [
        "时间",
        "实时均价(元/MWh)",
        "日前均价(元/MWh)",
        "价差均值(元/MWh)",
        "变化率",
      ],
      ...quarterData.map((r) => [
        r.time,
        r.realTimePrice.toFixed(2),
        r.dayAheadPrice.toFixed(2),
        r.diff.toFixed(2),
        `${r.changeRate >= 0 ? "+" : ""}${r.changeRate.toFixed(2)}%`,
      ]),
    ];
    const quarterWs = XLSX.utils.aoa_to_sheet(quarterRows);
    XLSX.utils.book_append_sheet(wb, quarterWs, "96点");

    const computeRows = [
      [
        "时间",
        "实时均价(元/MWh)",
        "日前均价(元/MWh)",
        "价差均值(元/MWh)",
        "变化率",
      ],
      ...computeData.map((r) => [
        r.time,
        r.realTimePrice.toFixed(2),
        r.dayAheadPrice.toFixed(2),
        r.diff.toFixed(2),
        `${r.changeRate >= 0 ? "+" : ""}${r.changeRate.toFixed(2)}%`,
      ]),
    ];
    const computeWs = XLSX.utils.aoa_to_sheet(computeRows);
    XLSX.utils.book_append_sheet(wb, computeWs, "24点");

    const endDate = historyDateRange.value
      ? historyDateRange.value[1]
      : selectedDate.value;
    XLSX.writeFile(
      wb,
      `${selectedNodeName.value}_${endDate}_溯前30天分时价差数据.xlsx`,
    );

    ElMessage.success("溯前模式数据导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("数据导出失败");
  } finally {
    exportLoading.value = false;
  }
}

// 多日光伏捕获电价模式导出数据
async function exportToExcelMultiPvCapture() {
  if (!multiPvCaptureRef.value) {
    ElMessage.warning("暂无数据可导出，请先计算");
    return;
  }

  const dailyData = multiPvCaptureRef.value.dailyData || [];
  const summary = multiPvCaptureRef.value.summary || {};

  if (!dailyData || dailyData.length === 0) {
    ElMessage.warning("暂无数据可导出");
    return;
  }

  exportLoading.value = true;

  try {
    const wb = XLSX.utils.book_new();

    const wsData = [
      [
        "日期",
        "日前捕获均价(元/MWh)",
        "实时捕获均价(元/MWh)",
        "捕获价差(元/MWh)",
      ],
      ...dailyData.map((item) => {
        const date = new Date(item.date);
        const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return [
          mmdd,
          item.dayAheadCaptureAvg ? item.dayAheadCaptureAvg.toFixed(2) : "-",
          item.realTimeCaptureAvg ? item.realTimeCaptureAvg.toFixed(2) : "-",
          item.captureSpread ? item.captureSpread.toFixed(2) : "-",
        ];
      }),
      [],
      [
        "统计",
        `DA均价：${summary.dayAheadCaptureAvg ? summary.dayAheadCaptureAvg.toFixed(2) : "-"}`,
        `RT均价：${summary.realTimeCaptureAvg ? summary.realTimeCaptureAvg.toFixed(2) : "-"}`,
        `价差均值：${summary.spreadAvg ? summary.spreadAvg.toFixed(2) : "-"}`,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "多日光伏捕获电价");
    XLSX.writeFile(
      wb,
      `${selectedNodeName.value}_${selectedDateRange.value[0]}_${selectedDateRange.value[1]}_多日光伏捕获电价.xlsx`,
    );

    ElMessage.success("数据导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("数据导出失败");
  } finally {
    exportLoading.value = false;
  }
}

/* ------------------------------------ 辅助函数 ------------------------------------ */

// 辅助函数：获取从根节点到指定节点的路径链
function getParentNodeChain(nodeId, treeNodes) {
  const path = [];

  function findPath(nodes, targetId, currentPath) {
    for (const node of nodes) {
      const newPath = [
        ...currentPath,
        {
          treeNodeId: node.treeNodeId,
          treeNodeName: node.treeNodeName,
        },
      ];

      if (node.treeNodeId === targetId) {
        path.push(...newPath);
        return true;
      }

      if (node.children && node.children.length > 0) {
        if (findPath(node.children, targetId, newPath)) {
          return true;
        }
      }
    }
    return false;
  }

  findPath(treeNodes, nodeId, []);

  return path;
}

// 辅助函数：判断是否为叶子节点
function isLeaf(data) {
  return data.leaf === 1 || data.nodeType === "1";
}

onMounted(() => {
  fetchAllNodeData(); // 一次性加载所有节点数据
  // 延迟更新图表高度，确保 DOM 已渲染
  setTimeout(() => {
    updateChartItemHeight();
  }, 100);
  window.addEventListener("resize", handleWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleWindowResize);
});
</script>

<style scoped lang="scss">
.price-analysis-container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);

  .analysis-content {
    flex: 1;
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 4px;
    min-height: 0;
    height: 100%;
    position: relative;
    transition: grid-template-columns 0.3s ease;

    &.collapsed {
      grid-template-columns: 0 1fr;
    }

    .left-panel {
      background: white;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;

      &.collapsed {
        padding: 0;
        width: 0;
        min-width: 0;
      }
    }

    // 固定位置的展开/折叠按钮
    .collapse-toggle-btn {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 60px;
      background: #409eff;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      z-index: 100;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        background: #66b1ff;
      }

      &.expanded {
        left: 350px;
      }

      i {
        font-size: 16px;
      }
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 0;
      height: 100%;
    }

    .control-bar {
      height: 60px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;

      .control-bar-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .date-picker-container {
          display: flex;
          align-items: center;
          gap: 8px;

          i {
            color: #409eff;
            font-size: 18px;
          }
        }
      }

      .control-bar-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .time-type-selector {
          display: flex;
          align-items: center;
          gap: 6px;

          i {
            color: #67c23a;
            font-size: 16px;
          }
        }
      }
    }

    .main {
      width: 100%;
      flex: 1; // 竖向沾满
      display: grid; // 横向排布
      grid-template-columns: 1fr 500px;
      min-height: 0;
      &.multi-day {
        grid-template-columns: 1fr; // 多日模式下占据整个宽度
      }
    }
    .middle-panel {
      flex: 1;
      min-width: 0;
      background: white;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .chart-container {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .charts-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;

          .chart-item {
            flex: 1;
            overflow: hidden;
          }
        }

        .history-charts-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;

          .history-chart-item {
            flex-shrink: 0;
            min-height: 350px;
            overflow: hidden;
          }
        }

        .chart-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .selected-node {
            background: #f0f7ff;
            padding: 8px 16px;
            border-radius: 20px;
            color: #409eff;
            font-weight: 500;
            font-size: 14px;
            i {
              margin-right: 6px;
            }
          }

          .date-info {
            display: flex;
            gap: 8px;
            text-align: center;
            transform: scale(0.8);
            transform-origin: right center;

            .selected-date-display,
            .weekday,
            .date-type {
              display: flex;
              align-items: center;
              min-height: 30px;
              font-size: 16px;
            }

            .selected-date-display {
              color: #1890ff;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: 600;
              background-color: rgba(24, 144, 255, 0.1);
              border: 1px solid rgba(24, 144, 255, 0.2);
            }

            .weekday {
              padding: 3px 10px;
              background: rgba(44, 111, 187, 0.1);
              border-radius: 4px;
              color: #2c6fbb;
              font-weight: 500;
              border: 1px solid rgba(44, 111, 187, 0.2);
            }

            .date-type {
              padding: 3px 10px;
              border-radius: 4px;
              font-weight: 500;

              &.weekday {
                background: rgba(76, 175, 80, 0.1);
                color: #4caf50;
                border: 1px solid rgba(76, 175, 80, 0.2);
              }

              &.weekend {
                background: rgba(156, 39, 176, 0.1);
                color: #9c27b0;
                border: 1px solid rgba(156, 39, 176, 0.2);
              }
            }
          }

          .history-date-info {
            display: flex;
            align-items: center;
            gap: 16px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e6f3ff 100%);
            padding: 8px 18px;
            border-radius: 20px;
            border: 1px solid rgba(64, 158, 255, 0.15);

            .history-date-range {
              display: flex;
              align-items: center;
              font-size: 14px;
              font-weight: 600;
              color: #1677ff;
              background: rgba(24, 144, 255, 0.08);
              padding: 4px 14px;
              border-radius: 12px;
              border: 1px solid rgba(24, 144, 255, 0.15);
              letter-spacing: 0.3px;

              i {
                font-size: 15px;
                color: #1677ff;
                margin-right: 6px;
              }
            }

            .history-date-desc {
              display: flex;
              align-items: center;
              font-size: 13px;
              color: #5a6872;
              background: rgba(255, 255, 255, 0.7);
              padding: 4px 14px;
              border-radius: 12px;
              border: 1px solid rgba(0, 0, 0, 0.06);

              i {
                font-size: 14px;
                color: #faad14;
                margin-right: 6px;
              }

              .day-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1677ff, #4096ff);
                color: white;
                font-weight: 700;
                font-size: 12px;
                min-width: 22px;
                height: 22px;
                border-radius: 11px;
                padding: 0 6px;
                margin: 0 4px;
              }
            }
          }
        }
      }
    }

    .right-panel {
      width: 500px; //不变！！
      flex-shrink: 0;
      background: white;
      padding: 16px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .table-container {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
    }
  }
}

@media (max-width: 1600px) {
  .price-analysis-container {
    .analysis-content {
      grid-template-columns: 280px 1fr;

      &.collapsed {
        grid-template-columns: 0 1fr;
      }

      .collapse-toggle-btn.expanded {
        left: 280px;
      }

      .right-panel {
        width: 450px;
      }
    }
  }
}

@media (max-width: 1400px) {
  .price-analysis-container {
    .analysis-content {
      grid-template-columns: 250px 1fr;

      &.collapsed {
        grid-template-columns: 0 1fr;
      }

      .collapse-toggle-btn.expanded {
        left: 250px;
      }

      .right-panel {
        width: 400px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .price-analysis-container {
    height: auto !important;
    min-height: calc(100vh - var(--header-height) - var(--breadcrumb-height));

    .analysis-content {
      grid-template-columns: 1fr;
      grid-template-rows: 300px 400px 400px;
      gap: 12px;

      .left-panel,
      .middle-panel,
      .right-panel {
        min-height: 0;
      }
    }
  }
}
</style>
