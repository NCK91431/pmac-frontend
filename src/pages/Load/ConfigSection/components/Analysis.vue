<!-- 负荷稳定性与波动性分析与周期相关性分析展示组件 -->
<template>
  <div class="analysis-container">
    <div class="analysis-header">
      <i class="bi bi-graph-up-arrow"></i>
      <span class="analysis-title">配置信息与负荷特性分析</span>
    </div>
    <div class="row">
      <!-- 模型配置 -->
      <div class="col-md-6">
        <div class="section-header">
          <i class="bi bi-geo-alt"></i>
          <span class="section-title">模型配置</span>
        </div>
        <div class="config-grid">
          <div class="config-item config-item-id">
            <div class="config-label-container">
              <span class="config-label"
                ><i class="bi bi-aspect-ratio"></i>负荷预测模式</span
              >
              <span class="config-label"
                ><i class="bi bi-upc-scan"></i>预测ID：{{ predictId }}</span
              >
            </div>
            <span class="config-value badge-value" :class="'mode-' + mode">{{
              modeText
            }}</span>
            <span class="create-time-corner" v-if="createdAt"
              ><i class="bi bi-clock"></i> 创建时间：{{
                formattedCreatedAt
              }}</span
            >
          </div>
          <div class="config-item">
            <span class="config-label"
              ><i class="bi bi-marker-tip"></i>标记名称</span
            >
            <span
              class="config-value"
              :class="{ 'text-muted': !formData?.mark_name }"
              >{{ formData?.mark_name || "未标记名称" }}</span
            >
          </div>
          <!-- 目标预测日期 -->
          <div class="config-item config-item-full">
            <span class="config-label"
              ><i class="bi bi-calendar-date"></i>目标预测日期</span
            >
            <div class="prediction-tags" v-if="predictionDays.length">
              <span
                v-for="(day, index) in predictionDays"
                :key="index"
                class="prediction-tag"
                :class="day.type"
              >
                {{ day.date }} {{ day.weekday }} · {{ day.typeText }}
              </span>
            </div>
          </div>
          <!-- 负荷预测模式及预测类型 -->
          <div class="config-item">
            <span class="config-label"
              ><i class="bi bi-clipboard-pulse"></i>预测类型</span
            >

            <span
              class="range-badge"
              :class="'range-' + (formData?.forecast_range || '')"
              >{{ forecastRangeText }}</span
            >
          </div>

          <div class="config-item">
            <span class="config-label"><i class="bi bi-geo-alt"></i>地点</span>
            <span class="config-value">{{ locationText }}</span>
          </div>

          <div class="config-item" v-if="mode === 'S'">
            <span class="config-label"
              ><i class="bi bi-person"></i>客户类型</span
            >
            <span class="badge-custom">{{ customerTypeText }}</span>
          </div>
          <div class="config-item" v-if="mode === 'S'">
            <span class="config-label"
              ><i class="bi bi-sun"></i>{{ pvLabelText }}</span
            >
            <template v-if="formData?.pv_config === 'yes'">
              <span class="config-value">{{ pv_capacity }} kWp</span>
            </template>
            <template v-else>
              <span
                class="badge-custom"
                :class="
                  'badge-pv-' +
                  (formData?.pv_config === 'no' ? 'no' : 'unknown')
                "
                >{{ pvConfigText }}</span
              >
            </template>
          </div>

          <div class="config-item config-item-full" v-if="predictionDaysText">
            <span class="config-label"
              ><i class="bi bi-clipboard-pulse"></i>预测日</span
            >
            <span class="config-value">
              <el-tag size="small" type="success">{{
                predictionDaysText
              }}</el-tag>
            </span>
          </div>
        </div>
        <!-- 上传文件信息 -->
        <template v-if="excelInfo">
          <div class="section-header" style="margin-top: 15px">
            <i class="bi bi-file-earmark-text"></i>
            <span class="section-title">上传文件信息</span>
          </div>
          <div class="info-bar file-info-bar">
            <div class="info-group">
              <span class="info-label"
                ><i class="bi bi-file-earmark-text"></i>文件名</span
              >
              <span class="info-value">{{ excelInfo.name }}</span>
              <span class="config-file-size">{{
                formatFileSize(excelInfo.size * 1024)
              }}</span>
            </div>
            <div class="info-group">
              <span class="info-label"
                ><i class="bi bi-collection"></i>数据天数</span
              >
              <span class="info-value">{{ excelInfo.stats?.days }} 天</span>
            </div>
            <!-- 数据单位 -->
            <div class="info-group">
              <span class="info-label"
                ><i class="bi bi-rulers"></i>数据单位</span
              >
              <span class="info-value">{{ formData?.unit }}</span>
            </div>
            <div class="info-group">
              <span class="info-label"
                ><i class="bi bi-clock"></i>时间粒度</span
              >
              <span class="info-value">小时</span>
            </div>
            <div class="info-group">
              <span class="info-label"
                ><i class="bi bi-calendar4-week"></i>日期范围</span
              >
              <span class="info-value">{{
                excelInfo.dateRange?.[0] || "-"
              }}</span>
              <span class="date-sep">→</span>
              <span class="info-value">{{
                excelInfo.dateRange?.[1] || "-"
              }}</span>
            </div>
            <!-- <div class="info-group" v-if="excelInfo.stats?.status">
              <span class="info-label"
                ><i class="bi bi-check-circle"></i>数据状态</span
              >
              <span class="info-value">{{ excelInfo.stats?.status }}</span>
            </div> -->
            <div class="info-group">
              <span class="info-label"
                ><i class="bi bi-cloud-download"></i>下载文件</span
              >
              <span class="download-link" @click="downloadUploadExcel">
                <i class="bi bi-cloud-download"></i> 下载原文件
              </span>
            </div>
          </div>
        </template>
      </div>
      <!-- 负荷特性分析 -->
      <div class="col-md-6">
        <!-- 负荷稳定性与波动性分析 -->
        <div class="section-header">
          <i class="bi bi-speedometer2"></i>
          <span class="section-title">负荷稳定性与波动性分析</span>
        </div>
        <div class="metrics-grid">
          <div
            class="metric-item"
            v-for="(value, key) in stabilityMetrics"
            :key="key"
          >
            <div class="metric-icon" :class="getStabilityIcon(key)">
              <i :class="getStabilityIconClass(key)"></i>
            </div>
            <div class="metric-content">
              <div class="metric-name">
                {{ getStabilityLabel(key) }}
              </div>
              <div class="metric-value">
                {{ value.value }}
              </div>
              <div class="metric-description">
                {{ value.level }}
              </div>
            </div>
          </div>
        </div>
        <!-- 周期相关性分析 -->
        <div class="section-header" style="margin-top: 15px">
          <i class="bi bi-arrow-repeat"></i>
          <span class="section-title">周期相关性分析</span>
        </div>
        <div class="periodicity-metrics">
          <div
            class="period-item"
            v-for="(value, key) in periodicityMetrics"
            :key="key"
          >
            <div class="preiod-title">
              <div
                class="period-icon"
                :class="getPeriodStrengthClass(value.strength)"
              >
                <i :class="getPeriodIcon(key)"></i>
              </div>
              <div class="period-name">
                {{ getPeriodLabel(key) }}
              </div>
            </div>

            <div class="period-content">
              <div class="period-value">
                {{ value.periodicity }}
              </div>
              <div
                class="period-strength"
                :class="getPeriodStrengthClass(value.strength)"
              >
                {{ value.strength }}
              </div>
            </div>
          </div>
        </div>
        <div
          class="section-header model-metrics-header"
          style="margin-top: 15px"
          v-if="modelMetrics || dailyMetrics"
        >
          <i class="bi bi-speedometer2"></i>
          <span class="section-title">模型评估指标</span>
        </div>
        <div class="model-metrics-inline" v-if="modelMetrics || dailyMetrics">
          <div class="metric-card first compact" v-if="modelMetrics?.WMAPE">
            <div class="metric-icon compact">
              <i class="bi bi-bar-chart-line"></i>
            </div>
            <div class="metric-content compact">
              <div class="metric-label compact">总体误差</div>
              <div class="metric-value compact">
                <text>{{ modelMetrics.WMAPE }}</text>
                <text class="unit">%</text>
              </div>
            </div>
          </div>
          <div class="metric-card second compact" v-if="dailyMetrics?.WMAPE">
            <div class="metric-icon compact">
              <i class="bi bi-calendar-day"></i>
            </div>
            <div class="metric-content compact">
              <div class="metric-label compact">单日误差</div>
              <div class="metric-value compact">
                <text>{{ dailyMetrics.WMAPE }}</text>
                <text class="unit">%</text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { format, addDays } from "date-fns";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";

