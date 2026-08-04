<template>
  <div class="membership-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <template v-else>
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="page-title-icon">
          <i class="bi bi-star-fill"></i>
        </div>
        <div>
          <h2>会员中心</h2>
          <p class="subtitle">开通会员，解锁电价分析高级功能</p>
        </div>
      </div>

      <!-- 当前会员状态 -->
      <div
        class="status-card"
        :class="{
          member: membershipInfo.isMember && !isExpiring,
          expiring: membershipInfo.isMember && isExpiring,
          guest: !membershipInfo.isMember,
        }"
      >
        <div class="status-card-left">
          <div class="status-icon">
            <i
              :class="
                membershipInfo.isMember ? 'bi bi-star-fill' : 'bi bi-star'
              "
            ></i>
          </div>
          <div class="status-detail">
            <template v-if="membershipInfo.isMember">
              <p class="status-label">当前状态</p>
              <p class="status-title">会员有效期至</p>
              <p class="status-expire">
                {{ formatDate(membershipInfo.expireAt) }}
              </p>
            </template>
            <template v-else>
              <p class="status-label">当前状态</p>
              <p class="status-title">暂未开通会员</p>
              <p class="status-desc">开通会员即可使用电价分析高级功能</p>
            </template>
          </div>
        </div>
        <div class="status-card-right">
          <template v-if="membershipInfo.isMember">
            <div class="days-badge" :class="{ expiring: isExpiring }">
              <span class="days-num">{{ membershipInfo.daysLeft }}</span>
              <span class="days-unit">天</span>
            </div>
            <p class="days-label">剩余有效期</p>
          </template>
          <template v-else>
            <div class="days-badge days-badge-empty">
              <i class="bi bi-star"></i>
            </div>
            <p class="days-label">未开通</p>
          </template>
        </div>
      </div>

      <!-- 即将到期警示 -->
      <p v-if="isExpiring" class="expiring-warning">
        <i class="bi bi-exclamation-triangle-fill"></i>
        {{ expiringWarningText }}
      </p>

      <!-- 套餐卡片（付费会员剩余>3天时隐藏） -->
      <div v-if="purchaseAvailable" class="plans-section">
        <h3 class="section-title">选择套餐</h3>
        <div class="plan-cards">
          <div
            v-for="plan in plans"
            :key="plan.type"
            class="plan-card"
            :class="{ popular: plan.popular }"
            @click="selectedPlan = plan"
          >
            <div v-if="plan.popular" class="popular-badge">推荐</div>
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ plan.price }}</span>
            </div>
            <div class="plan-duration">{{ plan.duration }}</div>
            <div class="plan-features">
              <div class="feature-item">✓ 节点电价实时查询</div>
              <div class="feature-item">✓ 多日价格趋势分析</div>
              <div class="feature-item">✓ 光伏捕获价格分析</div>
            </div>
            <button
              class="buy-btn"
              :class="{ selected: selectedPlan?.type === plan.type }"
              @click.stop="selectAndBuy(plan)"
            >
              {{ buyButtonText }}
            </button>
          </div>
        </div>
      </div>

      <!-- 免费领取 -->
      <div class="free-trial-section">
        <div class="free-trial-card">
          <div class="free-trial-icon">
            <i class="bi bi-gift-fill"></i>
          </div>
          <div class="free-trial-info">
            <h4>免费试用 7 天</h4>
            <p>新用户可免费领取 7 天会员体验（仅限非会员）</p>
            <p class="hint-text">
              <i class="bi bi-arrow-repeat"></i>
              试用期内购买会员，有效期将在现有基础上自动叠加延长，不会浪费试用天数
            </p>
          </div>
          <button
            class="free-trial-btn"
            :disabled="claimedFreeTrial || claiming || isPaidMembership"
            @click="handleClaimFreeTrial"
          >
            {{
              claimedFreeTrial
                ? "已领取"
                : claiming
                  ? "领取中..."
                  : isPaidMembership
                    ? "会员期内不可领取"
                    : "免费领取"
            }}
          </button>
        </div>
      </div>

      <!-- 测试账号 - 一键激活（套餐区隐藏时同步隐藏） -->
      <div
        v-if="isTestAccount && purchaseAvailable"
        class="test-account-section"
      >
        <div class="test-account-card">
          <div class="test-account-info">
            <h4>
              <i class="bi bi-bug-fill"></i>
              测试账号模式
              <span class="test-badge">开发环境</span>
            </h4>
            <p>开发测试账号，可一键激活任意会员套餐，免支付</p>
          </div>
          <div class="test-account-actions">
            <button
              v-for="plan in plans"
              :key="'test-' + plan.type"
              class="test-activate-btn"
              @click="handleTestActivate(plan.type)"
            >
              激活{{ plan.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- 支付弹窗（点击周围区域不关闭，仅通过关闭按钮关闭） -->
      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="payment-modal">
          <button class="close-btn" @click="closePaymentModal">✕</button>

          <!-- 视图1：选择支付方式 -->
          <template v-if="!paymentInfo">
            <h3>选择支付方式</h3>
            <div class="payment-info">
              <p>套餐：{{ selectedPlan?.name }}</p>
              <p class="payment-price">金额：¥{{ selectedPlan?.price }}</p>
            </div>

            <!-- 支付方式选择 -->
            <div class="payment-methods">
              <label
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-method"
                :class="{ active: selectedPaymentMethod === method.value }"
              >
                <input
                  type="radio"
                  :value="method.value"
                  v-model="selectedPaymentMethod"
                />
                <i :class="method.icon"></i>
                <span>{{ method.label }}</span>
              </label>
            </div>

            <!-- 未选择支付方式时的提示 -->
            <div v-if="!selectedPaymentMethod" class="payment-hint">
              <i class="bi bi-qr-code-scan"></i>
              请选择支付方式
            </div>
          </template>

          <!-- 视图2：支付二维码 -->
          <template v-else>
            <div class="pay-header">
              <i :class="[methodIcon, 'method-' + selectedPaymentMethod]"></i>
              <span>{{ methodLabel }}</span>
            </div>
            <p class="pay-subtitle">扫一扫付款</p>
            <p class="pay-plan">套餐：{{ selectedPlan?.name }}</p>
            <p class="pay-price-big">¥{{ selectedPlan?.price }}</p>

            <!-- Mock 模式 - 模拟支付按钮 -->
            <div v-if="paymentInfo?.mockQrCode" class="mock-payment">
              <div class="mock-badge">测试环境</div>
              <p class="mock-hint">当前为 Mock 模式，点击下方按钮模拟支付</p>
              <button
                class="mock-pay-btn"
                :disabled="pollingActive"
                @click="handleMockPayment"
              >
                {{ pollingActive ? "支付处理中..." : "模拟支付成功" }}
              </button>
            </div>

            <!-- 真实支付 - 二维码 -->
            <div v-else-if="paymentInfo?.qrCodeUrl" class="qr-section">
              <canvas ref="qrCanvas"></canvas>
              <p class="qr-validity">
                二维码有效期2分钟
                <br />
                请尽快完成付款
              </p>
              <div class="payment-status" v-if="pollingActive">
                <div class="spinner-sm"></div>
                <span>等待支付...</span>
              </div>
            </div>
          </template>

          <!-- 支付结果 -->
          <div
            v-if="paymentResult"
            class="payment-result"
            :class="paymentResult.success ? 'success' : 'fail'"
          >
            <i
              :class="
                paymentResult.success
                  ? 'bi bi-check-circle-fill'
                  : 'bi bi-x-circle-fill'
              "
            ></i>
            <span>{{ paymentResult.message }}</span>
          </div>
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="history-section" v-if="history.length > 0">
        <h3 class="section-title">购买记录</h3>
        <div class="history-table">
          <div class="history-header">
            <span>类型</span>
            <span>金额</span>
            <span>状态</span>
            <span>时间</span>
          </div>
          <div v-for="item in history" :key="item.id" class="history-row">
            <span>{{ typeLabel(item.type) }}</span>
            <span>¥{{ item.price }}</span>
            <span :class="'status-' + item.status">{{
              statusLabel(item.status)
            }}</span>
            <span>{{ formatDateTime(item.createdAt) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";
import QRCode from "qrcode";
import { useMembershipStore } from "@/store/membership";

const router = useRouter();
const store = useMembershipStore();
const loading = computed(() => store.loading);
const membershipInfo = computed(() => store.membershipInfo);
const claimedFreeTrial = computed(() => store.claimedFreeTrial);
const history = computed(() => store.history);
const paidMembershipInfo = computed(() => store.paidMembershipInfo);

// 是否为付费会员（非免费试用）
const isPaidMembership = computed(() => paidMembershipInfo.value.isPaidMember);

// 付费会员剩余天数是否在续费窗口内（≤3天）
const canRenew = computed(
  () => isPaidMembership.value && paidMembershipInfo.value.daysLeft <= 3,
);

// 会员（含免费试用）是否即将到期（≤3天）
const isExpiring = computed(
  () => membershipInfo.value.isMember && membershipInfo.value.daysLeft <= 3,
);

// 即将到期提示文案（区分付费会员与免费试用）
const expiringWarningText = computed(() =>
  isPaidMembership.value
    ? "您的会员即将到期，请及时续费以继续享受会员权益"
    : "您的免费试用即将到期，开通正式会员可无缝续享权益",
);

// 套餐区是否可展示（付费会员剩余>3天时隐藏）
const purchaseAvailable = computed(
  () => !isPaidMembership.value || canRenew.value,
);

// 按钮文案：续费窗口内显示「续费」，否则「立即购买」
const buyButtonText = computed(() => (canRenew.value ? "续费" : "立即购买"));

// 二维码视图头部：支付方式图标
const methodIcon = computed(() =>
  selectedPaymentMethod.value === "alipay" ? "bi bi-alipay" : "bi bi-wechat",
);

// 二维码视图头部：支付方式文案
const methodLabel = computed(() =>
  selectedPaymentMethod.value === "alipay" ? "支付宝支付" : "微信支付",
);

const plans = [
  {
    type: "week",
    name: "周会员",
    price: 0.01,
    duration: "7天",
    popular: false,
  },
  {
    type: "month",
    name: "月度会员",
    price: 29,
    duration: "30天",
    popular: true,
  },
  {
    type: "quarter",
    name: "季度会员",
    price: 79,
    duration: "90天",
    popular: false,
  },
];

const paymentMethods = [
  { value: "wechat", label: "微信支付", icon: "bi bi-wechat" },
  { value: "alipay", label: "支付宝", icon: "bi bi-alipay" },
];

const selectedPlan = ref(null);
const selectedPaymentMethod = ref(null);
const showPaymentModal = ref(false);
const paymentInfo = ref(null);
const pollingActive = ref(false);
const paymentResult = ref(null);
const qrCanvas = ref(null);
const claiming = ref(false); // 免费试用领取请求进行中标志（防重复提交）

// 检查是否为测试账号
const isTestAccount = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return userInfo.phone === "19122221999";
  } catch {
    return false;
  }
});

// 测试账号一键激活
const handleTestActivate = async (type) => {
  try {
    // 先创建订单
    const orderRes = await request.post("/api/membership/create-order", {
      type,
      paymentMethod: "wechat",
    });
    if (!orderRes.data.success) return;

    // 模拟支付成功
    await request.post("/api/membership/payment/mock-success", {
      orderId: orderRes.data.orderId,
    });

    await fetchMembershipStatus();
  } catch (err) {
    console.error("测试账号激活失败:", err);
  }
};

const typeLabel = (type) => {
  const map = {
    week: "周会员",
    month: "月度会员",
    quarter: "季度会员",
    free_trial: "免费试用",
  };
  return map[type] || type;
};

const statusLabel = (status) => {
  const map = {
    pending: "待支付",
    active: "已激活",
    expired: "已过期",
    refunded: "已退款",
    canceled: "已取消",
  };
  return map[status] || status;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// 获取会员状态
const fetchMembershipStatus = store.fetchMembershipStatus;

// 选择套餐并打开支付弹窗（先选支付方式，选中后再创建订单）
const selectAndBuy = (plan) => {
  selectedPlan.value = plan;
  selectedPaymentMethod.value = null;
  showPaymentModal.value = true;
  paymentInfo.value = null;
  paymentResult.value = null;
};

// 创建订单
const createOrder = async () => {
  if (!selectedPlan.value || !selectedPaymentMethod.value) return;
  try {
    const res = await request.post("/api/membership/create-order", {
      type: selectedPlan.value.type,
      paymentMethod: selectedPaymentMethod.value,
    });
    const data = res.data;
    if (data.success) {
      paymentInfo.value = data;

      // 如果是 Mock 模式，不生成二维码
      if (!data.mockQrCode && data.qrCodeUrl) {
        await nextTick();
        if (qrCanvas.value) {
          await QRCode.toCanvas(qrCanvas.value, data.qrCodeUrl, { width: 200 });
        }
        startPolling(data.orderId);
      }
    }
  } catch (err) {
    console.error("创建订单失败:", err);
  }
};

// 选择支付方式后创建订单（未选择时不做请求）
watch(selectedPaymentMethod, async () => {
  if (
    showPaymentModal.value &&
    selectedPlan.value &&
    selectedPaymentMethod.value
  ) {
    paymentInfo.value = null;
    paymentResult.value = null;
    await createOrder();
  }
});

// 模拟支付成功
const handleMockPayment = async () => {
  if (!paymentInfo.value) return;
  pollingActive.value = true;

  try {
    const res = await request.post("/api/membership/payment/mock-success", {
      orderId: paymentInfo.value.orderId,
    });
    const data = res.data;
    if (data.success) {
      paymentResult.value = { success: true, message: "支付成功！会员已激活" };
      await fetchMembershipStatus();
      setTimeout(() => {
        closePaymentModal();
      }, 2000);
    }
  } catch (err) {
    paymentResult.value = { success: false, message: "支付失败，请重试" };
  } finally {
    pollingActive.value = false;
  }
};

// 轮询句柄（关闭弹窗时需清理，防止后台继续轮询）
let pollTimer = null;
let pollTimeout = null;

// 清除轮询定时器
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
};

// 轮询支付状态
const startPolling = (orderId) => {
  // 先清理旧轮询，避免重复叠加
  stopPolling();
  pollingActive.value = true;
  const interval = setInterval(async () => {
    try {
      const res = await request.get(
        `/api/membership/payment/status/${orderId}`,
      );
      const data = res.data;
      if (data.success && data.status === "success") {
        stopPolling();
        pollingActive.value = false;
        paymentResult.value = {
          success: true,
          message: "支付成功！会员已激活",
        };
        await fetchMembershipStatus();
        setTimeout(() => {
          closePaymentModal();
        }, 2000);
      } else if (data.success && data.status === "canceled") {
        stopPolling();
        pollingActive.value = false;
        paymentResult.value = {
          success: false,
          message: "支付超时，订单已取消",
        };
        await fetchMembershipStatus();
        setTimeout(() => {
          closePaymentModal();
        }, 2000);
      }
    } catch (err) {
      console.error("轮询支付状态失败:", err);
    }
  }, 3000);
  pollTimer = interval;

  // 5分钟后停止轮询
  pollTimeout = setTimeout(() => {
    stopPolling();
    pollingActive.value = false;
  }, 300000);
};

// 关闭支付弹窗
const closePaymentModal = () => {
  // 停止轮询
  stopPolling();
  pollingActive.value = false;

  // 有未支付订单时将其标记为已取消
  const orderId = paymentInfo.value?.orderId;
  if (orderId) {
    request.post("/api/membership/payment/cancel", { orderId }).catch(() => {});
  }

  showPaymentModal.value = false;
  paymentInfo.value = null;
  paymentResult.value = null;
  fetchMembershipStatus();
};

// 领取免费试用
const handleClaimFreeTrial = async () => {
  // 已领取或请求进行中时防重
  if (claimedFreeTrial.value || isPaidMembership.value || claiming.value)
    return;
  claiming.value = true;

  // 领取前弹窗确认：告知仅限一次
  const confirmMsg = "每个用户仅可领取一次免费试用（7天），确认领取吗？";
  try {
    await ElMessageBox.confirm(confirmMsg, "领取免费试用", {
      confirmButtonText: "确认领取",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    claiming.value = false;
    return;
  }

  try {
    const res = await request.post("/api/membership/free-trial");
    const data = res.data;
    if (data.success) {
      store.claimedFreeTrial = true;
      await fetchMembershipStatus();
    }
  } catch (err) {
    console.error("领取免费试用失败:", err);
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    if (status === 400 && code === "FREE_TRIAL_ALREADY_CLAIMED") {
      // 后端返回已领取：同步本地状态并给出明确提示
      store.claimedFreeTrial = true;
      window.alert("您已领取过免费试用会员，每人仅限一次");
    } else if (status === 400 && code === "FREE_TRIAL_PAID_MEMBER_ACTIVE") {
      // 后端返回付费会员有效期内不可领取，刷新本地状态校正按钮
      await fetchMembershipStatus();
      window.alert("会员有效期内不可领取免费试用，请到期后再来");
    } else {
      window.alert("领取失败，请稍后重试");
    }
  } finally {
    claiming.value = false;
  }
};

onMounted(() => {
  fetchMembershipStatus();
});
</script>

<style scoped>
.membership-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  color: #334155;
}

/* ===== 加载状态 ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #64748b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 页面标题 ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.page-title-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
}

.page-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
}

.page-header .subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 2px 0 0;
}

/* ===== 会员状态卡（深色渐变，呼应品牌蓝） ===== */
.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 26px 28px;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(120deg, #1e293b 0%, #2c4a7c 60%, #2563eb 100%);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.status-card::after {
  content: "";
  position: absolute;
  right: -40px;
  top: -60px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.status-card-left {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.status-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.status-card.member .status-icon {
  color: #fbbf24;
}

.status-card.guest .status-icon {
  color: rgba(255, 255, 255, 0.7);
}

.status-label {
  font-size: 11px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  margin: 2px 0 0;
}

.status-expire {
  font-size: 20px;
  font-weight: 700;
  margin: 2px 0 0;
}

.status-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  margin: 2px 0 0;
}

.status-card-right {
  text-align: center;
  min-width: 92px;
  position: relative;
  z-index: 1;
}

.days-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 8px 18px;
}

.days-num {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.days-unit {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.days-badge.expiring {
  background: #f97316;
  border-color: #f97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
}

.days-badge-empty {
  background: rgba(255, 255, 255, 0.1);
  border-style: dashed;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  padding: 12px 18px;
}

.days-label {
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== 即将到期警示（柔和琥珀，不刺眼） ===== */
.expiring-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  padding: 12px 16px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-left: 4px solid #f97316;
  border-radius: 10px;
  color: #9a3412;
  font-size: 14px;
  font-weight: 500;
}

.expiring-warning i {
  color: #f97316;
  font-size: 16px;
}

/* ===== 套餐区域 ===== */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 14px;
  padding-left: 10px;
  border-left: 3px solid #f97316;
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

.plan-card {
  position: relative;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 22px 18px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-card:hover {
  border-color: #f97316;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.plan-card.popular {
  border: 2px solid #f97316;
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.12);
}

.popular-badge {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 20px;
  box-shadow: 0 3px 8px rgba(249, 115, 22, 0.35);
}

.plan-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 2px;
}

.price-symbol {
  font-size: 14px;
  color: #64748b;
  margin-right: 2px;
}

.price-value {
  font-size: 34px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.plan-duration {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 14px;
}

.plan-features {
  text-align: left;
  margin-bottom: 16px;
}

.feature-item {
  font-size: 13px;
  color: #475569;
  padding: 4px 0;
}

.buy-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #f97316;
  background: white;
  color: #f97316;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.buy-btn:hover,
.buy-btn.selected {
  background: #f97316;
  color: white;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.25);
}

/* ===== 免费试用 ===== */
.free-trial-section {
  margin-bottom: 24px;
}

.free-trial-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 18px 20px;
}

.free-trial-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.25);
}

