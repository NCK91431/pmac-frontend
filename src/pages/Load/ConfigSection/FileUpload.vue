<template>
    <div
        class="file-upload card border-0 shadow-sm p-3 h-100 d-flex flex-column align-items-center justify-content-center"
    >
        <template v-if="!file">
            <el-upload
                class="upload-area"
                drag
                action=""
                :auto-upload="false"
                :on-change="handleFileChange"
            >
                <div class="upload-content">
                    <h4>拖放Excel文件到此处</h4>
                    <p class="text-muted">
                        请上传至少
                        {{ isContinue ? 1 : 90 }}
                        天的 24 小时负荷数据Excel文件<br />
                    </p>
                    <p class="text-muted">或</p>
                    <el-button type="primary" size="medium">
                        <i class="fas fa-file-upload"></i> 选择文件
                    </el-button>
                </div>
            </el-upload>
            <div class="file-tip">
                <div class="file-details">
                    <div class="line">
                        <h6>格式要求</h6>
                        <el-link
                            type="primary"
                            href="https://pmac.leyi.host/downloads/loadforecasr_template.xlsx"
                            download
                        >
                            <el-icon class="el-icon--right">
                                <Download />
                            </el-icon>
                            下载模版
                        </el-link>
                    </div>
                    <small class="text-muted"
                        >列名为0:00-23:00, 行为YYYY-MM-DD格式的日期</small
                    >
                </div>
            </div>
        </template>
        <template v-else>
            <div
                class="w-100 d-flex justify-content-between align-items-center mb-3"
            >
                <h5 class="mb-0">已上传文件</h5>
                <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removeFile"
                >
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="file-info card p-3">
                <div class="d-flex align-items-center">
                    <i
                        class="bi bi-file-earmark-excel text-success fs-3 me-3"
                    ></i>
                    <div>
                        <div class="fw-bold">{{ file.name }}</div>
                        <div class="text-muted small">
                            {{ formatFileSize(file.size) }} • 上传时间:
                            {{ new Date().toLocaleTimeString() }}
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { Download } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useLoadPreFormStore } from "@/store/loadpreformStore";
import { useForecastStore } from "@/store/forecast";

const formStore = useLoadPreFormStore();
const file = computed(() => formStore.uploadedFile); // 用Pinia管理file

const forecastStore = useForecastStore();
const isContinue = computed(() => forecastStore.isContinue); // 判断是否处于继续预测状态

// 监听文件上传变化：当文件上传时，更新file变量并触发事件
function handleFileChange(uploadFile) {
    if (uploadFile) {
        formStore.setFile(uploadFile.raw);
    }
}

// 当文件被删除时，清空file变量
function removeFile() {
    formStore.removeFile();
}

// 格式化文件大小为可读格式
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
</script>

<style lang="scss" scoped>
.file-upload {
    background-color: #fff;
    border-radius: 6px;
    min-height: 300px;
}

.upload-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #e8f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.file-info {
    background-color: #f8f9fa;
    border: 1px dashed #dee2e6;
    border-radius: 6px;
}

.upload-area {
    width: 100%;

    :deep(.el-upload) {
        width: 100%;
    }

    :deep(.el-upload-dragger) {
        width: 100%;
        height: auto;
        padding: 40px 20px;
        border: 2px dashed #dcdfe6;
        border-radius: 10px;
        background-color: #f8f9fa;
        transition: all 0.3s;

        &:hover {
            border-color: #2c6fbb;
            background-color: rgba(44, 111, 187, 0.05);
        }
    }

    .upload-content {
        text-align: center;
        .upload-icon {
            font-size: 3.5rem;
            color: #c0c4cc;
            margin-bottom: 15px;
        }

        h4 {
            margin: 10px 0;
            font-weight: 600;
        }

        .text-muted {
            color: #909399;
            margin: 5px 0;
        }
    }
}

.file-tip {
    margin-top: 25px;
    background-color: #f0f7ff;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #2c6fbb;
    width: 100%;
    .file-details {
        display: flex;
        flex-direction: column;
        gap: 5px;
        .line {
            display: flex;
            justify-content: space-between;
        }
        .file-icon {
            font-size: 2.2rem;
            color: #1d6f42;
            margin-right: 15px;
        }

        h6 {
            margin: 0;
            font-size: 1.1rem;
        }

        small {
            font-size: 0.85rem;
        }

        .el-button {
            margin-left: auto;
        }
    }
}
</style>
