# StrategyTableV2 调整申报比例列 — 交互重构实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 StrategyTableV2 的"调整申报比例"列从文本 `<el-input>` 改造为 `<el-input-number>` + 图标按钮（Edit/CircleCheck），并新增"恢复默认"按钮

**Architecture:** 仅修改 `StrategyTableV2.vue` 一个文件。Template 替换列的渲染逻辑，Script 替换编辑相关的数据和方法，Style 新增图标按钮/分档配色样式。仿照 `AuxiliaryTradingTools/components/StrategyTable.vue` 的交互模式。

**Tech Stack:** Vue 3 (Composition API), Element Plus (el-input-number, el-icon, ElMessageBox, ElMessage, Edit/CircleCheck icons), SCSS

---

### Task 1: 替换 Template — 调整申报比例列 + 恢复默认按钮

**Files:**
- Modify: `src/DailyDemandReportV2/components/StrategyTableV2.vue:134-161`（调整申报比例列）
- Modify: `src/DailyDemandReportV2/components/StrategyTableV2.vue:189-196`（底部按钮组）

**Subtask 1.1: 替换调整申报比例列 template**

- [ ] **替换第 134~161 行的 el-table-column 内容**

  当前代码：
  ```html
        <el-table-column fixed="right" min-width="72">
          <template #header>调整申报<br>比例</template>
          <el-table-column min-width="72">
            <template #header>✎ 可编辑</template>
            <template #default="scope">
              <template v-if="editingPeriod === scope.row.period">
                <el-input
                  v-model="editValue"
                  size="small"
                  class="edit-input"
                  @blur="saveEdit(scope.row.period)"
                  @keyup.enter="saveEdit(scope.row.period)"
                />
              </template>
              <template v-else>
                <span
                  class="adjust-btn"
                  @click.stop="startEdit(scope.row.period, scope.row.adjusted_ratio)"
                >✎</span>
                <span
                  :class="['adj-value', isAdjusted(scope.row.period) ? 'adjusted' : 'default']"
                >
                  {{ scope.row.adjusted_ratio }}
                </span>
              </template>
            </template>
          </el-table-column>
        </el-table-column>
  ```

  替换为：
  ```html
        <el-table-column fixed="right" min-width="72">
          <template #header>调整申报<br>比例</template>
          <el-table-column min-width="72">
            <template #header>✎ 可编辑</template>
            <template #default="scope">
              <div class="adjust-ratio-cell">
                <template v-if="editingPeriod !== scope.row.period">
                  <div
                    class="edit-btn"
                    @click.stop="enterEditMode(scope.row.period, scope.row)"
                  >
                    <el-icon><Edit /></el-icon>
                  </div>
                  <div
                    class="adjusted-val"
                    :class="getRatioValueClass(scope.row.period)"
                  >
                    {{ getDisplayRatio(scope.row.period) }}
                  </div>
                </template>
                <template v-else>
                  <el-input-number
                    v-model="editValue"
                    size="small"
                    :precision="2"
                    :min="0.01"
                    :max="2"
                    :step="0.01"
                    @change="(value) => handleRatioChange(value, scope.row.period)"
                  />
                  <div
                    class="confirm-btn"
                    @click.stop="confirmEdit(scope.row.period, scope.row)"
                  >
                    <el-icon><CircleCheck /></el-icon>
                  </div>
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
  ```

**Subtask 1.2: 在底部按钮组新增"恢复默认"按钮**

- [ ] **在底部操作按钮组末尾增加 el-button**

  当前代码（第 189~196 行）：
  ```html
      <div style="display: flex; gap: 8px">
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px; background: #52c41a; color: #fff; border-radius: 6px; font-size: 12px; cursor: default;">
          📋 一键复制结果
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px; background: #1890ff; color: #fff; border-radius: 6px; font-size: 12px; cursor: default;">
          📥 导出用电侧申报结果
        </span>
      </div>
  ```

  替换为：
  ```html
      <div style="display: flex; gap: 8px">
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px; background: #52c41a; color: #fff; border-radius: 6px; font-size: 12px; cursor: default;">
          📋 一键复制结果
        </span>
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px; background: #1890ff; color: #fff; border-radius: 6px; font-size: 12px; cursor: default;">
          📥 导出用电侧申报结果
        </span>
        <el-button size="small" plain @click="resetAllRatios">
          🔄 恢复默认调整申报比例
        </el-button>
      </div>
  ```

---

### Task 2: 替换 Script — 编辑数据和方法

