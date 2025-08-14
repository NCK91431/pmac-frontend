<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <!-- 新增装机容量输入框，仅在选择"有"时显示 -->
        <div class="mb-3">
            <label class="form-label fw-bold">储能成本 (元/Wh)</label>
            <input
                type="number"
                v-model.number="form.storage_cost"
                class="form-control"
                placeholder="请输入储能成本"
                required
                min="0"
                step="any"
            />
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">光伏成本 (元/W)</label>
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
        <div class="mb-3">
            <label class="form-label fw-bold">分时电价</label>
            <el-select v-model="active_province" disabled placeholder="Select">
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
import { InfoFilled } from "@element-plus/icons-vue";
import { useLightStore } from "@/store/light"; // 修改为新的Store

// 使用新的综合Store
const forecastStore = useLightStore();

const isContinue = computed(() => forecastStore.isContinue);

// 配置级联选择器属性
const cascaderProps = {
    value: "label",
    label: "label",
    children: "children",
    expandTrigger: "hover",
    pv_capacity: 0,
};

const active_province = ref("广东省");
const options = [
    {
        value: "广东省",
        label: "广东省",
    },
];

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