.free-trial-info {
  flex: 1;
}

.free-trial-info h4 {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.free-trial-info p {
  margin: 0;
  font-size: 12.5px;
  color: #64748b;
}

.free-trial-info .hint-text {
  margin-top: 6px;
  font-size: 12px;
  color: #9a3412;
  display: flex;
  align-items: center;
  gap: 4px;
}

.free-trial-btn {
  padding: 10px 22px;
  border-radius: 8px;
  border: none;
  background: #f97316;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.25);
}

.free-trial-btn:hover:not(:disabled) {
  background: #ea580c;
}

.free-trial-btn:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

/* ===== 测试账号区域 ===== */
.test-account-section {
  margin-bottom: 24px;
}

.test-account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px dashed #f97316;
  border-radius: 12px;
  padding: 16px 20px;
}

.test-account-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-account-info h4 i {
  color: #f97316;
  font-size: 16px;
}

.test-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  background: #fff7ed;
  color: #f97316;
  border: 1px solid #fed7aa;
  padding: 1px 8px;
  border-radius: 20px;
}

.test-account-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.test-account-actions {
  display: flex;
  gap: 8px;
}

.test-activate-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid #f97316;
  background: white;
  color: #f97316;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.test-activate-btn:hover {
  background: #f97316;
  color: white;
}

