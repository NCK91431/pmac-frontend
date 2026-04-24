<template>
  <div class="config-display">
    <!-- 申报日期信息 -->
    <div class="config-section">
      <div class="section-header">
        <el-icon class="section-icon"><Calendar /></el-icon>
        <span class="section-title">申报日期</span>
      </div>
      <div class="section-content">
        <DateInfoDisplay :dateInfo="dateInfo" />
      </div>
    </div>

    <!-- 负荷模式 -->
    <div class="config-section">
      <div class="section-header">
        <el-icon class="section-icon"><DataAnalysis /></el-icon>
        <span class="section-title">负荷模式</span>
      </div>
      <div class="section-content">
        <div class="load-mode-badge">
          <i class="bi bi-lightning-charge-fill"></i>
          {{ loadMode }}
        </div>
      </div>
    </div>

    <!-- 概率计算窗口 -->
    <div class="config-section">
      <div class="section-header">
        <el-icon class="section-icon"><TrendCharts /></el-icon>
        <span class="section-title">概率计算窗口</span>
      </div>
      <div class="section-content">
        <div class="probability-window-badge" :class="modeDeclaration">
          <i class="bi bi-cpu" v-if="modeDeclaration === 'algorithm'"></i>
          <i class="bi bi-person-workspace" v-else></i>
          {{ probabilityWindowText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import DateInfoDisplay from "./DateInfoDisplay.vue";
import { Calendar, DataAnalysis, TrendCharts } from "@element-plus/icons-vue";

const props = defineProps({
  dateInfo: {
    type: Object,
    default: null,
    description: "申报日期信息，传递给DateInfoDisplay组件",
  },
  loadMode: {
    type: String,
    default: "",
    description: "负荷模式，如'算法预测'或'人工经验'",
  },
  probabilityWindow: {
    type: Object,
    default: () => ({}),
    description: "概率计算窗口配置对象",
  },
  modeDeclaration: {
    type: String,
    default: "",
    description: "概率计算方式：'manual'(人工)或'algorithm'(算法)",
  },
});

// 计算概率计算窗口的显示文本
const probabilityWindowText = computed(() => {
  const { modeDeclaration, probabilityWindow } = props;

  if (!probabilityWindow) {
    return "";
  }

  // 算法测算
  if (modeDeclaration === "algorithm") {
    return "算法测算";
  }

  // 人工计算
  if (modeDeclaration === "manual") {
    const { type, days, period } = probabilityWindow;

    if (type === "all") {
      // 最近N天
      return `人工计算·最近${days}天`;
    } else {
      // 最近N个同类周期
      const weekdayMap = {
        monday: "周一",
        tuesday: "周二",
        wednesday: "周三",
        thursday: "周四",
        friday: "周五",
        saturday: "周六",
        sunday: "周日",
      };
      const weekday = weekdayMap[type] || type;
      return `人工计算·最近${period}个${weekday}`;
    }
  }

  return "";
});
</script>

<style lang="scss" scoped>
.config-display {
  margin-top: 16px;
  margin-left: 20px;
  margin-bottom:20px;
  display: flex;
  gap:20px;

  .config-section {
   border-right: 1px solid #e2e8f0; 
   padding-right: 20px;
   &:last-child {
    border-right: none;
   }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 10px;

      .section-title {
        font-size: 0.8rem;
        font-weight: 600;
        color: #1e3c72;
        letter-spacing: 0.3px;
      }
    }

    .section-content {
      // 负荷模式徽章
      .load-mode-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 4px;
        border: 1px solid rgba(14, 165, 233, 0.3);
        color: #0284c7;
        font-weight: 600;
        font-size: 0.8rem;
        box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(14, 165, 233, 0.2);
        }

        i {
          font-size: 0.8rem;
          color: #0ea5e9;
        }
      }

      // 概率计算窗口徽章
      .probability-window-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.8rem;
        transition: all 0.3s ease;

        i {
          font-size: 0.8rem;
        }

        // 人工计算样式
        &.manual {
          background: linear-gradient(
            135deg,
            #fef3c7 0%,
            #fde68a 100%
          );
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #b45309;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(245, 158, 11, 0.2);
          }

          i {
            color: #f59e0b;
          }
        }

        // 算法测算样式
        &.algorithm {
          background: linear-gradient(
            135deg,
            #ecfdf5 0%,
            #d1fae5 100%
          );
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #047857;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
          }

          i {
            color: #10b981;
          }
        }
      }
    }
  }
}
</style>