<template>
    <div class="compare-table-wrapper">
        <el-table
            :data="getTableData()"
            style="width: 100%"
            border
            :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
        >
            <el-table-column prop="title" label="时间" fixed width="110" />
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
    similarDayLoad: Array,
});

const headerData = Array(24)
    .fill()
    .map((_, i) => `${i}:00`);

function getTableData() {
    // 预测值
    let row1 = {
        title: "预测负荷",
    };
    const p_data = props.predictionData;
    headerData.forEach((time, idx) => {
        row1[time] = p_data[idx];
    });

    // 实际值
    const row2 = {
        title: "实际负荷",
    };
    const a_data = props.actualData;
    headerData.forEach((time, idx) => {
        row2[time] = a_data[idx];
    });

    // 同类型日值
    const row3 = {
        title: "同类型日负荷",
    };
    const s_data = props.similarDayLoad;

    headerData.forEach((time, idx) => {
        row3[time] = s_data[idx];
    });

    return [row1, row2, row3];
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
