<template>
    <div class="node-tree-container">
        <div class="tree-header">
            <i class="bi bi-diagram-3"></i>
            <h3>节点列表</h3>
        </div>

        <div class="search-box">
            <el-input
                v-model="query"
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
            <!-- 使用 Tree V2 虚拟化树形控件 -->
            <el-tree-v2
                ref="treeRef"
                :data="props.nodes"
                :height="treeHeight"
                :props="defaultProps"
                :filter-method="filterMethod"
                :highlight-current="true"
                @node-click="handleNodeClick"
                class="price-nodetree"
                :default-expanded-keys="['440000']"
                :current-node-key="cur_node_id"
                :item-size="40"
            >
                <template #default="{ node, data }">
                    <div class="custom-tree-node">
                        <i :class="getNodeIcon(data)" class="node-icon"></i>
                        <span class="node-label">{{
                            node.data.treeNodeName
                        }}</span>
                        <span v-if="isLeaf(data)" class="node-price">
                            <i class="bi bi-currency-dollar"></i>
                        </span>
                    </div>
                </template>
            </el-tree-v2>
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
import {
    ref,
    computed,
    watch,
    nextTick,
    defineProps,
    defineEmits,
    onMounted,
    onUnmounted,
} from "vue";

const props = defineProps({
    nodes: {
        type: Array,
        default: () => [],
    },
    cur_node_id: {
        type: String,
    },
});

const query = ref(""); //过滤查询框输入内容

const emit = defineEmits(["node-select"]);

// 响应式数据
const treeRef = ref(null);
const treeHeight = ref(500);

// 树配置
const defaultProps = {
    children: "children",
    label: "treeNodeName",
    value: "treeNodeId",
};

const totalNodes = computed(() => {
    let count = 0;
    const countNodes = (nodes) => {
        nodes.forEach((node) => {
            count++;
            if (node.children && node.children.length > 0) {
                countNodes(node.children);
            }
        });
    };
    countNodes(props.nodes);
    return count;
});

// Tree V2 的过滤方法
function filterMethod(value, data) {
    if (!value) return true;
    return data.treeNodeName.toLowerCase().includes(value.toLowerCase());
}

function handleSearch(query) {
    nextTick(() => {
        if (treeRef.value) {
            treeRef.value.filter(query);
        }
    });
}

//当节点被点击
function handleNodeClick(data) {
    // 只有叶子节点才触发选择事件
    if (isLeaf(data)) {
        emit("node-select", {
            id: data.treeNodeId,
            name: data.treeNodeName,
        });
    }
}

function getNodeIcon(data) {
    if (isLeaf(data)) {
        return "bi bi-lightning-charge-fill";
    } else if (data.parentPkId === "0") {
        return "bi bi-geo-alt-fill";
    } else {
        return "bi bi-folder-fill";
    }
}

function isLeaf(data) {
    return data.leaf === 1 || data.nodeType === "1";
}

// 动态计算树的高度
function updateTreeHeight() {
    nextTick(() => {
        const container = document.querySelector(".node-tree-container");
        if (container) {
            const header = container.querySelector(".tree-header");
            const searchBox = container.querySelector(".search-box");
            const footer = container.querySelector(".tree-footer");

            if (header && searchBox && footer) {
                const containerHeight = container.clientHeight;
                const headerHeight = header.offsetHeight;
                const searchBoxHeight = searchBox.offsetHeight;
                const footerHeight = footer.offsetHeight;

                treeHeight.value =
                    containerHeight -
                    headerHeight -
                    searchBoxHeight -
                    footerHeight -
                    20 -
                    32; //32是.left-panel的上下padding之和（16px*2）
            }
        }
    });
}

onMounted(() => {
    updateTreeHeight();
    window.addEventListener("resize", updateTreeHeight);
});

onUnmounted(() => {
    window.removeEventListener("resize", updateTreeHeight);
});
</script>

<style lang="scss">
.el-tree-node {
    height: 40px !important;
}
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
            padding-right: 15px;
        }
    }
}
.el-tree-node {
    &.is-current {
        .el-tree-node__content {
            background-color: #409eff !important;

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
</style>
<style scoped lang="scss">
.custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;
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
.el-tree__node {
    margin: 4px 0;

    .el-tree__node-content {
        height: 40px;
        border-radius: 8px;
        transition: all 0.3s ease;
        padding: 0 8px;

        &:hover {
            background-color: #f0f7ff;
        }

        .el-tree__checkbox {
            margin-right: 8px;
        }

        .el-tree__node-content-inner {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
        }
    }

    &.is-current {
        .el-tree-v2__node-content {
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

        // Tree V2 样式 - 保持与原来完全一致
        :deep(.el-tree-v2) {
            background: transparent;
            height: 100%;

            .el-tree-v2__empty {
                padding: 20px;
                text-align: center;
                color: #999;
            }

            .el-tree__list {
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

// 滚动条样式 - 保持与原来完全一致
:deep(.el-tree-v2__list)::-webkit-scrollbar {
    width: 6px;
}

:deep(.el-tree-v2__list)::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

:deep(.el-tree-v2__list)::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
        background: #a8a8a8;
    }
}
</style>
