<template>
  <div class="parameter-settings">
    <div class="card-header">
      <span>预测参数设置</span>
    </div>
    
    <el-form :model="form" label-position="top" class="settings-form">
      <el-row :gutter="20">
        <el-col :md="12">
          <el-form-item label="预测时间范围">
            <el-input-group>
              <el-input-number 
                v-model="form.forecastPeriod" 
                :min="1" 
                :max="30" 
                controls-position="right"
              />
              <el-select v-model="form.periodUnit" style="width: 120px">
                <el-option label="天" value="day" />
                <el-option label="周" value="week" />
                <el-option label="月" value="month" />
              </el-select>
            </el-input-group>
          </el-form-item>
        </el-col>
        
        <el-col :md="12">
          <el-form-item label="预测模型">
            <el-select v-model="form.model" placeholder="请选择预测模型">
              <el-option label="自动选择最佳模型" value="auto" />
              <el-option label="ARIMA（时间序列）" value="arima" />
              <el-option label="LSTM（神经网络）" value="lstm" />
              <el-option label="Prophet（Facebook）" value="prophet" />
              <el-option label="XGBoost（集成学习）" value="xgboost" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :md="12">
          <el-form-item label="置信区间">
            <el-select v-model="form.confidenceLevel" placeholder="请选择置信区间">
              <el-option label="95%（标准）" value="95" />
              <el-option label="90%" value="90" />
              <el-option label="85%" value="85" />
              <el-option label="99%" value="99" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :md="12">
          <el-form-item label="历史数据范围">
            <el-select v-model="form.historyRange" placeholder="请选择数据范围">
              <el-option label="全部数据" value="all" />
              <el-option label="最近1年" value="1year" />
              <el-option label="最近6个月" value="6months" />
              <el-option label="最近3个月" value="3months" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-divider />
      
      <el-form-item>
        <el-checkbox v-model="form.considerHolidays" label="考虑节假日影响" />
      </el-form-item>
      
      <el-form-item>
        <el-checkbox v-model="form.considerWeather" label="考虑天气因素（需额外数据）" />
      </el-form-item>
      
      <div class="form-actions">
        <el-button type="primary" size="large" @click="handlePredict">
          <i class="fas fa-chart-line"></i> 开始预测
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['predict']);

const form = reactive({
  forecastPeriod: 7,
  periodUnit: 'day',
  model: 'auto',
  confidenceLevel: '95',
  historyRange: 'all',
  considerHolidays: true,
  considerWeather: false
});

const handlePredict = () => {
  emit('predict');
};
</script>

<style lang="scss" scoped>
.parameter-settings {
  .card-header {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    font-size: 1.2rem;
    font-weight: 600;
  }
  
  .settings-form {
    padding: 0 15px;
    
    .el-input-group {
      display: flex;
      
      .el-input-number {
        flex: 1;
        margin-right: 10px;
      }
    }
    
    .el-form-item {
      margin-bottom: 25px;
      
      :deep(.el-form-item__label) {
        font-weight: 600;
        padding-bottom: 8px;
        color: #333;
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 30px;
    
    .el-button {
      padding: 12px 30px;
      font-size: 1.1rem;
      
      i {
        margin-right: 8px;
      }
    }
  }
}
</style>