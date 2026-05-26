<template>
  <div class="v2-step-bar">
    <template v-for="(step, index) in steps" :key="step.index">
      <div
        :class="[
          'v2-step-item',
          {
            active: step.index === currentStep,
            completed:
              completedSteps.includes(step.index) && step.index !== currentStep,
            disabled: step.index > maxReachable,
          },
        ]"
        @click="handleStepClick(step.index)"
      >
        <span class="v2-step-num">
          <el-icon v-if="completedSteps.includes(step.index)" :size="16">
            <Check />
          </el-icon>
          <span v-else>{{ step.index }}</span>
        </span>
        <span class="v2-step-label">{{ step.label }}</span>
        <span class="v2-step-desc">{{ step.desc }}</span>
      </div>
      <span v-if="index < steps.length - 1" class="v2-step-arrow">›</span>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Check } from "@element-plus/icons-vue";

const props = defineProps({
  currentStep: {
    type: Number,
    default: 1,
  },
  completedSteps: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["switch-step"]);

const steps = [
  { index: 1, label: "选择申报日期", desc: "目标日期" },
  { index: 2, label: "筛选可用数据源", desc: "筛选可用数据源" },
  { index: 3, label: "申报", desc: "策略申报表" },
];

const maxReachable = computed(() => {
  if (props.completedSteps.length === 0) return 1;
  return Math.max(...props.completedSteps) + 1;
});

function handleStepClick(index) {
  if (index === props.currentStep) return;
  if (index > maxReachable.value) return;
  emit("switch-step", index);
}
</script>

<style scoped lang="scss">
.v2-step-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  margin-bottom: 20px;
}

.v2-step-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  user-select: none;

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 1px;
    background: #e5e7eb;
  }

  &:hover {
    background: #fafafa;
  }

  &.active {
    background: #e6f7ff;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.v2-step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #d9d9d9;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.2s;
}

.v2-step-item.active .v2-step-num {
  background: #1890ff;
  color: #fff;
}

.v2-step-item.completed .v2-step-num {
  background: #52c41a;
}

.v2-step-label {
  font-size: 14px;
  color: #8c8c8c;
  white-space: nowrap;
  transition: color 0.2s;
}

.v2-step-item.active .v2-step-label {
  color: #0050b3;
  font-weight: 600;
}

.v2-step-item.completed .v2-step-label {
  color: #52c41a;
}

.v2-step-desc {
  font-size: 11px;
  color: #bfbfbf;
  margin-left: 4px;
  display: none;
}

.v2-step-item.active .v2-step-desc {
  display: inline;
  color: #91d5ff;
}

.v2-step-arrow {
  color: #d9d9d9;
  font-size: 20px;
  flex-shrink: 0;
  padding: 0 4px;
}
</style>
