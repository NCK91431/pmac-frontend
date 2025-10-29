<template>
    <div class="history-config-display card border-0 shadow-sm mt-4">
        <div
            class="card-header bg-white d-flex justify-content-between align-items-center"
        >
            <h5 class="mb-0"><i class="bi bi-sliders me-2"></i>配置参数</h5>
            <el-button type="primary" @click="downloadRecordFile">
                <i class="bi bi-download me-1"></i>下载原始数据
            </el-button>
        </div>
        <div class="card-body">
            <div class="config-grid">
                <!-- 基础配置 -->
                <div class="config-category">
                    <h6 class="category-title">
                        <i class="bi bi-gear me-2"></i>基础配置
                    </h6>
                    <div class="config-list">
                        <div class="config-item">
                            <span class="config-label">数据颗粒度</span>
                            <span class="config-value">{{
                                time_granularity
                            }}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">项目地点</span>
                            <span class="config-value">{{
                                location || "未设置"
                            }}</span>
                        </div>
                        <div class="config-item">
                            <span class="config-label">需量电价</span>
                            <span class="config-value"
                                >{{ demand_price }} 元/kW·月</span
                            >
                        </div>
                    </div>
                </div>

                <!-- 光伏配置 -->
                <div class="config-category">
                    <h6 class="category-title">
                        <i class="bi bi-sun me-2"></i>光伏配置
                    </h6>
                    <div class="config-list">
                        <div class="config-item">
                            <span class="config-label">光伏成本</span>
                            <span class="config-value"
                                >{{ pv_cost }} 元/Wp</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">折旧年限</span>
                            <span class="config-value"
                                >{{ pv_depreciation_years }} 年</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">装机上限</span>
                            <span class="config-value"
                                >{{ pv_max_capacity || "无限制" }} kWp</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">是否上网</span>
                            <span class="config-value">{{
                                pv_sell_grid ? "是" : "否"
                            }}</span>
                        </div>
                        <div v-if="pv_sell_grid" class="config-item">
                            <span class="config-label">上网电价</span>
                            <span class="config-value"
                                >{{ sell_price }} 元/kWh</span
                            >
                        </div>
                    </div>
                </div>

                <!-- 储能配置 -->
                <div class="config-category">
                    <h6 class="category-title">
                        <i class="bi bi-battery-charging me-2"></i>储能配置
                    </h6>
                    <div class="config-list">
                        <div class="config-item">
                            <span class="config-label">储能成本</span>
                            <span class="config-value"
                                >{{ storage_cost }} 元/Wh</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">折旧年限</span>
                            <span class="config-value"
                                >{{ storage_depreciation_years }} 年</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">最大循环次数</span>
                            <span class="config-value"
                                >{{ storage_max_cycles }} 次</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">装机上限</span>
                            <span class="config-value"
                                >{{
                                    storage_max_capacity || "无限制"
                                }}
                                kWh</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">功率容量配比</span>
                            <span class="config-value"
                                >{{ storage_power_capacity_ratio }} C</span
                            >
                        </div>
                    </div>
                </div>

                <!-- 融资配置 -->
                <div class="config-category">
                    <h6 class="category-title">
                        <i class="bi bi-cash-coin me-2"></i>融资配置
                    </h6>
                    <div class="config-list">
                        <div class="config-item">
                            <span class="config-label">是否有贷款</span>
                            <span class="config-value">{{
                                has_loan ? "是" : "无"
                            }}</span>
                        </div>
                        <div v-if="has_loan" class="config-item">
                            <span class="config-label">贷款比例</span>
                            <span class="config-value"
                                >{{ (loan_amount * 100).toFixed(0) }}%</span
                            >
                        </div>
                        <div v-if="has_loan" class="config-item">
                            <span class="config-label">贷款年利率</span>
                            <span class="config-value"
                                >{{
                                    (loan_annual_rate * 100).toFixed(2)
                                }}%</span
                            >
                        </div>
                        <div v-if="has_loan" class="config-item">
                            <span class="config-label">贷款年限</span>
                            <span class="config-value">{{ loan_term }} 年</span>
                        </div>
                    </div>
                </div>

                <!-- 其他配置 -->
                <div class="config-category">
                    <h6 class="category-title">
                        <i class="bi bi-sliders me-2"></i>其他配置
                    </h6>
                    <div class="config-list">
                        <div class="config-item">
                            <span class="config-label">贴现率</span>
                            <span class="config-value"
                                >{{ (discount_rate * 100).toFixed(2) }}%</span
                            >
                        </div>
                        <div class="config-item">
                            <span class="config-label">税率</span>
                            <span class="config-value"
                                >{{ (tax_rate * 100).toFixed(2) }}%</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";

