<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <template v-if="mode == 'S'">
            <div class="mb-3">
                <label class="form-label fw-bold">客户类型</label>
                <el-select
                    v-model="form.customer_type"
                    placeholder="请选择客户类型"
                    class="w-100"
                    :disabled="isContinue"
                >
                    <el-option label="医院" value="hospital" />
                    <el-option label="商超" value="mall" />
                    <el-option label="离散工业" value="discrete" />
                    <el-option label="连续工业" value="continuous" />
                </el-select>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">光伏配置</label>
                <div class="d-flex gap-3">
                    <div class="form-check">
                        <input
                            v-model="form.pv_config"
                            class="form-check-input"
                            type="radio"
                            value="yes"
                            id="pvYes"
                            :disabled="isContinue"
                        />
                        <label class="form-check-label" for="pvYes">有</label>
                    </div>
                    <div class="form-check">
                        <input
                            v-model="form.pv_config"
                            class="form-check-input"
                            type="radio"
                            value="no"
                            id="pvNo"
                            :disabled="isContinue"
                        />
                        <label class="form-check-label" for="pvNo">无</label>
                    </div>
                    <div class="form-check">
                        <input
                            v-model="form.pv_config"
                            class="form-check-input"
                            type="radio"
                            value="unknown"
                            id="pvUnknown"
                            :disabled="isContinue"
                        />
                        <label class="form-check-label" for="pvUnknown"
                            >不确定</label
                        >
                    </div>
                </div>
            </div>

            <!-- 新增装机容量输入框，仅在选择"有"时显示 -->
            <div class="mb-3" v-if="form.pv_config == 'yes'">
                <label class="form-label fw-bold">装机容量 (kw)</label>
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
        </template>

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

        <div class="mb-3">
            <label class="form-label fw-bold">预测类型</label>
            <el-select
                v-model="form.forecast_range"
                placeholder="请选择预测类型"
                class="w-100"
                :disabled="isContinue"
            >
                <el-option
                    label="D-4 -> D+1 【注：4天前用电量 → 预测未来一天分时负荷】"
                    value="4days"
                />
                <el-option
                    label="D-1 -> D+1 【注：1天前用电量 → 预测未来一天分时负荷】"
                    value="1day"
                />
            </el-select>
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
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
import { InfoFilled } from "@element-plus/icons-vue";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();

const isContinue = computed(() => forecastStore.isContinue);

const mode = computed(() => forecastStore.mode); // 预测模式

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

// 获取省市区数据
onMounted(async () => {
    try {
        const response = await request.get("/api/locationtree");
        if (response.data.code === 200) {
            locationOptions.value = response.data.data;
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
    }
}
</style>
