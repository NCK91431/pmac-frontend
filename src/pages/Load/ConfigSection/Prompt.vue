<template>
    <div class="prompt-section card shadow-sm mb-4">
        <div class="card-body p-4">
            <!-- 文件格式要求图片 -->
            <div class="image-section mb-4">
                <h5 class="image-title mb-3">
                    <i class="bi bi-file-earmark-image me-1"></i>
                    旧版本上传文件格式要求
                </h5>
                <img
                    src="https://pmac.leyi.host/downloads/pmac/load-file-img.png"
                    alt="上传文件格式要求"
                    class="format-image w-100"
                    @error="handleImageError"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ElMessage } from "element-plus";

// 图片加载失败处理
const handleImageError = (event) => {
    console.error("图片加载失败:", event);
    ElMessage.warning("文件格式说明图片加载失败，请检查网络连接");
};
</script>

<style lang="scss" scoped>
.prompt-section {
    border-radius: 8px;
    border: 1px solid #dee2e6;
    background-color: #fff;

    .image-title {
        color: #2c6fbb;
        padding-bottom: 8px;
        border-bottom: 2px solid #f0f7ff;

        i {
            font-size: 1.2rem;
        }
    }

    .format-image {
        transition: transform 0.2s ease;

        &:hover {
            transform: scale(1.01);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .prompt-section {
        .card-body {
            padding: 1.5rem !important;
        }

        .explanation-content {
            font-size: 0.9rem;
        }

        .explanation-item {
            flex-direction: column;

            .item-number {
                margin-bottom: 8px;
                margin-right: 0 !important;
            }
        }
    }
}
</style>
