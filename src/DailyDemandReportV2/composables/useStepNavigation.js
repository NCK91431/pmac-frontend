import { useDailyDeclarationV2Store } from '@/store/dailyDeclarationV2'
import { ElMessage } from 'element-plus'

export function useStepNavigation() {
  const store = useDailyDeclarationV2Store()

  function validateStep1() {
    if (!store.declarationDate) {
      ElMessage.warning('请先选择申报日期')
      return false
    }
    return true
  }

  function validateStep2() {
    if (store.allSelectedDates.length === 0) {
      ElMessage.warning('请至少选中一个日期')
      return false
    }
    return true
  }

  async function goToStep2() {
    if (!validateStep1()) return false
    const res = await store.fetchDateInfo(store.declarationDate)
    if (res.success) {
      store.markStepCompleted(1)
      store.setCurrentStep(2)
      return true
    }
    return false
  }

  async function goToStep3(onProgress) {
    if (!validateStep2()) return false
    store.markStepCompleted(2)
    store.setCurrentStep(3)

    if (onProgress) onProgress('正在获取策略申报数据...')

    const strategyRes = await store.fetchStrategyData()
    if (!strategyRes.success) {
      ElMessage.error('获取策略申报数据失败')
      return false
    }

    if (onProgress) onProgress('')
    return true
  }

  function goBackToStep1() {
    store.aiQueryText = ''
    store.queryResults = []
    store.selectedDates = []
    store.manualDates = []
    store.priceComparisonData = null
    store.strategyPeriods = []
    store.strategySummary = null
    store.adjustedRatios = []
    store.actualQuantities = {}
    store.resetLoadForecast()
    store.setPriceForecast('price_forecasting_method', 'api')
    store.setPriceForecast("api_price_data",{})
    store.setPriceForecast('manual_price_data', {})
    store.setUserEstimatedConfirmed(false)
    store.unmarkStepCompleted(1)
    store.setCurrentStep(1)
  }

  function goBackToStep2() {
    store.strategyPeriods = []
    store.strategySummary = null
    store.adjustedRatios = []
    store.actualQuantities = {}
    store.hkd_declaration = null
    store.strategy_provider = 'pilot'
    store.unmarkStepCompleted(2)
    store.unmarkStepCompleted(3)
    store.setCurrentStep(2)
  }

  return { goToStep2, goToStep3, goBackToStep1, goBackToStep2 }
}
