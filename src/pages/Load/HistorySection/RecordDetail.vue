<template>
    <div class="record-detail">
        <div v-if="record.created_at" class="row mb-4">
            <div class="col-md-4">
                <div class="card info-card">
                    <div class="card-header">
                        <h5><i class="bi bi-info-circle"></i> 基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-key"></i> ID:
                            </div>
                            <div class="value">{{ record.id }}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-clock"></i> 请求时间:
                            </div>
                            <div class="value">
                                {{
                                    new Date(record.created_at).toLocaleString()
                                }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-calendar4-week"></i> 历史数据:
                            </div>
                            <div class="value">
                                {{
                                    record.upload_date_range &&
                                    record.upload_date_range.length
                                        ? record.upload_date_range.join(" 至 ")
                                        : "未知"
                                }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-clipboard-pulse"></i> 预测日期:
                            </div>
                            <div class="value">
                                {{
                                    record.prediction_data.dates &&
                                    record.prediction_data.dates.length > 0
                                        ? record.prediction_data.dates[0]
                                        : "未知"
                                }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-person"></i> 客户类型:
                            </div>
                            <div class="value">
                                <span class="badge-custom">{{
                                    formatCustomerType(record.customer_type)
                                }}</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-sun"></i> 光伏配置:
                            </div>
                            <div class="value">
                                <span
                                    v-if="record.pv_config === 'yes'"
                                    class="badge-custom badge-pv-yes"
                                    >有</span
                                >
                                <span
                                    v-else-if="record.pv_config === 'no'"
                                    class="badge-custom badge-pv-no"
                                    >无</span
                                >
                                <span
                                    v-else
                                    class="badge-custom badge-pv-unknown"
                                    >不确定</span
                                >
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-geo-alt"></i> 地点:
                            </div>
                            <div class="value">
                                {{
                                    `${record.province}-${record.city}-${record.district}`
                                }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-graph-up"></i> 预测类型:
                            </div>
                            <div class="value">
                                <span class="badge-custom forecast-badge">
                                    {{
                                        record.forecast_range == "4days"
                                            ? "D-4→D+1"
                                            : "D-1→D+1"
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <!-- <div class="timestamp">最后更新: 刚刚</div>
                        <div class="actions">
                            <button><i class="bi bi-pencil"></i> 编辑</button>
                            <button><i class="bi bi-printer"></i> 打印</button>
                        </div> -->
                    </div>
                </div>
            </div>

            <div class="col-md-8">
                <div class="chart-card card shadow-sm p-3 h-100">
                    <h5 class="mb-3">负荷预测结果</h5>
                    <ChartDisplay
                        :uploadData="getUploadData(record)"
                        :predictionData="getPredictionDataForDate()"
                        :date="getSampleDate(record)"
                    />
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
            <el-button type="success" plain @click="downloadUploadExcel">
                <i class="bi bi-download me-2"></i>下载上传数据
            </el-button>
            <el-button type="primary" @click="downloadPredictionExcel">
                <i class="bi bi-download me-2"></i>下载预测结果
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import ChartDisplay from "../ResultSection/ChartDisplay.vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
const props = defineProps({
    recordId: {
        required: true,
    },
});
const record = ref({});
async function getRecordDetailById() {
    const id = props.recordId;
    if (!id) {
        // ElMessage.error("记录ID不存在，无法获取详情");
        return;
    }
    const response = await request.get(`/api/history/${id}`);
    record.value = response.data;
}
onMounted(() => {
    getRecordDetailById();
});
watch(
    () => props.recordId,
    (newId) => {
        if (newId) {
            getRecordDetailById();
        }
    }
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

const getUploadData = (record) => {
    // 模拟数据
    return Array(24)
        .fill()
        .map((_, i) => ({
            time: `${i}:00`,
            value: Math.random() * 800 + 300,
        }));
};

const getPredictionDataForDate = () => {
    const prediction_data = record.value.prediction_data;
    if (!prediction_data) return [];
    const dateIndex = 0; // 目前只取第一个日期的索引
    if (!prediction_data.dates || !prediction_data.values) return [];
    const dates = prediction_data.values[dateIndex].map((value, i) => ({
        time: `${i}:00`,
        value: value,
    }));
    return dates;
};

const getSampleDate = (record) => {
    return new Date(record.created_at).toISOString().split("T")[0];
};

const emit = defineEmits(["close"]);

/*------------下载用户上传的excel文件------------*/
async function downloadUploadExcel() {
    const recordId = props.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = recordId + "_upload.xlsx";

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
/*------------下载预测结果excel文件------------*/
async function downloadPredictionExcel() {
    const recordId = props.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = recordId + "_prediction.xlsx";

    try {
        ElMessage.success(`正在生成预测结果Excel文件${fileName}`);
        // 发送下载请求
        const response = await request.get(
            `/api/history/${recordId}/download/prediction`,
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
.record-detail {
    padding: 10px;

    .info-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: none;
        overflow: hidden;
        height: 100%;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            background: linear-gradient(135deg, #3498db, #1a5f9e);
            color: white;
            padding: 18px 20px;
            border-bottom: none;
            position: relative;

            h5 {
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;

                i {
                    font-size: 1.4rem;
                }
            }
        }

        .card-body {
            padding: 25px;
        }

        .info-item {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            align-items: flex-start;

            &:last-child {
                border-bottom: none;
            }

            .label {
                width: 120px;
                font-weight: 500;
                color: #7f8c8d;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .value {
                flex: 1;
                color: #2c3e50;
                font-weight: 500;
                display: flex;
                align-items: center;

                .badge-custom {
                    background-color: #e3f2fd;
                    color: #1a73e8;
                    font-weight: 500;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;

                    &.badge-pv-yes {
                        background-color: #e8f5e9;
                        color: #2e7d32;
                    }

                    &.badge-pv-no {
                        background-color: #ffebee;
                        color: #c62828;
                    }

                    &.badge-pv-unknown {
                        background-color: #fff8e1;
                        color: #f57f17;
                    }

                    &.forecast-badge {
                        background-color: #f3e5f5;
                        color: #9c27b0;
                    }
                }
            }
        }

        .card-footer {
            background-color: #f8f9fa;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
            color: #7f8c8d;

            .timestamp {
                font-style: italic;
            }

            .actions button {
                border: none;
                background: transparent;
                color: #3498db;
                padding: 5px 10px;
                border-radius: 4px;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 5px;

                &:hover {
                    background-color: #e3f2fd;
                }
            }
        }
    }

    .chart-card {
        background-color: #fff;
    }
}
</style>
