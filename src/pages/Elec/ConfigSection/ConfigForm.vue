<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <!-- 装机容量 -->
        <div class="mb-3">
            <label class="form-label fw-bold">装机容量 (kWp)</label>
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
import { useElecStore } from "@/store/elec";

const forecastStore = useElecStore();

const isContinue = computed(() => forecastStore.isContinue);

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
            const list = response.data.data;
            locationOptions.value = list.filter((item) => item.value == "44"); //暂时只支持广东省
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
