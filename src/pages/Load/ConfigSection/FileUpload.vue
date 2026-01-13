<template>
    <div
        class="file-upload card border-0 shadow-sm p-3 h-100 d-flex flex-column align-items-center justify-content-center"
    >
        <!-- 新增：加载状态（移到最外层） -->
        <div v-if="uploadLoading" class="loading-overlay">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">正在解析文件，请稍候...</p>
        </div>

        <template v-if="!uploadLoading">
            <!-- 新增：文件格式选择 -->
            <div class="format-selector mb-4">
                <div class="format-label">文件格式类型：</div>
                <el-radio-group
                    v-model="upload_file_type"
                    class="format-radio-group"
                    @change="onUploadFileType"
                >
                    <el-radio
                        label="南网标准版"
                        value="Southern-Network-Standard-Edition"
                    />
                    <el-radio label="旧版本格式" value="old-version" />
                </el-radio-group>
            </div>
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
                            <template
                                v-if="
                                    upload_file_type ===
                                    'Southern-Network-Standard-Edition'
                                "
                            >
                                您只需在广东电力中心导出"售电公司分时企业详情列表"文件就可直接上传，无需修改
                            </template>
                            <template v-else>
                                请上传至少
                                {{ isContinue ? 1 : mode == "T" ? 180 : 90 }}
                                {{
                                    isContinue
                                        ? "天的 24 小时负荷数据Excel文件"
                                        : "天的 24 小时负荷数据Excel文件。"
                                }}
                                <br v-if="!isContinue" />
                                {{
                                    isContinue
                                        ? ""
                                        : "建议用至少一年的数据，可获得更好的预测准确度。"
                                }}
                                <br />
                            </template>
                        </p>
                        <p></p>
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
                                :href="
                                    upload_file_type ===
                                    'Southern-Network-Standard-Edition'
                                        ? `https://pmac.leyi.host/downloads/南网标准版负荷数据模版.xlsx`
                                        : `https://pmac.leyi.host/downloads/loadforecast_template.xlsx`
                                "
                                download
                            >
                                <el-icon class="el-icon--right">
                                    <Download />
                                </el-icon>
                                下载模版
                            </el-link>
                        </div>
                        <small class="text-muted">
                            <template
                                v-if="
                                    upload_file_type ===
                                    'Southern-Network-Standard-Edition'
                                "
                            >
                                标准格式包含：序号、电力用户编码、电力用户名称、日期和24小时负荷数据
                            </template>
                            <template v-else>
                                列名为0:00-23:00, 行为YYYY-MM-DD格式的日期
                            </template>
                        </small>
                    </div>
                </div>
            </template>
            <!-- 文件信息卡片 -->
            <template v-else>
                <template v-if="excelInfo">
                    <!-- 峰值负荷警告提示 Start -->
                    <template v-if="mode == 'T'">
                        <div
                            v-if="
                                excelInfo.maxLoad && excelInfo.maxLoad.val < 10
                            "
                            class="peak-load-warning"
                        >
                            <div class="warning-content">
                                <div class="warning-icon">
                                    <i
                                        class="bi bi-exclamation-triangle-fill"
                                    ></i>
                                </div>
                                <div class="warning-text">
                                    <span
                                        >检测到您上传的分时负荷峰值
                                        {{ excelInfo.maxLoad.val }}MW
                                        小于10MW,<br />若提供的是</span
                                    >
                                    <span class="highlight-user">单个用户</span>
                                    <span>
                                        的历史负荷数据，建议切换至
                                        <el-text
                                            class="switch-text"
                                            @click="switchMode"
                                        >
                                            分项负荷预测
                                            <el-icon><TopRight /></el-icon>
                                        </el-text>
                                        模式。</span
                                    >
                                </div>
                            </div>
                        </div>
                    </template>
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
        </template>
    </div>
</template>

<script setup>
import { Download, TopRight } from "@element-plus/icons-vue";
import { ref, computed, watch } from "vue";
import { useLoadForecastStore } from "@/store/load"; // 修改为新的Store
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";

const forecastStore = useLoadForecastStore(); // 使用新的综合Store
const mode = computed(() => forecastStore.mode); // 预测模式
const file = computed(() => forecastStore.uploadedFile); // 直接从新Store获取文件
const isContinue = computed(() => forecastStore.isContinue); // 判断是否处于继续预测状态

const excelInfo = ref(null);

