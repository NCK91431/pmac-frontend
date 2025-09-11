<template>
    <div class="card-body">
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

        <!-- 模型评估指标 - 修改为两列布局 -->
        <div class="model-metrics">
            <div class="metrics-section">
                <div class="metrics-title">总体误差</div>
                <div class="metrics-grid compact">
                    <div
                        class="metric-card compact"
                        v-for="(value, key) in filteredOverallMetrics"
                        :key="'overall-' + key"
                    >
                        <div class="metric-icon compact">
                            <i class="bi" :class="getMetricIcon(key)"></i>
                        </div>
                        <div class="metric-content compact">
                            <div class="metric-label compact">
                                {{ getMetricLabel(key) }}
                            </div>
                            <div class="metric-value compact">
                                {{ value }}{{ getMetricUnit(key) }}
                            </div>
                        </div>
                        <div class="metric-tooltip compact">
                            <i
                                class="bi bi-info-circle"
                                :title="getMetricDescription(key)"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="metrics-section">
                <div class="metrics-title">单日误差</div>
                <div class="metrics-grid compact">
                    <div
                        class="metric-card compact"
                        v-for="(value, key) in filteredDailyMetrics"
                        :key="'daily-' + key"
                    >
                        <div class="metric-icon compact">
                            <i class="bi" :class="getMetricIcon(key)"></i>
                        </div>
                        <div class="metric-content compact">
                            <div class="metric-label compact">
                                {{ getMetricLabel(key) }}
                            </div>
                            <div class="metric-value compact">
                                {{ value }}{{ getMetricUnit(key) }}
                            </div>
                        </div>
                        <div class="metric-tooltip compact">
                            <i
                                class="bi bi-info-circle"
                                :title="getMetricDescription(key)"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useElecStore } from "@/store/elec";
import { computed } from "vue";
const forecastStore = useElecStore();

const record = computed(() => forecastStore.compare_baseinfo || {});
const merge_range = computed(
    () => forecastStore.compare_merge?.merge_range || []
);

const formatCustomerType = (type) => {
    const types = {
        hospital: "医院",
        mall: "商超",
        discrete: "离散工业",
        continuous: "连续工业",
    };
    return types[type] || type;
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const formatDateRange = (range) => {
    if (!range || range.length < 2) return "-";
    return `${range[0]} 至 ${range[1]}`;
};

const formatLocation = (location) => {
    if (!location || !Array.isArray(location)) return "-";
    return location.join("-");
};

/* ---------------- 模型评估指标 --------------- */

// 计算属性 - 总体指标（过滤掉MAPE）
const filteredOverallMetrics = computed(() => {
    const modelMetrics = forecastStore.compare_data?.modelMetrics;
    if (!modelMetrics) return {};
    return {
        MAE: modelMetrics.MAE, //平均绝对误差
        RMSE: modelMetrics.RMSE, //均方根误差
        E_RMSE: modelMetrics.E_RMSE, //相对均方根误差
    };
});

// 计算属性 - 单日指标（过滤掉MAPE）
const filteredDailyMetrics = computed(() => {
    const dailyMetrics = forecastStore.compare_data?.dailyMetrics;
    if (!dailyMetrics) return {};
    return {
        MAE: dailyMetrics.MAE, //平均绝对误差
        RMSE: dailyMetrics.RMSE, //均方根误差
        E_RMSE: dailyMetrics.E_RMSE, //相对均方根误差
    };
});

const metricConfig = {
    MAE: {
        label: "平均绝对误差",
        unit: "",
        icon: "bi-graph-down",
        description: "衡量预测值与实际值之间的平均绝对差异",
    },
    RMSE: {
        label: "均方根误差",
        unit: "",
        icon: "bi-graph-down-arrow",
        description: "衡量预测误差的标准差，对大误差更敏感",
    },
    E_RMSE: {
        label: `相对均方根误差`,
        unit: "%",
        icon: "bi-percent",
        description: "考虑数据权重的平均百分比误差",
    },
};

const getMetricLabel = (key) => {
    return metricConfig[key]?.label || key;
};

const getMetricUnit = (key) => {
    return metricConfig[key]?.unit || "";
};

const getMetricIcon = (key) => {
    return metricConfig[key]?.icon || "bi-question-circle";
};

const getMetricDescription = (key) => {
    return metricConfig[key]?.description || "";
};
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
    display: flex;
    gap: 14px;
    margin-top: 20px;
    .metrics-section {
        flex: 1;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 12px;

        .metrics-title {
            font-weight: 600;
            color: #2c3e50;
            text-align: center;
            font-size: 1rem;
        }
    }
    .metrics-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
    }

    .metric-card {
        display: flex;
        align-items: center;
        margin-top: 12px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        position: relative;
        padding: 8px;
        // &:hover {
        //     transform: translateY(-3px);
        //     box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        // }

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
            }
        }

        .metric-tooltip {
            position: absolute;
            top: 6px;
            right: 6px;

            i {
                color: #6c757d;
                font-size: 0.8rem;
                cursor: help;

                &:hover {
                    color: #2c6fbb;
                }
            }
        }
    }

    // 为不同指标卡片添加不同颜色
    .metric-card:nth-child(1) {
        .metric-icon {
            background: linear-gradient(135deg, #2c6fbb 0%, #1a4e8e 100%);
        }
    }

    .metric-card:nth-child(2) {
        .metric-icon {
            background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        }
    }

    .metric-card:nth-child(3) {
        .metric-icon {
            background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        }
    }

    .metric-card:nth-child(4) {
        .metric-icon {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        }
    }

    @media (max-width: 768px) {
        .metrics-grid {
            grid-template-columns: 1fr;
        }

        .metric-card {
            padding: 16px;
        }
    }
}
</style>