const props = defineProps({
  load_stabilityindex: Object,
  predictaBility: Object,
  mode: String,
  formData: Object,
  excelInfo: Object,
  predictId: [String, Number],
  createdAt: String,
  modelMetrics: {
    type: Object,
    default: null,
  },
  dailyMetrics: {
    type: Object,
    default: null,
  },
});

const modeText = computed(() =>
  props.mode === "T" ? "总负荷预测" : "分项负荷预测",
);
const locationText = computed(() => {
  let loc = props.formData?.location;
  if (typeof loc === "string") {
    try {
      loc = JSON.parse(loc);
    } catch {
      loc = [];
    }
  }
  if (!loc || !Array.isArray(loc) || loc.length === 0) return "未设置";
  return loc.join(" / ");
});
const forecastRangeText = computed(() => {
  const map = {
    "D-4": "D-4 → D+1、D+2、D+3",
    "D-3": "D-3 → D+1、D+2、D+3",
    "D-2": "D-2 → D+1、D+2、D+3",
    "D-1": "D-1 → D+1、D+2、D+3",
  };
  return (
    map[props.formData?.forecast_range] ||
    props.formData?.forecast_range ||
    "未设置"
  );
});
const customerTypeText = computed(() => {
  const map = {
    hospital: "医院",
    mall: "商超",
    discrete: "离散工业",
    continuous: "连续工业",
  };
  return (
    map[props.formData?.customer_type] ||
    props.formData?.customer_type ||
    "未设置"
  );
});
const pvLabelText = computed(() => {
  return props.formData?.pv_config === "yes" ? "光伏装机容量" : "光伏配置";
});
const pvConfigText = computed(() => {
  const map = { no: "无", unknown: "不确定" };
  return map[props.formData?.pv_config] || "未设置";
});
const pv_capacity = computed(() => props.formData?.pv_capacity);
const predictionDaysText = computed(() => {
  if (!props.excelInfo || !props.formData?.forecast_range) return "";
  return props.excelInfo.prediction_dates?.join(", ") || "";
});
const formattedCreatedAt = computed(() => {
  if (!props.createdAt) return "";
  try {
    return format(new Date(props.createdAt), "yyyy-MM-dd HH:mm");
  } catch {
    return props.createdAt;
  }
});

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getDayCount() {
  return 3;
}

