<template>
  <div class="thirty-day-table-container">
    <div class="table-header-bar">
      <span class="table-title">
        <i class="bi bi-table"></i> 分时价差数据表
      </span>
      <el-button
        type="primary"
        plain
        size="small"
        @click="exportToCSV"
        :loading="csvExportLoading"
      >
        <i class="bi bi-download"></i> 导出CSV
      </el-button>
    </div>
    <el-table
      ref="thirtyDayTableRef"
      :data="tableData"
      border
      stripe
      size="small"
      height="100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="time" label="时间" width="85" fixed="left">
        <template #header>
          <div class="table-header time-header" @click.stop="clearSort" title="点击取消所有排序">
            <i class="bi bi-clock"></i>
            <span>时间</span>
            <i class="bi bi-sort-up sort-icon"></i>
          </div>
        </template>
        <template #default="{ row }">
          <div class="time-cell" :class="{ 'highlight-time': isPeakTime(row.time) }">
            <i class="bi bi-clock-history"></i>
            {{ row.time }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="realTimePrice" label="实时均价" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-lightning-charge-fill" style="color: #67c23a"></i>
            <span>实时均价</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="price-cell real-time">
            <span class="price-value">{{ formatPrice(row.realTimePrice) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="dayAheadPrice" label="日前均价" sortable>
        <template #header>
          <div class="table-header">
            <i class="bi bi-calendar-check-fill" style="color: #409eff"></i>
            <span>日前均价</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="price-cell day-ahead">
            <span class="price-value">{{ formatPrice(row.dayAheadPrice) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="价差均值" width="100" sortable :sort-method="sortDiff">
        <template #header>
          <el-tooltip effect="dark" content="价差均值 = 实时均价 - 日前均价" placement="top">
            <div class="table-header">
              <i class="bi bi-arrow-left-right" style="color: #e6a23c"></i>
              <span>价差均值</span>
            </div>
          </el-tooltip>
        </template>
        <template #default="{ row }">
          <div class="diff-cell" :class="getDiffClass(row.diff)">
            <i :class="getDiffIcon(row.diff)"></i>
            <span class="diff-value">{{ formatPrice(row.diff) }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="变化率" width="80">
        <template #header>
          <div class="table-header">
            <i class="bi bi-graph-up-arrow" style="color: #f56c6c"></i>
            <span>变化率</span>
          </div>
        </template>
        <template #default="{ row }">
          <div class="change-rate-cell">
            <el-progress
              :percentage="Math.abs(row.changeRate)"
              :color="getChangeRateColor(row.changeRate)"
              :show-text="false"
              :stroke-width="6"
            />
            <span class="rate-value" :class="getChangeRateClass(row.changeRate)">
              {{ formatChangeRate(row.changeRate) }}
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <div class="summary">
        <div class="summary-item">
          <i class="bi bi-graph-up-arrow" style="color: #67c23a"></i>
          <span>实时均价均值：</span>
          <strong>{{ formatPrice(averageRealTime) }}</strong>
        </div>
        <div class="summary-item">
          <i class="bi bi-graph-down-arrow" style="color: #409eff"></i>
          <span>日前均价均值：</span>
          <strong>{{ formatPrice(averageDayAhead) }}</strong>
        </div>
        <div class="summary-item">
          <i class="bi bi-arrow-left-right" style="color: #e6a23c"></i>
          <span>平均价差：</span>
          <strong :class="getDiffClass(averageDiff)">{{ formatPrice(averageDiff) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import * as XLSX from "xlsx";
import { ElMessage } from "element-plus";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  timeType: {
    type: String,
    default: "quarter",
  },
  nodeName: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
});

const csvExportLoading = ref(false);
const thirtyDayTableRef = ref(null);

const averageRealTime = computed(() => {
  if (props.tableData.length === 0) return 0;
  const sum = props.tableData.reduce((a, b) => a + b.realTimePrice, 0);
  return sum / props.tableData.length;
});

const averageDayAhead = computed(() => {
  if (props.tableData.length === 0) return 0;
  const sum = props.tableData.reduce((a, b) => a + b.dayAheadPrice, 0);
  return sum / props.tableData.length;
});

const averageDiff = computed(() => averageRealTime.value - averageDayAhead.value);

const formatPrice = (price) => {
  return typeof price === "number" ? price.toFixed(2) : "-";
};

const formatChangeRate = (rate) => {
  return `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
};

const isPeakTime = (time) => {
  const match = time.match(/^(\d+)/);
  if (!match) return false;
  const hour = parseInt(match[1]);
  return (hour >= 8 && hour <= 11) || (hour >= 18 && hour <= 21);
};

const getDiffClass = (diff) => {
  if (diff > 0) return "diff-positive";
  if (diff < 0) return "diff-negative";
  return "diff-zero";
};

const getDiffIcon = (diff) => {
  if (diff > 0) return "bi bi-arrow-up-circle-fill";
  if (diff < 0) return "bi bi-arrow-down-circle-fill";
  return "bi bi-dash-circle-fill";
};

const getChangeRateColor = (rate) => {
  if (rate > 5) return "#f56c6c";
  if (rate > 0) return "#e6a23c";
  if (rate < -5) return "#67c23a";
  if (rate < 0) return "#409eff";
  return "#909399";
};

const getChangeRateClass = (rate) => {
  if (rate > 5) return "rate-high";
  if (rate > 0) return "rate-medium";
  if (rate < -5) return "rate-low";
  if (rate < 0) return "rate-medium-negative";
  return "rate-zero";
};

const sortDiff = (a, b) => {
  return a.diff - b.diff;
};

const tableRowClassName = ({ row }) => {
  return isPeakTime(row.time) ? "peak-row" : "";
};

const clearSort = () => {
  if (thirtyDayTableRef.value) {
    thirtyDayTableRef.value.clearSort();
  }
};

const exportToCSV = async () => {
  csvExportLoading.value = true;
  try {
    const headers = ["时间", "实时均价(元/MWh)", "日前均价(元/MWh)", "价差均值(元/MWh)", "变化率"];
    const rows = props.tableData.map((row) => [
      row.time,
      formatPrice(row.realTimePrice),
      formatPrice(row.dayAheadPrice),
      formatPrice(row.diff),
      formatChangeRate(row.changeRate),
    ]);

    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = [
      { wch: 10 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 10 },
    ];
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "分时价差数据");

    const dateStr = props.endDate || new Date().toISOString().split("T")[0];
    const fileName = `30天分时价差数据_${dateStr}.csv`;

    XLSX.writeFile(wb, fileName, { bookType: "csv" });
    ElMessage.success("CSV数据导出成功");
  } catch (error) {
    console.error("导出CSV失败:", error);
    ElMessage.error("CSV数据导出失败");
  } finally {
    csvExportLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.thirty-day-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .table-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .table-title {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;

      i {
        margin-right: 6px;
        color: #409eff;
      }
    }
  }

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

    .peak-row {
      background-color: rgba(255, 152, 0, 0.05) !important;

      &:hover {
        > td {
          background-color: rgba(255, 152, 0, 0.1) !important;
        }
      }
    }

    .time-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      &.highlight-time {
        color: #ff9800;
        font-weight: 600;
      }

      i {
        color: #909399;
      }
    }

    .price-cell {
      display: flex;
      align-items: baseline;
      gap: 4px;

      &.real-time {
        .price-value {
          color: #67c23a;
          font-weight: 600;
        }
      }

      &.day-ahead {
        .price-value {
          color: #409eff;
          font-weight: 600;
        }
      }

      .price-value {
        font-size: 13px;
      }
    }

    .diff-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;

      &.diff-positive {
        background-color: rgba(64, 158, 255, 0.1);
        color: #409eff;

        i {
          color: #409eff;
        }
      }

      &.diff-negative {
        background-color: rgba(103, 194, 58, 0.1);
        color: #67c23a;

        i {
          color: #67c23a;
        }
      }

      &.diff-zero {
        background-color: rgba(144, 147, 153, 0.1);
        color: #909399;

        i {
          color: #909399;
        }
      }

      .diff-value {
        flex: 1;
        text-align: center;
      }
    }

    .change-rate-cell {
      display: flex;
      align-items: center;
      gap: 8px;

      :deep(.el-progress) {
        flex: 1;

        .el-progress-bar__outer {
          background-color: #f5f7fa;
        }
      }

      .rate-value {
        font-size: 11px;
        font-weight: 600;
        min-width: 60px;
        text-align: right;

        &.rate-high {
          color: #f56c6c;
        }

        &.rate-medium {
          color: #e6a23c;
        }

        &.rate-low {
          color: #67c23a;
        }

        &.rate-medium-negative {
          color: #409eff;
        }

        &.rate-zero {
          color: #909399;
        }
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

          &.diff-positive {
            color: #409eff;
          }

          &.diff-negative {
            color: #67c23a;
          }
        }
      }
    }
  }
}
</style>
