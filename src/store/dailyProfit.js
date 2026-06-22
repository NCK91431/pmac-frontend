import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mainTableDataApi, dateInfoApi, confirmProfitDataApi, unconfirmProfitDataApi, confirmStatusApi } from '@/DailyDemandReportV2/api'
import dayjs from 'dayjs'

export const useDailyProfitStore = defineStore('dailyProfit', () => {
  const currentDate = ref('')
  const dateInfo = ref(null)
  const hourlyResults = ref([])
  const dailySummary = ref({})
  const loading = ref(false)

  // ====== 确认状态 ======
  const confirmedDates = ref([])
  const confirmedDatesSet = computed(() => new Set(confirmedDates.value))
  const confirmLoading = ref(false)

  /** 获取当月确认状态 */
  async function fetchConfirmedDates(month) {
    try {
      const res = await confirmStatusApi(month)
      if (res.data?.success) {
        confirmedDates.value = res.data.confirmedDates || []
      }
    } catch (error) {
      console.error('获取确认状态失败:', error)
    }
  }

  /** 获取当前日期所在月的确认状态 */
  async function fetchCurrentMonthConfirmedDates() {
    if (!currentDate.value) return
    const month = dayjs(currentDate.value).format('YYYY-MM')
    await fetchConfirmedDates(month)
  }

  /** 确认数据 */
  async function confirmData(date) {
    confirmLoading.value = true
    try {
      const res = await confirmProfitDataApi(date)
      if (res.data?.success) {
        await fetchCurrentMonthConfirmedDates()
        return true
      }
      return false
    } catch (error) {
      console.error('确认数据失败:', error)
      return false
    } finally {
      confirmLoading.value = false
    }
  }

  /** 取消确认 */
  async function unconfirmData(date) {
    confirmLoading.value = true
    try {
      const res = await unconfirmProfitDataApi(date)
      if (res.data?.success) {
        await fetchCurrentMonthConfirmedDates()
        return true
      }
      return false
    } catch (error) {
      console.error('取消确认失败:', error)
      return false
    } finally {
      confirmLoading.value = false
    }
  }

  // ====== 原有方法 ======
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
    confirmedDates.value = []
    confirmLoading.value = false
  }

  return {
    currentDate,
    dateInfo,
    hourlyResults,
    dailySummary,
    loading,
    // 确认状态
    confirmedDates,
    confirmedDatesSet,
    confirmLoading,
    fetchConfirmedDates,
    fetchCurrentMonthConfirmedDates,
    confirmData,
    unconfirmData,
    // 原有方法
    fetchProfitData,
    fetchDateInfo,
    resetData,
  }
})
