<template>
  <!-- 头部 -->
  <div class="header">
    <div class="header-content">
      <div class="title">⚡ 月度用电需求申报工作流</div>
      <div class="badge-wrapper">
        <span class="badge">🤖 预测算法 v1.0</span>
        <span class="badge">📊 支持20家公司</span>
        <span class="badge">📅 日期类型内置2024-2026</span>
      </div>
    </div>

    <div class="subtitle">
      基于EMS历史负荷数据智能预测下月用电量，一键生成申报表Excel
    </div>
  </div>

  <!-- 主要参数配置区 -->
  <div class="main-config">
    <div class="config-header">
      <h2>📋 申报参数配置</h2>
      <button type="button" class="btn btn-secondary" @click="resetAll">
        ⟳ 重置全部默认
      </button>
    </div>

    <!-- 配置网格 -->
    <div class="config-grid">
      <!-- 左侧：申报多选 -->
      <div class="config-section left-section">
        <div class="field-group company-section">
          <div class="field-content" ref="companyFieldContent">
            <label
              >🏢 申报公司
              <span class="tooltip" title="支持20家签约单位，默认全选"
                >多选</span
              ></label
            >
            <div class="button-bar">
              <button
                type="button"
                class="btn btn-secondary"
                @click="selectAllCompanies"
              >
                全选
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                @click="deselectAllCompanies"
              >
                清空
              </button>
            </div>
          </div>
          <div
            class="checkbox-group"
            ref="companyCheckboxGroup"
            :style="{
              maxHeight: companyCheckboxGroupMaxHeight,
              overflowY: 'auto',
            }"
          >
            <div class="company-checkboxes">
              <div
                v-for="company in COMPANY_LIST"
                :key="company"
                class="company-item"
              >
                <input
                  type="checkbox"
                  :id="`chk_${company.replace(/\s/g, '_')}`"
                  :value="company"
                  v-model="selectedCompanies"
                />
                <label :for="`chk_${company.replace(/\s/g, '_')}`">{{
                  company
                }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：目标月份 + 历史范围 + 日期类型覆盖规则 -->
      <div class="config-section middle-section" ref="middleSection">
        <!-- 公共配置标题 -->
        <div class="common-config-header">📝 公共配置</div>
        <!-- 提示默认配置：范围和默认目标月份 -->
        <div class="default-range-hint">
          <div class="default-config-title">
            <div class="title">默认公共配置公告</div>
            <a
              href="#"
              class="reset-default-link"
              @click.prevent="setDefaultRange"
            >
              🔄 恢复默认
            </a>
          </div>
          <span>
            🎯 目标预测月份: {{ defaultTargetMonth }}（即预测当前月份+1）
          </span>
          <span>📍 历史数据范围: {{ defaultRangeHintText }}</span>
        </div>
        <div class="field-group target-month-section">
          <label
            >📅 目标月份
            <span class="tooltip" title="不填写则自动为下一个月"
              >默认下月</span
            ></label
          >
          <input type="month" v-model="targetMonth" placeholder="YYYY-MM" />
          <!-- <div class="field-hint">留空则预测当前月份+1月</div> -->
          <!-- 在这里显示当前选择的目标月份 -->
          <div class="current-target-month" v-if="targetMonth">
            <span class="field-hint">当前选择: {{ currentTargetMonth }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="field-group history-section">
          <div class="history-header">
            <label>📆 历史数据范围</label>
          </div>

          <!-- 自定义范围输入框 -->
          <div class="custom-range-panel">
            <div class="range-row">
              <div class="range-item">
                <div class="range-label">开始日期</div>
                <input type="date" v-model="rangeStart" />
              </div>
              <div class="range-item">
                <div class="range-label">天数 (默认31)</div>
                <input
                  type="number"
                  v-model.number="rangeDays"
                  min="1"
                  max="90"
                  step="1"
                />
              </div>
            </div>
          </div>
          <!-- 在这里显示当前选择的日期范围 -->
          <div class="current-range-hint" v-if="rangeStart">
            <span>当前选择: {{ currentRangeHintText }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <!-- 公共日期类型覆盖规则 -->
        <div class="field-group public-date-override-section">
          <div class="section-header">
            <label>📅 日期类型公共覆盖规则</label>
            <button
              type="button"
              class="btn btn-secondary small"
              @click="addPublicDateTypeOverride"
            >
              + 添加
            </button>
          </div>
          <div
            v-if="publicDateTypeOverrides.length > 0"
            class="date-override-list"
          >
            <div
              v-for="(override, oidx) in publicDateTypeOverrides"
              :key="oidx"
              class="override-rule"
            >
              <div class="rule-row">
                <input type="date" v-model="override.date" />
                <select v-model="override.modified_type">
                  <option value="工作日">工作日</option>
                  <option value="周六">周六</option>
                  <option value="周日">周日</option>
                  <option value="法定节假日">法定节假日</option>
                  <option value="调休节假日">调休节假日</option>
                </select>
                <input
                  type="text"
                  v-model="override.remark"
                  placeholder="备注 (可选)"
                />
                <button
                  type="button"
                  class="remove-rule-btn"
                  @click="removePublicDateTypeOverride(oidx)"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-override-rules" style="margin-top: 8px">
            暂无日期类型公共覆盖规则，点击「+ 添加」设置
          </div>
        </div>
      </div>

      <!-- 右侧：公司自定义规则 -->
      <div class="config-section right-section">
        <div class="field-group override-section">
          <label
            >📝 公司自定义规则
            <span
              class="tooltip"
              title="为特定公司配置专属的历史日期范围和日期类型覆盖规则"
              >高级配置</span
            ></label
          >

          <!-- 按钮栏 -->
          <div class="button-bar">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showCompanySelectDialog = true"
            >
              + 添加规则
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="clearAllCustomRules"
            >
              🗑️ 清空所有规则
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="loadExampleRules"
            >
              📋 填充示例规则
            </button>
          </div>

          <!-- 公司规则模块列表 -->
          <div class="company-rules-list">
            <div v-if="customRules.length === 0" class="empty-rules">
              暂无规则，点击「+ 添加规则」设置公司自定义规则
            </div>
            <div
              v-for="(rule, idx) in customRules"
              :key="idx"
              class="company-rule-module"
            >
              <div class="module-header">
                <span class="company-name">{{
                  rule.company_list.join("、")
                }}</span>
                <button
                  type="button"
                  class="remove-module-btn"
                  @click="removeCustomRule(idx)"
                >
                  删除
                </button>
              </div>

              <!-- 历史数据范围设置 -->
              <div class="module-section">
                <div class="section-header">
                  <span>历史数据范围</span>
                  <button
                    type="button"
                    class="btn btn-secondary small"
                    @click="toggleHistoryRangeEdit(idx)"
                  >
                    {{ rule.history_date_range ? "编辑" : "添加" }}
                  </button>
                </div>
                <div
                  v-if="editingHistoryRangeIndex === idx"
                  class="history-range-form"
                >
                  <div class="range-row">
                    <div class="range-item">
                      <div class="range-label">开始日期</div>
                      <input type="date" v-model="editHistoryRange.start" />
                    </div>
                    <div class="range-item">
                      <div class="range-label">天数 (默认31)</div>
                      <input
                        type="number"
                        v-model.number="editHistoryRange.days"
                        min="1"
                        max="90"
                        step="1"
                      />
                    </div>
                  </div>
                  <div class="button-bar">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="saveHistoryRange(idx)"
                    >
                      ✅ 保存
                    </button>
                    <button
                      type="button"
                      class="btn btn-secondary"
                      @click="cancelHistoryRangeEdit"
                    >
                      ❌ 取消
                    </button>
                  </div>
                </div>
                <div
                  v-else-if="rule.history_date_range"
                  class="history-range-display"
                >
                  {{ rule.history_date_range.start }} 起，共
                  {{ rule.history_date_range.days || 31 }} 天
                  <button
                    type="button"
                    class="remove-rule-btn"
                    @click="removeHistoryRange(idx)"
                  >
                    删除
                  </button>
                </div>
              </div>

              <!-- 日期类型覆盖规则 -->
              <div class="module-section">
                <div class="section-header">
                  <span>日期类型覆盖规则</span>
                  <button
                    type="button"
                    class="btn btn-secondary small"
                    @click="addDateTypeOverride(idx)"
                  >
                    + 添加
                  </button>
                </div>
                <div
                  v-if="
                    rule.date_type_override &&
                    rule.date_type_override.length > 0
                  "
                  class="date-override-list"
                >
                  <div
                    v-for="(override, oidx) in rule.date_type_override"
                    :key="oidx"
                    class="override-rule"
                  >
                    <div class="rule-row">
                      <input type="date" v-model="override.date" />
                      <select v-model="override.modified_type">
                        <option value="工作日">工作日</option>
                        <option value="周六">周六</option>
                        <option value="周日">周日</option>
                        <option value="法定节假日">法定节假日</option>
                        <option value="调休节假日">调休节假日</option>
                      </select>
                      <input
                        type="text"
                        v-model="override.remark"
                        placeholder="备注 (可选)"
                      />
                      <button
                        type="button"
                        class="remove-rule-btn"
                        @click="removeDateTypeOverride(idx, oidx)"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-override-rules">
                  暂无日期类型覆盖规则，点击「+ 添加」设置
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 公司选择弹窗 -->
      <div v-if="showCompanySelectDialog" class="dialog-overlay">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>选择公司</h3>
            <button
              type="button"
              class="close-btn"
              @click="showCompanySelectDialog = false"
            >
              ×
            </button>
          </div>
          <div class="dialog-body">
            <div class="dialog-checkbox-group">
              <label
                v-for="c in availableCompanies"
                :key="c"
                class="dialog-checkbox-item"
              >
                <input
                  type="checkbox"
                  :value="c"
                  v-model="dialogSelectedCompanies"
                />
                {{ c }}
              </label>
            </div>
            <div
              v-if="dialogSelectedCompanies.length === 0"
              class="dialog-hint"
            >
              请选择至少一家公司
            </div>
          </div>
          <div class="dialog-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showCompanySelectDialog = false"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="confirmCompanySelection"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 覆盖规则浏览区 -->
  <div class="rules-preview-section">
    <div class="rules-preview-header">
      <h2>📋 自定义规则预览</h2>
      <!-- 提交按钮 -->
      <button
        class="btn btn-primary submit-btn"
        :disabled="loading"
        @click="handleSubmit"
      >
        <span v-if="loading" class="spinner"></span>
        {{
          loading
            ? "正在调用EMS接口，预测中 (约需1-2分钟)..."
            : "🚀 开始申报预测 & 生成Excel报表"
        }}
      </button>
    </div>
    <div class="rules-preview-content">
      <div v-if="customRules.length === 0" class="empty-rules">
        暂无自定义规则
      </div>
      <div v-else class="rules-list">
        <div v-for="(rule, idx) in customRules" :key="idx" class="rule-card">
          <div class="rule-header">
            <span class="company-name">{{ rule.company_list.join("、") }}</span>
            <button
              type="button"
              class="remove-rule-btn"
              @click="removeCustomRule(idx)"
            >
              删除
            </button>
          </div>
          <div v-if="rule.history_date_range" class="rule-detail">
            <strong>历史数据范围：</strong>
            {{ rule.history_date_range.start }} 起，共
            {{ rule.history_date_range.days || 31 }} 天
          </div>
          <div
            v-if="rule.date_type_override && rule.date_type_override.length > 0"
            class="rule-detail"
          >
            <strong>日期类型覆盖规则：</strong>
            <ul class="date-override-list">
              <li
                v-for="(override, oidx) in rule.date_type_override"
                :key="oidx"
              >
                {{ override.date }} → {{ override.modified_type }}
                <span v-if="override.remark" class="remark"
                  >({{ override.remark }})</span
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 结果展示区 -->
  <div class="result-section">
    <div class="result-header">
      <h2>📎 申报结果 & 下载</h2>
    </div>
    <div id="resultContainer">
      <div v-if="!result && !errorMsg" class="empty-result">
        ⚡
        配置参数后点击「开始申报预测」，系统将调用EMS接口分析并生成月度需求申报表。
      </div>
      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>⏳ 正在获取历史负荷、分析预测并生成Excel报表，请稍候...</span>
      </div>
      <div v-else-if="errorMsg" class="error-box">
        <strong>❌ 申报失败</strong><br />
        {{ errorMsg }}
        <details v-if="lastPayload">
          <summary>查看请求参数</summary>
          <pre>{{ JSON.stringify(lastPayload, null, 2) }}</pre>
        </details>
        <div class="error-hint">
          💡 建议检查:
          公司名称是否正确、历史日期范围有效性、日期类型覆盖规则格式
        </div>
      </div>
      <div v-else-if="result" class="result-area">
        <div class="result-header">
          <strong>✅ 申报预测已完成</strong>
          <span class="run-id">Run ID: {{ result.run_id || "—" }}</span>
        </div>
        <div v-if="result.output_file?.url" class="download-link">
          <div>
            📄 <strong>Excel 月度需求申报表</strong> ({{
              result.output_file.file_type
            }})<br />
            <span class="link-url">{{ result.output_file.url }}</span>
          </div>
          <div>
            <a
              :href="result.output_file.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary download-btn"
              >📥 下载文件</a
            >
            <button
              class="btn btn-secondary"
              @click="copyToClipboard(result.output_file.url)"
            >
              📋 复制链接
            </button>
          </div>
        </div>
        <div v-else class="error-box">⚠️ 未返回文件下载链接，请检查日志</div>
        <hr />
        <details>
          <summary class="payload-summary">📌 查看已提交的请求参数</summary>
          <pre class="payload-preview">{{
            JSON.stringify(lastPayload, null, 2)
          }}</pre>
        </details>
      </div>
      <footer>
        🌟 基于EMS历史负荷数据预测 | 权重系数保留14位小数，逐时电量保留2位小数 |
        文件链接有效期24小时
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import request from "@/utils/request"; // 根据实际路径调整

// ---------- 公司常量 ----------
const COMPANY_LIST = [
  "珠海华发新能源运营管理有限公司",
  "珠海市百分百商业有限公司",
  "珠海市米兰丽都物业有限公司",
  "珠海市香洲区第二人民医院",
  "鹤山市中医院",
  "鹤山市妇幼保健院",
  "台山市人民医院",
  "江门市妇幼保健院",
  "茂名市华远电器有限公司",
  "高州盛泰门业制造有限公司",
  "化州市昌晟新能源科技有限公司",
  "珠海赛乐奇生物技术股份有限公司",
  "珠海市硕杰机械制造有限公司",
  "鹤山市耀晖能源科技有限公司",
  "鹤山市沙坪街道卫生院",
  "鹤山市共和镇卫生院",
  "鹤山市宅梧镇中心卫生院",
  "鹤山市桃源镇卫生院",
  "鹤山市人民医院",
  "广州晋实新能源科技有限公司",
];

// ---------- 响应式数据 ----------
const targetMonth = ref("");
const rangeStart = ref("");
const rangeDays = ref(31);
const selectedCompanies = ref([...COMPANY_LIST]); // 默认全选

// 规则列表: 每个元素 { company, date, modified_type, remark }
const rules = ref([]);

// 新增：公司自定义规则相关变量
const showCompanySelectDialog = ref(false);
const dialogSelectedCompanies = ref([]);
const editingHistoryRangeIndex = ref(-1);
const editHistoryRange = ref({ start: "", days: 31 });
const customRules = ref([]);

// 公共日期类型覆盖规则
const publicDateTypeOverrides = ref([]);

const loading = ref(false);
const result = ref(null);
const errorMsg = ref("");
const lastPayload = ref(null);

// 中间区域ref，用于获取高度
const middleSection = ref(null);
const middleSectionHeight = ref(0);

// 申报公司区域ref，用于获取高度
const companyFieldContent = ref(null);
const companyFieldContentHeight = ref(0);

// 公司复选框组ref，用于设置高度
const companyCheckboxGroup = ref(null);

// 公司复选框组的最大高度
const companyCheckboxGroupMaxHeight = ref("100px"); // 初始值

// 计算默认范围提示
const defaultRangeHintText = computed(() => {
  const { start, days } = getDefaultRange();
  // 计算结束日期
  const startDate = new Date(start);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + days - 1);
  const endStr = endDate.toISOString().slice(0, 10);
  return `${start} 至 ${endStr}，共 ${days} 天 (即当前日期-35天 ~ 当前日期-4天)`;
});

// 计算可用的公司列表（排除已添加的公司）
const availableCompanies = computed(() => {
  const addedCompanies = customRules.value.flatMap(
    (rule) => rule.company_list || [],
  );
  return COMPANY_LIST.filter((company) => !addedCompanies.includes(company));
});

// 计算当前选择的日期范围
const currentRangeHintText = computed(() => {
  if (!rangeStart.value) {
    return "未选择日期范围";
  }
  const startDate = new Date(rangeStart.value);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + rangeDays.value - 1);
  const endStr = endDate.toISOString().slice(0, 10);
  return `${rangeStart.value} 至 ${endStr}（${rangeDays.value}天）`;
});

// 计算默认目标月份
const defaultTargetMonth = computed(() => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 2; // 预测当前月份+1
  if (month > 12) {
    year += 1;
    month = 1;
  }
  return `${year}年${month.toString().padStart(2, "0")}月`;
});

