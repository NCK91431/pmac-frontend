<template>
  <div class="record-banner">
    <!-- 无申报人空状态 -->
    <div v-if="!declarers || declarers.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <span class="empty-text">此日期没有申报记录</span>
    </div>

    <!-- 有申报人正常展示 -->
    <template v-else>
      <div class="banner-left">
        <span class="banner-field"> 共{{ totalCount }}人申报此目标日期 </span>
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
    </template>
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
  margin-bottom: 10px;

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

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  width: 100%;

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #f5f5f5;

    svg {
      width: 18px;
      height: 18px;
      color: #bfc4cc;
    }
  }

  .empty-text {
    font-size: 14px;
    font-weight: 500;
    color: #9ca3af;
    letter-spacing: 0.3px;
  }
}
</style>