**Files:**
- Modify: `src/DailyDemandReportV2/components/StrategyTableV2.vue:226-321`（script 部分）

- [ ] **Step 2.1: 更新 import 语句**

  当前：
  ```js
  import { ref, computed } from "vue"
  import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2"
  ```

  替换为：
  ```js
  import { ref, computed } from "vue"
  import { useDailyDeclarationV2Store } from "@/store/dailyDeclarationV2"
  import { Edit, CircleCheck } from "@element-plus/icons-vue"
  import { ElMessageBox, ElMessage } from "element-plus"
  ```

- [ ] **Step 2.2: 替换 editingPeriod/editValue 和 tableData**

  当前：
  ```js
  const editingPeriod = ref(null)
  const editValue = ref("")

  const tableData = computed(() => {
    return (store.strategyPeriods || []).map((period) => {
      const ratio =
        store.adjustedRatios[period.period] !== undefined &&
        store.adjustedRatios[period.period] !== null
          ? store.adjustedRatios[period.period]
          : period.suggested_adjust_ratio || "0%"
      return {
        ...period,
        adjusted_ratio: ratio,
        actual_quantity: store.actualQuantities[period.period],
      }
    })
  })
  ```

  替换为：
  ```js
  const editingPeriod = ref(null)
  const editValue = ref(1)

  const tableData = computed(() => {
    return (store.strategyPeriods || []).map((period) => {
      const adjusted = store.adjustedRatios[period.period]
      const ratio = adjusted !== undefined ? adjusted : period.declared_ratio
      return {
        ...period,
        adjusted_ratio: ratio,
        actual_quantity: store.actualQuantities[period.period],
      }
    })
  })
  ```

- [ ] **Step 2.3: 替换 formatNum/formatPct/formatDeclaredRatio/getAdjustedRatio 函数（保持不变，只需保留当前代码）**

  确认保留以下函数不变：
  - `formatNum(val)` — 第 250~253 行
  - `formatPct(val)` — 第 255~258 行
  - `formatDeclaredRatio(val)` — 第 260~263 行
  - `getAdjustedRatio(period)` — 第 265~274 行（保留备用的辅助函数）

- [ ] **Step 2.4: 替换 isAdjusted/startEdit/saveEdit 函数**

  当前代码（第 276~313 行）：
  ```js
  function isAdjusted(period) {
    const stored = store.adjustedRatios[period]
    return stored !== undefined && stored !== null
  }

  function startEdit(period, currentVal) {
    editingPeriod.value = period
    editValue.value = currentVal || ""
  }

  function saveEdit(period) {
    if (editingPeriod.value !== period) return
    editingPeriod.value = null
    const newVal = editValue.value
    if (newVal === null || newVal === undefined || newVal === "") return
    store.setAdjustedRatio(period, newVal)
    const periodData = store.strategyPeriods.find((p) => p.period === period)
    if (periodData) {
      const decimal = parseRatioToDecimal(newVal)
      const qty =
        Math.round(periodData.user_estimated * (1 + decimal) * 100) / 100
      store.setActualQuantity(period, qty)
    }
  }

  function parseRatioToDecimal(val) {
    if (typeof val === "string") {
      const cleaned = val.replace("%", "").replace("+", "")
      const num = parseFloat(cleaned)
      if (isNaN(num)) return 0
      return num / 100
    }
    if (typeof val === "number") {
      if (val > 1) return val / 100
      return val
    }
    return 0
  }
  ```

  替换为：
  ```js
  function isAdjusted(period) {
    return store.adjustedRatios[period] !== undefined
  }

  function enterEditMode(period, row) {
    if (editingPeriod.value !== null && editingPeriod.value !== period) {
      confirmEdit(editingPeriod.value, tableData.value.find(p => p.period === editingPeriod.value))
    }
    editingPeriod.value = period
    const current = getDisplayRatio(period)
    editValue.value = typeof current === 'number' ? current : 1
  }

  function confirmEdit(period, row) {
    if (editingPeriod.value !== period) return
    editingPeriod.value = null
    const newVal = editValue.value
    if (newVal === null || newVal === undefined) return
    const periodData = row || store.strategyPeriods.find((p) => p.period === period)
    if (periodData) {
      store.setAdjustedRatio(period, newVal)
      const qty = Math.round(periodData.user_estimated * newVal * 100) / 100
      store.setActualQuantity(period, qty)
    }
  }

  function handleRatioChange(value, period) {
    if (value < 0.01) editValue.value = 0.01
    if (value > 2) editValue.value = 2
  }
  ```