// 计算当前选择的目标月份
const currentTargetMonth = computed(() => {
  if (!targetMonth.value) {
    return "未选择目标月份（将使用默认值）";
  }
  const [year, month] = targetMonth.value.split("-");
  return `${year}年${month}月`;
});

// ---------- 辅助函数 ----------
function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultRange() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 35);
  const startStr = startDate.toISOString().slice(0, 10);
  return { start: startStr, days: 31 };
}

function setCustomRangeToDefault() {
  const { start, days } = getDefaultRange();
  rangeStart.value = start;
  rangeDays.value = days;
}

function setDefaultRange() {
  // 恢复目标月份为默认值（当前月份+1）
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 2; // 预测当前月份+1
  if (month > 12) {
    year += 1;
    month = 1;
  }
  targetMonth.value = `${year}-${month.toString().padStart(2, "0")}`;

  // 恢复历史数据范围为默认值
  setCustomRangeToDefault();
}

// 公司选择
function selectAllCompanies() {
  selectedCompanies.value = [...COMPANY_LIST];
}
function deselectAllCompanies() {
  selectedCompanies.value = [];
}

// 规则操作
function addRule() {
  rules.value.push({
    company: COMPANY_LIST[0],
    date: "",
    modified_type: "工作日",
    remark: "",
  });
}
function removeRule(index) {
  rules.value.splice(index, 1);
}
function clearRules() {
  rules.value = [];
}
function loadExampleRules() {
  rules.value = [
    {
      company: "珠海华发新能源运营管理有限公司",
      date: "2026-03-20",
      modified_type: "调休节假日",
      remark: "调班",
    },
    {
      company: "台山市人民医院",
      date: "2026-03-25",
      modified_type: "工作日",
      remark: "稳定运营",
    },
    {
      company: "鹤山市中医院",
      date: "2026-03-08",
      modified_type: "法定节假日",
      remark: "妇女节放假",
    },
  ];
}