const uploadLoading = ref(false); // 新增：加载状态
const upload_file_type = computed(() => forecastStore.upload_file_type); // 新增：默认选择南网标准版
const standardFormatTemplateLink = "#"; // 可以设置为标准格式示例文件的链接

// 新增：监视文件格式变化，清除现有文件
watch(upload_file_type, (type) => {
    if (file.value) {
        forecastStore.removeFile();
        excelInfo.value = null;
    }
});

function onUploadFileType(type) {
    forecastStore.switchUploadFileType(type);
}

// 监听文件上传变化：当文件上传时，更新file变量并触发事件
async function handleFileChange(uploadFile) {
    if (uploadFile) {
        forecastStore.setFile(uploadFile.raw);
        // 开始加载
        uploadLoading.value = true;

        // 验证文件类型
        const fileName = uploadFile.name.toLowerCase();
        const isExcelFile =
            fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

        if (!isExcelFile) {
            ElMessage.error("请上传Excel文件 (.xlsx 或 .xls 格式)");
            uploadLoading.value = false;
            return;
        }

        forecastStore.setFile(uploadFile.raw);

        // 调用新接口获取文件信息
        try {
            const formData = new FormData();
            formData.append("file", uploadFile.raw);
            formData.append("isContinue", isContinue.value ? "1" : "0");
            formData.append("mode", mode.value);
            formData.append("upload_file_type", upload_file_type.value); //Southern-Network-Standard-Edition|old-version

            const response = await request.post("/api/fileinfo", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                excelInfo.value = response.data.excelInfo;
                forecastStore.setExcelInfo(response.data.excelInfo);

                // 根据文件类型显示不同的成功消息
                if (
                    upload_file_type.value ===
                    "Southern-Network-Standard-Edition"
                ) {
                    const stats = response.data.excelInfo.standardFormatStats;
                    if (stats) {
                        ElMessage.success({
                            message: `解析成功！共${stats.totalDates}天数据，${stats.totalUsers}个用户`,
                            duration: 3000,
                        });
                    }
                } else {
                    ElMessage.success("文件格式验证通过");
                }
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
        } finally {
            // 结束加载
            uploadLoading.value = false;
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
/* ---------------- 切换模式 -----------------*/
function switchMode() {
    forecastStore.switchMode();
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
    margin-top: 16px;
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

// 文件信息卡片样式 (从FinishView复制)
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
// 峰值负荷警告样式
.peak-load-warning {
    background: linear-gradient(135deg, #fff8e6, #fffbeb);
    border: 1px solid #ffd666;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    width: 100%;
    box-shadow: 0 2px 8px rgba(255, 182, 29, 0.1);
    animation: fadeInUp 0.5s ease;

    .warning-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .warning-icon {
            color: #ff9900;
            font-size: 1.3rem;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .warning-text {
            color: #8a6d3b;
            font-size: 0.9rem;
            line-height: 1.9;

            .highlight-user {
                color: #e74c3c;
                font-weight: 700;
                background: linear-gradient(135deg, #ffece8, #ffdbd6);
                padding: 2px 6px;
                border-radius: 4px;
                margin: 0 2px;
                border: 1px solid #ffcdc2;
                text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
            }

            .switch-text {
                color: #8a6d3b;
                cursor: pointer;
                text-decoration: underline;
                font-weight: bolder;
                padding: 0 2px;
            }
        }
    }

    &:hover {
        border-color: #ff9900;
        box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15);
        transform: translateY(-1px);
        transition: all 0.3s ease;
    }
}

// 淡入动画
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 10px;
}

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

/* 新增：文件格式选择器样式 */
.format-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    margin-bottom: 20px;

    .format-label {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.95rem;
    }

    .format-radio-group {
        display: flex;
        gap: 20px;

        :deep(.el-radio) {
            margin-right: 0;
        }
    }
}

/* 新增：加载遮罩层样式 */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 10px;

    p {
        color: #2c6fbb;
        font-weight: 500;
        margin-top: 10px;
    }
}

.upload-area {
    position: relative;
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

        &.is-dragover {
            border-color: #2c6fbb;
            background-color: rgba(44, 111, 187, 0.1);
        }

        &.is-disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }

    .upload-content {
        text-align: center;

        .text-muted {
            min-height: 60px; /* 确保提示区域高度一致 */
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 15px 0;
            line-height: 1.5;
        }
    }
}
</style>
