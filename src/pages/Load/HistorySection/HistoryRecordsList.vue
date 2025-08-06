<template>
    <div class="history-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="h5 text">
                <i class="bi bi-clock-history me-2"></i>历史记录
            </h2>
            <!-- <div class="search-box">
                <el-input
                    v-model="searchQuery"
                    placeholder="搜索历史记录..."
                    clearable
                    suffix-icon="Search"
                    style="width: 300px"
                />
            </div> -->
        </div>

        <!-- 处理中任务 -->
        <div
            class="record-list mb-4"
            v-if="props.processingTasks && props.processingTasks.length > 0"
        >
            <h5 class="mb-3">处理中任务</h5>
            <div class="processing-tasks">
                <div
                    v-for="(task, idx) in props.processingTasks"
                    :key="idx"
                    class="processing-task card mb-3"
                >
                    <div class="card-body">
                        <div
                            class="d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <div class="d-flex align-items-center mb-2">
                                    <div
                                        class="spinner-border spinner-border-sm text-primary me-2"
                                        role="status"
                                    ></div>
                                    <strong class="text-primary">{{
                                        dsds
                                    }}</strong>
                                </div>
                                <div class="text-muted small">
                                    开始时间:
                                    {{ task }}
                                </div>
                            </div>
                            <div class="text-end">
                                <div
                                    class="progress"
                                    style="width: 150px; height: 10px"
                                >
                                    <div
                                        class="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar"
                                        :style="{
                                            width: '50%',
                                        }"
                                    ></div>
                                </div>
                                <div class="small text-muted mt-1">
                                    {{ 50 }}% 完成
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 表头 -->
        <div class="table-header">
            <div class="col-id">ID</div>
            <div class="col-date">创建时间</div>
            <div class="col-location">位置</div>
            <div class="col-type">客户类型</div>
            <div class="col-range">预测范围</div>
            <div class="col-upload">上传日期范围</div>
            <div class="col-prediction">预测日期</div>
            <div class="col-actions">操作</div>
        </div>
        <!-- 树状列表 -->
        <el-tree
            :data="filteredRecords"
            node-key="id"
            default-expand-all
            :props="treeProps"
            ref="treeRef"
            :current-node-key="activeHistoryRecordId"
            :highlight-current="false"
            @node-click="handleNodeClick"
            :expand-on-click-node="false"
        >
            <template #default="{ node, data }">
                <div class="node-row">
                    <div class="col-id">
                        <span
                            class="status-indicator"
                            :class="
                                data.previous_record_id
                                    ? 'status-inactive'
                                    : 'status-active'
                            "
                        ></span>
                        {{ data.id }}
                    </div>
                    <div class="col-date">
                        {{ new Date(data.created_at).toLocaleString() }}
                    </div>
                    <!-- 位置列：仅根节点显示 -->
                    <div class="col-location">
                        <template v-if="node.level == 1">
                            {{ data.location.join("-") }}
                        </template>
                        <template v-else>-</template>
                    </div>
                    <!-- 客户类型列：仅根节点显示 -->
                    <div class="col-type">
                        <template v-if="node.level == 1">
                            <span
                                size="small"
                                class="customer-badge"
                                :class="'customer-' + data.customer_type"
                            >
                                {{ formatCustomerType(data.customer_type) }}
                            </span>
                        </template>
                        <template v-else>-</template>
                    </div>
                    <!-- 预测范围列：仅根节点显示 -->
                    <div class="col-range">
                        <template v-if="node.level == 1">
                            <span class="range-badge">
                                {{
                                    data.forecast_range === "4days"
                                        ? "D-4 → D+1"
                                        : "D-1 → D+1"
                                }}
                            </span>
                        </template>
                        <template v-else>-</template>
                    </div>
                    <div class="col-upload">
                        {{
                            data.upload_date_range &&
                            data.upload_date_range.length
                                ? data.upload_date_range.join(" 至 ")
                                : "未知"
                        }}
                    </div>
                    <div class="col-prediction">
                        <el-tag type="success">
                            {{ data.prediction_date }}
                        </el-tag>
                    </div>
                    <!-- 操作列：仅叶子节点显示删除按钮（添加.stop阻止事件冒泡）-->
                    <div class="col-actions">
                        <template v-if="node.isLeaf">
                            <el-button
                                size="small"
                                type="danger"
                                :icon="Delete"
                                circle
                                @click.stop="deleteRecord(data)"
                            ></el-button>
                        </template>
                    </div>
                </div>
            </template>
        </el-tree>

        <div v-if="filteredRecords.length === 0" class="empty-state">
            <el-icon><FolderDelete /></el-icon>
            <h3>暂无预测记录</h3>
            <p>当前没有找到匹配的预测记录，请尝试调整筛选条件</p>
        </div>
        <!--- END --->
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useLoadPreStageStore } from "@/store/loadpreStageStore";

const stageStore = useLoadPreStageStore();
const activeHistoryRecordId = computed(() => stageStore.activeHistoryRecordId); //用户选中的某条负荷预测记录