// 新增：公司自定义规则操作函数
function confirmCompanySelection() {
  if (dialogSelectedCompanies.value.length === 0) {
    alert("请选择至少一家公司");
    return;
  }

  // 检查是否已存在这些公司中的部分规则
  const existingCompanies = customRules.value.flatMap(
    (rule) => rule.company_list || [],
  );
  const newCompanies = dialogSelectedCompanies.value.filter(
    (c) => !existingCompanies.includes(c),
  );

  if (newCompanies.length > 0) {
    // 创建新规则，包含所有新选的公司
    customRules.value.push({
      company_list: [...newCompanies],
      date_type_override: [],
    });
  }

  // 关闭弹窗并重置
  showCompanySelectDialog.value = false;
  dialogSelectedCompanies.value = [];
}

function toggleHistoryRangeEdit(index) {
  if (editingHistoryRangeIndex.value === index) {
    // 取消编辑
    editingHistoryRangeIndex.value = -1;
  } else {
    // 开始编辑
    editingHistoryRangeIndex.value = index;
    const rule = customRules.value[index];
    if (rule.history_date_range) {
      editHistoryRange.value = { ...rule.history_date_range };
    } else {
      editHistoryRange.value = { start: "", days: 31 };
    }
  }
}

function saveHistoryRange(index) {
  if (!editHistoryRange.value.start) {
    alert("请选择开始日期");
    return;
  }

  customRules.value[index].history_date_range = {
    start: editHistoryRange.value.start,
    days: editHistoryRange.value.days || 31,
  };

  editingHistoryRangeIndex.value = -1;
  editHistoryRange.value = { start: "", days: 31 };
}

