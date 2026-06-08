<template>
    <div class="history-sidebar">
        <div class="sidebar-header">
            <i class="bi bi-clock-history"></i>
            历史记录
        </div>
        <div class="sidebar-list">
            <el-tree
                :data="records"
                node-key="id"
                default-expand-all
                :props="treeProps"
                :current-node-key="activeHistoryRecordId"
                @node-click="handleNodeClick"
                :expand-on-click-node="false"
                :indent="0"
            >
                <template #default="{ data }">
                    <div class="sidebar-item">
                        <span class="item-time">{{ formatCreateTime(data.created_at) }}</span>
                        <span class="item-name">{{ data.mark_name || (data.location ? data.location.join('-') : `ID: ${data.id}`) }}</span>
                    </div>
                </template>
            </el-tree>
            <div v-if="records.length === 0" class="empty-state">
                <el-icon><FolderDelete /></el-icon>
                <span>暂无预测记录</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request";
import { FolderDelete } from "@element-plus/icons-vue";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();

const activeHistoryRecordId = computed(
    () => forecastStore.activeHistoryRecordId
);

const treeProps = {
    children: "children",
    label: "label",
};

const records = ref([]);

function fetchRecords() {
    request
        .get("/api/history")
        .then((response) => {
            records.value = response.data;
            if (!activeHistoryRecordId.value && records.value.length > 0) {
                const firstRootNode = records.value[0];
                forecastStore.set_activeHistoryRecordId(firstRootNode.id);
                forecastStore.set_activeHistoryRecord(firstRootNode);
            }
        })
        .catch((error) => {
            console.error("获取历史记录失败:", error);
        });
}

onMounted(() => {
    fetchRecords();
});

watch(
    () => forecastStore.refreshHistoryListFlag,
    () => {
        fetchRecords();
    }
);

const formatCreateTime = (dateString) => {
    return new Date(dateString).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

function handleNodeClick(node) {
    forecastStore.set_activeHistoryRecordId(node.id);
    forecastStore.set_activeHistoryRecord(node);
}
</script>

<style lang="scss" scoped>
.history-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #e4e7ed;

    .sidebar-header {
        padding: 16px 20px;
        font-size: 1rem;
        font-weight: 600;
        color: #2c6fbb;
        border-bottom: 1px solid #e4e7ed;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        i {
            font-size: 1.1rem;
        }
    }

    .sidebar-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
    }

    .sidebar-item {
        display: flex;
        flex-direction: column;
        padding: 8px 20px;
        gap: 2px;
        cursor: pointer;

        .item-time {
            font-size: 0.8rem;
            color: #909399;
            line-height: 1.3;
        }

        .item-name {
            font-size: 0.9rem;
            color: #303133;
            font-weight: 500;
            line-height: 1.4;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #c0c4cc;
        gap: 8px;

        .el-icon {
            font-size: 32px;
        }

        span {
            font-size: 0.9rem;
        }
    }
}

:deep(.el-tree-node__expand-icon) {
    color: #409eff;
    font-weight: bold;
    padding: 6px 4px;
    margin-left: 8px;

    &.expanded {
        transform: rotate(90deg);
    }
}

:deep(.el-tree-node__content) {
    height: auto !important;
}

:deep(.el-tree .is-current > .el-tree-node__content) {
    background-color: #f0f7ff;

    .item-name {
        color: #2c6fbb;
    }
}
</style>
