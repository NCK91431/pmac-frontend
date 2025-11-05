<template>
    <div class="result-table-wrapper">
        <div class="radio-group">
            <el-radio-group
                v-model="timeLevel"
                @change="handleLevelChange"
                size="small"
            >
                <el-radio-button label="hour">小时级</el-radio-button>
                <el-radio-button label="minute">分钟级</el-radio-button>
            </el-radio-group>
        </div>
        <el-table
            :data="getTableData()"
            style="width: 100%"
            border
            :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
        >
            <el-table-column prop="title" label="时间" width="120" />
            <el-table-column
                v-for="time in filteredHeaderData"
                :key="time"
                :prop="time"
                :label="time"
                width="70"
            />
        </el-table>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
const props = defineProps({
    predictionData: Array,
    headerData: Array,
    unit: String,
});

const timeLevel = ref("hour"); //时间粒度选择
// 过滤后的表头数据
const filteredHeaderData = computed(() => {
    if (timeLevel.value === "hour") {
        // 只保留整点数据（分钟部分为00）
        return props.headerData.filter((time) => {
            const parts = time.split(":");
            return parts.length === 2 && parts[1] === "00";
        });
    } else {
        // 分钟级显示全部数据
        return props.headerData;
    }
});

// 处理级别变化
function handleLevelChange() {
    // 可以在这里添加其他逻辑
}

function getTableData() {
    let row = {
        title: `预测值 (${props.unit == "MWp" ? "MW" : "kW"})`,
    };
    const data = [...props.predictionData];
    data.forEach((item) => {
        row[item.time] = item.value;
    });
    return [row];
}
</script>

<style lang="scss" scoped>
.radio-group {
    margin-bottom: 16px;
    display: flex;
}
// 让表格滚动条始终显示
:deep(.el-table__body-wrapper) {
    &::-webkit-scrollbar {
        -webkit-appearance: none;
    }
    &::-webkit-scrollbar:vertical {
        width: 8px;
    }
    &::-webkit-scrollbar:horizontal {
        height: 8px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }
    &::-webkit-scrollbar-track {
        background-color: #f5f5f5;
        border-radius: 4px;
    }

    // 关键：始终显示滚动条
    overflow: auto !important;
}
</style>
