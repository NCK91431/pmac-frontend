<template>
    <div class="file-upload card border-0 shadow-sm h-100">
        <!-- 主标题区域 -->

        <!-- 负荷文件上传 -->
        <div class="upload-section mb-4">
            <div class="section-header load-upload-header">
                <div class="d-flex align-items-center">
                    <i class="bi bi-graph-up section-icon"></i>
                    <h5 class="section-title mb-0">负荷曲线</h5>
                    <span class="required-badge">必填</span>
                </div>
            </div>
            <template v-if="!loadFile">
                <el-upload
                    class="upload-area"
                    drag
                    action=""
                    :auto-upload="false"
                    :on-change="(file) => handleFileChange(file, 'load')"
                >
                    <div class="upload-content">
                        <div class="upload-icon">
                            <i class="bi bi-file-earmark-excel"></i>
                        </div>
                        <h4>拖放Excel文件到此处</h4>
                        <p class="text-muted">
                            建议上传1年24小时负荷数据以获得更为准确的评估
                        </p>
                        <el-button type="primary" size="medium">
                            <i class="bi bi-upload me-1"></i> 选择文件
                        </el-button>
                    </div>
                </el-upload>
                <div class="file-tip">
                    <div class="file-details">
                        <div class="line">
                            <h6>格式要求</h6>
                            <el-link
                                type="primary"
                                href="https://pmac.leyi.host/downloads/光储定容_负荷模版(1年).xlsx"
                                download
                            >
                                <el-icon class="el-icon--right">
                                    <Download />
                                </el-icon>
                                下载模版
                            </el-link>
                        </div>
                        <small class="text-muted">
                            第一列为日期列，第二列开始为0:00-23:00的24小时负荷数据
                            <br />负荷单位为兆瓦（MW）
                        </small>
                    </div>
                </div>
            </template>
            <template v-else>
                <template v-if="loadExcelInfo">
                    <!-- 负荷文件信息 -->
                    <div class="file-card">
                        <!-- 文件统计信息 -->
                        <div class="stats-title">
                            <i class="bi bi-bar-chart-line"></i>
                            文件数据统计
                        </div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">数据天数</span>
                                <span class="stat-value"
                                    >{{ loadExcelInfo.stats.days }} 天</span
                                >
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">时间粒度</span>
                                <span class="stat-value">小时</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">上传日期</span>
                                <span class="stat-value">{{
                                    loadExcelInfo.uploadTime
                                }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">数据状态</span>
                                <span class="stat-value">{{
                                    loadExcelInfo.stats.status
                                }}</span>
                            </div>
                        </div>
                        <!-- 文件预览 -->
                        <div
                            class="file-info-card"
                            @click="downloadUploadExcel"
                        >
                            <!-- 添加下载指示器 -->
                            <div class="download-indicator">
                                <i class="bi bi-download"></i>
                            </div>
                            <div class="file-details">
                                <div class="file-icon">
                                    <i class="bi bi-file-earmark-excel"></i>
                                </div>
                                <div class="file-meta">
                                    <div class="file-name">
                                        {{ loadExcelInfo.name }}
                                    </div>
                                    <div class="file-size">
                                        文件大小:
                                        {{
                                            formatFileSize(
                                                loadExcelInfo.size * 1024
                                            )
                                        }}
                                    </div>
                                    <div class="upload-time">
                                        上传时间:
                                        {{ loadExcelInfo.uploadTime }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 删除负荷文件 -->
                        <div class="remove-file">
                            <button
                                class="btn btn-sm btn-outline-danger"
                                @click="removeFile('load')"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </template>
            </template>
        </div>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- 电价文件上传 -->
        <div class="upload-section">
            <div class="section-header">
                <i class="bi bi-currency-dollar section-icon"></i>
                <h5 class="section-title">电价曲线</h5>
                <span class="required-badge">必填</span>
            </div>
            <template v-if="!priceFile">
                <el-upload
                    class="upload-area"
                    drag
                    action=""
                    :auto-upload="false"
                    :on-change="(file) => handleFileChange(file, 'price')"
                >
                    <div class="upload-content">
                        <div class="upload-icon">
                            <i class="bi bi-file-earmark-excel"></i>
                        </div>
                        <h4>拖放Excel文件到此处</h4>
                        <p class="text-muted">
                            请上传 24 小时电价数据Excel文件<br />
                        </p>
                        <el-button type="primary" size="medium">
                            <i class="bi bi-upload me-1"></i> 选择文件
                        </el-button>
                    </div>
                </el-upload>
                <div class="file-tip">
                    <div class="file-details">
                        <div class="line">
                            <h6>格式要求</h6>
                            <el-link
                                type="primary"
                                href="https://pmac.leyi.host/downloads/光储定容_电价模版.xlsx"
                                download
                            >
                                <el-icon class="el-icon--right">
                                    <Download />
                                </el-icon>
                                下载模版
                            </el-link>
                        </div>
                        <small class="text-muted"
                            >只需一行24小时电价数据，不需要日期列</small
                        >
                    </div>
                </div>
            </template>
            <template v-else>
                <template v-if="priceExcelInfo">
                    <!-- 电价文件信息 -->
                    <div class="file-card">
                        <!-- 文件统计信息 -->
                        <div class="stats-title">
                            <i class="bi bi-bar-chart-line"></i>
                            文件数据统计
                        </div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">数据天数</span>
                                <span class="stat-value"
                                    >{{ priceExcelInfo.stats.days }} 天</span
                                >
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">时间粒度</span>
                                <span class="stat-value">小时</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">上传日期</span>
                                <span class="stat-value">{{
                                    priceExcelInfo.uploadTime
                                }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">数据状态</span>
                                <span class="stat-value">{{
                                    priceExcelInfo.stats.status
                                }}</span>
                            </div>
                        </div>
                        <!-- 文件预览 -->
                        <div
                            class="file-info-card"
                            @click="downloadUploadExcel"
                        >
                            <!-- 添加下载指示器 -->
                            <div class="download-indicator">
                                <i class="bi bi-download"></i>
                            </div>
                            <div class="file-details">
                                <div class="file-icon">
                                    <i class="bi bi-file-earmark-excel"></i>
                                </div>
                                <div class="file-meta">
                                    <div class="file-name">
                                        {{ priceExcelInfo.name }}
                                    </div>
                                    <div class="file-size">
                                        文件大小:
                                        {{
                                            formatFileSize(
                                                priceExcelInfo.size * 1024
                                            )
                                        }}
                                    </div>
                                    <div class="upload-time">
                                        上传时间:
                                        {{ priceExcelInfo.uploadTime }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 删除电价文件 -->
                        <div class="remove-file">
                            <button
                                class="btn btn-sm btn-outline-danger"
                                @click="removeFile('price')"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Download } from "@element-plus/icons-vue";
import { useLightStore } from "@/store/light";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";

const forecastStore = useLightStore();

const loadFile = computed(() => forecastStore.uploadedLoadFile);
const priceFile = computed(() => forecastStore.uploadedPriceFile);

// 处理持续时间变化
function handleDurationChange(duration) {
    forecastStore.set_loadDuration(duration);
    // 如果已经上传了文件，当切换选项时可能需要清除文件
    if (forecastStore.uploadedLoadFile) {
        forecastStore.removeFile("load");
    }
}

// 监听文件上传变化
function handleFileChange(uploadFile, fileType) {
    if (uploadFile) {
        forecastStore.setFile({ fileType, file: uploadFile.raw });
        getExcelInfo(uploadFile, fileType);
    }
}

// 当文件被删除时，清空file变量
function removeFile(fileType) {
    forecastStore.removeFile(fileType);
}

// 格式化文件大小为可读格式
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/* 获取文件信息 */
const loadExcelInfo = ref(null);
const priceExcelInfo = ref(null);
async function getExcelInfo(uploadFile, fileType) {
    // 调用新接口获取文件信息
    try {
        const formData = new FormData();
        formData.append("file", uploadFile.raw);
        const response = await request.post(
            `/api/light_forecast/fileinfo/${fileType}file`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response.data.success) {
            switch (fileType) {
                case "load":
                    loadExcelInfo.value = response.data.excelInfo;
                    break;
                case "price":
                    priceExcelInfo.value = response.data.excelInfo;
            }
        }
    } catch (error) {
        if (
            error.response &&
            error.response.data &&
            error.response.data.details
        ) {
            ElMessageBox.alert(error.response.data.details, "请重新上传文件", {
                confirmButtonText: "知道了",
            });
        } else {
            ElMessage.error("获取文件信息失败，请检查文件格式");
        }
        forecastStore.removeFile(fileType);
        if (fileType == "load") {
            loadExcelInfo.value = null;
        }
        if (fileType == "price") {
            priceExcelInfo.value = null;
        }
        console.error("Error getting file info:", error);
    }
}
</script>

<style lang="scss" scoped>
.file-upload {
    background-color: #fff;
    border-radius: 8px;
    min-height: 300px;
    padding: 20px;
    display: flex;
    flex-direction: column;

    .divider {
        height: 1px;
        background: linear-gradient(
            to right,
            transparent,
            #dee2e6,
            transparent
        );
        margin: 20px 0;
    }

    .upload-section {
        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            &.load-upload-header {
                justify-content: space-between; // 添加这行让左右内容两端对齐
            }

            .section-icon {
                font-size: 1.4rem;
                color: #2c6fbb;
                margin-right: 10px;
            }

            .section-title {
                margin: 0;
                font-weight: 600;
                color: #495057;
            }

            .required-badge {
                background-color: #dc3545;
                color: white;
                font-size: 0.65rem;
                padding: 2px 6px;
                border-radius: 10px;
                margin-left: 10px;
                font-weight: 500;
            }
        }
    }
}

.upload-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #e8f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;

    i {
        font-size: 2.5rem;
        color: #2c6fbb;
    }
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

        h4 {
            margin: 10px 0;
            font-weight: 600;
            color: #495057;
        }

        .text-muted {
            color: #6c757d;
            margin: 5px 0 10px 0;
        }

        .el-button {
            margin-top: 10px;
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
            align-items: center;
        }

        h6 {
            margin: 0;
            font-size: 1rem;
            color: #2c6fbb;
        }

        small {
            font-size: 0.85rem;
            color: #6c757d;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .file-upload {
        padding: 15px;

        .header-section {
            .title-container {
                flex-wrap: wrap;

                .title {
                    font-size: 1.5rem;
                }
            }
        }

        .upload-section {
            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    }

    .upload-icon {
        width: 60px;
        height: 60px;

        i {
            font-size: 2rem;
        }
    }
}

.file-card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 20px;
    flex: 1;
    min-width: 280px;

    .stats-title {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 1rem;

        i {
            font-size: 1.1rem;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        .stat-item {
            display: flex;
            flex-direction: column;
            background-color: #f0f8ff;
            padding: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border-radius: 6px;

            .stat-label {
                font-size: 0.8rem;
                color: #6c757d;
                margin-bottom: 4px;
            }

            .stat-value {
                font-weight: 600;
                color: #2c3e50;
                font-size: 1rem;
            }
        }
    }

    .remove-file {
        width: 100%;
        display: flex;
        justify-content: end;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    /* 文件信息卡片 */
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

        /* 添加下载指示器 */
        .download-indicator {
            position: absolute;
            top: 8px;
            right: 12px;
            color: #3498db;
            font-size: 1rem;
            opacity: 0;
            transition: opacity 0.3s;
        }

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

            .download-indicator {
                opacity: 1;
            }

            .file-icon {
                background: linear-gradient(135deg, #d1e7ff, #a3d0fd);
            }
        }
    }
}
</style>
