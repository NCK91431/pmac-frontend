<template>
    <div class="load-compare-container">
        <!-- 基本信息 -->
        <div class="card info-card">
            <div class="card-header header-section">
                <h5 class="page-title">
                    <i class="bi bi-graph-up-arrow me-2"></i
                    >光伏发电预测回测分析
                </h5>
                <div class="date-selector">
                    <el-date-picker
                        v-model="selectedDate"
                        type="date"
                        placeholder="选择回测日期"
                        :disabled-date="disabledDates"
                        @change="handleDateChange"
                        value-format="YYYY-MM-DD"
                    />
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

            <!-- 无数据提示 -->
            <div v-if="!loading && !error && !compareData" class="empty-state">
                <i class="bi bi-calendar-x"></i>
                <h4>请选择回测日期</h4>
                <p>从日历中选择一个日期来查看回测分析结果</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { addDays, isBefore, isAfter, parseISO } from "date-fns";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import CompareBaseInfo from "./group/CompareBaseInfo.vue";
import CompareChart from "./group/CompareChart.vue";
import WeatherInfo from "../ResultSection/WeatherInfo.vue";
import WeatherChart from "../ResultSection/WeatherChart.vue";
import { useElecStore } from "@/store/elec";
const forecastStore = useElecStore();

const route = useRoute();
const router = useRouter();
const user = inject("user"); //注入全局用户状态
// 获取路由参数中的记录ID
const recordId = ref(route.params.recordId || null);
console.log("setup get recordId->", recordId.value);
const selectedDate = ref(null);
const compareData = computed(() => forecastStore.compare_data || {});
const loading = ref(false);
const error = ref(null);
const selectedCityIndex = ref(0);

// 计算选中的城市天气数据
const selectedCityWeather = computed(() => {
    if (!compareData.value || !compareData.value.cityWeatherForecast)
        return null;
    return (
        compareData.value.cityWeatherForecast[selectedCityIndex.value] || null
    );
});

// 计算可选日期范围
const availableDates = computed(() => {
    const mergeData = forecastStore.compare_merge;
    if (
        !mergeData ||
        !mergeData.merge_range ||
        mergeData.merge_range.length < 2
    ) {
        return null;
    }

    const [startDateStr, endDateStr] = mergeData.merge_range;
    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);

    // 砍掉前15天，即开始日期加上15天
    const availableStartDate = addDays(startDate, 15);

    // 如果可用开始日期晚于结束日期，则没有可用日期
    if (isAfter(availableStartDate, endDate)) {
        return null;
    }

    return {
        start: availableStartDate,
        end: endDate,
    };
});
// 禁用日期函数 - 根据合并后的日期范围来禁用不可选的日期
const disabledDates = (time) => {
    const dates = availableDates.value;
    if (!dates) return true; // 如果没有可用日期，禁用所有

    const date = new Date(time);
    return isBefore(date, dates.start) || isAfter(date, dates.end);
};

// 获取记录详情
const fetchRecordDetail = async () => {
    const id = recordId.value;
    if (!id) {
        error.value = "未找到记录ID";
        return;
    }

    try {
        loading.value = true;
        const response = await request.get(`/api/elec_history/${id}`);
        forecastStore.setCompareBaseinfo(response.data);
    } catch (err) {
        console.error("获取记录详情失败:", err);
        error.value = "获取记录详情失败，请稍后重试";
        ElMessage.error("获取记录详情失败");
    } finally {
        loading.value = false;
    }
};
// 获取合并数据与合并日期范围
async function fetchMergeData() {
    const id = recordId.value;
    if (!id) {
        error.value = "未找到记录ID";
        return;
    }
    try {
        const response = await request.get(`/api/elec_history/merge/${id}`);
        if (response.data.success) {
            forecastStore.setCompareMerge(response.data.result);
            // 设置默认选择的日期（选择可用日期范围内的最后一天）
            if (response.data.result && response.data.result.merge_range) {
                const merge_range = response.data.result.merge_range;
                if (merge_range && merge_range.length > 1) {
                    const startDate = parseISO(merge_range[0]);
                    const endDate = parseISO(merge_range[1]);

                    // 计算可用开始日期（原开始日期+15天）
                    const availableStartDate = addDays(startDate, 15);

                    // 如果可用开始日期不晚于结束日期，则选择结束日期
                    if (!isAfter(availableStartDate, endDate)) {
                        selectedDate.value = merge_range[1]; // 选择最后一天
                        await fetchCompareData(selectedDate.value); // 获取回测数据
                    } else {
                        // 如果没有可用日期，显示提示
                        error.value = "没有可用的回测日期";
                    }
                }
            }
        } else {
            ElMessage.error(response.data.message || "获取合并数据失败");
            forecastStore.setCompareMerge(null);
        }
    } catch (err) {
        console.error("获取合并数据失败:", err);
        ElMessage.error("获取合并数据失败，请稍后重试");
        forecastStore.setCompareMerge(null);
    }
}
// 获取回测数据
const fetchCompareData = async (selectDate) => {
    if (!recordId.value) return;
    const id = recordId.value;
    try {
        loading.value = true;
        error.value = null;
        const response = await request.post(
            `/api/elec_history/compare`,
            {
                selectDate,
                recordId: id,
                userId: user.value ? user.value.id : null,
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

// 处理日期变化
const handleDateChange = (date) => {
    if (date) {
        fetchCompareData(date);
    }
};

// 初始化
onMounted(() => {
    fetchMergeData();
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
