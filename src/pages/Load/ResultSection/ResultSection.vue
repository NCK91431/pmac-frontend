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
                    <el-button type="primary" @click="downloadPredictionExcel">
                        <i class="bi bi-download me-2"></i>下载预测结果
                    </el-button>
                </div>
            </div>
            <div class="card-body">
                <div
                    class="date-selector mb-4 d-flex justify-content-between align-items-center"
                >
                    <h5 class="mb-0">预测日期: {{ date_format }}</h5>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-primary">
                            {{ date_format }}
                        </button>
                    </div>
                </div>
                <LoadChart
                    :date="prediction_result.date"
                    :loads="prediction_result.predictionData"
                />
            </div>
        </div>
        <!-- 天气预测结果 -->
        <div class="weather-section card border-0 shadow-sm mt-4">
            <div v-if="cityWeatherForecast && cityWeatherForecast.length">
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
                                v-for="(city, index) in cityWeatherForecast"
                                :key="index"
                                :label="city.location"
                                :value="index"
                            />
                        </el-select>
                    </div>
                </div>

                <div v-if="selectedCityWeather" class="weather-content">
                    <div class="weather-chart">
                        <WeatherChart
                            :temperature-data="
                                selectedCityWeather.temperatureForecast
                            "
                            :irradiation-data="
                                selectedCityWeather.irradiationForecast
                            "
                        />
                    </div>
                    <div class="weather-info card mb-4">
                        <WeatherInfo
                            :weather-info="selectedCityWeather.weatherInfo"
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
import { useLoadForecastStore } from "@/store/load";
const forecastStore = useLoadForecastStore();

const record = computed(() => forecastStore.responseData); //后端返回的完整数据；
//后端返回的预测结果数据
const prediction_result = computed(() => forecastStore.responseData.result);

const date_format = computed(() => {
    if (prediction_result.value && prediction_result.value.date) {
        const date = new Date(prediction_result.value.date);
        return `${date.getFullYear()}年${
            date.getMonth() + 1
        }月${date.getDate()}日`;
    }
    return "";
});

/*------------天气预测------------*/
// 城市天气预测数据
const cityWeatherForecast = computed(
    () => forecastStore.responseData.result.cityWeatherForecast || []
);
// 当前选中的城市索引
const selectedCityIndex = ref(0);
// 当前选中的城市天气数据
const selectedCityWeather = computed(() => {
    return cityWeatherForecast.value[selectedCityIndex.value] || null;
});
// 监听城市天气数据变化，默认选择第一个城市
watch(
    cityWeatherForecast,
    (newVal) => {
        if (newVal && newVal.length > 0) {
            selectedCityIndex.value = 0;
        }
    },
    { immediate: true }
);

/*------------下载预测结果excel文件------------*/
async function downloadPredictionExcel() {
    const recordId = record.value.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = record.value.resultFileName;

    try {
        ElMessage.success(`正在生成预测结果Excel文件${fileName}`);
        // 发送下载请求
        const response = await request.get(
            `/api/history/${recordId}/download/prediction`,
            {
                responseType: "blob",
            }
        );
        const blob = new Blob([response.data]); // 创建Blob对象并保存文件
        saveAs(blob, fileName);
    } catch (error) {
        // 处理错误响应（如后端返回JSON错误信息）
        if (error.response?.data?.type?.includes("application/json")) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorData = JSON.parse(reader.result);
                    ElMessage.error(`下载失败: ${errorData.error}`);
                } catch {
                    ElMessage.error("未知错误");
                }
            };
            reader.readAsText(error.response.data);
        } else {
            ElMessage.error("文件下载失败");
        }
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

    .card-body {
        padding: 20px;
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
