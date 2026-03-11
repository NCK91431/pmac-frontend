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
      <div class="main-wrapper">
        <!-- 控制条 -->
        <div class="control-bar">
          <div class="control-bar-left">
            <!-- 模式选择 -->
            <el-button type="primary" @click="toggleMode">
              {{ mode === "single" ? "单日模式" : "多日模式"
              }}<el-icon class="el-icon--right"><Sort /></el-icon>
            </el-button>
            <!-- 日期选择器 -->
            <div class="date-picker-container">
              <i class="bi bi-calendar"></i>
              <!-- 单日模式下显示 -->
              <template v-if="mode === 'single'">
                <el-date-picker
                  v-model="selectedDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </template>
              <!-- 多日模式下显示 -->
              <template v-else>
                <el-date-picker
                  v-model="selectedDateRange"
                  type="daterange"
                  placeholder="选择日期范围"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleDateRangeChange"
                />
              </template>
            </div>
          </div>
          <div class="control-bar-right">
            <div class="time-type-selector" v-if="mode == 'single'">
              <i class="bi bi-clock"></i>
              <el-radio-group v-model="timeType" @change="handleTimeTypeChange">
                <el-radio-button label="hour">24点</el-radio-button>
                <el-radio-button label="minute">96点</el-radio-button>
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
        </div>
        <div class="main">
          <!-- 单日模式 -->
          <template v-if="mode === 'single'">
            <!-- 中间：图表区域 -->
            <div class="middle-panel">
              <div class="chart-container">
                <div class="chart-info">
                  <span class="selected-node">
                    <i class="bi bi-node-plus"></i> 当前节点：{{ nav_text }}
                  </span>
                  <!-- 在这里显示日期的信息 -->
                  <div class="date-info" v-if="selectedDate">
                    <div class="selected-date-display">
                      <i class="bi bi-calendar-event me-1"></i>
                      {{ dateInfo.dateValue }}
                    </div>
                    <div class="weekday">
                      <i class="bi bi-calendar-week me-1"></i>
                      {{ dateInfo.weekday }}
                    </div>
                    <div class="date-type" :class="dateInfo.dateType">
                      <i
                        class="me-1"
                        :class="
                          dateInfo.dateType === 'weekend'
                            ? 'bi-emoji-sunglasses'
                            : 'bi-briefcase'
                        "
                      ></i>
                      {{ dateInfo.dateType === "weekend" ? "周末" : "工作日" }}
                    </div>
                  </div>
                </div>
                <div
                  v-loading="chartLoading"
                  element-loading-text="图表数据加载中..."
                  element-loading-spinner="el-icon-loading"
                  element-loading-background="rgba(255, 255, 255, 0.7)"
                  class="charts-wrapper"
                >
                  <div class="chart-item" ref="priceChartItem">
                    <PriceChart
                      :dayAheadData="currentDayAheadData"
                      :realTimeData="currentRealTimeData"
                      :nodeName="selectedNodeName"
                      :chartHeight="chartItemHeight"
                    />
                  </div>
                  <div class="chart-item" ref="spreadChartItem">
                    <PriceSpreadChart
                      :dayAheadData="currentDayAheadData"
                      :realTimeData="currentRealTimeData"
                      :nodeName="selectedNodeName"
                      :timeType="timeType"
                      :chartHeight="chartItemHeight"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：表格区域 -->
            <div class="right-panel">
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
          </template>
          <template v-else>
            <!-- 多日模式 -->
           <MultiDayView
                v-if="mode === 'multi'"
                :node-id="selectedNodeId"
                :node-name="selectedNodeName"
                :date-range="selectedDateRange"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  inject,
  nextTick,
  onBeforeUnmount,
} from "vue";
import NodeTree from "./components/NodeTree.vue";
import PriceChart from "./components/PriceChart.vue";
import PriceSpreadChart from "./components/PriceSpreadChart.vue";
import PriceTable from "./components/PriceTable.vue";
import * as XLSX from "xlsx";
import request from "@/utils/request";
import { ElMessage, ElLoading } from "element-plus";
import { Sort } from "@element-plus/icons-vue";
import MultiDayView from './components/MultiDayView.vue'

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

// 计算前天的日期（格式：YYYY-MM-DD）
function getTwoDaysAgoDate() {
  const date = new Date();
  date.setDate(date.getDate() - 2); // 减去2天
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 计算前天往前7天的日期范围（包含前天）
function getDefaultDateRange() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2); // 前天

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6); // 往前6天，加上前天共7天

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return [formatDate(startDate), formatDate(endDate)];
}

// 计算日期信息
const dateInfo = computed(() => {
  if (!selectedDate.value) {
    return {
      dateValue: "",
      weekday: "",
      dateType: "",
    };
  }

  const date = new Date(selectedDate.value);
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = `星期${weekdays[date.getDay()]}`;
  const day = date.getDay();
  const dateType = day === 0 || day === 6 ? "weekend" : "weekday";

  return {
    dateValue: selectedDate.value,
    weekday,
    dateType,
  };
});