function getDaysToAdd(forecastRange) {
  const offsetMap = {
    "D-1": 2,
    "D-2": 3,
    "D-3": 4,
    "D-4": 5,
  };
  return offsetMap[forecastRange] || 2;
}

const predictionDays = computed(() => {
  if (!props.excelInfo?.dateRange || !props.formData?.forecast_range) return [];

  const forecastRange = props.formData.forecast_range;
  const endDate = new Date(props.excelInfo.dateRange[1]);
  const baseDaysToAdd = getDaysToAdd(forecastRange);
  const dayCount = getDayCount(forecastRange);

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  function getWeekday(date) {
    return `星期${weekdays[date.getDay()]}`;
  }

  function getDateType(date) {
    const day = date.getDay();
    if (day === 0 || day === 6) return "weekend";
    return "weekday";
  }

  function getDateTypeText(type) {
    const typeMap = {
      weekday: "工作日",
      weekend: "周末",
      holiday: "节假日",
    };
    return typeMap[type] || type;
  }

  const days = [];
  for (let i = 0; i < dayCount; i++) {
    const predictionDate = addDays(endDate, baseDaysToAdd + i);
    const dateStr = format(predictionDate, "yyyy-MM-dd");
    const weekday = getWeekday(predictionDate);
    const type = getDateType(predictionDate);

    days.push({
      date: dateStr,
      weekday: weekday,
      type: type,
      typeText: getDateTypeText(type),
    });
  }
  return days;
});

