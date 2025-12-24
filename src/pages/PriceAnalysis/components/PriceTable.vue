<template>
    <div class="price-table-container">
        <el-table
            :data="tableData"
            border
            stripe
            size="small"
            height="100%"
            :row-class-name="tableRowClassName"
            @row-click="handleRowClick"
        >
            <el-table-column prop="time" label="时间" width="80" fixed="left">
                <template #header>
                    <div class="table-header">
                        <i class="bi bi-clock"></i>
                        <span>时间</span>
                    </div>
                </template>
                <template #default="{ row }">
                    <div
                        class="time-cell"
                        :class="{ 'highlight-time': isPeakTime(row.time) }"
                    >
                        <i class="bi bi-clock-history"></i>
                        {{ row.time }}
                    </div>
                </template>
            </el-table-column>

            <el-table-column prop="realTimePrice" label="实时节点电价" sortable>
                <template #header>
                    <div class="table-header">
                        <i
                            class="bi bi-lightning-charge-fill"
                            style="color: #409eff"
                        ></i>
                        <span>实时节点电价</span>
                    </div>
                </template>
                <template #default="{ row }">
                    <div class="price-cell real-time">
                        <span class="price-value">{{
                            formatPrice(row.realTimePrice)
                        }}</span>
                        <!-- <span class="price-unit">元/MWh</span> -->
                    </div>
                </template>
            </el-table-column>

            <el-table-column prop="dayAheadPrice" label="日前节点电价" sortable>
                <template #header>
                    <div class="table-header">
                        <i
                            class="bi bi-calendar-check-fill"
                            style="color: #67c23a"
                        ></i>
                        <span>日前节点电价</span>
                    </div>
                </template>
                <template #default="{ row }">
                    <div class="price-cell day-ahead">
                        <span class="price-value">{{
                            formatPrice(row.dayAheadPrice)
                        }}</span>
                        <!-- <span class="price-unit">元/MWh</span> -->
                    </div>
                </template>
            </el-table-column>

            <el-table-column
                label="价差"
                width="100"
                sortable
                :sort-method="sortDiff"
            >
                <template #header>
                    <div class="table-header">
                        <i
                            class="bi bi-arrow-left-right"
                            style="color: #e6a23c"
                        ></i>
                        <span>价差</span>
                    </div>
                </template>
                <template #default="{ row }">
                    <div class="diff-cell" :class="getDiffClass(row.diff)">
                        <i :class="getDiffIcon(row.diff)"></i>
                        <span class="diff-value">{{
                            formatPrice(row.diff)
                        }}</span>
                        <!-- <span class="diff-unit">元</span> -->
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="变化率" width="80">
                <template #header>
                    <div class="table-header">
                        <i
                            class="bi bi-graph-up-arrow"
                            style="color: #f56c6c"
                        ></i>
                        <span>变化率</span>
                    </div>
                </template>
                <template #default="{ row }">
                    <div class="change-rate-cell">
                        <el-progress
                            :percentage="Math.abs(row.changeRate)"
                            :color="getChangeRateColor(row.changeRate)"
                            :show-text="false"
                            :stroke-width="6"
                        />
                        <span
                            class="rate-value"
                            :class="getChangeRateClass(row.changeRate)"
                        >
                            {{ formatChangeRate(row.changeRate) }}
                        </span>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <div class="table-footer">
            <div class="summary">
                <div class="summary-item">
                    <i class="bi bi-graph-up-arrow" style="color: #409eff"></i>
                    <span>实时均价：</span>
                    <strong>{{ formatPrice(averageRealTime) }}</strong>
                </div>
                <div class="summary-item">
                    <i
                        class="bi bi-graph-down-arrow"
                        style="color: #67c23a"
                    ></i>
                    <span>日前均价：</span>
                    <strong>{{ formatPrice(averageDayAhead) }}</strong>
                </div>
                <div class="summary-item">
                    <i
                        class="bi bi-arrow-left-right"
                        style="color: #e6a23c"
                    ></i>
                    <span>平均价差：</span>
                    <strong :class="getDiffClass(averageDiff)">{{
                        formatPrice(averageDiff)
                    }}</strong>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from "vue";

const props = defineProps({
    dayAheadData: {
        type: Array,
        default: () => [],
    },
    realTimeData: {
        type: Array,
        default: () => [],
    },
    timeType: {
        type: String,
        default: "hour",
    },
});

onMounted(() => {
    console.log("table props->", props);
});

// 计算表格数据
const tableData = computed(() => {
    const data = [];
    const length = props.timeType === "hour" ? 24 : 96;

    for (let i = 0; i < length; i++) {
        const time =
            props.timeType === "hour"
                ? `${i.toString().padStart(2, "0")}:00`
                : (() => {
                      const hour = Math.floor(i / 4);
                      const minute = (i % 4) * 15;
                      return `${hour.toString().padStart(2, "0")}:${minute
                          .toString()
                          .padStart(2, "0")}`;
                  })();

        const realTimePrice = props.realTimeData[i] || 0;
        const dayAheadPrice = props.dayAheadData[i] || 0;
        const diff = realTimePrice - dayAheadPrice;
        const changeRate = dayAheadPrice > 0 ? (diff / dayAheadPrice) * 100 : 0;

        data.push({
            time,
            realTimePrice,
            dayAheadPrice,
            diff,
            changeRate,
        });
    }

    return data;
});