// 响应式数据
const selectedNodeName = ref("请选择节点");
const selectedNodeId = ref("");
const selectedDate = ref(getTwoDaysAgoDate()); // 默认选中前天
const timeType = ref("hour");
const currentDayAheadData = ref([]);
const currentRealTimeData = ref([]);
const nodeTreeData = ref([]);
const cur_node_id = ref(""); //当前被选中的节点ID
const cur_chain = ref([]); //当前被选中节点的路径

const chartLoading = ref(false); // 图表加载状态
const tableLoading = ref(false); // 表格加载状态
const exportLoading = ref(false); // 导出按钮加载状态

const mode = ref("single"); // 模式：single 单日查看，multi 多日查看
// 切换模式
const toggleMode = () => {
  mode.value = mode.value === "single" ? "multi" : "single";
};

const selectedDateRange = ref(getDefaultDateRange()); // 多日模式下选中的日期范围

// 处理多日模式下日期范围改变
const handleDateRangeChange = (val) => {
  selectedDateRange.value = val;
};

// 图表容器引用和高度
const priceChartItem = ref(null);
const spreadChartItem = ref(null);
const chartItemHeight = ref(350); // 默认高度

// 计算并更新 chart-item 的高度
const updateChartItemHeight = () => {
  nextTick(() => {
    if (priceChartItem.value) {
      const rect = priceChartItem.value.getBoundingClientRect();
      if (rect.height > 0) {
        chartItemHeight.value = rect.height;
      }
    }
  });
};

// 窗口 resize 时更新高度
const handleWindowResize = () => {
  updateChartItemHeight();
};

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
        (p) => p.treeNodeName === "广东省",
      );
      if (guangdong && guangdong.children && guangdong.children.length > 0) {
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
      `${selectedNodeName.value}_${selectedDate.value}_电价数据.xlsx`,
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
          .padStart(2, "0")}`,
      );
    }
  }

  return timePoints.map((time, index) => {
    const hourIndex = timeType.value === "hour" ? index : Math.floor(index / 4);
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
  // 延迟更新图表高度，确保 DOM 已渲染
  setTimeout(() => {
    updateChartItemHeight();
  }, 100);
  window.addEventListener("resize", handleWindowResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleWindowResize);
});
</script>

<style scoped lang="scss">
.price-analysis-container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);

  .analysis-content {
    flex: 1;
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 4px;
    min-height: 0;
    height: 100%;

    .left-panel {
      background: white;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 0;
      height: 100%;
    }

    .control-bar {
      height: 60px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;

      .control-bar-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .date-picker-container {
          display: flex;
          align-items: center;
          gap: 8px;

          i {
            color: #409eff;
            font-size: 18px;
          }
        }
      }

      .control-bar-right {
        display: flex;
        align-items: center;
        gap: 12px;

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
    }

    .main {
      display: flex;
      flex: 1;
      min-height: 0;
    }
    .middle-panel {
      flex: 1;
      min-width: 0;
      background: white;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .chart-container {
        flex: 1;
        min-height: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .charts-wrapper {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;

          .chart-item {
            flex: 1;
            overflow: hidden;
          }
        }

        .chart-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

          .date-info {
            display: flex;
            gap: 8px;
            text-align: center;
            transform: scale(0.8);
            transform-origin: right center;

            .selected-date-display,
            .weekday,
            .date-type {
              display: flex;
              align-items: center;
              min-height: 30px;
              font-size: 16px;
            }

            .selected-date-display {
              color: #1890ff;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: 600;
              background-color: rgba(24, 144, 255, 0.1);
              border: 1px solid rgba(24, 144, 255, 0.2);
            }

            .weekday {
              padding: 3px 10px;
              background: rgba(44, 111, 187, 0.1);
              border-radius: 4px;
              color: #2c6fbb;
              font-weight: 500;
              border: 1px solid rgba(44, 111, 187, 0.2);
            }

            .date-type {
              padding: 3px 10px;
              border-radius: 4px;
              font-weight: 500;

              &.weekday {
                background: rgba(76, 175, 80, 0.1);
                color: #4caf50;
                border: 1px solid rgba(76, 175, 80, 0.2);
              }

              &.weekend {
                background: rgba(156, 39, 176, 0.1);
                color: #9c27b0;
                border: 1px solid rgba(156, 39, 176, 0.2);
              }
            }
          }
        }
      }
    }

    .right-panel {
      width: 500px;
      flex-shrink: 0;
      background: white;
      padding: 16px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;

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
      grid-template-columns: 280px 1fr;

      .right-panel {
        width: 450px;
      }
    }
  }
}

@media (max-width: 1400px) {
  .price-analysis-container {
    .analysis-content {
      grid-template-columns: 250px 1fr;

      .right-panel {
        width: 400px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .price-analysis-container {
    height: auto !important;
    min-height: calc(100vh - var(--header-height) - var(--breadcrumb-height));

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