async function downloadUploadExcel() {
  const id = props.predictId;
  if (!id) {
    ElMessage.error("记录ID不存在，无法下载文件");
    return;
  }
  const fileName = id + "_upload.xlsx";
  try {
    ElMessage.success(`正在下载您上传的文件${fileName}`);
    const response = await request.get(`/api/history/${id}/download/upload`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data]);
    saveAs(blob, fileName);
  } catch (error) {
    if (error.response?.data?.type?.includes("application/json")) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result);
          ElMessage.error(`下载失败: ${errorData.error}`);
        } catch {
          ElMessage.error("未知错误");
        }
      };
      reader.readAsText(error.response.data);
    } else {
      ElMessage.error("下载失败，请稍后重试");
    }
  }
}
// 负荷稳定性与波动性分析数据
const stabilityMetrics = computed(() => {
  if (!props.load_stabilityindex) return {};

  const stability = props.load_stabilityindex;
  return {
    loadRate: {
      value: `${(stability.loadRate * 100).toFixed(2)} %`,
      level: stability.loadRateLevel,
    },
    coefficient: {
      value: stability.coefficient.toFixed(2),
      level: stability.coefficientLevel,
    },
    avgVariation: {
      value: `${stability.avgVariation.toFixed(2)} %`,
      level: stability.avgVariationLevel,
    },

    dailyRatio: {
      value: stability.dailyRatio.toFixed(2),
      level: stability.dailyRatioLevel,
    },
    peakHeightratio: {
      value: stability.peakHeightratio.toFixed(2),
      level: stability.peakHeightratioLevel,
    },
    dailyPeaknum: {
      value: stability.dailyPeaknum.toFixed(2),
      level: stability.dailyPeaknumLevel,
    },
  };
});

// 周期相关性分析数据
const periodicityMetrics = computed(() => {
  if (!props.predictaBility) return {};

  const periodicity = props.predictaBility;
  return {
    dailyPeriodicity: {
      periodicity: periodicity.dailyPeriodicity.toFixed(2),
      strength: periodicity.dailyPeriodStrength,
    },
    weeklyPeriodicity: {
      periodicity: periodicity.weeklyPeriodicity.toFixed(2),
      strength: periodicity.weeklyPeriodStrength,
    },
    monthlyPeriodicity: {
      periodicity: periodicity.monthlyPeriodicity.toFixed(2),
      strength: periodicity.monthlyPeriodStrength,
    },
  };
});

// 负荷稳定性指标图标和标签
const getStabilityIcon = (key) => {
  const icons = {
    loadRate: "icon-load-rate",
    coefficient: "icon-coefficient",
    dailyPeaknum: "icon-peaknum",
    dailyRatio: "icon-ratio",
    peakHeightratio: "icon-peak",
    avgVariation: "icon-variation",
  };
  return icons[key] || "icon-default";
};

const getStabilityIconClass = (key) => {
  const iconClasses = {
    loadRate: "bi-speedometer2",
    coefficient: "bi-graph-up",
    dailyPeaknum: "bi-collection",
    dailyRatio: "bi-arrows-expand",
    peakHeightratio: "bi-arrow-up",
    avgVariation: "bi-activity",
  };
  return iconClasses[key] || "bi-info-circle";
};

