<template>
    <div class="compare-table-wrapper">
        <el-table
            :data="getTableData()"
            style="width: 100%"
            border
            :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
        >
            <el-table-column prop="title" label="时间" fixed width="100" />
            <el-table-column
                v-for="time in headerData"
                :key="time"
                :prop="time"
                :label="time"
                width="70"
            >
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
const props = defineProps({
    actualData: Array,
    predictionData: Array,
});

const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 96; i++) {
        const hours = Math.floor((i * 15) / 60)
            .toString()
            .padStart(2, "0");
        const minutes = ((i * 15) % 60).toString().padStart(2, "0");
        slots.push(`${hours}:${minutes}`);
    }
    return slots;
};
const headerData = generateTimeSlots();

function getTableData() {
    let row1 = {
        title: "预测值",
    };
    const p_data = props.predictionData;
    headerData.forEach((time, idx) => {
        row1[time] = p_data[idx];
    });

    const row2 = {
        title: "实际值",
    };
    const a_data = props.actualData;
    headerData.forEach((time, idx) => {
        row2[time] = a_data[idx];
    });

    return [row1, row2];
}
</script>

<style lang="scss" scoped>
.value-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .actual {
        color: #5470c6;
        font-weight: 500;
    }

    .prediction {
        color: #91cc75;
        font-weight: 500;
    }
}
</style>
