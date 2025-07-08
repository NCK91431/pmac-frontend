<template>
  <div class="prediction-results">
    <div class="card-header">
      <span>预测结果</span>
      <div>
        <el-button type="primary" plain size="small">
          <i class="fas fa-download"></i> 导出报告
        </el-button>
        <el-button type="success" plain size="small">
          <i class="fas fa-file-excel"></i> 导出数据
        </el-button>
      </div>
    </div>
    
    <div class="prediction-highlight">
      <el-row :gutter="20">
        <el-col :md="8">
          <div class="highlight-item">
            <h6>预测时段</h6>
            <h4>{{ predictionData.period }}</h4>
          </div>
        </el-col>
        <el-col :md="8">
          <div class="highlight-item">
            <h6>峰值负荷预测</h6>
            <h4>{{ predictionData.peakLoad }}</h4>
          </div>
        </el-col>
        <el-col :md="8">
          <div class="highlight-item">
            <h6>平均负荷预测</h6>
            <h4>{{ predictionData.avgLoad }}</h4>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="chart-container">
      <div ref="chartRef" style="height: 400px; width: 100%"></div>
    </div>
    
    <el-alert type="info" :closable="false">
      <template #default>
        <i class="fas fa-info-circle"></i>
        预测模型使用{{ predictionData.model }}，置信区间为95%。模型评估指标：{{ predictionData.metrics }}
      </template>
    </el-alert>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  predictionData: {
    type: Object,
    required: true
  }
});

const chartRef = ref(null);
let chartInstance = null;

const initChart = () => {
  if (!chartRef.value) return;
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['历史负荷', '预测负荷'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['10/10', '10/11', '10/12', '10/13', '10/14', '10/15', '10/16', '10/17', '10/18', '10/19', '10/20', '10/21', '10/22']
    },
    yAxis: {
      type: 'value',
      name: '负荷 (MW)',
      min: 100
    },
    series: [
      {
        name: '历史负荷',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#2c6fbb'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(44, 111, 187, 0.3)' },
            { offset: 1, color: 'rgba(44, 111, 187, 0.05)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [172, 182, 191, 184, 202, 178, 192]
      },
      {
        name: '预测负荷',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: {
          width: 3,
          type: 'dashed',
          color: '#4caf50'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(76, 175, 80, 0.3)' },
            { offset: 1, color: 'rgba(76, 175, 80, 0.05)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [null, null, null, null, null, null, 192, 205, 218, 241, 248, 235, 221]
      }
    ]
  };
  
  chartInstance.setOption(option);
};

onMounted(() => {
  initChart();
});

watch(() => props.predictionData, () => {
  initChart();
});
</script>

<style lang="scss" scoped>
.prediction-results {
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
  
  .prediction-highlight {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 4px solid #4caf50;
    padding: 20px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 25px;
    
    .highlight-item {
      text-align: center;
      
      h6 {
        margin: 0 0 8px;
        font-size: 1rem;
        color: #666;
      }
      
      h4 {
        margin: 0;
        font-weight: 700;
        color: #333;
      }
    }
  }
  
  .chart-container {
    margin: 30px 0;
  }
  
  .el-alert {
    margin-top: 25px;
    border-radius: 8px;
    
    i {
      margin-right: 8px;
      color: #2c6fbb;
    }
  }
}
</style>