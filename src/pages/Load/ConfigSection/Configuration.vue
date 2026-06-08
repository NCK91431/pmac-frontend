<template>
  <div class="configuration-panel">
    <!-- 标题行 -->
    <div class="config-header">
      <span class="config-title">配置总览</span>
      <span class="config-subtitle">新建预测</span>
    </div>

    <!-- 两列布局 -->
    <div class="config-body">
      <!-- 左列：配置详情 -->
      <div class="config-details">
        <!-- 模式 -->
        <div class="detail-row">
          <span class="detail-label">负荷预测模式</span>
          <span class="detail-value">{{ modeText }}</span>
        </div>
        <!-- 地点 -->
        <div class="detail-row">
          <span class="detail-label">地点</span>
          <span class="detail-value">{{ locationText }}</span>
        </div>
        <!-- 预测类型 -->
        <div class="detail-row">
          <span class="detail-label">预测类型</span>
          <span class="detail-value">{{ forecastRangeText }}</span>
        </div>
        <!-- 客户类型（仅分项） -->
        <div class="detail-row" v-if="mode === 'S'">
          <span class="detail-label">客户类型</span>
          <span class="detail-value">{{ customerTypeText }}</span>
        </div>
        <!-- 光伏配置（仅分项） -->
        <div class="detail-row" v-if="mode === 'S'">
          <span class="detail-label">光伏配置</span>
          <span class="detail-value">{{ pvConfigText }}</span>
        </div>
        <!-- 装机容量 -->
        <div class="detail-row" v-if="pv_capacity">
          <span class="detail-label">装机容量</span>
          <span class="detail-value">{{ pv_capacity }} kWp</span>
        </div>
        <!-- 单位（仅分项） -->
        <div class="detail-row" v-if="mode === 'S'">
          <span class="detail-label">数据单位</span>
          <span class="detail-value">{{ formData.unit }}</span>
        </div>
        <!-- 标记名称 -->
        <div class="detail-row" v-if="formData.mark_name">
          <span class="detail-label">标记名称</span>
          <span class="detail-value">{{ formData.mark_name }}</span>
        </div>
        <!-- 预测日 -->
        <div class="detail-row" v-if="predictionDaysText">
          <span class="detail-label">预测日</span>
          <span class="detail-value">{{ predictionDaysText }}</span>
        </div>
      </div>

      <!-- 右列：文件统计 -->
      <div class="config-files" v-if="uploadFileInfo">
        <div class="files-title">数据文件</div>
        <div class="file-stats-grid">
          <div class="stat-cell">
            <div class="stat-label">数据天数</div>
            <div class="stat-value">{{ uploadFileInfo.stats.days }} 天</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">时间粒度</div>
            <div class="stat-value">小时</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">日期范围</div>
            <div class="stat-value">{{ uploadFileInfo.dateRange?.join(' 至 ') }}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">数据状态</div>
            <div class="stat-value">{{ uploadFileInfo.stats.status }}</div>
          </div>
        </div>
        <div class="file-meta-row">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ uploadFileInfo.name }}</span>
          <span class="file-size">{{ formatFileSize(uploadFileInfo.size * 1024) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();

const mode = computed(() => forecastStore.mode);
const formData = computed(() => forecastStore.formData);
const uploadFileInfo = computed(() => forecastStore.excelInfo);

const modeText = computed(() => (mode.value === "T" ? "总负荷预测" : "分项负荷预测"));

const locationText = computed(() => {
  const loc = formData.value.location;
  if (!loc || loc.length === 0) return "未设置";
  return loc.join(" / ");
});

const forecastRangeText = computed(() => {
  const map = {
    "D-4": "D-4 → D+1、D+2、D+3",
    "D-3": "D-3 → D+1、D+2、D+3",
    "D-2": "D-2 → D+1、D+2、D+3",
    "D-1": "D-1 → D+1、D+2、D+3",
  };
  return map[formData.value.forecast_range] || formData.value.forecast_range || "未设置";
});

const customerTypeText = computed(() => {
  const map = {
    hospital: "医院",
    mall: "商超",
    discrete: "离散工业",
    continuous: "连续工业",
  };
  return map[formData.value.customer_type] || formData.value.customer_type || "未设置";
});

const pvConfigText = computed(() => {
  const map = { yes: "有", no: "无", unknown: "不确定" };
  return map[formData.value.pv_config] || formData.value.pv_config || "未设置";
});

const pv_capacity = computed(() => formData.value.pv_capacity);

const predictionDaysText = computed(() => {
  if (!uploadFileInfo.value || !formData.value.forecast_range) return "";
  return uploadFileInfo.value.prediction_dates?.join(", ") || "";
});

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
</script>

<style lang="scss" scoped>
.configuration-panel {
  background: #fff;
}

.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eee;
  margin-bottom: 18px;
}

.config-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
}

.config-subtitle {
  font-size: 0.75rem;
  color: #888;
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 3px;
}

/* 两列 */
.config-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

/* 左列：配置详情 */
.config-details {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 0.8rem;
  color: #888;
}

.detail-value {
  font-size: 0.82rem;
  font-weight: 500;
  color: #333;
  text-align: right;
}

/* 右列：文件统计 */
.config-files {
  display: flex;
  flex-direction: column;
}

.files-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.file-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
}

.stat-cell {
  padding: 10px 12px;
  background: #f8f8f8;
}

.stat-label {
  font-size: 0.72rem;
  color: #888;
}

.stat-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}

/* 文件信息行 */
.file-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f8f8;
}

.file-icon {
  font-size: 1rem;
  color: #2b6cb5;
}

.file-name {
  font-size: 0.8rem;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.72rem;
  color: #888;
  white-space: nowrap;
}
</style>
