# 新增日期弹窗（AddDateDialog）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为「已选中日期」卡片新增弹窗交互，用户选择日期后调用 API 获取完整信息，预览确认后再添加至表格。

**架构:** 新建 `AddDateDialog.vue` 组件封装 Dialog + el-date-picker + API 调用 + 预览表格 + 确定逻辑；修改 `index.vue` 替换原有内联日期选择器。

**Tech Stack:** Vue 3 (setup script), Element Plus (Dialog/DatePicker/Table/Alert), Pinia store, Axios

---

### Task 1: 创建 AddDateDialog.vue 组件

**Files:**

- Create: `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2/components/AddDateDialog.vue`

- [ ] **Step 1: 创建组件文件**

写入完整组件代码：

```vue
<template>
  <el-dialog
    :model-value="modelValue"
    title="📅 新增日期"
    width="720"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @closed="handleClosed"
  >
    <div class="dialog-body">
      <div class="date-selector-row">
        <span class="selector-label">选择日期</span>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="请选择日期"
          value-format="YYYY-MM-DD"
          :disabled="loading"
          @change="handleDateChange"
        />
      </div>

      <div v-if="errorMsg" class="preview-section">
        <el-alert :title="errorMsg" type="error" show-icon :closable="false" />
      </div>

      <div v-if="warningMsg" class="preview-section">
        <el-alert
          :title="warningMsg"
          type="warning"
          show-icon
          :closable="false"
        />
      </div>

      <div v-if="previewData && !errorMsg" class="preview-section">
        <div class="preview-title">日期信息预览</div>
        <div class="preview-table-wrapper">
          <el-table
            :data="[previewData]"
            border
            size="small"
            class="preview-table"
          >
            <el-table-column type="index" label="#" width="36" align="center" />
            <el-table-column prop="date" label="日期" width="85" />
            <el-table-column prop="day_of_the_week" label="星期" width="50" />
            <el-table-column prop="date_type" label="日期类型" width="70" />
            <el-table-column prop="holiday_name" label="节假日" width="65" />
            <el-table-column prop="temperatureMin" label="最低温" width="50" />
            <el-table-column prop="temperatureMax" label="最高温" width="50" />
            <el-table-column
              prop="cloudCoverEarlyMorning"
              label="凌晨云量"
              width="50"
            />
            <el-table-column
              prop="cloudCoverMorning"
              label="上午云量"
              width="50"
            />
            <el-table-column
              prop="cloudCoverAfternoon"
              label="下午云量"
              width="50"
            />
            <el-table-column
              prop="cloudCoverEvening"
              label="晚上云量"
              width="50"
            />
            <el-table-column prop="windSpeed" label="风速" width="45" />
            <el-table-column prop="windDirection" label="风向°" width="45" />
            <el-table-column prop="weather" label="天气" width="55" />
          </el-table>
        </div>
      </div>

      <div v-if="loading" class="loading-section">
        <el-icon class="is-loading" :size="20"><Loading /></el-icon>
        <span>正在查询日期信息...</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel" :disabled="loading">取消</el-button>
      <el-button
        type="primary"
        :disabled="!canConfirm"
        :loading="loading"
        @click="handleConfirm"
      >
        ✔ 确定添加
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { Loading } from "@element-plus/icons-vue";
import { manualDateApi } from "@/DailyDemandReportV2/api";
import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2";

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const store = useDailyDeclarationV2Store();

const selectedDate = ref("");
const previewData = ref(null);
const loading = ref(false);
const errorMsg = ref("");
const warningMsg = ref("");

const canConfirm = computed(() => {
  return (
    selectedDate.value &&
    previewData.value &&
    !errorMsg.value &&
    !warningMsg.value
  );
});

function formatValue(val) {
  return val != null && val !== "" ? val : "—";
}

async function handleDateChange(date) {
  if (!date) return;

  loading.value = true;
  errorMsg.value = "";
  warningMsg.value = "";
  previewData.value = null;

  const exists = store.allSelectedDates.find((d) => d.date === date);
  if (exists) {
    warningMsg.value = "该日期已添加过了，请勿重复添加";
    loading.value = false;
    return;
  }

  try {
    const res = await manualDateApi(date);
    const body = res.data;
    if (body.success) {
      previewData.value = body.data;
    } else {
      errorMsg.value = body.error || "获取日期信息失败";
    }
  } catch (e) {
    errorMsg.value = "网络错误，无法获取日期信息";
  } finally {
    loading.value = false;
  }
}

function handleConfirm() {
  if (!canConfirm.value) return;
  store.addManualDate(previewData.value);
  resetState();
  emit("update:modelValue", false);
}

function handleCancel() {
  resetState();
  emit("update:modelValue", false);
}

function handleClosed() {
  resetState();
}

function resetState() {
  selectedDate.value = "";
  previewData.value = null;
  loading.value = false;
  errorMsg.value = "";
  warningMsg.value = "";
}
</script>

<style scoped>
.dialog-body {
  min-height: 200px;
}

.date-selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 6px;
}

.selector-label {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
}

.preview-section {
  margin-bottom: 12px;
}

.preview-title {
  font-weight: 600;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  padding-left: 2px;
}

.preview-table-wrapper {
  overflow-x: auto;
}

.preview-table-wrapper :deep(.el-table) {
  font-size: 12px;
}

.preview-table-wrapper :deep(th.el-table__cell) {
  background: #f5f7fa !important;
  color: #303133;
  font-weight: 600;
  padding: 0;
  border: 1px solid #ebeef5 !important;
}

.preview-table-wrapper :deep(th.el-table__cell .cell) {
  padding: 6px 4px;
  line-height: 1.4;
  white-space: nowrap;
}

.preview-table-wrapper :deep(td.el-table__cell) {
  padding: 0;
  border: 1px solid #ebeef5;
  color: #606266;
}

.preview-table-wrapper :deep(td.el-table__cell .cell) {
  padding: 6px 4px;
  line-height: 1.4;
}

.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #8c8c8c;
  font-size: 13px;
}
</style>
```

