<template>
  <main
    class="load-pre-layout"
    :style="{ minHeight: `calc(100vh - ${headerHeight}px)` }"
  >
    <router-view />

    <template v-if="!isHistoryRoute">
      <el-steps
        :active="stage >= 2 ? 1 : 0"
        align-center
        finish-status="success"
        class="load-steps"
      >
        <el-step title="模型配置与训练" />
        <el-step title="查看结果" />
      </el-steps>

      <!-- Step 0: 模型配置 -->
      <div v-if="stage === 0" class="stage-config">
        <div v-if="isContinue" class="continue-alert">
          <i class="bi bi-info-circle"></i>
          您正在基于历史记录
          <strong>{{ uploadDateRange }}</strong> 进行继续预测。 请上传包含
          <strong>{{ requiredStartDate }}</strong> 之后的数据。
        </div>
        <div class="config-columns">
          <div class="col-left">
            <ConfigForm />
          </div>
          <div class="col-right">
            <FileUpload />
          </div>
        </div>
        <div class="action-bar">
          <button
            class="btn-submit"
            :disabled="!isFormValid"
            @click="submitForm"
          >
            {{ isContinue ? "继续预测" : "建模并预测" }}
          </button>
          <el-text
            v-if="isContinue"
            @click="createNewPrediction"
            type="primary"
            class="toggle-tip"
          >
            <el-icon><InfoFilled /></el-icon>
            我要新建模型
            <el-icon><TopRight /></el-icon>
          </el-text>
          <el-text
            v-else
            @click="continuePrediction"
            type="primary"
            class="toggle-tip"
          >
            <el-icon><InfoFilled /></el-icon>
            基于已建模型进行继续预测
            <el-icon><TopRight /></el-icon>
          </el-text>
        </div>
      </div>

      <!-- Step 1: 训练中 -->
      <template v-if="stage === 1">
        <div class="stage-training">
          <Configuration :record="trainingRecord" />
          <LoadingOverlay />
        </div>
      </template>

      <!-- Step 2: 查看结果 -->
      <template v-if="stage === 2">
        <div class="stage-results">
          <Analysis
            v-if="record?.result"
            :load_stabilityindex="record.result.load_stabilityindex"
            :predictaBility="record.result.predictaBility"
            :mode="forecastStore.mode"
            :form-data="
              forecastStore.record?.formData || forecastStore.formData
            "
            :excel-info="forecastStore.record?.excelInfo"
            :predict-id="record?.recordId"
            :created-at="createdAt"
          />
          <ExceptionPrompt
            v-if="record?.result?.dataAnomaly?.abnormal_flag"
            :anomalyData="record.result.dataAnomaly"
          />
          <ResultSection />
        </div>
        <div class="action-bar" v-if="user">
          <button class="btn-compare" @click="goComparePage">
            回测分析<i class="bi bi-arrow-up-right-circle"></i>
          </button>
        </div>
      </template>
    </template>
  </main>
</template>

<script setup>
import { ref, inject, computed } from "vue";
const headerHeight = inject("headerHeight");
import { useRoute, useRouter } from "vue-router";
import request from "@/utils/request";
import ConfigForm from "./ConfigSection/ConfigForm.vue";
import FileUpload from "./ConfigSection/FileUpload.vue";
import LoadingOverlay from "./ConfigSection/LoadingOverlay.vue";
import Configuration from "./ConfigSection/Configuration.vue";
import Analysis from "./ConfigSection/components/Analysis.vue";
import ExceptionPrompt from "./ConfigSection/ExceptionPrompt.vue";
import ResultSection from "./ResultSection/ResultSection.vue";
import { addDays, format } from "date-fns";
import { InfoFilled, TopRight } from "@element-plus/icons-vue";
import moment from "moment";
import {
  ElMessage,
  ElNotification,
  ElMessageBox,
  ElSteps,
  ElStep,
} from "element-plus";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();
const route = useRoute();
const router = useRouter();

