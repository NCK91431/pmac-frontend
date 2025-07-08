<template>
  <div class="data-requirements">
    <h4 class="section-title">
      <i class="fas fa-database"></i> 数据格式要求
    </h4>
    
    <el-descriptions :column="1" size="medium" border>
      <el-descriptions-item>
        <template #label>
          <div class="label-content">
            <i class="fas fa-check-circle"></i> 文件格式
          </div>
        </template>
        Excel格式（.xlsx或.xls）
      </el-descriptions-item>
      
      <el-descriptions-item>
        <template #label>
          <div class="label-content">
            <i class="fas fa-check-circle"></i> 数据列
          </div>
        </template>
        包含两列：时间戳和负荷值
      </el-descriptions-item>
      
      <el-descriptions-item>
        <template #label>
          <div class="label-content">
            <i class="fas fa-check-circle"></i> 时间格式
          </div>
        </template>
        YYYY-MM-DD HH:MM
      </el-descriptions-item>
      
      <el-descriptions-item>
        <template #label>
          <div class="label-content">
            <i class="fas fa-check-circle"></i> 负荷单位
          </div>
        </template>
        兆瓦（MW）
      </el-descriptions-item>
      
      <el-descriptions-item>
        <template #label>
          <div class="label-content">
            <i class="fas fa-check-circle"></i> 数据量
          </div>
        </template>
        至少包含3个月的历史数据
      </el-descriptions-item>
      
      <el-descriptions-item>
        <template #label>
          <div class="label-content">
            <i class="fas fa-check-circle"></i> 时间间隔
          </div>
        </template>
        时间间隔一致（15分钟/30分钟/1小时）
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
// 不需要额外逻辑
</script>

<style lang="scss" scoped>
.data-requirements {
  .section-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c6fbb;
    
    i {
      margin-right: 10px;
      font-size: 1.2rem;
    }
  }
  
  :deep(.el-descriptions) {
    margin-top: 10px;
    
    .el-descriptions__header {
      display: none;
    }
    
    .el-descriptions-item__cell {
      padding: 12px 15px;
    }
    
    .label-content {
      display: flex;
      align-items: center;
      
      i {
        color: #4caf50;
        margin-right: 8px;
        font-size: 1.1rem;
      }
	}
  }
}
</style>