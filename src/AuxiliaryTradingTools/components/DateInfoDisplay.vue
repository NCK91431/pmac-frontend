<template>
  <div class="date-info" v-if="dateInfo">
    <div class="selected-date-display">
      <i class="bi bi-calendar-event me-1"></i>
      {{ formatDate(dateInfo.date) }}
    </div>
    <div class="weekday">
      <i class="bi bi-calendar-week me-1"></i>
      {{ getWeekday(dateInfo.date) }}
    </div>
    <div class="date-type" :class="getDateTypeValue(dateInfo.date_type)">
      <i class="me-1" :class="getDateTypeIcon(dateInfo.date_type)"></i>
      {{
        `${dateInfo.date_type} ${dateInfo.holiday_name ? `(${dateInfo.holiday_name})` : ""}`
      }}
    </div>
  </div>
</template>

<script setup>
const DATE_TYPE_MAP = [
  {
    name: "工作日",
    value: "workday",
    icon: "bi-briefcase",
  },
  {
    name: "法定节假日",
    value: "holiday",
    icon: "bi-emoji-laughing",
  },
  {
    name: "节假日",
    value: "holiday",
    icon: "bi-balloon",
  },
  {
    name: "调休节假日",
    value: "workday_adjust",
    icon: "bi-emoji-expressionless",
  },
  {
    name: "周六",
    value: "saturday",
    icon: "bi-emoji-sunglasses",
  },
  {
    name: "周日",
    value: "sunday",
    icon: "bi-emoji-sunglasses",
  },
];

defineProps({
  dateInfo: {
    type: Object,
    default: null,
  },
});

//转换显示日期为YYYY-MM-DD格式
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// 获取星期几
const getWeekday = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `星期${weekdays[date.getDay()]}`;
};

// 获取日期类型对应的名称
const getDateTypeValue = (type_name) => {
  return DATE_TYPE_MAP.find((item) => item.name === type_name)?.value || "";
};
// 获取日期类型对应的图标
const getDateTypeIcon = (type_name) => {
  return (
    DATE_TYPE_MAP.find((item) => item.name === type_name)?.icon ||
    "bi-briefcase"
  );
};
</script>

<style scoped>
.date-info {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 0.7rem;

  .selected-date-display,
  .weekday,
  .date-type {
    display: flex;
    align-items: center; /* 内部元素垂直居中 */
    min-height: 36px; /* 设置最小高度确保一致性 */
  }

  .selected-date-display {
    color: #1890ff;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
    background-color: rgba(24, 144, 255, 0.1);
    border: 1px solid rgba(24, 144, 255, 0.2);
  }

  .weekday {
    padding: 4px 12px;
    background: rgba(44, 111, 187, 0.1);
    border-radius: 4px;
    color: #2c6fbb;
    font-weight: 500;
    border: 1px solid rgba(#2c6fbb, 0.2);
  }

  .date-type {
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 500;

    /* 工作日 */
    &.workday {
      background: rgba(33, 150, 243, 0.1);
      color: #1976d2;
      border: 1px solid rgba(33, 150, 243, 0.2);
    }

    /* 周六 */
    &.saturday {
      background: rgba(76, 175, 80, 0.1);
      color: #4caf50;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    /* 周日 */
    &.sunday {
      background: rgba(156, 39, 176, 0.1);
      color: #9c27b0;
      border: 1px solid rgba(156, 39, 176, 0.2);
    }

    /* 法定节假日 */
    &.holiday {
      background: linear-gradient(135deg, #fff5f7 0%, #fce8ef 100%);
      color: #e91e63;
      border: 1px solid rgba(233, 33, 99, 0.2);
    }

    /* 调休节假日 */
    &.workday_adjust {
      background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
      color: #f57c00;
      border: 1px solid rgba(245, 124, 0, 0.2);
    }
  }
}
</style>