function cancelHistoryRangeEdit() {
  editingHistoryRangeIndex.value = -1;
  editHistoryRange.value = { start: "", days: 31 };
}

function removeHistoryRange(index) {
  delete customRules.value[index].history_date_range;
}

function addDateTypeOverride(index) {
  if (!customRules.value[index].date_type_override) {
    customRules.value[index].date_type_override = [];
  }
  customRules.value[index].date_type_override.push({
    date: "",
    modified_type: "工作日",
    remark: "",
  });
}

function removeDateTypeOverride(ruleIndex, overrideIndex) {
  customRules.value[ruleIndex].date_type_override.splice(overrideIndex, 1);
}

// 公共日期类型覆盖规则操作
function addPublicDateTypeOverride() {
  publicDateTypeOverrides.value.push({
    date: "",
    modified_type: "工作日",
    remark: "",
  });
}

function removePublicDateTypeOverride(index) {
  publicDateTypeOverrides.value.splice(index, 1);
}

function removeCustomRule(index) {
  customRules.value.splice(index, 1);
}

function clearAllCustomRules() {
  customRules.value = [];
}

// 收集有效规则
function collectRulesAsArray() {
  return rules.value
    .filter(
      (r) =>
        r.company &&
        r.date &&
        /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
        r.modified_type,
    )
    .map((r) => ({
      company: r.company,
      date: r.date,
      modified_type: r.modified_type,
      remark: r.remark || "",
    }));
}

