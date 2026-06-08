<template>
  <div>
    <!-- 负荷预测结果 -->
    <div class="result-section card border-0 shadow-sm mt-4">
      <div
        class="card-header bg-white d-flex justify-content-between align-items-center"
      >
        <h3 class="h5 mb-0 text-success">
          <i class="bi bi-graph-up-arrow me-2"></i>预测结果
        </h3>
        <div class="download-buttons">
          <el-button
            type="primary"
            @click="downloadPredictionExcel"
            :loading="downloadLoading"
          >
            <i class="bi bi-download me-2"></i>下载预测结果
          </el-button>
        </div>
      </div>

      <!-- 预测结果展示 -->
      <div
        class="prediction-result-show d-flex justify-content-between align-items-center"
      >
        <!-- 日期信息展示部分 -->
        <div class="date-info" v-if="prediction_result.date.value">
          <div class="selected-date-display">
            <i class="bi bi-calendar-event me-1"></i>
            {{ prediction_result.date.value }}
          </div>

          <div class="weekday">
            <i class="bi bi-calendar-week me-1"></i>
            {{ getWeekday(prediction_result.date.value) }}
          </div>
          <div class="date-type" :class="prediction_result.date.type">
            <i
              class="me-1"
              :class="{
                'bi-briefcase': prediction_result.date.type === 'weekday',
                'bi-emoji-sunglasses':
                  prediction_result.date.type === 'weekend',
                'bi-balloon': prediction_result.date.type === 'holiday',
              }"
            ></i>
            {{ formatDateType(prediction_result.date.type) }}
          </div>
        </div>
        <!-- 新增：预测日选择器 -->
        <el-radio-group v-model="selectedDay">
          <el-radio value="D+1" :disabled="record.result.predictionD1 == null"
            >D + 1</el-radio
          >
          <el-radio value="D+2" :disabled="record.result.predictionD2 == null"
            >D + 2</el-radio
          >
          <el-radio value="D+3" :disabled="record.result.predictionD3 == null"
            >D + 3</el-radio
          >
        </el-radio-group>
      </div>
      <!-- 结果图表 -->
      <LoadChart
        :date="prediction_result.date"
        :loads="prediction_result.predictionData"
        :similarDayLoad="prediction_result.similarDayLoad"
        :unit="unit"
      />
    </div>
    <!-- 天气预测结果 -->
    <div class="weather-section card border-0 shadow-sm mt-4">
      <div
        v-if="
          prediction_result.cityWeatherForecast &&
          prediction_result.cityWeatherForecast.length
        "
      >
        <div
          class="card-header bg-white d-flex justify-content-between align-items-center"
        >
          <h3 class="h5 mb-0 text-success">
            <i class="bi bi-cloud-sun me-2"></i>天气信息
          </h3>
          <div class="city-selector">
            <el-select
              v-model="selectedCityIndex"
              placeholder="选择城市"
              style="width: 300px"
            >
              <el-option
                v-for="(city, index) in prediction_result.cityWeatherForecast"
                :key="index"
                :label="city.location"
                :value="index"
              />
            </el-select>
          </div>
        </div>

        <div v-if="selectedCityWeather" class="weather-content">
          <div class="weather-info card mb-4">
            <WeatherInfo :weather-info="selectedCityWeather.weatherInfo" />
          </div>
          <div class="weather-chart">
            <WeatherChart
              :temperature-data="selectedCityWeather.temperatureForecast"
              :irradiation-data="selectedCityWeather.irradiationForecast"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import LoadChart from "./LoadChart.vue";
import WeatherChart from "./WeatherChart.vue";
import WeatherInfo from "./WeatherInfo.vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useLoadForecastStore } from "@/store/load";
const forecastStore = useLoadForecastStore();

const record = computed(() => forecastStore.responseData); //后端返回的完整数据；
const unit = computed(() => forecastStore.responseData.formData.unit);

// 当前选中的预测日
const selectedDay = ref("D+1");