import { useLightStore } from "@/store/light";
const forecastStore = useLightStore();
const recordId = computed(() => forecastStore.activeHistoryRecordId);
const config = ref({});
onMounted(() => {
    getRecord();
});
watch(recordId, (newId) => {
    if (newId) {
        getRecord();
    }
});
async function getRecord() {
    const id = recordId.value;
    if (!id) {
        ElMessage.error("查询记录失败");
        return;
    }
    try {
        const response = await request.get(`/api/light_history/${id}`);
        if (response.data.success) {
            config.value = response.data.config;
        } else {
            ElMessage.error("查询记录失败");
        }
    } catch (error) {
        if (error !== "cancel") {
            console.error("获取记录详情失败:", error);
            ElMessage.error(`获取详情失败: ${error.message}`);
        }
    }
}

// 基础配置
const time_granularity = computed(() => {
    const value = config.value.time_granularity;
    return value === 24 ? "1小时粒度 (24个数据点)" : `${value} 数据点`;
});

const location = computed(() => {
    // 假设项目地点在config中存储为location字段
    // 如果后端返回的格式是数组（如['省','市','区']），则用join连接
    const loc = config.value.location;
    if (Array.isArray(loc)) {
        return loc.join(" / ");
    }
    return loc;
});

const demand_price = computed(() => config.value.demand_price || 0);

// 光伏配置
const pv_cost = computed(() => config.value.pv_cost || 0);
const pv_depreciation_years = computed(
    () => config.value.pv_depreciation_years || 0
);
const pv_max_capacity = computed(() => config.value.pv_max_capacity);
const pv_sell_grid = computed(() => config.value.pv_sell_grid || false);
const sell_price = computed(() => config.value.sell_price || 0);

// 储能配置
const storage_cost = computed(() => config.value.storage_cost || 0);
const storage_depreciation_years = computed(
    () => config.value.storage_depreciation_years || 0
);
const storage_max_cycles = computed(() => config.value.storage_max_cycles || 0);
const storage_max_capacity = computed(() => config.value.storage_max_capacity);
const storage_power_capacity_ratio = computed(
    () => config.value.storage_power_capacity_ratio || 0
);

// 融资配置
const has_loan = computed(() => config.value.has_loan || false);
const loan_amount = computed(() => config.value.loan_amount || 0);
const loan_annual_rate = computed(() => config.value.loan_annual_rate || 0);
const loan_term = computed(() => config.value.loan_term || 0);

// 其他配置
const discount_rate = computed(() => config.value.discount_rate || 0);
const tax_rate = computed(() => config.value.tax_rate || 0);

// 下载记录原始数据
async function downloadRecordFile() {
    if (!recordId.value) {
        ElMessage.error("记录ID不存在，无法下载");
        return;
    }

    try {
        const response = await request.get(
            `/api/light_history/${recordId.value}/download`,
            {
                responseType: "blob",
            }
        );

        // 获取文件名
        const fileName = `预测记录_${recordId.value}_原始数据.xlsx`;

        // 创建Blob并下载
        const blob = new Blob([response.data]);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);

        ElMessage.success("文件下载成功");
    } catch (error) {
        console.error("下载文件失败:", error);
        ElMessage.error("文件下载失败");
    }
}
</script>

<style lang="scss" scoped>
.history-config-display {
    .card-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .card-body {
        padding: 20px;
    }

    .config-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }

    .config-category {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e9ecef;

        .category-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #495057;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
        }

        .config-list {
            .config-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;

                &:last-child {
                    border-bottom: none;
                }

                .config-label {
                    font-size: 0.85rem;
                    color: #6c757d;
                }

                .config-value {
                    font-size: 0.85rem;
                    color: #495057;
                    font-weight: 500;
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .config-grid {
        grid-template-columns: 1fr;
    }
}
</style>