- [ ] **Step 2.5: 新增 getRatioValueClass 和 getDisplayRatio 函数**

  在 `confirmEdit` 函数之后添加：
  ```js
  function getDisplayRatio(period) {
    const adjusted = store.adjustedRatios[period]
    if (adjusted !== undefined) return adjusted
    const periodData = store.strategyPeriods.find((p) => p.period === period)
    return periodData ? periodData.declared_ratio : 1
  }

  function getRatioValueClass(period) {
    const periodData = store.strategyPeriods.find((p) => p.period === period)
    if (!periodData) return 'ratio-not-adjusted'
    const original = periodData.declared_ratio
    const current = getDisplayRatio(period)
    if (!isAdjusted(period) || current === original) return 'ratio-not-adjusted'
    if (current < 0.8) return 'ratio-low'
    if (current <= 1.2) return 'ratio-medium'
    return 'ratio-high'
  }
  ```

- [ ] **Step 2.6: 新增 resetAllRatios 函数**

  在 `getRatioValueClass` 函数之后添加：
  ```js
  function resetAllRatios() {
    ElMessageBox.confirm(
      '确定要恢复所有调整比例为默认值吗？',
      '恢复默认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      const periods = store.strategyPeriods || []
      periods.forEach((p) => {
        if (store.adjustedRatios[p.period] !== undefined) {
          store.setAdjustedRatio(p.period, undefined)
        }
      })
      editingPeriod.value = null
      ElMessage.success('已恢复所有默认比例')
    }).catch(() => {})
  }
  ```

- [ ] **Step 2.7: 删除不再需要的 parseRatioToDecimal 函数**

  确认删除当前第 301~313 行的 `parseRatioToDecimal` 函数。

---

### Task 3: 替换 Style — 新增图标和分档配色样式

**Files:**
- Modify: `src/DailyDemandReportV2/components/StrategyTableV2.vue`（style 部分）

- [ ] **Step 3.1: 删除旧的编辑相关样式**

  删除以下 style 规则：
  ```css
  .edit-input {
    width: 72px;
  }

  .adjust-btn {
    cursor: pointer;
    margin-right: 4px;
    font-size: 14px;
    user-select: none;
    color: #d48806;
  }

  .adjust-btn:hover {
    color: #faad14;
  }

  .adj-value {
    font-weight: 600;
    font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
  }

  .adj-value.default {
    color: #999;
  }

  .adj-value.adjusted {
    color: #d48806;
  }
  ```

- [ ] **Step 3.2: 新增新的编辑列和分档配色样式**

  在 `.annotation` 样式之前添加：
  ```css
  .adjust-ratio-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .edit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    cursor: pointer;
    color: #3b82f6;
    font-size: 14px;
    flex-shrink: 0;
  }

  .edit-btn:hover {
    background: #eff6ff;
  }

  .confirm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    cursor: pointer;
    color: #10b981;
    font-size: 14px;
    flex-shrink: 0;
  }

  .confirm-btn:hover {
    background: #ecfdf5;
  }

  .adjusted-val {
    font-family: "SF Mono", "Menlo", "Monaco", "Consolas", monospace;
    font-size: 12px;
    font-weight: 600;
    padding: 0 2px;
  }

  .ratio-not-adjusted {
    color: #94a3b8;
    font-style: italic;
    font-weight: 400;
  }

  .ratio-low {
    color: #ef4444;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 1px 4px;
  }

  .ratio-medium {
    color: #10b981;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 4px;
    padding: 1px 4px;
  }

  .ratio-high {
    color: #ef4444;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 1px 4px;
  }
  ```

---

### Task 4: 验证

- [ ] **Step 4.1: 检查 VSCode 诊断**

  ```bash
  # 在 VSCode 中检查 StrategyTableV2.vue 的诊断，确认无错误
  ```

- [ ] **Step 4.2: 确认 el-table 列结构完整**

  确保替换后 el-table 的子 column 数量、fixed 属性、min-width 与替换前一致，未引入布局破坏。

- [ ] **Step 4.3: 确认 import 无遗漏**

  确认以下 import 在新的 script 中都有：
  - `ref`, `computed` from `vue`
  - `useDailyDeclarationV2Store` from `@/store/dailyDeclarationV2`
  - `Edit`, `CircleCheck` from `@element-plus/icons-vue`
  - `ElMessageBox`, `ElMessage` from `element-plus`
