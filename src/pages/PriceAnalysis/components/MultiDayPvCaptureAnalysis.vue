<template>
  <template v-if="!hasStarted">
    <div class="start-section">
      <div class="start-info">
        <i class="bi bi-graph-up-arrow"></i>
        <h3>多日光伏捕获电价分析</h3>
        <p>选择左侧节点和日期范围后，点击下方按钮开始分析</p>
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
    <div class="content-wrapper">
      <div class="left-panel">
        <ChartInfoBar
          type="history"
          :navText="nodeName"
          :dateRange="dateRange"
        />
        <div class="summary-cards">
          <div class="summary-card da-avg">
            <div class="card-header">
              <i class="bi bi-graph-up-arrow"></i>
              <span>{{ dayCount }}天日前捕获均价平均值</span>
            </div>
            <div class="card-value">
              {{ formatPrice(summary.dayAheadCaptureAvg) }}
            </div>
          </div>
          <div class="summary-card rt-avg">
            <div class="card-header">
              <i class="bi bi-graph-down-arrow"></i>
              <span>{{ dayCount }}天实时捕获均价平均值</span>
            </div>
            <div class="card-value">
              {{ formatPrice(summary.realTimeCaptureAvg) }}
            </div>
          </div>
          <div class="summary-card da-minmax">
            <div class="card-header">
              <i class="bi bi-graph-up-arrow"></i>
              <span>日前捕获均价极值</span>
            </div>
            <div class="minmax-content">
              <div class="minmax-item max">
                <i class="bi bi-arrow-up-circle"></i>
                <span class="label">最大值</span>
                <span class="value">{{
                  formatPrice(summary.dayAheadMax.value)
                }}</span>
                <span class="date">{{
                  formatDateShort(summary.dayAheadMax.date)
                }}</span>
              </div>
              <div class="minmax-item min">
                <i class="bi bi-arrow-down-circle"></i>
                <span class="label">最小值</span>
                <span class="value">{{
                  formatPrice(summary.dayAheadMin.value)
                }}</span>
                <span class="date">{{
                  formatDateShort(summary.dayAheadMin.date)
                }}</span>
              </div>
            </div>
          </div>
          <div class="summary-card rt-minmax">
            <div class="card-header">
              <i class="bi bi-graph-down-arrow"></i>
              <span>实时捕获均价极值</span>
            </div>
            <div class="minmax-content">
              <div class="minmax-item max">
                <i class="bi bi-arrow-up-circle"></i>
                <span class="label">最大值</span>
                <span class="value">{{
                  formatPrice(summary.realTimeMax.value)
                }}</span>
                <span class="date">{{
                  formatDateShort(summary.realTimeMax.date)
                }}</span>
              </div>
              <div class="minmax-item min">
                <i class="bi bi-arrow-down-circle"></i>
                <span class="label">最小值</span>
                <span class="value">{{
                  formatPrice(summary.realTimeMin.value)
                }}</span>
                <span class="date">{{
                  formatDateShort(summary.realTimeMin.date)
                }}</span>
              </div>
            </div>
          </div>
          <div class="summary-card spread">
            <div class="card-header">
              <i class="bi bi-arrow-left-right"></i>
              <span>捕获价差均值</span>
            </div>
            <div class="card-value" :class="spreadClass">
              {{ formatPrice(summary.spreadAvg) }}
            </div>
          </div>
        </div>

        <div class="chart-panel">
          <div
            v-loading="chartLoading"
            element-loading-text="图表数据加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.7)"
            class="chart-container"
          >
            <MultiDayPvCaptureChart ref="chartRef" :dailyData="dailyData" />
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="table-panel">
          <div
            v-loading="tableLoading"
            element-loading-text="表格数据加载中..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.7)"
            class="table-container"
          >
            <MultiDayPvCaptureTable :dailyData="dailyData" />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ChartInfoBar from "./ChartInfoBar.vue";
import MultiDayPvCaptureChart from "./MultiDayPvCaptureChart.vue";
import MultiDayPvCaptureTable from "./MultiDayPvCaptureTable.vue";
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
const chartLoading = ref(false);
const tableLoading = ref(false);

const dailyData = ref([]);
const summary = ref({
  dayAheadCaptureAvg: 0,
  realTimeCaptureAvg: 0,
  dayAheadMax: { value: 0, date: "" },
  dayAheadMin: { value: 0, date: "" },
  realTimeMax: { value: 0, date: "" },
  realTimeMin: { value: 0, date: "" },
  spreadAvg: 0,
});

const chartRef = ref(null);

const hasCompleted = computed(() => hasStarted.value && !loading.value);

const dayCount = computed(() => {
  if (!props.dateRange || props.dateRange.length !== 2) return 0;
  const start = new Date(props.dateRange[0]);
  const end = new Date(props.dateRange[1]);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
});

