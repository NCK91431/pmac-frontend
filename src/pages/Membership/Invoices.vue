<template>
  <div class="invoices-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Tab 1：购买记录 -->
      <el-tab-pane label="购买记录" name="purchase">
        <div class="history-section">
          <div v-if="history.length === 0" class="empty-tip">暂无购买记录</div>
          <div v-else class="history-table">
            <div class="history-header purchase-header">
              <span>订单号</span>
              <span>类型</span>
              <span>金额</span>
              <span>状态</span>
              <span>时间</span>
              <span>操作</span>
            </div>
            <div v-for="item in history" :key="item.id" class="history-row purchase-row">
              <span class="order-id">#{{ item.id }}</span>
              <span>{{ typeLabel(item.type) }}</span>
              <span>¥{{ item.price }}</span>
              <span :class="'status-' + item.status">{{ statusLabel(item.status) }}</span>
              <span>{{ formatDateTime(item.createdAt) }}</span>
              <span>
                <el-button
                  v-if="canApply(item)"
                  type="primary"
                  size="small"
                  link
                  @click="openApplyDialog(item)"
                >申请发票</el-button>
                <span v-else class="applied-text">已申请</span>
              </span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2：发票管理 -->
      <el-tab-pane label="发票管理" name="invoice">
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
              <span>申请订单id</span>
              <span>发票号</span>
              <span>申请时间</span>
              <span>金额</span>
              <span>开票类型</span>
              <span>发票抬头</span>
              <span>开票状态</span>
              <span>操作</span>
            </div>
            <div v-for="item in invoices" :key="item.id" class="history-row invoice-row">
              <span class="order-id">#{{ item.membershipId }}</span>
              <span>{{ item.invoiceNumber || "—" }}</span>
              <span>{{ formatDateTime(item.appliedAt) }}</span>
              <span>¥{{ item.price }}</span>
              <span>{{ invoiceTypeLabel(item.invoiceType) }}</span>
              <span :title="item.title">{{ item.title }}</span>
              <span :class="item.status === 'issued' ? 'status-issued' : 'status-pending'">
                {{ item.status === "issued" ? "已开票" : "待开票" }}
              </span>
              <span>
                <el-button
                  v-if="item.status === 'issued'"
                  type="primary"
                  size="small"
                  link
                  @click="handleDownload(item)"
                >下载PDF</el-button>
                <span v-else class="applied-text">—</span>
              </span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 申请发票弹窗 -->
    <el-dialog
      v-model="showApplyDialog"
      title="申请发票"
      width="520px"
      :close-on-click-modal="false"
    >
      <div v-if="applyOrder" class="apply-order-info">
        <span>订单号 #{{ applyOrder.id }}</span>
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
          <el-input v-model="applyForm.title" placeholder="请填写发票抬头" maxlength="255" />
        </el-form-item>

        <el-form-item label="纳税人识别号" prop="taxId">
          <el-input v-model="applyForm.taxId" placeholder="企业抬头必填，个人选填" maxlength="50" />
        </el-form-item>

        <el-form-item label="备注信息">
          <el-input v-model="applyForm.remark" placeholder="选填" maxlength="255" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showApplyDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitApply">提交</el-button>
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
const appliedMembershipIds = ref(new Set());

const loadInvoices = async () => {
  try {
    const res = await request.get("/api/invoice/list");
    invoices.value = res.data?.list || [];
    appliedMembershipIds.value = new Set(
      invoices.value.map((i) => i.membershipId),
    );
  } catch (err) {
    console.error("加载发票列表失败:", err);
  }
};

// 该订单是否可申请开票（active/expired 且非免费试用且未申请）
const canApply = (item) =>
  ["active", "expired"].includes(item.status) &&
  item.type !== "free_trial" &&
  !appliedMembershipIds.value.has(item.id);

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
  taxId: [
    {
      validator: (rule, value, callback) => {
        if (applyForm.value.titleType === "company" && !value?.trim()) {
          callback(new Error("企业发票必须填写纳税人识别号"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
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
      membershipId: applyOrder.value.id,
      titleType: applyForm.value.titleType,
      invoiceType: applyForm.value.invoiceType,
      title: applyForm.value.title.trim(),
      taxId: applyForm.value.taxId.trim() || null,
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
.invoices-page {
  padding: 8px;
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
  background: #fff8f0;
  border: 1px solid #fde3c1;
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 16px;

  .rules-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #b45309;
  }

  .rules-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    line-height: 1.8;
    color: #92610e;

    li {
      margin-bottom: 2px;
    }
  }
}

/* ===== history-table（沿用会员中心样式） ===== */
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

/* 购买记录 6 列 */
.purchase-header,
.purchase-row {
  grid-template-columns: 100px 1fr 70px 80px 1.2fr 90px;
}

/* 发票管理 8 列 */
.invoice-header,
.invoice-row {
  grid-template-columns: 110px 1.1fr 1.3fr 70px 1fr 1.2fr 70px 90px;
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
  .purchase-header,
  .purchase-row,
  .invoice-header,
  .invoice-row {
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
  }
}
</style>
