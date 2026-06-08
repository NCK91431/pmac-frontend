import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mainTableDataApi, dateInfoApi } from '@/DailyDemandReportV2/api'

export const useDailyProfitStore = defineStore('dailyProfit', () => {
  const currentDate = ref('')
  const dateInfo = ref(null)
  const hourlyResults = ref([])
  const dailySummary = ref({})
  const loading = ref(false)

  async function fetchProfitData(date) {
    currentDate.value = date
    loading.value = true
    try {
      const [mainResponse] = await Promise.all([
        mainTableDataApi(date),
      ])

      if (mainResponse.data?.success && mainResponse.data.data) {
        hourlyResults.value = mainResponse.data.data.hourlyResults || []
        dailySummary.value = mainResponse.data.data.dailySummary || {}
      }
    } catch (error) {
      console.error('获取每日收益数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchDateInfo(date) {
    try {
      const res = await dateInfoApi(date)
      if (res.data && !res.data.error) {
        dateInfo.value = res.data
      }
    } catch (error) {
      console.error('获取日期信息失败:', error)
    }
  }

  function resetData() {
    currentDate.value = ''
    dateInfo.value = null
    hourlyResults.value = []
    dailySummary.value = {}
    loading.value = false
  }

  return {
    currentDate,
    dateInfo,
    hourlyResults,
    dailySummary,
    loading,
    fetchProfitData,
    fetchDateInfo,
    resetData,
  }
})
