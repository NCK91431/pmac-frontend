<template>
    <main class="container my-4 flex-grow-1">
        <!-- 预测模式 -->
        <div v-if="activeTab == 'upload'" class="mode mb-4">
            <span class="text">
                <i class="bi bi-info-circle me-2"></i>
                <span v-if="mode == 'T'">
                    您正在进行的是 <strong>总负荷预测</strong>
                </span>
                <span v-if="mode == 'S'">
                    您正在进行的是 <strong>分项负荷预测</strong>
                </span>
            </span>
            <span
                v-if="stage == 0 && !isContinue"
                class="action"
                @click="switchMode"
            >
                切换到
                <strong v-if="mode == 'T'">分项负荷预测</strong>
                <strong v-else>总负荷预测</strong>
                <i class="bi bi-arrow-left-right"></i>
            </span>
        </div>
        <!-- 预测表单 -->
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-white">
                <ul class="nav nav-tabs card-header-tabs">
                    <li class="nav-item">
                        <button
                            class="nav-link"
                            :class="{ active: activeTab === 'upload' }"
                            @click="switchTab('upload')"
                        >
                            <i class="bi bi-cloud-arrow-up me-2"></i
                            >{{ isContinue ? "继续预测" : "新建模型" }}
                        </button>
                    </li>
                    <li class="nav-item">
                        <button
                            class="nav-link"
                            :class="{ active: activeTab === 'history' }"
                            @click="onClickHistoryTab"
                        >
                            <i class="bi bi-clock-history me-2"></i>已建模型
                        </button>
                    </li>
                </ul>
            </div>
            <div class="card-body p-4">
                <ConfigSection
                    v-if="activeTab === 'upload'"
                    @submit="handleSubmit"
                    @new-predictiton="onNewPrediction"
                    :record="record"
                    :stage="stage"
                />
                <HistoryRecordsList
                    v-if="activeTab === 'history'"
                    :processingTasks="processingTasks"
                />
            </div>
        </div>

        <ResultSection v-if="activeTab == 'upload' && stage == 2" />

        <RecordDetail v-if="activeTab == 'history' && activeHistoryRecordId" />
    </main>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import request from "@/utils/request";
import ConfigSection from "./ConfigSection/ConfigSection.vue";
import HistoryRecordsList from "./HistorySection/HistoryRecordsList.vue";
import ResultSection from "./ResultSection/ResultSection.vue";
import RecordDetail from "./HistorySection/RecordDetail.vue";
import moment from "moment";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();

//用户选中的某条负荷预测记录
const activeHistoryRecordId = computed(
    () => forecastStore.activeHistoryRecordId
);

const activeTab = computed(() => forecastStore.activeTab); // 从 store 获取标签状态
const isContinue = computed(() => forecastStore.isContinue);

const record = computed(() => forecastStore.responseData); //后端返回的完整数据；
const stage = computed(() => forecastStore.stage); // 0:初始状态 1:处理中 2:处理完成
const mode = computed(() => forecastStore.mode); // 预测模式

const user = inject("user"); //注入全局用户状态
const router = useRouter();

/* ---------------- 切换Tab -----------------*/
function switchTab(tabName) {
    forecastStore.setActiveTab(tabName); // 更新 store 状态
}
/* ---------------- 切换模式 -----------------*/
function switchMode() {
    forecastStore.switchMode();
}
/* ---------------- 执行模型预测过程中 -----------------*/
const processingTasks = ref([]); //任务队列

