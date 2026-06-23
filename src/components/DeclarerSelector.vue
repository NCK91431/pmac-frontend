<template>
  <div class="record-banner">
    <div class="banner-left">
      <span class="banner-field">
        共{{ totalCount }}人申报此目标日期
      </span>
      <el-select
        :model-value="modelValue"
        placeholder="选择申报人"
        size="small"
        style="width: 200px"
        @update:model-value="$emit('update:modelValue', $event)"
        @change="$emit('change', $event)"
      >
        <el-option
          v-for="d in declarers"
          :key="d.declarant_id"
          :label="d.name"
          :value="d.declarant_id"
        >
          <span style="display: flex; align-items: center; gap: 6px">
            <el-tag size="small">用户ID:{{ d.declarant_id }}</el-tag>
            <span>{{ d.name }}</span>
          </span>
        </el-option>
      </el-select>
      <span class="banner-field">
        <el-icon><User /></el-icon>
        <span>申报人：{{ declarerName }}</span>
      </span>
      <span v-if="showSubmitTime" class="banner-divider"></span>
      <span v-if="showSubmitTime" class="banner-field">
        <el-icon><Clock /></el-icon>
        <span>申报时间：{{ submitTime }}</span>
      </span>
    </div>
    <div v-if="showActions" class="banner-right">
      <el-button v-if="isOwnRecord" type="primary" @click="$emit('modify')"
        >修改申报</el-button
      >
      <el-button
        v-if="isOwnRecord"
        type="danger"
        plain
        @click="$emit('delete')"
        >删除此申报</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { User } from "@element-plus/icons-vue";

defineProps({
  declarers: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Number,
    default: null,
  },
  declarerName: {
    type: String,
    default: "—",
  },
  submitTime: {
    type: String,
    default: "—",
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  isOwnRecord: {
    type: Boolean,
    default: false,
  },
  showSubmitTime: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["update:modelValue", "change", "modify", "delete"]);
</script>

<style scoped lang="scss">
.record-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
  border: 1px solid #91d5ff;
  border-radius: 8px;
  margin-bottom: 16px;

  .banner-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .banner-field {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #303133;

    .el-icon {
      font-size: 16px;
      color: #1890ff;
    }
  }

  .banner-divider {
    width: 1px;
    height: 20px;
    background: #91d5ff;
  }

  .banner-right {
    display: flex;
    gap: 8px;
  }
}
</style>
