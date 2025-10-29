<template>
    <div class="row">
        <!-- 配置信息卡片 -->
        <div class="col-md-6">
            <div class="config-display">
                <!-- 基础配置 -->
                <div class="config-section">
                    <div class="section-header">
                        <i class="bi bi-gear me-2"></i>
                        <h6 class="section-title mb-0">基础配置</h6>
                    </div>
                    <div class="config-content">
                        <div class="config-item">
                            <span class="config-label">数据颗粒度</span>
                            <span class="config-value">{{
                                time_granularity
                            }}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">项目地点</span>
                            <span class="config-value">{{ location }}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">需量电价</span>
                            <span class="config-value">
                                {{ demand_price }} 元/kW·月
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 光伏配置 -->
                <div class="config-section">
                    <div class="section-header">
                        <i class="bi bi-sun me-2"></i>
                        <h6 class="section-title mb-0">光伏配置</h6>
                    </div>
                    <div class="config-content">
                        <div class="config-item">
                            <span class="config-label">光伏成本</span>
                            <span class="config-value"
                                >{{ pv_cost }} 元/Wp</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">折旧年限</span>
                            <span class="config-value"
                                >{{ pv_depreciation_years }} 年</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">装机上限</span>
                            <span class="config-value"
                                >{{ pv_max_capacity || "无限制" }} kWp</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">是否上网</span>
                            <span class="config-value">{{
                                pv_sell_grid ? "是" : "否"
                            }}</span>
                        </div>
                        <div v-if="pv_sell_grid" class="config-item">
                            <span class="config-label">上网电价</span>
                            <span class="config-value"
                                >{{ sell_price }} 元/kWh</span
                            >
                        </div>
                    </div>
                </div>

                <!-- 储能配置 -->
                <div class="config-section">
                    <div class="section-header">
                        <i class="bi bi-battery-charging me-2"></i>
                        <h6 class="section-title mb-0">储能配置</h6>
                    </div>
                    <div class="config-content">
                        <div class="config-item">
                            <span class="config-label">储能成本</span>
                            <span class="config-value"
                                >{{ storage_cost }} 元/Wh</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">折旧年限</span>
                            <span class="config-value"
                                >{{ storage_depreciation_years }} 年</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">最大循环次数</span>
                            <span class="config-value"
                                >{{ storage_max_cycles }} 次</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">装机上限</span>
                            <span class="config-value"
                                >{{
                                    storage_max_capacity || "无限制"
                                }}
                                kWh</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">功率容量配比</span>
                            <span class="config-value"
                                >{{ storage_power_capacity_ratio }} C</span
                            >
                        </div>
                    </div>
                </div>

                <!-- 融资配置 -->
                <div class="config-section">
                    <div class="section-header">
                        <i class="bi bi-cash-coin me-2"></i>
                        <h6 class="section-title mb-0">融资配置</h6>
                    </div>
                    <div class="config-content">
                        <div class="config-item">
                            <span class="config-label">是否有贷款</span>
                            <span class="config-value">{{
                                has_loan ? "是" : "无"
                            }}</span>
                        </div>
                        <div v-if="has_loan" class="config-item">
                            <span class="config-label">贷款比例</span>
                            <span class="config-value"
                                >{{ (loan_amount * 100).toFixed(0) }}%</span
                            >
                        </div>
                        <div v-if="has_loan" class="config-item">
                            <span class="config-label">贷款年利率</span>
                            <span class="config-value"
                                >{{
                                    (loan_annual_rate * 100).toFixed(2)
                                }}%</span
                            >
                        </div>
                        <div v-if="has_loan" class="config-item">
                            <span class="config-label">贷款年限</span>
                            <span class="config-value">{{ loan_term }} 年</span>
                        </div>
                    </div>
                </div>

                <!-- 其他配置 -->
                <div class="config-section">
                    <div class="section-header">
                        <i class="bi bi-sliders me-2"></i>
                        <h6 class="section-title mb-0">其他配置</h6>
                    </div>
                    <div class="config-content">
                        <div class="config-item">
                            <span class="config-label">贴现率</span>
                            <span class="config-value"
                                >{{ (discount_rate * 100).toFixed(2) }}%</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">税率</span>
                            <span class="config-value"
                                >{{ (tax_rate * 100).toFixed(2) }}%</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 文件信息卡片 -->
        <div class="col-md-6">
            <div class="file-card">
                <!-- 文件统计信息 -->
                <div class="stats-title">
                    <i class="bi bi-bar-chart-line"></i> 文件数据统计
                </div>
                <div class="stats-grid">
                    <!-- 负荷文件信息 -->
                    <div class="file-type-section">
                        <div class="file-type-title">
                            <i class="bi bi-graph-up me-1"></i>负荷文件
                        </div>
                        <div class="file-stats">
                            <div class="stat-item">
                                <span class="stat-label">数据天数</span>
                                <span class="stat-value"
                                    >{{ excel_days }} 天</span
                                >
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">时间粒度</span>
                                <span class="stat-value">
                                    {{ excel_timeGranularity }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 电价文件信息 -->
                    <div class="file-type-section">
                        <div class="file-type-title">
                            <i class="bi bi-currency-dollar me-1"></i>电价文件
                        </div>
                        <div class="file-stats">
                            <div class="stat-item">
                                <span class="stat-label">数据天数</span>
                                <span class="stat-value">1 天</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">时间粒度</span>
                                <span class="stat-value">
                                    {{ excel_timeGranularity }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">上传日期</span>
                        <span class="stat-value">{{ excel_date_range }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">数据状态</span>
                        <span class="stat-value">{{ excel_status }}</span>
                    </div>
                </div>
                <!-- 文件预览 -->
                <div class="file-info-card" @click="downloadUploadExcel">
                    <!-- 添加下载指示器 -->
                    <div class="download-indicator">
                        <i class="bi bi-download"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-icon">
                            <i class="bi bi-file-earmark-excel"></i>
                        </div>
                        <div class="file-meta">
                            <div class="file-name">{{ excel_fileName }}</div>
                            <div class="file-size">
                                文件大小: {{ excel_size }}
                            </div>
                            <div class="upload-time">
                                上传时间: {{ excel_uploadTime }}
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
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";

const props = defineProps({
    record: {
        type: Object,
        required: true,
    },
});

// 配置数据计算属性
const formData = computed(() => props.record.formData || {});

// 基础配置
const time_granularity = computed(() => {
    const value = formData.value.time_granularity;
    return value === 24 ? "1小时粒度 (24个数据点)" : `${value} 数据点`;
});

const location = computed(() => {
    const loc = formData.value.location;
    if (Array.isArray(loc)) {
        return loc.join(" / ");
    }
    return loc || "未设置";
});

const demand_price = computed(() => formData.value.demand_price || 0);

// 光伏配置
const pv_cost = computed(() => formData.value.pv_cost || 0);
const pv_depreciation_years = computed(
    () => formData.value.pv_depreciation_years || 0
);
const pv_max_capacity = computed(() => formData.value.pv_max_capacity);
const pv_sell_grid = computed(() => formData.value.pv_sell_grid == "true");
const sell_price = computed(() => formData.value.sell_price || 0);

// 储能配置
const storage_cost = computed(() => formData.value.storage_cost || 0);
const storage_depreciation_years = computed(
    () => formData.value.storage_depreciation_years || 0
);
const storage_max_cycles = computed(
    () => formData.value.storage_max_cycles || 0
);
const storage_max_capacity = computed(
    () => formData.value.storage_max_capacity
);
const storage_power_capacity_ratio = computed(
    () => formData.value.storage_power_capacity_ratio || 0
);

// 融资配置
const has_loan = computed(() => formData.value.has_loan == "true");
const loan_amount = computed(() => formData.value.loan_amount || 0);
const loan_annual_rate = computed(() => formData.value.loan_annual_rate || 0);
const loan_term = computed(() => formData.value.loan_term || 0);

// 其他配置
const discount_rate = computed(() => formData.value.discount_rate || 0);
const tax_rate = computed(() => formData.value.tax_rate || 0);

// 文件信息计算属性（保持不变）
const excel_days = computed(() => {
    if (
        !props.record.excelInfo ||
        !props.record.excelInfo.stats ||
        !props.record.excelInfo.stats.days
    ) {
        return 0;
    }
    return props.record.excelInfo.stats.days;
});

const excel_timeGranularity = computed(() => {
    if (
        !props.record.excelInfo ||
        !props.record.excelInfo.stats ||
        !props.record.excelInfo.stats.timeGranularity
    ) {
        return "未知";
    }
    return props.record.excelInfo.stats.timeGranularity;
});

const excel_status = computed(() => {
    if (
        !props.record.excelInfo ||
        !props.record.excelInfo.stats ||
        !props.record.excelInfo.stats.status
    ) {
        return "未知状态";
    }
    return props.record.excelInfo.stats.status;
});

const excel_fileName = computed(() => {
    if (!props.record.excelInfo || !props.record.excelInfo.name) {
        return "未命名文件";
    }
    return props.record.excelInfo.name;
});

const excel_size = computed(() => {
    if (!props.record.excelInfo || !props.record.excelInfo.size) {
        return 0;
    }
    return props.record.excelInfo.size;
});

const excel_date_range = computed(() => {
    if (
        !props.record.excelInfo ||
        !props.record.excelInfo.dateRange ||
        !props.record.excelInfo.dateRange.length
    ) {
        return "未知";
    }
    return props.record.excelInfo.dateRange[0];
});

const excel_uploadTime = computed(() => {
    if (!props.record.excelInfo || !props.record.excelInfo.uploadTime) {
        return new Date();
    }
    return props.record.excelInfo.uploadTime;
});

/*------------下载用户上传的excel文件------------*/
async function downloadUploadExcel() {
    const recordId = props.record.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName =
        excel_fileName.value || props.record.recordId + "_upload.xlsx";

    try {
        ElMessage.success(`正在下载您上传的文件${fileName}`);
        const response = await request.get(
            `/api/light_history/${recordId}/download`,
            {
                responseType: "blob",
            }
        );
        const blob = new Blob([response.data]);
        saveAs(blob, fileName);
    } catch (error) {
        if (error.response?.data?.type?.includes("application/json")) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorData = JSON.parse(reader.result);
                    ElMessage.error(`下载失败: ${errorData.error}`);
                } catch {
                    ElMessage.error("未知错误");
                }
            };
            reader.readAsText(error.response.data);
        } else {
            ElMessage.error("文件下载失败");
        }
    }
}
</script>

