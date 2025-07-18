<template>
    <div class="upload-section">
        <h2 class="h5 mb-4 text">
            <i class="bi bi-graph-up me-2"></i>负荷预测配置
        </h2>

        <div class="row">
            <!-- stage == 0: 初始状态：显示配置表单 -->
            <template v-if="stage == 0">
                <div class="col-md-6">
                    <!-- 配置表单 -->
                    <ConfigForm ref="configForm" />
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
            <!-- stage === 2：完成状态：显示结果预览 -->
            <template v-else-if="stage === 2">
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
                @click="clickContinueBtn"
            >
                继续预测<i class="bi bi-arrow-down-circle me-2"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ConfigForm from "./ConfigForm.vue";
import FileUpload from "./FileUpload.vue";
import FinishView from "./FinishView.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import { useLoadPreFormStore } from "@/store/loadpreformStore";
const formStore = useLoadPreFormStore();

const emit = defineEmits(["submit", "continue-predict"]);

const props = defineProps({
    record: {
        type: Object,
        required: true, //用户提交成功后从后端返回的完整数据
    },
    stage: {
        type: Number,
        required: true,
        validator: (value) => [0, 1, 2].includes(value),
    },
});

const isFormValid = computed(() => formStore.isValid && formStore.hasFile);

const submitForm = () => {
    emit("submit", formStore.formData, formStore.uploadedFile);
};

function clickContinueBtn() {
    emit("continue-predict");
}
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
