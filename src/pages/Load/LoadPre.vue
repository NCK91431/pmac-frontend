<template>
    <main class="container my-4 flex-grow-1">
        <!-- 预测表单 -->
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-white">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button
                            class="nav-link"
                            :class="{ active: activeTab === 'upload' }"
                            @click="activeTab = 'upload'"
                        >
                            <i class="bi bi-cloud-arrow-up me-2"></i>负荷预测
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link"
                            :class="{ active: activeTab === 'history' }"
                            @click="activeTab = 'history'"
                        >
                            <i class="bi bi-clock-history me-2"></i>历史记录
                        </button>
                    </li>
                </ul>
            </div>
            <div class="card-body p-4">
                <ConfigSection
                    v-if="activeTab === 'upload'"
                    @submit="handleSubmit"
                    @continue-predict="onClickContinueBtn"
                    :endding_flag="endding_flag"
                    :record="record"
                    :isProcessing="isProcessing"
                />
                <HistoryRecordsList
                    v-if="activeTab === 'history'"
                    @view-detail="viewDetail"
                    :processingTasks="processingTasks"
                />
            </div>
        </div>

        <ResultSection
            v-if="activeTab == 'upload' && endding_flag"
            :uploadData="uploadData"
            :predictionData="predictionData"
            :record="record"
        />

        <RecordDetail
            v-if="activeTab === 'history'"
            :recordId="active_record_id"
        />
    </main>
</template>

<script setup>
import { ref } from "vue";
import request from "@/utils/request";
import ConfigSection from "./ConfigSection/ConfigSection.vue";
import HistoryRecordsList from "./HistorySection/HistoryRecordsList.vue";
import ResultSection from "./ResultSection/ResultSection.vue";
import RecordDetail from "./HistorySection/RecordDetail.vue";
import moment from "moment";
import { ElNotification } from "element-plus";

const activeTab = ref("upload");
const active_record_id = ref(null); // 用户在历史记录列表里选中的记录的id
const uploadData = ref({}); //下载用户上传的数据要用到
const predictionData = ref({}); //从后端获取的预测结果
const record = ref({}); //后端返回的完整数据；
const endding_flag = ref(false); // 本次上传结束标志,上传结束：1.预测结果展示；2.配置表单不再显示，切换为本次用户填写数据展示
/* ---------------- 执行模型预测过程中 -----------------*/
const isProcessing = ref(false);
const processingTasks = ref([]); //任务队列

async function handleSubmit(formData, fileData) {
    const post_data = new FormData();
    post_data.append("customerType", formData.customerType);
    post_data.append("pvConfig", formData.pvConfig);
    post_data.append("location", JSON.stringify(formData.location));
    post_data.append("forecastRange", formData.forecastRange);
    post_data.append("file", fileData);
    // 显示加载状态
    isProcessing.value = true;
    const now_moment = moment(new Date()).format("YYYY-MM-DD HH:mm");
    processingTasks.value.push(now_moment);
    try {
        // 调用算法预测
        const res = await request.post("/api/forecast", post_data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        // 处理响应
        const response_data = res.data;
        record.value = response_data; // 保存完整的响应数据
        uploadData.value = fileData;
        predictionData.value = response_data.predictionData;
        //显示预测结果板块
        endding_flag.value = true;
        // 显示完成通知
        ElNotification({
            type: "success",
            title: "预测完成",
            message: "预测任务已完成，您可以查看结果",
        });
    } finally {
        // 隐藏加载状态
        isProcessing.value = false;
        processingTasks.value = []; //清空任务队列
    }
}

const viewDetail = (record) => {
    active_record_id.value = record.id;
};
function onClickContinueBtn() {
    endding_flag.value = false;
}
</script>

<style lang="scss" scoped>
.card {
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.nav-tabs {
    border-bottom: none;

    .nav-link {
        padding: 12px 20px;
        color: #6c757d;
        font-weight: 500;

        &.active {
            color: #2c6fbb;
            background-color: transparent;
            border-bottom: 3px solid #2c6fbb;
        }

        &:hover:not(.active) {
            //   color: #0d6efd;
            color: #2c6fbb;
        }
    }
}
</style>