// 构建请求 payload
function buildRequestPayload() {
  const payload = {};

  if (targetMonth.value && /^\d{4}-\d{2}$/.test(targetMonth.value)) {
    payload.target_month = targetMonth.value;
  }

  const allSelected = selectedCompanies.value.length === COMPANY_LIST.length;
  if (!allSelected && selectedCompanies.value.length > 0) {
    payload.company_names = selectedCompanies.value;
  } else if (selectedCompanies.value.length === 0) {
    throw new Error("请至少选择一家公司进行申报");
  }

  if (rangeStart.value && /^\d{4}-\d{2}-\d{2}$/.test(rangeStart.value)) {
    payload.public_history_date_range = {
      start: rangeStart.value,
      days: rangeDays.value,
    };
    if (publicDateTypeOverrides.value.length > 0) {
      payload.public_history_date_range.date_type_override =
        publicDateTypeOverrides.value;
    }
  } else {
    throw new Error("自定义范围: 开始日期格式必须为YYYY-MM-DD");
  }

  if (customRules.value.length > 0) {
    payload.custom_rules = customRules.value.map((rule) => {
      const customRule = { company_list: rule.company_list };
      if (rule.history_date_range) {
        customRule.history_date_range = rule.history_date_range;
      }
      if (rule.date_type_override && rule.date_type_override.length > 0) {
        customRule.date_type_override = rule.date_type_override;
      }
      return customRule;
    });
  }

  return payload;
}