// 计算统计信息
const averageRealTime = computed(() => {
    const sum = props.realTimeData.reduce((a, b) => a + b, 0);
    return props.realTimeData.length > 0 ? sum / props.realTimeData.length : 0;
});

const averageDayAhead = computed(() => {
    const sum = props.dayAheadData.reduce((a, b) => a + b, 0);
    return props.dayAheadData.length > 0 ? sum / props.dayAheadData.length : 0;
});

const averageDiff = computed(
    () => averageRealTime.value - averageDayAhead.value
);

// 格式化价格
const formatPrice = (price) => {
    return typeof price === "number" ? price.toFixed(2) : "-";
};

// 格式化变化率
const formatChangeRate = (rate) => {
    return `${rate >= 0 ? "+" : ""}${rate.toFixed(2)}%`;
};

// 判断是否为高峰时段
const isPeakTime = (time) => {
    const hour = parseInt(time.split(":")[0]);
    return (hour >= 8 && hour <= 11) || (hour >= 18 && hour <= 21);
};

// 获取价差样式类
const getDiffClass = (diff) => {
    if (diff > 0) return "diff-positive";
    if (diff < 0) return "diff-negative";
    return "diff-zero";
};

// 获取价差图标
const getDiffIcon = (diff) => {
    if (diff > 0) return "bi bi-arrow-up-circle-fill";
    if (diff < 0) return "bi bi-arrow-down-circle-fill";
    return "bi bi-dash-circle-fill";
};

// 获取变化率颜色
const getChangeRateColor = (rate) => {
    if (rate > 5) return "#f56c6c";
    if (rate > 0) return "#e6a23c";
    if (rate < -5) return "#67c23a";
    if (rate < 0) return "#409eff";
    return "#909399";
};

// 获取变化率样式类
const getChangeRateClass = (rate) => {
    if (rate > 5) return "rate-high";
    if (rate > 0) return "rate-medium";
    if (rate < -5) return "rate-low";
    if (rate < 0) return "rate-medium-negative";
    return "rate-zero";
};

// 排序方法
const sortDiff = (a, b) => {
    return a.diff - b.diff;
};

// 表格行样式
const tableRowClassName = ({ row }) => {
    return isPeakTime(row.time) ? "peak-row" : "";
};

// 行点击事件
const handleRowClick = (row) => {
    console.log("点击行数据:", row);
};
</script>

<style scoped lang="scss">
.price-table-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-table) {
        flex: 1;
        font-size: 12px;
        overflow: hidden;

        .el-table__header-wrapper {
            th {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: 600;

                .table-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    i {
                        font-size: 14px;
                    }
                }
            }
        }

        .el-table__body-wrapper {
            &::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }

            &::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }

            &::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;

                &:hover {
                    background: #a8a8a8;
                }
            }
        }

        .peak-row {
            background-color: rgba(255, 152, 0, 0.05) !important;

            &:hover {
                > td {
                    background-color: rgba(255, 152, 0, 0.1) !important;
                }
            }
        }

        .time-cell {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;

            &.highlight-time {
                color: #ff9800;
                font-weight: 600;
            }

            i {
                color: #909399;
            }
        }

        .price-cell {
            display: flex;
            align-items: baseline;
            gap: 4px;

            &.real-time {
                .price-value {
                    color: #409eff;
                    font-weight: 600;
                }
            }

            &.day-ahead {
                .price-value {
                    color: #67c23a;
                    font-weight: 600;
                }
            }

            .price-value {
                font-size: 13px;
            }

            .price-unit {
                font-size: 11px;
                color: #909399;
            }
        }

        .diff-cell {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;

            &.diff-positive {
                background-color: rgba(64, 158, 255, 0.1);
                color: #409eff;

                i {
                    color: #409eff;
                }
            }

            &.diff-negative {
                background-color: rgba(103, 194, 58, 0.1);
                color: #67c23a;

                i {
                    color: #67c23a;
                }
            }

            &.diff-zero {
                background-color: rgba(144, 147, 153, 0.1);
                color: #909399;

                i {
                    color: #909399;
                }
            }

            .diff-value {
                flex: 1;
                text-align: center;
            }

            .diff-unit {
                font-size: 11px;
                opacity: 0.7;
            }
        }

        .change-rate-cell {
            display: flex;
            align-items: center;
            gap: 8px;

            :deep(.el-progress) {
                flex: 1;

                .el-progress-bar__outer {
                    background-color: #f5f7fa;
                }
            }

            .rate-value {
                font-size: 11px;
                font-weight: 600;
                min-width: 60px;
                text-align: right;

                &.rate-high {
                    color: #f56c6c;
                }

                &.rate-medium {
                    color: #e6a23c;
                }

                &.rate-low {
                    color: #67c23a;
                }

                &.rate-medium-negative {
                    color: #409eff;
                }

                &.rate-zero {
                    color: #909399;
                }
            }
        }
    }

    .table-footer {
        margin-top: 16px;
        padding: 12px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
        border-radius: 8px;

        .summary {
            display: flex;
            justify-content: space-around;

            .summary-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;

                i {
                    font-size: 16px;
                }

                span {
                    color: #606266;
                }

                strong {
                    font-size: 14px;
                    color: #2c3e50;

                    &.diff-positive {
                        color: #409eff;
                    }

                    &.diff-negative {
                        color: #67c23a;
                    }
                }
            }
        }
    }
}
</style>
