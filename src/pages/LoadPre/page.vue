<template>
  <div class="app-container">
    <el-container>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="24">
            <StepIndicator :active-step="activeStep" />
          </el-col>
            <el-card class="main-card">
              <DataUploadCard 
                v-show="activeStep === 1"
                @file-uploaded="handleFileUploaded"
              />
              
              <ParameterSettings 
                v-show="activeStep === 2"
                @predict="handlePredict"
              />
              
              <PredictionResults 
                v-show="activeStep >= 3"
                :predictionData="predictionData"
              />
            </el-card>
        </el-row>
		<el-row>
            <el-card class="sidebar-card">
			  <div class="flex-container">
			  <DataRequirements />
              <el-divider  direction="vertical"/>
              <PredictionExplanation />
              <el-divider direction="vertical"/>
              <ToolFeatures /></div>
            </el-card>
		</el-row>
      </el-main>
      
    
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import StepIndicator from './StepIndicator.vue';
import DataUploadCard from './DataUploadCard.vue';
import ParameterSettings from './ParameterSettings.vue';
import PredictionResults from './PredictionResults.vue';
import DataRequirements from './DataRequirements.vue';
import PredictionExplanation from './PredictionExplanation.vue';
import ToolFeatures from './ToolFeatures.vue';

const activeStep = ref(1);
const predictionData = reactive({
  period: '2023-10-16 至 2023-10-22',
  peakLoad: '248.7 MW',
  avgLoad: '183.2 MW',
  model: 'ARIMA(2,1,2) × (1,1,1)7',
  metrics: 'RMSE=8.4，MAE=6.2，R²=0.96'
});

const handleFileUploaded = () => {
  activeStep.value = 2;
};

const handlePredict = () => {
  activeStep.value = 3;
};
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  
  .el-header {
    padding: 0;
    height: auto;
  }
  
  .el-main {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .el-footer {
    padding: 0;
    height: auto;
  }
  
  .main-card {
	width: 100%;
    margin: 0 10px ;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .sidebar-card {
	margin-top: 40px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .flex-container {
	display: flex;
	flex-direction: row;
	align-items: stretch; /* 确保子元素高度一致 */
  }
}
</style>