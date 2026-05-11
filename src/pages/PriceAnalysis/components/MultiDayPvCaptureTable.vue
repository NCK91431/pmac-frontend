<template>
  <div class="pv-capture-table-container">
    <el-table
      ref="pvTableRef"
      :data="tableData"
      border
      stripe
      size="small"
      height="100%"
      :default-sort="{ prop: 'date', order: 'ascending' }"
    >
      <el-table-column prop="date" label="日期" width="100" fixed="left">
        <template #header>
          <div class="table-header time-header">
            <i class="bi bi-calendar"></i>
            <span>日期</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="date-cell">
            <i class="bi bi-calendar-day"></i>
            {{ formatDate(row.date) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="dayAheadCaptureAvg" label="日前捕获均价" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-graph-up-arrow" style="color: #0d9488"></i>
            <span>日前捕获均价</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="capture-cell da-capture">
            <span class="capture-value">{{
              formatPrice(row.dayAheadCaptureAvg)
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="realTimeCaptureAvg" label="实时捕获均价" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-graph-down-arrow" style="color: #d97706"></i>
            <span>实时捕获均价</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="capture-cell rt-capture">
            <span class="capture-value">{{
              formatPrice(row.realTimeCaptureAvg)
            }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="captureSpread" label="捕获价差" sortable>
        <template #header>
          <el-tooltip
            effect="dark"
            content="捕获价差=日前捕获均价-实时捕获均价"
            placement="top"
          >
            <div class="table-header">
              <i class="bi bi-arrow-left-right" style="color: #9c27b0"></i>
              <span>捕获价差</span>
            </div>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <div class="spread-cell" :class="getSpreadClass(row.captureSpread)">
            <span class="spread-value">{{
              formatPrice(row.captureSpread)
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
          <i class="bi bi-arrow-left-right" style="color: #9c27b0"></i>
          <span>价差均值：</span>
          <strong class="spread-avg" :class="spreadClass">{{
            formatPrice(spreadAvg)
          }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  dailyData: {
    type: Array,
    default: () => [],
  },
});

const tableData = computed(() => {
  return props.dailyData.map((item) => ({
    date: item.date,
    dayAheadCaptureAvg: item.dayAheadCaptureAvg,
    realTimeCaptureAvg: item.realTimeCaptureAvg,
    captureSpread: item.captureSpread,
  }));
});

const daCaptureAvg = computed(() => {
  const data = props.dailyData.map((d) => d.dayAheadCaptureAvg);
  if (!data || data.length === 0) return 0;
  const validData = data.filter((v) => v > 0);
  return validData.length > 0
    ? validData.reduce((a, b) => a + b, 0) / validData.length
    : 0;
});

const rtCaptureAvg = computed(() => {
  const data = props.dailyData.map((d) => d.realTimeCaptureAvg);
  if (!data || data.length === 0) return 0;
  const validData = data.filter((v) => v > 0);
  return validData.length > 0
    ? validData.reduce((a, b) => a + b, 0) / validData.length
    : 0;
});

const spreadAvg = computed(() => {
  const data = props.dailyData.map((d) => d.captureSpread);
  if (!data || data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
});

const spreadClass = computed(() => {
  const val = spreadAvg.value;
  if (val > 0) return "spread-positive";
  if (val < 0) return "spread-negative";
  return "spread-zero";
});

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined) return "-";
  return typeof price === "number" ? price.toFixed(2) : price;
};

const getSpreadClass = (spread) => {
  if (spread > 0) return "spread-positive";
  if (spread < 0) return "spread-negative";
  return "spread-zero";
};

const pvTableRef = ref(null);
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

    .date-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      i {
        color: #909399;
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

    .spread-cell {
      &.spread-positive .spread-value {
        color: #67c23a;
        font-weight: 700;
      }

      &.spread-negative .spread-value {
        color: #f56c6c;
        font-weight: 700;
      }

      &.spread-zero .spread-value {
        color: #909399;
        font-weight: 500;
      }
    }
  }

  .table-footer {
    margin-top: 16px;
    padding: 12px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);

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

          &.spread-avg {
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
  }
}
</style>