const user = inject("user");

const isHistoryRoute = computed(() => route.path.includes("/loadpre/history"));

const isContinue = computed(() => forecastStore.isContinue);
const record = computed(() => forecastStore.record);
const stage = computed(() => forecastStore.stage);
const createdAt = computed(
  () => record.value?.created_at || new Date().toISOString(),
);

const trainingRecord = computed(() => ({
  formData: {
    ...forecastStore.formData,
    mode: forecastStore.mode,
  },
  excelInfo: forecastStore.excelInfo,
}));

const mode = computed(() => forecastStore.mode);
const upload_file_type = computed(() => forecastStore.upload_file_type);

const isFormValid = computed(
  () => forecastStore.isValid && forecastStore.hasFile,
);

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

function createNewPrediction() {
  forecastStore.resetForm();
  forecastStore.clearContinueData();
}

function continuePrediction() {
  router.push("/loadpre/history");
}

function submitForm() {
  handleSubmit(forecastStore.formData, forecastStore.uploadedFile);
}

function goComparePage() {
  const recordId = record.value?.recordId;
  if (!recordId) return;
  router.push({ name: "LoadCompare", params: { recordId } });
}

const processingTasks = ref([]);
let isRequesting = false;
let currentRequestController = null;

async function handleSubmit(formData, fileData) {
  if (isRequesting) {
    ElMessage.warning("正在处理中，请勿重复提交");
    return;
  }

  forecastStore.setStageOne();
  const post_data = new FormData();
  if (mode.value === "S") {
    post_data.append("customer_type", formData.customer_type);
    post_data.append("pv_config", formData.pv_config);
    post_data.append("pv_capacity", formData.pv_capacity);
  }
  post_data.append("unit", formData.unit);
  post_data.append("location", JSON.stringify(formData.location));
  post_data.append("forecast_range", formData.forecast_range);
  post_data.append("file", fileData);
  post_data.append("mode", mode.value);
  post_data.append("mark_name", formData.mark_name);
  post_data.append("upload_file_type", upload_file_type.value);
  if (user.value) {
    post_data.append("user_id", user.value.id);
  }
  if (formData.previous_record_id) {
    post_data.append("previous_record_id", formData.previous_record_id);
  }
  const requestStartTime = Date.now();
  console.log(
    `[${mode.value}预测] 开始请求，时间: ${moment(requestStartTime).format("HH:mm:ss")}`,
  );

  processingTasks.value.push(
    moment(requestStartTime).format("YYYY-MM-DD HH:mm"),
  );

  isRequesting = true;
  const controller = new AbortController();
  currentRequestController = controller;

  const timeoutId = setTimeout(() => {
    if (currentRequestController) {
      currentRequestController.abort();
      console.warn("请求超时，已取消");
    }
  }, 600000);

  try {
    const res = await request.post("/api/forecast", post_data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal: controller.signal,
      retry: 0,
      "axios-retry": {
        retries: 0,
      },
    });
    clearTimeout(timeoutId);

    if (res.data.success) {
      const requestEndTime = Date.now();
      console.log(
        `[${mode.value}预测] 请求完成，耗时: ${(requestEndTime - requestStartTime) / 1000}秒`,
      );
      ElNotification({
        type: "success",
        title: "预测完成",
        message: `预测任务已完成，耗时 ${((requestEndTime - requestStartTime) / 1000).toFixed(1)} 秒`,
      });
      forecastStore.setCompleted(res.data);
      forecastStore.clearContinueData();
    }
  } catch (error) {
    console.error("请求发生错误:", {
      name: error.name,
      message: error.message,
      code: error.code,
      config: error.config?.url,
    });

    if (error.name === "CanceledError" || error.name === "AbortError") {
      console.log("请求被用户取消或超时");
      ElMessage.warning("请求已取消或超时");
      return;
    }
    if (error.code === "ECONNABORTED") {
      ElMessage.warning("请求超时，可能是网络连接问题");
    } else if (!error.response) {
      ElMessage.warning("网络连接异常，请检查网络后重试");
    } else if (
      error.response?.status === 400 ||
      error.response?.status === 500
    ) {
      ElMessageBox.alert(
        error.response.data.details,
        error.response.data.error,
        {
          confirmButtonText: "知道了",
          type: "warning",
        },
      );
    } else {
      ElMessage.error("请求失败，请稍后重试");
    }
    forecastStore.setStageZero();
    forecastStore.removeFile();
  } finally {
    console.log("【END】请求任务已结束，页面状态已重置");
    processingTasks.value = [];
    isRequesting = false;
    currentRequestController = null;
  }
}
</script>

