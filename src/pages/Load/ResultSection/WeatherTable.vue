<template>
    <div class="weather-table-wrapper">
        <el-table
            :data="getTableData()"
            style="width: 100%"
            border
            :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
        >
            <el-table-column prop="title" label="时间" fixed />
            <el-table-column
                v-for="time in headerData"
                :key="time"
                :prop="time"
                :label="time"
            >
            </el-table-column>
            <el-table-column
                v-for="time in headerData"
                :key="time"
                :prop="time"
                :label="time"
            >
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
const props = defineProps({
    temperatureData: Array,
    irradiationData: Array,
});

const headerData = Array(24)
    .fill()
    .map((_, i) => `${i}:00`);

function getTableData() {
    let row1 = {
        title: "温度值",
    };
    const t_data = props.temperatureData;
    headerData.forEach((time, idx) => {
        row1[time] = t_data[idx];
    });

    const row2 = {
        title: "辐照度",
    };
    const i_data = props.irradiationData;
    headerData.forEach((time, idx) => {
        row2[time] = i_data[idx];
    });

    return [row1, row2];
}
</script>

<style lang="scss" scoped>
.value-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .temperature {
        color: #5470c6;
        font-weight: 500;
    }

    .irradiation {
        color: #91cc75;
        font-weight: 500;
    }
}
</style>
