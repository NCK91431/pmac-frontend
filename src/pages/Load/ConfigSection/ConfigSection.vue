<template>
    <div class="upload-section">
        <!-- 新增继续预测提示 -->
        <div v-if="isContinuePredict" class="alert alert-info mb-4">
            <i class="bi bi-info-circle me-2"></i>
            您正在基于历史记录
            <strong>{{ uploadDateRange }}</strong> 进行继续预测。 请上传包含
            <strong>{{ requiredStartDate }}</strong> 之后的数据。
        </div>
        <h2 class="h5 mb-4 text">
            <i class="bi bi-graph-up me-2"></i>负荷预测配置
        </h2>

        <div class="row">
            <!-- stage == 0: 初始状态：显示配置表单 -->
            <template v-if="stage == 0">
                <div class="col-md-6">
                    <!-- 配置表单 -->
                    <ConfigForm />
                </div>
                <div class="col-md-6">
                    <!-- 上传文件 -->
                    <FileUpload />
                </div>
            </template>
            <!-- stage == 1: 处理中状态：显示加载动画 -->
            <template v-else-if="stage == 1">
                <LoadingOverlay />
            </template>
            <!-- stage == 2：完成状态：显示结果预览 -->
            <template v-else-if="stage == 2">
                <FinishView :record="record" />
            </template>
        </div>

        <!-- 按钮区域 -->
        <div class="d-flex justify-content-end mt-4">
            <button
                v-if="stage == 0"
                class="btn-submit btn btn-primary px-4 py-2"
                :disabled="!isFormValid"
                @click="submitForm"
            >
                <i class="bi bi-calculator me-2"></i>开始预测
            </button>
            <button
                v-if="stage == 2"
                class="btn-continue btn btn-primary px-4 py-2"
                @click="emitNewPrediction"
            >
                新建预测<i class="bi bi-arrow-down-circle me-2"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import ConfigForm from "./ConfigForm.vue";
import FileUpload from "./FileUpload.vue";
import FinishView from "./FinishView.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import { useLoadPreFormStore } from "@/store/loadpreformStore";
import { useLoadPreStageStore } from "@/store/loadpreStageStore";
import { useForecastStore } from "@/store/forecast";
import { addDays, format } from "date-fns";

const formStore = useLoadPreFormStore();
const stageStore = useLoadPreStageStore();

const emit = defineEmits(["submit", "new-predictiton"]);

const record = computed(() => stageStore.responseData);
const stage = computed(() => stageStore.stage);

const isFormValid = computed(() => formStore.isValid && formStore.hasFile);

const submitForm = () => {
    emit("submit", formStore.formData, formStore.uploadedFile);
};

function emitNewPrediction() {
    emit("new-predictiton");
}

/* ----------------------------------- 继续预测 ------------------------------------------------- */
const forecastStore = useForecastStore();
const isContinuePredict = computed(() => forecastStore.isContinue);
const uploadDateRange = computed(() => {
    if (!forecastStore.continueData?.upload_date_range_format_text) return "";
    return forecastStore.continueData.upload_date_range_format_text;
});
const requiredStartDate = computed(() => {
    if (!forecastStore.continueData?.end_date) return "";
    const endDate = new Date(forecastStore.continueData.end_date);
    const nextDay = addDays(endDate, 1);
    return format(nextDay, "yyyy-MM-dd");
});
</script>

<style lang="scss" scoped>
.upload-section {
    padding: 10px;

    .text {
        color: #2c6fbb;
    }
}

.btn-submit {
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4);
    }
}

// 针对继续预测按钮的样式覆盖
.btn-continue {
    // 绿色渐变背景
    background: linear-gradient(135deg, #2ecc71 0%, #1abc9c 100%);
    border: none;
    position: relative;
    overflow: hidden;

    // 悬停效果增强
    &:hover {
        box-shadow: 0 5px 20px rgba(46, 204, 113, 0.6);
        transform: translateY(-4px);
    }

    // 活动状态效果
    &:active {
        transform: translateY(-1px);
        box-shadow: 0 2px 10px rgba(46, 204, 113, 0.4);
    }

    // 图标样式
    i {
        margin-left: 8px; // 图标在文字右侧
        font-size: 1.2rem;
        transition: transform 0.3s ease;
    }

    // 悬停时图标动画
    &:hover i {
        transform: translateY(3px);
    }
}
</style>
