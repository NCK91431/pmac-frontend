<template>
    <div class="compare-table-wrapper">
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
            <el-table-column prop="title" label="时间" fixed width="120" />
            <el-table-column
                v-for="time in filteredHeaderData"
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
import { ref, computed } from "vue";

const props = defineProps({
    actualData: Array,
    predictionData: Array,
    unit: String,
});

const timeLevel = ref("hour"); //时间粒度选择
// 过滤后的表头数据
const filteredHeaderData = computed(() => {
    if (timeLevel.value === "hour") {
        // 只保留整点数据（分钟部分为00）
        return headerData.filter((time) => {
            const parts = time.split(":");
            return parts.length === 2 && parts[1] === "00";
        });
    } else {
        // 分钟级显示全部数据
        return headerData;
    }
});

// 处理级别变化
function handleLevelChange() {
    // 可以在这里添加其他逻辑
}

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
        title: `预测值 (${props.unit == "MWp" ? "MW" : "kW"})`,
    };
    const p_data = props.predictionData;
    headerData.forEach((time, idx) => {
        row1[time] = p_data[idx];
    });

    const row2 = {
        title: `实际值 (${props.unit == "MWp" ? "MW" : "kW"})`,
    };
    const a_data = props.actualData;
    headerData.forEach((time, idx) => {
        row2[time] = a_data[idx];
    });

    return [row1, row2];
}
</script>

<style lang="scss" scoped>
.radio-group {
    margin-bottom: 16px;
    display: flex;
}
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
