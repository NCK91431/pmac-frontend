<template>
    <div class="price-analysis-container" :style="containerStyle">
        <div class="analysis-content">
            <!-- 左侧：节点树 -->
            <div class="left-panel">
                <NodeTree :nodes="allNodes" @node-select="handleNodeSelect" />
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
                                selectedNodeName
                            }}
                        </span>
                    </div>
                </div>

                <div class="chart-container">
                    <PriceChart
                        :dayAheadData="currentDayAheadData"
                        :realTimeData="currentRealTimeData"
                        :nodeName="selectedNodeName"
                    />
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
                    >
                        <i class="bi bi-download"></i> 导出数据
                    </el-button>
                </div>

                <div class="table-container">
                    <PriceTable
                        :dayAheadData="currentDayAheadData"
                        :realTimeData="currentRealTimeData"
                        :timeType="timeType"
                    />
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
import { ElMessage } from "element-plus";

// 注入高度
const headerHeight = inject("headerHeight", 0);
const breadcrumbHeight = inject("breadcrumbHeight", 0);

// 计算容器高度
const containerStyle = computed(() => {
    console.log(headerHeight.value, breadcrumbHeight.value);
    const totalHeight = `calc(100vh - ${headerHeight.value}px - ${breadcrumbHeight.value}px)`;
    return {
        height: totalHeight,
        overflow: "hidden",
    };
});

// 响应式数据
const selectedNodeName = ref("全省");
const selectedDate = ref("2025-12-01");
const timeType = ref("hour");
const dayAheadData = ref({});
const realTimeData = ref({});

// 在parseExcelData函数中，改为从后端API获取数据
async function fetchPageData() {
    try {
        // 从后端API获取数据
        const response = await request.get("/api/price/get-price-data", {
            params: {
                province: "广东省",
                date: selectedDate.value,
            },
        });

        if (response.data.success) {
            const priceData = response.data.data;
            dayAheadData.value = priceData.dayAheadData;
            realTimeData.value = priceData.realTimeData;

            // 初始化选择第一个节点
            if (dayAheadData.value["广东省"]?.["其他"]) {
                const firstNode = Object.keys(
                    dayAheadData.value["广东省"]["其他"]
                )[0];
                selectedNodeName.value = firstNode || "全省";
            }

            ElMessage.success("数据加载成功");
        } else {
            ElMessage.warning(response.data.message || "数据加载失败");
        }
    } catch (error) {
        console.error("加载电价数据失败:", error);
        ElMessage.error("数据加载失败");
    }
}

// 在handleDateChange函数中，添加数据重新加载
function handleDateChange(date) {
    console.log("日期改变:", date);
    // 重新加载对应日期的数据
    fetchPageData();
}

// 计算所有节点列表
const allNodes = computed(() => {
    return Object.keys(dayAheadData.value).map((province) => ({
        label: province,
        value: province,
        children: Object.keys(dayAheadData.value[province] || {}).map(
            (category) => ({
                label: category,
                value: `${province}-${category}`,
                children: Object.keys(
                    dayAheadData.value[province][category] || {}
                ).map((node) => ({
                    label: node,
                    value: node,
                })),
            })
        ),
    }));
});

/* ------------- 计算当前节点数据 ------------- */
const currentDayAheadData = computed(() => {
    const nodes = dayAheadData.value["广东省"]?.["其他"];
    return nodes?.[selectedNodeName.value] || [];
});

const currentRealTimeData = computed(() => {
    const nodes = realTimeData.value["广东省"]?.["其他"];
    return nodes?.[selectedNodeName.value] || [];
});

// 事件处理
function handleNodeSelect(node) {
    selectedNodeName.value = node;
}

function handleTimeTypeChange(type) {
    timeType.value = type;
}

function exportToExcel() {
    // 导出数据到Excel
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

    return timePoints.map((time, index) => [
        time,
        currentRealTimeData.value[index] || "-",
        currentDayAheadData.value[index] || "-",
    ]);
}

onMounted(() => {
    fetchPageData();
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
            overflow: hidden;
            display: flex;
            flex-direction: column;
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
