<template>
    <div class="row">
        <!-- 配置信息卡片 -->
        <div class="col-md-6">
            <div class="preview-card">
                <div class="preview-list">
                    <template v-if="props.record.formData.mode == 'S'">
                        <!-- 客户类型 -->
                        <div class="preview-item">
                            <div class="preview-label">
                                <i class="bi bi-building"></i> 客户类型
                            </div>
                            <div class="preview-value">
                                <span class="status-badge customer-type">
                                    <i class="bi" :class="customerTypeIcon"></i>
                                    {{ customer_type }}
                                </span>
                            </div>
                        </div>

                        <!-- 光伏配置 -->
                        <div class="preview-item">
                            <div class="preview-label">
                                <i class="bi bi-sun"></i> 光伏配置
                            </div>
                            <div class="preview-value">
                                <span class="status-badge">
                                    <i class="bi"></i>
                                    {{ pv_config }}
                                </span>
                            </div>
                        </div>

                        <!-- 光伏配置 -->
                        <div class="preview-item" v-if="pv_config == '已配置'">
                            <div class="preview-label">
                                <i class="bi bi-box-seam"></i> 装机容量
                            </div>
                            <div class="preview-value">
                                <span class="status-badge">
                                    <i class="bi"></i>
                                    {{ pv_capacity }}（kw）
                                </span>
                            </div>
                        </div>
                    </template>
                    <!-- 地点 -->
                    <div class="preview-item">
                        <div class="preview-label">
                            <i class="bi bi-geo-alt"></i> 地点
                        </div>
                        <div class="preview-value">
                            <div class="location-value">
                                <i class="bi bi-geo-fill"></i>
                                <span>{{ location_string }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 预测类型 -->
                    <div class="preview-item">
                        <div class="preview-label">
                            <i class="bi bi-graph-up"></i> 预测类型
                        </div>
                        <div class="preview-value">
                            <span class="status-badge forecast-range">
                                <i class="bi bi-calendar-range"></i>
                                {{ forecast_range }}
                            </span>
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
                    <div class="stat-item">
                        <span class="stat-label">数据天数</span>
                        <span class="stat-value">{{ excel_days }} 天</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">时间粒度</span>
                        <span class="stat-value">{{
                            excel_timeGranularity
                        }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">上传日期范围</span>
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
        // 用户提交成功后从后端返回的完整数据
        type: Object,
        required: true,
    },
});

// 计算属性
const customer_type = computed(() => {
    if (!props.record.formData || !props.record.formData.customer_type) {
        return "未知类型";
    }
    const types = {
        hospital: "医院",
        mall: "商超",
        discrete: "离散工业",
        continuous: "连续工业",
    };
    return types[props.record.formData.customer_type] || "未知类型";
});
const pv_config = computed(() => {
    if (!props.record.formData || !props.record.formData.pv_config) {
        return "未知配置";
    }
    return props.record.formData.pv_config == "yes" ? "已配置" : "未配置";
});
const pv_capacity = computed(() => {
    if (!props.record.formData || !props.record.formData.pv_capacity) {
        return "未知";
    }
    return props.record.formData.pv_capacity;
});

const location_string = computed(() => {
    if (typeof props.record.formData.location === "string") {
        const locationStr = props.record.formData.location;
        return JSON.parse(locationStr).join("-");
    } else if (!props.record.formData || !props.record.formData.location) {
        return "未选择";
    } else {
        return "-";
    }
});
const forecast_range = computed(() => {
    if (!props.record.formData || !props.record.formData.forecast_range) {
        return "未知范围";
    }
    return props.record.formData.forecast_range == "4days"
        ? "D-4 → D+1"
        : "D-1 → D+1";
});

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
    return props.record.excelInfo.dateRange.join(" 至 ");
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
        // 发送下载请求
        const response = await request.get(
            `/api/history/${recordId}/download/upload`,
            {
                responseType: "blob",
            }
        );
        const blob = new Blob([response.data]); // 创建Blob对象并保存文件
        saveAs(blob, fileName);
    } catch (error) {
        // 处理错误响应（如后端返回JSON错误信息）
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
/* 确保两列等高 */
.row {
    display: flex;
    flex-wrap: nowrap;

    .preview-card,
    .file-card {
        height: 100%;
    }
}

/* 文件预览卡片 */
.preview-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 18px;
    flex: 1;
    min-width: 280px;

    .preview-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .preview-item {
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        align-items: flex-start;

        &:last-child {
            border-bottom: none;
        }

        .preview-label {
            width: 90px;
            font-weight: 500;
            color: #6c757d;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
        }

        .preview-value {
            flex: 1;
            color: #2c3e50;
            font-weight: 500;
            display: flex;
            align-items: center;
            font-size: 0.9rem;
        }
    }

    .status-badge {
        font-weight: 500;
        padding: 4px 12px;
        border-radius: 18px;
        font-size: 0.85rem;
        display: inline-flex;
        align-items: center;
        gap: 5px;

        i {
            font-size: 0.9rem;
            /* 缩小图标 */
        }

        &.customer-type {
            background-color: #e3f2fd;
            color: #1a73e8;
        }

        &.pv-yes {
            background-color: #e8f5e9;
            color: #2e7d32;
        }

        &.pv-no {
            background-color: #ffebee;
            color: #c62828;
        }

        &.pv-unknown {
            background-color: #fff8e1;
            color: #f57f17;
        }

        &.forecast-range {
            background-color: #f3e5f5;
            color: #9c27b0;
        }
    }

    .location-value {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    @media (max-width: 768px) {
        .preview-item {
            flex-direction: column;
            gap: 6px;
        }

        .preview-label {
            width: 100%;
        }
    }
}

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
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
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

/* 文件信息卡片 */
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

    /* 添加下载指示器 */
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

    /* 悬停效果优化 */
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

    .preview-card,
    .file-card {
        height: auto;
        margin-bottom: 15px;
    }
}
</style>