//后端返回的预测结果数据
const prediction_result = computed(() => {
  const result = { ...forecastStore.responseData.result };
  if (selectedDay.value == "D+1") {
    delete result.predictionD2;
    delete result.predictionD3;
    const formated = {
      ...result.predictionD1,
      ...result,
    };
    delete formated.predictionD1;
    return formated;
  }
  if (selectedDay.value == "D+2") {
    delete result.predictionD1;
    delete result.predictionD3;
    const formated = {
      ...result.predictionD2,
      ...result,
    };
    delete formated.predictionD2;
    return formated;
  }
  if (selectedDay.value == "D+3") {
    delete result.predictionD1;
    delete result.predictionD2;
    const formated = {
      ...result.predictionD3,
      ...result,
    };
    delete formated.predictionD3;
    return formated;
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

/*------------天气预测------------*/
// 当前选中的城市索引
const selectedCityIndex = ref(0);
// 当前选中的城市天气数据
const selectedCityWeather = computed(() => {
  return (
    prediction_result.value.cityWeatherForecast[selectedCityIndex.value] || null
  );
});
// 监听城市天气数据变化，默认选择第一个城市
watch(
  prediction_result.value.cityWeatherForecast,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      selectedCityIndex.value = 0;
    }
  },
  { immediate: true },
);

/*------------下载预测结果excel文件------------*/
const downloadLoading = ref(false);
async function downloadPredictionExcel() {
  const id = record.value.recordId;
  if (!id) {
    ElMessage.error("记录ID不存在，无法下载文件");
    return;
  }

  downloadLoading.value = true;

  try {
    // 1. 获取预测数据
    const response = await request.get(`/api/history/${id}/download/result`);

    if (!response.data.success) {
      throw new Error(response.data.error || "获取预测数据失败");
    }

    const predictionData = response.data.data;

    // 2. 准备Excel数据
    const wsData = [];

    // 第一行：时间点标题
    const timeRow = [
      "",
      ...Array.from(
        { length: 24 },
        (_, i) => `${String(i).padStart(2, "0")}:00`,
      ),
    ];
    wsData.push(timeRow);

    // 添加各日预测数据行
    ["D+1", "D+2", "D+3"].forEach((day) => {
      if (predictionData[day] && predictionData[day].date) {
        const row = [
          predictionData[day].date.value,
          ...predictionData[day].values,
        ];
        wsData.push(row);
      }
    });

    // 3. 生成Excel文件
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "预测结果");

    // 4. 设置列宽
    ws["!cols"] = [
      { wch: 12 }, // 日期列
      ...Array(24).fill({ wch: 8 }), // 24个时间列
    ];

    // 5. 下载文件
    const fileName = `负荷预测结果${
      record.value.formData.mark_name || ""
    }_${predictionData["D+1"].date.value}至${
      predictionData["D+3"].date.value
    }.xlsx`;
    XLSX.writeFile(wb, fileName);

    ElMessage.success("预测结果导出成功");
  } catch (error) {
    console.error("下载预测结果失败:", error);
    ElMessage.error(error.message || "预测结果下载失败");
  } finally {
    downloadLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.result-section {
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .download-buttons {
      display: flex;
      gap: 10px;
    }
  }

  // 日期信息样式
  .prediction-result-show {
    margin-top: 20px;
    margin-right: 20px;
    margin-left: 20px;
  }
  .date-info {
    display: flex;
    gap: 12px;
    margin-bottom: 15px;
    text-align: center;

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

      &.weekday {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
        border: 1px solid rgba(#4caf50, 0.2);
      }

      &.weekend {
        background: rgba(156, 39, 176, 0.1);
        color: #9c27b0;
        border: 1px solid rgba(#9c27b0, 0.2);
      }

      &.holiday {
        background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
        color: #cf1322;
        border: 1px solid rgba(#f44336, 0.2);
      }
    }
  }
}
.weather-section {
  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .download-buttons {
      display: flex;
      gap: 10px;
    }
  }
  .weather-content {
    padding: 20px;
  }
  .weather-info {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: none;
    margin-top: 10px;
  }
}
</style>
