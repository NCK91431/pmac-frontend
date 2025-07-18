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
                            @click="onClickHistoryTab"
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
                    :record="record"
                    :stage="stage"
                />
                <HistoryRecordsList
                    v-if="activeTab === 'history'"
                    @view-detail="viewDetail"
                    :processingTasks="processingTasks"
                />
            </div>
        </div>

        <ResultSection
            v-if="activeTab == 'upload' && stage == 2"
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
import { ref, inject } from "vue";
import request from "@/utils/request";
import ConfigSection from "./ConfigSection/ConfigSection.vue";
import HistoryRecordsList from "./HistorySection/HistoryRecordsList.vue";
import ResultSection from "./ResultSection/ResultSection.vue";
import RecordDetail from "./HistorySection/RecordDetail.vue";
import moment from "moment";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useLoadPreFormStore } from "@/store/loadpreformStore";

const formStore = useLoadPreFormStore();

const activeTab = ref("upload");
const active_record_id = ref(null); // 用户在历史记录列表里选中的记录的id
const uploadData = ref({}); //下载用户上传的数据要用到
const predictionData = ref({}); //从后端获取的预测结果
const record = ref({}); //后端返回的完整数据；
const stage = ref(0); // 0:初始状态 1:处理中 2:处理完成

const user = inject("user"); //注入全局用户状态
const router = useRouter();
/* ---------------- 执行模型预测过程中 -----------------*/
const processingTasks = ref([]); //任务队列

async function handleSubmit(formData, fileData) {
    stage.value = 1; // 设置为处理中状态
    const post_data = new FormData();
    post_data.append("customer_type", formData.customer_type);
    post_data.append("pv_config", formData.pv_config);
    post_data.append("location", JSON.stringify(formData.location));
    post_data.append("forecast_range", formData.forecast_range);
    post_data.append("file", fileData);
    if (user.value) {
        post_data.append("user_id", user.value.id);
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
            const response_data = res.data;
            record.value = response_data; // 保存完整的响应数据
            uploadData.value = fileData;
            predictionData.value = response_data.predictionData;
            //显示预测结果板块
            // 显示完成通知
            ElNotification({
                type: "success",
                title: "预测完成",
                message: "预测任务已完成，您可以查看结果",
            });
            stage.value = 2; // 设置为完成状态
        }
        // 处理响应
    } catch (error) {
        stage.value = 0; // 出错时重置状态
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

const viewDetail = (record) => {
    active_record_id.value = record.id;
};
function onClickContinueBtn() {
    formStore.resetFileOnly(); // 只删除文件，保留表单配置
    stage.value = 0; // 重置为初始状态
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
                activeTab.value = "upload";
            });
    } else {
        // 用户已登录或切换到上传标签，直接切换
        activeTab.value = "history";
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
</style>
