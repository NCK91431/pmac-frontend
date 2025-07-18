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
                <h5 class="mb-0">预测日期: {{ selectedDate }}</h5>
                <div class="d-flex gap-2">
                    <button
                        v-for="date in date_btns"
                        :key="date"
                        class="btn btn-sm"
                        :class="{
                            'btn-primary': selectedDate === date,
                            'btn-outline-primary': selectedDate !== date,
                        }"
                        @click="selectDate(date)"
                    >
                        {{ formatDate(date) }}
                    </button>
                </div>
            </div>
            <ChartDisplay
                :predictionData="getPredictionDataForDate(selectedDate)"
                :date="selectedDate"
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
const props = defineProps({
    record: Object, //请求后台返回的数据
});

/*------------下载预测结果excel文件------------*/
async function downloadPredictionExcel() {
    const recordId = props.record.recordId;
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = props.record.resultFileName;

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
/*------------选择预测结果是哪一天------------*/
// 选择日期的按钮组
const date_btns = computed(() => {
    const dates = props.record.predictionData.dates;
    //目前只取第一个日期
    const temporary_dates = dates.slice(0, 1);
    return temporary_dates;
});
//默认选择第一个日期
const selectedDate = ref(props.record.predictionData.dates[0]);

function selectDate(date) {
    selectedDate.value = date;
}
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
};

/*-----------图表组件-------------*/
const getPredictionDataForDate = (date) => {
    console.log("获取预测数据", props.record.predictionData);
    const dateIndex = props.record.predictionData.dates.indexOf(date);
    const dates = props.record.predictionData.values[dateIndex].map(
        (value, i) => ({
            time: `${i}:00`,
            value: value,
        })
    );
    console.log("日期对应的预测数据", dates);
    return dates;
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
