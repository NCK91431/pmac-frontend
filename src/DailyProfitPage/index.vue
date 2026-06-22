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
        <!-- 功能按钮：确认/取消确认 -->
        <div class="page-header-actions">
          <template v-if="store.currentDate && !store.loading">
            <template v-if="isConfirmed">
              <span class="confirmed-label">已确认</span>
              <el-button size="small" @click="handleUnconfirm" :loading="store.confirmLoading">
                取消确认
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" size="small" @click="handleConfirm" :loading="store.confirmLoading">
                确认数据
              </el-button>
            </template>
          </template>
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

      <template v-else-if="!store.loading && !store.currentDate">
        <div class="empty-state initial-state">
          <div class="initial-state-content">
            <el-icon class="initial-state-icon"><List /></el-icon>
            <p class="initial-state-text">请点击右侧日期，查看每日收益详情</p>
          </div>
        </div>
      </template>
      <template v-else-if="!store.loading && store.currentDate">
        <div class="empty-state">
          <el-empty description="暂无收益数据" />
        </div>
      </template>

      <div v-if="store.loading" class="loading-overlay">
        <el-loading :fullscreen="false" />
      </div>
    </div>

    <DateSidebar
      v-model="store.currentDate"
      :max-month="maxMonth"
      :max-date="maxDate"
      @collapse="panelCollapsed = $event"
      @month-change="store.fetchConfirmedDates"
    >
      <template #date-label="{ formattedDate }">
        <span v-if="store.confirmedDatesSet.has(formattedDate)" class="cal-dot confirmed">✓</span>
        <span v-else-if="formattedDate <= maxDate" class="cal-dot unconfirmed">未确认</span>
      </template>
    </DateSidebar>

    <!-- 取消确认弹窗 -->
    <el-dialog
      v-model="unconfirmDialogVisible"
      title="取消确认"
      width="400px"
      :close-on-click-modal="false"
    >
      <p>确定要取消确认 [{{ unconfirmDate }}] 的数据吗？</p>
      <template #footer>
        <el-button @click="unconfirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doUnconfirm">确定</el-button>
      </template>
    </el-dialog>
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
import { ElMessage } from "element-plus";

const store = useDailyProfitStore();

const today = dayjs();
const maxMonth = today.format("YYYY-MM");
const maxDate = today.subtract(5, "day").format("YYYY-MM-DD");
const panelCollapsed = ref(false);

// 取消确认弹窗
const unconfirmDialogVisible = ref(false);
const unconfirmDate = ref("");

/** 当前日期是否已确认 */
const isConfirmed = computed(() => {
  if (!store.currentDate) return false;
  return store.confirmedDatesSet.has(store.currentDate);
});

/** 确认数据 */
async function handleConfirm() {
  const ok = await store.confirmData(store.currentDate);
  if (ok) {
    ElMessage.success("数据确认成功");
  } else {
    ElMessage.error("确认数据失败");
  }
}

/** 弹出取消确认确认框 */
function handleUnconfirm() {
  unconfirmDate.value = store.currentDate;
  unconfirmDialogVisible.value = true;
}

/** 执行取消确认 */
async function doUnconfirm() {
  const ok = await store.unconfirmData(unconfirmDate.value);
  unconfirmDialogVisible.value = false;
  if (ok) {
    ElMessage.success("已取消确认");
  } else {
    ElMessage.error("取消确认失败");
  }
}

watch(
  () => store.currentDate,
  async (newDate) => {
    if (newDate) {
      await Promise.all([
        store.fetchProfitData(newDate),
        store.fetchDateInfo(newDate),
      ]);
      // 月份切换的确认状态刷新已由 DateSidebar 的 @month-change 事件处理
    }
  },
);

onMounted(() => {
  // 不设置默认日期，让用户自行选择
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

  &-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;

    .confirmed-label {
      font-size: 13px;
      color: #52c41a;
      font-weight: 600;
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

.initial-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;

  .initial-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .initial-state-icon {
    font-size: 48px;
    color: #d9d9d9;
  }

  .initial-state-text {
    margin: 0;
    font-size: 15px;
    color: #bfbfbf;
    font-weight: 400;
  }
}

// DateSidebar 日期状态样式（通过 :deep 穿透到插槽内容）
:deep(.cal-dot) {
  font-size: 11px;
  margin-left: 4px;

  &.confirmed {
    color: #52c41a;
    font-weight: 700;
  }

  &.unconfirmed {
    color: #bfbfbf;
    font-weight: 400;
  }
}
</style>
