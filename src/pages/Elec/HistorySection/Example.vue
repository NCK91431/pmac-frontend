<template>
    <div class="load-compare-container">
        <!-- 在这里添加进入光伏发电预测功能页入口 -->
        <Banner />
        <!-- 基本信息 -->
        <div class="card info-card">
            <div class="card-header header-section">
                <h5 class="page-title">
                    <i class="bi bi-graph-up-arrow me-2"></i>
                    光伏发电预测案例展示
                </h5>
                <!-- 选择 "晴天案例" "雨天案例" -->
                <div class="weather-selector">
                    <div
                        class="btn-group"
                        role="group"
                        aria-label="天气案例选择"
                    >
                        <button
                            type="button"
                            class="btn weather-btn"
                            :class="{
                                'btn-primary': weather === 'sunny',
                                'btn-outline-primary': weather !== 'sunny',
                            }"
                            @click="changeWeather('sunny')"
                        >
                            <i class="bi bi-sun me-1"></i>晴天案例
                        </button>
                        <button
                            type="button"
                            class="btn weather-btn"
                            :class="{
                                'btn-primary': weather === 'rainy',
                                'btn-outline-primary': weather !== 'rainy',
                            }"
                            @click="changeWeather('rainy')"
                        >
                            <i class="bi bi-cloud-rain me-1"></i>雨天案例
                        </button>
                    </div>
                </div>
            </div>

            <CompareBaseInfo class="mb-4" />
        </div>

        <div class="content-section">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">加载中...</span>
                </div>
                <p class="mt-3">正在加载回测数据...</p>
            </div>

            <!-- 错误状态 -->
            <div v-if="error" class="error-container">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    {{ error }}
                </div>
            </div>

            <!-- 数据展示 -->
            <div
                v-if="!loading && !error && compareData"
                class="data-container"
            >
                <!-- 对比图表 -->
                <div class="card mb-4">
                    <div
                        class="card-header d-flex justify-content-between align-items-center"
                    >
                        <h4 class="mb-0 card-title">
                            <i class="bi bi-bar-chart me-2"></i>发电功率对比分析
                        </h4>
                        <div class="selected-date-display">
                            <i class="bi bi-calendar-event me-1"></i>
                            {{ selectedDate }}
                        </div>
                    </div>
                    <div class="card-body">
                        <CompareChart
                            :actual-data="compareData.sourseData"
                            :prediction-data="compareData.predictionData"
                            :capacity="compare_baseinfo.pv_capacity"
                        />
                    </div>
                </div>

                <!-- 天气信息 -->
                <div
                    v-if="
                        compareData.cityWeatherForecast &&
                        compareData.cityWeatherForecast.length
                    "
                    class="row mb-4"
                >
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="mb-0">
                                    <i class="bi bi-cloud-sun me-2"></i>天气信息
                                </h4>
                            </div>
                            <div class="card-body">
                                <div class="city-selector mb-4">
                                    <el-select
                                        v-model="selectedCityIndex"
                                        placeholder="选择城市"
                                        style="width: 300px"
                                    >
                                        <el-option
                                            v-for="(
                                                city, index
                                            ) in compareData.cityWeatherForecast"
                                            :key="index"
                                            :label="city.location"
                                            :value="index"
                                        />
                                    </el-select>
                                </div>

                                <div v-if="selectedCityWeather" class="row">
                                    <WeatherInfo
                                        :weather-info="
                                            selectedCityWeather.weatherInfo
                                        "
                                    />
                                    <WeatherChart
                                        :temperature-data="
                                            selectedCityWeather.temperatureForecast
                                        "
                                        :irradiation-data="
                                            selectedCityWeather.irradiationForecast
                                        "
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import CompareBaseInfo from "./group/CompareBaseInfo.vue";
import CompareChart from "./group/CompareChart.vue";
import WeatherInfo from "../ResultSection/WeatherInfo.vue";
import WeatherChart from "../ResultSection/WeatherChart.vue";
import Banner from "./group/Banner.vue";
import { useElecStore } from "@/store/elec";
const forecastStore = useElecStore();

const compareData = computed(() => forecastStore.compare_data || {});

const compare_baseinfo = computed(() => forecastStore.compare_baseinfo || {});
const loading = ref(false);
const error = ref(null);
const selectedCityIndex = ref(0);

