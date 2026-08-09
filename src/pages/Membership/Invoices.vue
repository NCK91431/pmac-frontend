<template>
  <div class="invoices-page">
    <div class="page-container">
      <!-- 页面标题区域 -->
      <div class="page-header">
        <div class="header-icon">
          <i class="bi bi-receipt"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">记录与发票</h1>
          <p class="page-subtitle">查看购买记录，随时申请与下载电子发票</p>
        </div>
      </div>

      <!-- 分段式标签（替代 el-tabs） -->
      <div class="tab-switcher" role="tablist">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'purchase' }"
          role="tab"
          @click="activeTab = 'purchase'"
        >
          <i class="bi bi-clock-history"></i>
          购买记录
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'invoice' }"
          role="tab"
          @click="activeTab = 'invoice'"
        >
          <i class="bi bi-receipt-cutoff"></i>
          发票管理
        </button>
      </div>

      <!-- Tab 1：购买记录 -->
      <div v-if="activeTab === 'purchase'" class="tab-pane">
        <div class="section-head">
          <h2 class="section-title">购买记录</h2>
          <span class="section-desc">共 {{ history.length }} 笔订单</span>
        </div>
        <div class="history-section">
          <div v-if="history.length === 0" class="empty-tip">暂无购买记录</div>
          <div v-else class="history-table">
            <div class="history-header purchase-header">
              <span>订单号</span>
              <span>类型</span>
              <span>金额</span>
              <span>时间</span>
              <span>状态</span>
              <span>发票状态</span>
              <span>操作</span>
            </div>
            <div
              v-for="item in history"
              :key="item.id"
              class="history-row purchase-row"
            >
              <span class="order-id">{{ item.orderNo }}</span>
              <span>{{ typeLabel(item.type) }}</span>
              <span>¥{{ item.price }}</span>
              <span>{{ formatDateTime(item.createdAt) }}</span>
              <span :class="'status-' + item.status">{{
                statusLabel(item.status)
              }}</span>
              <span :class="invoiceStatusClass(item)">{{
                invoiceStatusLabel(item)
              }}</span>
              <span>
                <el-button
                  v-if="canApply(item)"
                  type="primary"
                  size="small"
                  link
                  @click="openApplyDialog(item)"
                  >申请发票</el-button
                >
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2：发票管理 -->
      <div v-else class="tab-pane">
        <div class="section-head">
          <h2 class="section-title">发票管理</h2>
          <span class="section-desc">共 {{ invoices.length }} 条开票记录</span>
        </div>
        <div class="invoice-rules">
          <p class="rules-title">开票规则</p>
          <ol class="rules-list">
            <li>企业用户开具发票时，发票抬头需要与实名认证信息一致</li>
            <li>目前开票周期为 7 个工作日左右，将以邮件形式发送到邮箱</li>
            <li>已开具发票的金额不予退款</li>
            <li>开票信息一经提交，无法修改，如有问题，请联系客服13005768226</li>
          </ol>
        </div>
        <div class="history-section">
          <div v-if="invoices.length === 0" class="empty-tip">暂无开票记录</div>
          <div v-else class="history-table">
            <div class="history-header invoice-header">
              <span>订单号</span>
              <span>发票号</span>
              <span>申请时间</span>
              <span>金额</span>
              <span>开票类型</span>
              <span>发票抬头</span>
              <span>开票状态</span>
              <span>操作</span>
            </div>
            <div
              v-for="item in invoices"
              :key="item.id"
              class="history-row invoice-row"
            >
              <span class="order-id">{{ item.orderNo }}</span>
              <span>{{ item.invoiceNumber || "—" }}</span>
              <span>{{ formatDateTime(item.appliedAt) }}</span>
              <span>¥{{ item.price }}</span>
              <span>{{ invoiceTypeLabel(item.invoiceType) }}</span>
              <span :title="item.title">{{ item.title }}</span>
              <span
                :class="
                  item.status === 'issued' ? 'status-issued' : 'status-pending'
                "
              >
                {{ item.status === "issued" ? "已开票" : "待开票" }}
              </span>
              <span>
                <el-button
                  v-if="item.status === 'issued'"
                  type="primary"
                  size="small"
                  link
                  @click="handleDownload(item)"
                  >下载PDF</el-button
                >
                <span v-else class="applied-text">—</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申请发票弹窗 -->
    <el-dialog
      v-model="showApplyDialog"
      title="申请发票"
      width="520px"
      :close-on-click-modal="false"
    >
      <div v-if="applyOrder" class="apply-order-info">
        <span>订单号 {{ applyOrder.orderNo }}</span>
        <span>金额 ¥{{ applyOrder.price }}</span>
        <span>购买时间 {{ formatDateTime(applyOrder.createdAt) }}</span>
      </div>

      <el-form
        ref="applyFormRef"
        :model="applyForm"
        :rules="applyRules"
        label-width="100px"
      >
        <el-form-item label="抬头类型">
          <el-radio-group v-model="applyForm.titleType">
            <el-radio-button value="company">企业</el-radio-button>
            <el-radio-button value="personal">个人</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="开票类型">
          <el-radio-group v-model="applyForm.invoiceType">
            <el-radio-button value="normal">增值税普通发票</el-radio-button>
            <el-radio-button value="special">增值税专用发票</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="发票抬头" prop="title">
          <el-input
            v-model="applyForm.title"
            placeholder="请填写发票抬头"
            maxlength="255"
          />
        </el-form-item>

        <el-form-item label="纳税人识别号" prop="taxId">
          <el-input
            v-model="applyForm.taxId"
            placeholder="请填写纳税人识别号"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="备注信息">
          <el-input
            v-model="applyForm.remark"
            placeholder="选填"
            maxlength="255"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitApply"
          >提交</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { saveAs } from "file-saver";
