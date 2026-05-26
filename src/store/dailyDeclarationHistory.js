import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { historyDatesApi, historyDetailApi } from '@/DailyDemandReportV2/api'

export const useDailyDeclarationHistoryStore = defineStore('dailyDeclarationHistory', () => {
  const historyDates = ref([])
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

  async function fetchHistoryDates() {
    const res = await historyDatesApi()
    if (res.data.success) {
      historyDates.value = res.data.data
    }
  }

  async function fetchRecord(date) {
    const res = await historyDetailApi(date)
    if (res.data.success) {
      record.value = res.data.data
      currentDate.value = date
    }
    return res.data
  }

  return {
    historyDates, currentDate, record,
    dateInfo, aiQueryText, queryResults,
    allSelectedDates, priceComparisonData,
    strategyPeriods, adjustedRatios,
    strategySummary,
    fetchHistoryDates, fetchRecord,
  }
})
