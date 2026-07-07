import request from '@/utils/request'

const BASE = '/api/daily-declaration/v2'

export function loginApi(username, password) {
  return request.post('/api/auth/login', { username, password })
}

export function manualDateApi(date) {
  return request.post(`${BASE}/manual-date`, { date })
}

export function priceComparisonApi(dates) {
  return request.post(`${BASE}/price-comparison-table`, { dates })
}

export function strategyDataApi(declarationDate, priceForecast, loadForecast) {
  const requestBody = {
    declaration_date: declarationDate,
    price_forecast: priceForecast,
    load_forecast: loadForecast,
  };
  return request.post(`${BASE}/strategy-data`, requestBody)
}

export function submitApi(payload) {
  return request.post(`${BASE}/submit`, payload)
}

export function historyDatesApi() {
  return request.get(`${BASE}/history/dates`)
}

export function historyDeclaredDatesApi() {
  return request.get(`${BASE}/history/declared-dates`)
}

export function historyDeclarersApi(date) {
  return request.get(`${BASE}/history/declarers`, { params: { date } })
}

export function historyDetailApi(date, declarantId) {
  return request.get(`${BASE}/history`, { params: { date, declarant_id: declarantId } })
}

export function aiQueryApi(prompt) {
  return request.post('/api/ai/query', { prompt })
}

// VPP 第三方接口代理 — 数据看板图表
export function vppWeatherChartApi(date) {
  return request.get('/api/vpp/vpp-manage/v1/weather/chart', {
    params: { regionPkId: '440400', startDate: date }
  })
}

export function vppWeatherSummaryApi(date) {
  return request.get('/api/vpp/vpp-manage/v1/weather/summary', {
    params: { regionPkId: '440400', startDate: date }
  })
}

export function vppPriceChartApi(date) {
  return request.get('/api/vpp/vpp-manage/v1/price/analysis/all/price/chart', {
    params: { startDate: date }
  })
}

export function vppDispatchChartApi(date) {
  return request.get('/api/vpp/vpp-manage/v1/price/analysis/unified/dispatch/chart', {
    params: { startDate: date }
  })
}

export function deleteHistoryApi(date) {
  return request.delete(`${BASE}/history`, { params: { date } })
}

export function updateHistoryApi(payload) {
  return request.put(`${BASE}/history`, payload)
}

export function powerTradingConfigApi(configurationItemName) {
  return request.get('/api/power-trading-config', { params: { configuration_item_name: configurationItemName } })
}

export function createPowerTradingConfigApi(payload) {
  return request.post('/api/power-trading-config', payload)
}

export function updatePowerTradingConfigApi(payload) {
  return request.put('/api/power-trading-config', payload)
}

export function profitAnalysisApi(date, declarantId) {
  return request.get(`${BASE}/profit-analysis`, { params: { date, declarant_id: declarantId } })
}

export function mainTableDataApi(date) {
  return request.get(`${BASE}/getDailyProfitMainTableData`, { params: { date } })
}

export function subTableDataApi(date, declarantId) {
  return request.get(`${BASE}/getDailyProfitSubTableData`, {
    params: { date, declarant_id: declarantId },
  })
}

export function monthlyProfitDataApi(month) {
  return request.get(`${BASE}/getMonthlyProfitData`, { params: { month } })
}

export function dateInfoApi(date) {
  return request.get('/api/auxiliaray_date_info', { params: { date } })
}

// ====== 日收益数据确认功能 ======
export function confirmProfitDataApi(declarationDate) {
  return request.post('/api/daily-profit/confirm', { declaration_date: declarationDate })
}

export function unconfirmProfitDataApi(declarationDate) {
  return request.delete('/api/daily-profit/confirm', { data: { declaration_date: declarationDate } })
}

export function confirmStatusApi(month) {
  return request.get('/api/daily-profit/confirm-status', { params: { month } })
}

export function monthlySummaryApi(month) {
  return request.get('/api/daily-profit/monthly-summary', { params: { month } })
}

export function backtestProfitApi(date, declarantId) {
  return request.get(`${BASE}/backtest-profit`, {
    params: { date, declarant_id: declarantId },
  })
}
