<template>
  <div class="single-node-analysis">
    <template v-if="!hasStarted">
      <div class="start-section">
        <div class="start-info">
          <i class="bi bi-graph-up-arrow"></i>
          <h3>单个节点对比分析</h3>
          <p>
            选择左侧节点后，点击下方按钮开始分析该节点与广东省的平均电价对比
          </p>
        </div>
        <el-button
          type="primary"
          size="large"
          @click="startAnalysis"
          :disabled="!nodeId"
        >
          <i class="bi bi-play-fill"></i> 开始计算
        </el-button>
        <p v-if="!nodeId" class="tip-text">请先在左侧选择一个节点</p>
        <p v-else class="tip-text">当前节点：{{ nodeName }}</p>
      </div>
    </template>

    <template v-else-if="loading">
      <div class="loading-section">
        <el-progress
          type="dashboard"
          :percentage="loadingProgress"
          :width="200"
          :stroke-width="12"
          color="#409eff"
        />
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </template>

    <template v-else>
      <div class="result-section">
        <div class="summary-cards">
          <div class="summary-card guangdong">
            <div class="card-header">
              <i class="bi bi-building"></i>
              <span>广东加权日前均价</span>
            </div>
            <div class="card-value">{{ formatPrice(gdDayAheadAvg) }}</div>
          </div>
          <div class="summary-card guangdong">
            <div class="card-header">
              <i class="bi bi-building"></i>
              <span>广东加权实时均价</span>
            </div>
            <div class="card-value">{{ formatPrice(gdRealTimeAvg) }}</div>
          </div>
          <div class="summary-card node">
            <div class="card-header">
              <i class="bi bi-node-plus"></i>
              <span>{{ nodeName }}加权日前均价</span>
            </div>
            <div class="card-value">{{ formatPrice(nodeDayAheadAvg) }}</div>
          </div>
          <div class="summary-card node">
            <div class="card-header">
              <i class="bi bi-node-plus"></i>
              <span>{{ nodeName }}加权实时均价</span>
            </div>
            <div class="card-value">{{ formatPrice(nodeRealTimeAvg) }}</div>
          </div>
          <div class="summary-card diff">
            <div class="card-header">
              <i class="bi bi-arrow-left-right"></i>
              <span>日前加权差异值</span>
            </div>
            <div
              class="card-value"
              :class="dayAheadDiff >= 0 ? 'positive' : 'negative'"
            >
              {{ dayAheadDiff >= 0 ? "+" : "" }}{{ formatPrice(dayAheadDiff) }}
              <span class="diff-percent">{{ dayAheadDiffPercent }}</span>
            </div>
          </div>
          <div class="summary-card diff">
            <div class="card-header">
              <i class="bi bi-arrow-left-right"></i>
              <span>实时加权差异值</span>
            </div>
            <div
              class="card-value"
              :class="realTimeDiff >= 0 ? 'positive' : 'negative'"
            >
              {{ realTimeDiff >= 0 ? "+" : "" }}{{ formatPrice(realTimeDiff) }}
              <span class="diff-percent">{{ realTimeDiffPercent }}</span>
            </div>
          </div>
        </div>

        <div class="chart-section">
          <div class="chart-header">
            <h3>实时市场分时平均电价 (元/MWh)</h3>
            <div class="chart-info-bar">
              <div class="date-range-label">
                <i class="bi bi-calendar-range"></i>
                {{ dateRange[0] }} ~ {{ dateRange[1] }}
              </div>
            </div>
          </div>
          <PriceAnalysisChart
            ref="chartRef"
            :gd-day-ahead="gdDayAheadSeries"
            :gd-real-time="gdRealTimeSeries"
            :node-day-ahead="nodeDayAheadSeries"
            :node-real-time="nodeRealTimeSeries"
            :chart-height="400"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import PriceAnalysisChart from "./PriceAnalysisChart.vue";
