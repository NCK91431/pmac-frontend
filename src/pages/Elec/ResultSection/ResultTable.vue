<template>
    <div class="result-table-wrapper">
        <el-table
            :data="getTableData()"
            style="width: 100%"
            border
            :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
        >
            <el-table-column prop="title" label="时间" />
            <el-table-column
                v-for="time in headerData"
                :key="time"
                :prop="time"
                :label="time"
            />
        </el-table>
    </div>
</template>

<script setup>
const props = defineProps({
    predictionData: Array,
    headerData: Array,
});

function getTableData() {
    let row = {
        title: "预测值",
    };
    const data = [...props.predictionData];
    data.forEach((item) => {
        row[item.time] = item.value;
    });
    return [row];
}
</script>

<style lang="scss" scoped></style>