const getStabilityLabel = (key) => {
  const labels = {
    loadRate: "负荷率",
    coefficient: "变异系数",
    dailyPeaknum: "日均峰数",
    dailyRatio: "日均峰谷比",
    peakHeightratio: "峰突出度",
    avgVariation: "负荷波动率",
  };
  return labels[key] || key;
};

// 周期相关性指标图标和标签
const getPeriodIcon = (key) => {
  const iconClasses = {
    dailyPeriodicity: "bi-sun",
    weeklyPeriodicity: "bi-calendar-week",
    monthlyPeriodicity: "bi-calendar-month",
  };
  return iconClasses[key] || "bi-calendar";
};

const getPeriodLabel = (key) => {
  const labels = {
    dailyPeriodicity: "日相关性",
    weeklyPeriodicity: "周相关性",
    monthlyPeriodicity: "月相关性",
  };
  return labels[key] || key;
};

// 周期相关性强度样式
const getPeriodStrengthClass = (strength) => {
  const strengthMap = {
    强: "strength-strong",
    中: "strength-medium",
    弱: "strength-weak",
  };
  return strengthMap[strength] || "strength-unknown";
};
</script>

<style lang="scss" scoped>
.analysis-container {
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
  border: 1px solid #e1e5ff;
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

// .stability-card {
//     background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
//     border-left: 6px solid #4d7cfe;
// }

// .periodicity-card {
//     background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%);
//     border-left: 6px solid #34d399;
// }
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 5px 12px;
  background: linear-gradient(
    135deg,
    rgba(76, 105, 255, 0.1) 0%,
    rgba(76, 105, 255, 0.05) 100%
  );
  border-radius: 8px;

  .section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #4c69ff;
    margin-left: 8px;
  }

  i {
    font-size: 0.9rem;
    color: #4c69ff;
  }
}

.analysis-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(76, 105, 255, 0.1);

  .analysis-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #4c69ff;
    margin-left: 10px;
  }

  i {
    font-size: 1.1rem;
    color: #4c69ff;
  }
}

// 负荷稳定性指标样式
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(77, 124, 254, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(77, 124, 254, 0.15);
    transform: translateY(-2px);
  }

  .metric-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 1.4rem;

    &.icon-load-rate {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: white;
    }

    &.icon-coefficient {
      background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
      color: white;
    }

    &.icon-peaknum {
      background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
      color: white;
    }

    &.icon-ratio {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    &.icon-peak {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    &.icon-variation {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
      color: #2c3e50;
    }
  }

  .metric-content {
    flex: 1;
    .metric-name {
      font-size: 0.85rem;
      color: #6c757d;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .metric-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .metric-description {
      font-size: 0.75rem;
      color: #8e9aaf;
      line-height: 1.3;
    }
  }
}

// 周期相关性分析样式
.periodicity-metrics {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.period-item {
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(52, 211, 153, 0.15);
    transform: translateY(-2px);
  }

  .preiod-title {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    .period-name {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }
    .period-icon {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      margin-right: 8px;
      justify-content: center;
      font-size: 0.8rem;

      &.strength-strong {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
        color: white;
      }

      &.strength-medium {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        color: white;
      }

      &.strength-weak {
        background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
        color: white;
      }

      &.strength-unknown {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }
  }

  .period-content {
    flex: 1;

    .period-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    .period-strength {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;

      &.strength-strong {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      &.strength-medium {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.2);
      }

      &.strength-weak {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
      }

      &.strength-unknown {
        background: rgba(107, 114, 128, 0.1);
        color: #6b7280;
        border: 1px solid rgba(107, 114, 128, 0.2);
      }
    }
  }
}

// 配置信息样式
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(76, 105, 255, 0.08);
  transition: all 0.3s ease;

  &:hover {
    background: white;
    box-shadow: 0 2px 8px rgba(76, 105, 255, 0.1);
  }

  &.config-item-full {
    grid-column: 1 / -1;
  }

  &.config-item-id {
    position: relative;
  }

  .config-label {
    font-size: 0.8rem;
    color: #909399;
    margin-bottom: 4px;
    font-weight: 500;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 0.85rem;
    }
  }

  .config-value {
    font-size: 0.9rem;
    font-weight: 500;
    color: #303133;
  }

  .badge-value {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-block;
    align-self: flex-start;

    &.mode-T {
      background: rgba(44, 111, 187, 0.1);
      color: #2c6fbb;
    }

    &.mode-S {
      background: rgba(155, 89, 182, 0.1);
      color: #9b59b6;
    }
  }

  .badge-custom {
    background-color: #e3f2fd;
    color: #1a73e8;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.85rem;
    white-space: nowrap;
    align-self: flex-start;

    &.badge-pv-yes {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    &.badge-pv-no {
      background-color: #ffebee;
      color: #c62828;
    }

    &.badge-pv-unknown {
      background-color: #fff8e1;
      color: #f57f17;
    }
  }

  .range-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 5px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    align-self: flex-start;

    &.range-D-4 {
      background-color: #e6f7ff;
      color: #1890ff;
    }

    &.range-D-3 {
      background-color: #fff7e6;
      color: #fa8c16;
    }

    &.range-D-2 {
      background-color: #fff0f6;
      color: #eb2f96;
    }

    &.range-D-1 {
      background-color: rgba(46, 204, 113, 0.1);
      color: #2ecc71;
    }
  }
}

