<template>
    <!-- 典型案例卡片 -->
    <div
        v-if="resultData.case_data"
        class="result-section card border-0 shadow-sm mt-4"
    >
        <div
            class="card-header bg-white d-flex justify-content-between align-items-center"
        >
            <h3 class="h5 mb-0 text-success">
                <i class="bi bi-lightning-charge me-2"></i>典型案例
            </h3>
            <el-button type="primary" @click="downloadResultExcel">
                <i class="bi bi-download me-1"></i>下载测算结果
            </el-button>
        </div>

        <div class="card-body">
            <Case :caseData="resultData.case_data" />
        </div>
    </div>
    <!-- 优化配置方案卡片 -->
    <div class="result-section card border-0 shadow-sm mt-4">
        <div
            class="card-header bg-white d-flex justify-content-between align-items-center"
        >
            <h3 class="h5 mb-0 text-success">
                <i class="bi bi-lightning-charge me-2"></i>优化配置方案
            </h3>
        </div>

        <div class="card-body">
            <!-- 预测结果卡片展示 -->
            <div class="results-grid">
                <!-- 光伏容量 -->
                <div class="result-card pv-system-card">
                    <div class="card-icon bg-primary">
                        <i class="bi bi-sun"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">光伏容量</div>
                        <div class="card-value">
                            {{ formatNumber(resultData.PV_cap_kw) }}
                            <span class="unit">kW</span>
                        </div>
                    </div>
                </div>

                <!-- 储能系统（合并储能容量和最大功率） -->
                <div class="result-card storage-system-card">
                    <div class="card-icon bg-success">
                        <i class="bi bi-battery-charging"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">储能系统</div>
                        <div class="storage-details">
                            <div class="storage-item">
                                <div class="storage-icon">
                                    <i class="bi bi-database"></i>
                                </div>
                                <div>
                                    <div class="storage-label">储能容量</div>
                                    <div class="storage-value">
                                        {{
                                            formatNumber(resultData.ESS_cap_kwh)
                                        }}
                                        <span class="unit">kWh</span>
                                    </div>
                                </div>
                            </div>
                            <div class="storage-item">
                                <div class="storage-icon">
                                    <i class="bi bi-lightning"></i>
                                </div>
                                <div>
                                    <div class="storage-label">最大功率</div>
                                    <div class="storage-value">
                                        {{
                                            formatNumber(
                                                resultData.P_max_charge_kw
                                            )
                                        }}
                                        <span class="unit">kW</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 投资成本 -->
                <div class="result-card investment-card">
                    <div class="card-icon bg-warning">
                        <i class="bi bi-cash-coin"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-label">总投资成本</div>
                        <div class="card-value">
                            {{ formatCurrency(resultData.investment_cost) }}
                            <span class="unit">元</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 投资回报分析 -->
            <div class="roi-analysis mt-5">
                <h5 class="mb-3">
                    <i class="bi bi-calculator me-2"></i>投资回报分析
                </h5>
                <div class="analysis-content">
                    <div class="roi-item">
                        <div class="roi-label">年节省费用</div>
                        <div class="roi-value">
                            {{ formatCurrency(resultData.annual_savings) }}
                            <span class="unit">元/年</span>
                        </div>
                    </div>
                    <div class="roi-item">
                        <div class="roi-label">投资回收期</div>
                        <div class="roi-value">
                            {{ calculatePaybackPeriod() }}
                            <span class="unit">年</span>
                        </div>
                    </div>
                    <div class="roi-item">
                        <div class="roi-label">年化投资回报率</div>
                        <div class="roi-value">
                            {{ calculateROI() }}<span class="unit">%</span>
                        </div>
                    </div>
                    <div class="roi-item">
                        <div class="roi-label">最大需量变化趋势</div>
                        <div class="roi-value" :class="getPeakDemandClass()">
                            <i :class="getPeakDemandIcon()" class="me-2"></i>
                            {{ getPeakDemandText() }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import { useLightStore } from "@/store/light";
import Case from "../ResultSection/Case.vue";
const forecastStore = useLightStore();
const activeHistoryRecordId = computed(
    () => forecastStore.activeHistoryRecordId
);

const resultData = ref({
    PV_cap_kw: 0,
    ESS_cap_kwh: 0,
    P_max_charge_kw: 0,
    annual_savings: 0,
    daily_operation_cost: 0,
    investment_cost: 0,
    case_data: null,
});
async function getRecord() {
    const id = activeHistoryRecordId.value;
    if (!id) {
        ElMessage.error("查询记录失败");
        return;
    }
    try {
        const response = await request.get(`/api/light_history/${id}`);
        if (response.data.success) {
            resultData.value = {
                id: response.data.id,
                ESS_cap_kwh: Number(response.data.ESS_cap_kwh) || 0,
                PV_cap_kw: Number(response.data.PV_cap_kw) || 0,
                P_max_charge_kw: Number(response.data.P_max_charge_kw) || 0,
                annual_savings: Number(response.data.annual_savings) || 0,
                daily_operation_cost:
                    Number(response.data.daily_operation_cost) || 0,
                investment_cost: Number(response.data.investment_cost) || 0,
                daily_peak: Number(response.data.daily_peak) || 0,
                case_data: response.data.case_data,
            };
        } else {
            ElMessage.error("查询记录失败");
        }
    } catch (error) {
        if (error !== "cancel") {
            console.error("获取记录详情失败:", error);
            ElMessage.error(`获取详情失败: ${error.message}`);
        }
    }
}

onMounted(() => {
    getRecord();
});
watch(activeHistoryRecordId, (newId) => {
    if (newId) {
        getRecord();
    }
});
/*------------辅助函数------------*/

// 新增安全格式化数字方法
function formatNumber(value, fractionDigits = 2) {
    if (typeof value === "number" && !isNaN(value)) {
        return value.toFixed(fractionDigits);
    }
    return "--"; // 或返回空字符串/加载状态
}

// 格式化货币显示
function formatCurrency(value) {
    if (value >= 10000) {
        return (value / 10000).toFixed(2) + "万";
    }
    return value.toFixed(2);
}

// 计算投资回收期（年）
function calculatePaybackPeriod() {
    if (
        !resultData.value.annual_savings ||
        resultData.value.annual_savings <= 0
    )
        return "N/A";
    return (
        resultData.value.investment_cost / resultData.value.annual_savings
    ).toFixed(1);
}

// 计算年化投资回报率

function calculateROI() {
    if (
        !resultData.value.investment_cost ||
        resultData.value.investment_cost <= 0
    )
        return "N/A";

    const ratio =
        resultData.value.annual_savings / resultData.value.investment_cost;
    const percentage = ratio * 100;

    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(percentage) + " ";
}
/* -------------------- 最大需量变化趋势 -------------------- */
// 获取最大需量变化趋势的样式类
function getPeakDemandClass() {
    const value = resultData.value.daily_peak;
    if (Math.abs(value) < 3) {
        return "peak-stable";
    } else if (value > 0) {
        return "peak-increase";
    } else {
        return "peak-decrease";
    }
}

// 获取最大需量变化趋势的图标
function getPeakDemandIcon() {
    const value = resultData.value.daily_peak;
    if (Math.abs(value) < 3) {
        return "bi bi-dash-circle";
    } else if (value > 0) {
        return "bi bi-arrow-up-circle";
    } else {
        return "bi bi-arrow-down-circle";
    }
}

// 获取最大需量变化趋势的文本
function getPeakDemandText() {
    const value = resultData.value.daily_peak;
    if (Math.abs(value) < 3) {
        return "维持原有水平";
    } else if (value > 0) {
        return `增加 ${Math.abs(value).toFixed(2)}%`;
    } else {
        return `降低 ${Math.abs(value).toFixed(2)}%`;
    }
}

// 下载结果Excel
const downloadResultExcel = async () => {
    const id = activeHistoryRecordId.value;
    if (!id) {
        ElMessage.error("查询记录失败");
        return;
    }
    try {
        const response = await request.get(
            `/api/light_history/${id}/result-excel`,
            {
                responseType: "blob",
            }
        );

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `光储定容结果_${id}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        ElMessage.success("下载成功");
    } catch (error) {
        console.error("下载失败:", error);
        ElMessage.error(
            "下载失败: " + (error.response?.data?.message || error.message)
        );
    }
};
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

.results-grid {
    display: grid;
    grid-template-columns: 1fr 1.8fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
}

.result-card {
    display: flex;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 20px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        flex-shrink: 0;

        i {
            font-size: 24px;
            color: white;
        }
    }

    .card-content {
        flex: 1;

        .card-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 5px;
        }

        .card-value {
            font-size: 24px;
            font-weight: 700;
            color: #343a40;
            margin-bottom: 5px;

            .unit {
                font-size: 14px;
                font-weight: normal;
                color: #6c757d;
            }
        }
    }
}
/* 储能系统卡片专属样式 */
.storage-system-card {
    background: linear-gradient(
        to right,
        rgba(0, 176, 155, 0.05),
        rgba(150, 201, 61, 0.05)
    );
    border: 1px solid rgba(0, 176, 155, 0.15);

    .card-content {
        .card-label {
            margin-bottom: 15px;
            color: #008c7a;
            font-weight: 600;
        }

        .storage-details {
            display: flex;
            gap: 20px;
            margin-top: 10px;

            .storage-item {
                flex: 1;
                display: flex;
                align-items: center;
                background: white;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

                .storage-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(0, 176, 155, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;

                    i {
                        font-size: 18px;
                        color: #008c7a;
                    }
                }

                .storage-label {
                    font-size: 13px;
                    color: #6c757d;
                    margin-bottom: 4px;
                }

                .storage-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #008c7a;

                    .unit {
                        font-size: 13px;
                        font-weight: normal;
                        color: #6c757d;
                    }
                }
            }
        }
    }
}
/* 光伏卡片专属样式 */
.pv-system-card {
    background: linear-gradient(
        to right,
        rgba(58, 123, 213, 0.05),
        rgba(100, 200, 255, 0.05)
    );
    border: 1px solid rgba(42, 111, 199, 0.15);

    &::before {
        background: linear-gradient(135deg, #3a7bd5, #00d2ff);
    }

    .card-label {
        color: #2a6fc7;
    }

    .card-value {
        color: #2a6fc7;
    }
}
/* 投资成本卡片专属样式 */
.investment-card {
    background: linear-gradient(
        to right,
        rgba(244, 107, 69, 0.05),
        rgba(255, 200, 100, 0.05)
    );
    border: 1px solid rgba(211, 84, 0, 0.15);

    &::before {
        background: linear-gradient(135deg, #f46b45, #eea849);
    }

    .card-label {
        color: #d35400;
    }

    .card-value {
        color: #d35400;
    }
}
.bg-primary {
    background: linear-gradient(135deg, #3a7bd5, #00d2ff);
}
.bg-success {
    background: linear-gradient(135deg, #00b09b, #96c93d);
}
.bg-info {
    background: linear-gradient(135deg, #3494e6, #ec6ead);
}
.bg-warning {
    background: linear-gradient(135deg, #f46b45, #eea849);
}
.bg-danger {
    background: linear-gradient(135deg, #ff416c, #ff4b2b);
}
.bg-purple {
    background: linear-gradient(135deg, #7b4397, #dc2430);
}

.roi-analysis {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    border-left: 4px solid #20c997;

    h5 {
        color: #20c997;
        font-weight: 600;
    }

    .analysis-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
    }

    .roi-item {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .roi-label {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 5px;
        }

        .roi-value {
            font-size: 20px;
            font-weight: 700;
            color: #495057;
            .unit {
                font-size: 14px;
                font-weight: normal;
                color: #6c757d;
            }
            &.peak-increase {
                color: #e74c3c;
                font-weight: 600;
            }
            &.peak-decrease {
                color: #27ae60;
                font-weight: 600;
            }
            &.peak-stable {
                color: #434444;
                font-weight: 500;
            }
            i {
                font-size: 18px;
            }
        }
    }
}

@media (max-width: 768px) {
    .results-grid {
        grid-template-columns: 1fr;
    }

    .analysis-content {
        grid-template-columns: 1fr !important;
    }
}
</style>
