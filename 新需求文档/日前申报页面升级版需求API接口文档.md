# API接口文档

## 接口1：用户鉴权登录

**接口地址**：`POST https://ems.pmac.com.cn/api/XXXX`

**请求参数**：

```json
{
  
}
```

**返回结果**：获取accessToken，用于后续接口调用
**响应示例**：

```JSON
```

***

## 接口2：温度和辐照度曲线接口

**接口地址**：`GET https://ems.pmac.com.cn/api/vpp-manage/v1/weather/chart`

**请求参数**：

- `regionPkId`：固定值，写死为 `440400`
- `startDate`：根据用户在日历组件上的选择，格式如 `2026-04-07`
- 请求头：`Authorization: Bearer {refreshToken}`

**响应示例**：

```json
{
  "status": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "id": "温度",
      "name": "温度(℃)",
      "unit": "℃",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 25.6 },
        { "weather": null, "label": "01:00", "value": 25.5 },
        // ... 共24小时数据
      ]
    },
    {
      "id": "辐照度",
      "name": "辐照度(W/m²)",
      "unit": "W/m²",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 0 },
        { "weather": null, "label": "07:00", "value": 18 },
        // ... 共24小时数据
      ]
    }
  ]
}
```

***

## 接口3：天气统计接口

**接口地址**：`GET https://ems.pmac.com.cn/api/vpp-manage/v1/weather/summary`

**请求参数**：

- `regionPkId`：固定值，写死为 `440400`
- `startDate`：根据用户在日历组件上的选择，格式如 `2026-04-07`
- 请求头：`Authorization: Bearer {refreshToken}`

**响应示例**：

```json
{
  "status": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "temperatureMin": 25.0,          // 温度范围最小值
      "temperatureMax": 29.6,          // 温度范围最大值
      "cloudCoverEarlyMorning": 78,    // 凌晨云量（%）
      "cloudCoverMorning": 88,         // 上午云量（%）
      "cloudCoverAfternoon": 81,       // 下午云量（%）
      "cloudCoverEvening": 86,         // 晚上云量（%）
      "windSpeed": 11.0,               // 风力（km/h）
      "windDirection": 187,            // 风向（°）
      "weather": "多云"                // 天气状况
    }
  ]
}
```

***

## 接口4：日前预测电价和实时预测电价曲线图

**接口地址**：`GET https://ems.pmac.com.cn/api/vpp-manage/v1/price/analysis/all/price/chart`

**请求参数**：

- `startDate`：根据用户在日历组件上的选择，格式如 `2026-04-08`
- 请求头：`Authorization: Bearer {refreshToken}`

**响应示例**：

```json
{
  "status": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "id": "1",
      "name": "日前预测电价",
      "unit": "元/MW",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 491.77 },
        { "weather": null, "label": "23:00", "value": 359.48 }
      ]
    },
    {
      "id": "2",
      "name": "日前结算电价",
      "unit": "元/MW",
      "dataList": [...]
    },
    {
      "id": "3",
      "name": "实时预测电价",
      "unit": "元/MW",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 409.73 },
        { "weather": null, "label": "23:00", "value": 358.59 }
      ]
    },
    {
      "id": "4",
      "name": "实时结算电价",
      "dataList": [...]
    },
    {
      "id": "5",
      "name": "日前预测准确率",
      "dataList": [...]
    },
    {
      "id": "6",
      "name": "实时预测准确率",
      "dataList": [...]
    }
  ]
}
```

***

## 接口5：统调曲线

**接口地址**：`GET https://ems.pmac.com.cn/api/vpp-manage/v1/price/analysis/unified/dispatch/chart`

**请求参数**：

- `channelType`：固定值，写死为 `1`
- `startDate`：根据用户在日历组件上的选择，格式如 `2026-04-06`
- 请求头：`Authorization: Bearer {refreshToken}`

**响应示例**：

```json
{
  "status": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "id": "1",
      "name": "预测负荷",
      "unit": "MW",
      "remark": "1",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 72625.0 },
        { "weather": null, "label": "00:15", "value": 80500.0 },
        { "weather": null, "label": "23:45", "value": 87535.0 }
      ]
    },
    {
      "id": "2",
      "name": "实际负荷",
      "unit": "MW",
      "remark": "0",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 73801.8 },
        { "weather": null, "label": "23:45", "value": 93241.2 }
      ]
    },
    {
      "id": "3",
      "name": "准确率",
      "unit": "%",
      "remark": "0",
      "dataList": [
        { "weather": null, "label": "00:00", "value": 98.41 },
        { "weather": null, "label": "23:45", "value": 93.88 }
      ]
    }
  ]
}
```

***

## 接口6：建议申报策略表格（‼️已废弃）

