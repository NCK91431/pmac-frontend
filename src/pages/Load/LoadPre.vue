<template>
    <main class="container my-4 flex-grow-1">
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-white">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'upload' }"
                            @click="activeTab = 'upload'">
                            <i class="bi bi-cloud-arrow-up me-2"></i>负荷预测
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" :class="{ active: activeTab === 'history' }"
                            @click="activeTab = 'history'">
                            <i class="bi bi-clock-history me-2"></i>历史记录
                        </button>
                    </li>
                </ul>
            </div>
            <div class="card-body p-4">
                <ConfigSection v-if="activeTab === 'upload'" @submit="handleSubmit"
                    @continue-predict="onClickContinueBtn" :endding_flag="endding_flag" :record="record" />
                <HistoryRecordsList v-if="activeTab === 'history'" @view-detail="viewDetail" />
            </div>
        </div>

        <ResultSection v-if="activeTab == 'upload' && endding_flag" :uploadData="uploadData"
            :predictionData="predictionData" :record="record" />

        <RecordDetail v-if="activeTab === 'history'" :recordId="active_record_id" />
    </main>
</template>

<script setup>
import { ref } from "vue";
import request from "@/utils/request";
import ConfigSection from "./ConfigSection/ConfigSection.vue";
import HistoryRecordsList from "./HistorySection/HistoryRecordsList.vue";
import ResultSection from "./ResultSection/ResultSection.vue";
import RecordDetail from "./HistorySection/RecordDetail.vue";

const activeTab = ref("upload");
const active_record_id = ref(null); // 用户在历史记录列表里选中的记录的id
const uploadData = ref({}); //下载用户上传的数据要用到
const predictionData = ref({}); //从后端获取的预测结果
const record = ref({}); //后端返回的完整数据；
const endding_flag = ref(false);// 本次上传结束标志,上传结束：1.预测结果展示；2.配置表单不再显示，切换为本次用户填写数据展示

async function handleSubmit(formData, fileData) {
    console.log("提交数据:", formData, fileData);
    const post_data = new FormData();
    post_data.append("customerType", formData.customerType);
    post_data.append("pvConfig", formData.pvConfig);
    post_data.append("location", JSON.stringify(formData.location));
    post_data.append("forecastRange", formData.forecastRange);
    post_data.append("file", fileData);
    // 请求后端获取预测结果
    const res = await request.post("/api/forecast", post_data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    const response_data = res.data;
    record.value = response_data; // 保存完整的响应数据
    console.log("后端返回的完整数据:", record.value);
    uploadData.value = fileData;
    predictionData.value = response_data.predictionData;
    //显示预测结果板块
    endding_flag.value = true;
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
