import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mainTableDataApi, dateInfoApi, confirmProfitDataApi, unconfirmProfitDataApi, batchConfirmProfitDataApi, batchUnconfirmProfitDataApi, confirmStatusApi, backtestProfitApi } from '@/DailyDemandReportV2/api'
import dayjs from 'dayjs'

export const useDailyProfitStore = defineStore('dailyProfit', () => {
  const currentDate = ref('')
  const dateInfo = ref(null)
  const activeTab = ref('profitQuery')  // 导航选项卡：profitQuery / profitAnalysis / backtest

  const loading = ref(false) 

  // ====== 收益查询 ======
  const hourlyResults = ref([]) //收益查询表格数据
  const dailySummary = ref({}) //收益查询表格摘要数据

  // ====== 收益分析 ======
  const subProfitTableData = ref([]) //收益分析表格数据
  const subProfitTableSummary = ref({}) //收益分析表格摘要数据

  // ====== 申报人相关 ======
  const declarers = ref([])
  const selectedDeclarerId = ref(null)
  const selectedDeclarer = ref(null)

  // ====== 回溯收益分析 ======
  const backtestScenarios = ref([])   // 回溯方案列表，每个方案包含一组预测组合下的模拟收益数据
  const activeScenario = ref("0")     // 当前选中的回溯方案索引（字符串），对应 el-tabs 的 v-model
  const activeStrategyPanels = ref([]) // 申报策略表中已展开的面板，对应 el-collapse 的 v-model

  async function fetchBacktestData(date, declarantId) {
    if (date < '2026-05-23') {
      backtestScenarios.value = []
      return
    }
    try {
      const res = await backtestProfitApi(date, declarantId)
      if (res.data?.success && res.data.data?.scenarios) {
        backtestScenarios.value = res.data.data.scenarios
        activeScenario.value = '0'
      } else {
        backtestScenarios.value = []
      }
    } catch (error) {
      console.error('获取回溯收益数据失败:', error)
      backtestScenarios.value = []
    }
  }

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

  /** 批量确认 */
  async function batchConfirmData(startDate, endDate) {
    confirmLoading.value = true
    try {
      const res = await batchConfirmProfitDataApi(startDate, endDate)
      if (res.data?.success) {
        await fetchCurrentMonthConfirmedDates()
        return res.data
      }
      return false
    } catch (error) {
      console.error('批量确认数据失败:', error)
      return false
    } finally {
      confirmLoading.value = false
    }
  }

  /** 批量取消确认 */
  async function batchUnconfirmData(startDate, endDate) {
    confirmLoading.value = true
    try {
      const res = await batchUnconfirmProfitDataApi(startDate, endDate)
      if (res.data?.success) {
        await fetchCurrentMonthConfirmedDates()
        return res.data
      }
      return false
    } catch (error) {
      console.error('批量取消确认失败:', error)
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
    activeTab.value = 'profitQuery'
    confirmedDates.value = []
    confirmLoading.value = false
    declarers.value = []
    selectedDeclarerId.value = null
    selectedDeclarer.value = null
    backtestScenarios.value = []
    activeScenario.value = '0'
    activeStrategyPanels.value = []
  }

  return {
    currentDate,
    dateInfo,
    hourlyResults,
    dailySummary,
    loading,
    activeTab,
    subProfitTableData,
    subProfitTableSummary,
    // 申报人
    declarers,
    selectedDeclarerId,
    selectedDeclarer,
    // 回溯收益分析
    backtestScenarios,
    activeScenario,
    activeStrategyPanels,
    fetchBacktestData,
    // 确认状态
    confirmedDates,
    confirmedDatesSet,
    confirmLoading,
    fetchConfirmedDates,
    fetchCurrentMonthConfirmedDates,
    confirmData,
    unconfirmData,
    batchConfirmData,
    batchUnconfirmData,
    // 原有方法
    fetchProfitData,
    fetchDateInfo,
    resetData,
  }
})
