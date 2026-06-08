<template>
  <div class="user-price-config">
    <div class="page-header">
      <h2>用户均价配置</h2>
      <p class="description">配置12个月的用户均价，用于计算售电收入</p>
    </div>

    <div class="config-card">
      <div class="card-header">
        <span class="title">月度均价设置</span>
        <div v-if="configData" class="update-info">
          <span>最后更新人：{{ configData.updating_responsible_person }}</span>
          <span>更新时间：{{ formatDateTime(configData.updating_time) }}</span>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>月份</th>
              <th>用户均价（元/MWh）</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in priceValues" :key="index">
              <td>{{ monthLabels[index] }}</td>
              <td>
                <input
                  type="number"
                  v-model.number="item.value"
                  :disabled="loading"
                  class="price-input"
                  placeholder="请输入均价"
                  step="0.00000001"
                  min="0"
                />
              </td>
              <td>
                <button
                  @click="resetPrice(index)"
                  :disabled="loading"
                  class="reset-btn"
                  title="重置为默认值"
                >
                  重置
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer">
        <button
          @click="saveConfig"
          :disabled="loading || !hasChanges"
          class="save-btn"
        >
          <span v-if="loading">保存中...</span>
          <span v-else>保存配置</span>
        </button>
        <button
          @click="resetAll"
          :disabled="loading"
          class="reset-all-btn"
        >
          全部重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { powerTradingConfigApi, createPowerTradingConfigApi, updatePowerTradingConfigApi } from '@/DailyDemandReportV2/api'

const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const defaultPrices = [580.00, 575.00, 570.00, 565.00, 560.00, 555.00, 550.00, 555.00, 560.00, 565.00, 570.00, 575.00]

const priceValues = reactive(
  monthLabels.map((_, index) => ({
    value: defaultPrices[index],
    original: defaultPrices[index]
  }))
)

const configData = ref(null)
const loading = ref(false)
const originalConfig = ref(null)

const hasChanges = computed(() => {
  return priceValues.some((item, index) => item.value !== defaultPrices[index])
})

onMounted(async () => {
  await loadConfig()
})

async function loadConfig() {
  loading.value = true
  try {
    const response = await powerTradingConfigApi('daily-average-prices')
    if (response.data && response.data.success && response.data.data) {
      configData.value = response.data.data
      originalConfig.value = [...response.data.data.values]
      response.data.data.values.forEach((value, index) => {
        priceValues[index].value = value
        priceValues[index].original = value
      })
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  } finally {
    loading.value = false
  }
}

function resetPrice(index) {
  priceValues[index].value = defaultPrices[index]
}

function resetAll() {
  priceValues.forEach((item, index) => {
    item.value = defaultPrices[index]
  })
}

async function saveConfig() {
  loading.value = true
  const values = priceValues.map(item => item.value)
  
  try {
    const payload = {
      configuration_item_name: 'daily-average-prices',
      updating_responsible_person: 1,
      updating_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      values
    }

    let response
    if (configData.value) {
      response = await updatePowerTradingConfigApi(payload)
    } else {
      response = await createPowerTradingConfigApi(payload)
    }

    if (response.data && response.data.success) {
      await loadConfig()
      alert('配置保存成功')
    } else {
      throw new Error(response.data?.message || '保存失败')
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    alert('保存配置失败，请重试')
  } finally {
    loading.value = false
  }
}

function formatDateTime(dateTime) {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.user-price-config {
  padding: 24px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 0 8px 0;
}

.page-header .description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.config-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.card-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
}

.update-info {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #999;
}

.table-container {
  padding: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #e8e8e8;
  padding: 12px 16px;
  text-align: left;
}

th {
  background-color: #fafafa;
  font-weight: 500;
  font-size: 14px;
  color: #666;
}

td {
  font-size: 14px;
}

.price-input {
  width: 150px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.price-input:focus {
  border-color: #1890ff;
}

.price-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.reset-btn {
  padding: 6px 12px;
  font-size: 12px;
  color: #1890ff;
  background: transparent;
  border: 1px solid #1890ff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover {
  background-color: #e6f7ff;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.save-btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: #1890ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-all-btn {
  padding: 10px 24px;
  font-size: 14px;
  color: #666;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-all-btn:hover {
  background-color: #f5f5f5;
}

.reset-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>