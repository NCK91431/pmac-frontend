<template>
  <div class="pv-capture-table-container">
    <el-table
      ref="pvTableRef"
      :data="tableData"
      border
      stripe
      size="small"
      height="100%"
      @row-click="handleRowClick"
    >
      <el-table-column prop="time" label="时间" width="80" fixed="left">
        <template #header>
          <div
            class="table-header time-header"
            @click.stop="clearSort"
            title="点击取消所有排序"
          >
            <i class="bi bi-clock"></i>
            <span>时间</span>
            <i class="bi bi-sort-up sort-icon"></i>
          </div>
        </template>
        <template #default="{ row }">
          <div class="time-cell">
            <i class="bi bi-clock-history"></i>
            {{ row.time }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="dayAheadOriginal" label="DA原始电价" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-calendar-check-fill" style="color: #409eff"></i>
            <span>DA原始电价</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="price-cell da-original">
            <span class="price-value">{{
              formatPrice(row.dayAheadOriginal)
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="realTimeOriginal" label="RT原始电价" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-lightning-charge-fill" style="color: #67c23a"></i>
            <span>RT原始电价</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="price-cell rt-original">
            <span class="price-value">{{
              formatPrice(row.realTimeOriginal)
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="irradiance" label="归一化辐照度" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-sun" style="color: #f59e0b"></i>
            <span>归一化辐照度</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="irradiance-cell">
            <span class="irradiance-value">{{
              formatIrradiance(row.irradiance)
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="dayAheadCapture" label="DA加权贡献值" sortable>
        <template #header>
          <el-tooltip
            effect="dark"
            content="DA加权贡献值=辐照度×DA原始电价，各点求和即DA捕获均价"
            placement="top"
          >
            <div class="table-header">
              <i class="bi bi-graph-up-arrow" style="color: #0d9488"></i>
              <span>DA加权贡献值</span>
            </div>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <div class="capture-cell da-capture">
            <span class="capture-value">{{
              formatPrice(row.dayAheadCapture)
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="realTimeCapture" label="RT加权贡献值" sortable>
        <template #header>
          <el-tooltip
            effect="dark"
            content="RT加权贡献值=辐照度×RT原始电价，各点求和即RT捕获均价"
            placement="top"
          >
            <div class="table-header">
              <i class="bi bi-graph-down-arrow" style="color: #d97706"></i>
              <span>RT加权贡献值</span>
            </div>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <div class="capture-cell rt-capture">
            <span class="capture-value">{{
              formatPrice(row.realTimeCapture)
            }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <div class="summary">
        <div class="summary-item">
          <i class="bi bi-graph-up-arrow" style="color: #0d9488"></i>
          <span>DA捕获均价：</span>
          <strong class="da-avg">{{ formatPrice(daCaptureAvg) }}</strong>
        </div>
        <div class="summary-item">
          <i class="bi bi-graph-down-arrow" style="color: #d97706"></i>
          <span>RT捕获均价：</span>
          <strong class="rt-avg">{{ formatPrice(rtCaptureAvg) }}</strong>
        </div>
        <div class="summary-item">
          <i class="bi bi-calendar-check-fill" style="color: #409eff"></i>
          <span>DA原始均价：</span>
          <strong class="da-original-avg">{{
            formatPrice(daOriginalAvg)
          }}</strong>
        </div>
        <div class="summary-item">
          <i class="bi bi-lightning-charge-fill" style="color: #67c23a"></i>
          <span>RT原始均价：</span>
          <strong class="rt-original-avg">{{
            formatPrice(rtOriginalAvg)
          }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  dayAheadOriginalData: {
    type: Array,
    default: () => [],
  },
  realTimeOriginalData: {
    type: Array,
    default: () => [],
  },
  dayAheadCaptureData: {
    type: Array,
    default: () => [],
  },
  realTimeCaptureData: {
    type: Array,
    default: () => [],
  },
  irradianceData: {
    type: Array,
    default: () => [],
  },
  timeType: {
    type: String,
    default: "minute",
  },
});

const tableData = computed(() => {
  const data = [];
  const length = props.timeType === "compute" ? 24 : 96;

  for (let i = 0; i < length; i++) {
    const time =
      props.timeType === "compute"
        ? `第${i + 1}时`
        : (() => {
            const hour = Math.floor(i / 4);
            const minute = (i % 4) * 15;
            return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          })();

    data.push({
      time,
      dayAheadOriginal: props.dayAheadOriginalData[i] || 0,
      realTimeOriginal: props.realTimeOriginalData[i] || 0,
      irradiance: props.irradianceData[i] || 0,
      dayAheadCapture: props.dayAheadCaptureData[i] || 0,
      realTimeCapture: props.realTimeCaptureData[i] || 0,
    });
  }

  return data;
});

const daOriginalAvg = computed(() => {
  const data = props.dayAheadOriginalData;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
});

const rtOriginalAvg = computed(() => {
  const data = props.realTimeOriginalData;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
});

const daCaptureAvg = computed(() => {
  const data = props.dayAheadCaptureData;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0);
});

const rtCaptureAvg = computed(() => {
  const data = props.realTimeCaptureData;
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0);
});

const formatPrice = (price) => {
  return typeof price === "number" ? price.toFixed(2) : "-";
};

const formatIrradiance = (val) => {
  return typeof val === "number" ? val.toFixed(4) : "-";
};

const pvTableRef = ref(null);

const clearSort = () => {
  if (pvTableRef.value) {
    pvTableRef.value.clearSort();
  }
};

const handleRowClick = () => {
  // no-op, placeholder to match pattern
};
</script>

<style scoped lang="scss">
.pv-capture-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-table) {
    flex: 1;
    font-size: 12px;
    overflow: hidden;

    .el-table__header-wrapper {
      th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;

        .table-header {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          i {
            font-size: 14px;
          }
          .time-header {
            position: relative;
            &:hover {
              opacity: 0.9;
              .sort-icon {
                color: #ff9800 !important;
              }
            }
            .sort-icon {
              font-size: 10px;
              margin-left: 4px;
              color: rgba(255, 255, 255, 0.7);
              transition: color 0.3s;
            }
          }
        }
      }
    }

    .el-table__body-wrapper {
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
        &:hover {
          background: #a8a8a8;
        }
      }
    }

    .time-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      i {
        color: #909399;
      }
    }

    .price-cell {
      &.da-original .price-value {
        color: #409eff;
        font-weight: 600;
      }
      &.rt-original .price-value {
        color: #67c23a;
        font-weight: 600;
      }
    }

    .irradiance-cell {
      .irradiance-value {
        color: #909399;
        font-weight: 500;
      }
    }

    .capture-cell {
      &.da-capture .capture-value {
        color: #0d9488;
        font-weight: 700;
      }
      &.rt-capture .capture-value {
        color: #d97706;
        font-weight: 700;
      }
    }
  }

  .table-footer {
    margin-top: 16px;
    padding: 12px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    border-radius: 8px;

    .summary {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 8px;

      .summary-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;

        i {
          font-size: 16px;
        }

        span {
          color: #606266;
        }

        strong {
          font-size: 14px;
          color: #2c3e50;

          &.da-avg {
            color: #0d9488;
          }
          &.rt-avg {
            color: #d97706;
          }
          &.da-original-avg {
            color: #409eff;
          }
          &.rt-original-avg {
            color: #67c23a;
          }
        }
      }
    }
  }
}
</style>
