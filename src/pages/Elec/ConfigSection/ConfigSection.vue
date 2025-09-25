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
            <i class="bi bi-graph-up me-2"></i>光伏发电预测配置
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
                    <i class="bi bi-calculator me-2"></i
                    >{{ isContinuePredict ? "继续预测" : "建模并预测" }}
                </button>
                <el-text
                    v-if="isContinuePredict"
                    @click="createNewPrediction"
                    type="primary"
                    class="toggle-tip"
                >
                    <el-icon><InfoFilled /></el-icon>
                    我要新建模型
                    <el-icon>
                        <TopRight />
                    </el-icon>
                </el-text>
                <el-text
                    v-if="!isContinuePredict"
                    @click="continuePrediction"
                    type="primary"
                    class="toggle-tip"
                >
                    <el-icon><InfoFilled /></el-icon>
                    基于已建模型进行继续预测
                    <el-icon>
                        <TopRight />
                    </el-icon>
                </el-text>
            </template>
            <template v-if="stage == 2 && user">
                <button
                    class="btn-compare btn btn-primary px-4 py-2"
                    @click="goComparePage"
                >
                    回测分析<i class="bi bi-arrow-up-right-circle"></i>
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from "vue";
import ConfigForm from "./ConfigForm.vue";
import FileUpload from "./FileUpload.vue";
import FinishView from "./FinishView.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import { addDays, format } from "date-fns";
import { useRouter } from "vue-router";
import { InfoFilled, TopRight } from "@element-plus/icons-vue";
import { useElecStore } from "@/store/elec"; // 修改为新的Store
const router = useRouter();

const user = inject("user"); //注入全局用户状态

const forecastStore = useElecStore(); // 使用新的综合Store

const emit = defineEmits(["submit"]);

const record = computed(() => forecastStore.responseData);
const stage = computed(() => forecastStore.stage);

const isFormValid = computed(
    () => forecastStore.isValid && forecastStore.hasFile
);

const submitForm = () => {
    emit("submit", forecastStore.formData, forecastStore.uploadedFile);
};

/* ----------------------------------- 继续预测 ------------------------------------------------- */
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

/* ----------------------------------- 继续预测 ------------------------------------------------- */
function createNewPrediction() {
    forecastStore.resetForm(); // 使用Store的统一重置方法
    forecastStore.clearContinueData(); // 清除继续预测数据
}
function continuePrediction() {
    forecastStore.setActiveTab("history");
}

/* ----------------------------------- 跳转至回测分析页面 ------------------------------------------------- */
function goComparePage() {
    const recordId = record.value?.recordId;
    if (!recordId) return;
    router.push({ name: "ElecCompare", params: { recordId } });
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
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4);
        }
    }
    .btn-compare {
        background: linear-gradient(135deg, #626aef 0%, #a090f9 100%);
        border: none;
        justify-self: flex-end;
        margin-left: auto;
        margin-right: 24px;
        &:hover {
            box-shadow: 0 5px 20px rgba(98, 106, 239, 0.6);
            transform: translateY(-4px);
        }
        &:active {
            transform: translateY(-1px);
            box-shadow: 0 2px 10px rgba(98, 106, 239, 0.4);
        }
        i {
            margin-left: 8px;
            font-size: 1.2rem;
            transition: transform 0.3s ease;
        }
        &:hover i {
            transform: translateY(3px);
        }
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
