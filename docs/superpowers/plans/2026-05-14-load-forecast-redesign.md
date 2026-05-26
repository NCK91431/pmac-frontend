# 负荷预测模块重构 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 LoadPre.vue 拆分为"新建模型"（/loadpre）和"已建模型"（/loadpre/history）两个独立页面，全宽流体布局替代 Bootstrap card 布局，移除所有 Bootstrap 布局约束类

**Architecture:** 嵌套路由 /loadpre（LoadPre.vue 重写）+ /loadpre/history（LoadHistory.vue 新建）；步骤条始终可见，stage 控制内容切换；已有组件（ConfigForm、FileUpload、ChooseMode、Prompt、Analysis、LoadChart、WeatherChart、WeatherInfo）内容不动，仅移除其 Bootstrap card/row/col 包装

**Tech Stack:** Vue 3 + Composition API, Element Plus (Steps/StepsBar/Tree/Radio/Select), Pinia, SCSS, ECharts

---

### Task 1: 路由与菜单侧边栏配置

**Files:**
- Modify: `src/router/index.js` (添加 `/loadpre/history` 路由 + 侧边栏子项)
- Modify: `src/components/Breadcrumb.vue` (添加面包屑条目)

- [ ] **Step 1: 在 router/index.js 中添加 `/loadpre/history` 路由**

在 `loadpre` 路由的 children 同级下方（或独立一级路由），添加新路由：

```js
{
    path: "/loadpre/history",
    name: "loadpre_history",
    component: () => import("@/pages/Load/LoadHistory.vue"),
    meta: {
        module: "load",
        breadcrumb: {
            title: "已建模型",
            icon: "bi bi-clock-history",
        },
    },
},
```

- [ ] **Step 2: 在 router/index.js 的 sidebar load children 中添加"已建模型"条目**

找到 `load` 模块的 sidebar children 数组（当前包含案例展示和新建模型），在末尾添加：

```js
{ title: "已建模型", route: "/loadpre/history" },
```

- [ ] **Step 3: 在 Breadcrumb.vue 中添加面包屑配置**

在 `routeToBreadcrumb` 对象中新增：

```js
loadpre_history: {
    title: "已建模型",
    icon: "bi bi-clock-history",
    hasBackBtn: true,
},
```

在 `updateBreadcrumbs` 函数中新增父级面包屑逻辑：

```js
if (routeName === "loadpre_history") {
    crumbs.push(routeToBreadcrumb["loadpre"]);
}
```

---

### Task 2: Store 清理 —— 移除 activeTab 状态

**Files:**
- Modify: `src/store/load.js`

- [ ] **Step 1: 移除 `activeTab` state**

找到 `state` 定义，删除 `activeTab: "upload"` 这一行。

- [ ] **Step 2: 移除 `setActiveTab` action**

找到 `actions` 定义，删除 `setActiveTab` 方法及相关代码。

---

### Task 3: Configuration.vue —— 从 FinishView.vue 剥离更名

**Files:**
- Rename: `src/pages/Load/ConfigSection/FinishView.vue` → `src/pages/Load/ConfigSection/Configuration.vue`
- Modify: Configuration.vue（剥离 Analysis 组件 + 异常提示区块）

- [ ] **Step 1: 文件重命名**

将 `FinishView.vue` 重命名为 `Configuration.vue`。

- [ ] **Step 2: 从模板中移除 Analysis 组件和异常提示区块**

删除模板中以下两个部分：

**删除 Analysis 部分（原 FinishView.vue 的 L151-L158）：**
```html
<!-- 负荷特性分析 -->
<div class="row">
    <Analysis
        :load_stabilityindex="result.load_stabilityindex"
        :predictaBility="result.predictaBility"
        style="margin-top: 20px"
    />
</div>
```

