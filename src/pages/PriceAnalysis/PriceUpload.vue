<template>
    <div class="price-upload-container">
        <div class="upload-card">
            <div class="upload-form">
                <div class="upload-header">
                    <h2><i class="bi bi-cloud-upload"></i> 电价数据上传</h2>
                    <p class="subtitle">
                        上传日前节点电价和实时节点电价Excel文件
                    </p>
                </div>

                <!-- 省份选择 -->
                <div class="form-group">
                    <label class="form-label">
                        <i class="bi bi-geo-alt"></i> 省份
                    </label>
                    <el-select
                        v-model="formData.province"
                        placeholder="请选择省份"
                        clearable
                        style="width: 100%"
                    >
                        <el-option
                            v-for="province in provinceOptions"
                            :key="province.value"
                            :label="province.label"
                            :value="province.value"
                        >
                            <span style="float: left">
                                <i
                                    :class="province.icon"
                                    style="margin-right: 8px"
                                ></i>
                                {{ province.label }}
                            </span>
                        </el-option>
                    </el-select>
                </div>

                <!-- 日期选择 -->
                <div class="form-group">
                    <label class="form-label">
                        <i class="bi bi-calendar"></i> 日期
                    </label>
                    <el-date-picker
                        v-model="formData.date"
                        type="date"
                        placeholder="选择数据日期"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        style="width: 100%"
                    />
                </div>

                <!-- 日前节点电价文件上传 -->
                <div class="form-group">
                    <label class="form-label">
                        <i class="bi bi-file-excel" style="color: #1d6f42"></i>
                        日前节点电价文件
                    </label>
                    <div class="form-control">
                        <el-upload
                            class="upload-demo"
                            ref="dayAheadUpload"
                            action="#"
                            :auto-upload="false"
                            :on-change="handleDayAheadChange"
                            :on-remove="handleDayAheadRemove"
                            :file-list="dayAheadFileList"
                            accept=".xlsx,.xls"
                            :limit="1"
                        >
                            <template #trigger>
                                <el-button type="primary" plain>
                                    <i class="bi bi-upload"></i> 选择文件
                                </el-button>
                            </template>
                            <template #tip>
                                <div class="el-upload__tip">
                                    请上传日前节点电价Excel文件 (.xlsx, .xls)
                                </div>
                            </template>
                        </el-upload>
                    </div>
                </div>

                <!-- 实时节点电价文件上传 -->
                <div class="form-group">
                    <label class="form-label">
                        <i class="bi bi-file-excel" style="color: #ed7d31"></i>
                        实时节点电价文件
                    </label>
                    <div class="form-control">
                        <el-upload
                            class="upload-demo"
                            ref="realTimeUpload"
                            action="#"
                            :auto-upload="false"
                            :on-change="handleRealTimeChange"
                            :on-remove="handleRealTimeRemove"
                            :file-list="realTimeFileList"
                            accept=".xlsx,.xls"
                            :limit="1"
                        >
                            <template #trigger>
                                <el-button type="primary" plain>
                                    <i class="bi bi-upload"></i> 选择文件
                                </el-button>
                            </template>
                            <template #tip>
                                <div class="el-upload__tip">
                                    请上传实时节点电价Excel文件 (.xlsx, .xls)
                                </div>
                            </template>
                        </el-upload>
                    </div>
                </div>

                <!-- 提交按钮 -->
                <div class="form-actions">
                    <el-button
                        type="primary"
                        :loading="loading"
                        @click="handleSubmit"
                        :disabled="!isFormValid"
                        style="width: 100%"
                    >
                        <i class="bi bi-send" v-if="!loading"></i>
                        <i class="bi bi-hourglass-split" v-else></i>
                        {{ loading ? "上传中..." : "提交数据" }}
                    </el-button>
                </div>

                <!-- 上传结果 -->
                <div
                    v-if="uploadResult"
                    class="upload-result"
                    :class="resultClass"
                >
                    <div class="result-header">
                        <i :class="resultIcon"></i>
                        <h4>{{ uploadResult.title }}</h4>
                    </div>
                    <p>{{ uploadResult.message }}</p>
                    <div v-if="uploadResult.data" class="result-data">
                        <div
                            v-for="(value, key) in uploadResult.data"
                            :key="key"
                            class="data-item"
                        >
                            <span class="data-label">{{ key }}:</span>
                            <span class="data-value">{{ value }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 文件说明 -->
            <div class="upload-info">
                <div class="info-card">
                    <h3><i class="bi bi-info-circle"></i> 文件格式说明</h3>
                    <ul class="info-list">
                        <li>
                            <strong>日前节点电价文件：</strong>
                            <p>应包含以下数据表：</p>
                            <ul>
                                <li>
                                    <code>日前节点电价查询(YYYY-MM-DD)</code>
                                </li>
                                <li>
                                    <code
                                        >全省-日前节点电价查询(YYYY-MM-DD)</code
                                    >
                                </li>
                            </ul>
                            <p class="info-note">
                                第一行为表头，包含节点名称、数据项和时间列
                            </p>
                        </li>
                        <li>
                            <strong>实时节点电价文件：</strong>
                            <p>应包含以下数据表：</p>
                            <ul>
                                <li>
                                    <code>实时节点电价查询(YYYY-MM-DD)</code>
                                </li>
                                <li>
                                    <code
                                        >全省-实时节点电价查询(YYYY-MM-DD)</code
                                    >
                                </li>
                            </ul>
                            <p class="info-note">
                                第一行为表头，包含节点名称、数据项和时间列
                            </p>
                        </li>
                    </ul>
                </div>

                <div class="info-card">
                    <h3><i class="bi bi-lightbulb"></i> 使用提示</h3>
                    <ul class="tips-list">
                        <li>
                            <i class="bi bi-check-circle"></i>
                            请确保选择正确的省份和日期
                        </li>
                        <li>
                            <i class="bi bi-check-circle"></i>
                            两个文件需同时上传
                        </li>
                        <li>
                            <i class="bi bi-check-circle"></i>
                            文件大小不超过10MB
                        </li>
                        <li>
                            <i class="bi bi-check-circle"></i>
                            支持.xlsx和.xls格式
                        </li>
                        <li>
                            <i class="bi bi-check-circle"></i>
                            上传成功后可在分析页面查看数据
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import request from "@/utils/request";
import { ElMessage } from "element-plus";

// 响应式数据
const loading = ref(false);
const dayAheadFileList = ref([]);
const realTimeFileList = ref([]);
const uploadResult = ref(null);

// 表单数据
const formData = reactive({
    province: "广东省",
    date: "",
    dayAheadFile: null,
    realTimeFile: null,
});

// 省份选项
const provinceOptions = ref([
    { value: "广东省", label: "广东省", icon: "bi bi-geo-alt-fill" },
    // 可以在此添加其他省份
]);

// 计算表单是否有效
const isFormValid = computed(() => {
    return (
        formData.province &&
        formData.date &&
        formData.dayAheadFile &&
        formData.realTimeFile
    );
});

// 文件上传处理
const handleDayAheadChange = (file) => {
    formData.dayAheadFile = file.raw;
};

const handleDayAheadRemove = () => {
    formData.dayAheadFile = null;
};

const handleRealTimeChange = (file) => {
    formData.realTimeFile = file.raw;
};

const handleRealTimeRemove = () => {
    formData.realTimeFile = null;
};

// 提交表单
const handleSubmit = async () => {
    if (!isFormValid.value) {
        ElMessage.warning("请填写所有必填项并上传文件");
        return;
    }

    loading.value = true;
    uploadResult.value = null;

    try {
        // 创建FormData
        const form = new FormData();
        form.append("province", formData.province);
        form.append("date", formData.date);
        form.append("dayAheadFile", formData.dayAheadFile);
        form.append("realTimeFile", formData.realTimeFile);

        // 发送请求
        const response = await request.post(
            "/api/price/upload-price-data",
            form,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        // 处理成功响应
        uploadResult.value = {
            success: true,
            title: "上传成功",
            message: "电价数据已成功上传并解析",
            data: response.data.data || {},
        };

        ElMessage.success("数据上传成功");

        // 可选：清空表单
        // resetForm()
    } catch (error) {
        console.error("上传失败:", error);

        uploadResult.value = {
            success: false,
            title: "上传失败",
            message: error.response?.data?.message || "上传失败，请稍后重试",
            data: error.response?.data || {},
        };

        ElMessage.error(
            "上传失败: " + (error.response?.data?.message || "服务器错误")
        );
    } finally {
        loading.value = false;
    }
};

// 计算结果显示样式
const resultClass = computed(() => {
    return uploadResult.value?.success ? "success" : "error";
});

// 计算结果显示图标
const resultIcon = computed(() => {
    return uploadResult.value?.success
        ? "bi bi-check-circle-fill"
        : "bi bi-x-circle-fill";
});

// 重置表单
const resetForm = () => {
    formData.province = "广东省";
    formData.date = "";
    formData.dayAheadFile = null;
    formData.realTimeFile = null;
    dayAheadFileList.value = [];
    realTimeFileList.value = [];
    uploadResult.value = null;
};
</script>

<style scoped lang="scss">
.price-upload-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;

    .upload-header {
        text-align: center;
        margin-bottom: 30px;

        h2 {
            color: #2c3e50;
            font-size: 28px;
            margin-bottom: 8px;

            i {
                color: #409eff;
                margin-right: 10px;
            }
        }

        .subtitle {
            color: #7d8ca1;
            font-size: 16px;
        }
    }

    .upload-card {
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 30px;

        @media (max-width: 900px) {
            grid-template-columns: 1fr;
        }
    }

    .upload-form {
        background: white;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        .form-group {
            margin-bottom: 24px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
            font-size: 14px;

            i {
                margin-right: 6px;
            }
        }

        .form-control {
            :deep(.el-upload) {
                width: 100%;
            }

            :deep(.el-upload-dragger) {
                width: 100%;
                border: 2px dashed #dcdfe6;
                border-radius: 8px;
                background-color: #fafafa;

                &:hover {
                    border-color: #409eff;
                }
            }

            .el-upload__tip {
                margin-top: 8px;
                text-align: center;
                font-size: 12px;
                color: #909399;
            }
        }

        .form-actions {
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
        }
    }

    .upload-result {
        margin-top: 24px;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid transparent;
        animation: slideDown 0.3s ease;

        &.success {
            background-color: rgba(103, 194, 58, 0.1);
            border-color: rgba(103, 194, 58, 0.2);

            .result-header {
                color: #67c23a;
            }
        }

        &.error {
            background-color: rgba(245, 108, 108, 0.1);
            border-color: rgba(245, 108, 108, 0.2);

            .result-header {
                color: #f56c6c;
            }
        }

        .result-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;

            i {
                font-size: 20px;
            }

            h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
        }

        p {
            margin: 0 0 16px 0;
            color: #606266;
            font-size: 14px;
        }

        .result-data {
            background: white;
            border-radius: 6px;
            padding: 12px;
            border: 1px solid #eaeaea;

            .data-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #f5f5f5;

                &:last-child {
                    border-bottom: none;
                }

                .data-label {
                    color: #7d8ca1;
                    font-weight: 500;
                }

                .data-value {
                    color: #2c3e50;
                    font-weight: 600;
                }
            }
        }
    }

    .upload-info {
        display: flex;
        flex-direction: column;
        gap: 20px;

        .info-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

            h3 {
                color: #2c3e50;
                font-size: 18px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 8px;

                i {
                    color: #409eff;
                }
            }

            .info-list {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    margin-bottom: 20px;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    strong {
                        color: #2c3e50;
                        display: block;
                        margin-bottom: 8px;
                    }

                    p {
                        color: #606266;
                        margin: 4px 0;
                        font-size: 14px;
                    }

                    ul {
                        margin: 8px 0 8px 20px;
                        color: #606266;

                        li {
                            margin-bottom: 4px;
                            font-size: 13px;

                            code {
                                background: #f5f5f5;
                                padding: 2px 6px;
                                border-radius: 4px;
                                font-family: "Consolas", monospace;
                                font-size: 12px;
                            }
                        }
                    }

                    .info-note {
                        background: #f0f7ff;
                        padding: 8px 12px;
                        border-radius: 6px;
                        border-left: 3px solid #409eff;
                        font-size: 13px;
                        color: #409eff;
                        margin-top: 8px;
                    }
                }
            }

            .tips-list {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 8px 0;
                    color: #606266;
                    font-size: 14px;

                    i {
                        color: #67c23a;
                        font-size: 16px;
                        flex-shrink: 0;
                        margin-top: 2px;
                    }
                }
            }
        }
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
