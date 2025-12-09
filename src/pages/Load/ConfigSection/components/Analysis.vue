<!-- 负荷稳定性与波动性分析与周期相关性分析展示组件 -->
<template>
    <div class="analysis-container">
        <div class="analysis-header">
            <i class="bi bi-graph-up-arrow"></i>
            <span class="analysis-title">负荷特性分析</span>
        </div>
        <div class="row">
            <!-- 负荷稳定性与波动性分析 -->
            <div class="col-md-8">
                <div class="section-header">
                    <i class="bi bi-speedometer2"></i>
                    <span class="section-title">负荷稳定性与波动性分析</span>
                </div>

                <div class="metrics-grid">
                    <div
                        class="metric-item"
                        v-for="(value, key) in stabilityMetrics"
                        :key="key"
                    >
                        <div class="metric-icon" :class="getStabilityIcon(key)">
                            <i :class="getStabilityIconClass(key)"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-name">
                                {{ getStabilityLabel(key) }}
                            </div>
                            <div class="metric-value">
                                {{ value.value }}
                            </div>
                            <div class="metric-description">
                                {{ value.level }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 周期相关性分析 -->
            <div class="col-md-4">
                <div class="section-header">
                    <i class="bi bi-arrow-repeat"></i>
                    <span class="section-title">周期相关性分析</span>
                </div>
                <div class="periodicity-metrics">
                    <div
                        class="period-item"
                        v-for="(value, key) in periodicityMetrics"
                        :key="key"
                    >
                        <div class="preiod-title">
                            <div
                                class="period-icon"
                                :class="getPeriodStrengthClass(value.strength)"
                            >
                                <i :class="getPeriodIcon(key)"></i>
                            </div>
                            <div class="period-name">
                                {{ getPeriodLabel(key) }}
                            </div>
                        </div>

                        <div class="period-content">
                            <div class="period-value">
                                {{ value.periodicity }}
                            </div>
                            <div
                                class="period-strength"
                                :class="getPeriodStrengthClass(value.strength)"
                            >
                                {{ value.strength }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    load_stabilityindex: Object,
    predictaBility: Object,
});
// 负荷稳定性与波动性分析数据
const stabilityMetrics = computed(() => {
    if (!props.load_stabilityindex) return {};

    const stability = props.load_stabilityindex;
    return {
        loadRate: {
            value: `${(stability.loadRate * 100).toFixed(2)} %`,
            level: stability.loadRateLevel,
        },
        coefficient: {
            value: stability.coefficient.toFixed(2),
            level: stability.coefficientLevel,
        },
        avgVariation: {
            value: `${stability.avgVariation.toFixed(2)} %`,
            level: stability.avgVariationLevel,
        },

        dailyRatio: {
            value: stability.dailyRatio.toFixed(2),
            level: stability.dailyRatioLevel,
        },
        peakHeightratio: {
            value: stability.peakHeightratio.toFixed(2),
            level: stability.peakHeightratioLevel,
        },
        dailyPeaknum: {
            value: stability.dailyPeaknum.toFixed(2),
            level: stability.dailyPeaknumLevel,
        },
    };
});

// 周期相关性分析数据
const periodicityMetrics = computed(() => {
    if (!props.predictaBility) return {};

    const periodicity = props.predictaBility;
    return {
        dailyPeriodicity: {
            periodicity: periodicity.dailyPeriodicity.toFixed(2),
            strength: periodicity.dailyPeriodStrength,
        },
        weeklyPeriodicity: {
            periodicity: periodicity.weeklyPeriodicity.toFixed(2),
            strength: periodicity.weeklyPeriodStrength,
        },
        monthlyPeriodicity: {
            periodicity: periodicity.monthlyPeriodicity.toFixed(2),
            strength: periodicity.monthlyPeriodStrength,
        },
    };
});

// 负荷稳定性指标图标和标签
const getStabilityIcon = (key) => {
    const icons = {
        loadRate: "icon-load-rate",
        coefficient: "icon-coefficient",
        dailyPeaknum: "icon-peaknum",
        dailyRatio: "icon-ratio",
        peakHeightratio: "icon-peak",
        avgVariation: "icon-variation",
    };
    return icons[key] || "icon-default";
};

const getStabilityIconClass = (key) => {
    const iconClasses = {
        loadRate: "bi-speedometer2",
        coefficient: "bi-graph-up",
        dailyPeaknum: "bi-collection",
        dailyRatio: "bi-arrows-expand",
        peakHeightratio: "bi-arrow-up",
        avgVariation: "bi-activity",
    };
    return iconClasses[key] || "bi-info-circle";
};

const getStabilityLabel = (key) => {
    const labels = {
        loadRate: "负荷率",
        coefficient: "变异系数",
        dailyPeaknum: "日均峰数",
        dailyRatio: "日均峰谷比",
        peakHeightratio: "峰突出度",
        avgVariation: "负荷波动率",
    };
    return labels[key] || key;
};