import request from "@/utils/request";
import { ElMessage } from "element-plus";

const props = defineProps({
  nodeId: {
    type: String,
    default: "",
  },
  nodeName: {
    type: String,
    default: "",
  },
  dateRange: {
    type: Array,
    default: () => [],
  },
});

const hasStarted = ref(false);
const loading = ref(false);
const loadingProgress = ref(0);
const loadingText = ref("");

// 图表系列数据
const gdDayAheadSeries = ref([]);
const gdRealTimeSeries = ref([]);
const nodeDayAheadSeries = ref([]);
const nodeRealTimeSeries = ref([]);

// 加权均值
const gdDayAheadAvg = ref(0);
const gdRealTimeAvg = ref(0);
const nodeDayAheadAvg = ref(0);
const nodeRealTimeAvg = ref(0);

const chartRef = ref(null);

const dayAheadDiff = computed(
  () => gdDayAheadAvg.value - nodeDayAheadAvg.value,
);
const realTimeDiff = computed(
  () => gdRealTimeAvg.value - nodeRealTimeAvg.value,
);
const dayAheadDiffPercent = computed(() => {
  if (!gdDayAheadAvg.value) return "—";
  const pct = (dayAheadDiff.value / gdDayAheadAvg.value) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
});
const realTimeDiffPercent = computed(() => {
  if (!gdRealTimeAvg.value) return "—";
  const pct = (realTimeDiff.value / gdRealTimeAvg.value) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
});

const formatPrice = (val) => {
  if (val === null || val === undefined) return "—";
  return Number(val).toFixed(2);
};

const computeAverages = (dataValuesList) => {
  if (!dataValuesList || dataValuesList.length === 0) return [];

  const timeCount = dataValuesList[0].length;
  const dayCount = dataValuesList.length;
  const averages = [];

  for (let i = 0; i < timeCount; i++) {
    let sum = 0;
    for (let j = 0; j < dayCount; j++) {
      sum += dataValuesList[j][i] || 0;
    }
    averages.push(sum / dayCount);
  }

  return averages;
};

const computeWeightedAvg = (seriesData) => {
  if (!seriesData || seriesData.length === 0) return 0;
  const sum = seriesData.reduce((acc, val) => acc + val, 0);
  return sum / seriesData.length;
};

const extractDataValues = (dataArray, dataType) => {
  const targetData = dataArray.filter((item) => item.dataType === dataType);
  return targetData.map((item) =>
    (item.dataValues || []).map((dv) => dv.value || 0),
  );
};

