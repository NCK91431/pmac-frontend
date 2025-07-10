<template>
    <div class="upload-section">
        <h2 class="h5 mb-4 text">
            <i class="bi bi-graph-up me-2"></i>负荷预测配置
        </h2>

        <div class="row" v-if="!endding_flag">
            <!-- 1：预测进行中 -->
            <template v-if="props.isProcessing">
                <LoadingOverlay />
            </template>
            <!-- 0：填写配置表单 -->
            <template v-else>
                <div class="col-md-6">
                    <!-- 配置表单 -->
                    <ConfigForm ref="configForm" />
                </div>
                <div class="col-md-6">
                    <!-- 上传文件 -->
                    <FileUpload @file-uploaded="handleFileUploaded" />
                </div>
            </template>
        </div>
        <!-- 2：显示预测结果 -->
        <div class="row" v-if="endding_flag">
            <FinishView :record="record" />
        </div>

        <div class="d-flex justify-content-end mt-4">
            <button
                v-if="!endding_flag"
                class="btn-submit btn btn-primary px-4 py-2"
                :disabled="!isFormValid"
                @click="submitForm"
            >
                <i class="bi bi-calculator me-2"></i>开始预测
            </button>
            <button
                v-if="endding_flag"
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

const props = defineProps({
    endding_flag: {
        type: Boolean,
        required: true,
    },
    record: {
        type: Object,
        required: true, //用户提交成功后从后端返回的完整数据
    },
    isProcessing: {
        type: Boolean,
        required: true,
    },
});

const configForm = ref(null);
const uploadedFile = ref(null);

const isFormValid = computed(
    () => configForm.value?.isValid && uploadedFile.value
);

function handleFileUploaded(file) {
    uploadedFile.value = file;
}

const submitForm = () => {
    const formData = configForm.value.getFormData();
    emit("submit", formData, uploadedFile.value);
};

const emit = defineEmits(["submit", "continue-predict"]);
function clickContinueBtn() {
    isFormValid.value = true;
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