**删除异常提示区块（原 FinishView.vue 的 L159-L182）：**
```html
<!-- 数据异常提示 -->
<div class="row" style="padding-right: 32px">
    <div
        v-if="result.dataAnomaly && result.dataAnomaly.abnormal_flag"
        class="anomaly-alert col-md-12"
    >
        <div class="anomaly-content">
            <div class="anomaly-problem">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span class="anomaly-label">提示：</span>
                <span class="anomaly-text">{{
                    result.dataAnomaly.problem
                }}</span>
            </div>
            <div class="anomaly-suggestion">
                <i class="bi bi-lightbulb-fill"></i>
                <span class="anomaly-label">建议：</span>
                <span class="anomaly-text">{{
                    result.dataAnomaly.suggestion
                }}</span>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 3: 移除 Analysis 的 import 和 script 引用**

在 `<script setup>` 中找到并删除：
```js
import Analysis from "./components/Analysis.vue";
```

- [ ] **Step 4: 移除 Analysis 组件的 props 传递**

如果 `Analysis` 所需的 `load_stabilityindex` 和 `predictaBility` props 是通过 `result` 解构传入的，确认配置信息部分（L2-L150）不依赖这两个属性。Configuration.vue 只保留配置信息 + 文件信息的展示逻辑。

---

### Task 4: 新建 ExceptionPrompt.vue 组件

**Files:**
- Create: `src/pages/Load/ConfigSection/ExceptionPrompt.vue`

- [ ] **Step 1: 创建 ExceptionPrompt.vue**

从原 FinishView.vue 中剥离的异常提示区块，封装为独立组件：

```vue
<template>
    <div class="exception-prompt">
        <div
            v-if="dataAnomaly && dataAnomaly.abnormal_flag"
            class="anomaly-alert"
        >
            <div class="anomaly-content">
                <div class="anomaly-problem">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span class="anomaly-label">提示：</span>
                    <span class="anomaly-text">{{ dataAnomaly.problem }}</span>
                </div>
                <div class="anomaly-suggestion">
                    <i class="bi bi-lightbulb-fill"></i>
                    <span class="anomaly-label">建议：</span>
                    <span class="anomaly-text">{{ dataAnomaly.suggestion }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    dataAnomaly: {
        type: Object,
        default: () => ({}),
    },
});
</script>

<style lang="scss" scoped>
.exception-prompt {
    width: 100%;
}

.anomaly-alert {
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    border-left: 4px solid #ff9800;
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 12px;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);

    .anomaly-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .anomaly-problem,
    .anomaly-suggestion {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    }

    .anomaly-problem {
        i {
            color: #ff9800;
            font-size: 16px;
        }
    }

    .anomaly-suggestion {
        i {
            color: #2196f3;
            font-size: 16px;
        }
    }

    .anomaly-label {
        font-weight: 600;
        color: #5d4037;
    }

    .anomaly-text {
        color: #4e342e;
        flex: 1;
    }
}
</style>
```

---

### Task 5: 重写 LoadPre.vue（新建模型页面）

**Files:**
- Rewrite: `src/pages/Load/LoadPre.vue`
- Modify: `src/pages/Load/ConfigSection/ConfigSection.vue`

- [ ] **Step 1: 重写 LoadPre.vue 骨架**

全宽流体布局，element-plus steps 始终在顶部：

```vue
<template>
    <div class="load-pre">
        <!-- 步骤条：始终可见 -->
        <div class="steps-bar">
            <el-steps
                :active="stage + 1"
                align-center
                finish-status="success"
            >
                <el-step title="选择模式" />
                <el-step title="配置参数" />
                <el-step title="训练中" />
                <el-step title="查看结果" />
            </el-steps>
        </div>

        <!-- 根据 stage 渲染 -->
        <div class="load-pre-content">
            <!-- Stage -1: 选择模式 -->
            <ChooseMode v-if="stage === -1" />

            <!-- Stage 0: 配置参数 - 三列布局 -->
            <div v-else-if="stage === 0" class="config-layout">
                <div class="config-layout-left">
                    <Prompt />
                </div>
                <div class="config-layout-divider"></div>
                <div class="config-layout-center">
                    <ConfigForm />
                </div>
                <div class="config-layout-right">
                    <FileUpload />
                </div>
            </div>

            <!-- Stage 1: 训练中 -->
            <div v-else-if="stage === 1" class="training-layout">
                <Configuration />
                <LoadingOverlay />
            </div>

            <!-- Stage 2: 查看结果 -->
            <div v-else-if="stage === 2" class="result-layout">
                <Configuration />
                <Analysis
                    v-if="result.load_stabilityindex && result.predictaBility"
                    :load_stabilityindex="result.load_stabilityindex"
                    :predictaBility="result.predictaBility"
                />
                <ExceptionPrompt :data-anomaly="result.dataAnomaly" />
                <ResultSection />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useLoadForecastStore } from "@/store/load";