const startAnalysis = async () => {
  if (!props.nodeId) {
    ElMessage.warning("请先选择一个节点");
    return;
  }

  if (!props.dateRange || props.dateRange.length !== 2) {
    ElMessage.warning("请选择日期范围");
    return;
  }

  hasStarted.value = true;
  loading.value = true;
  loadingProgress.value = 10;
  loadingText.value = "正在获取广东省电价数据...";

  try {
    const nodePkId = props.nodeId.endsWith("_copy")
      ? props.nodeId.slice(0, -5)
      : props.nodeId;

    // 第一次请求：获取广东省节点数据 (440000)
    const gdResponse = await request.get("/api/node-price/price-chart-range", {
      params: {
        nodePkId: "440000",
        startDate: props.dateRange[0],
        endDate: props.dateRange[1],
        regionPkId: "440000",
      },
    });

    loadingProgress.value = 40;
    loadingText.value = "正在获取所选节点电价数据...";

    // 第二次请求：获取用户所选节点数据
    const nodeResponse = await request.get(
      "/api/node-price/price-chart-range",
      {
        params: {
          nodePkId,
          startDate: props.dateRange[0],
          endDate: props.dateRange[1],
          regionPkId: "440000",
        },
      },
    );

    loadingProgress.value = 70;
    loadingText.value = "正在计算分时均价...";

    if (gdResponse.data.status === 0 && nodeResponse.data.status === 0) {
      const gdData = gdResponse.data.data;
      const nodeData = nodeResponse.data.data;

      // 提取数据值 (每个item的dataValues数组)
      const gdDayAheadValues = extractDataValues(gdData.dayAhead || [], 1);
      const gdRealTimeValues = extractDataValues(gdData.realTime || [], 2);
      const nodeDayAheadValues = extractDataValues(nodeData.dayAhead || [], 1);
      const nodeRealTimeValues = extractDataValues(nodeData.realTime || [], 2);

      // 计算分时均价
      gdDayAheadSeries.value = computeAverages(gdDayAheadValues);
      gdRealTimeSeries.value = computeAverages(gdRealTimeValues);
      nodeDayAheadSeries.value = computeAverages(nodeDayAheadValues);
      nodeRealTimeSeries.value = computeAverages(nodeRealTimeValues);

      // 计算加权均价
      gdDayAheadAvg.value = computeWeightedAvg(gdDayAheadSeries.value);
      gdRealTimeAvg.value = computeWeightedAvg(gdRealTimeSeries.value);
      nodeDayAheadAvg.value = computeWeightedAvg(nodeDayAheadSeries.value);
      nodeRealTimeAvg.value = computeWeightedAvg(nodeRealTimeSeries.value);

      loadingProgress.value = 100;
      loadingText.value = "计算完成！";

      setTimeout(() => {
        loading.value = false;
      }, 500);
    } else {
      ElMessage.error("获取数据失败");
      loading.value = false;
    }
  } catch (error) {
    console.error("分析失败:", error);
    ElMessage.error("分析失败，请稍后重试");
    loading.value = false;
  }
};

// 切换节点或日期范围时重置状态，回到开始计算
watch(
  () => props.nodeId,
  () => {
    hasStarted.value = false;
    loading.value = false;
    loadingProgress.value = 0;
  },
);

watch(
  () => props.dateRange,
  () => {
    hasStarted.value = false;
    loading.value = false;
    loadingProgress.value = 0;
  },
  { deep: true },
);

const resize = () => {
  if (chartRef.value) {
    chartRef.value.resize();
  }
};

defineExpose({
  resize,
});
</script>

<style scoped lang="scss">
.single-node-analysis {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .start-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 40px;

    .start-info {
      text-align: center;

      i {
        font-size: 64px;
        color: #409eff;
        margin-bottom: 16px;
      }

      h3 {
        font-size: 20px;
        color: #303133;
        margin: 0 0 8px 0;
      }

      p {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }

    .tip-text {
      font-size: 13px;
      color: #909399;
      margin: 0;
    }
  }

  .loading-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 40px;

    .loading-text {
      font-size: 16px;
      color: #606266;
      margin: 0;
    }
  }

  .result-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;

      .summary-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #606266;

          i {
            font-size: 16px;
          }
        }

        .card-value {
          font-size: 22px;
          font-weight: 700;
          color: #303133;

          &.positive {
            color: #67c23a;
          }

          &.negative {
            color: #f56c6c;
          }
        }

        &.guangdong {
          .card-header i {
            color: #409eff;
          }
        }

        &.node {
          .card-header i {
            color: #e6a23c;
          }
        }

        &.diff {
          .card-header i {
            color: #9c27b0;
          }
          .card-value {
            line-height: 1.2;
          }
          .diff-percent {
            display: block;
            font-size: 13px;
            font-weight: 400;
            margin-top: 2px;
          }
        }
      }
    }

    .chart-section {
      flex: 1;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 20px;
      display: flex;
      flex-direction: column;
      min-height: 0;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin: 0;
        }

        .chart-info-bar {
          .date-range-label {
            font-size: 13px;
            color: #909399;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

@media (max-width: 1600px) {
  .single-node-analysis {
    .result-section {
      .summary-cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 1200px) {
  .single-node-analysis {
    .result-section {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}
</style>
