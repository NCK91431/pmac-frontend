<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <!-- 基础配置模块 -->
        <div class="config-section">
            <div class="section-header">
                <h5 class="section-title">
                    <i class="bi bi-gear me-2"></i>基础配置
                    <span class="badge bg-primary ms-2">必填</span>
                </h5>
            </div>
            <div class="section-content">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold required"
                                >数据颗粒度</label
                            >
                            <select
                                v-model.number="form.time_granularity"
                                class="form-select"
                            >
                                <option :value="24">
                                    1小时粒度 (24个数据点)
                                </option>
                                <option :value="96" disabled>
                                    15分钟粒度 (96个数据点)
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold required"
                                >项目地点</label
                            >
                            <el-cascader
                                v-model="form.location"
                                :options="locationOptions"
                                :props="cascaderProps"
                                placeholder="请选择项目地点"
                                class="w-100"
                            />
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold required">
                                需量电价 (元/kW·月)
                            </label>
                            <input
                                type="number"
                                v-model.number="form.demand_price"
                                class="form-control"
                                placeholder="请输入需量电价"
                                required
                                min="0"
                                step="any"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 光伏配置模块 -->
        <div class="config-section">
            <div class="section-header">
                <h5 class="section-title">
                    <i class="bi bi-sun me-2"></i>光伏配置
                    <span class="badge bg-primary ms-2">必填部分</span>
                </h5>
            </div>
            <div class="section-content">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold required"
                                >光伏成本 (元/Wp)</label
                            >
                            <input
                                type="number"
                                v-model.number="form.pv_cost"
                                class="form-control"
                                placeholder="请输入光伏成本"
                                required
                                min="0"
                                step="any"
                            />
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >光伏折旧年限</label
                            >
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="form.pv_depreciation_years"
                                    class="form-control"
                                    placeholder="默认20年"
                                    min="1"
                                    step="1"
                                />
                                <span class="default-tag">默认20</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional">
                                光伏装机上限 (kWp)
                            </label>
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="form.pv_max_capacity"
                                    class="form-control"
                                    placeholder="不填表示无限制"
                                    min="0"
                                    step="any"
                                    @focus="showPvTip = true"
                                    @blur="showPvTip = false"
                                />
                                <span class="default-tag">默认9999</span>
                            </div>
                            <div
                                v-show="showPvTip"
                                class="form-text text-muted small"
                            >
                                建议最小设置值为100kWp
                            </div>
                        </div>
                    </div>
                    <!-- 光伏是否上网 -->
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label fw-bold"
                                    >光伏是否上网</label
                                >
                                <div class="d-flex align-items-center">
                                    <select
                                        v-model="form.pv_sell_grid"
                                        class="form-select me-2"
                                        @change="onPvSellGridChange"
                                    >
                                        <option :value="false">否</option>
                                        <option :value="true">是</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div v-if="form.pv_sell_grid" class="col-md-6">
                            <label class="form-label fw-bold required"
                                >上网电价 (元/kWh)</label
                            >
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="form.sell_price"
                                    class="form-control"
                                    placeholder="默认0.45"
                                    min="0"
                                    step="any"
                                    required
                                />
                                <span class="default-tag">默认0.45</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 储能配置模块 -->
        <div class="config-section">
            <div class="section-header">
                <h5 class="section-title">
                    <i class="bi bi-battery-charging me-2"></i>储能配置
                    <span class="badge bg-primary ms-2">必填部分</span>
                </h5>
            </div>
            <div class="section-content">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold required"
                                >储能成本 (元/Wh)</label
                            >
                            <input
                                type="number"
                                v-model.number="form.storage_cost"
                                class="form-control"
                                placeholder="请输入储能成本"
                                required
                                min="0.01"
                                max="1.2"
                                step="0.01"
                                @input="formatStorageCost"
                            />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >储能折旧年限</label
                            >
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="
                                        form.storage_depreciation_years
                                    "
                                    class="form-control"
                                    placeholder="默认7年"
                                    min="1"
                                    step="1"
                                />
                                <span class="default-tag">默认7</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >储能最大循环次数</label
                            >
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="form.storage_max_cycles"
                                    class="form-control"
                                    placeholder="默认8000次"
                                    min="0"
                                    step="1"
                                />
                                <span class="default-tag">默认8000</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >储能装机容量上限 (kWh)</label
                            >
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="form.storage_max_capacity"
                                    class="form-control"
                                    placeholder="不填表示无限制"
                                    min="0"
                                    step="any"
                                    @focus="showStorageTip = true"
                                    @blur="showStorageTip = false"
                                />
                                <span class="default-tag">默认9999</span>
                            </div>
                            <div
                                v-show="showStorageTip"
                                class="form-text text-muted small"
                            >
                                建议最小设置值为100kWh
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >功率/容量配比</label
                            >
                            <div class="input-with-default">
                                <input
                                    type="number"
                                    v-model.number="
                                        form.storage_power_capacity_ratio
                                    "
                                    class="form-control"
                                    placeholder="默认0.5C"
                                    min="0.1"
                                    max="2"
                                    step="0.1"
                                />
                                <span class="default-tag">默认0.5</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >储能系统转换效率</label
                            >
                            <div class="input-with-default">
                                <select
                                    v-model="form.CE_ess"
                                    class="form-select"
                                >
                                    <option
                                        v-for="num in [
                                            82, 83, 84, 85, 86, 87, 88, 89, 90,
                                            91, 92,
                                        ]"
                                        :key="num"
                                        :value="num"
                                    >
                                        {{ `${num} %` }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 融资配置模块 -->
        <div class="config-section">
            <div class="section-header">
                <h5 class="section-title">
                    <i class="bi bi-cash-coin me-2"></i>融资配置
                    <span class="badge bg-secondary ms-2">选填</span>
                </h5>
            </div>
            <div class="section-content">
                <div class="row">
                    <!-- 是否有贷款 -->
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold">是否有贷款</label>
                            <select
                                v-model="form.has_loan"
                                class="form-select"
                                @change="onHasLoanChange"
                            >
                                <option :value="false">无贷款</option>
                                <option :value="true">有贷款</option>
                            </select>
                        </div>
                    </div>
                </div>
                <!-- 贷款设置部分 -->
                <div v-if="form.has_loan" class="loan-settings">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label fw-bold required"
                                    >贷款比例</label
                                >
                                <div class="input-with-default">
                                    <input
                                        type="number"
                                        v-model.number="form.loan_amount"
                                        class="form-control"
                                        placeholder="默认0.2（20%）"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        required
                                    />
                                    <span class="default-tag">默认0.2</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label fw-bold required"
                                    >贷款年利率</label
                                >
                                <div class="input-with-default">
                                    <input
                                        type="number"
                                        v-model.number="form.loan_annual_rate"
                                        class="form-control"
                                        placeholder="默认0.05"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        required
                                    />
                                    <span class="default-tag">默认0.05</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label fw-bold required"
                                    >贷款年限</label
                                >
                                <div class="input-with-default">
                                    <input
                                        type="number"
                                        v-model.number="form.loan_term"
                                        class="form-control"
                                        placeholder="默认8年"
                                        min="1"
                                        step="1"
                                        required
                                    />
                                    <span class="default-tag">默认8</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 其他配置 -->
        <div class="config-section">
            <div class="section-header">
                <h5 class="section-title">
                    <i class="bi bi-cash-coin me-2"></i>其他配置
                    <span class="badge bg-secondary ms-2">选填</span>
                </h5>
            </div>
            <div class="section-content">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional"
                                >贴现率</label
                            >
                            <input
                                type="number"
                                v-model.number="form.discount_rate"
                                class="form-control"
                                placeholder="如：0.08"
                                min="0"
                                max="1"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label fw-bold optional">
                                税率
                            </label>
                            <input
                                type="number"
                                v-model.number="form.tax_rate"
                                class="form-control"
                                placeholder="如：0.25"
                                min="0"
                                max="1"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request";
import { useLightStore } from "@/store/light";

const forecastStore = useLightStore();

// 添加提示显示状态
const showPvTip = ref(false);
const showStorageTip = ref(false);

// 配置级联选择器属性
const cascaderProps = {
    value: "label",
    label: "label",
    children: "children",
    expandTrigger: "hover",
};

const locationOptions = ref([]);

// 表单数据双向绑定
const form = computed({
    get: () => forecastStore.formData,
    set: (value) => forecastStore.updateFormData(value),
});

// 格式化储能成本，限制小数点后两位
const formatStorageCost = () => {
    if (
        form.value.storage_cost !== undefined &&
        form.value.storage_cost !== null
    ) {
        // 限制在0-1.2范围内
        if (form.value.storage_cost < 0.01) {
            form.value.storage_cost = 0.01;
        } else if (form.value.storage_cost > 1.2) {
            form.value.storage_cost = 1.2;
        }

        // 限制小数点后两位
        form.value.storage_cost = parseFloat(
            form.value.storage_cost.toFixed(2)
        );
    }
};

// 监听光伏上网选项变化
watch(
    () => form.value.pv_sell_grid,
    (newValue) => {
        if (newValue) {
            // 设置为"是"时，设置默认值0.45
            if (!form.value.sell_price && form.value.sell_price !== 0) {
                form.value.sell_price = 0.45;
            }
        }
    }
);

// 监听贷款选项变化
watch(
    () => form.value.has_loan,
    (newValue) => {
        if (newValue) {
            // 设置为"是"时，设置默认值
            if (!form.value.loan_amount && form.value.loan_amount !== 0) {
                form.value.loan_amount = 0.2;
            }
            if (
                !form.value.loan_annual_rate &&
                form.value.loan_annual_rate !== 0
            ) {
                form.value.loan_annual_rate = 0.05;
            }
            if (!form.value.loan_term) {
                form.value.loan_term = 8;
            }
        }
    }
);

// 手动触发变化的方法（备用）
const onPvSellGridChange = () => {
    if (form.value.pv_sell_grid) {
        if (!form.value.sell_price && form.value.sell_price !== 0) {
            form.value.sell_price = 0.45;
        }
    }
};

const onHasLoanChange = () => {
    if (form.value.has_loan) {
        if (!form.value.loan_amount && form.value.loan_amount !== 0) {
            form.value.loan_amount = 0.2;
        }
        if (!form.value.loan_annual_rate && form.value.loan_annual_rate !== 0) {
            form.value.loan_annual_rate = 0.05;
        }
        if (!form.value.loan_term) {
            form.value.loan_term = 8;
        }
    }
};

onMounted(async () => {
    try {
        const response = await request.get("/api/locationtree");
        if (response.data.code === 200) {
            locationOptions.value = response.data.data;
        }
    } catch (error) {
        console.error("获取省市区数据失败:", error);
    }

    /* ----- 基础配置 ---- */
    // 数据颗粒度默认24
    if (form.value.time_granularity === undefined)
        form.value.time_granularity = 24;

    /* ----- 光伏 ---- */
    // 光伏折旧年限默认20年
    if (form.value.pv_depreciation_years === undefined)
        form.value.pv_depreciation_years = 20;
    // 光伏是否上网默认false
    if (form.value.pv_sell_grid === undefined) form.value.pv_sell_grid = false;
    // 上网电价默认0.45
    if (form.value.sell_price === undefined) form.value.sell_price = 0.45;

    /* ----- 储能 ---- */
    // 储能折旧年限默认7年
    if (form.value.storage_depreciation_years === undefined)
        form.value.storage_depreciation_years = 7;
    // 储能最大循环次数默认8000次
    if (form.value.storage_max_cycles === undefined)
        form.value.storage_max_cycles = 8000;
    // 功率/容量配比默认0.5C
    if (form.value.storage_power_capacity_ratio === undefined)
        form.value.storage_power_capacity_ratio = 0.5;

    /* ----- 融资 ---- */
    // 是否有贷款默认false
    if (form.value.has_loan === undefined) form.value.has_loan = false;
    // 贷款比例默认0.2
    if (form.value.loan_amount === undefined) form.value.loan_amount = 0.2;
    // 贷款年利率默认0.05
    if (form.value.loan_annual_rate === undefined)
        form.value.loan_annual_rate = 0.05;
    // 贷款年限默认8
    if (form.value.loan_term === undefined) form.value.loan_term = 8;

    /* ----- 其他 ---- */
    // 贴现率默认0.08
    if (form.value.discount_rate === undefined) form.value.discount_rate = 0.08;
    // 税率默认0.25
    if (form.value.tax_rate === undefined) form.value.tax_rate = 0.25;

    // 设置条件默认值
    if (
        form.value.pv_sell_grid &&
        !form.value.sell_price &&
        form.value.sell_price !== 0
    ) {
        form.value.sell_price = 0.3;
    }
    if (form.value.has_loan) {
        if (!form.value.loan_amount && form.value.loan_amount !== 0) {
            form.value.loan_amount = 0.2;
        }
        if (!form.value.loan_annual_rate && form.value.loan_annual_rate !== 0) {
            form.value.loan_annual_rate = 0.025;
        }
        if (!form.value.loan_term) {
            form.value.loan_term = 8;
        }
    }
});

defineExpose({
    isValid: computed(() => forecastStore.isValid),
});
</script>

<style lang="scss" scoped>
.config-form {
    background-color: #fff;
    border-radius: 6px;

    .config-section {
        margin-bottom: 1.5rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        overflow: hidden;

        .section-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 12px 16px;
            border-bottom: 1px solid #dee2e6;

            .section-title {
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
                color: #495057;
                display: flex;
                align-items: center;

                .badge {
                    font-size: 0.7rem;
                    padding: 4px 8px;
                }
            }
        }

        .section-content {
            padding: 16px;

            .required::after {
                content: " *";
                color: #dc3545;
            }

            .optional {
                color: #6c757d;
            }

            .input-with-default {
                position: relative;

                .default-tag {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #e9ecef;
                    color: #6c757d;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.8rem;
                }

                .form-control {
                    padding-right: 60px;
                }
            }

            .loan-settings {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 6px;
                margin-top: 8px;
                border-left: 4px solid #0d6efd;
                .required::after {
                    content: " *";
                    color: #dc3545;
                }
            }
        }
    }

    .form-label {
        font-size: 14px;
        margin-bottom: 6px;
        display: block;
    }

    .form-control,
    .form-select {
        font-size: 14px;
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

        &:focus {
            border-color: #86b7fe;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
    }

    // 为级联选择器添加样式
    :deep(.el-cascader) {
        width: 100%;

        .el-input__inner {
            height: 38px;
            line-height: 38px;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .config-form {
        max-height: none;
        overflow-y: visible;

        .config-section {
            .section-content {
                padding: 12px;

                .row {
                    margin: 0;

                    .col-md-6 {
                        padding: 0 8px;
                    }
                }
            }
        }
    }
}

// 滚动条样式
.config-form::-webkit-scrollbar {
    width: 6px;
}

.config-form::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.config-form::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.config-form::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>
