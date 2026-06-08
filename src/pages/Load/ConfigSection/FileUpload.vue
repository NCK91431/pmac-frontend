<template>
  <div class="file-upload-wrap">
    <div class="upload-title">数据文件</div>

    <!-- 文件格式选择 -->
    <div class="format-bar">
      <span class="format-bar-label">文件格式类型：</span>
      <div class="format-options">
        <label class="format-option" :class="{ active: upload_file_type === 'Southern-Network-Standard-Edition' }">
          <input type="radio" value="Southern-Network-Standard-Edition" :checked="upload_file_type === 'Southern-Network-Standard-Edition'" @change="onUploadFileType('Southern-Network-Standard-Edition')" />
          南网标准版
        </label>
        <label class="format-option" :class="{ active: upload_file_type === 'old-version' }">
          <input type="radio" value="old-version" :checked="upload_file_type === 'old-version'" @change="onUploadFileType('old-version')" />
          旧版本格式
        </label>
      </div>
    </div>

    <!-- 上传区域 -->
    <div v-if="!file" class="drop-zone">
      <el-upload
        class="upload-area"
        drag
        action=""
        :auto-upload="false"
        :on-change="handleFileChange"
      >
        <div class="upload-content">
          <div class="upload-title-text">拖放Excel文件到此处</div>
          <div class="upload-desc">
            请上传至少 180 天的 24 小时负荷数据Excel文件。
          </div>
          <span class="upload-btn">选择文件</span>
        </div>
      </el-upload>
    </div>

    <!-- 加载状态 -->
    <div v-if="uploadLoading" class="upload-loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>正在解析文件，请稍候...</p>
    </div>

    <!-- 格式要求 + 图片（整合原 Prompt） -->
    <div class="format-section">
      <div class="format-header">
        <span class="format-title">上传文件格式要求</span>
        <a
          class="download-link"
          :href="
            upload_file_type === 'Southern-Network-Standard-Edition'
              ? 'https://pmac.leyi.host/downloads/南网标准版负荷数据模版.xlsx'
              : 'https://pmac.leyi.host/downloads/loadforecast_template.xlsx'
          "
          download
        >
          下载模版
        </a>
      </div>
      <div class="format-hint">
        <template v-if="upload_file_type === 'Southern-Network-Standard-Edition'">
          标准格式包含：序号、电力用户编码、电力用户名称、日期和24小时负荷数据
        </template>
        <template v-else>
          列名为 0:00~23:00，行为 YYYY-MM-DD 格式的日期
        </template>
      </div>
      <!-- 格式示例图片（原 Prompt 内容） -->
      <div class="format-image-box">
        <div class="format-image-label">旧版本上传文件格式要求</div>
        <img
          src="https://pmac.leyi.host/downloads/pmac/load-file-img.png"
          alt="上传文件格式要求"
          class="format-image"
          @error="handleImageError"
        />
      </div>
    </div>

    <!-- 上传后信息展示 -->
    <template v-if="file && excelInfo">
      <div class="file-stats-grid">
        <div class="stat-cell">
          <div class="stat-label">数据天数</div>
          <div class="stat-value">{{ excelInfo.stats.days }} 天</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">时间粒度</div>
          <div class="stat-value">小时</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">日期范围</div>
          <div class="stat-value">{{ excelInfo.dateRange.join(" 至 ") }}</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">数据状态</div>
          <div class="stat-value">{{ excelInfo.stats.status }}</div>
        </div>
      </div>
      <div class="file-meta-row">
        <span class="file-icon">📄</span>
        <div class="file-info">
          <div class="file-name">{{ excelInfo.name }}</div>
          <div class="file-size-time">{{ formatFileSize(excelInfo.size * 1024) }} · {{ formatDate(excelInfo.uploadTime) }}</div>
        </div>
        <span class="file-download-link" @click="downloadUploadExcel">下载</span>
      </div>
      <div class="remove-btn" @click="removeFile">删除文件</div>
      <!-- 峰值负荷警告 -->
      <template v-if="mode == 'T'">
        <div v-if="excelInfo.maxLoad && excelInfo.maxLoad.val < 10" class="peak-warning">
          <span>检测到峰值负荷较低，请确认单位选择是否正确</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useLoadForecastStore } from "@/store/load";
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";

const forecastStore = useLoadForecastStore();
const mode = computed(() => forecastStore.mode);
const file = computed(() => forecastStore.uploadedFile);
const isContinue = computed(() => forecastStore.isContinue);

const excelInfo = ref(null);
const uploadLoading = ref(false);
const upload_file_type = computed(() => forecastStore.upload_file_type);

watch(upload_file_type, (type) => {
  if (file.value) {
    forecastStore.removeFile();
    excelInfo.value = null;
  }
});

function onUploadFileType(type) {
  forecastStore.switchUploadFileType(type);
}

const handleImageError = () => {
  ElMessage.warning("文件格式说明图片加载失败，请检查网络连接");
};