- [ ] **Step 2: 验证文件无语法错误**

Run: `npx vue-tsc --noEmit src/DailyDemandReportV2/components/AddDateDialog.vue 2>&1 || true`
或者检查 VS Code 诊断输出无红色波浪线。

---

### Task 2: 修改 index.vue 集成 AddDateDialog

**Files:**

- Modify: `/Users/guansiyu/Desktop/frontend-code/src/DailyDemandReportV2/index.vue`

- [ ] **Step 1: 导入 AddDateDialog 组件**

在 `index.vue` 的 import 区域添加：

```javascript
import AddDateDialog from "@/DailyDemandReportV2/components/AddDateDialog.vue";
```

- [ ] **Step 2: 替换模板中新增日期的操作区域**

将以下代码（第 102-123 行附近）：

```html
<div class="v2-selected-actions">
  <el-date-picker
    v-model="newDate"
    type="date"
    placeholder="选择日期"
    value-format="YYYY-MM-DD"
    size="small"
  />
  <el-button
    size="small"
    type="primary"
    @click="handleAddDate"
    class="v2-btn-primary"
    >📅 新增日期</el-button
  >
  <el-button size="small" @click="handleClearAll" class="v2-btn-outline-gray"
    >🗑 移除全部</el-button
  >
</div>
```

替换为：

```html
<div class="v2-selected-actions">
  <el-button
    size="small"
    type="primary"
    @click="showAddDialog = true"
    class="v2-btn-primary"
    >📅 新增日期</el-button
  >
  <el-button size="small" @click="handleClearAll" class="v2-btn-outline-gray"
    >🗑 移除全部</el-button
  >
</div>
```

- [ ] **Step 3: 添加 AddDateDialog 标签到模板**

在 `</SelectedDatesTable>` 之后的合适位置（Step 2 模板结束前）添加：

```html
<AddDateDialog v-model="showAddDialog" />
```

- [ ] **Step 4: 修改 script setup 中的变量和函数**

移除 `const newDate = ref("")` 和 `handleAddDate` 函数。

添加 `const showAddDialog = ref(false)`。

最终的 script setup 中相关部分的修改：

```vue
<script setup>
// ... 原有的import保持不变
import AddDateDialog from "@/DailyDemandReportV2/components/AddDateDialog.vue";

// ... 中间代码保持不变

const newDate = ref(""); // ← 删除这一行

function handleAddDate() {
  // ← 删除这个函数
  if (!newDate.value) return;
  store.addManualDate({ date: newDate.value });
  newDate.value = "";
}

// 添加这一行
const showAddDialog = ref(false);

// ... 其余代码保持不变
</script>
```

---

### Task 3: 验证最终结果

**Files:** 无需修改

- [ ] **Step 1: 检查 VS Code 诊断**

确保 `AddDateDialog.vue` 和 `index.vue` 均无诊断错误。

- [ ] **Step 2: 检查功能完整性清单**

- [ ] 点击"新增日期"按钮 → 弹窗打开
- [ ] 弹窗中有日期选择器
- [ ] 选择日期后调用 POST manual-date 接口
- [ ] 加载中显示 loading 状态
- [ ] 加载成功后显示单行预览表格
- [ ] 已存在的日期显示警告，确定按钮禁用
- [ ] API 失败显示错误提示，确定按钮禁用
- [ ] 点击确定 → 日期添加进表格，弹窗关闭
- [ ] 点击取消/关闭 → 弹窗关闭，清空状态
