<template>
  <div class="card-body" style="padding: 12px 0 20px">
    <div class="price-logic-bar">
      <span>📌 <strong>电价列取值逻辑</strong>（每个日期每列独立判断）：</span>
      <span
        ><span class="tag-pill day-ahead">日前</span> =
        有日前结算电价则用它，否则用日前节点电价</span
      >
      <span
        ><span class="tag-pill realtime">实时</span> =
        有实时结算电价则用它，否则用实时节点电价</span
      >
      <span
        ><span class="tag-pill node">价差</span> = 日前 −
        实时（数值，正数橙·负数绿）</span
      >
      <el-button
        size="small"
        type="primary"
        plain
        @click="showPriceColumns = !showPriceColumns"
        style="margin-left: auto"
      >
        <el-icon style="margin-right: 4px">
          <Hide v-if="showPriceColumns" />
          <View v-else />
        </el-icon>
        {{ showPriceColumns ? "隐藏电价列" : "显示电价列" }}
      </el-button>
    </div>

    <div
      v-if="!props.data"
      style="
        padding: 40px 20px;
        text-align: center;
        color: #bfbfbf;
        font-size: 14px;
        border: 1px dashed #e8e8e8;
        border-radius: 6px;
        margin: 0 20px;
      "
    >
      暂无电价对比数据，请先选择日期并进入步骤3
    </div>

    <div
      v-else
      class="price-table-wrapper"
      style="padding: 0; border-left: none; border-right: none"
    >
      <el-table
        :data="tablePeriods"
        border
        style="width: 100%"
        :header-cell-style="headerCellStyle"
        size="small"
        row-key="period"
      >
        <el-table-column fixed="left" label="时段" width="80" align="center">
          <template #default="{ row }">
            <span class="pct-period">{{ row.period }}</span>
          </template>
        </el-table-column>

        <template v-for="d in tableDates" :key="d.date">
          <el-table-column align="center" width="270">
            <template #header>
              <span class="pct-date-header">
                {{ d.date }} {{ d.weekday || "" }}</span
              >
            </template>
            <el-table-column
              v-if="showPriceColumns"
              :label="hasDaySettlement(d.date) ? '日前结算' : '日前节点'"
              width="90"
              align="center"
            >
              <template #default="{ row }">
                <span :class="getDayPrice(row, d.date).cls">{{
                  getDayPrice(row, d.date).val
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="showPriceColumns"
              :label="hasRtSettlement(d.date) ? '实时结算' : '实时节点'"
              width="90"
              align="center"
            >
              <template #default="{ row }">
                <span :class="getRtPrice(row, d.date).cls">{{
                  getRtPrice(row, d.date).val
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="价差"
              width="105"
              align="center"
              :cell-style="(p) => spreadCellStyle(p, d.date)"
            >
              <template #default="{ row }">
                <span :class="getSpread(row, d.date).cls">{{
                  getSpread(row, d.date).val
                }}</span>
              </template>
            </el-table-column>
          </el-table-column>
        </template>

        <el-table-column
          fixed="right"
          label="低价方向"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span
              :class="
                row.spread_direction === '实时' ? 'spread-high' : 'spread-low'
              "
              >{{ row.spread_direction }}</span
            >
          </template>
        </el-table-column>

        <el-table-column
          fixed="right"
          label="日前低概率"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span class="pct-low-prob">{{ row.low_probability }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="padding: 0 20px; margin-top: 12px">
      <div class="annotation">
        <span>📌</span>
        <span
          ><strong>价差规则：</strong> 价差 = 日前 − 实时，显示为
          <span style="color: #fa8c16">正数（橙色）</span>或
          <span style="color: #52c41a">负数（绿色）</span>，保留两位小数。</span
        >
      </div>
      <div
        class="annotation"
        style="
          margin-top: 6px;
          background: #f6ffed;
          border-color: #b7eb8f;
          color: #389e0d;
        "
      >
        <span>📐</span>
        <span
          ><strong>低价方向 & 日前低概率（最后两固定列）：</strong> 以 08:00
          为例，4 个日期中有 3 个价差为负（日前 < 实时），所以低价方向 =
          「日前」，日前低概率 = 3÷4 = 75%。23:00 有 2/4 = 50%。</span
        >
      </div>
      <div
        style="
          margin-top: 8px;
          font-size: 11px;
          color: #8c8c8c;
          display: flex;
          gap: 16px;
        "
      >
        <span
          ><strong>固定列：</strong> 时段（首列，左固定）|
          价差方向、日前低概率（末两列，右固定）</span
        >
        <span
          ><strong>流向策略表：</strong> 低价方向 → 策略表第8列, 日前低概率 →
          策略表第9列</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { View, Hide } from "@element-plus/icons-vue";

const showPriceColumns = ref(true);

const props = defineProps({
  data: { type: Object, default: null },
});

// ── 表头配色方案 ──────────────────────────────────────────────
// 日期列交替色：优雅蓝色系（正式·不深沉）
const headerSchemes = [
  { bg: "#5588D0", color: "#ffffff" },
  { bg: "#3366AA", color: "#ffffff" },
];

// 固定列（时段、价差方向、日前低概率）统一色 — 区别于日期交替列
const fixedHeaderStyle = {
  background: "#4276B8",
  color: "#ffffff",
  border: "1px solid #5A8ECC",
};

function headerCellStyle({ rowIndex, column, columnIndex }) {
  if (column.fixed) {
    return {
      ...fixedHeaderStyle,
      fontWeight: rowIndex === 0 ? 600 : 500,
      fontSize: rowIndex === 0 ? "14px" : "13px",
    };
  }

  if (rowIndex === 0) {
    // Row 0：日期表头，"时段"是固定列已提前返回
    // columnIndex 1 = date1, 2 = date2, 3 = date3, 4 = date4
    const scheme = headerSchemes[(columnIndex - 1) % 2];
    return {
      background: scheme.bg,
      color: scheme.color,
      fontWeight: 600,
      fontSize: "16px",
      border: "1px solid #5A8ECC",
    };
  }

  // Row 1：子列，"时段"有 rowspan=2 不在此行出现
  // 显示电价列时每3列一组(日前/实时/价差)，隐藏时每1列一组(仅价差)
  const colsPerDate = showPriceColumns.value ? 3 : 1;
  const groupIdx = Math.floor(columnIndex / colsPerDate);
  const scheme = headerSchemes[groupIdx % 2];
  return {
    background: scheme.bg,
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    border: "1px solid #5A8ECC",
  };
}

const tableData = computed(() => {
  const raw = props.data;
  if (!raw || !raw.periods || !raw.dates) {
    return { dates: [], periods: [] };
  }
  const dateMetaMap = {};
  if (Array.isArray(raw.dates)) {
    raw.dates.forEach((d) => {
      if (typeof d === "string") {
        dateMetaMap[d] = { date: d, weekday: "" };
      } else {
        dateMetaMap[d.date] = d;
      }
    });
  }
  const periods = raw.periods.map((p) => {
    const priceDates = p.prices || p.dates || [];
    const datesMap = {};
    priceDates.forEach((price) => {
      const dateStr = price.date;
      const weekday = dateMetaMap[dateStr]?.weekday || "";
      let dayAheadSettlement = null;
      let dayAheadNode = null;
      let realtimeSettlement = null;
      let realtimeNode = null;
      if (price.day_ahead_source === "settlement") {
        dayAheadSettlement = price.day_ahead;
      } else if (price.day_ahead_source === "node") {
        dayAheadNode = price.day_ahead;
      } else if (price.day_ahead !== null && price.day_ahead !== undefined) {
        dayAheadSettlement = price.day_ahead;
      }
      if (price.real_time_source === "settlement") {
        realtimeSettlement = price.real_time;
      } else if (price.real_time_source === "node") {
        realtimeNode = price.real_time;
      } else if (price.real_time !== null && price.real_time !== undefined) {
        realtimeSettlement = price.real_time;
      }
      datesMap[dateStr] = {
        date: dateStr,
        weekday,
        day_ahead_settlement: dayAheadSettlement,
        day_ahead_node: dayAheadNode,
        realtime_settlement: realtimeSettlement,
        realtime_node: realtimeNode,
        spread: price.spread,
      };
    });
    let spreadDirection = "实时";
    if (p.spread_direction === true || p.spread_direction === "日前低") {
      spreadDirection = "日前";
    } else if (p.spread_direction === false) {
      spreadDirection = "实时";
    } else if (typeof p.spread_direction === "string") {
      spreadDirection = p.spread_direction === "日前高" ? "实时" : "日前";
    }
    let lowProb = p.low_probability;
    if (typeof lowProb === "number") {
      lowProb = Math.round(lowProb * 100) + "%";
    }
    return {
      period: p.period,
      spread_direction: spreadDirection,
      low_probability: lowProb,
      dates: datesMap,
    };
  });
  const sortedDates = (raw.dates || []).map((d) => {
    if (typeof d === "string") {
      return { date: d, weekday: dateMetaMap[d]?.weekday || "" };
    }
    return d;
  });
  return { dates: sortedDates, periods };
});

const tableDates = computed(() => tableData.value.dates);
const tablePeriods = computed(() => tableData.value.periods);

function hasDaySettlement(dateStr) {
  for (const period of tablePeriods.value) {
    const data = period.dates[dateStr];
    if (
      data &&
      data.day_ahead_settlement !== null &&
      data.day_ahead_settlement !== undefined
    )
      return true;
  }
  return false;
}

function hasRtSettlement(dateStr) {
  for (const period of tablePeriods.value) {
    const data = period.dates[dateStr];
    if (
      data &&
      data.realtime_settlement !== null &&
      data.realtime_settlement !== undefined
    )
      return true;
  }
  return false;
}

function getDayPrice(period, dateStr) {
  const data = period.dates[dateStr];
  if (!data) return { val: "-", cls: "price-empty" };
  if (
    data.day_ahead_settlement !== null &&
    data.day_ahead_settlement !== undefined
  ) {
    return {
      val: Number(data.day_ahead_settlement).toFixed(2),
      cls: "price-val",
    };
  }
  if (data.day_ahead_node !== null && data.day_ahead_node !== undefined) {
    return {
      val: Number(data.day_ahead_node).toFixed(2),
      cls: "price-fallback",
    };
  }
  return { val: "-", cls: "price-empty" };
}

function getRtPrice(period, dateStr) {
  const data = period.dates[dateStr];
  if (!data) return { val: "-", cls: "price-empty" };
  if (
    data.realtime_settlement !== null &&
    data.realtime_settlement !== undefined
  ) {
    return {
      val: Number(data.realtime_settlement).toFixed(2),
      cls: "price-val",
    };
  }
  if (data.realtime_node !== null && data.realtime_node !== undefined) {
    return {
      val: Number(data.realtime_node).toFixed(2),
      cls: "price-fallback",
    };
  }
  return { val: "-", cls: "price-empty" };
}

function getSpread(period, dateStr) {
  const data = period.dates[dateStr];
  if (!data || data.spread === null || data.spread === undefined)
    return { val: "-", cls: "price-empty" };
  const v = Number(data.spread);
  return {
    val: v.toFixed(2),
    cls: v >= 0 ? "spread-num-positive" : "spread-num-negative",
  };
}

// 价差列单元格背景：负值为绿色
function spreadCellStyle({ row, column }, dateStr) {
  // 防御：不应用于固定列，防止 Element Plus v-if 列隐藏后 :cell-style 泄漏到固定右列
  if (column?.fixed) return {};
  const data = row.dates?.[dateStr];
  if (
    data &&
    data.spread !== null &&
    data.spread !== undefined &&
    Number(data.spread) < 0
  ) {
    return { background: "#dcfce7" };
  }
  return {};
}
</script>

<style scoped lang="scss">
.card-body {
  padding: 12px 0 20px;
}

.price-logic-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 0 20px 12px;
  font-size: 12px;
  color: #595959;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.tag-pill {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;

  &.day-ahead {
    background: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
  }

  &.realtime {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }

  &.node {
    background: #f9f0ff;
    color: #722ed1;
    border: 1px solid #d3adf7;
  }
}

.price-table-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin: 0;

  :deep(.el-table) {
    border: none;
    font-size: 14px;

    th.el-table__cell {
      border: 1px solid #ebeef5;
      padding: 2px 3px;
    }

    td.el-table__cell {
      border: 1px solid #ebeef5;
      padding: 2px 3px;
      color: #606266;
    }

    // 单元格内容禁止换行
    .cell {
      white-space: nowrap;
      word-break: keep-all;
    }
  }

  :deep(.el-table__body-wrapper) {
    // 价差负值单元格背景色（CSS 方式，不依赖 :cell-style）
    td.el-table__cell:has(.spread-num-negative) {
      background: #dcfce7;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }

    // 偶数行价差负值仍需绿色（覆盖斑马纹）
    tr:nth-child(even) td:has(.spread-num-negative) {
      background: #dcfce7;
    }

    tr:hover td {
      background: #e6f7ff !important;
      border-top: 1px solid #1da3fd !important;
      border-bottom: 1px solid #1da3fd !important;
    }

    // 保持负价差单元格 hover 时仍为绿色
    tr:hover td:has(.spread-num-negative) {
      background: #dcfce7 !important;
    }

    tr:nth-child(even):hover td {
      background: #e6f7ff !important;
      border-top: 1px solid #1da3fd !important;
      border-bottom: 1px solid #1da3fd !important;
    }

    // 保持负价差单元格 hover 时仍为绿色（偶数行）
    tr:nth-child(even):hover td:has(.spread-num-negative) {
      background: #dcfce7 !important;
    }
  }

  // 固定右列区域：防御性重置绿色背景，防止 :cell-style 泄漏
  :deep(.el-table__fixed-body-wrapper) {
    td.el-table__cell:has(.spread-num-negative) {
      background: transparent !important;
    }
  }

  :deep(.el-table__header-wrapper) {
    border-radius: 6px 6px 0 0;
    overflow: hidden;
  }

  :deep(.el-table__fixed-header-wrapper th) {
    border: 1px solid #ebeef5;
  }

  :deep(.el-table__fixed-body-wrapper td) {
    border: 1px solid #ebeef5;
  }
}

// 滚动条美化
:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #c1c8d6;
  border-radius: 4px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #a0aab8;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f0f2f5;
  border-radius: 4px;
}

.pct {
  &-period {
    font-weight: 600;
    color: #303133;
  }

  &-date-header {
    font-size: 13px;
    font-weight: 600;
  }

  &-low-prob {
    font-weight: 600;
  }
}

.spread {
  // ── 价差方向标签（日前高 / 日前低）─ 优雅正式 ──
  &-low {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #f0f7f3;
    color: #068244;
    border: 1px solid #c5dcce;
    border-radius: 4px;
    padding: 1px 10px;
    font-size: 14px;
    font-weight: 500;
  }

  &-high {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #fdf6ed;
    color: #ea6f0b;
    border: 1px solid #ead9bd;
    border-radius: 4px;
    padding: 1px 10px;
    font-size: 14px;
    font-weight: 500;
  }

  // ── 价差数值（正数 / 负数）─ 优雅正式 ──
  &-num-positive {
    font-weight: 600;
    font-size: 16px;
    color: #b07d44;
  }

  &-num-negative {
    font-weight: 700;
    font-size: 16px;
    color: #15803d;
  }
}

// 单元格样式：
.price {
  // 结算电价（主数据）
  &-val {
    font-weight: 400;
    font-size: 15px;
    color: #1a365d;
  }

  &-fallback {
    // 节点电价（降级备选）
    font-weight: 400;
    font-size: 15px;
    color: #1a365d;
  }

  // 无数据
  &-empty {
    color: #d9d9d9;
  }
}

.annotation {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 12px;
  color: #8c6b00;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
