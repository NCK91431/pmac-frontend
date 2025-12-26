<template>
    <div class="price-analysis-container" :style="containerStyle">
        <div class="analysis-content">
            <!-- 左侧：节点树 -->
            <div class="left-panel">
                <NodeTree
                    :nodes="nodeTreeData"
                    @node-select="handleNodeSelect"
                    :cur_node_id="cur_node_id"
                />
            </div>

            <!-- 中间：图表区域 -->
            <div class="middle-panel">
                <div class="chart-controls">
                    <div class="date-picker-container">
                        <i class="bi bi-calendar"></i>
                        <el-date-picker
                            v-model="selectedDate"
                            type="date"
                            placeholder="选择日期"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            @change="handleDateChange"
                        />
                    </div>
                    <div class="chart-info">
                        <span class="selected-node">
                            <i class="bi bi-node-plus"></i> 当前节点：{{
                                nav_text
                            }}
                        </span>
                    </div>
                </div>

                <div class="chart-container">
                    <div
                        v-loading="chartLoading"
                        element-loading-text="图表数据加载中..."
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(255, 255, 255, 0.7)"
                        style="height: 100%; width: 100%"
                    >
                        <PriceChart
                            :dayAheadData="currentDayAheadData"
                            :realTimeData="currentRealTimeData"
                            :nodeName="selectedNodeName"
                        />
                    </div>
                </div>
            </div>

            <!-- 右侧：表格区域 -->
            <div class="right-panel">
                <div class="table-controls">
                    <div class="time-type-selector">
                        <i class="bi bi-clock"></i>
                        <el-radio-group
                            v-model="timeType"
                            @change="handleTimeTypeChange"
                        >
                            <el-radio-button label="hour"
                                >小时级</el-radio-button
                            >
                            <el-radio-button label="minute"
                                >分钟级</el-radio-button
                            >
                        </el-radio-group>
                    </div>
                    <el-button
                        type="primary"
                        plain
                        size="small"
                        @click="exportToExcel"
                        :loading="exportLoading"
                    >
                        <i class="bi bi-download"></i> 导出数据
                    </el-button>
                </div>

                <div class="table-container">
                    <div
                        v-loading="tableLoading"
                        element-loading-text="表格数据加载中..."
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="rgba(255, 255, 255, 0.7)"
                        style="height: 100%; width: 100%"
                    >
                        <PriceTable
                            :dayAheadData="currentDayAheadData"
                            :realTimeData="currentRealTimeData"
                            :timeType="timeType"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import NodeTree from "./components/NodeTree.vue";
import PriceChart from "./components/PriceChart.vue";
import PriceTable from "./components/PriceTable.vue";
import * as XLSX from "xlsx";
import request from "@/utils/request";
import { ElMessage, ElLoading } from "element-plus";

// 注入高度
const headerHeight = inject("headerHeight", 0);
const breadcrumbHeight = inject("breadcrumbHeight", 0);

// 计算容器高度
const containerStyle = computed(() => {
    const totalHeight = `calc(100vh - ${headerHeight.value}px - ${breadcrumbHeight.value}px)`;
    return {
        height: totalHeight,
        overflow: "hidden",
    };
});

// 响应式数据
const selectedNodeName = ref("请选择节点");
const selectedNodeId = ref("");
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const timeType = ref("hour");
const currentDayAheadData = ref([]);
const currentRealTimeData = ref([]);
const nodeTreeData = ref([]);
const cur_node_id = ref(""); //当前被选中的节点ID
const cur_chain = ref([]); //当前被选中节点的路径

const chartLoading = ref(false); // 图表加载状态
const tableLoading = ref(false); // 表格加载状态
const exportLoading = ref(false); // 导出按钮加载状态

const nav_text = computed(() => {
    const arr = cur_chain.value.map((node) => node.treeNodeName);
    return arr.join(` -> `);
});

