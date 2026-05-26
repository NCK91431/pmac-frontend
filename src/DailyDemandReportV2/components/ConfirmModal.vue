<template>
  <el-dialog
    v-model="visible"
    title="确认提交"
    width="520px"
    top="30vh"
    modal-class="v2-confirm-modal"
    :close-on-click-modal="false"
  >
    <div class="v2-confirm-summary">
      <div class="v2-confirm-row">
        <span class="v2-confirm-label">申报日期：</span>
        <span class="v2-confirm-value">{{
          summary.declarationDate || "-"
        }}</span>
      </div>
      <div class="v2-confirm-row">
        <span class="v2-confirm-label">选中数据源：</span>
        <span class="v2-confirm-value"
          >{{ summary.dateCount || 0 }} 个日期</span
        >
      </div>
      <div class="v2-confirm-row">
        <span class="v2-confirm-label">总申报电量：</span>
        <span class="v2-confirm-value v2-confirm-highlight"
          >{{ summary.totalQuantity ?? "-" }} MWh</span
        >
      </div>
    </div>

    <template #footer>
      <div class="v2-confirm-footer">
        <el-button class="v2-btn-cancel" @click="handleCancel">取消</el-button>
        <el-button class="v2-btn-confirm" @click="handleConfirm"
          >确认提交</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  summary: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function handleCancel() {
  visible.value = false;
}

function handleConfirm() {
  emit("confirm");
}
</script>

<style scoped lang="scss">
.v2-confirm {
  &-summary {
    padding: 8px 0;
  }

  &-row {
    display: flex;
    align-items: center;
    padding: 10px 0;
    font-size: 15px;
  }

  &-label {
    color: #595959;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &-value {
    color: #333;
    font-weight: 600;
    margin-left: 4px;
  }

  &-highlight {
    color: #fa8c16;
    font-weight: 700;
  }

  &-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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
}
</style>