async function handleSubmit(formData, fileData) {
    forecastStore.setStageOne(); // 设置为处理中状态 stage = 1
    const post_data = new FormData();
    if (mode.value == "S") {
        post_data.append("customer_type", formData.customer_type);
        post_data.append("pv_config", formData.pv_config);
        post_data.append("pv_capacity", formData.pv_capacity);
    }
    post_data.append("location", JSON.stringify(formData.location));
    post_data.append("forecast_range", formData.forecast_range);
    post_data.append("file", fileData);
    post_data.append("mode", mode.value);
    // 如果有用户ID
    if (user.value) {
        post_data.append("user_id", user.value.id);
    }
    // 如果有继续预测的ID
    if (formData.previous_record_id) {
        post_data.append("previous_record_id", formData.previous_record_id);
    }
    const now_moment = moment(new Date()).format("YYYY-MM-DD HH:mm");
    processingTasks.value.push(now_moment);
    try {
        // 调用算法预测
        const res = await request.post("/api/forecast", post_data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        if (res.data.success) {
            ElNotification({
                type: "success",
                title: "预测完成",
                message: "预测任务已完成，您可以查看结果",
            });
            forecastStore.setCompleted(res.data); // 设置为完成状态 stage = 2
            forecastStore.clearContinueData(); // 确保清除状态、清除继续预测数据
        }
        // 处理响应
    } catch (error) {
        forecastStore.setStageZero(); // 出错时重置状态 stage = 0
        if (error.response?.status === 400 || error.response?.status === 500) {
            console.log(error.response);
            ElMessageBox.alert(
                error.response.data.details,
                error.response.data.error,
                {
                    confirmButtonText: "知道了",
                    type: "warning",
                }
            );
        }
    } finally {
        // 隐藏加载状态
        processingTasks.value = []; //清空任务队列
    }
}

function onNewPrediction() {
    forecastStore.resetFileOnly(); // 只删除文件，保留表单配置
    forecastStore.setStageZero(); // 重置为初始状态
}

function onClickHistoryTab() {
    console.log(user.value);
    if (!user.value) {
        // 显示登录提示框
        ElMessageBox.confirm(
            "查看历史记录需要登录账号，是否立即登录？",
            "登录提示",
            {
                confirmButtonText: "去登录",
                cancelButtonText: "取消",
                type: "warning",
                customClass: "login-prompt-box",
                showClose: false,
                closeOnClickModal: false,
                closeOnPressEscape: false,
            }
        )
            .then(() => {
                // 用户点击确认，跳转到登录页面
                router.push("/login");
            })
            .catch(() => {
                // 用户取消，不执行任何操作
                // 可以重置为上传标签
                forecastStore.setActiveTab("upload");
            });
    } else {
        if (activeTab.value == "upload" && isContinue.value) {
            forecastStore.resetForm();
            forecastStore.clearContinueData();
        }
        // 用户已登录或切换到上传标签，直接切换
        forecastStore.setActiveTab("history");
    }
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
.login-prompt-box {
    .el-message-box__header {
        background-color: #f0f7ff;
        padding: 15px 20px;
        border-bottom: 1px solid #e4e7ed;
    }

    .el-message-box__title {
        color: #0d6efd;
        font-weight: 600;
    }

    .el-message-box__content {
        padding: 20px;
        font-size: 16px;
    }

    .el-message-box__btns {
        padding: 10px 20px 20px;
        text-align: center;

        .el-button {
            padding: 10px 25px;
            border-radius: 6px;

            &:first-child {
                background-color: #0d6efd;
                border-color: #0d6efd;

                &:hover {
                    background-color: #0b5ed7;
                    border-color: #0b5ed7;
                }
            }
        }
    }
}
.mode {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #f0f7ff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #2c6fbb;
    .text {
        color: #495057;
        font-size: 1.1rem;

        i {
            color: #2c6fbb;
        }

        strong {
            color: #2c6fbb;
            font-weight: 600;
        }
    }

    .action {
        color: #6c757d;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;

        &:hover {
            color: #2c6fbb;
            transform: translateX(4px);
        }

        strong {
            font-weight: 600;
            color: inherit;
            padding-right: 12px;
        }

        i {
            font-size: 1.2rem;
            vertical-align: middle;
        }
    }
}
</style>
