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
                <h5 class="mb-0">预测日期: {{ result_date }}</h5>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-primary">
                        {{ result_date }}
                    </button>
                </div>
            </div>
            <ChartDisplay
                :predictionData="getPredictionDataForDate()"
                :date="result_date"
            />
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import ChartDisplay from "./ChartDisplay.vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import { useElecStore } from "@/store/elec";
const forecastStore = useElecStore();

const result = computed(() => forecastStore.responseData);
const prediction_result = computed(
    () => forecastStore.responseData.algorithm_result.values
);
const result_date = computed(
    () => forecastStore.responseData.algorithm_result.date
);
/*------------下载预测结果excel文件------------*/
async function downloadPredictionExcel() {
    const recordId = result.value.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = `${result_date.value}_光伏发电预测结果.xlsx`;

    try {
        ElMessage.success(`正在生成预测结果Excel文件${fileName}`);
        // 发送下载请求
        const response = await request.get(
            `/api/elec_history/${recordId}/download/result`,
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

/*-----------图表组件-------------*/
const getPredictionDataForDate = () => {
    // 生成时间序列数组
    const resultArray = prediction_result.value.map((value, index) => {
        // 计算总分钟数 (15分钟间隔)
        const totalMinutes = index * 15;

        // 计算小时和分钟
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;

        // 格式化为两位数的时间字符串
        const time = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;

        return { time, value };
    });
    console.log("日期对应的预测数据", resultArray);
    return resultArray;
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
</style>
