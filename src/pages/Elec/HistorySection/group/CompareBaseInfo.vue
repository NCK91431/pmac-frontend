<template>
    <div class="card-body">
        <!-- 左侧 -->
        <div class="info-grid">
            <div class="info-item">
                <div class="label"><i class="bi bi-clock"></i> 创建时间:</div>
                <div class="value">
                    {{ formatDate(record.created_at) }}
                </div>
            </div>
            <div class="info-item">
                <div class="label"><i class="bi bi-box-seam"></i> 容量:</div>
                <div class="value">
                    {{ record.pv_capacity ? record.pv_capacity : 0 }}kW
                </div>
            </div>
            <div class="info-item">
                <div class="label">
                    <i class="bi bi-calendar4-week"></i> 数据范围:
                </div>
                <div class="value">
                    {{ merge_range.join(" 至 ") }}
                </div>
            </div>
            <div class="info-item">
                <div class="label"><i class="bi bi-geo-alt"></i> 地点:</div>
                <div class="value">
                    {{ formatLocation(record.location) }}
                </div>
            </div>
        </div>

        <!-- 右侧 -->
        <div class="model-metrics">
            <h5 class="title">
                <i class="bi bi-speedometer2"></i>
                模型评估指标
            </h5>
            <div class="content">
                <div
                    class="metric-card first compact"
                    v-if="route.name !== 'elec_example'"
                >
                    <div class="metric-icon compact">
                        <i class="bi bi-bar-chart-line"></i>
                    </div>
                    <div class="metric-content compact">
                        <div class="metric-label compact">总体误差</div>
                        <div class="metric-value compact">
                            <text>{{ modelMetrics.E_RMSE }}</text>
                            <text class="unit">%</text>
                        </div>
                    </div>
                </div>

                <div class="metric-card second compact">
                    <div class="metric-icon compact">
                        <i class="bi bi-calendar-day"></i>
                    </div>
                    <div class="metric-content compact">
                        <div class="metric-label compact">
                            {{
                                route.name == "elec_example"
                                    ? "预测误差"
                                    : "单日误差"
                            }}
                        </div>
                        <div class="metric-value compact">
                            <text>{{ dailyMetrics.E_RMSE }}</text>
                            <text class="unit">%</text>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useElecStore } from "@/store/elec";
import { useRoute } from "vue-router";
import { computed } from "vue";
const forecastStore = useElecStore();

const route = useRoute();

const record = computed(() => forecastStore.compare_baseinfo || {});
const merge_range = computed(
    () => forecastStore.compare_merge?.merge_range || []
);

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const formatLocation = (location) => {
    if (!location || !Array.isArray(location)) return "-";
    return location.join("-");
};

/* ---------------- 模型评估指标 --------------- */
const modelMetrics = computed(
    () => forecastStore.compare_data?.modelMetrics || {}
);

const dailyMetrics = computed(
    () => forecastStore.compare_data?.dailyMetrics || {}
);
</script>

<style lang="scss" scoped>
.info-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .card-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-bottom: 1px solid #dee2e6;
        padding: 10px 15px;

        h5 {
            margin: 0;
            font-weight: 600;
            color: #2c3e50;

            i {
                color: #2c6fbb;
                margin-right: 6px;
            }
        }
    }

    .card-body {
        padding: 12px 15px;
        display: grid;
        grid-template-columns: 2fr 1fr;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 10px;
    }

    .info-item {
        display: flex;
        align-items: center;
        min-height: 28px;

        .label {
            flex: 0 0 100px;
            color: #6c757d;
            display: flex;
            align-items: center;

            i {
                margin-right: 5px;
                width: 14px;
                text-align: center;
            }
        }

        .value {
            flex: 1;
            font-weight: 500;
            color: #2c3e50;
            display: flex;
            align-items: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .badge-custom {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 600;
        line-height: 1;

        &.customer-T {
            background-color: rgba(52, 152, 219, 0.1);
            color: #3498db;
            border: 1px solid rgba(52, 152, 219, 0.2);
        }

        &.customer-S {
            background-color: rgba(155, 89, 182, 0.1);
            color: #9b59b6;
            border: 1px solid rgba(155, 89, 182, 0.2);
        }

        &.badge-pv-yes {
            background-color: rgba(46, 204, 113, 0.1);
            color: #2ecc71;
            border: 1px solid rgba(46, 204, 113, 0.2);
        }

        &.badge-pv-no {
            background-color: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
            border: 1px solid rgba(231, 76, 60, 0.2);
        }

        &.badge-pv-unknown {
            background-color: rgba(241, 196, 15, 0.1);
            color: #f1c40f;
            border: 1px solid rgba(241, 196, 15, 0.2);
        }

        &.forecast-badge {
            background-color: rgba(142, 68, 173, 0.1);
            color: #8e44ad;
            border: 1px solid rgba(142, 68, 173, 0.2);
        }
    }

    @media (max-width: 992px) {
        .info-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
    }

    @media (max-width: 768px) {
        .info-grid {
            grid-template-columns: 1fr 1fr;
        }

        .info-item {
            .label {
                flex: 0 0 60px;
            }
        }
    }

    @media (max-width: 576px) {
        .info-grid {
            grid-template-columns: 1fr;
            gap: 8px;
        }
    }
}

/* 模型评估指标 */
.model-metrics {
    .title {
        i {
            font-size: 24px;
            color: #2c6fbb;
            margin-right: 12px;
        }
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
    }
    .content {
        display: flex;
        gap: 20px;
        .metric-card {
            display: flex;
            align-items: center;
            margin-top: 12px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;
            padding: 8px 25px;
            .metric-icon {
                width: 36px;
                height: 36px;
                margin-right: 12px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2c6fbb 0%, #1a4e8e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                i {
                    font-size: 1.1rem;
                    color: white;
                }
            }

            .metric-content {
                flex: 1;
                .metric-label {
                    font-size: 0.8rem;
                    color: #6c757d;
                    margin-bottom: 4px;
                }

                .metric-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #2c3e50;
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    .unit {
                        font-size: 0.8rem;
                        color: #6c757d;
                    }
                }
            }
        }
        .metric-card.first {
            .metric-icon {
                background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
            }
        }

        .metric-card.second {
            .metric-icon {
                background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
            }
        }
    }
}
</style>
