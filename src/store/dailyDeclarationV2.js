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
  vppDispatchChartApi,
  historyDatesApi
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

 /* -------------------------------------------------- */
  const load_forecast = ref({
    load_forecasting_method: 'api',
    manual_load_data: {},
    api_load_data: {} //由 fetchStrategyData 接口返回
  })
  const price_forecast = ref({
    price_forecasting_method: 'api',
    manual_price_data: {},
    api_price_data: {} //由 fetchStrategyData 接口返回
  })
 
  function setLoadForecast(key, value){
    load_forecast.value[key] = value
  }
  function setPriceForecast(key, value){
    price_forecast.value[key] = value
  }
 

  function resetLoadForecast(){
    setLoadForecast('load_forecasting_method', 'api')
    setLoadForecast('manual_load_data', {})
    setLoadForecast('api_load_data', {})
  }
  function resetPriceForecast(){
    setPriceForecast('price_forecasting_method', 'api')
    // -> ! 绝对不能将manual_price_data设为空对象，因为manual_price_data是调用fetchPriceComparison生成的，不能手动修改
    setPriceForecast("api_price_data", {})
  }

  const userEstimatedConfirmed = ref(false)
  function setUserEstimatedConfirmed(confirmed) {
    userEstimatedConfirmed.value = confirmed
  }
 /* -------------------------------------------------- */

 

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

  const declaredDates = ref([])

  async function fetchDeclaredDates() {
    try {
      const res = await historyDatesApi()
      if (res.data.success && Array.isArray(res.data.data)) {
        declaredDates.value = res.data.data
      }
    } catch (e) {
      console.error('获取已申报日期列表失败', e)
      declaredDates.value = []
    }
  }

  async function fetchPriceComparison(dates) {
    const res = await priceComparisonApi(dates)
    const body = res.data
    if (body.success) {
      priceComparisonData.value = body.data
      const spreadInfo = {};
      (body.data?.periods || []).forEach(p => {
        spreadInfo[p.period] = {
          spread_direction: p.spread_direction,
          low_probability: p.low_probability
        };
      });
      setPriceForecast('manual_price_data', spreadInfo)
    }
    return body
  }

  async function fetchStrategyData() {
    const res = await strategyDataApi(declarationDate.value, price_forecast.value, load_forecast.value)
    const body = res.data
    if (body.success) {
      strategyPeriods.value = body.data
      strategySummary.value = body.summary
      setPriceForecast('api_price_data', body.price_forecast.api_price_data)
      setLoadForecast('api_load_data', body.load_forecast.api_load_data)
      const ratios = new Array(24)
      ;(body.data || []).forEach(p => {
        ratios[parseInt(p.period)] = p.declared_ratio
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
      price_forecast: price_forecast.value,
      load_forecast: load_forecast.value,
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
    return parseInt(period)
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

  function prefillFromRecord(record) {
    if (record.dateInfo) dateInfo.value = record.dateInfo
    if (record.aiQueryText) aiQueryText.value = record.aiQueryText
    if (Array.isArray(record.queryResults)) queryResults.value = record.queryResults
    if (Array.isArray(record.allSelectedDates)) {
      selectedDates.value = record.allSelectedDates.filter((d) => !d.isManual)
      manualDates.value = record.allSelectedDates.filter((d) => d.isManual)
    }
    if (record.priceComparisonData) {
      priceComparisonData.value = record.priceComparisonData
      const spreadInfo = {};
      (record.priceComparisonData.periods || []).forEach(p => {
        spreadInfo[p.period] = {
          spread_direction: p.spread_direction,
          low_probability: p.low_probability
        };
      });
      setPriceForecast('manual_price_data', spreadInfo)
    }
    if (Array.isArray(record.strategyPeriods)) strategyPeriods.value = record.strategyPeriods
    if (Array.isArray(record.adjustedRatios)) adjustedRatios.value = record.adjustedRatios
    if (record.price_forecast) price_forecast.value = record.price_forecast
    if (record.load_forecast) load_forecast.value = record.load_forecast
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
    declaredDates.value = []
    resetLoadForecast()
    resetPriceForecast()
    setPriceForecast('manual_price_data', {})
  }

  return {
    currentStep, completedSteps, submitted,
    declarationDate, dateInfo, weatherData, priceChartData, dispatchData,
    aiQueryText, queryResults, selectedDates, manualDates, allSelectedDates,
    priceComparisonData, strategyPeriods, strategySummary, adjustedRatios, actualQuantities,
    price_forecast, load_forecast,
    userEstimatedConfirmed,
    setUserEstimatedConfirmed, 
    setPriceForecast, setLoadForecast,
    setDeclarationDate, setDateInfo, setCurrentStep,
    isStepCompleted, markStepCompleted, unmarkStepCompleted, setSubmitted,
    fetchDateInfo, fetchPriceComparison, fetchStrategyData, submitDeclaration, sendAiQuery,
    fetchWeatherCharts, fetchPriceChart, fetchDispatchChart, fetchStep1Charts,
    setQueryResults, selectQueryResult, deselectQueryResult,
    selectAllQueryResults, deselectAllQueryResults,
    addQueryResult: selectQueryResult,
    removeSelectedDate, addManualDate, clearAllSelected,
    setAdjustedRatio, getAdjustedRatio, setActualQuantity, resetAdjustedRatios, prefillFromRecord,
    declaredDates, fetchDeclaredDates,
    resetAll
  }
})