import request from "@/utils/request";
import { useMembershipStore } from "@/store/membership";

const store = useMembershipStore();
const activeTab = ref("purchase");
const history = computed(() => store.history);
const fetchMembershipStatus = store.fetchMembershipStatus;

// ===== 工具函数（从 Membership/index.vue 迁入） =====
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

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const invoiceTypeLabel = (type) => {
  const map = {
    normal: "增值税普通发票",
    special: "增值税专用发票",
  };
  return map[type] || type;
};

// ===== 发票列表与已申请集合 =====
const invoices = ref([]);
const appliedOrderNos = ref(new Set());

const loadInvoices = async () => {
  try {
    const res = await request.get("/api/invoice/list");
    invoices.value = res.data?.list || [];
    appliedOrderNos.value = new Set(invoices.value.map((i) => i.orderNo));
  } catch (err) {
    console.error("加载发票列表失败:", err);
  }
};

// 发票记录按 orderNo 索引（用于购买记录表显示发票状态）
const invoiceMap = computed(() => {
  const map = {};
  invoices.value.forEach((i) => {
    map[i.orderNo] = i;
  });
  return map;
});

// 发票状态：未申请 / 申请中（待开票） / 已申请（已开票）
const invoiceStatusLabel = (item) => {
  const inv = invoiceMap.value[item.orderNo];
  if (!inv) return "未申请";
  return inv.status === "issued" ? "已申请" : "申请中";
};

const invoiceStatusClass = (item) => {
  const inv = invoiceMap.value[item.orderNo];
  if (!inv) return "status-not-applied";
  return inv.status === "issued" ? "status-applied" : "status-applying";
};

// 该订单是否可申请开票（active/expired 且非免费试用且未申请）
const canApply = (item) =>
  ["active", "expired"].includes(item.status) &&
  item.type !== "free_trial" &&
  !appliedOrderNos.value.has(item.orderNo);

// ===== 申请开票弹窗 =====
const showApplyDialog = ref(false);
const applyOrder = ref(null);
const applyFormRef = ref(null);
const submitting = ref(false);
const applyForm = ref({
  titleType: "company",
  invoiceType: "normal",
  title: "",
  taxId: "",
  remark: "",
});

const applyRules = {
  title: [{ required: true, message: "请填写发票抬头", trigger: "blur" }],
  taxId: [{ required: true, message: "请填写纳税人识别号", trigger: "blur" }],
};

const openApplyDialog = (item) => {
  applyOrder.value = item;
  applyForm.value = {
    titleType: "company",
    invoiceType: "normal",
    title: "",
    taxId: "",
    remark: "",
  };
  showApplyDialog.value = true;
};

