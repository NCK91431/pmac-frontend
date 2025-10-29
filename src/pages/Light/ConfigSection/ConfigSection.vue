<template>
    <div class="upload-section">
        <h2 class="h5 mb-4 text">
            <i class="fas fa-solar-panel me-2"></i>光储定容
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
        <div class="action mt-4">
            <template v-if="stage == 0">
                <button
                    class="btn-submit btn btn-primary px-4 py-2"
                    :disabled="!isFormValid"
                    @click="submitForm"
                >
                    <i class="bi bi-calculator me-2"></i> 开始测算
                </button>
            </template>
            <template v-if="stage == 2">
                <button
                    class="btn-continue btn btn-primary px-4 py-2"
                    @click="emitNewPrediction"
                >
                    新建测算<i class="bi bi-arrow-down-circle me-2"></i>
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import ConfigForm from "./ConfigForm.vue";
import FileUpload from "./FileUpload.vue";
import FinishView from "./FinishView.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import { addDays, format } from "date-fns";
import { InfoFilled, TopRight } from "@element-plus/icons-vue";
import { useLightStore } from "@/store/light"; // 修改为新的Store

const forecastStore = useLightStore(); // 使用新的综合Store

const emit = defineEmits(["submit", "new-predictiton"]);

const record = computed(() => forecastStore.responseData);
const stage = computed(() => forecastStore.stage);

const isFormValid = computed(
    () => forecastStore.isValid && forecastStore.hasFile
);

const submitForm = () => {
    emit(
        "submit",
        forecastStore.formData,
        forecastStore.uploadedLoadFile,
        forecastStore.uploadedPriceFile
    );
};

function emitNewPrediction() {
    emit("new-predictiton");
}
</script>

<style lang="scss" scoped>
.upload-section {
    padding: 10px;

    .text {
        color: #2c6fbb;
    }
}
.action {
    width: 50%;
    margin-left: 50%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-left: 12px;
    .btn-submit {
        justify-self: flex-end;
        margin-left: auto;
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4);
        }
    }
    .btn-continue {
        justify-self: flex-end;
        margin-left: auto;
        margin-right: 24px;
    }
}

.toggle-tip {
    cursor: pointer;
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
