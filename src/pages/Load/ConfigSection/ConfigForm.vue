<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <div class="mb-3">
            <label class="form-label fw-bold">客户类型</label>
            <el-select v-model="form.customerType" placeholder="请选择客户类型" class="w-100">
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
                    <input v-model="form.pvConfig" class="form-check-input" type="radio" value="yes" id="pvYes" />
                    <label class="form-check-label" for="pvYes">有</label>
                </div>
                <div class="form-check">
                    <input v-model="form.pvConfig" class="form-check-input" type="radio" value="no" id="pvNo" />
                    <label class="form-check-label" for="pvNo">无</label>
                </div>
                <div class="form-check">
                    <input v-model="form.pvConfig" class="form-check-input" type="radio" value="unknown"
                        id="pvUnknown" />
                    <label class="form-check-label" for="pvUnknown">不确定</label>
                </div>
            </div>
        </div>

        <div class="mb-3">
            <label class="form-label fw-bold">地点</label>
            <el-cascader v-model="form.location" :options="locationOptions" placeholder="请选择省/市/区" class="w-100" />
        </div>

        <div class="mb-3">
            <label class="form-label fw-bold">预测类型</label>
            <el-select v-model="form.forecastRange" placeholder="请选择预测类型" class="w-100">
                <el-option label="D-4 -> D+1" value="4days" />
                <el-option label="D-1 -> D+1" value="1day" />
            </el-select>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

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

const locationOptions = [
    {
        value: "广东省",
        label: "广东省",
        children: [
            {
                value: "珠海市",
                label: "珠海市",
                children: [
                    { value: "香洲区", label: "香洲区" },
                    { value: "高新区", label: "高新区" },
                ],
            },
            {
                value: "广州市",
                label: "广州市",
                children: [
                    { value: "海珠区", label: "海珠区" },
                    { value: "荔湾区", label: "荔湾区" },
                ],
            },
        ],
    },
    {
        value: "江苏省",
        label: "江苏省",
        children: [
            {
                value: "南京市",
                label: "南京市",
                children: [
                    { value: "玄武区", label: "玄武区" },
                    { value: "秦淮区", label: "秦淮区" },
                ],
            },
            {
                value: "苏州市",
                label: "苏州市",
                children: [
                    { value: "姑苏区", label: "姑苏区" },
                    { value: "吴中区", label: "吴中区" },
                ],
            },
        ],
    },
];

const getFormData = () => {
    return {
        ...form.value,
        locationText:
            locationOptions.find(
                (prov) => prov.value === form.value.location[0]
            )?.label +
            " - " +
            locationOptions
                .find((prov) => prov.value === form.value.location[0])
                ?.children.find((city) => city.value === form.value.location[1])
                ?.label +
            " - " +
            locationOptions
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