<style lang="scss" scoped>
.load-pre-layout {
  background: #fff;
  padding: 24px 32px;
}

/* ===== el-steps ===== */
.load-steps {
  margin-bottom: 28px;
  padding-top: 8px;

  /* 线条颜色由「下一步骤」的状态决定 */

  /* 下一步为 process（当前步骤）→ 蓝色 */
  :deep(.el-step:has(+ .el-step > .el-step__head.is-process) .el-step__line) {
    background-color: #2b6cb5 !important;
  }

  /* 下一步为 wait（未达到）→ 灰色 */
  :deep(.el-step:has(+ .el-step > .el-step__head.is-wait) .el-step__line) {
    background-color: #d0d0d0 !important;
  }

  /* 下一步为 success（已完成）→ 绿色（line-inner 有 border） */
  :deep(
    .el-step:has(+ .el-step > .el-step__head.is-success) .el-step__line-inner
  ) {
    border-color: #67c23a !important;
  }

  /* 当前步骤图标 → 蓝色 */
  :deep(.el-step__head.is-process) {
    color: #2b6cb5;
    border-color: #2b6cb5;
  }
  :deep(.el-step__head.is-process .el-step__icon) {
    background: #e8f0fe;
    border-color: #2b6cb5;
  }
  :deep(.el-step__head.is-process .el-step__icon-inner) {
    color: #2b6cb5;
  }

  /* 已完成步骤图标 → 绿色 */
  :deep(.el-step__head.is-success) {
    color: #67c23a;
    border-color: #67c23a;
  }
  :deep(.el-step__head.is-success .el-step__icon) {
    background: #f0f9eb;
    border-color: #67c23a;
  }
  :deep(.el-step__head.is-success .el-step__icon-inner) {
    color: #67c23a;
  }

  /* 当前步骤标题 → 蓝色 */
  :deep(.el-step__title.is-process) {
    color: #2b6cb5;
  }

  /* 已完成步骤标题 → 绿色 */
  :deep(.el-step__title.is-success) {
    color: #67c23a;
  }
}

/* ===== Stage 0: 配置 ===== */
.stage-config {
  .continue-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #cce5ff;
    border: 1px solid #b8daff;
    border-radius: 6px;
    color: #004085;
    margin-bottom: 20px;

    i {
      font-size: 1.1rem;
    }

    strong {
      font-weight: 600;
    }
  }

  .config-columns {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 32px;
    align-items: start;
  }

  .config-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c6fbb;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 1.2rem;
    }
  }
}

/* ===== 操作栏 ===== */
.action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
  margin-top: 80px;

  .btn-submit {
    padding: 10px 24px;
    background: #2c6fbb;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(44, 111, 187, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btn-compare {
    padding: 10px 24px;
    background: linear-gradient(135deg, #626aef 0%, #a090f9 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
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
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    &:hover i {
      transform: translateY(3px);
    }
  }

  .toggle-tip {
    cursor: pointer;
  }
}

/* ===== Stage 1: 训练中 ===== */
.stage-training {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ===== Stage 2: 查看结果 ===== */
.stage-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