// 获取所有节点数据
async function fetchAllNodeData() {
    try {
        // 节点树的loading状态
        const loadingInstance = ElLoading.service({
            target: ".left-panel",
            text: "节点列表加载中...",
            background: "rgba(255, 255, 255, 0.7)",
        });

        //请求接口：
        const response = await request.get("/api/node-price/tree");

        if (response.data.status === 0) {
            // 1. 将广东省排在最前面
            const provinces = response.data.data || [];
            const sortedProvinces = provinces.sort((a, b) => {
                if (a.treeNodeName === "广东省") return -1;
                if (b.treeNodeName === "广东省") return 1;
                return a.treeNodeName.localeCompare(b.treeNodeName, "zh-CN");
            });

            nodeTreeData.value = sortedProvinces;

            // 2. 找到广东省的第一个叶子节点作为默认选中
            const guangdong = sortedProvinces.find(
                (p) => p.treeNodeName === "广东省"
            );
            if (
                guangdong &&
                guangdong.children &&
                guangdong.children.length > 0
            ) {
                // 注意：现在广东省的第一个子节点是广东省自身的拷贝，我们需要跳过它
                // 查找第一个真正的叶子节点（从第二个子节点开始）
                let firstLeafNode = null;

                // 从第一个子节点开始查找（索引为0）
                for (let i = 0; i < guangdong.children.length; i++) {
                    const child = guangdong.children[i];
                    if (isLeaf(child)) {
                        firstLeafNode = child;
                        break;
                    }
                }

                if (firstLeafNode) {
                    cur_node_id.value = firstLeafNode.treeNodeId;
                    // 默认选中第一个叶子节点
                    handleNodeSelect({
                        id: firstLeafNode.treeNodeId,
                        name: firstLeafNode.treeNodeName,
                    });
                } else {
                    // 如果没有找到叶子节点，则选中广东省的拷贝节点
                    const guangdongCopy = guangdong.children[0];
                    cur_node_id.value = guangdongCopy.treeNodeId;
                    handleNodeSelect({
                        id: guangdongCopy.treeNodeId,
                        name: guangdongCopy.treeNodeName,
                    });
                }
            } else if (guangdong && isLeaf(guangdong)) {
                // 如果广东省本身就是叶子节点，则选中广东省
                cur_node_id.value = guangdong.treeNodeId;
                handleNodeSelect({
                    id: guangdong.treeNodeId,
                    name: guangdong.treeNodeName,
                });
            }

            ElMessage.success("节点数据加载成功");
        } else {
            ElMessage.warning(response.data.msg || "节点数据加载失败");
        }

        loadingInstance.close(); //关闭加载状态
    } catch (error) {
        console.error("加载节点数据失败:", error);
        ElMessage.error("节点数据加载失败");

        loadingInstance.close(); //关闭加载状态
    }
}

// 辅助函数：查找第一个叶子节点
function findFirstLeafNode(node) {
    if (isLeaf(node)) {
        return node;
    }

    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            const leaf = findFirstLeafNode(child);
            if (leaf) return leaf;
        }
    }

    return null;
}

// 辅助函数：判断是否为叶子节点
function isLeaf(data) {
    return data.leaf === 1 || data.nodeType === "1";
}

// 获取节点电价数据
async function fetchNodePriceData(nodeId, date) {
    const nodePkId = nodeId.endsWith("_copy") ? nodeId.slice(0, -5) : nodeId;
    // 开始加载
    chartLoading.value = true;
    tableLoading.value = true;

    try {
        const response = await request.get("/api/node-price/price-chart", {
            params: {
                nodePkId,
                startDate: date,
            },
        });

        if (response.data.status === 0) {
            const priceData = response.data.data;
            currentDayAheadData.value =
                priceData.dayAheadData || new Array(96).fill(0);
            currentRealTimeData.value =
                priceData.realTimeData || new Array(96).fill(0);
            ElMessage.success("电价数据加载成功");
        } else {
            ElMessage.warning(response.data.msg || "电价数据加载失败");
            currentDayAheadData.value = new Array(96).fill(0);
            currentRealTimeData.value = new Array(96).fill(0);
        }
    } catch (error) {
        console.error("加载电价数据失败:", error);
        ElMessage.error("电价数据加载失败");
        currentDayAheadData.value = new Array(96).fill(0);
        currentRealTimeData.value = new Array(96).fill(0);
    } finally {
        // 无论成功失败，都结束加载
        chartLoading.value = false;
        tableLoading.value = false;
    }
}

// 日期改变处理
function handleDateChange(date) {
    if (selectedNodeId.value) {
        fetchNodePriceData(selectedNodeId.value, date);
    }
}

// 节点选择事件
function handleNodeSelect(node) {
    selectedNodeName.value = node.name;
    selectedNodeId.value = node.id;

    if (selectedDate.value) {
        fetchNodePriceData(node.id, selectedDate.value);
    }

    // 找到父节点树的链
    const node_chain = getParentNodeChain(node.id, nodeTreeData.value);
    cur_chain.value = node_chain;
}

