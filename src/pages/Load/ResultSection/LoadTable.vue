<template>
    <div class="load-table-wrapper">
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
    loads: Array,
    headerData: Array,
});

function getTableData() {
    let row = {
        title: "负荷值",
    };
    const data = props.loads;
    props.headerData.forEach((time, idx) => {
        row[time] = data[idx];
    });
    return [row];
}
</script>

<style lang="scss" scoped></style>
