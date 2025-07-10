<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <div class="mb-3">
            <label class="form-label fw-bold">客户类型</label>
            <el-select
                v-model="form.customerType"
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
                        v-model="form.pvConfig"
                        class="form-check-input"
                        type="radio"
                        value="yes"
                        id="pvYes"
                    />
                    <label class="form-check-label" for="pvYes">有</label>
                </div>
                <div class="form-check">
                    <input
                        v-model="form.pvConfig"
                        class="form-check-input"
                        type="radio"
                        value="no"
                        id="pvNo"
                    />
                    <label class="form-check-label" for="pvNo">无</label>
                </div>
                <div class="form-check">
                    <input
                        v-model="form.pvConfig"
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
                v-model="form.forecastRange"
                placeholder="请选择预测类型"
                class="w-100"
            >
                <el-option label="D-4 -> D+1" value="4days" />
                <el-option label="D-1 -> D+1" value="1day" />
            </el-select>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
// 配置级联选择器属性
const cascaderProps = {
    value: "value",
    label: "label",
    children: "children",
    expandTrigger: "hover",
};

const form = ref({
    customerType: "",
    pvConfig: "",
    location: [],
    forecastRange: "",
});

const isValid = computed(() => {
    return (
        form.value.customerType &&
        form.value.pvConfig &&
        form.value.location.length === 3 &&
        form.value.forecastRange
    );
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

const getFormData = () => {
    const list = locationOptions.value;
    return {
        ...form.value,
        locationText:
            list.find((prov) => prov.value === form.value.location[0])?.label +
            " - " +
            list
                .find((prov) => prov.value === form.value.location[0])
                ?.children.find((city) => city.value === form.value.location[1])
                ?.label +
            " - " +
            list
                .find((prov) => prov.value === form.value.location[0])
                ?.children.find((city) => city.value === form.value.location[1])
                ?.children.find((area) => area.value === form.value.location[2])
                ?.label,
    };
};

defineExpose({ isValid, getFormData });
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