function handleTimeTypeChange(type) {
    timeType.value = type;
}

async function exportToExcel() {
    if (!selectedNodeId.value) {
        ElMessage.warning("请先选择节点");
        return;
    }

    exportLoading.value = true;

    try {
        const wsData = [
            ["时间", "实时节点电价(元/MWh)", "日前节点电价(元/MWh)"],
            ...generateTableData(),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "电价数据");
        XLSX.writeFile(
            wb,
            `${selectedNodeName.value}_${selectedDate.value}_电价数据.xlsx`
        );

        ElMessage.success("数据导出成功");
    } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("数据导出失败");
    } finally {
        exportLoading.value = false;
    }
}

function generateTableData() {
    const timePoints = [];
    if (timeType.value === "hour") {
        for (let i = 0; i < 24; i++) {
            timePoints.push(`${i.toString().padStart(2, "0")}:00`);
        }
    } else {
        for (let i = 0; i < 96; i++) {
            const hour = Math.floor(i / 4);
            const minute = (i % 4) * 15;
            timePoints.push(
                `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`
            );
        }
    }

    return timePoints.map((time, index) => {
        const hourIndex =
            timeType.value === "hour" ? index : Math.floor(index / 4);
        return [
            time,
            currentRealTimeData.value[hourIndex] || 0,
            currentDayAheadData.value[hourIndex] || 0,
        ];
    });
}

// 辅助函数：获取从根节点到指定节点的路径链
function getParentNodeChain(nodeId, treeNodes) {
    const path = [];

    function findPath(nodes, targetId, currentPath) {
        for (const node of nodes) {
            const newPath = [
                ...currentPath,
                {
                    treeNodeId: node.treeNodeId,
                    treeNodeName: node.treeNodeName,
                },
            ];

            if (node.treeNodeId === targetId) {
                path.push(...newPath);
                return true;
            }

            if (node.children && node.children.length > 0) {
                if (findPath(node.children, targetId, newPath)) {
                    return true;
                }
            }
        }
        return false;
    }

    findPath(treeNodes, nodeId, []);

    return path;
}

onMounted(() => {
    fetchAllNodeData(); // 一次性加载所有节点数据
});
</script>

<style scoped lang="scss">
.price-analysis-container {
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
    padding: 20px 10px;

    .analysis-content {
        flex: 1;
        display: grid;
        grid-template-columns: 350px 1fr 500px;
        gap: 10px;
        min-height: 0;
        height: 100%;

        .left-panel {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            overflow-y: scroll;
        }

        .middle-panel {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .chart-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #eaeaea;
                flex-shrink: 0;

                .date-picker-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    i {
                        color: #409eff;
                        font-size: 18px;
                    }
                }

                .chart-info {
                    .selected-node {
                        background: #f0f7ff;
                        padding: 8px 16px;
                        border-radius: 20px;
                        color: #409eff;
                        font-weight: 500;
                        font-size: 14px;
                        i {
                            margin-right: 6px;
                        }
                    }
                }
            }

            .chart-container {
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }
        }

        .right-panel {
            background: white;
            border-radius: 8px;
            padding: 16px 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            .table-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 1px solid #eaeaea;
                flex-shrink: 0;

                .time-type-selector {
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    i {
                        color: #67c23a;
                        font-size: 16px;
                    }
                }
            }

            .table-container {
                flex: 1;
                min-height: 0;
                overflow: hidden;
            }
        }
    }
}

@media (max-width: 1600px) {
    .price-analysis-container {
        .analysis-content {
            grid-template-columns: 280px 1fr 500px;
        }
    }
}

@media (max-width: 1400px) {
    .price-analysis-container {
        .analysis-content {
            grid-template-columns: 250px 1fr 450px;
        }
    }
}

@media (max-width: 1200px) {
    .price-analysis-container {
        height: auto !important;
        min-height: calc(
            100vh - var(--header-height) - var(--breadcrumb-height)
        );

        .analysis-content {
            grid-template-columns: 1fr;
            grid-template-rows: 300px 400px 400px;
            gap: 12px;

            .left-panel,
            .middle-panel,
            .right-panel {
                min-height: 0;
            }
        }
    }
}
</style>
