<template>
  <div class="load-history">
    <!-- 侧边栏历史记录列表 -->
    <div class="sidebar-panel">
      <HistorySidebar />
    </div>
    <!-- 主内容区域 -->
    <div class="content-panel">
      <template v-if="record.id">
        <div class="action-bar">
          <!-- 模式选择 -->
          <div class="mode-switcher">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="detail">历史记录详情</el-radio-button>
              <el-radio-button value="backtest">回测分析</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 下载结果、继续预测、删除 -->
          <button
            class="action-btn primary"
            @click="downloadPredictionExcel"
            :disabled="downloadLoading"
          >
            <i class="bi bi-download"></i>
            下载预测结果
            <i v-if="downloadLoading" class="bi bi-arrow-repeat spin"></i>
          </button>
          <button class="action-btn success" @click="continueForecast">
            <i class="bi bi-lightning-charge"></i>
            继续预测
          </button>
          <button class="action-btn danger" @click="deleteRecord">
            <i class="bi bi-trash3"></i>
            删除
          </button>
        </div>
        <!--配置信息与负荷特性分析 -->
        <div class="detail-sections">
          <Analysis
            v-if="result.load_stabilityindex && result.predictaBility"
            :load_stabilityindex="result.load_stabilityindex"
            :predictaBility="result.predictaBility"
            :mode="record.mode"
            :form-data="{
              location: record.location,
              forecast_range: record.forecast_range,
              customer_type: record.customer_type,
              pv_config: record.pv_config,
              pv_capacity: record.pv_capacity,
              unit: record.unit,
              mark_name: record.mark_name,
            }"
            :excel-info="record.excelInfo"
            :predict-id="record.id"
            :created-at="record.created_at"
          />
          <!-- 预测日选择器 -->
          <div class="day-selector">
            <span class="selector-label">预测日选择：</span>
            <el-radio-group v-model="selectedDay">
              <el-radio value="D+1">D + 1</el-radio>
              <el-radio value="D+2" :disabled="disabled_D2">D + 2</el-radio>
              <el-radio value="D+3" :disabled="disabled_D3">D + 3</el-radio>
            </el-radio-group>
          </div>

          <div class="section-block">
            <h3 class="section-title">
              <i class="bi bi-graph-up"></i>
              负荷预测结果
            </h3>
            <div class="date-info" v-if="result.date?.value">
              <span class="date-item selected-date-display">
                <i class="bi bi-calendar-event"></i>
                {{ result.date.value }}
              </span>
              <span class="date-item weekday-display">
                <i class="bi bi-calendar-week"></i>
                {{ getWeekday(result.date.value) }}
              </span>
              <span class="date-item" :class="'date-type-' + result.date.type">
                <i
                  :class="{
                    'bi-briefcase': result.date.type === 'weekday',
                    'bi-emoji-sunglasses': result.date.type === 'weekend',
                    'bi-balloon': result.date.type === 'holiday',
                  }"
                ></i>
                {{ formatDateType(result.date.type) }}
              </span>
            </div>
            <LoadChart
              :loads="result.predictionData"
              :date="result.date"
              :similarDayLoad="result.similarDayLoad"
              :unit="record.unit"
            />
            <div v-if="result.dataAnomaly?.abnormal_flag" class="anomaly-alert">
              <div class="anomaly-problem">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span class="anomaly-label">提示：</span>
                <span class="anomaly-text">{{
                  result.dataAnomaly.problem
                }}</span>
              </div>
              <div class="anomaly-suggestion">
                <i class="bi bi-lightbulb-fill"></i>
                <span class="anomaly-label">建议：</span>
                <span class="anomaly-text">{{
                  result.dataAnomaly.suggestion
                }}</span>
              </div>
            </div>
          </div>

          <div v-if="selectedCityWeather" class="section-block">
            <h3 class="section-title">
              <i class="bi bi-cloud-sun"></i>
              天气信息
            </h3>
            <div class="city-selector">
              <el-select
                v-model="selectedCityIndex"
                placeholder="选择城市"
                style="width: 300px"
              >
                <el-option
                  v-for="(city, index) in cityWeatherForecast"
                  :key="index"
                  :label="city.location"
                  :value="index"
                />
              </el-select>
            </div>
            <WeatherInfo
              :weather-info="selectedCityWeather.weatherInfo"
              horizontal
            />
            <div v-if="cityWeatherForecast?.length" style="margin-top: 16px">
              <WeatherChart
                :temperature-data="selectedCityWeather.temperatureForecast"
                :irradiation-data="selectedCityWeather.irradiationForecast"
              />
            </div>
          </div>
        </div>
      </template>
      <div v-else class="empty-state">
        <el-icon :size="48"><FolderOpened /></el-icon>
        <span>请从左侧列表选择一条记录</span>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="editMarkNameDialogVisible"
    title="编辑标记名称"
    width="400px"
    center
  >
    <div class="edit-mark-name-dialog">
      <el-input
        v-model="editMarkName"
        placeholder="请输入标记名称（不超过15字）"
        maxlength="15"
        show-word-limit
        clearable
      />
      <div class="dialog-tip">
        <el-icon><InfoFilled /></el-icon>
        你可以给此次建模取名，不超过15字
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editMarkNameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMarkName" :loading="saveLoading"
          >确认</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import HistorySidebar from "./HistorySection/HistorySidebar.vue";
