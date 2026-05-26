<template>
  <div class="ai-query-text-viewer">
    <div class="ai-query-label">用户输入的查询需求</div>
    <div class="ai-query-content">
      <el-icon class="ai-query-icon"><Search /></el-icon>
      <span class="ai-query-text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";

defineProps({
  text: { type: String, default: "" },
});
</script>

<style scoped lang="scss">
.ai-query-text-viewer {
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.ai-query {
  &-label {
    font-size: 11px;
    color: #8c8c8c;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  &-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &-icon {
    color: #1890ff;
    font-size: 16px;
    flex-shrink: 0;
  }

  &-text {
    font-size: 14px;
    color: #303133;
    line-height: 1.6;
    word-break: break-all;
  }
}
</style>
