<template>
  <div class="chart-card">
    <div class="chart-card-header">
      <span class="chart-card-title">{{ title }}</span>
      <span class="chart-card-tag" :class="tagType">{{ tagText }}</span>
      <div class="chart-card-actions">
        <button
          class="chart-card-copy"
          :class="{ copied }"
          @click="copySummary"
          :title="copied ? '已复制' : '复制汇总'"
        >
          <svg
            v-if="copied"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          class="chart-card-download"
          @click="downloadChart"
          title="下载图表"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
    <div ref="chartEl" class="chart-wrapper"></div>
    <div class="summary-row">
      <div class="summary-item">
        <span class="summary-item-label">最高</span>
        <span class="summary-item-value high">{{ summaryText.max }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-item-label">最低</span>
        <span class="summary-item-value low">{{ summaryText.min }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-item-label">均价</span>
        <span class="summary-item-value avg">{{ summaryText.avg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  // 卡片标题（下载文件名前缀也用此）
  title: { type: String, default: "" },
  // 标签文案，如 REAL-TIME / DAY-AHEAD
  tagText: { type: String, default: "" },
  // 标签样式类型：realtime | dayahead
  tagType: { type: String, default: "realtime" },
  // 线条主题色：#0891b2 实时 / #d97706 日前
  colorHex: { type: String, default: "#0891b2" },
  // 24 个时点数据（允许 null，显示断点）
  data: { type: Array, default: () => [] },
  // 对比曲线数据（如实际结算图上叠加预测曲线，24 个时点，允许 null）
  compareData: { type: Array, default: () => [] },
  // 对比曲线名称（tooltip 中显示）
  compareLabel: { type: String, default: "" },
  // 用于下载文件名的日期 YYYY-MM-DD
  dateStr: { type: String, default: "" },
});

const HOURS = Array.from(
  { length: 24 },
  (_, i) => String(i).padStart(2, "0") + ":00",
);

const chartEl = ref(null);
let chartInstance = null;

// ===== 汇总行（最高/最低/均价，忽略空值） =====
const summary = computed(() => {
  const valid = props.data.filter((v) => v != null);
  if (!valid.length) return null;
  const max = Math.max(...valid);
  const min = Math.min(...valid);
  const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
  return { max, min, avg };
});
const summaryText = computed(() => {
  if (!summary.value) return { max: "--", min: "--", avg: "--" };
  return {
    max: summary.value.max.toFixed(2),
    min: summary.value.min.toFixed(2),
    avg: summary.value.avg.toFixed(2),
  };
});

// ===== 复制汇总一句话 =====
const copied = ref(false);
let copyTimer = null;

function copySummary() {
  if (!summary.value) return;
  const text = `最高价${summary.value.max.toFixed(2)}元/MWh，最低价${summary.value.min.toFixed(2)}元/MWh，算术均价${summary.value.avg.toFixed(2)}元/MWh`;
  const done = () => {
    copied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(done)
      .catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    done();
  } catch (e) {
    // 静默失败
  }
  document.body.removeChild(textarea);
}

// ===== echarts 配置（100% 还原原型 Chart.js 视觉） =====
function buildOption() {
  const colorHex = props.colorHex;
  const isCyan = colorHex === "#0891b2";
  // 是否叠加了对比曲线（此时展示图例，可点击控制曲线显隐）
  const hasCompare = !!(props.compareData && props.compareData.length);
  const gradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    {
      offset: 0,
      color: isCyan ? "rgba(8, 145, 178, 0.12)" : "rgba(217, 119, 6, 0.12)",
    },
    {
      offset: 1,
      color: isCyan ? "rgba(8, 145, 178, 0.01)" : "rgba(217, 119, 6, 0.01)",
    },
  ]);

  const series = [
    {
      type: "line",
      name: props.title,
      data: props.data,
      smooth: true,
      symbol: "circle",
      symbolSize: 4,
      lineStyle: { width: 2.5, color: colorHex },
      itemStyle: { color: "#ffffff", borderColor: colorHex, borderWidth: 2 },
      emphasis: {
        itemStyle: {
          color: colorHex,
          borderColor: "#ffffff",
          borderWidth: 2.5,
          shadowBlur: 6,
          shadowColor: colorHex + "55",
        },
      },
      areaStyle: { color: gradient },
      label: {
        show: true,
        position: "top",
        distance: 4,
        color: colorHex,
        fontSize: 10,
        fontWeight: 600,
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 3,
        padding: [2, 4],
        formatter: (p) =>
          p.value == null ? "" : Math.round(p.value).toString(),
      },
    },
  ];

  // 对比曲线：灰色实心点（如实际结算图上叠加预测曲线）
  if (hasCompare) {
    series.push({
      type: "line",
      name: props.compareLabel || "预测",
      data: props.compareData,
      smooth: true,
      symbol: "circle",
      symbolSize: 4,
      lineStyle: { width: 2, color: "#94a3b8" },
      itemStyle: { color: "#94a3b8" },
      emphasis: {
        itemStyle: { color: "#94a3b8", borderColor: "#ffffff", borderWidth: 2 },
      },
      label: { show: false },
      z: 2,
    });
  }

  return {
    animationDuration: 700,
    animationEasing: "quarticOut",
    grid: {
      top: hasCompare ? 52 : 40,
      left: 12,
      right: 16,
      bottom: 8,
      containLabel: true,
    },
    // 图例：叠加对比曲线时展示，点击可控制曲线显示/消失
    legend: hasCompare
      ? {
          top: 8,
          right: 0,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 16,
          icon: "circle",
          textStyle: { color: "#64748b", fontSize: 11 },
        }
      : undefined,
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.96)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      padding: 12,
      textStyle: { color: "#475569", fontSize: 12 },
      extraCssText: "border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.06);",
      axisPointer: { type: "line", lineStyle: { color: "#e2e8f0" } },
      formatter(params) {
        let html =
          '<div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:4px;">' +
          params[0].axisValue +
          "</div>";
        params.forEach((p) => {
          const v = p.value;
          // 实际曲线点为白色填充，p.color 可能取到白色导致值不可见，故按系列用主题色
          const color = p.seriesName === props.title ? colorHex : "#94a3b8";
          html +=
            '<div style="font-size:12px;color:#475569;margin-top:2px;display:flex;align-items:center;gap:6px;">' +
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
            color +
            ';flex-shrink:0;"></span>' +
            "<span>" +
            (p.seriesName || "") +
            ': <span style="font-weight:600;color:' +
            color +
            ';">' +
            (v == null ? "--" : Number(v).toFixed(2)) +
            "</span> 元/MWh</span></div>";
        });
        return html;
      },
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: HOURS,
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisTick: { show: false },
      axisLabel: { color: "#64748b", fontSize: 11, interval: 1 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        formatter: (v) => Number(v).toFixed(0),
      },
      splitLine: { lineStyle: { color: "rgba(0,0,0,0.04)" } },
    },
    series,
  };
}

