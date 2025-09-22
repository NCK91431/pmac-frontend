<!-- 旧版模型评估指标 -->
<template>
    <div class="metrics-section">
        <div class="metrics-title">总体误差</div>
        <div class="metrics-grid compact">
            <div
                class="metric-card compact"
                v-for="(value, key) in metrics"
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
</template>

<script setup>
const { metrics } = defineProps({
    metrics: Object,
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
/* 旧版模型评估指标 */
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
</style>
