<template>
  <el-dialog
    v-model="visible"
    title="📅 新增日期"
    width="720px"
    top="8vh"
    :close-on-click-modal="false"
    @closed="resetState"
  >
    <div class="date-selector-row">
      <span class="selector-label">选择日期</span>
      <el-date-picker
        v-model="date"
        type="date"
        placeholder="请选择日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :disabled="loading"
        @change="handleDateChange"
      />
    </div>

    <div v-if="loading" class="v2-add-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>正在获取日期信息...</span>
    </div>

    <el-alert
      v-if="warning"
      :title="warning"
      type="warning"
      show-icon
      :closable="false"
      class="v2-add-alert"
    />

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="v2-add-alert"
    />

    <div v-if="previewData" class="preview-section">
      <div class="preview-title">日期信息预览</div>
      <div class="v2-table-wrapper">
        <el-table
          :data="[previewData]"
          border
          class="v2-table"
          style="width: 100%"
        >
          <el-table-column type="index" label="#" width="36px" align="center" />
          <el-table-column prop="date" label="日期" width="85px" />
          <el-table-column prop="day_of_the_week" label="星期" width="50px" />
          <el-table-column prop="date_type" label="日期类型" width="70px" />
          <el-table-column prop="holiday_name" label="节假日" width="65px" />
          <el-table-column prop="temperatureMin" label="最低温" width="50px" />
          <el-table-column prop="temperatureMax" label="最高温" width="50px" />
          <el-table-column
            prop="cloudCoverEarlyMorning"
            label="凌晨云量"
            width="50px"
          />
          <el-table-column
            prop="cloudCoverMorning"
            label="上午云量"
            width="50px"
          />
          <el-table-column
            prop="cloudCoverAfternoon"
            label="下午云量"
            width="50px"
          />
          <el-table-column
            prop="cloudCoverEvening"
            label="晚上云量"
            width="50px"
          />
          <el-table-column prop="windSpeed" label="风速" width="45px" />
          <el-table-column prop="windDirection" label="风向°" width="45px" />
          <el-table-column prop="weather" label="天气" width="55px" />
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="v2-add-footer">
        <el-button class="v2-btn-cancel" @click="handleCancel">取消</el-button>
        <el-button
          class="v2-btn-confirm"
          :disabled="!previewData || !!warning"
          @click="handleConfirm"
        >
          ✔ 确定添加
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { Loading } from "@element-plus/icons-vue";
import { manualDateApi } from "@/DailyDemandReportV2/api";
import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const store = useDailyDeclarationV2Store();

const date = ref("");
const loading = ref(false);
const error = ref("");
const warning = ref("");
const previewData = ref(null);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function resetState() {
  date.value = "";
  loading.value = false;
  error.value = "";
  warning.value = "";
  previewData.value = null;
}

async function handleDateChange(val) {
  if (!val) {
    resetState();
    return;
  }

  error.value = "";
  warning.value = "";
  previewData.value = null;

  const exists = store.allSelectedDates.some((d) => d.date === val);
  if (exists) {
    warning.value = `日期 ${val} 已存在，请勿重复添加`;
    return;
  }

  loading.value = true;
  try {
    const res = await manualDateApi(val);
    const body = res.data;
    if (body.success) {
      previewData.value = body.data;
    } else {
      error.value = body.error || "获取日期信息失败";
    }
  } catch (e) {
    error.value = e.message || "网络请求失败，请稍后重试";
  } finally {
    loading.value = false;
  }
}

function handleConfirm() {
  if (!previewData.value) return;
  store.addManualDate(previewData.value);
  visible.value = false;
}

function handleCancel() {
  resetState();
  visible.value = false;
}
</script>

<style scoped lang="scss">
.date-selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
}

.selector-label {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
}

.preview-section {
  margin-top: 16px;
}

.preview-title {
  font-weight: 600;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  padding-left: 2px;
}

.v2-add {
  &-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 14px;
    color: #909399;
  }

  &-alert {
    margin-top: 16px;
  }

  &-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.v2-table-wrapper {
  margin-top: 8px;
  overflow-x: auto;

  :deep(.el-table) {
    border: none;
    font-size: 12px;
    color: #606266;

    &::before,
    &::after {
      display: none;
    }
  }

  :deep(.el-table__inner-wrapper) {
    border: none;
  }

  :deep(th.el-table__cell) {
    background: #f5f7fa !important;
    color: #303133;
    font-weight: 600;
    padding: 0;
    border: 1px solid #ebeef5 !important;

    .cell {
      padding: 8px 2px;
      line-height: 1.4;
      white-space: nowrap;
      text-align: center;
    }
  }

  :deep(td.el-table__cell) {
    padding: 0;
    border: 1px solid #ebeef5;
    color: #606266;

    .cell {
      padding: 6px 2px;
      line-height: 1.4;
      text-align: center;
    }
  }
}

.v2-btn-cancel {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  border: 1px solid #d9d9d9;
  background: #fff;

  &:hover {
    color: #1890ff;
    border-color: #1890ff;
  }
}

.v2-btn-confirm {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  color: #fff;
  background: #1890ff;
  border: 1px solid #1890ff;

  &:hover {
    background: #40a9ff;
    border-color: #40a9ff;
  }

  &:disabled {
    background: #a0cfff;
    border-color: #a0cfff;
    cursor: not-allowed;
  }
}
</style>
