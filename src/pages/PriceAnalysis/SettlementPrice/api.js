import request from '@/utils/request'

const BASE = '/api/settlement-price'

// 结算电价分析聚合接口（预测明日 + 实际结算数据 + 前日预测对比）
// 响应拦截器返回完整 response 对象，调用处需用 res.data.data 取业务数据
export function getSettlementPriceAnalysis(date) {
    return request.get(`${BASE}/analysis`, { params: { date } })
}