// 重置所有
function resetAll() {
  targetMonth.value = "";
  rangeStart.value = "";
  rangeDays.value = 31;
  selectedCompanies.value = [...COMPANY_LIST];
  clearRules();
  errorMsg.value = "";
  result.value = null;
  lastPayload.value = null;
  // 重置新增的变量
  showCompanySelectDialog.value = false;
  dialogSelectedCompanies.value = [];
  editingHistoryRangeIndex.value = -1;
  editHistoryRange.value = { start: "", days: 31 };
  customRules.value = [];
  publicDateTypeOverrides.value = [];
}

// 复制链接
function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  // 可添加提示，这里省略
}

// API 调用
async function submitPrediction(payload) {
  // 根据接口文档，假设接口路径为 /api/vpp-manage/v1/ps/load/predicting/unit/load/data 或自定义
  // 实际需与后端确认，这里使用相对路径，具体可配置
  const response = await request({
    method: "POST",
    url: "/api/monthly-demand/predict", // 请根据实际后端路径调整
    data: payload,
  });
  // 根据文档，响应结构为 { output_file: { url, file_type }, run_id }
  return response.data;
}

// 提交处理
async function handleSubmit() {
  let payload = null;
  try {
    payload = buildRequestPayload();
  } catch (err) {
    errorMsg.value = err.message;
    result.value = null;
    lastPayload.value = null;
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  result.value = null;
  lastPayload.value = payload;

  try {
    const res = await submitPrediction(payload);
    result.value = res;
  } catch (err) {
    console.error(err);
    errorMsg.value =
      err.response?.data?.message || err.message || "网络异常或服务端错误";
    result.value = null;
  } finally {
    loading.value = false;
  }
}

// 初始化默认值
onMounted(() => {
  // 初始化默认目标月份为当前月份+1
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 2; // 预测当前月份+1
  if (month > 12) {
    year += 1;
    month = 1;
  }
  targetMonth.value = `${year}-${month.toString().padStart(2, "0")}`;

  // 初始化默认范围
  setCustomRangeToDefault();
  // 设置目标月份placeholder（无需默认值）

  // 获取中间区域高度
  setTimeout(() => {
    if (middleSection.value) {
      middleSectionHeight.value = middleSection.value.offsetHeight;
      console.log("Middle section height:", middleSectionHeight.value);
    }

    // 获取申报公司区域高度
    if (companyFieldContent.value) {
      companyFieldContentHeight.value = companyFieldContent.value.offsetHeight;
      console.log(
        "Company field content height:",
        companyFieldContentHeight.value,
      );
    }

    // 计算并设置公司复选框组的最大高度
    const availableHeight =
      middleSectionHeight.value - companyFieldContentHeight.value - 20; // 20px 是额外的边距
    companyCheckboxGroupMaxHeight.value = Math.max(availableHeight, 100) + "px"; // 确保最小高度为100px
    console.log(
      "Company checkbox group max height:",
      companyCheckboxGroupMaxHeight.value,
    );
  }, 100);
});
</script>

<style lang="scss" scoped>
// 完全保留原始样式，仅将 CSS 转换为 SCSS 嵌套结构，不改变任何视觉表现

.header {
  background-color: white;
  padding-left: 20px;
  padding-top: 16px;
  padding-bottom: 16px;
  .header-content {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    .title {
      font-size: 1.5em;
      font-weight: 600;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      letter-spacing: -0.3px;
    }
    .badge-wrapper {
      margin-left: 16px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  }
  .subtitle {
    color: #475569;
    font-size: 0.95rem;
  }
}

.badge {
  background: #eef2ff;
  color: #1e40af;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

/* 主要配置区域 */
.main-config {
  background: white;
  border: 1px solid #e9edf2;

  .config-header {
    padding: 12px 16px 8px 16px;
    border-bottom: 1px solid #eff3f8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr 3fr;
    gap: 16px;
    padding: 16px 32px;
  }

  .config-section {
    &.left-section {
      /* 左侧：目标月份 + 历史范围 */
      .company-section {
        margin-bottom: 0;
      }
      .field-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        label {
          margin-bottom: 0;
        }
      }
    }

    &.middle-section {
      /* 中间：日期类型覆盖规则 */
      border-left: 1px solid #e9edf2;
      padding-left: 20px;
      .field-group {
        &.target-month-section {
          margin-bottom: 12px;
        }
        &.history-section {
          margin-bottom: 0;
        }
      }
      .divider {
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          #e2e8f0,
          transparent
        );
        margin: 10px 0;
      }
      .default-range-hint {
        display: flex;
        flex-direction: column;
        background: #f1f5f9;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 8px;
        margin-bottom: 10px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        span {
          font-size: 0.7rem;
          margin-bottom: 4px;
          display: block;
        }
        .default-config-title {
          .title {
            font-size: 0.8rem;
            font-weight: 500;
            color: #475569;
          }
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          span {
            font-weight: 600;
            font-size: 0.8rem;
            color: #475569;
          }
          .reset-default-link {
            font-size: 0.7rem;
            color: #2563eb;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s;
            &:hover {
              background: #eef2ff;
              text-decoration: underline;
            }
          }
        }
        span:first-child:not(.default-config-title span) {
          color: #1e40af;
          font-weight: 500;
        }
      }

      .common-config-header {
        font-size: 0.9rem;
        font-weight: 600;
      }
    }

    &.right-section {
      /* 右侧：公司多选 */
      border-left: 1px solid #e9edf2;
      padding-left: 20px;
    }
  }
}

/* 结果展示区域 */
.result-section {
  background: white;
  border: 1px solid #e9edf2;

  .result-header {
    padding: 12px 16px 8px 16px;
    border-bottom: 1px solid #eff3f8;
    display: flex;
    align-items: center;
    gap: 6px;

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  #resultContainer {
    padding: 16px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 28px;
}

.field-group {
  margin-bottom: 16px;

  label {
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #1e293b;

    .tooltip {
      font-size: 0.7rem;
      font-weight: 400;
      background: #eef2ff;
      padding: 1px 6px;
      border-radius: 4px;
      color: #2563eb;
      cursor: help;
    }
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #cfdee9;
    border-radius: 6px;
    font-size: 0.8rem;
    transition: 0.2s;
    background: #fff;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
  }

  .field-hint {
    font-size: 0.7rem;
    color: #5b6e8c;
    margin-top: 4px;
  }

  &.history-section {
    label {
      margin-bottom: 0;
    }
  }
}

.custom-range-panel {
  margin-top: 8px;

  .range-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    .range-item {
      flex: 2;
      min-width: 140px;

      &:last-child {
        flex: 1;
        min-width: 80px;
      }

      .range-label {
        font-size: 0.7rem;
        margin-bottom: 3px;
      }
    }
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-range-hint,
.current-target-month {
  font-size: 0.75rem;
  background: #e0f2fe;
  color: #0369a1;
  padding: 6px 10px;
  border-radius: 6px;
  margin-top: 10px;
  border-left: 3px solid #0ea5e9;
}

.checkbox-group {
  background: #fafcff;
  border: 1px solid #e9edf2;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;

  .company-checkboxes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;

    .company-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;

      input {
        width: 16px;
        height: 16px;
        margin: 0;
        accent-color: #2563eb;
      }
    }
  }
}

.override-rules-list {
  background: #fafcff;
  border: 1px solid #e9edf2;
  border-radius: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;

  .empty-rules {
    text-align: center;
    color: #8ba0bc;
    padding: 16px;
    font-size: 0.8rem;
  }

  .override-rule {
    background: white;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #eef2f8;
    transition: 0.1s;

    .rule-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;

      select,
      input {
        flex: 1;
        min-width: 120px;
      }

      .remove-rule-btn {
        background: #fee2e2;
        color: #b91c1c;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.7rem;
        transition: 0.2s;

        &:hover {
          background: #fecaca;
        }
      }
    }
  }
}

