<template>
  <div class="date-info" v-if="dateInfo">
    <span class="date-item selected-date-display">
      <i class="bi bi-calendar-event me-1"></i>
      {{ selectedDate }}
    </span>
    <span class="date-item weekday-display">
      <i class="bi bi-calendar-week me-1"></i>
      {{ getWeekday(dateInfo.value) }}
    </span>
    <span class="date-item" :class="'date-type-' + dateInfo.type">
      <i class="me-1" :class="getDateTypeIcon(dateInfo.type)"></i>
      {{ formatDateType(dateInfo.type) }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  dateInfo: {
    type: Object,
    default: null,
  },
  selectedDate: {
    type: String,
    default: "",
  },
});

// 获取星期几
const getWeekday = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `星期${weekdays[date.getDay()]}`;
};

// 格式化日期类型
const formatDateType = (type) => {
  const typeMap = {
    weekday: "工作日",
    weekend: "周末",
    holiday: "节假日",
  };
  return typeMap[type] || type;
};

// 获取日期类型对应的图标
const getDateTypeIcon = (type) => {
  const iconMap = {
    weekday: "bi-briefcase",
    weekend: "bi-emoji-sunglasses",
    holiday: "bi-balloon",
  };
  return iconMap[type] || "bi-briefcase";
};
</script>

<style scoped>
.date-info {
  display: flex;
  gap: 12px;

  .date-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.9rem;

    &.selected-date-display {
      color: #1890ff;
      font-weight: 600;
      background: rgba(24, 144, 255, 0.1);
      border: 1px solid rgba(24, 144, 255, 0.2);
    }

    &.weekday-display {
      background: rgba(44, 111, 187, 0.1);
      color: #2c6fbb;
      font-weight: 500;
      border: 1px solid rgba(44, 111, 187, 0.2);
    }

    &.date-type-weekday {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      font-weight: 500;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    &.date-type-weekend {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
      font-weight: 500;
      border: 1px solid rgba(156, 39, 176, 0.2);
    }

    &.date-type-holiday {
      background: linear-gradient(135deg, #fff1f0, #ffccc7);
      color: #cf1322;
      font-weight: 500;
      border: 1px solid rgba(244, 67, 54, 0.2);
    }
  }
}
</style>
