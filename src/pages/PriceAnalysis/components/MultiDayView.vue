<template>
  <div class="multi-day-view">
    <!-- 多日电价图 -->
    <MultiDayPriceChart
      ref="multiDayPriceChartRef"
      :date-range="dateRange"
      :price-data="processedDataByDate"
    />

    <!-- 多日价差图 -->
    <MultiDaySpreadChart
      ref="multiDaySpreadChartRef"
      :date-range="dateRange"
      :price-data="processedDataByDate"
    />

    <!-- 智能分析结果及建议 -->
    <div class="analysis-card">
      <div class="analysis-header">
        <i class="bi bi-magic"></i>
        <span>智能分析结果及建议</span>
      </div>
      <div class="analysis-content">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">最高实时电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.maxRealTime.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.maxRealTime.date }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最低实时电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.minRealTime.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.minRealTime.date }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最高日前电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.maxDayAhead.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.maxDayAhead.date }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最低日前电价</div>
            <div class="stat-value">
              {{ formatPrice(stats.minDayAhead.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.minDayAhead.date }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最大价差</div>
            <div
              class="stat-value"
              :class="stats.maxSpread.value > 0 ? 'positive' : 'negative'"
            >
              {{ formatPrice(stats.maxSpread.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.maxSpread.date }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">最小价差</div>
            <div
              class="stat-value"
              :class="stats.minSpread.value > 0 ? 'positive' : 'negative'"
            >
              {{ formatPrice(stats.minSpread.value) }}
            </div>
            <div class="stat-meta">
              {{ stats.minSpread.date }}
            </div>
          </div>
        </div>
        <!-- <div class="advice-section">
          <div class="advice-title">📊 运营建议</div>
          <div class="advice-text">{{ adviceText }}</div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import request from "@/utils/request";
import MultiDayPriceChart from "./MultiDayPriceChart.vue";
import MultiDaySpreadChart from "./MultiDaySpreadChart.vue";

// 引用子组件
const multiDayPriceChartRef = ref(null);
const multiDaySpreadChartRef = ref(null);

// 处理resize
const handleResize = () => {
  // 调用子组件的resize方法
  if (multiDayPriceChartRef.value) {
    multiDayPriceChartRef.value.resize();
  }
  if (multiDaySpreadChartRef.value) {
    multiDaySpreadChartRef.value.resize();
  }
};

// 暴露resize方法给父组件
defineExpose({
  resize: handleResize,
});

const props = defineProps({
  nodeId: {
    type: String,
    required: true,
  },
  nodeName: {
    type: String,
    default: "",
  },
  dateRange: {
    type: Array,
    default: () => [],
  },
  timeType: {
    type: String,
    default: "hour",
  },
});

const priceData = ref({ dayAhead: [], realTime: [] });
const loading = ref(false);

const dateList = computed(() => {
  if (!props.dateRange || props.dateRange.length !== 2) return [];
  const start = new Date(props.dateRange[0]);
  const end = new Date(props.dateRange[1]);
  const dates = [];
  const current = new Date(start);
  while (current <= end && dates.length < 7) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
});

// 将数据值转换为 96 点数组
const convertTo96Points = (dataValues) => {
  const result = new Array(96).fill(0);
  dataValues.forEach((dataPoint) => {
    const [hour, minute] = dataPoint.time.split(":").map(Number);
    const index = hour * 4 + Math.floor(minute / 15);
    if (index >= 0 && index < 96) {
      result[index] = dataPoint.value || 0;
    }
  });
  return result;
};

// 按日期整理数据
const processedDataByDate = computed(() => {
  const data = {};

  // 处理日前数据
  priceData.value.dayAhead.forEach((item) => {
    const date = item.dataTime;
    if (!data[date]) {
      data[date] = { date, dayAheadData: [], realTimeData: [] };
    }
    data[date].dayAheadData = convertTo96Points(item.dataValues || []);
  });

  // 处理实时数据
  priceData.value.realTime.forEach((item) => {
    const date = item.dataTime;
    if (!data[date]) {
      data[date] = { date, dayAheadData: [], realTimeData: [] };
    }
    data[date].realTimeData = convertTo96Points(item.dataValues || []);
  });

  // 转换为数组并按日期排序
  return Object.values(data).sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
});

const fetchMultiDayData = async () => {
  if (!props.nodeId || !props.dateRange || props.dateRange.length !== 2) {
    return;
  }

  loading.value = true;
  try {
    const nodePkId = props.nodeId.endsWith("_copy")
      ? props.nodeId.slice(0, -5)
      : props.nodeId;

    const response = await request.get("/api/node-price/price-chart-range", {
      params: {
        nodePkId,
        startDate: props.dateRange[0],
        endDate: props.dateRange[1],
        regionPkId: "440000", // 默认广东省
      },
    });

    if (response.data.status === 0 && response.data.data) {
      priceData.value = {
        dayAhead: response.data.data.dayAhead || [],
        realTime: response.data.data.realTime || [],
      };
    } else {
      priceData.value = { dayAhead: [], realTime: [] };
    }
  } catch (error) {
    console.error("获取多日数据失败:", error);
    priceData.value = { dayAhead: [], realTime: [] };
  } finally {
    loading.value = false;
  }
};

const processedData = computed(() => {
  const data = {};
  processedDataByDate.value.forEach((item) => {
    const dayAheadAvg =
      item.dayAheadData.length > 0
        ? item.dayAheadData.reduce((sum, val) => sum + val, 0) /
          item.dayAheadData.length
        : 0;
    const realTimeAvg =
      item.realTimeData.length > 0
        ? item.realTimeData.reduce((sum, val) => sum + val, 0) /
          item.realTimeData.length
        : 0;
    const spread = realTimeAvg - dayAheadAvg;

    data[item.date] = {
      dayAhead: dayAheadAvg,
      realTime: realTimeAvg,
      spread: spread,
    };
  });
  return data;
});

const stats = computed(() => {
  const result = {
    maxRealTime: { value: -Infinity, date: "" },
    minRealTime: { value: Infinity, date: "" },
    maxDayAhead: { value: -Infinity, date: "" },
    minDayAhead: { value: Infinity, date: "" },
    maxSpread: { value: -Infinity, date: "" },
    minSpread: { value: Infinity, date: "" },
  };

  dateList.value.forEach((date) => {
    const data = processedData.value[date];
    if (!data) return;

    if (data.realTime > result.maxRealTime.value) {
      result.maxRealTime = { value: data.realTime, date };
    }
    if (data.realTime < result.minRealTime.value) {
      result.minRealTime = { value: data.realTime, date };
    }

    if (data.dayAhead > result.maxDayAhead.value) {
      result.maxDayAhead = { value: data.dayAhead, date };
    }
    if (data.dayAhead < result.minDayAhead.value) {
      result.minDayAhead = { value: data.dayAhead, date };
    }

    if (data.spread > result.maxSpread.value) {
      result.maxSpread = { value: data.spread, date };
    }
    if (data.spread < result.minSpread.value) {
      result.minSpread = { value: data.spread, date };
    }
  });

  if (result.maxRealTime.value === -Infinity) result.maxRealTime.value = 0;
  if (result.minRealTime.value === Infinity) result.minRealTime.value = 0;
  if (result.maxDayAhead.value === -Infinity) result.maxDayAhead.value = 0;
  if (result.minDayAhead.value === Infinity) result.minDayAhead.value = 0;
  if (result.maxSpread.value === -Infinity) result.maxSpread.value = 0;
  if (result.minSpread.value === Infinity) result.minSpread.value = 0;

  return result;
});

function formatPrice(val) {
  return (val || 0).toFixed(2) + " 元/MWh";
}

function getDayType(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6 ? "周末" : "工作日";
}

const adviceText = computed(() => {
  const s = stats.value;
  if (!s.maxRealTime.value) return "暂无足够数据生成建议。";

  const lines = [];

  if (s.maxRealTime.value > 400) {
    lines.push(
      `⚠️ 实时电价在 ${s.maxRealTime.date} 达到峰值 ${s.maxRealTime.value.toFixed(2)} 元/MWh，建议避开该时段用电。`,
    );
  } else {
    lines.push(
      `✅ 实时电价整体平稳，最高 ${s.maxRealTime.value.toFixed(2)} 元/MWh，可正常安排生产。`,
    );
  }

  // 新增日前电价分析
  if (s.maxDayAhead.value > 400) {
    lines.push(
      `📊 日前电价在 ${s.maxDayAhead.date} 达到峰值 ${s.maxDayAhead.value.toFixed(2)} 元/MWh，建议提前调整日前交易策略，减少高电价时段购电。`,
    );
  } else if (s.maxDayAhead.value < 200) {
    lines.push(
      `📊 日前电价整体较低，最高仅 ${s.maxDayAhead.value.toFixed(2)} 元/MWh，适合增加日前市场购电比例，锁定低成本电力。`,
    );
  } else {
    lines.push(
      `📊 日前电价整体稳定，最高 ${s.maxDayAhead.value.toFixed(2)} 元/MWh，可按常规策略参与日前交易。`,
    );
  }

  // 分析日前与实时电价的关系
  const avgDayAhead =
    dateList.value.reduce((sum, date) => {
      return sum + (processedData.value[date]?.dayAhead || 0);
    }, 0) / dateList.value.length;

  const avgRealTime =
    dateList.value.reduce((sum, date) => {
      return sum + (processedData.value[date]?.realTime || 0);
    }, 0) / dateList.value.length;

  const priceDiff = avgRealTime - avgDayAhead;
  if (priceDiff > 30) {
    lines.push(
      `📈 实时均价（${avgRealTime.toFixed(2)} 元/MWh）显著高于日前均价（${avgDayAhead.toFixed(2)} 元/MWh），建议增加日前市场购电量至总需求的70%以上，减少实时市场采购。`,
    );
  } else if (priceDiff < -30) {
    lines.push(
      `📉 实时均价（${avgRealTime.toFixed(2)} 元/MWh）显著低于日前均价（${avgDayAhead.toFixed(2)} 元/MWh），建议减少日前市场购电量至总需求的40%以下，增加实时市场采购比例。`,
    );
  } else {
    lines.push(
      `⚖️ 实时均价（${avgRealTime.toFixed(2)} 元/MWh）与日前均价（${avgDayAhead.toFixed(2)} 元/MWh）差异不大，可保持50:50的均衡购电策略。`,
    );
  }

  // 增加日前电价趋势分析
  if (dateList.value.length >= 3) {
    const dayAheadTrend = [];
    dateList.value.forEach((date) => {
      dayAheadTrend.push(processedData.value[date]?.dayAhead || 0);
    });

    const trend = dayAheadTrend[dayAheadTrend.length - 1] - dayAheadTrend[0];
    if (trend > 50) {
      lines.push(
        `📈 日前电价呈明显上升趋势，建议提前锁定后期用电需求，增加远期合约采购。`,
      );
    } else if (trend < -50) {
      lines.push(
        `📉 日前电价呈明显下降趋势，建议减少远期合约，增加实时市场灵活采购。`,
      );
    } else {
      lines.push(
        `📊 日前电价趋势稳定，建议保持现有采购策略，关注短期市场变化。`,
      );
    }
  }

  // 增加日前电价日内波动分析
  const dayAheadVolatility = [];
  processedDataByDate.value.forEach((item) => {
    if (item.dayAheadData.length > 0) {
      const max = Math.max(...item.dayAheadData);
      const min = Math.min(...item.dayAheadData);
      const volatility = max - min;
      dayAheadVolatility.push({ date: item.date, volatility });
    }
  });

  if (dayAheadVolatility.length > 0) {
    const avgVolatility =
      dayAheadVolatility.reduce((sum, item) => sum + item.volatility, 0) /
      dayAheadVolatility.length;
    if (avgVolatility > 100) {
      lines.push(
        `⚡ 日前电价日内波动较大，平均波动幅度 ${avgVolatility.toFixed(2)} 元/MWh，建议采用分时电价策略，避开高峰时段。`,
      );
    } else if (avgVolatility < 50) {
      lines.push(
        `🔄 日前电价日内波动较小，平均波动幅度 ${avgVolatility.toFixed(2)} 元/MWh，可采用较为稳定的用电计划。`,
      );
    }
  }

  // 增加工作日与周末日前电价对比
  const weekdayDayAhead = [];
  const weekendDayAhead = [];
  dateList.value.forEach((date) => {
    const dayType = getDayType(date);
    const dayAheadValue = processedData.value[date]?.dayAhead || 0;
    if (dayType === "工作日") {
      weekdayDayAhead.push(dayAheadValue);
    } else {
      weekendDayAhead.push(dayAheadValue);
    }
  });

  if (weekdayDayAhead.length > 0 && weekendDayAhead.length > 0) {
    const weekdayAvg =
      weekdayDayAhead.reduce((sum, val) => sum + val, 0) /
      weekdayDayAhead.length;
    const weekendAvg =
      weekendDayAhead.reduce((sum, val) => sum + val, 0) /
      weekendDayAhead.length;
    const weekendDiscount = (
      ((weekdayAvg - weekendAvg) / weekdayAvg) *
      100
    ).toFixed(1);

    if (weekendDiscount > 10) {
      lines.push(
        `🎯 周末日前电价平均比工作日低 ${weekendDiscount}%，建议将可调节生产计划安排在周末执行。`,
      );
    }
  }

  // 增加价差分析
  if (s.maxSpread.value > 50) {
    lines.push(
      `💰 实时高于日前最大价差达 ${s.maxSpread.value.toFixed(2)} 元/MWh（${s.maxSpread.date}），可考虑减少实时市场购电，增加日前市场覆盖比例。`,
    );
  }
  if (s.minSpread.value < -50) {
    lines.push(
      `💡 实时低于日前最大价差为 ${s.minSpread.value.toFixed(2)} 元/MWh（${s.minSpread.date}），适合增加实时市场购电，利用价格优势。`,
    );
  }

  // 增加日期范围信息
  const weekendDays = dateList.value.filter((d) => getDayType(d) === "周末");
  if (weekendDays.length > 0) {
    lines.push(
      `📅 包含 ${weekendDays.length} 天周末，通常周末电价较低，可适当调整生产计划至周末。`,
    );
  }

  // 增加日前电价预测建议
  if (s.minDayAhead.value < 150) {
    lines.push(
      `📊 日前电价存在低谷期（最低 ${s.minDayAhead.value.toFixed(2)} 元/MWh），建议在低电价时段增加储能充电，高电价时段放电。`,
    );
  }

  if (lines.length === 0) {
    lines.push("电价波动较小，建议保持当前用电策略。");
  }

  return lines.join(" ");
});

watch(
  () => [props.nodeId, props.dateRange],
  () => {
    fetchMultiDayData();
  },
  { deep: true },
);

onMounted(() => {
  fetchMultiDayData();
});
</script>

<style scoped lang="scss">
.multi-day-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 8px;
  gap: 12px;
  overflow-y: auto;
  background: #f5f7fa;

  .analysis-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .analysis-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 16px;

      i {
        color: #9c27b0;
        font-size: 20px;
      }
    }

    .analysis-content {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;

        .stat-item {
          background: #f8fafd;
          border-radius: 8px;
          padding: 12px;
          text-align: center;

          .stat-label {
            font-size: 12px;
            color: #606266;
            margin-bottom: 6px;
          }

          .stat-value {
            font-size: 18px;
            font-weight: 700;
            line-height: 1.4;

            &.positive {
              color: #409eff;
            }
            &.negative {
              color: #67c23a;
            }
          }

          .stat-meta {
            font-size: 11px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }

      .advice-section {
        background: #f0f9f0;
        border-left: 4px solid #67c23a;
        padding: 14px 18px;
        border-radius: 6px;

        .advice-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .advice-text {
          font-size: 13px;
          line-height: 1.6;
          color: #3c4b5e;
          white-space: pre-wrap;
        }
      }
    }
  }
}
</style>