/* 支付弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.payment-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  position: relative;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-modal h3 {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.payment-info {
  margin-bottom: 20px;
}

.payment-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #6b7280;
}

.payment-price {
  font-size: 20px !important;
  font-weight: 700;
  color: #1f2937 !important;
}

/* 支付方式 */
.payment-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
  transition: all 0.2s;
}

.payment-method:hover {
  border-color: #fb923c;
}

.payment-method.active {
  border-color: #f97316;
  background: #fff7ed;
  color: #f97316;
  font-weight: 600;
}

.payment-method input {
  display: none;
}

/* 未选择支付方式提示 */
.payment-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  margin-bottom: 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 14px;
}

/* Mock 支付 */
.mock-payment {
  padding: 20px;
  background: #fff7ed;
  border: 1px dashed #f97316;
  border-radius: 8px;
  margin-bottom: 16px;
}

.mock-badge {
  display: inline-block;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.mock-hint {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px;
}

.mock-pay-btn {
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  background: #f97316;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.25);
}

.mock-pay-btn:hover:not(:disabled) {
  background: #ea580c;
}

.mock-pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 二维码视图头部：图标 + 支付方式名 */
.pay-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.pay-header i {
  font-size: 26px;
}

.pay-header i.method-wechat {
  color: #07c160;
}

.pay-header i.method-alipay {
  color: #1677ff;
}

.pay-subtitle {
  margin: 8px 0 20px;
  font-size: 13px;
  color: #94a3b8;
}

.pay-plan {
  margin: 0 0 4px;
  font-size: 14px;
  color: #64748b;
}

.pay-price-big {
  margin: 0 0 20px;
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

/* 二维码区域 */
.qr-section {
  margin-bottom: 16px;
}

.qr-section canvas {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.qr-validity {
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
  margin-top: 10px;
}

.payment-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 支付结果 */
.payment-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.payment-result.success {
  background: #ecfdf5;
  color: #059669;
}

.payment-result.fail {
  background: #fef2f2;
  color: #dc2626;
}

.payment-result i {
  font-size: 18px;
}

/* 历史记录 */
.history-section {
  margin-top: 8px;
}

.history-table {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.history-header,
.history-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px 1.2fr;
  padding: 12px 16px;
  font-size: 13px;
  gap: 8px;
  align-items: center;
}

.history-header {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.history-row {
  color: #475569;
}

.history-row + .history-row {
  border-top: 1px solid #f1f5f9;
}

.status-active {
  color: #059669;
  font-weight: 500;
}
.status-pending {
  color: #d97706;
}
.status-expired {
  color: #94a3b8;
}
.status-refunded {
  color: #dc2626;
}
.status-canceled {
  color: #94a3b8;
}

/* ===== 响应式适配 ===== */
@media (max-width: 768px) {
  .plan-cards {
    grid-template-columns: 1fr;
  }

  .status-card {
    padding: 20px;
  }

  .status-card-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .free-trial-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .free-trial-btn {
    width: 100%;
  }

  .test-account-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .test-account-actions {
    flex-wrap: wrap;
  }

  .payment-methods {
    flex-direction: column;
  }

  .history-header,
  .history-row {
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
  }
}
</style>
