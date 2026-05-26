import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  manualDateApi,
  priceComparisonApi,
  strategyDataApi,
  submitApi,
  aiQueryApi,
  vppWeatherChartApi,
  vppWeatherSummaryApi,
  vppPriceChartApi,
  vppDispatchChartApi
} from '@/DailyDemandReportV2/api'

export const useDailyDeclarationV2Store = defineStore('dailyDeclarationV2', () => {
  const currentStep = ref(1)
  const completedSteps = ref([])
  const submitted = ref(false)

  const declarationDate = ref('')
  const dateInfo = ref(null)
  const weatherData = ref(null)
  const priceChartData = ref(null)
  const dispatchData = ref(null)

  const aiQueryText = ref('')
  const queryResults = ref([])
  const selectedDates = ref([])
  const manualDates = ref([])

  const priceComparisonData = ref(null)
  const strategyPeriods = ref([])
  const strategySummary = ref(null)
  const adjustedRatios = ref([])
  const actualQuantities = ref({})

  const allSelectedDates = computed(() => {
    const fromQuery = selectedDates.value.map(d => ({ ...d, isManual: false }))
    const fromManual = manualDates.value.map(d => ({ ...d, isManual: true }))
    const merged = [...fromQuery, ...fromManual]
    merged.sort((a, b) => new Date(b.date) - new Date(a.date))
    return merged
  })

  function setDeclarationDate(date) { declarationDate.value = date }
  function setDateInfo(info) { dateInfo.value = info }
  function setCurrentStep(step) { currentStep.value = step }

  async function fetchDateInfo(date) {
    const res = await manualDateApi(date)
    const body = res.data
    if (body.success) {
      dateInfo.value = body.data
    }
    return body
  }

  async function fetchWeatherCharts(date) {
    try {
      const [chartRes, summaryRes] = await Promise.all([
        vppWeatherChartApi(date),
        vppWeatherSummaryApi(date),
      ])
      if (chartRes.data?.status === 0 && Array.isArray(chartRes.data.data)) {
        weatherData.value = {
          chartData: chartRes.data.data,
          summaryData: summaryRes.data?.status === 0 && Array.isArray(summaryRes.data.data)
            ? summaryRes.data.data
            : []
        }
      }
    } catch (e) {
      console.error('获取天气图表数据失败', e)
    }
  }

  async function fetchPriceChart(date) {
    try {
      const res = await vppPriceChartApi(date)
      if (res.data?.status === 0 && Array.isArray(res.data.data)) {
        priceChartData.value = res.data.data
      }
    } catch (e) {
      console.error('获取电价图表数据失败', e)
    }
  }

  async function fetchDispatchChart(date) {
    try {
      const res = await vppDispatchChartApi(date)
      if (res.data?.status === 0 && Array.isArray(res.data.data)) {
        dispatchData.value = res.data.data
      }
    } catch (e) {
      console.error('获取统调曲线数据失败', e)
    }
  }

  async function fetchStep1Charts(date) {
    await Promise.all([
      fetchWeatherCharts(date),
      fetchPriceChart(date),
      fetchDispatchChart(date),
    ])
  }

  async function fetchPriceComparison(dates) {
    const res = await priceComparisonApi(dates)
    const body = res.data
    if (body.success) {
      priceComparisonData.value = body.data
    }
    return body
  }

  async function fetchStrategyData(declarationDate, spreadInfo) {
    const res = await strategyDataApi(declarationDate, spreadInfo)
    const body = res.data
    if (body.success) {
      strategyPeriods.value = body.data
      strategySummary.value = body.summary
      const ratios = new Array(24)
      ;(body.data || []).forEach(p => {
        ratios[parseInt(p.period) - 1] = p.declared_ratio
      })
      adjustedRatios.value = ratios
      actualQuantities.value = {}
    }
    return body
  }

  async function submitDeclaration() {
    const payload = {
      declaration_date: declarationDate.value,
      dateInfo: dateInfo.value,
      aiQueryText: aiQueryText.value,
      queryResults: queryResults.value,
      allSelectedDates: allSelectedDates.value,
      priceComparisonData: priceComparisonData.value,
      strategyPeriods: strategyPeriods.value,
      adjustedRatios: adjustedRatios.value,
    }
    const res = await submitApi(payload)
    return res.data
  }

  async function sendAiQuery(prompt) {
    const res = await aiQueryApi(prompt)
    return res.data
  }

  function setQueryResults(results) {
    queryResults.value = results
  }

  function selectQueryResult(item) {
    if (!selectedDates.value.find(d => d.date === item.date)) {
      selectedDates.value.push({ ...item, isManual: false })
    }
  }

  function deselectQueryResult(date) {
    selectedDates.value = selectedDates.value.filter(d => d.date !== date)
  }

  function selectAllQueryResults() {
    for (const item of queryResults.value) {
      if (!selectedDates.value.find(d => d.date === item.date)) {
        selectedDates.value.push({ ...item, isManual: false })
      }
    }
  }

  function deselectAllQueryResults() {
    const queryDateSet = new Set(queryResults.value.map(r => r.date))
    selectedDates.value = selectedDates.value.filter(d => !queryDateSet.has(d.date))
  }

  function removeSelectedDate(date) {
    selectedDates.value = selectedDates.value.filter(d => d.date !== date)
    manualDates.value = manualDates.value.filter(d => d.date !== date)
  }

  function addManualDate(dateInfo) {
    if (!manualDates.value.find(d => d.date === dateInfo.date)) {
      manualDates.value.push({ ...dateInfo, isManual: true })
    }
  }

  function clearAllSelected() {
    selectedDates.value = []
    manualDates.value = []
  }

  function periodToIndex(period) {
    return parseInt(period) - 1
  }

  function setAdjustedRatio(period, ratio) {
    adjustedRatios.value[periodToIndex(period)] = ratio
  }

  function getAdjustedRatio(period) {
    return adjustedRatios.value[periodToIndex(period)]
  }

  function setActualQuantity(period, quantity) {
    actualQuantities.value[period] = quantity
  }

  function resetAdjustedRatios() {
    adjustedRatios.value = []
    actualQuantities.value = {}
  }

  function isStepCompleted(step) {
    return completedSteps.value.includes(step)
  }

  function markStepCompleted(step) {
    if (!completedSteps.value.includes(step)) {
      completedSteps.value.push(step)
    }
  }

  function unmarkStepCompleted(step) {
    completedSteps.value = completedSteps.value.filter(s => s !== step)
  }

  function setSubmitted(val) {
    submitted.value = val
  }

  function resetAll() {
    currentStep.value = 1
    completedSteps.value = []
    submitted.value = false
    declarationDate.value = ''
    dateInfo.value = null
    weatherData.value = null
    priceChartData.value = null
    dispatchData.value = null
    aiQueryText.value = ''
    queryResults.value = []
    selectedDates.value = []
    manualDates.value = []
    priceComparisonData.value = null
    strategyPeriods.value = []
    strategySummary.value = null
    adjustedRatios.value = []
    actualQuantities.value = {}
  }

  return {
    currentStep, completedSteps, submitted,
    declarationDate, dateInfo, weatherData, priceChartData, dispatchData,
    aiQueryText, queryResults, selectedDates, manualDates, allSelectedDates,
    priceComparisonData, strategyPeriods, strategySummary, adjustedRatios, actualQuantities,
    setDeclarationDate, setDateInfo, setCurrentStep,
    isStepCompleted, markStepCompleted, unmarkStepCompleted, setSubmitted,
    fetchDateInfo, fetchPriceComparison, fetchStrategyData, submitDeclaration, sendAiQuery,
    fetchWeatherCharts, fetchPriceChart, fetchDispatchChart, fetchStep1Charts,
    setQueryResults, selectQueryResult, deselectQueryResult,
    selectAllQueryResults, deselectAllQueryResults,
    addQueryResult: selectQueryResult,
    removeSelectedDate, addManualDate, clearAllSelected,
    setAdjustedRatio, getAdjustedRatio, setActualQuantity, resetAdjustedRatios, resetAll
  }
})