function initChart() {
  if (!chartEl.value) return;
  chartInstance = echarts.init(chartEl.value);
  chartInstance.setOption(buildOption());
}

function handleResize() {
  chartInstance && chartInstance.resize();
}

// ===== 下载图片（PNG，白底，带日期标题） =====
function downloadChart() {
  if (!chartInstance) return;
  const [y, m, d] = props.dateStr.split("-").map(Number);
  const titleText = `${y}年${m}月${d}日 ${props.title}`;

  // 临时加上标题并下移图表，导出后恢复
  const base = buildOption();
  chartInstance.setOption(
    {
      ...base,
      title: {
        text: titleText,
        left: "center",
        top: 8,
        textStyle: { fontSize: 14, fontWeight: 600, color: "#1e293b" },
      },
      grid: { ...base.grid, top: 56 },
    },
    true,
  );
  const url = chartInstance.getDataURL({
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });
  chartInstance.setOption(buildOption(), true);

  const dateStr = props.dateStr.replace(/-/g, "");
  const link = document.createElement("a");
  link.download = `${props.title}_${dateStr}.png`;
  link.href = url;
  link.click();
}

watch(
  () => [props.data, props.compareData],
  () => {
    if (chartInstance) {
      chartInstance.setOption(buildOption(), true);
    }
  },
  { deep: true },
);

onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-card {
  background: #ffffff;
  border: 1px solid #e5e9f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 24px;
  transition: box-shadow 0.2s;
}
.chart-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.chart-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.chart-card-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 6px;
  font-weight: 500;
  margin-left: 8px;
}
.chart-card-tag.realtime {
  background: rgba(8, 145, 178, 0.1);
  color: #0891b2;
}
.chart-card-tag.dayahead {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}
.chart-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.chart-card-copy,
.chart-card-download {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease;
}
.chart-card-copy:hover,
.chart-card-download:hover {
  background: #f5f7fa;
  color: #0891b2;
}
.chart-card-copy.copied {
  color: #059669;
}
.chart-card-copy svg,
.chart-card-download svg {
  width: 18px;
  height: 18px;
}
.chart-wrapper {
  position: relative;
  height: 300px;
}
.summary-row {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.summary-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
}
.summary-item-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}
.summary-item-value {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.summary-item-value.high {
  color: #dc2626;
}
.summary-item-value.low {
  color: #059669;
}
.summary-item-value.avg {
  color: #1e293b;
}
</style>