**接口地址**：`GET https://ems.pmac.com.cn/api/vpp-manage/v1/ps/bidding/strategy/suggest/table`

**请求参数**：

- `startDate`：根据用户在日历组件上的选择，格式如 `2026-04-07`
- 请求头：`Authorization: Bearer {refreshToken}`

**响应示例**：

```json
{
  "status": 0,
  "msg": "SUCCESS",
  "data": [
    {
      "dateTime": "00:00",                      // 时间
      "mltTotalElec": "5.61800",                // 中长期合计电量(MWh)
      "mltAvgPrice": "372.00000",               // 中长期平均价(元/MWh)
      "realTimePredictingPrice": "381.76000",   // 实时预测电价(元/MWh)
      "dayAheadPredictingPrice": "385.90000",   // 日前预测电价(元/MWh)
      "priceSpread": "-4.14000",                // 价差值
      "priceDirection": "日前低",                // 预测价差方向
      "spreadProbability": "0.56",              // SPX模型价差概率
      "predictingLoad": "0.51200",              // 预测电量(MWh)
      "arbitrageRatio": "0.00",                 // 建议套利比例
      "declarationDeviation": "0.00000",        // 申报偏差(MWh)
      "elecBiddingProposal": "0.51200",         // 建议申报电量(MWh)
      "actualBiddingElec": "0.51200"            // 实际申报电量(MWh)
    },
    {
      "dateTime": "01:00",
      // ... 其他时段数据
    }
  ]
}
```

***

## 通用说明

1. **认证方式**：所有接口（除登录接口外）均需在请求头中携带 `Authorization: Bearer {refreshToken}`
2. **日期格式**：startDate 参数统一使用 `YYYY-MM-DD` 格式
3. **固定参数**：
   - 登录用户名密码固定
   - regionPkId 固定为 `440400`
   - channelType 固定为 `1`

## ✅ 改版后的接口6：建议申报策略表格

**接口地址**：`http://125.88.36.152:15040/declaration/data`

**请求头：**

```
Content-Type: application/json
```

**请求参数：**

| 参数名                  | 类型     | 必填    | 默认值                          | 说明                                    |
| :------------------- | :----- | :---- | :--------------------------- | :------------------------------------ |
| `declaration_date`   | string | **是** | —                            | 申报日期，格式 `YYYY-MM-DD`，如 `"2026-03-22"` |
| `load_mode`          | string | 否     | `"算法预测"`                     | 提供算法预测、人工经验 两个选项                      |
| `probability_window` | object | 否     | `{"type": "all", "days": 7}` | 概率计算窗口配置，详见下方说明                       |
| ratio                | list   | 否     | \[None] \* 24                | 每小时的调整申报比例                            |

**probability\_window 参数子字段：**

| 子字段      | 类型     | 说明                                                                                                                             |
| :------- | :----- | :----------------------------------------------------------------------------------------------------------------------------- |
| `type`   | string | 日期筛选类型，支持以下几种：• `"all"`：不筛选，按自然日取• `"workday"`：仅工作日（周一\~周五，排除节假日）• `"周一"` \~ `"周日"`：指定星期几（如 `"周六"`）• `"holiday"` : 调休节假日或法定节假日 |
| `days`   | int    | 向前取最近 N 天（按自然日或筛选后连续天数）                                                                                                        |
| `period` | int    | 向前取最近 N 个“同类周期”                                                                                                                |

`days` 和 `period` **二选一**，不可同时使用

**请求示例：**

```json
{
    "declaration_date": "2026-04-06",
    "load_mode": "算法预测",
    "probability_window": {
        "type": "all",
        "period": 7
    },
    "ratio": [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]
}
```

**响应示例：**

```json
{
    "data": [
        {
            "declaration_mwh": 12.4, //日前建议申报电量
            "estimated_mwh": 10.3335, 　//用户评估电量
            "price_compare": -1, // -1表示日期低，0表示相等，1表示日前高
            "probability": 1.0, //日前低概率
            "ratio": 1.19998064547346, //申报比例
            "time": "00:00"
        },
        {
            "declaration_mwh": 8.48,
            "estimated_mwh": 7.71202,
            "price_compare": -1,
            "probability": 0.8571428571428571,
            "ratio": 1.0995822106270472,
            "time": "01:00"
        },
        {
            "declaration_mwh": 7.86,
            "estimated_mwh": 6.55124,
            "price_compare": -1,
            "probability": 1.0,
            "ratio": 1.1997728674266246,
            "time": "02:00:00"
        },
       ......
        {
            "declaration_mwh": 6.5,
            "estimated_mwh": 5.90953,
            "price_compare": "实时>日前",
            "probability": 0.8571428571428571,
            "ratio": 1.0999182676118067,
            "time": "23:00"
        }
    ],
    "success": true
}
```