/* --------------------------- 正在执行的任务 -------------------------- */
// 新增处理中任务列表
const props = defineProps({
    processingTasks: Array,
});

const treeProps = {
    children: "children",
    label: "label",
};
const treeRef = ref(null);

const records = ref([]);

function fetchRecords() {
    request
        .get("/api/history")
        .then((response) => {
            records.value = response.data; // 假设后端返回的数据格式与模拟数据一致
        })
        .catch((error) => {
            console.error("获取历史记录失败:", error);
        });
}

onMounted(() => {
    fetchRecords();
});

const filteredRecords = computed(() => {
    return records.value; // 实际项目中根据搜索条件过滤
});

const formatCustomerType = (type) => {
    const types = {
        hospital: "医院",
        mall: "商超",
        discrete: "离散工业",
        continuous: "连续工业",
    };
    return types[type] || type;
};

const getCustomerTagType = (type) => {
    const types = {
        hospital: "success",
        mall: "warning",
        discrete: "",
        continuous: "danger",
    };
    return types[type] || "";
};

const searchQuery = ref("");

function handleNodeClick(node) {
    stageStore.set_activeHistoryRecordId(node.id); // 设置当前选中节点
}

// 删除历史记录
async function deleteRecord(record) {
    const recordId = record.id; // 假设记录有一个唯一的ID字段
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法删除");
        return;
    }
    try {
        const response = await request.delete(`/api/history/${recordId}`);

        if (response.data.success) {
            ElMessage.success(response.data.message);
            // 刷新历史记录列表
            fetchRecords();
            // 如果删除的这条刚好是用户当前选中的，重置选中的记录为null
            if (record.id == activeHistoryRecordId.value) {
                stageStore.set_activeHistoryRecordId(null); // 设置当前选中节点
            }
        } else {
            ElMessage.error("删除记录失败");
        }
    } catch (error) {
        ElMessage.error("删除记录请求失败");
        console.error("删除记录失败:", error);
    }
}
</script>

<style lang="scss" scoped>
.history-section {
    max-height: 400px;
    overflow-y: scroll;
    padding: 10px;
    .text {
        color: #2c6fbb;
    }
}
.record-list {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.processing-tasks {
    .processing-task {
        border-left: 4px solid #0d6efd;
    }
}
/* 树状列表样式 */
.table-header {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 15px;
    background-color: #f5f7fa;
    border: 1px solid #ebeef5;
    border-radius: 4px 4px 0 0;
    font-weight: bold;
    color: #606266;

    > div {
        flex-shrink: 0;
        padding: 0 8px;
    }

    .col-id {
        flex: 0 0 120px;
    }

    .col-date {
        flex: 0 0 160px;
    }

    .col-location {
        flex: 0 0 180px;
    }

    .col-type {
        flex: 0 0 100px;
    }

    .col-range {
        flex: 0 0 120px;
    }

    .col-upload {
        flex: 0 0 220px;
    }

    .col-prediction {
        flex: 0 0 120px;
    }

    .col-actions {
        flex: 0 0 150px;
    }
}
.node-row {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;

    > div {
        flex-shrink: 0;
        padding: 0 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .col-id {
        flex: 0 0 100px;
        display: flex;
        align-items: center;
        gap: 6px;

        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .status-active {
            background-color: #52c41a; // 绿色表示活跃
        }

        .status-inactive {
            background-color: #bfbfbf; // 灰色表示非活跃
        }
    }

    .col-date {
        flex: 0 0 160px;
    }

    .col-location {
        flex: 0 0 180px;
    }

    .col-type {
        flex: 0 0 100px;
        .customer-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 12px;
        }

        .customer-mall {
            background-color: rgba(155, 89, 182, 0.1);
            color: #9b59b6;
        }

        .customer-discrete {
            background-color: rgba(52, 152, 219, 0.1);
            color: #3498db;
        }

        .customer-continuous {
            background-color: rgba(46, 204, 113, 0.1);
            color: #2ecc71;
        }
    }

    .col-range {
        flex: 0 0 120px;

        .range-badge {
            background-color: #e6f7ff;
            color: #1890ff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
    }

    .col-upload {
        flex: 0 0 220px;
    }

    .col-prediction {
        flex: 0 0 120px;
    }

    .col-actions {
        flex: 0 0 150px;
        display: flex;
        gap: 8px;
    }
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #999;

    .el-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #ccc;
    }

    h3 {
        margin: 0 0 8px;
        font-weight: normal;
        color: #666;
    }

    p {
        font-size: 14px;
    }
}

// 隐藏默认树节点前的箭头（可选）
:deep(.el-tree-node__expand-icon) {
    color: #409eff;
    font-weight: bold;
    padding: 6px 0 !important;
    margin-left: 8px !important;

    &.expanded {
        transform: rotate(90deg);
    }
}

// 自定义树节点样式
:deep(.el-tree-node__content) {
    height: auto !important;
    // padding: 0 !important;
}
/* 自定义高亮样式 */
:deep(.el-tree .is-current > .el-tree-node__content) {
    background-color: #f0f7ff;
    font-weight: bold;
}
</style>
