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
                        天的历史光伏发电数据Excel文件<br />
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
                            href="https://pmac.leyi.host/downloads/光伏发电预测模版.xlsx"
                            download
                        >
                            <el-icon class="el-icon--right">
                                <Download />
                            </el-icon>
                            下载模版
                        </el-link>
                    </div>
                    <small class="text-muted"
                        >列为 0:00｜0:15｜0:30｜0:45｜...
                        ｜23:00（数据粒度为15分钟）
                        <br />行为YYYY-MM-DD格式的日期</small
                    >
                </div>
            </div>
        </template>
        <template v-else>
            <template v-if="excelInfo">
                <!-- 检验结果 -->
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">数据天数</span>
                        <span class="stat-value"
                            >{{ excelInfo.stats.days }} 天</span
                        >
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">时间粒度</span>
                        <span class="stat-value">小时</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">日期范围</span>
                        <span class="stat-value">{{
                            excelInfo.dateRange.join(" 至 ")
                        }}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">数据状态</span>
                        <span class="stat-value">{{
                            excelInfo.stats.status
                        }}</span>
                    </div>
                </div>
                <!-- 文件预览 -->
                <div class="file-info-card" @click="downloadUploadExcel">
                    <div class="file-details">
                        <div class="file-icon">
                            <i class="bi bi-file-earmark-excel"></i>
                        </div>
                        <div class="file-meta">
                            <div class="file-name">
                                {{ excelInfo.name }}
                            </div>
                            <div class="file-size">
                                文件大小:
                                {{ formatFileSize(excelInfo.size * 1024) }}
                            </div>
                            <div class="upload-time">
                                上传时间:
                                {{ formatDate(excelInfo.uploadTime) }}
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 删除文件 -->
                <div class="remove-file">
                    <button
                        class="btn btn-sm btn-outline-danger"
                        @click="removeFile"
                    >
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </template>
        </template>
    </div>
</template>

<script setup>
import { Download } from "@element-plus/icons-vue";
import { ref, computed } from "vue";
import { useElecStore } from "@/store/elec"; // 修改为新的Store
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";

const forecastStore = useElecStore(); // 使用新的综合Store

const file = computed(() => forecastStore.uploadedFile); // 直接从新Store获取文件
const isContinue = computed(() => forecastStore.isContinue); // 判断是否处于继续预测状态

const excelInfo = ref(null);
// 监听文件上传变化：当文件上传时，更新file变量并触发事件
async function handleFileChange(uploadFile) {
    if (uploadFile) {
        forecastStore.setFile(uploadFile.raw);

        // 调用新接口获取文件信息
        try {
            const formData = new FormData();
            formData.append("file", uploadFile.raw);
            formData.append("isContinue", isContinue.value ? "1" : "0");

            const response = await request.post(
                "/api/elec_forecast/fileinfo",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                excelInfo.value = response.data.excelInfo;
            }
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.details
            ) {
                ElMessageBox.alert(
                    error.response.data.details,
                    "请重新上传文件",
                    {
                        confirmButtonText: "知道了",
                    }
                );
            } else {
                ElMessage.error("获取文件信息失败，请检查文件格式");
            }
            forecastStore.removeFile();
            excelInfo.value = null;
            console.error("Error getting file info:", error);
        }
    }
}

// 当文件被删除时，清空file变量
function removeFile() {
    forecastStore.removeFile();
    excelInfo.value = null;
}
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 10px;
    .stat-item {
        display: flex;
        flex-direction: column;
        background-color: #f0f8ff;
        padding: 8px;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .stat-label {
            font-size: 0.75rem;
            color: #6c757d;
            margin-bottom: 4px;
            font-weight: 500;
        }

        .stat-value {
            font-weight: 600;
            color: #2c3e50;
            font-size: 0.85rem;
        }
    }
}

.file-info-card {
    background: white;
    border-radius: 10px;
    padding: 16px;
    margin: 15px 0;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border: 1px solid #eaeaea;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
    width: 100%;

    .file-details {
        display: flex;
        align-items: center;
        gap: 15px;

        .file-icon {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            background: linear-gradient(135deg, #e3f2fd, #bbdefb);
            display: flex;
            align-items: center;
            justify-content: center;

            i {
                font-size: 1.8rem;
                color: #1a73e8;
            }
        }

        .file-meta {
            flex: 1;

            .file-name {
                font-weight: 600;
                font-size: 1rem;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .file-size,
            .upload-time {
                font-size: 0.85rem;
                color: #6c757d;
                display: flex;
                align-items: center;
                gap: 5px;
                margin-bottom: 3px;
            }
        }
    }

    /* 悬停效果优化 */
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(52, 152, 219, 0.2);
        border-color: #3498db;

        .file-icon {
            background: linear-gradient(135deg, #d1e7ff, #a3d0fd);
        }
    }
}

.remove-file {
    width: 100%;
    display: flex;
    justify-content: end;
}
</style>
