<template>
  <div class="ai-demo-container">
    <div class="header-section">
      <h1 class="title">💡 大模型应用开发试验田</h1>
      <p class="subtitle">
        接入deepseek-v4-pro大模型，用自然语言抽取日前申报所用日期数据
      </p>
    </div>

    <div class="input-section">
      <div class="input-label">💬 输入你的查询需求</div>
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="2"
        placeholder="例如：查找前7个星期三且是雨天且温度在23至26度之间的日期"
        :disabled="loading"
        @keyup.enter="handleSearch"
      />
      <div class="input-actions">
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!prompt.trim()"
          @click="handleSearch"
        >
          {{ loading ? "大模型分析中..." : "发送查询" }}
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="result-section">
      <div v-if="errorMsg" class="error-section">
        <el-alert :title="errorMsg" type="error" show-icon :closable="false" />
        <el-button
          type="primary"
          plain
          size="small"
          style="margin-top: 12px"
          @click="handleSearch"
        >
          重试
        </el-button>
      </div>

      <div v-else-if="tableData.length > 0" class="table-section">
        <div class="table-header">
          <span class="table-title">📊 查询结果</span>
          <span class="table-count">共 {{ tableData.length }} 条记录</span>
        </div>
        <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
          size="small"
        >
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="day_of_the_week" label="星期" width="60">
            <template #default="scope">
              {{
                dayMap[scope.row.day_of_the_week] || scope.row.day_of_the_week
              }}
            </template>
          </el-table-column>
          <el-table-column prop="date_type" label="日期类型" width="90" />
          <el-table-column prop="holiday_name" label="节假日" width="80">
            <template #default="scope">
              {{ scope.row.holiday_name || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="temperatureMin" label="最低温" width="70" />
          <el-table-column prop="temperatureMax" label="最高温" width="70" />
          <el-table-column
            prop="cloudCoverEarlyMorning"
            label="凌云量"
            width="70"
          >
            <template #default="scope">
              {{ scope.row.cloudCoverEarlyMorning }}%
            </template>
          </el-table-column>
          <el-table-column prop="cloudCoverMorning" label="上午云量" width="70">
            <template #default="scope">
              {{ scope.row.cloudCoverMorning }}%
            </template>
          </el-table-column>
          <el-table-column
            prop="cloudCoverAfternoon"
            label="下午云量"
            width="70"
          >
            <template #default="scope">
              {{ scope.row.cloudCoverAfternoon }}%
            </template>
          </el-table-column>
          <el-table-column prop="cloudCoverEvening" label="晚上云量" width="70">
            <template #default="scope">
              {{ scope.row.cloudCoverEvening }}%
            </template>
          </el-table-column>
          <el-table-column prop="windSpeed" label="风速" width="70">
            <template #default="scope">
              {{ scope.row.windSpeed }} km/h
            </template>
          </el-table-column>
          <el-table-column prop="windDirection" label="风向°" width="65" />
          <el-table-column prop="weather" label="天气" width="80" />
        </el-table>
      </div>

      <div v-else-if="searched" class="empty-section">
        <el-empty description="暂无数据，请尝试其他查询条件" />
      </div>

      <div v-else class="placeholder-section">
        <el-empty description="输入查询条件后点击「发送查询」" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import request from "@/utils/request";

const prompt = ref("");
const loading = ref(false);
const tableData = ref([]);
const errorMsg = ref("");
const searched = ref(false);

const dayMap = {
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
  7: "周日",
};

async function handleSearch() {
  const text = prompt.value.trim();
  if (!text || loading.value) return;

  loading.value = true;
  errorMsg.value = "";
  tableData.value = [];
  searched.value = true;

  try {
    const res = await request.post("/api/ai/query", { prompt: text });
    const response = res.data;

    if (response.status === 0) {
      tableData.value = response.data;
    } else {
      errorMsg.value = response.msg || "查询失败";
    }
  } catch (error) {
    errorMsg.value = "网络请求失败，请检查网络连接后重试";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.ai-demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
  background: #f0f4ff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a56db;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.input-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.result-section {
  min-height: 200px;
}

.table-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.table-count {
  font-size: 13px;
  color: #6b7280;
}

.error-section {
  text-align: center;
  padding: 20px 0;
}

.empty-section {
  padding: 40px 0;
}

.placeholder-section {
  padding: 40px 0;
}
</style>