const weather = ref("sunny");
const selectedDate = computed(() => {
    if (weather.value == "sunny") {
        return "2025-03-22";
    } else if (weather.value == "rainy") {
        return "2025-04-05";
    }
});

// 计算选中的城市天气数据
const selectedCityWeather = computed(() => {
    if (!compareData.value || !compareData.value.cityWeatherForecast)
        return null;
    return (
        compareData.value.cityWeatherForecast[selectedCityIndex.value] || null
    );
});

const changeWeather = (type) => {
    weather.value = type;
    fetchExampleData();
};

// 获取记录详情
const fetchRecordDetail = async () => {
    try {
        loading.value = true;
        const response = {
            data: {
                id: -1,
                user_id: -1,
                location: ["广东省", "珠海市", "香洲区"],
                pv_capacity: 100,
                created_at: "2025-03-22",
                upload_info: {
                    date_range: ["2025-05-16", "2025-08-24"],
                },
            },
        };
        forecastStore.setCompareBaseinfo(response.data);
    } catch (err) {
        console.error("获取记录详情失败:", err);
        error.value = "获取记录详情失败，请稍后重试";
        ElMessage.error("获取记录详情失败");
    } finally {
        loading.value = false;
    }
};

// 获取回测数据
const fetchExampleData = async () => {
    try {
        loading.value = true;
        error.value = null;

        const response = await request.post(
            `/api/elec_history/example`,
            {
                weather: weather.value,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.data.success) {
            forecastStore.setCompareData(response.data.result);
        } else {
            error.value = response.data.message || "获取回测数据失败";
            ElMessage.error(error.value);
            forecastStore.setCompareData(null);
        }

        // 默认选择第一个城市
        if (
            compareData.value.cityWeatherForecast &&
            compareData.value.cityWeatherForecast.length > 0
        ) {
            selectedCityIndex.value = 0;
        }
    } catch (err) {
        console.error("获取回测数据失败:", err);
        error.value = "获取回测数据失败，请稍后重试";
        ElMessage.error("获取回测数据失败");
    } finally {
        loading.value = false;
    }
};

// 初始化
onMounted(() => {
    fetchExampleData();
    fetchRecordDetail();
});
</script>

<style lang="scss" scoped>
.load-compare-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .page-title {
        color: #2c6fbb;
        margin: 0;
        font-weight: 600;
    }
}

.content-section {
    .loading-container {
        text-align: center;
        padding: 40px 0;

        .spinner-border {
            width: 3rem;
            height: 3rem;
        }

        p {
            margin-top: 16px;
            color: #6c757d;
        }
    }

    .error-container {
        padding: 20px;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #6c757d;

        i {
            font-size: 48px;
            margin-bottom: 16px;
            color: #adb5bd;
        }

        h4 {
            margin-bottom: 8px;
            color: #495057;
        }
    }

    .card {
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

        .card-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 1px solid #dee2e6;
            padding: 16px 20px;

            h4 {
                margin: 0;
                color: #2c3e50;
                font-weight: 600;
            }
            .card-title {
                color: #2c3e50;
                font-weight: 600;
            }

            .selected-date-display {
                color: #1890ff;
                padding: 6px 12px;
                border-radius: 6px;
                font-weight: 600;
                background-color: rgba(24, 144, 255, 0.1);
                border: 1px solid rgba(24, 144, 255, 0.2);
            }

            .weather-selector {
                display: flex;
                justify-content: flex-end;

                .btn-group {
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .weather-btn {
                    padding: 8px 16px;
                    font-weight: 500;
                    transition: all 0.3s ease;

                    i {
                        font-size: 1.1rem;
                    }

                    &:first-child {
                        border-top-left-radius: 8px;
                        border-bottom-left-radius: 8px;
                    }

                    &:last-child {
                        border-top-right-radius: 8px;
                        border-bottom-right-radius: 8px;
                    }
                }
            }
        }

        .card-body {
            padding: 20px;
        }
    }

    .city-selector {
        margin-bottom: 20px;
    }
}

@media (max-width: 768px) {
    .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }

    .content-section {
        .row {
            margin: 0;

            > div {
                padding: 0;
                margin-bottom: 16px;
            }
        }
    }
}
</style>
