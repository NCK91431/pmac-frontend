<template>
  <div class="chart-info">
    <span class="selected-node">
      <i class="bi bi-node-plus"></i> 当前节点：{{ navText }}
    </span>
    <div class="date-info" v-if="type === 'date' && dateValue">
      <div class="selected-date-display">
        <i class="bi bi-calendar-event me-1"></i>
        {{ dateValue }}
      </div>
      <div class="weekday">
        <i class="bi bi-calendar-week me-1"></i>
        {{ weekday }}
      </div>
      <div class="date-type" :class="dateType">
        <i
          class="me-1"
          :class="
            dateType === 'weekend'
              ? 'bi-emoji-sunglasses'
              : 'bi-briefcase'
          "
        ></i>
        {{ dateType === "weekend" ? "周末" : "工作日" }}
      </div>
    </div>
    <div class="history-date-info" v-else-if="type === 'history' && dateRange && dateRange.length === 2">
      <div class="history-date-range">
        <i class="bi bi-calendar-range me-1"></i>
        {{ dateRange[0] }} ~ {{ dateRange[1] }}
      </div>
      <div class="history-date-desc">
        <i class="bi bi-clock-history me-1"></i>
        共覆盖
        <span class="day-count">{{ dayCount }}</span>
        天（含首尾）
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (val) => ['date', 'history'].includes(val),
  },
  navText: {
    type: String,
    default: '',
  },
  dateValue: {
    type: String,
    default: '',
  },
  weekday: {
    type: String,
    default: '',
  },
  dateType: {
    type: String,
    default: '',
  },
  dateRange: {
    type: Array,
    default: () => [],
  },
});

const dayCount = computed(() => {
  if (!props.dateRange || props.dateRange.length !== 2) return 0;
  const start = new Date(props.dateRange[0]);
  const end = new Date(props.dateRange[1]);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
});
</script>

<style scoped lang="scss">
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
        color: #5a6872;
        margin-right: 6px;
      }

      .day-count {
        color: #409eff;
        font-weight: 600;
        font-size: 15px;
        margin: 0 2px;
      }
    }
  }
}
</style>
