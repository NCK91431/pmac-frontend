<template>
  <div class="ai-query-panel">
    <div class="aqp-label">💬 输入你的查询需求</div>
    <div class="aqp-input-wrapper">
      <el-input
        v-model="store.aiQueryText"
        type="textarea"
        :rows="1"
        placeholder="例如：查找前7个星期三且是雨天且温度在23至26度之间的日期"
        class="aqp-input"
        :disabled="readonly"
      />
    </div>
    <div class="aqp-actions">
      <el-button
        type="primary"
        @click="handleSend"
        :loading="loading"
        :disabled="readonly"
        class="aqp-btn"
      >
        发送查询
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";

defineProps({
  readonly: { type: Boolean, default: false },
});

const store = useDailyDeclarationV2Store();
const loading = ref(false);

const weekdayMap = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  7: "周日",
};

function transformApiItem(item) {
  return {
    date: item.date,
    day_of_the_week: weekdayMap[item.day_of_the_week] || "",
    date_type: item.date_type,
    holiday_name: item.holiday_name,
    temperatureMin: item.temperatureMin,
    temperatureMax: item.temperatureMax,
    cloudCoverEarlyMorning: item.cloudCoverEarlyMorning,
    cloudCoverMorning: item.cloudCoverMorning,
    cloudCoverAfternoon: item.cloudCoverAfternoon,
    cloudCoverEvening: item.cloudCoverEvening,
    windSpeed: item.windSpeed,
    windDirection: item.windDirection,
    weather: item.weather,
  };
}

async function handleSend() {
  if (!store.aiQueryText.trim()) return;
  loading.value = true;
  try {
    const res = await store.sendAiQuery(store.aiQueryText);
    if (res.status === 0 && Array.isArray(res.data)) {
      store.setQueryResults(res.data.map(transformApiItem));
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
.ai-query-panel {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 14px;
  background: #fafafa;

  .aqp-label {
    font-size: 13px;
    color: #8c8c8c;
    margin-bottom: 8px;
  }

  .aqp-input-wrapper {
    .aqp-input {
      :deep(.el-textarea__inner) {
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 13px;
        color: #303133;
        background: #fff;
        line-height: 1.5;
        min-height: 36px;
        resize: none;
        box-shadow: none;

        &::placeholder {
          color: #bfbfbf;
        }

        &:focus {
          border-color: #1890ff;
        }
      }
    }
  }

  .aqp-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;

    .aqp-btn {
      background: #1890ff;
      color: #fff;
      padding: 6px 18px;
      border-radius: 6px;
      font-size: 13px;
      border: none;
      height: auto;
      line-height: 1.5;

      &:hover {
        background: #40a9ff;
      }
    }
  }
}
</style>
