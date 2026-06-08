<template>
  <div class="training-overlay">
    <div class="training-body">
      <div class="training-left">
        <div class="spinner-wrap">
          <div class="loading-spinner"></div>
        </div>
        <div class="training-text">模型训练中~</div>
        <div class="training-progress">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <span class="progress-text">{{ Math.round(progressPercent) }}%</span>
        </div>
      </div>
      <div class="training-right">
        <div class="training-info">
          <span class="info-label">进度信息：</span>
          <span class="info-text" v-if="progressPercent < 50">正在加载数据...</span>
          <span class="info-text" v-else-if="progressPercent < 80">模型训练中...</span>
          <span class="info-text" v-else>即将完成...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const progressPercent = ref(0);

onMounted(() => {
  const interval = setInterval(() => {
    if (progressPercent.value < 95) {
      progressPercent.value += Math.random() * 4;
      if (progressPercent.value > 95) progressPercent.value = 95;
    }
  }, 500);
});
</script>

<style lang="scss" scoped>
.training-overlay {
  margin-top: 20px;
  padding: 24px 0;
  border-top: 1px solid #eee;
}

.training-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.training-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 520px;
}

.spinner-wrap {
  margin-bottom: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #2b6cb5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.training-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
}

.training-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #2b6cb5, #5a9fd4);
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: #2b6cb5;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.training-right {
  margin-top: 14px;
}

.training-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-label {
  font-size: 0.8rem;
  color: #888;
}

.info-text {
  font-size: 0.82rem;
  color: #2b6cb5;
}
</style>
