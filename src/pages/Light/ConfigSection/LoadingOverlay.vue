<template>
    <div class="loading-content">
        <div
            class="spinner-border text-primary"
            role="status"
            style="width: 4rem; height: 4rem"
        >
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="mt-4">
            <h3 class="mb-3">测算中...</h3>
            <p class="text-muted">测算任务已提交，后台正在处理中</p>
            <!-- 添加进度条 -->
            <el-progress :percentage="progress" :stroke-width="15" striped />
            <p class="text-muted">
                <i class="fas fa-info-circle me-2"></i>
                这可能需要几分钟时间，您可以继续浏览其他页面
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const progress = ref(0);
let intervalId = null;

const startProgress = () => {
    const duration = 60000; // 总时长60秒
    const totalSteps = 99; // 总共99步（0%到99%）
    const intervalTime = Math.round(duration / totalSteps); // 每步间隔时间

    progress.value = 0; // 重置为0%
    let step = 0;

    intervalId = setInterval(() => {
        step += 1;
        progress.value = step; // 直接设置整数百分比

        if (step >= totalSteps) {
            clearInterval(intervalId);
        }
    }, intervalTime);
};

onMounted(() => {
    startProgress();
});

onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
});
</script>

<style lang="scss" scoped>
.loading-content {
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
    padding: 30px;
    max-width: 500px;
    width: 90%;
    text-align: center;
}
</style>
