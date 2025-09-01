<template>
    <div class="result-section card border-0 shadow-sm mt-4">
        <div
            class="card-header bg-white d-flex justify-content-between align-items-center"
        >
            <h3 class="h5 mb-0 text-success">
                <i class="bi bi-graph-up-arrow me-2"></i>预测结果
            </h3>
            <div class="download-buttons">
                <el-button type="primary" @click="downloadPredictionExcel">
                    <i class="bi bi-download me-2"></i>下载预测结果
                </el-button>
            </div>
        </div>
        <div class="card-body">
            <div
                class="date-selector mb-4 d-flex justify-content-between align-items-center"
            >
                <h5 class="mb-0">预测日期: {{ date_format }}</h5>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary">
                        {{ date_format }}
                    </button>
                </div>
            </div>
            <LoadChart
                :date="prediction_result.date"
                :loads="prediction_result.predictionData"
            />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import LoadChart from "./LoadChart.vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import { useLoadForecastStore } from "@/store/load";
const forecastStore = useLoadForecastStore();

const record = computed(() => forecastStore.responseData); //后端返回的完整数据；
//后端返回的预测结果数据
const prediction_result = computed(() => forecastStore.responseData.result);

const date_format = computed(() => {
    if (prediction_result.value && prediction_result.value.date) {
        const date = new Date(prediction_result.value.date);
        return `${date.getFullYear()}年${
            date.getMonth() + 1
        }月${date.getDate()}日`;
    }
    return "";
});
/*------------下载预测结果excel文件------------*/
async function downloadPredictionExcel() {
    const recordId = record.value.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = record.value.resultFileName;

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
</style>