import LoadChart from "./ResultSection/LoadChart.vue";
import WeatherChart from "./ResultSection/WeatherChart.vue";
import WeatherInfo from "./ResultSection/WeatherInfo.vue";
import Analysis from "./ConfigSection/components/Analysis.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { InfoFilled, FolderOpened } from "@element-plus/icons-vue";
import request from "@/utils/request";
import * as XLSX from "xlsx";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();
const router = useRouter();

const activeHistoryRecordId = computed(
  () => forecastStore.activeHistoryRecordId,
);
const activeHistoryRecord = computed(() => forecastStore.activeHistoryRecord);

const record = ref({});
const result = computed(() => record.value.result || {});
const format_pred_dates = computed(() => {
  if (activeHistoryRecord.value.prediction_date) {
    return activeHistoryRecord.value.prediction_date.value;
  }
  if (activeHistoryRecord.value.pred_dates?.length) {
    let str = activeHistoryRecord.value.pred_dates[0].value;
    if (activeHistoryRecord.value.pred_dates[1]) {
      const item_str = activeHistoryRecord.value.pred_dates[1].value;
      const item_arr = item_str.split("-");
      str += `、${item_arr[1]}-${item_arr[2]}`;
    }
    if (activeHistoryRecord.value.pred_dates[2]) {
      const item_str = activeHistoryRecord.value.pred_dates[2].value;
      const item_arr = item_str.split("-");
      str += `、${item_arr[1]}-${item_arr[2]}`;
    }
    return str;
  }
});

const disabled_D2 = computed(() => {
  return !activeHistoryRecord.value.pred_dates?.[1];
});
const disabled_D3 = computed(() => {
  return !activeHistoryRecord.value.pred_dates?.[2];
});

const selectedDay = ref("D+1");

const getWeekday = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `星期${weekdays[date.getDay()]}`;
};

const formatDateType = (type) => {
  const typeMap = {
    weekday: "工作日",
    weekend: "周末",
    holiday: "节假日",
  };
  return typeMap[type] || type;
};

const cityWeatherForecast = computed(
  () => record.value.result?.cityWeatherForecast || [],
);
const selectedCityIndex = ref(0);
const viewMode = ref("detail");
const selectedCityWeather = computed(() => {
  return cityWeatherForecast.value[selectedCityIndex.value] || null;
});
watch(
  cityWeatherForecast,
  (newVal) => {
    if (newVal?.length > 0) {
      selectedCityIndex.value = 0;
    }
  },
  { immediate: true },
);

async function getRecordDetailById() {
  const id = activeHistoryRecordId.value;
  if (!id) return;
  const selected_day = selectedDay.value;
  const response = await request.get(`/api/history/${id}/${selected_day}`);
  record.value = response.data;
}

onMounted(() => {
  getRecordDetailById();
});

watch(activeHistoryRecordId, (newId) => {
  if (newId) {
    getRecordDetailById();
    selectedDay.value = "D+1";
  }
});

watch(selectedDay, () => {
  getRecordDetailById();
});

const formatCustomerType = (type) => {
  const types = {
    hospital: "医院",
    mall: "商超",
    discrete: "离散工业",
    continuous: "连续工业",
  };
  return types[type] || type;
};

const downloadLoading = ref(false);

