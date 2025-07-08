<template>
  <div class="data-upload-card">
    <div class="card-header">
      <span>数据上传</span>
      <el-button type="primary" plain size="small">
        <i class="fas fa-download"></i> 下载模板
      </el-button>
    </div>
    
    <el-upload
      class="upload-area"
      drag
      action=""
      :auto-upload="false"
      :on-change="handleFileChange"
    >
      <div class="upload-content">
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <h4>拖放Excel文件到此处</h4>
        <p class="text-muted">支持.xlsx和.xls格式文件</p>
        <p class="text-muted">或</p>
        <el-button type="primary" size="medium">
          <i class="fas fa-file-upload"></i> 选择文件
        </el-button>
      </div>
    </el-upload>
    
    <div v-if="fileInfo" class="file-info">
      <div class="file-details">
        <i class="fas fa-file-excel file-icon"></i>
        <div>
          <h6>{{ fileInfo.name }}</h6>
          <small class="text-muted">上传时间: {{ fileInfo.time }} | 大小: {{ fileInfo.size }}</small>
        </div>
        <el-button type="danger" plain circle @click="removeFile">
          <i class="fas fa-times"></i>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['file-uploaded']);

const fileInfo = ref(null);

const handleFileChange = (file) => {
  fileInfo.value = {
    name: file.name,
    time: new Date().toLocaleString(),
    size: formatFileSize(file.size)
  };
  
  // 模拟上传处理
  setTimeout(() => {
    emit('file-uploaded');
  }, 800);
};

const removeFile = () => {
  fileInfo.value = null;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
</script>

<style lang="scss" scoped>
.data-upload-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .upload-area {
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
  
  .file-info {
    margin-top: 25px;
    background-color: #f0f7ff;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #2c6fbb;
    
    .file-details {
      display: flex;
      align-items: center;
      
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
}
</style>