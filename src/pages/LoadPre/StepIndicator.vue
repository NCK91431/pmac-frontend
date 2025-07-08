<template>
  <div class="step-indicator">
    <el-steps :active="activeStep" align-center>
      <el-step title="上传数据" description="导入历史负荷数据" />
      <el-step title="设置参数" description="配置预测选项" />
      <el-step title="预测分析" description="生成预测结果" />
      <el-step title="获取结果" description="查看与导出预测" />
    </el-steps>
  </div>
</template>

<script setup>
defineProps({
  activeStep: {
    type: Number,
    default: 1
  }
});
</script>

<style lang="scss" scoped>
.step-indicator {
  margin: 30px 0 40px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  :deep(.el-step) {
    .el-step__head {
      &.is-process {
        color: #2c6fbb;
        border-color: #2c6fbb;
        
        .el-step__icon {
          background-color: #2c6fbb;
          color: white;
        }
      }
      
      &.is-finish {
        .el-step__icon {
          background-color: #4caf50;
          color: white;
          border-color: #4caf50;
        }
      }
    }
    
    .el-step__title {
      font-weight: 600;
      font-size: 1.1rem;
      
      &.is-process {
        color: #2c6fbb;
        font-weight: 700;
      }
      
      &.is-finish {
        color: #4caf50;
      }
    }
    
    .el-step__description {
      color: #666;
      font-size: 0.9rem;
    }
  }
}
</style>