async function downloadPredictionExcel() {
  const id = activeHistoryRecordId.value;
  if (!id) {
    ElMessage.error("记录ID不存在，无法下载文件");
    return;
  }
  downloadLoading.value = true;
  try {
    const response = await request.get(`/api/history/${id}/download/result`);
    if (!response.data.success) {
      throw new Error(response.data.error || "获取预测数据失败");
    }
    const predictionData = response.data.data;
    const wsData = [];
    const timeRow = [
      "",
      ...Array.from(
        { length: 24 },
        (_, i) => `${String(i).padStart(2, "0")}:00`,
      ),
    ];
    wsData.push(timeRow);
    ["D+1", "D+2", "D+3"].forEach((day) => {
      if (predictionData[day]?.date) {
        const row = [
          predictionData[day].date.value,
          ...predictionData[day].values,
        ];
        wsData.push(row);
      }
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "预测结果");
    ws["!cols"] = [{ wch: 12 }, ...Array(24).fill({ wch: 8 })];
    const fileName = `负荷预测结果_${activeHistoryRecord.value.mark_name || ""}_${predictionData["D+1"]?.date?.value || ""}至${predictionData["D+3"]?.date?.value || ""}.xlsx`;
    XLSX.writeFile(wb, fileName);
    ElMessage.success("预测结果导出成功");
  } catch (error) {
    console.error("下载预测结果失败:", error);
    ElMessage.error(error.message || "预测结果下载失败");
  } finally {
    downloadLoading.value = false;
  }
}

const continueForecast = () => {
  if (forecastStore.stage == 1) {
    ElMessage.error("您有预测正在进行中，请待预测完成后再使用此功能");
    return;
  }
  const [start, end] = record.value.upload_date_range;
  forecastStore.setContinueData({
    end_date: record.value.upload_date_range[1],
    upload_date_range: record.value.upload_date_range,
    upload_date_range_format_text: `${start} 至 ${end}`,
  });
  forecastStore.updateFormData({
    customer_type: record.value.customer_type,
    pv_config: record.value.pv_config,
    location: record.value.location,
    forecast_range: record.value.forecast_range,
    previous_record_id: record.value.id,
  });
  forecastStore.setMode(record.value.mode);
  forecastStore.removeFile();
  forecastStore.resetStage();
  router.push("/loadpre");
};

async function deleteRecord() {
  try {
    await ElMessageBox.confirm(
      "确定要删除这条记录吗？删除后不可恢复。",
      "确认删除",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
    const id = activeHistoryRecordId.value;
    await request.delete(`/api/history/${id}`);
    ElMessage.success("删除成功");
    forecastStore.triggerRefreshHistoryList();
    forecastStore.clearActiveHistoryRecord();
    record.value = {};
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除记录失败:", error);
      ElMessage.error("删除失败");
    }
  }
}

const editMarkNameDialogVisible = ref(false);
const editMarkName = ref("");
const saveLoading = ref(false);

const openEditMarkNameDialog = () => {
  editMarkName.value = record.value.mark_name || "";
  editMarkNameDialogVisible.value = true;
};

const saveMarkName = async () => {
  if (editMarkName.value.trim().length > 15) {
    ElMessage.error("标记名称不能超过15字");
    return;
  }
  saveLoading.value = true;
  try {
    const response = await request.post("/api/history/update_mark_name", {
      record_id: record.value.id,
      mark_name: editMarkName.value.trim(),
    });
    if (response.data.success) {
      ElMessage.success("标记名称修改成功");
      forecastStore.triggerRefreshHistoryList();
      record.value.mark_name = editMarkName.value.trim();
      editMarkNameDialogVisible.value = false;
    } else {
      ElMessage.error(response.data.error || "修改失败");
    }
  } catch (error) {
    console.error("修改标记名称失败:", error);
    ElMessage.error("修改标记名称失败");
  } finally {
    saveLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.load-history {
  display: flex;
  height: 100%;
  min-height: calc(100vh - 140px);
  background: #f5f7fa;
}

.sidebar-panel {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.content-panel {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  min-width: 0;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;

  .action-bar-right {
    display: flex;
    gap: 10px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    i {
      font-size: 1rem;
    }

    &.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;

      &:hover {
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }

    &.success {
      background: #2c6fbb;
      color: #fff;

      &:hover {
        background: #1a5f9e;
        box-shadow: 0 4px 12px rgba(44, 111, 187, 0.3);
        transform: translateY(-2px);
      }
    }

    &.danger {
      background: #fff;
      color: #e74c3c;
      border: 1px solid #e74c3c;

      &:hover {
        background: #e74c3c;
        color: #fff;
        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        transform: translateY(-2px);
      }
    }
  }
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-block {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c6fbb;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 1.1rem;
  }
}

.day-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .selector-label {
    font-size: 0.9rem;
    color: #606266;
    font-weight: 500;
    white-space: nowrap;
  }
}

.date-info {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

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

.city-selector {
  margin-bottom: 16px;
}

.anomaly-alert {
  background: linear-gradient(135deg, #fef6e6, #fff2d9);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-left: 4px solid #ffc107;

  .anomaly-problem,
  .anomaly-suggestion {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.9rem;
    line-height: 1.5;

    .anomaly-label {
      font-weight: 600;
      flex-shrink: 0;
    }

    .anomaly-text {
      color: #3f4041;
      flex: 1;
    }
  }

  .anomaly-problem {
    i,
    .anomaly-label {
      color: #e6a23c;
    }
  }

  .anomaly-suggestion {
    margin-top: 10px;

    i,
    .anomaly-label {
      color: #67c23a;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: #c0c4cc;
  gap: 16px;

  span {
    font-size: 1rem;
  }
}

.edit-mark-name-dialog {
  padding: 10px 0;

  .dialog-tip {
    margin-top: 8px;
    color: #909399;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;

    .el-icon {
      font-size: 0.9rem;
    }
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.mode-switcher {
  margin-right: auto;
}
</style>
