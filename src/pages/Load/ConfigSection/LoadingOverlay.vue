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
            <h3 class="mb-3">模型训练中...</h3>
            <p class="text-muted">预测任务已提交，后台正在处理中</p>
            <p class="text-muted">
                这可能需要几分钟时间，您可以继续浏览其他页面
            </p>
            <!-- <div class="progress mt-4" style="height: 10px">
                <el-progress
                    :percentage="loading ? undefined : 0"
                    :color="loading ? undefined : '#e6e6e6'"
                />
            </div>
            <p class="mt-2 small text-muted">
                预估剩余时间: {{ estimatedTime }}
            </p> -->
        </div>
    </div>
</template>

<script setup></script>

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
