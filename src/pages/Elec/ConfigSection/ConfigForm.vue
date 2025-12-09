<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <div class="mb-3">
            <label class="form-label fw-bold"
                >上传数据的单位：{{
                    form.unit + ` ${form.unit == "MWp" ? "兆瓦峰" : "千瓦峰"}`
                }}
            </label>
            <el-radio-group class="w-100" v-model="form.unit" size="small">
                <el-radio-button label="kWp" value="kWp" />
                <el-radio-button label="MWp" value="MWp" />
            </el-radio-group>
            <!-- 峰值负荷警告提示 Start -->
            <div class="peak-load-warning mb-3 mt-3" v-if="maxVal_tipText">
                <div class="warning-content">
                    <div class="warning-icon">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div class="warning-text">
                        <span>{{ maxVal_tipText }}</span>
                    </div>
                </div>
            </div>
            <!-- 峰值负荷警告提示 END -->
        </div>
        <!-- 装机容量 -->
        <div class="mb-3">
            <label class="form-label fw-bold"
                >装机容量 {{ `(${form.unit})` }}</label
            >
            <input
                type="number"
                v-model.number="form.pv_capacity"
                class="form-control"
                placeholder="请输入装机容量"
                required
                min="0"
                step="any"
                :disabled="isContinue"
            />
        </div>
        <!-- 选择地点 -->
        <div class="mb-3">
            <label class="form-label fw-bold">地点</label>
            <el-cascader
                v-model="form.location"
                :options="locationOptions"
                :props="cascaderProps"
                placeholder="请选择省/市/区"
                clearable
                filterable
                class="w-100"
                :disabled="isContinue"
            />
        </div>
        <!-- 	取别名 -->
        <el-divider />
        <div class="mb-3">
            <label class="form-label fw-bold">
                <span class="optional-badge">选填</span>
                <span class="optional-text">标记名称</span>
            </label>
            <input
                type="text"
                v-model.trim="form.mark_name"
                class="form-control optional-field"
                maxlength="15"
                :disabled="isContinue"
            />
            <span class="optional-tip">
                <i class="bi bi-info-circle-fill"></i>
                你可以给此次建模取名，不超过15字
            </span>
        </div>

        <div v-if="isContinue" class="continue-form-tip">
            <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                由于您正在基于已有模型进行预测，原有配置不可改
            </el-text>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from "vue";
import request from "@/utils/request";
import { InfoFilled } from "@element-plus/icons-vue";
import { useElecStore } from "@/store/elec";

const forecastStore = useElecStore();

const isContinue = computed(() => forecastStore.isContinue);

const maxVal_tipText = ref("");

watchEffect(() => {
    if (!forecastStore.excelInfo) {
        maxVal_tipText.value = "";
        return;
    }

    const maxVal = forecastStore.excelInfo.maxVal.val;
    const unit = forecastStore.formData.unit;
    const pv_capacity = forecastStore.formData.pv_capacity;

    if (unit == "kWp" && maxVal < 1) {
        maxVal_tipText.value =
            "系统检测到光伏发电数据峰值偏小，可能实际单位为 MWp，请确认数据单位是否正确。";
    } else if (unit == "kWp" && pv_capacity > 0 && maxVal < pv_capacity * 0.5) {
        maxVal_tipText.value =
            "系统检测到光伏发电数据峰值偏小，可能实际单位为 MWp，请确认数据单位是否正确。";
    } else {
        maxVal_tipText.value = "";
    }
});

// 配置级联选择器属性
const cascaderProps = {
    value: "label",
    label: "label",
    children: "children",
    expandTrigger: "hover",
    pv_capacity: 0,
};

// 表单数据双向绑定
const form = computed({
    get: () => forecastStore.formData,
    set: (value) => forecastStore.updateFormData(value),
});

const locationOptions = ref([]);

const SURPPORT_PROVINCES = ["44", "61"]; // 仅支持广东省和陕西省

// 获取省市区数据
onMounted(async () => {
    try {
        const response = await request.get("/api/locationtree");
        if (response.data.code === 200) {
            const list = response.data.data;
            locationOptions.value = list; //支持全部省份
        }
    } catch (error) {
        console.error("获取省市区数据失败:", error);
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

    .form-label {
        font-size: 14px;
        margin-bottom: 8px;
        .optional-badge {
            font-size: 0.7rem;
            color: #909399;
            background-color: #f4f4f5;
            padding: 2px 6px;
            border-radius: 4px;
            margin-right: 6px;
            font-weight: normal;
        }
        .optional-text {
            color: #5e5e5e;
        }
    }
    .optional-field {
        border: 1px solid #e4e7ed;
        &:disabled {
            background-color: #f5f7fa;
            color: #c0c4cc;
        }
    }
    .optional-tip {
        font-weight: normal;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        color: #909399;
    }
    // 峰值负荷警告样式
    .peak-load-warning {
        background: linear-gradient(135deg, #fff8e6, #fffbeb);
        border: 1px solid #ffd666;
        border-radius: 5px;
        padding: 8px 0 8px 12px;
        box-shadow: 0 2px 8px rgba(255, 182, 29, 0.1);
        animation: fadeInUp 0.5s ease;
        .warning-content {
            display: flex;
            align-items: flex-start;
            gap: 5px;
            .warning-icon {
                color: #ff9900;
                font-size: 1rem;
                flex-shrink: 0;
            }

            .warning-text {
                color: #8a6d3b;
                font-size: 0.8rem;
                line-height: 1.9;

                .highlight-user {
                    color: #e74c3c;
                    font-weight: 700;
                    background: linear-gradient(135deg, #ffece8, #ffdbd6);
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin: 0 2px;
                    border: 1px solid #ffcdc2;
                    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
                }

                .switch-text {
                    color: #8a6d3b;
                    cursor: pointer;
                    text-decoration: underline;
                    font-weight: bolder;
                    padding: 0 2px;
                }
            }
        }

        &:hover {
            border-color: #ff9900;
            box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15);
            transform: translateY(-1px);
            transition: all 0.3s ease;
        }
    }
}
</style>