.prediction-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prediction-tag {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 4px;

  &.weekday {
    background: #e8f0fe;
    color: #2b6cb5;
  }

  &.weekend {
    background: #f3e8ff;
    color: #7c3aed;
  }

  &.holiday {
    background: #fce8e6;
    color: #c62828;
  }
}

.text-muted {
  color: #c0c4cc !important;
  font-size: 0.8rem;
  font-weight: 400 !important;
}

.config-label-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.create-time-corner {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 0.78rem;
  font-style: italic;
  color: #909399;
  font-weight: 400;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 2px;

  i {
    font-size: 0.78rem;
  }
}

// 上传文件信息 - info-bar 风格
.file-info-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(76, 105, 255, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(76, 105, 255, 0.1);
  }

  .info-group {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 16px;
    border-right: 1px solid #ebeef5;

    &:last-child {
      border-right: none;
    }
  }

  .info-label {
    font-size: 0.8rem;
    color: #909399;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;

    i {
      font-size: 0.85rem;
    }
  }

  .date-sep {
    margin: 0 4px;
    color: #c0c4cc;
  }

  .info-value {
    font-size: 0.9rem;
    color: #303133;
    font-weight: 500;
    white-space: nowrap;
  }

  .config-file-size {
    font-size: 0.75rem;
    color: #909399;
    white-space: nowrap;
    margin-left: 2px;
  }

  .download-link {
    font-size: 0.85rem;
    color: #409eff;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: color 0.2s;

    &:hover {
      color: #337ecc;
      text-decoration: underline;
    }

    i {
      font-size: 0.9rem;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analysis-container {
    margin: 12px 0;
    padding: 0 8px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .period-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;

    .period-icon {
      margin-right: 0;
      margin-bottom: 12px;
      align-self: center;
    }

    .period-progress {
      width: 100%;
      margin-top: 12px;
    }
  }

  .metric-item {
    flex-direction: column;
    text-align: center;

    .metric-icon {
      margin-right: 0;
      margin-bottom: 12px;
    }
  }
}

.model-metrics-inline {
  display: flex;
  gap: 15px;
  margin-top: 12px;
}

.metric-card {
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 10px;

  &.first {
    background: linear-gradient(135deg, #52c234 0%, #061700 100%);
  }

  &.second {
    background: linear-gradient(135deg, #f5af19 0%, #f12711 100%);
  }

  .metric-icon.compact {
    font-size: 22px;
    opacity: 0.9;
  }

  .metric-content.compact {
    .metric-label.compact {
      font-size: 11px;
      opacity: 0.85;
      margin-bottom: 2px;
    }
    .metric-value.compact {
      font-size: 18px;
      font-weight: 600;

      text {
        &:last-child {
          font-size: 12px;
          margin-left: 2px;
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
