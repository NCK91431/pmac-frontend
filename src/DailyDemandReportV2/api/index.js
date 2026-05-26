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

export function strategyDataApi(declarationDate, priceSpreadInformation) {
  return request.post(`${BASE}/strategy-data`, {
    declaration_date: declarationDate,
    price_spread_information: priceSpreadInformation
  })
}

export function submitApi(payload) {
  return request.post(`${BASE}/submit`, payload)
}

export function historyDatesApi() {
  return request.get(`${BASE}/history/dates`)
}

export function historyDetailApi(date) {
  return request.get(`${BASE}/history`, { params: { date } })
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