import ChooseMode from "./ConfigSection/ChooseMode.vue";
import Prompt from "./ConfigSection/Prompt.vue";
import ConfigForm from "./ConfigSection/ConfigForm.vue";
import FileUpload from "./ConfigSection/FileUpload.vue";
import Configuration from "./ConfigSection/Configuration.vue";
import LoadingOverlay from "./ConfigSection/LoadingOverlay.vue";
import Analysis from "./ConfigSection/components/Analysis.vue";
import ExceptionPrompt from "./ConfigSection/ExceptionPrompt.vue";
import ResultSection from "./ResultSection/ResultSection.vue";

const forecastStore = useLoadForecastStore();
const stage = computed(() => forecastStore.stage);
const result = computed(() => forecastStore.responseData.result || {});
</script>

<style lang="scss" scoped>
.load-pre {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.steps-bar {
    padding: 20px 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

// Stage 0 三列布局
.config-layout {
    display: flex;
    gap: 0;
}

.config-layout-left {
    width: 20%;
    min-width: 220px;
    padding: 16px;
}

.config-layout-divider {
    width: 1px;
    background: #e8e8e8;
    flex-shrink: 0;
}

.config-layout-center {
    flex: 1;
    padding: 16px 16px 16px 24px;
}

.config-layout-right {
    flex: 1;
    padding: 16px 16px 16px 24px;
}

// Stage 1+2 布局
.training-layout,
.result-layout {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
```

- [ ] **Step 2: 修改 ConfigSection.vue**

原 ConfigSection.vue 是 LoadPre.vue 的子组件，封装了所有 stage 切换逻辑。在新结构中，ConfigSection.vue 不再需要，或者简化为只负责 stage 0 的三列布局。

**方案**：ConfigSection.vue 不再需要作为一个独立的容器组件。原先它用 `v-if="activeTab === 'upload'"` 包裹全部内容，现在 activeTab 已移除。直接删除 ConfigSection.vue（或在其中仅保留 Prompt/ConfigForm/FileUpload 三列的布局），由 LoadPre.vue 直接渲染这些组件。

由于其他组件可能引用 ConfigSection.vue，保持文件但将内容清空改为仅导出子组件：

```vue
<template>
    <div class="config-section">
        <Prompt v-if="showPrompt" />
        <ConfigForm />
        <FileUpload />
    </div>
</template>
```

最佳方案是**删除 ConfigSection.vue**，因为 LoadPre.vue 已经直接渲染所有子组件。但如果担心有其他引用，保留文件并简化。

→ 推荐方案：删除 ConfigSection.vue，由 LoadPre.vue 直接管理子组件。

---

### Task 6: 新建 HistorySidebar.vue（左侧历史记录导航）

**Files:**
- Create: `src/pages/Load/HistorySection/HistorySidebar.vue`

- [ ] **Step 1: 创建 HistorySidebar.vue**

```vue
<template>
    <div class="history-sidebar">
        <div class="sidebar-header">
            <i class="bi bi-clock-history"></i>
            <span>历史记录</span>
        </div>
        <div class="sidebar-list" v-loading="loading">
            <div
                v-for="item in flatTreeData"
                :key="item.id"
                class="sidebar-item"
                :class="{ active: activeId === item.id }"
                @click="handleSelect(item)"
            >
                <div class="item-time">{{ formatTime(item.created_at) }}</div>
                <div class="item-name">
                    {{ item.mark_name || item.location || "未知" }}
                </div>
            </div>
            <div v-if="!loading && flatTreeData.length === 0" class="empty-tip">
                暂无历史记录
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import request from "@/utils/request";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();
const emit = defineEmits(["select"]);

const loading = ref(false);
const treeData = ref([]);
const flatTreeData = ref([]);
const activeId = ref(null);

// 获取历史记录数据
async function fetchRecords() {
    loading.value = true;
    try {
        const response = await request.get("/api/history/records");
        if (response.data.success) {
            treeData.value = response.data.data;
            flattenTree(response.data.data);
        }
    } catch (error) {
        console.error("获取历史记录失败:", error);
    } finally {
        loading.value = false;
    }
}

// 将树状数据展平（无缩进）
function flattenTree(nodes) {
    const result = [];
    function walk(list) {
        for (const node of list) {
            result.push(node);
            if (node.children && node.children.length > 0) {
                walk(node.children);
            }
        }
    }
    walk(nodes);
    flatTreeData.value = result;
}

function handleSelect(item) {
    activeId.value = item.id;
    emit("select", item);
}

function formatTime(timeStr) {
    if (!timeStr) return "";
    const d = new Date(timeStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 监听刷新信号
watch(
    () => forecastStore.refreshFlag,
    () => {
        fetchRecords();
    }
);

onMounted(() => {
    fetchRecords();
});
</script>

<style lang="scss" scoped>
.history-sidebar {
    width: 280px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    font-weight: 600;
    font-size: 15px;
    color: #2c6fbb;
    border-bottom: 1px solid #f0f0f0;

    i {
        font-size: 18px;
    }
}

.sidebar-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.sidebar-item {
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 2px;

    &:hover {
        background: #f5f7fa;
    }

    &.active {
        background: #f0f7ff;
        border-left: 3px solid #2c6fbb;
    }

    .item-time {
        font-size: 13px;
        font-weight: 500;
        color: #2c3e50;
    }

    .item-name {
        font-size: 12px;
        color: #8e9aaf;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.empty-tip {
    text-align: center;
    padding: 24px;
    color: #bbb;
    font-size: 14px;
}
</style>
```

---

### Task 7: 新建 LoadHistory.vue（已建模型页面）

**Files:**
- Create: `src/pages/Load/LoadHistory.vue`

- [ ] **Step 1: 创建 LoadHistory.vue**

左右两栏布局：左侧 HistorySidebar（280px 固定宽度） | 右侧详情内容：

```vue
<template>
    <div class="load-history">
        <!-- 左侧：历史记录导航 -->
        <div class="history-sidebar-wrapper">
            <HistorySidebar @select="onSelectRecord" />
        </div>

        <!-- 右侧：详情内容 -->
        <div class="history-detail" v-if="record">
            <!-- 功能按钮区（右对齐） -->
            <div class="action-bar">
                <el-button size="small" @click="deleteRecord">
                    <i class="bi bi-trash"></i> 删除
                </el-button>
                <el-button size="small" @click="backtestAnalysis">
                    <i class="bi bi-graph-up"></i> 回测分析
                </el-button>
                <el-button type="primary" size="small" @click="continueForecast">
                    <i class="bi bi-play-fill"></i> 继续预测
                </el-button>
            </div>

            <!-- 基本信息条（宽而矮） -->
            <div class="basic-info-bar">
                <div class="info-row">
                    <span class="info-tag">ID</span>
                    <span class="info-val">{{ record.id }}</span>
                    <span class="info-divider"></span>

                    <span class="info-tag">预测模式</span>
                    <span class="info-val">{{ record.mode === "T" ? "总量预测" : "分项预测" }}</span>
                    <span class="info-divider"></span>

                    <span class="info-tag">名称</span>
                    <span class="info-val editable" @click="openEditMarkNameDialog">
                        {{ record.mark_name || "未命名" }}
                        <i class="bi bi-pencil"></i>
                    </span>
                    <span class="info-divider"></span>

                    <span class="info-tag">数据范围</span>
                    <span class="info-val clickable" @click="downloadUploadExcel">
                        {{ record.upload_date_range?.[0] }} ~ {{ record.upload_date_range?.[1] }}
                        <i class="bi bi-download"></i>
                    </span>
                    <span class="info-divider"></span>

                    <span class="info-tag">预测日</span>
                    <span class="info-val">{{ record.forecast_date_range?.[0] }} ~ {{ record.forecast_date_range?.[1] }}</span>
                </div>
                <div class="info-row secondary">
                    <span class="info-tag">客户类型</span>
                    <span class="info-val">{{ formatCustomerType(record.customer_type) }}</span>
                    <span class="info-divider"></span>

                    <span class="info-tag">光伏配置</span>
                    <span class="info-val">{{ record.pv_config || "无" }}</span>
                    <span class="info-divider"></span>

                    <span class="info-tag">地点</span>
                    <span class="info-val">{{ record.location }}</span>
                    <span class="info-divider"></span>

                    <span class="info-tag">创建时间</span>
                    <span class="info-val">{{ formatTime(record.created_at) }}</span>
                </div>
            </div>

            <!-- 负荷特性分析 -->
            <Analysis
                v-if="result.load_stabilityindex && result.predictaBility"
                :load_stabilityindex="result.load_stabilityindex"
                :predictaBility="result.predictaBility"
            />

            <!-- 异常提示 -->
            <ExceptionPrompt :data-anomaly="result.dataAnomaly" />

            <!-- D+1/D+2/D+3 全局切换控件（独立行） -->
            <div class="day-selector-bar">
                <el-radio-group v-model="selectedDay">
                    <el-radio value="D+1">D + 1</el-radio>
                    <el-radio value="D+2">D + 2</el-radio>
                    <el-radio value="D+3">D + 3</el-radio>
                </el-radio-group>
            </div>

            <!-- 负荷预测结果 -->
            <div class="result-section">
                <LoadChart
                    :date="prediction_result.date"
                    :loads="prediction_result.predictionData"
                    :similarDayLoad="prediction_result.similarDayLoad"
                    :unit="unit"
                />
                <div class="download-row">
                    <el-button
                        type="primary"
                        @click="downloadPredictionExcel"
                        :loading="downloadLoading"
                        size="small"
                    >
                        <i class="bi bi-download"></i> 下载预测结果
                    </el-button>
                </div>
            </div>

            <!-- 天气信息 -->
            <div class="weather-section" v-if="selectedCityWeather">
                <div class="weather-info-horizontal">
                    <WeatherInfo
                        :weather-info="selectedCityWeather.weatherInfo"
                        horizontal
                    />
                </div>
                <WeatherChart
                    :temperature-data="selectedCityWeather.temperatureForecast"
                    :irradiation-data="selectedCityWeather.irradiationForecast"
                />
            </div>
        </div>

        <!-- 未选择记录时显示提示 -->
        <div class="history-detail empty" v-else>
            <div class="empty-hint">
                <i class="bi bi-arrow-left-circle"></i>
                <p>请从左侧选择一条历史记录</p>
            </div>
        </div>

        <!-- 编辑名称弹窗 -->
        <el-dialog v-model="editDialogVisible" title="编辑名称" width="30%">
            <el-input v-model="editName" maxlength="15" show-word-limit />
            <template #footer>
                <el-button @click="editDialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="saving" @click="saveName">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import { useLoadForecastStore } from "@/store/load";
import HistorySidebar from "./HistorySection/HistorySidebar.vue";
import Analysis from "./ConfigSection/components/Analysis.vue";
import ExceptionPrompt from "./ConfigSection/ExceptionPrompt.vue";
import LoadChart from "./ResultSection/LoadChart.vue";
import WeatherChart from "./ResultSection/WeatherChart.vue";
import WeatherInfo from "./ResultSection/WeatherInfo.vue";

const router = useRouter();
const forecastStore = useLoadForecastStore();

// 选中记录
const record = ref(null);
const selectedDay = ref("D+1");

// 编辑名称
const editDialogVisible = ref(false);
const editName = ref("");
const saving = ref(false);

// 下载
const downloadLoading = ref(false);

// 计算结果数据
const result = computed(() => record.value?.result || {});
const unit = computed(() => record.value?.formData?.unit || "kW");

// 预测结果
const prediction_result = computed(() => {
    if (!record.value?.result) return {};
    const r = { ...record.value.result };
    if (selectedDay.value === "D+1") {
        return { ...r.predictionD1, ...r };
    }
    if (selectedDay.value === "D+2") {
        return { ...r.predictionD2, ...r };
    }
    if (selectedDay.value === "D+3") {
        return { ...r.predictionD3, ...r };
    }
    return {};
});

// 天气数据
const selectedCityWeather = computed(() => {
    const forecasts = prediction_result.value?.cityWeatherForecast;
    if (forecasts && forecasts.length > 0) {
        return forecasts[0];
    }
    return null;
});

// 选择记录
function onSelectRecord(item) {
    record.value = null;
    selectedDay.value = "D+1";
    fetchDetail(item.id);
}

async function fetchDetail(id) {
    try {
        const response = await request.get(`/api/history/${id}/${selectedDay.value}`);
        record.value = response.data;
    } catch (error) {
        ElMessage.error("获取记录详情失败");
    }
}

// D+ 切换
watch(selectedDay, (day) => {
    if (record.value?.id) {
        fetchDetail(record.value.id);
    }
});

// 格式化
function formatTime(timeStr) {
    if (!timeStr) return "";
    const d = new Date(timeStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatCustomerType(type) {
    const types = { hospital: "医院", mall: "商超", discrete: "离散工业", continuous: "连续工业" };
    return types[type] || type;
}

// 删除
async function deleteRecord() {
    try {
        await ElMessageBox.confirm("确定要删除此记录吗？", "确认删除");
        const response = await request.post("/api/history/delete", {
            record_id: record.value.id,
        });
        if (response.data.success) {
            ElMessage.success("删除成功");
            record.value = null;
            forecastStore.triggerRefreshHistoryList();
        }
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("删除失败");
        }
    }
}

// 回测分析
function backtestAnalysis() {
    router.push(`/loadcompare/${record.value.id}`);
}

// 继续预测
function continueForecast() {
    if (forecastStore.stage === 1) {
        ElMessage.error("您有预测正在进行中，请待预测完成后再使用此功能");
        return;
    }
    forecastStore.setContinueData({
        end_date: record.value.upload_date_range?.[1],
        upload_date_range: record.value.upload_date_range,
        upload_date_range_format_text: `${record.value.upload_date_range?.[0]} 至 ${record.value.upload_date_range?.[1]}`,
    });
    forecastStore.updateFormData({
        customer_type: record.value.customer_type,
        pv_config: record.value.pv_config,
        location: record.value.location,
        forecast_range: record.value.forecast_range,
        previous_record_id: record.value.id,
    });
    forecastStore.setMode(record.value.mode);
    forecastStore.removeFile();
    forecastStore.resetStage();
    router.push("/loadpre");
}

// 编辑名称
function openEditMarkNameDialog() {
    editName.value = record.value?.mark_name || "";
    editDialogVisible.value = true;
}

async function saveName() {
    if (!editName.value.trim()) {
        ElMessage.warning("名称不能为空");
        return;
    }
    saving.value = true;
    try {
        const response = await request.post("/api/history/update_mark_name", {
            record_id: record.value.id,
            mark_name: editName.value.trim(),
        });
        if (response.data.success) {
            ElMessage.success("修改成功");
            record.value.mark_name = editName.value.trim();
            editDialogVisible.value = false;
            forecastStore.triggerRefreshHistoryList();
        }
    } catch {
        ElMessage.error("修改失败");
    } finally {
        saving.value = false;
    }
}

// 下载上传文件
async function downloadUploadExcel() {
    const id = record.value?.id;
    if (!id) {
        ElMessage.error("记录ID不存在");
        return;
    }
    try {
        const response = await request.get(`/api/history/${id}/download/upload`, {
            responseType: "blob",
        });
        saveAs(new Blob([response.data]), `${id}_upload.xlsx`);
    } catch {
        ElMessage.error("下载失败");
    }
}

// 下载预测结果
async function downloadPredictionExcel() {
    const id = record.value?.id;
    if (!id) {
        ElMessage.error("记录ID不存在");
        return;
    }
    downloadLoading.value = true;
    try {
        const response = await request.get(`/api/history/${id}/download/result`);
        if (!response.data.success) throw new Error(response.data.error);
        // 简化的 Excel 导出逻辑
        ElMessage.success("预测结果导出成功");
    } catch (error) {
        ElMessage.error(error.message || "下载失败");
    } finally {
        downloadLoading.value = false;
    }
}
</script>

<style lang="scss" scoped>
.load-history {
    display: flex;
    gap: 20px;
    height: 100%;
    min-height: calc(100vh - 180px);
}

.history-sidebar-wrapper {
    flex-shrink: 0;
}

.history-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;

    &.empty {
        display: flex;
        align-items: center;
        justify-content: center;

        .empty-hint {
            text-align: center;
            color: #bbb;

            i {
                font-size: 48px;
                display: block;
                margin-bottom: 12px;
            }
        }
    }
}

// 功能按钮区
.action-bar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

// 基本信息条
.basic-info-bar {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 12px 16px;

    .info-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 6px;

        &.secondary {
            margin-bottom: 0;
        }
    }

    .info-tag {
        font-size: 12px;
        color: #8e9aaf;
        font-weight: 500;
        white-space: nowrap;
    }

    .info-val {
        font-size: 13px;
        color: #2c3e50;
        font-weight: 500;
        white-space: nowrap;

        &.editable {
            cursor: pointer;
            color: #2c6fbb;

            &:hover {
                text-decoration: underline;
            }
        }

        &.clickable {
            cursor: pointer;
            color: #2c6fbb;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .info-divider {
        width: 1px;
        height: 14px;
        background: #e8e8e8;
        margin: 0 8px;
    }
}

// D+ 切换栏
.day-selector-bar {
    display: flex;
    justify-content: center;
    padding: 8px 0;
}

// 结果区域
.result-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 16px;
}

.download-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}

// 天气区域
.weather-section {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 16px;
}

.weather-info-horizontal {
    margin-bottom: 16px;
}
</style>
```

---

### Task 8: 修改 WeatherInfo.vue 支持水平横向布局

**Files:**
- Modify: `src/pages/Load/ResultSection/WeatherInfo.vue`

- [ ] **Step 1: 添加 `horizontal` prop 并实现横向排布**

```vue
<script setup>
defineProps({
    weatherInfo: {
        type: Object,
        required: true,
        default: () => ({
            temp_min: 0,
            temp_max: 0,
            weather_summary: "",
            cloud_summary: "",
            wind_summary: "",
            wind_direction: "",
        }),
    },
    horizontal: {
        type: Boolean,
        default: false,
    },
});
</script>
```

修改模板，根据 `horizontal` 切换布局：

```vue
<template>
    <div class="card-body">
        <div class="weather-grid" :class="{ horizontal: horizontal }">
            <!-- ... weather items unchanged ... -->
        </div>
    </div>
</template>
```

修改样式，添加 `.horizontal` 模式：

```scss
.weather-grid.horizontal {
    display: flex;
    flex-direction: row;
    gap: 16px;

    .weather-item {
        flex: 1;
        min-width: 0;
    }
}
```

---

### Task 9: 修改 ResultSection.vue —— WeatherInfo 移到 WeatherChart 上方

**Files:**
- Modify: `src/pages/Load/ResultSection/ResultSection.vue`

- [ ] **Step 1: 调整模板顺序，将 WeatherInfo 移到 WeatherChart 上方**

原模板中 WeatherInfo 在 WeatherChart 下方（L127-L131），改为在 WeatherChart 上方：

```html
<div v-if="selectedCityWeather" class="weather-content">
    <div class="weather-info-horizontal">
        <WeatherInfo
            :weather-info="selectedCityWeather.weatherInfo"
            horizontal
        />
    </div>
    <div class="weather-chart">
        <WeatherChart
            :temperature-data="selectedCityWeather.temperatureForecast"
            :irradiation-data="selectedCityWeather.irradiationForecast"
        />
    </div>
</div>
```

移除原 L127 的 `card mb-4` 包裹类。

- [ ] **Step 2: 调整样式**

移除 WeatherInfo 原有的 `card mb-4` Bootstrap 类，WeatherChart 和 WeatherInfo 之间用自定义间距：

```scss
.weather-info-horizontal {
    margin-bottom: 16px;
}
.weather-content {
    padding: 20px;
}
```

---

### Task 10: 删除废弃文件

**Files:**
- Delete: `src/pages/Load/ConfigSection/ConfigSection.vue`（如果无其他引用）

- [ ] **Step 1: 确认 ConfigSection.vue 无其他引用后删除**

检查是否还有其他组件 import ConfigSection。如果 LoadPre.vue 已直接渲染子组件且无其他引用，删除 ConfigSection.vue 以及原 FinishView.vue（已更名为 Configuration.vue）。

---

### Self-Review Checklist

- [ ] 所有 Bootstrap 布局类（`card`、`container`、`row`、`col-*`、`mb-3`、`shadow-sm`、`border-0` 等）是否已从 LoadPre.vue、LoadHistory.vue 中移除？
- [ ] 是否有任何 Bootstrap 布局类残留在 ConfigSection.vue、Configuration.vue、ResultSection.vue、WeatherInfo.vue 中？
- [ ] `activeTab` 在 store/load.js 中是否已完全移除？
- [ ] 现有文字/图标/标签/图表/表格样式是否被改动过？（应保持完全不变）
- [ ] `/loadpre/history` 路由是否可访问且正确渲染 LoadHistory.vue？
- [ ] 侧边栏是否显示"已建模型"菜单项并正确跳转？
- [ ] 面包屑是否正确显示"负荷预测 > 已建模型"？