const submitApply = async () => {
  await applyFormRef.value.validate();
  submitting.value = true;
  try {
    const payload = {
      orderNo: applyOrder.value.orderNo,
      titleType: applyForm.value.titleType,
      invoiceType: applyForm.value.invoiceType,
      title: applyForm.value.title.trim(),
      taxId: applyForm.value.taxId.trim(),
      remark: applyForm.value.remark.trim() || null,
    };
    await request.post("/api/invoice/apply", payload);
    ElMessage.success("开票申请已提交");
    showApplyDialog.value = false;
    await Promise.all([loadInvoices(), fetchMembershipStatus()]);
  } catch (err) {
    console.error("提交开票申请失败:", err);
  } finally {
    submitting.value = false;
  }
};

// ===== 下载发票 PDF =====
const handleDownload = async (item) => {
  try {
    const response = await request.get(`/api/invoice/download/${item.id}`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data]);
    saveAs(blob, `invoice-${item.invoiceNumber || item.id}.pdf`);
  } catch (error) {
    if (error.response?.data?.type?.includes("application/json")) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          ElMessage.error(data.error || "下载失败");
        } catch {
          ElMessage.error("下载失败");
        }
      };
      reader.readAsText(error.response.data);
    } else {
      ElMessage.error("下载失败");
    }
  }
};

onMounted(() => {
  fetchMembershipStatus();
  loadInvoices();
});
</script>

<style lang="scss" scoped>
/* ===== 页面整体布局：浅灰底 + 居中限宽容器 ===== */
.invoices-page {
  min-height: calc(100vh - 64px);
  padding: 36px 20px 60px;
  background: #f4f6fb;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== 页面标题区域 ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  background: linear-gradient(135deg, #2c6fbb 0%, #4f8edb 100%);
  box-shadow: 0 6px 16px rgba(44, 111, 187, 0.28);
}

.header-text {
  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #1e293b;
  }

  .page-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #64748b;
  }
}

/* ===== 分段式标签（替代 el-tabs） ===== */
.tab-switcher {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: #e9eef5;
  border-radius: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 8px 22px;
  border-radius: 9px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  i {
    font-size: 14px;
  }

  &:hover {
    color: #2c6fbb;
  }

  &.active {
    background: #fff;
    color: #2c6fbb;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(44, 111, 187, 0.15);
  }
}

.tab-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: rgba(44, 111, 187, 0.12);
  color: #2c6fbb;
}

/* ===== 内容区切换动画 ===== */
.tab-pane {
  animation: cardIn 0.25s ease-out;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tab-pane {
    animation: none;
  }
}

/* 区块标题行 */
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.section-desc {
  font-size: 12px;
  color: #94a3b8;
}

/* 空状态提示 */
.empty-tip {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

/* 开票规则 */
.invoice-rules {
  background: #f8fbff;
  border: 1px solid #dbe7f7;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;

  .rules-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #2c6fbb;
  }

  .rules-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    line-height: 1.8;
    color: #5b7490;

    li {
      margin-bottom: 2px;
    }
  }
}

/* ===== history-table（沿用原有表格样式，未改动） ===== */
.history-section {
  margin-top: 8px;
}

.history-table {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.history-header,
.history-row {
  display: grid;
  padding: 12px 16px;
  font-size: 13px;
  gap: 8px;
  align-items: center;
}

/* 购买记录 7 列 */
.purchase-header,
.purchase-row {
  grid-template-columns: 150px 110px 80px 130px 90px 90px 100px;
}

/* 发票管理 8 列 */
.invoice-header,
.invoice-row {
  grid-template-columns: 150px 1.2fr 130px 80px 120px 1.3fr 90px 100px;
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

.order-id {
  color: #2c6fbb;
  font-family: monospace;
}

.applied-text {
  color: #94a3b8;
  font-size: 12px;
}

.status-not-applied {
  color: #94a3b8;
}

.status-applying {
  color: #d97706;
}

.status-applied {
  color: #059669;
  font-weight: 500;
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
.status-issued {
  color: #059669;
  font-weight: 500;
}

/* 申请弹窗订单信息 */
.apply-order-info {
  display: flex;
  gap: 16px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  color: #475569;
}

@media (max-width: 768px) {
  .invoices-page {
    padding: 20px 12px 40px;
  }

  .tab-switcher {
    width: 100%;
    display: flex;

    .tab-btn {
      flex: 1;
      justify-content: center;
      padding: 8px 12px;
    }
  }

  .purchase-header,
  .purchase-row,
  .invoice-header,
  .invoice-row {
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
  }
}
</style>
