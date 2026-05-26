<template>
  <div class="declaration-date-section">
    <div class="field-group">
      <label>
        📅 申报日期
        <span class="tooltip" title="必填，格式：YYYY-MM-DD">必填</span>
      </label>
      <el-date-picker
        v-model="store.declarationDate"
        type="date"
        placeholder="选择申报日期"
        value-format="YYYY-MM-DD"
        size="large"
        style="width: 200px"
        @change="handleDateChange"
      />
      <div v-if="store.dateInfo" class="date-info-wrapper">
        <div class="date-info-display">
          <div class="info-item">
            <span class="label">📆 星期</span>
            <span class="value">{{ weekdayText }}</span>
          </div>
          <div class="info-item">
            <span class="label">🏷️ 日期类型</span>
            <span class="value">{{ dateTypeText }}</span>
          </div>
          <div class="info-item">
            <span class="label">🎉 节假日</span>
            <span class="value">{{ holidayText }}</span>
          </div>
          <div class="info-item">
            <span class="label">🌡️ 温度</span>
            <span class="value">{{ tempText }}</span>
          </div>
          <div class="info-item">
            <span class="label">🌤️ 天气</span>
            <span class="value">{{ store.dateInfo.weather }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="declaration-date-footer">
      <span
        >📍 数据来源：<span class="source-badge original"
          >DailyDemandReport.vue L168-186</span
        ></span
      >
      <span
        >🔗 该日期将作为 Step 2 查询基础 &amp; Step 3
        接口参数（startTime/endTime = {{ store.declarationDate }}）</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";

const store = useDailyDeclarationV2Store();

const weekdayText = computed(() => {
  if (!store.dateInfo) return "";
  return store.dateInfo.day_of_the_week || "";
});

const dateTypeText = computed(() => {
  if (!store.dateInfo) return "";
  const { date_type, holiday_name } = store.dateInfo;
  return holiday_name ? `${date_type}（${holiday_name}）` : date_type;
});

const holidayText = computed(() => {
  if (!store.dateInfo) return "";
  return store.dateInfo.holiday_name || "-";
});

const tempText = computed(() => {
  if (!store.dateInfo) return "";
  return `${store.dateInfo.temperatureMin}~${store.dateInfo.temperatureMax}°C`;
});

async function handleDateChange(date) {
  if (!date) return;
  store.declarationDate = date;
  const result = await store.fetchDateInfo(date);
  if (!result.success) {
    ElMessage.error("获取日期信息失败");
  }
  store.fetchStep1Charts(date);
}
</script>

<style scoped lang="scss">
.declaration-date-section {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);

  .field-group {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  label {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tooltip {
    font-size: 11px;
    color: #fff;
    background: #ff4d4f;
    padding: 1px 8px;
    border-radius: 4px;
    font-weight: 400;
    opacity: 1;
    position: static;
  }

  .date-info-wrapper {
    flex: 1;
    min-width: 300px;
  }

  .date-info-display {
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    font-size: 13px;

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .label {
        color: #8c8c8c;
        font-size: 12px;
        font-weight: 400;
      }

      .value {
        color: #303133;
        font-weight: 600;
      }
    }
  }

  .declaration-date-footer {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e8e8e8;
    font-size: 12px;
    color: #8c8c8c;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .source-badge.original {
    background: #f9f0ff;
    color: #722ed1;
    border: 1px solid #d3adf7;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 11px;
  }
}
</style>