async function handleFileChange(uploadFile) {
  if (uploadFile) {
    forecastStore.setFile(uploadFile.raw);
    uploadLoading.value = true;

    const fileName = uploadFile.name.toLowerCase();
    const isExcelFile = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isExcelFile) {
      ElMessage.error("请上传Excel文件 (.xlsx 或 .xls 格式)");
      uploadLoading.value = false;
      return;
    }

    forecastStore.setFile(uploadFile.raw);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile.raw);
      formData.append("isContinue", isContinue.value ? "1" : "0");
      formData.append("mode", mode.value);
      formData.append("upload_file_type", upload_file_type.value);

      const response = await request.post("/api/fileinfo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        excelInfo.value = response.data.excelInfo;
        forecastStore.setExcelInfo(response.data.excelInfo);

        if (upload_file_type.value === "Southern-Network-Standard-Edition") {
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
      if (error.response && error.response.data && error.response.data.details) {
        ElMessageBox.alert(error.response.data.details, "请重新上传文件", {
          confirmButtonText: "知道了",
        });
      } else {
        ElMessage.error("获取文件信息失败，请检查文件格式");
      }
      forecastStore.removeFile();
      excelInfo.value = null;
    } finally {
      uploadLoading.value = false;
    }
  }
}

function removeFile() {
  forecastStore.removeFile();
  excelInfo.value = null;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function downloadUploadExcel() {
  const recordId = forecastStore.record?.recordId;
  if (!recordId) {
    ElMessage.error("记录ID不存在，无法下载文件");
    return;
  }
  const fileName = excelInfo.value?.name || recordId + "_upload.xlsx";

  try {
    ElMessage.success(`正在下载您上传的文件${fileName}`);
    const response = await request.get(`/api/history/${recordId}/download/upload`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error.response?.data?.type?.includes("application/json")) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result);
          ElMessage.error(`下载失败: ${errorData.error}`);
        } catch {
          ElMessage.error("未知错误");
        }
      };
      reader.readAsText(error.response.data);
    } else {
      ElMessage.error("文件下载失败");
    }
  }
}
</script>

<style lang="scss" scoped>
.file-upload-wrap {
  .upload-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }
}

/* 格式选择条 */
.format-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 12px;
  background: #f8f8f8;
}

.format-bar-label {
  font-size: 0.78rem;
  color: #666;
  white-space: nowrap;
}

.format-options {
  display: flex;
  gap: 12px;
}

.format-option {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #666;

  input { accent-color: #2b6cb5; }

  &.active {
    color: #2b6cb5;
    font-weight: 500;
  }
}

/* 拖拽上传区域 */
.drop-zone {
  margin-bottom: 12px;
}

:deep(.upload-area) {
  width: 100%;

  .el-upload {
    width: 100%;
  }

  .el-upload-dragger {
    width: 100%;
    height: auto;
    padding: 28px 20px;
    border: 2px dashed #d0d0d0;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.3s;

    &:hover {
      border-color: #2b6cb5;
      background-color: rgba(43, 108, 181, 0.03);
    }

    &.is-dragover {
      border-color: #2b6cb5;
      background-color: rgba(43, 108, 181, 0.06);
    }
  }
}

.upload-content {
  text-align: center;
}

.upload-title-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.upload-desc {
  font-size: 0.78rem;
  color: #888;
  margin-bottom: 12px;
  line-height: 1.6;
}

.upload-btn {
  display: inline-block;
  padding: 8px 20px;
  background: #2b6cb5;
  color: #fff;
  border-radius: 4px;
  font-size: 0.82rem;
  cursor: pointer;
}

/* 加载状态 */
.upload-loading {
  text-align: center;
  padding: 40px 0;

  p {
    margin-top: 10px;
    color: #2b6cb5;
    font-size: 0.85rem;
  }
}

/* 格式要求区域 */
.format-section {
  margin-bottom: 12px;
}

.format-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 2px;
}

.format-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.download-link {
  font-size: 0.78rem;
  color: #2b6cb5;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.format-hint {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 8px;
  padding: 8px 10px;
  background: #f8fafc;
  border-left: 3px solid #2b6cb5;
}

.format-image-box {
  background: #fafafa;
  padding: 8px;
  border-radius: 4px;
}

.format-image-label {
  font-size: 0.78rem;
  color: #666;
  margin-bottom: 6px;
}

.format-image {
  width: 100%;
  border-radius: 4px;
  display: block;
}

/* 文件统计网格 */
.file-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.stat-cell {
  padding: 10px 12px;
  background: #f8f8f8;
}

.stat-label {
  font-size: 0.72rem;
  color: #888;
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}

/* 文件信息行 */
.file-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f8f8f8;
  cursor: pointer;
  margin-bottom: 8px;
}

.file-icon {
  font-size: 1.1rem;
  color: #2b6cb5;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: #333;
}

.file-size-time {
  font-size: 0.72rem;
  color: #888;
}

.file-download-link {
  font-size: 0.78rem;
  color: #2b6cb5;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.remove-btn {
  font-size: 0.75rem;
  color: #999;
  cursor: pointer;
  text-align: right;
  margin-bottom: 8px;

  &:hover {
    color: #e74c3c;
  }
}

/* 峰值警告 */
.peak-warning {
  font-size: 0.75rem;
  color: #8a6d3b;
  padding: 8px 10px;
  background: #fff8e6;
  margin-bottom: 8px;
}
</style>
