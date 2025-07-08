<template>
    <div
        class="file-upload card border-0 shadow-sm p-3 h-100 d-flex flex-column align-items-center justify-content-center"
    >
        <div v-if="!file" class="text-center">
            <div class="upload-icon mb-3">
                <i class="bi bi-file-earmark-excel text-success fs-1"></i>
            </div>
            <h5 class="mb-3">上传负荷数据</h5>
            <p class="text-muted small mb-4">
                请上传90天的24小时负荷数据Excel文件<br />
                (格式要求: 列名为0:00-23:00, 行为YYYY-MM-DD格式的日期)
            </p>
            <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
                accept=".xlsx, .xls"
            >
                <button class="btn btn-outline-primary px-4">
                    <i class="bi bi-upload me-2"></i>选择文件
                </button>
            </el-upload>
        </div>

        <div v-else class="w-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
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
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

const file = ref(null);
const emit = defineEmits(["file-uploaded"]);

// 监听文件上传变化：当文件上传时，更新file变量并触发事件
function handleFileChange(uploadFile) {
    if (uploadFile) {
        file.value = uploadFile.raw;
        emit("file-uploaded", file.value);
    }
}

// 当文件被删除时，清空file变量
function removeFile() {
    file.value = null;
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
</style>
