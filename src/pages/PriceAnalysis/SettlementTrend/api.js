import request from '@/utils/request'

const BASE = '/api/settlement-price'

// 多日结算电价走势（后端逐日聚合 all/price/chart，id='2' 日前结算 / id='4' 实时结算）
// 响应拦截器返回完整 response 对象，调用处需用 res.data.data 取业务数据
export function getSettlementPriceTrend({ startDate, endDate }) {
    return request.get(`${BASE}/trend`, { params: { startDate, endDate } })
}