.button-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 6px;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  background: #f1f5f9;
  color: #1e293b;

  &.btn-primary {
    background: #2563eb;
    color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
    }
  }

  &.btn-secondary {
    background: #f8fafc;
    border: 1px solid #cbd5e1;

    &:hover {
      background: #eef2ff;
      border-color: #94a3b8;
    }
  }

  &.small {
    padding: 4px 10px;
    font-size: 0.7rem;
  }
}

.submit-btn {
  background: linear-gradient(95deg, #1e4620, #2a6e3a);
  color: white;
  padding: 10px 24px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:disabled {
    opacity: 0.6;
    transform: none;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 6px;
    vertical-align: middle;
  }
}

.result-area,
.error-box,
.loading-state,
.empty-result {
  background: #f8fafd;
  border-radius: 8px;
  padding: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;

  .run-id {
    background: #e9ecef;
    padding: 1px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
  }
}

.download-link {
  background: #e6f9ed;
  border-left: 4px solid #2b9348;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;

  .link-url {
    word-break: break-all;
    font-family: monospace;
    font-size: 0.7rem;
    background: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    display: inline-block;
    margin-top: 6px;
  }

  .download-btn {
    background: #0b5e2e;
    text-decoration: none;
    display: inline-block;
    margin-right: 16px;
  }
}

.error-box {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
  color: #c53030;

  details {
    margin-top: 10px;
  }

  .error-hint {
    margin-top: 12px;
    font-size: 0.8rem;
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #2c3e66;
  font-size: 0.8rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

hr {
  margin: 12px 0;
  border-color: #eef2f8;
}

.payload-summary {
  cursor: pointer;
  font-size: 0.7rem;
  color: #4b5563;
}

.payload-preview {
  background: #1e293b;
  color: #e2e8f0;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.65rem;
  margin-top: 10px;
}

footer {
  text-align: center;
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 16px;
}

/* 新增：公司自定义规则样式 */
.company-selection,
.rule-type-selection {
  margin-bottom: 12px;

  .rule-label {
    font-size: 0.7rem;
    font-weight: 600;
    margin-bottom: 4px;
    display: block;
  }

  select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #cfdee9;
    border-radius: 6px;
    font-size: 0.8rem;
    transition: 0.2s;
    background: #fff;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
  }
}

.history-range-form {
  background: #f8fafc;
  border: 1px solid #e9edf2;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  margin-bottom: 12px;
}

.company-rules-list {
  margin-top: 12px;

  .empty-rules {
    text-align: center;
    color: #8ba0bc;
    padding: 16px;
    font-size: 0.8rem;
  }

  .company-rule-module {
    background: #f8fafc;
    border: 1px solid #e9edf2;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e9edf2;

      .company-name {
        font-weight: 600;
        font-size: 0.85rem;
      }

      .remove-module-btn {
        background: #fee2e2;
        color: #b91c1c;
        border: none;
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.7rem;
        transition: 0.2s;

        &:hover {
          background: #fecaca;
        }
      }
    }

    .module-section {
      margin-bottom: 12px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .history-range-display {
        background: #eef2ff;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .empty-override-rules {
        text-align: center;
        color: #8ba0bc;
        padding: 12px;
        font-size: 0.75rem;
      }

      .date-override-list {
        margin-top: 8px;

        .override-rule {
          background: white;
          border: 1px solid #eef2f8;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 8px;

          .rule-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;

            input,
            select {
              flex: 1;
              min-width: 120px;
            }
          }
        }
      }
    }
  }
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .dialog-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e9edf2;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #64748b;

        &:hover {
          color: #1e293b;
        }
      }
    }

    .dialog-body {
      padding: 16px;

      .dialog-checkbox-group {
        max-height: 300px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;

        .dialog-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          cursor: pointer;

          input {
            width: 16px;
            height: 16px;
            margin: 0;
            accent-color: #2563eb;
          }
        }
      }

      .dialog-hint {
        text-align: center;
        color: #94a3b8;
        padding: 12px;
        font-size: 0.75rem;
      }

      select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #cfdee9;
        border-radius: 6px;
        font-size: 0.8rem;
        transition: 0.2s;
        background: #fff;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px;
      border-top: 1px solid #e9edf2;
    }
  }
}

