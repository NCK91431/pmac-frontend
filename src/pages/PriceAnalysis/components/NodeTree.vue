<template>
    <div class="node-tree-container">
        <div class="tree-header">
            <i class="bi bi-diagram-3"></i>
            <h3>节点列表</h3>
        </div>

        <div class="search-box">
            <el-input
                v-model="filterText"
                placeholder="搜索节点名称"
                clearable
                @input="handleSearch"
            >
                <template #prefix>
                    <i class="bi bi-search"></i>
                </template>
            </el-input>
        </div>

        <div class="tree-wrapper">
            <el-tree
                ref="treeRef"
                :data="filteredTreeData"
                node-key="value"
                :props="defaultProps"
                :filter-node-method="filterNode"
                :default-expand-all="true"
                :highlight-current="true"
                @node-click="handleNodeClick"
            >
                <template #default="{ node, data }">
                    <span class="custom-tree-node">
                        <i :class="getNodeIcon(data)" class="node-icon"></i>
                        <span class="node-label">{{ node.label }}</span>
                        <span v-if="isLeaf(data)" class="node-price">
                            <i class="bi bi-currency-dollar"></i>
                        </span>
                    </span>
                </template>
            </el-tree>
        </div>

        <div class="tree-footer">
            <div class="stats">
                <i class="bi bi-info-circle"></i>
                <span>共 {{ totalNodes }} 个节点</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
    nodes: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["node-select"]);

// 响应式数据
const filterText = ref("");
const treeRef = ref(null);

// 树配置
const defaultProps = {
    children: "children",
    label: "label",
};

// 计算属性
const filteredTreeData = computed(() => {
    if (!filterText.value) return props.nodes;
    return filterTreeData([...props.nodes]);
});

const totalNodes = computed(() => {
    let count = 0;
    const countNodes = (nodes) => {
        nodes.forEach((node) => {
            count++;
            if (node.children) {
                countNodes(node.children);
            }
        });
    };
    countNodes(props.nodes);
    return count;
});

// 方法
function filterTreeData(nodes) {
    return nodes.filter((node) => {
        if (node.label.toLowerCase().includes(filterText.value.toLowerCase())) {
            return true;
        }
        if (node.children) {
            const filteredChildren = filterTreeData(node.children);
            if (filteredChildren.length > 0) {
                node.children = filteredChildren;
                return true;
            }
        }
        return false;
    });
}

function filterNode(value, data) {
    if (!value) return true;
    return data.label.toLowerCase().includes(value.toLowerCase());
}

function handleSearch() {
    nextTick(() => {
        if (treeRef.value) {
            treeRef.value.filter(filterText.value);
        }
    });
}

function handleNodeClick(data) {
    if (data.children) return; // 不触发非叶子节点
    emit("node-select", data.label);
}

function getNodeIcon(data) {
    if (!data.children) {
        return "bi bi-lightning-charge-fill";
    } else if (data.label === "广东省") {
        return "bi bi-geo-alt-fill";
    } else {
        return "bi bi-folder-fill";
    }
}

function isLeaf(data) {
    return !data.children || data.children.length === 0;
}

// 监听过滤文本变化
watch(filterText, handleSearch);
</script>

<style scoped lang="scss">
.node-tree-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .tree-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eaeaea;

        i {
            color: #409eff;
            font-size: 20px;
        }

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
        }
    }

    .search-box {
        margin-bottom: 16px;

        :deep(.el-input__wrapper) {
            border-radius: 20px;
            padding: 6px 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            &:hover {
                box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
            }
        }
    }

    .tree-wrapper {
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;

        :deep(.el-tree) {
            background: transparent;

            .el-tree-node {
                margin: 4px 0;

                .el-tree-node__content {
                    height: 40px;
                    border-radius: 8px;
                    transition: all 0.3s ease;

                    &:hover {
                        background-color: #f0f7ff;
                    }

                    .custom-tree-node {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        padding: 4px 0;

                        .node-icon {
                            margin-right: 8px;
                            font-size: 16px;
                            flex-shrink: 0;
                        }

                        .node-label {
                            flex: 1;
                            font-size: 14px;
                            color: #2c3e50;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .node-price {
                            color: #67c23a;
                            font-size: 12px;
                            opacity: 0.7;
                        }
                    }
                }

                &.is-current {
                    > .el-tree-node__content {
                        background-color: #409eff;

                        .node-icon,
                        .node-label {
                            color: white;
                        }

                        .node-price {
                            color: #ffd700;
                            opacity: 1;
                        }
                    }
                }
            }
        }
    }

    .tree-footer {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #eaeaea;

        .stats {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #7d8ca1;

            i {
                font-size: 14px;
            }
        }
    }
}

// 滚动条样式
:deep(.el-tree)::-webkit-scrollbar {
    width: 6px;
}

:deep(.el-tree)::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

:deep(.el-tree)::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
        background: #a8a8a8;
    }
}
</style>
