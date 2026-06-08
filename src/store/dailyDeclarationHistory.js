import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { historyDeclaredDatesApi, historyDeclarersApi, historyDetailApi, deleteHistoryApi } from '@/DailyDemandReportV2/api'

export const useDailyDeclarationHistoryStore = defineStore('dailyDeclarationHistory', () => {
  const allDeclaredDates = ref([])
  const declarers = ref([])
  const selectedDeclarer = ref(null)
  const currentDate = ref('')
  const record = ref(null)

  const dateInfo = computed(() => record.value?.dateInfo ?? null)
  const aiQueryText = computed(() => record.value?.aiQueryText ?? '')
  const queryResults = computed(() => record.value?.queryResults ?? [])
  const allSelectedDates = computed(() => record.value?.allSelectedDates ?? [])
  const priceComparisonData = computed(() => record.value?.priceComparisonData ?? null)
  const strategyPeriods = computed(() => record.value?.strategyPeriods ?? [])
  const adjustedRatios = computed(() => record.value?.adjustedRatios ?? [])

  const strategySummary = computed(() => {
    return null
  })

  async function fetchAllDeclaredDates() {
    try {
      const res = await historyDeclaredDatesApi()
      if (res.data.success && Array.isArray(res.data.data)) {
        allDeclaredDates.value = res.data.data
      }
    } catch (e) {
      console.error('获取所有已申报日期失败:', e)
    }
  }

  async function fetchDeclarers(date) {
    try {
      const res = await historyDeclarersApi(date)
      if (res.data.success && res.data.data && Array.isArray(res.data.data.records)) {
        declarers.value = res.data.data.records
        return res.data.data.records
      }
      return []
    } catch (e) {
      console.error('获取申报人员列表失败:', e)
      return []
    }
  }

  async function fetchRecord(date, declarantId) {
    const res = await historyDetailApi(date, declarantId)
    if (res.data.success) {
      record.value = res.data.data
      currentDate.value = date
    }
    return res.data
  }

  async function deleteRecord(date) {
    const res = await deleteHistoryApi(date)
    return res.data
  }

  return {
    allDeclaredDates, declarers, selectedDeclarer, currentDate, record,
    dateInfo, aiQueryText, queryResults,
    allSelectedDates, priceComparisonData,
    strategyPeriods, adjustedRatios,
    strategySummary,
    fetchAllDeclaredDates, fetchDeclarers, fetchRecord, deleteRecord,
  }
})
