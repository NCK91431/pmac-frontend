<template>
    <div class="load-compare-container">
        <!-- 在这里添加进入负荷预测功能页入口 -->
        <Banner />
        <!-- 基本信息 -->
        <div class="card info-card">
            <div class="card-header header-section">
                <h5 class="page-title">
                    <i class="bi bi-graph-up-arrow me-2"></i>负荷预测案例展示
                </h5>
                <!-- 选择 "总负荷案例" "分项负荷案例" -->
                <div class="mode-selector">
                    <div
                        class="btn-group"
                        role="group"
                        aria-label="案例类型选择"
                    >
                        <button
                            type="button"
                            class="btn mode-btn btn-outline-primary"
                            :class="mode == 'T' && 'active'"
                            @click="changeMode('T')"
                        >
                            <i class="bi bi-circle-fill"></i>
                            <text style="margin-left: 5px">总负荷案例</text>
                        </button>
                        <button
                            type="button"
                            class="btn mode-btn btn-outline-primary"
                            :class="mode == 'S' && 'active'"
                            @click="changeMode('S')"
                        >
                            <i class="bi bi-circle-half"></i>
                            <text style="margin-left: 5px">分项负荷案例</text>
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
                            <i class="bi bi-bar-chart me-2"></i>负荷对比分析
                        </h4>
                        <!-- 日期信息展示部分 -->
                        <div class="date-info" v-if="compareData.date">
                            <div class="selected-date-display">
                                <i class="bi bi-calendar-event me-1"></i>
                                {{ selectedDate }}
                            </div>

                            <div class="weekday">
                                <i class="bi bi-calendar-week me-1"></i>
                                {{ getWeekday(compareData.date.value) }}
                            </div>
                            <div
                                class="date-type"
                                :class="compareData.date.type"
                            >
                                <i
                                    class="me-1"
                                    :class="{
                                        'bi-briefcase':
                                            compareData.date.type === 'weekday',
                                        'bi-emoji-sunglasses':
                                            compareData.date.type === 'weekend',
                                        'bi-balloon':
                                            compareData.date.type === 'holiday',
                                    }"
                                ></i>
                                {{ formatDateType(compareData.date.type) }}
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <CompareChart
                            :actual-data="compareData.sourseData"
                            :prediction-data="compareData.predictionData"
                            :similarDayLoad="compareData.similarDayLoad"
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
import CompareBaseInfo from "./CompareBaseInfo.vue";
import CompareChart from "./CompareChart.vue";
import WeatherInfo from "../ResultSection/WeatherInfo.vue";
import WeatherChart from "../ResultSection/WeatherChart.vue";
import Banner from "./Banner.vue";
import { useLoadForecastStore } from "@/store/load";
const forecastStore = useLoadForecastStore();

const compareData = computed(() => forecastStore.compare_data || {});
const loading = ref(false);
const error = ref(null);
const selectedCityIndex = ref(0);

const selectedDate = ref("2025-07-04");

/* ----------------------------- 切换模式 ------------------------------ */

const mode = ref("T");

const changeMode = (val) => {
    mode.value = val;
    selectedDate.value = val == "T" ? "2025-07-04" : "2025-08-10";
    fetchRecordDetail();
    fetchExampleData();
};
/* ----------------------------- 日期信息 ------------------------------ */
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

/* ----------------------------- 天气 ------------------------------ */
// 计算选中的城市天气数据
const selectedCityWeather = computed(() => {
    if (!compareData.value || !compareData.value.cityWeatherForecast)
        return null;
    return (
        compareData.value.cityWeatherForecast[selectedCityIndex.value] || null
    );
});

// 获取记录详情
const fetchRecordDetail = async () => {
    try {
        loading.value = true;
        const T_response = {
            data: {
                id: -1,
                mode: "T",
                location: ["广东省"],
                forecast_range: "4days",
                created_at: "2025-07-01",
            },
        };
        const S_response = {
            data: {
                id: -1,
                mode: "S",
                customer_type: "mall",
                pv_config: "no",
                location: ["广东省", "珠海市", "香洲区"],
                forecast_range: "4days",
                created_at: "2025-08-08",

                prediction_date: "2025-08-10",
            },
        };
        const response = mode.value == "T" ? T_response : S_response;
        forecastStore.setCompareBaseinfo(response.data);
        forecastStore.setCompareMerge({
            merge_range: ["2025-01-01", "2025-08-05"],
        });
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
            `/api/history/example`,
            {
                mode: mode.value,
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
            .mode-selector {
                .btn-group {
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 1px solid #dee2e6;

                    .mode-btn {
                        padding: 8px 16px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        border: none;

                        i {
                            font-size: 1.1rem;
                        }

                        &:hover {
                            color: #fff;
                            background-color: #0d6efd;
                            border-color: rgba(#0d6efd, 0.2);
                        }
                        &.active {
                            color: #fff;
                            background-color: #0d6efd;
                            border-color: #0d6efd;
                        }

                        &:first-child {
                            border-top-left-radius: 8px;
                            border-bottom-left-radius: 8px;
                        }

                        &:last-child {
                            border-top-right-radius: 8px;
                            border-bottom-right-radius: 8px;
                        }

                        &.btn-primary {
                            background: linear-gradient(
                                135deg,
                                #2c6fbb 0%,
                                #1e5aa0 100%
                            );
                            color: white;
                            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
                        }

                        &.btn-outline-secondary {
                            background: white;
                            color: #6c757d;
                            border: 1px solid #dee2e6;

                            &:hover {
                                background: #f8f9fa;
                                color: #2c6fbb;
                            }
                        }
                    }
                }
            }
            // 日期信息样式
            .date-info {
                display: flex;
                gap: 12px;
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
                        background: linear-gradient(
                            135deg,
                            #fff1f0 0%,
                            #ffccc7 100%
                        );
                        color: #cf1322;
                        border: 1px solid rgba(#f44336, 0.2);
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