const spreadClass = computed(() => {
  const val = summary.value.spreadAvg;
  if (val > 0) return "spread-positive";
  if (val < 0) return "spread-negative";
  return "spread-zero";
});

const formatPrice = (price) => {
  if (price === null || price === undefined) return "—";
  return typeof price === "number" ? price.toFixed(2) : price;
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
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
  loadingText.value = "正在获取数据...";

  try {
    const nodePkId = props.nodeId.endsWith("_copy")
      ? props.nodeId.slice(0, -5)
      : props.nodeId;

    loadingProgress.value = 30;
    loadingText.value = "正在计算光伏捕获电价...";

    const response = await request.get(
      "/api/node-price/multi-pv-capture-price",
      {
        params: {
          nodePkId,
          startDate: props.dateRange[0],
          endDate: props.dateRange[1],
        },
      },
    );

    loadingProgress.value = 70;
    loadingText.value = "正在整理数据...";

    if (response.data.status === 0 && response.data.data) {
      dailyData.value = response.data.data.dailyData || [];
      summary.value = response.data.data.summary || {
        dayAheadCaptureAvg: 0,
        realTimeCaptureAvg: 0,
        dayAheadMax: { value: 0, date: "" },
        dayAheadMin: { value: 0, date: "" },
        realTimeMax: { value: 0, date: "" },
        realTimeMin: { value: 0, date: "" },
        spreadAvg: 0,
      };

      loadingProgress.value = 100;
      loadingText.value = "计算完成！";

      setTimeout(() => {
        loading.value = false;
      }, 500);
    } else {
      ElMessage.error(response.data?.msg || "获取数据失败");
      loading.value = false;
    }
  } catch (error) {
    console.error("分析失败:", error);
    ElMessage.error(response.data?.msg || "分析失败，请稍后重试");
    loading.value = false;
  }
};

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
  dailyData,
  summary,
  hasCompleted,
});
</script>

<style scoped lang="scss">
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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
      font-size: 12px;
      color: #606266;

      i {
        font-size: 14px;
      }
    }

    .card-value {
      font-size: 20px;
      font-weight: 700;
      color: #303133;
    }

    .card-date {
      font-size: 11px;
      color: #909399;
    }

    &.da-avg {
      .card-header i {
        color: #0d9488;
      }
      .card-value {
        color: #0d9488;
      }
    }

    &.rt-avg {
      .card-header i {
        color: #d97706;
      }
      .card-value {
        color: #d97706;
      }
    }

    &.da-minmax {
      .card-header i {
        color: #0d9488;
      }
      .minmax-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      .minmax-item {
        display: flex;
        align-items: center;
        gap: 6px;
        &.max {
          .value {
            color: #409eff;
          }
        }
        &.min {
          .value {
            color: #67c23a;
          }
        }
        i {
          font-size: 12px;
          color: #909399;
        }
        .label {
          font-size: 11px;
          color: #909399;
          min-width: 40px;
        }
        .value {
          font-size: 16px;
          font-weight: 700;
          flex: 1;
        }
        .date {
          font-size: 10px;
          color: #c0c4cc;
        }
      }
    }

    &.rt-minmax {
      .card-header i {
        color: #d97706;
      }
      .minmax-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
      }
      .minmax-item {
        display: flex;
        align-items: center;
        gap: 6px;
        &.max {
          .value {
            color: #409eff;
          }
        }
        &.min {
          .value {
            color: #67c23a;
          }
        }
        i {
          font-size: 12px;
          color: #909399;
        }
        .label {
          font-size: 11px;
          color: #909399;
          min-width: 40px;
        }
        .value {
          font-size: 16px;
          font-weight: 700;
          flex: 1;
        }
        .date {
          font-size: 10px;
          color: #c0c4cc;
        }
      }
    }

    &.spread {
      .card-header i {
        color: #9c27b0;
      }

      .card-value {
        &.spread-positive {
          color: #67c23a;
        }
        &.spread-negative {
          color: #f56c6c;
        }
        &.spread-zero {
          color: #909399;
        }
      }
    }
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;

  .left-panel {
    flex: 1;
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .right-panel {
    width: 400px;
    min-height: 0;
  }

  .chart-panel {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 16px;
    min-height: 0;
    display: flex;
    flex-direction: column;
    flex: 1;

    .chart-container {
      flex: 1;
      min-height: 350px;
    }
  }

  .table-panel {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    min-height: 0;
    display: flex;
    flex-direction: column;
    height: 100%;

    .table-container {
      flex: 1;
      overflow: auto;
    }
  }
}

@media (max-width: 1400px) {
  .multi-day-pv-capture-analysis {
    .result-section {
      .summary-cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

@media (max-width: 1200px) {
  .multi-day-pv-capture-analysis {
    .result-section {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-wrapper {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
