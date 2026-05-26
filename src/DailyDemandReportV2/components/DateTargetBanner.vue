<template>
  <div v-if="dateInfo" class="date-target-banner">
    <span class="dtb-label">🎯 申报目标日期</span>
    <span class="dtb-divider"></span>
    <div class="dtb-items">
      <span class="dtb-item"
        ><span class="dtb-k">📆</span
        ><span class="dtb-v">{{ dateInfo.date }}</span></span
      >
      <span class="dtb-item">
        <span class="dtb-k">星期</span>
        <span class="dtb-v">{{ dateInfo.day_of_the_week }}</span>
        <span :class="weekdayBadgeClass">{{ weekdayBadgeText }}</span>
      </span>
      <span class="dtb-item">
        <span class="dtb-k">类型</span>
        <span class="dtb-v">{{ dateInfo.date_type }}</span>
        <span v-if="dateInfo.date_type === '节假日'" class="dtb-badge holiday"
          >休</span
        >
      </span>
      <span class="dtb-item"
        ><span class="dtb-k">节假日</span
        ><span class="dtb-v">{{ dateInfo.holiday_name || "-" }}</span></span
      >
      <span class="dtb-item"
        ><span class="dtb-k">🌡️</span
        ><span class="dtb-v">{{ tempText }}</span></span
      >
      <span class="dtb-item"
        ><span class="dtb-k">🌤️</span
        ><span class="dtb-v">{{ dateInfo.weather || "-" }}</span></span
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  dateInfo: {
    type: Object,
    default: null,
  },
});

const weekdayBadgeClass = computed(() => {
  if (!props.dateInfo?.day_of_the_week) return "";
  const wd = props.dateInfo.day_of_the_week;
  const type = wd === "周六" || wd === "周日" ? "weekend" : "weekday";
  return `dtb-badge ${type}`;
});

const weekdayBadgeText = computed(() => {
  if (!props.dateInfo?.day_of_the_week) return "";
  const wd = props.dateInfo.day_of_the_week;
  if (wd === "周六" || wd === "周日") return "休息日";
  return "工作日";
});

const tempText = computed(() => {
  if (!props.dateInfo) return "-";
  const min = props.dateInfo.temperatureMin;
  const max = props.dateInfo.temperatureMax;
  if (min != null && max != null) return `${min}~${max}°C`;
  if (min != null) return `${min}°C`;
  if (max != null) return `${max}°C`;
  return "-";
});
</script>

<style scoped lang="scss">
.date-target-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 10px 18px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .dtb-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: #0050b3;
    font-size: 14px;
    white-space: nowrap;
  }

  .dtb-divider {
    width: 1px;
    height: 24px;
    background: #91d5ff;
  }

  .dtb-items {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;

    .dtb-item {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: #303133;
      white-space: nowrap;

      .dtb-k {
        color: #8c8c8c;
        font-weight: 400;
      }

      .dtb-v {
        font-weight: 600;
        color: #1d39c4;
      }
    }
  }

  .dtb-badge {
    font-size: 10px;
    padding: 0 7px;
    border-radius: 3px;
    font-weight: 500;
    line-height: 18px;
    margin-left: 2px;

    &.holiday {
      background: #fff1f0;
      color: #cf1322;
      border: 1px solid #ffa39e;
    }

    &.weekday {
      background: #f6ffed;
      color: #389e0d;
      border: 1px solid #b7eb8f;
    }

    &.weekend {
      background: #fff7e6;
      color: #d46b08;
      border: 1px solid #ffd591;
    }
  }
}
</style>
