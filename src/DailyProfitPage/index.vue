<template>
  <div class="daily-profit-layout">
    <div
      class="daily-profit-main"
      :class="{ 'panel-collapsed': panelCollapsed }"
    >
      <div class="page-header">
        <div class="page-header-accent"></div>
        <div class="page-header-content">
          <div class="page-header-top">
            <el-icon class="page-header-icon"><Coin /></el-icon>
            <h1>每日收益分析</h1>
            <el-tag class="page-header-tag" size="small" type="primary"
              >收益概览</el-tag
            >
          </div>
          <p class="page-header-subtitle">
            查看每日的电费收益构成明细，涵盖中长期市场、日前市场、实时市场的电费收支与偏差转移收益
          </p>
          <div class="page-header-meta">
            <span class="meta-item">
              <el-icon><DataLine /></el-icon>
              24小时时段收益逐时展示
            </span>
            <span class="meta-divider"></span>
            <span class="meta-item">
              <el-icon><Coin /></el-icon>
              自动计算交易收益与售电收入
            </span>
            <span class="meta-divider"></span>
            <span class="meta-item">
              <el-icon><List /></el-icon>
              多市场收益汇总一目了然
            </span>
          </div>
        </div>
      </div>

      <template v-if="store.hourlyResults.length > 0">
        <div class="date-banner">
          <DateTargetBanner :date-info="store.dateInfo" />
        </div>
        <DailyProfitMainTable
          :hourly-results="store.hourlyResults"
          :daily-summary="store.dailySummary"
        />
      </template>

      <div v-else-if="!store.loading" class="empty-state">
        <el-empty description="暂无收益数据" />
      </div>

      <div v-if="store.loading" class="loading-overlay">
        <el-loading :fullscreen="false" />
      </div>
    </div>

    <DateSidebar
      v-model="store.currentDate"
      :max-month="maxMonth"
      :max-date="maxDate"
      @collapse="panelCollapsed = $event"
    >
      <template #date-label="{ formattedDate }">
        <span v-if="formattedDate < maxDate" class="cal-dot">已确认</span>
      </template>
    </DateSidebar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import dayjs from "dayjs";
import { Coin, DataLine, List } from "@element-plus/icons-vue";
import { useDailyProfitStore } from "@/store/dailyProfit";
import DateSidebar from "@/components/DateSidebar.vue";
import DateTargetBanner from "@/DailyDemandReportV2/components/DateTargetBanner.vue";
import DailyProfitMainTable from "@/DailyDemandReportV2/components/DailyProfitMainTable.vue";

const store = useDailyProfitStore();

const today = dayjs();
const maxMonth = today.format("YYYY-MM");
const maxDate = today.subtract(6, "day").format("YYYY-MM-DD");
const latestDate = today.subtract(7, "day").format("YYYY-MM-DD");
const panelCollapsed = ref(false);

watch(
  () => store.currentDate,
  async (newDate) => {
    if (newDate) {
      await Promise.all([
        store.fetchProfitData(newDate),
        store.fetchDateInfo(newDate),
      ]);
    }
  },
);

onMounted(() => {
  store.currentDate = latestDate;
});
</script>

<style scoped lang="scss">
.daily-profit-layout {
  display: flex;
  min-height: calc(100vh - 60px);
  position: relative;
  background-color: #fff;
}

.daily-profit-main {
  flex: 1;
  margin-right: 460px;
  max-width: calc(100% - 460px);
  position: relative;
  transition:
    margin-right 0.3s ease,
    max-width 0.3s ease;
  background: linear-gradient(
    90deg,
    rgba(24, 144, 255, 0.05) 0%,
    rgba(24, 144, 255, 0.025) 40%,
    transparent 60%
  );

  &.panel-collapsed {
    margin-right: 0;
    max-width: 100%;
  }
}

.page-header {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px 24px 20px 24px;
  border-bottom: 1px solid #f0f0f0;

  position: relative;

  &-accent {
    width: 4px;
    background: linear-gradient(180deg, #1890ff 0%, #91d5ff 100%);
    border-radius: 2px;
    flex-shrink: 0;
  }

  &-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &-top {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &-icon {
    font-size: 20px;
    color: #1890ff;
    background: #e6f7ff;
    padding: 6px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  h1 {
    font-size: 22px;
    margin: 0;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1.3;
    background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &-tag {
    margin-left: 4px;
    font-weight: 400;
  }

  &-subtitle {
    margin: 0 0 0 0;
    font-size: 13px;
    color: #8c8c8c;
    font-weight: 400;
    line-height: 1.5;
  }

  &-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 2px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #bfbfbf;

      .el-icon {
        font-size: 13px;
        color: #1890ff;
      }
    }

    .meta-divider {
      width: 1px;
      height: 12px;
      background: #e8e8e8;
    }
  }
}

.date-banner {
  padding-left: 24px;
  padding-right: 24px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-overlay {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  z-index: 999;
}
</style>
