<template>
  <div class="prediction-explanation">
    <h4 class="section-title">
      <i class="fas fa-lightbulb"></i> 预测说明
    </h4>
    
    <p>负荷预测基于历史数据模式，结合时间序列分析算法预测未来负荷趋势。</p>
    
    <h5 class="sub-title">最佳实践：</h5>
    
    <ul class="best-practices">
      <li>
        <i class="fas fa-check-circle"></i>
        <span>提供至少6个月历史数据以提高准确性</span>
      </li>
      <li>
        <i class="fas fa-check-circle"></i>
        <span>包含完整周期数据（如全年数据）</span>
      </li>
      <li>
        <i class="fas fa-check-circle"></i>
        <span>确保数据无异常值和缺失值</span>
      </li>
      <li>
        <i class="fas fa-check-circle"></i>
        <span>特殊事件（如停电）应标注</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
// 不需要额外逻辑
</script>

<style lang="scss" scoped>
.prediction-explanation {
  margin-top: 20px;
  
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
      color: #ffd04b;
    }
  }
  
  p {
    margin-top: 0;
    line-height: 1.6;
    color: #555;
  }
  
  .sub-title {
    margin: 15px 0 10px;
    font-size: 1rem;
    color: #333;
    font-weight: 600;
  }
  
  .best-practices {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 8px 0;
      display: flex;
      align-items: flex-start;
      
      i {
        color: #4caf50;
        margin-right: 10px;
        margin-top: 4px;
        font-size: 0.9rem;
      }
      
      span {
        flex: 1;
      }
    }
  }
}
</style>