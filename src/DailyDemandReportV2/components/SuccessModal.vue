<template>
  <el-dialog
    v-model="visible"
    title="提示"
    width="400px"
    top="30vh"
    modal-class="v2-success-modal"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="v2-success-content">
      <el-icon :size="48" class="v2-success-icon">
        <CircleCheckFilled />
      </el-icon>
      <div class="v2-success-text">提交成功！</div>
    </div>

    <template #footer>
      <div class="v2-success-footer">
        <el-button class="v2-btn-know" @click="handleClose">知道了</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from "vue";
import { CircleCheckFilled } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function handleClose() {
  visible.value = false;
}
</script>

<style scoped lang="scss">
.v2-success {
  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 0;
  }

  &-icon {
    color: #52c41a;
  }

  &-text {
    font-size: 20px;
    font-weight: 700;
    color: #333;
  }

  &-footer {
    display: flex;
    justify-content: center;
  }
}

.v2-btn-know {
  padding: 8px 28px;
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
</style>
