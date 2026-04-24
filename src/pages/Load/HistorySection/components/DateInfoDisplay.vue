<template>
  <div class="date-info" v-if="dateInfo">
    <div class="selected-date-display">
      <i class="bi bi-calendar-event me-1"></i>
      {{ selectedDate }}
    </div>

    <div class="weekday">
      <i class="bi bi-calendar-week me-1"></i>
      {{ getWeekday(dateInfo.value) }}
    </div>
    <div
      class="date-type"
      :class="dateInfo.type"
    >
      <i
        class="me-1"
        :class="getDateTypeIcon(dateInfo.type)"
      ></i>
      {{ formatDateType(dateInfo.type) }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  dateInfo: {
    type: Object,
    default: null
  },
  selectedDate: {
    type: String,
    default: ''
  }
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
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.selected-date-display {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.weekday {
  display: flex;
  align-items: center;
  color: #475569;
  font-size: 0.9rem;
}

.date-type {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.date-type.weekday {
  background-color: #e0f2fe;
  color: #075985;
}

.date-type.weekend {
  background-color: #fef3c7;
  color: #92400e;
}

.date-type.holiday {
  background-color: #dcfce7;
  color: #166534;
}
</style>