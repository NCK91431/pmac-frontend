<template>
    <div class="load-compare-container">
        <!-- 产品广告 -->
        <div class="product-advertisement">
            <div class="ad-container">
                <div class="product-visual">
                    <div class="image-wrapper">
                        <img
                            src="https://pmac.leyi.host/downloads/pmac/products/EGate10.png"
                            alt="EGate10-PV 光伏四可控制器"
                            class="product-image"
                        />
                        <div class="floating-particle particle-1"></div>
                        <div class="floating-particle particle-2"></div>
                        <div class="floating-particle particle-3"></div>
                    </div>
                </div>
                <div class="product-content">
                    <div class="content-wrapper">
                        <div class="title-section">
                            <div class="badge">新品上市</div>
                            <h3 class="product-title">
                                EGate10-PV 光伏四可控制器
                            </h3>
                        </div>
                        <p class="product-desc">
                            专为光伏四可（可观、可测、可调、可控）场景设计，具备AGC/AVC功能，
                            兼容电网调度 101/104
                            协议，可实现光伏系统全环节数据安全传输与高效运维
                        </p>
                        <div class="features-grid">
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="bi bi-plug"></i>
                                </div>
                                <div class="feature-content">
                                    <span class="feature-title">灵活接入</span>
                                    <span class="feature-subtitle"
                                        >多协议兼容</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="bi bi-shield-check"></i>
                                </div>
                                <div class="feature-content">
                                    <span class="feature-title">安全防护</span>
                                    <span class="feature-subtitle"
                                        >数据加密</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="bi bi-tools"></i>
                                </div>
                                <div class="feature-content">
                                    <span class="feature-title">便捷安装</span>
                                    <span class="feature-subtitle"
                                        >即插即用</span
                                    >
                                </div>
                            </div>
                            <div class="feature-item">
                                <div class="feature-icon">
                                    <i class="bi bi-cpu"></i>
                                </div>
                                <div class="feature-content">
                                    <span class="feature-title">智能管控</span>
                                    <span class="feature-subtitle">AI优化</span>
                                </div>
                            </div>
                        </div>
                        <button class="cta-button" @click="goProductInfoPage">
                            <span class="button-text">探索产品详情</span>
                            <div class="button-arrow">
                                <i class="bi bi-arrow-up-right"></i>
                            </div>
                            <div class="button-glow"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
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
import { useRouter } from "vue-router";
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

const router = useRouter();
function goProductInfoPage() {
    router.push({ name: "product_EGate10" });
}
</script>

<style lang="scss" scoped>
.load-compare-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