<style lang="scss" scoped>
/* 配置显示区域样式 */
.config-display {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    height: 100%;
    border-left: 4px solid #20c997;
    overflow-y: auto;
    max-height: 500px;

    .config-section {
        margin-bottom: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;

        &:last-child {
            margin-bottom: 0;
        }

        .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 12px 16px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            align-items: center;

            .section-title {
                margin: 0;
                font-size: 0.95rem;
                font-weight: 600;
                color: #495057;
            }

            i {
                color: #2c6fbb;
                font-size: 1rem;
            }
        }

        .config-content {
            padding: 16px;

            .config-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f8f9fa;

                &:last-child {
                    border-bottom: none;
                }

                .config-label {
                    font-size: 0.85rem;
                    color: #6c757d;
                    font-weight: 500;
                }

                .config-value {
                    font-size: 0.9rem;
                    color: #495057;
                    font-weight: 600;
                    text-align: right;
                }
            }
        }
    }
}

/* 文件卡片样式保持不变 */
.file-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 20px;
    flex: 1;
    min-width: 280px;

    .stats-title {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 1rem;

        i {
            font-size: 1.1rem;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .file-type-section {
        background-color: #f0f8ff;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #e1f0ff;
    }

    .file-type-title {
        font-weight: 600;
        color: #2c6fbb;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
    }

    .file-stats {
        display: flex;
        flex-direction: column;
        gap: 6px;
        .stat-item {
            display: flex;
            flex-direction: column;
            background-color: white;
            padding: 8px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .stat-label {
            font-size: 0.75rem;
            color: #6c757d;
            margin-bottom: 2px;
        }
        .stat-value {
            font-weight: 600;
            color: #2c3e50;
            font-size: 0.9rem;
        }
    }
    .stat-item {
        display: flex;
        flex-direction: column;
        background-color: #f0f8ff;
        padding: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border-radius: 6px;

        .stat-label {
            font-size: 0.8rem;
            color: #6c757d;
            margin-bottom: 4px;
        }

        .stat-value {
            font-weight: 600;
            color: #2c3e50;
            font-size: 1rem;
        }
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
}

/* 文件信息卡片样式保持不变 */
.file-info-card {
    background: white;
    border-radius: 10px;
    padding: 16px;
    margin: 15px 0;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: 1px solid #eaeaea;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);

    .download-indicator {
        position: absolute;
        top: 8px;
        right: 12px;
        color: #3498db;
        font-size: 1rem;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .file-details {
        display: flex;
        align-items: center;
        gap: 15px;

        .file-icon {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            display: flex;
            align-items: center;
            justify-content: center;

            i {
                font-size: 1.8rem;
                color: #1a73e8;
            }
        }

        .file-meta {
            flex: 1;

            .file-name {
                font-weight: 600;
                font-size: 1rem;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .file-size,
            .upload-time {
                font-size: 0.85rem;
                color: #6c757d;
                display: flex;
                align-items: center;
                gap: 5px;
                margin-bottom: 3px;
            }
        }
    }

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(52, 152, 219, 0.2);
        border-color: #3498db;

        .download-indicator {
            opacity: 1;
        }

        .file-icon {
            background: linear-gradient(135deg, #d1e7ff, #a3d0fd);
        }
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .row {
        flex-wrap: wrap;
    }

    .config-display,
    .file-card {
        height: auto;
        margin-bottom: 15px;
    }

    .config-display {
        max-height: none;
    }
}
</style>