/* 新增：覆盖规则浏览区样式 */
.rules-preview-section {
  background: white;
  border: 1px solid #e9edf2;

  .rules-preview-header {
    padding: 12px 16px 8px 16px;
    border-bottom: 1px solid #eff3f8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .rules-preview-content {
    padding: 16px;

    .empty-rules {
      text-align: center;
      color: #8ba0bc;
      padding: 16px;
      font-size: 0.8rem;
    }

    .rules-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;

      .rule-card {
        background: #f8fafc;
        border: 1px solid #e9edf2;
        border-radius: 8px;
        padding: 12px;

        .rule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .company-name {
            font-weight: 600;
            font-size: 0.8rem;
          }

          .remove-rule-btn {
            background: #fee2e2;
            color: #b91c1c;
            border: none;
            border-radius: 6px;
            padding: 4px 8px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.7rem;
            transition: 0.2s;

            &:hover {
              background: #fecaca;
            }
          }
        }

        .rule-detail {
          margin-bottom: 8px;
          font-size: 0.75rem;

          strong {
            display: block;
            margin-bottom: 4px;
          }

          .date-override-list {
            list-style: none;
            padding-left: 0;
            margin: 0;

            li {
              margin-bottom: 4px;
              padding-left: 12px;
              position: relative;

              &::before {
                content: "•";
                position: absolute;
                left: 0;
                color: #64748b;
              }

              .remark {
                color: #64748b;
                font-size: 0.7rem;
              }
            }
          }
        }
      }
    }
  }
}

/* 公共日期类型覆盖规则 - 水平排列 */
.public-date-override-section .date-override-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;

  .override-rule {
    flex: 1 1 100%;
    margin-bottom: 0;
    min-width: 0;

    .rule-row {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      align-items: center;

      input,
      select {
        min-width: 0;
      }

      input[type="date"] {
        flex: 0 0 150px;
      }

      select {
        flex: 0 0 110px;
      }

      input[type="text"] {
        flex: 1;
        min-width: 100px;
      }

      .remove-rule-btn {
        flex: 0 0 auto;
        white-space: nowrap;
      }
    }
  }
}

@media (max-width: 700px) {
  body {
    padding: 16px 12px;
  }
  .card-body {
    padding: 14px;
  }
}
</style>
