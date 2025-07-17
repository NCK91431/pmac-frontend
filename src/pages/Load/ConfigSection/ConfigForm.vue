<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <div class="mb-3">
            <label class="form-label fw-bold">客户类型</label>
            <el-select
                v-model="form.customer_type"
                placeholder="请选择客户类型"
                class="w-100"
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
                    />
                    <label class="form-check-label" for="pvUnknown"
                        >不确定</label
                    >
                </div>
            </div>
        </div>

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
            />
        </div>

        <div class="mb-3">
            <label class="form-label fw-bold">预测类型</label>
            <el-select
                v-model="form.forecast_range"
                placeholder="请选择预测类型"
                class="w-100"
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
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
import { useLoadPreFormStore } from "@/store/loadpreformStore";
const formStore = useLoadPreFormStore();

// 配置级联选择器属性
const cascaderProps = {
    value: "label",
    label: "label",
    children: "children",
    expandTrigger: "hover",
};

// 表单数据双向绑定
const form = computed({
    get: () => formStore.formData,
    set: (value) => formStore.updateFormData(value),
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
    isValid: computed(() => formStore.isValid),
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
