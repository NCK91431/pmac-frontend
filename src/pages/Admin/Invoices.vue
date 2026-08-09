<template>
  <div class="admin-invoices">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>发票管理</span>
          <span class="header-hint">待开票申请在前，上传 PDF 完成开票</span>
        </div>
      </template>

      <el-table
        :data="list"
        border
        stripe
        size="small"
        v-loading="loading"
      >
        <el-table-column label="申请人" width="140">
          <template #default="{ row }">
            <div>{{ row.userName }}</div>
            <div class="cell-sub">{{ row.userPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" width="170" />
        <el-table-column label="金额" width="90">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="开票类型" width="140">
          <template #default="{ row }">{{ invoiceTypeLabel(row.invoiceType) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="发票抬头" min-width="160" show-overflow-tooltip />
        <el-table-column label="开票状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'issued' ? 'success' : 'warning'" size="small">
              {{ row.status === "issued" ? "已开票" : "待开票" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="150">
          <template #default="{ row }">{{ formatDateTime(row.appliedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button type="primary" size="small" @click="openIssueDialog(row)">开票</el-button>
            </template>
            <template v-else>
              <span class="cell-sub">{{ row.invoiceNumber }}</span>
              <el-button type="primary" size="small" link @click="handleDownload(row)">下载</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 开票弹窗 -->
    <el-dialog
      v-model="showIssueDialog"
      title="开具发票"
      width="480px"
      :close-on-click-modal="false"
    >
      <div v-if="issueRow" class="issue-order-info">
        订单 {{ issueRow.orderNo }} · ¥{{ issueRow.price }} · {{ issueRow.title }}
      </div>
      <el-form label-width="90px">
        <el-form-item label="发票号" required>
          <el-input v-model="invoiceNumber" placeholder="请输入发票号" maxlength="50" />
        </el-form-item>
        <el-form-item label="发票PDF" required>
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept="application/pdf"
            :on-change="handleFileChange"
            :on-remove="() => (pdfFile = null)"
          >
            <el-button type="primary" size="small">选择 PDF 文件</el-button>
            <template #tip>
              <div class="el-upload__tip">仅支持 PDF 文件，大小不超过 10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showIssueDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitIssue">确认开票</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { saveAs } from "file-saver";
import request from "@/utils/request";

const list = ref([]);
const loading = ref(false);

const showIssueDialog = ref(false);
const issueRow = ref(null);
const invoiceNumber = ref("");
const pdfFile = ref(null);
const submitting = ref(false);

const invoiceTypeLabel = (type) => {
  const map = {
    normal: "增值税普通发票",
    special: "增值税专用发票",
  };
  return map[type] || type;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const loadList = async () => {
  loading.value = true;
  try {
    const res = await request.get("/api/admin/invoices");
    list.value = res.data?.list || [];
  } catch (err) {
    console.error("加载发票申请列表失败:", err);
  } finally {
    loading.value = false;
  }
};

const openIssueDialog = (row) => {
  issueRow.value = row;
  invoiceNumber.value = "";
  pdfFile.value = null;
  showIssueDialog.value = true;
};

const handleFileChange = (file) => {
  if (file.raw.type !== "application/pdf") {
    ElMessage.error("仅支持 PDF 文件");
    pdfFile.value = null;
    return;
  }
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error("文件大小不能超过 10MB");
    pdfFile.value = null;
    return;
  }
  pdfFile.value = file.raw;
};

const submitIssue = async () => {
  if (!invoiceNumber.value.trim()) {
    ElMessage.error("请输入发票号");
    return;
  }
  if (!pdfFile.value) {
    ElMessage.error("请选择 PDF 发票文件");
    return;
  }
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("invoiceNumber", invoiceNumber.value.trim());
    formData.append("pdf", pdfFile.value);
    await request.post(`/api/admin/invoices/${issueRow.value.id}/issue`, formData);
    ElMessage.success("开票完成");
    showIssueDialog.value = false;
    await loadList();
  } catch (err) {
    console.error("开票失败:", err);
  } finally {
    submitting.value = false;
  }
};

const handleDownload = async (row) => {
  try {
    const response = await request.get(`/api/admin/invoices/${row.id}/download`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data]);
    saveAs(blob, `invoice-${row.invoiceNumber || row.id}.pdf`);
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

onMounted(loadList);
</script>

<style lang="scss" scoped>
.admin-invoices {
  padding: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-hint {
    font-size: 12px;
    color: #94a3b8;
    font-weight: 400;
  }
}

.cell-sub {
  font-size: 12px;
  color: #94a3b8;
}

.issue-order-info {
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  color: #475569;
}
</style>