/* 产品广告 */
.product-advertisement {
    margin-bottom: 30px;

    .ad-container {
        height: 100%;
        background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #e2e8f0 50%,
            #f1f5f9 100%
        );
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        position: relative;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(20px);

        // 自动动画效果
        animation: containerFloat 8s ease-in-out infinite;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.8) 0%,
                rgba(255, 255, 255, 0.4) 50%,
                rgba(255, 255, 255, 0.6) 100%
            );
            z-index: 1;
        }
    }

    .product-visual {
        flex: 0 0 45%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 30px;
        z-index: 2;

        .image-wrapper {
            position: relative;
            width: 300px;
            height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;

            .product-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 12px 36px rgba(0, 0, 0, 0.15));
                animation: imageFloat 6s ease-in-out infinite;
                z-index: 2;
                position: relative;
            }

            .floating-particle {
                position: absolute;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                opacity: 0.1;
                animation: particleFloat 4s ease-in-out infinite;

                &.particle-1 {
                    width: 60px;
                    height: 60px;
                    top: 10%;
                    left: 15%;
                    animation-delay: 0s;
                }

                &.particle-2 {
                    width: 40px;
                    height: 40px;
                    bottom: 20%;
                    right: 20%;
                    animation-delay: 1.5s;
                    background: linear-gradient(135deg, #10b981, #06b6d4);
                }

                &.particle-3 {
                    width: 30px;
                    height: 30px;
                    top: 60%;
                    left: 10%;
                    animation-delay: 3s;
                    background: linear-gradient(135deg, #f59e0b, #ef4444);
                }
            }
        }
    }

    .product-content {
        flex: 1;
        padding: 40px;
        display: flex;
        align-items: center;
        color: #1e293b;
        z-index: 2;

        .content-wrapper {
            max-width: 500px;

            .title-section {
                margin-bottom: 20px;

                .badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    animation: badgePulse 2s ease-in-out infinite;
                }

                .product-title {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0;
                    background: linear-gradient(
                        125deg,
                        #1a56db 0%,
                        #7e22ce 70%,
                        #ec4899 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1.2;
                    animation: titleSlideIn 1s ease-out;
                }
            }

            .product-desc {
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 28px;
                color: #64748b;
                animation: fadeInUp 0.8s ease 0.3s forwards;
                opacity: 0;
            }

            .features-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin-bottom: 32px;

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    animation: featureSlideIn 0.6s ease-out;
                    animation-fill-mode: both;

                    &:nth-child(1) {
                        animation-delay: 0.4s;
                    }
                    &:nth-child(2) {
                        animation-delay: 0.5s;
                    }
                    &:nth-child(3) {
                        animation-delay: 0.6s;
                    }
                    &:nth-child(4) {
                        animation-delay: 0.7s;
                    }

                    .feature-icon {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        border-radius: 10px;
                        color: white;
                        font-size: 18px;

                        i {
                            animation: iconBounce 2s ease-in-out infinite;
                        }
                    }

                    .feature-content {
                        display: flex;
                        flex-direction: column;

                        .feature-title {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 14px;
                        }

                        .feature-subtitle {
                            font-size: 12px;
                            color: #64748b;
                            margin-top: 2px;
                        }
                    }
                }
            }

            .cta-button {
                position: relative;
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 14px 28px;
                background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 8px 24px rgba(30, 41, 59, 0.2);
                animation: buttonSlideIn 0.8s ease 0.8s forwards;
                opacity: 0;
                transform: translateY(20px);

                .button-glow {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    transition: left 0.6s ease;
                }

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(30, 41, 59, 0.3);

                    .button-glow {
                        left: 100%;
                    }

                    .button-arrow {
                        transform: translate(2px, -2px);
                    }
                }

                .button-arrow {
                    transition: transform 0.3s ease;
                }
            }
        }
    }
}

// 关键帧动画
@keyframes containerFloat {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-8px);
    }
}

@keyframes imageFloat {
    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }
    33% {
        transform: translateY(-6px) rotate(0.5deg);
    }
    66% {
        transform: translateY(4px) rotate(-0.5deg);
    }
}

@keyframes particleFloat {
    0%,
    100% {
        transform: translateY(0px) scale(1);
        opacity: 0.1;
    }
    50% {
        transform: translateY(-20px) scale(1.1);
        opacity: 0.15;
    }
}

@keyframes badgePulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@keyframes titleSlideIn {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes featureSlideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes buttonSlideIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes iconBounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-3px);
    }
    60% {
        transform: translateY(-2px);
    }
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
    from {
        opacity: 0;
        transform: translateY(20px);
    }
}

// 响应式设计
@media (max-width: 1024px) {
    .product-advertisement {
        height: auto;
        min-height: 240px;

        .ad-container {
            flex-direction: column;
            height: auto;

            .product-visual {
                flex: none;
                height: 180px;
                padding: 20px;

                .image-wrapper {
                    width: 220px;
                    height: 160px;
                }
            }

            .product-content {
                padding: 30px;

                .content-wrapper {
                    .title-section .product-title {
                        font-size: 26px;
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .product-advertisement {
        .ad-container {
            .product-content {
                .content-wrapper {
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                }
            }
        }
    }
}
/* 基本信息 */
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