// 周期相关性指标图标和标签
const getPeriodIcon = (key) => {
    const iconClasses = {
        dailyPeriodicity: "bi-sun",
        weeklyPeriodicity: "bi-calendar-week",
        monthlyPeriodicity: "bi-calendar-month",
    };
    return iconClasses[key] || "bi-calendar";
};

const getPeriodLabel = (key) => {
    const labels = {
        dailyPeriodicity: "日相关性",
        weeklyPeriodicity: "周相关性",
        monthlyPeriodicity: "月相关性",
    };
    return labels[key] || key;
};

// 周期相关性强度样式
const getPeriodStrengthClass = (strength) => {
    const strengthMap = {
        强: "strength-strong",
        中: "strength-medium",
        弱: "strength-weak",
    };
    return strengthMap[strength] || "strength-unknown";
};
</script>

<style lang="scss" scoped>
.analysis-container {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
    border: 1px solid #e1e5ff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

// .stability-card {
//     background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
//     border-left: 6px solid #4d7cfe;
// }

// .periodicity-card {
//     background: linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%);
//     border-left: 6px solid #34d399;
// }
.section-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 8px 12px;
    background: linear-gradient(
        135deg,
        rgba(76, 105, 255, 0.1) 0%,
        rgba(76, 105, 255, 0.05) 100%
    );
    border-radius: 8px;

    .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #4c69ff;
        margin-left: 8px;
    }

    i {
        font-size: 1.2rem;
        color: #4c69ff;
    }
}

.analysis-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(76, 105, 255, 0.1);

    .analysis-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #4c69ff;
        margin-left: 10px;
    }

    i {
        font-size: 1.5rem;
        color: #4c69ff;
    }
}

// 负荷稳定性指标样式
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.metric-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(77, 124, 254, 0.1);
    transition: all 0.3s ease;

    &:hover {
        background: white;
        box-shadow: 0 4px 12px rgba(77, 124, 254, 0.15);
        transform: translateY(-2px);
    }

    .metric-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: 1.4rem;

        &.icon-load-rate {
            background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
            color: white;
        }

        &.icon-coefficient {
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            color: white;
        }

        &.icon-peaknum {
            background: linear-gradient(135deg, #45b7d1 0%, #96c93d 100%);
            color: white;
        }

        &.icon-ratio {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }

        &.icon-peak {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
        }

        &.icon-variation {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #2c3e50;
        }
    }

    .metric-content {
        flex: 1;
        .metric-name {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 4px;
            font-weight: 500;
        }

        .metric-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 4px;
        }

        .metric-description {
            font-size: 0.75rem;
            color: #8e9aaf;
            line-height: 1.3;
        }
    }
}

// 周期相关性分析样式
.periodicity-metrics {
    display: flex;
    gap: 10px;
    justify-content: space-between;
}

.period-item {
    flex-grow: 1;
    background: rgba(255, 255, 255, 0.8);
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(52, 211, 153, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 10px;
    &:hover {
        background: white;
        box-shadow: 0 4px 12px rgba(52, 211, 153, 0.15);
        transform: translateY(-2px);
    }

    .preiod-title {
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        .period-name {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 500;
        }
        .period-icon {
            width: 24px;
            height: 24px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            margin-right: 8px;
            justify-content: center;
            font-size: 0.8rem;

            &.strength-strong {
                background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                color: white;
            }

            &.strength-medium {
                background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
                color: white;
            }

            &.strength-weak {
                background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
                color: white;
            }

            &.strength-unknown {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
        }
    }

    .period-content {
        flex: 1;

        .period-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 4px;
        }

        .period-strength {
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 12px;
            display: inline-block;

            &.strength-strong {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }

            &.strength-medium {
                background: rgba(245, 158, 11, 0.1);
                color: #f59e0b;
                border: 1px solid rgba(245, 158, 11, 0.2);
            }

            &.strength-weak {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.2);
            }

            &.strength-unknown {
                background: rgba(107, 114, 128, 0.1);
                color: #6b7280;
                border: 1px solid rgba(107, 114, 128, 0.2);
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .analysis-container {
        margin: 1rem 0;
        padding: 0 8px;
    }

    .metrics-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }

    .period-item {
        flex-direction: column;
        align-items: stretch;
        text-align: center;

        .period-icon {
            margin-right: 0;
            margin-bottom: 12px;
            align-self: center;
        }

        .period-progress {
            width: 100%;
            margin-top: 12px;
        }
    }

    .metric-item {
        flex-direction: column;
        text-align: center;

        .metric-icon {
            margin-right: 0;
            margin-bottom: 12px;
        }
    }
}
</style>
