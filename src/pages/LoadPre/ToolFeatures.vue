<template>
  <div class="tool-features">
    <h4 class="section-title">
      <i class="fas fa-star"></i> 工具特性
    </h4>
    
    <el-row :gutter="20" class="features-grid">
      <el-col :span="12" class="feature-item">
        <div class="feature-icon">
          <i class="fas fa-robot"></i>
        </div>
        <h5>智能算法</h5>
        <p>自动选择最佳预测模型</p>
      </el-col>
      
      <el-col :span="12" class="feature-item">
        <div class="feature-icon">
          <i class="fas fa-bolt"></i>
        </div>
        <h5>实时分析</h5>
        <p>快速处理大数据量</p>
      </el-col>
      
      <el-col :span="12" class="feature-item">
        <div class="feature-icon">
          <i class="fas fa-shield-alt"></i>
        </div>
        <h5>数据安全</h5>
        <p>上传数据即时处理，不存储</p>
      </el-col>
      
      <el-col :span="12" class="feature-item">
        <div class="feature-icon">
          <i class="fas fa-chart-bar"></i>
        </div>
        <h5>多维度分析</h5>
        <p>提供置信区间和误差指标</p>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
// 不需要额外逻辑
</script>

<style lang="scss" scoped>
.tool-features {
  margin-top: 20px;
  
  .section-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    margin-top: 0;
    margin-bottom: 20px;
    color: #2c6fbb;
    
    i {
      margin-right: 10px;
      font-size: 1.2rem;
      color: #ffd04b;
    }
  }
  
  .features-grid {
    margin-top: 10px;
  }
  
  .feature-item {
    text-align: center;
    margin-bottom: 20px;
    
    .feature-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 15px;
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 1.8rem;
        color: #2c6fbb;
      }
    }
    
    h5 {
      margin: 0 0 5px;
      font-size: 1rem;
      color: #333;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
  }
}
</style>