<template>
  <el-table
    :data="enhancedResults"
    border
    :max-height="400"
    class="v2-query-table"
    :row-class-name="getRowClass"
    :cell-style="cellStyle"
    :header-cell-style="headerCellStyle"
  >
    <el-table-column type="index" label="#" width="36" align="center" />
    <el-table-column prop="date" label="日期" width="auto" />
    <el-table-column prop="day_of_the_week" label="星期" width="auto" />
    <el-table-column prop="date_type" label="日期类型" width="auto" />
    <el-table-column prop="holiday_name" label="节假日" width="auto" />
    <el-table-column prop="temperatureMin" label="最低温" width="auto" />
    <el-table-column prop="temperatureMax" label="最高温" width="auto" />
    <el-table-column
      prop="cloudCoverEarlyMorning"
      label="凌晨云量"
      width="auto"
    />
    <el-table-column prop="cloudCoverMorning" label="上午云量" width="auto" />
    <el-table-column prop="cloudCoverAfternoon" label="下午云量" width="auto" />
    <el-table-column prop="cloudCoverEvening" label="晚上云量" width="auto" />
    <el-table-column prop="windSpeed" label="风速" width="auto" />
    <el-table-column prop="windDirection" label="风向°" width="auto" />
    <el-table-column prop="weather" label="天气" width="auto" />
    <el-table-column
      v-if="!readonly"
      label="操作"
      min-width="70"
      align="center"
      header-align="center"
    >
      <template #default="{ row }">
        <span
          v-if="!row.selected"
          class="op-btn select"
          @click="emit('select', row)"
          >＋ 选中</span
        >
        <span v-else class="op-btn selected" @click="emit('deselect', row)"
          >✔ 已选</span
        >
      </template>
    </el-table-column>
  </el-table>
  <div class="legend">
    <div class="legend-item">
      <span class="legend-dot blue"></span>
      <span>蓝色行 = 已选中</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  results: { type: Array, default: () => [] },
  selectedDateSet: { type: Set, default: () => new Set() },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(["select", "deselect"]);

const enhancedResults = computed(() => {
  return props.results.map((item) => ({
    ...item,
    selected: props.selectedDateSet.has(item.date),
  }));
});

function getRowClass({ row }) {
  return row.selected ? "row-selected" : "";
}

function cellStyle({ column }) {
  const style = {
    padding: "6px",
    border: "1px solid #ebeef5",
    color: "#606266",
  };
  if (column.property === "操作" || column.type === "index") {
    style["text-align"] = "center";
  }
  return style;
}

function headerCellStyle({ column }) {
  const style = {
    background: "#f5f7fa",
    color: "#303133",
    fontWeight: "600",
    padding: "8px 6px",
    border: "1px solid #ebeef5",
    whiteSpace: "nowrap",
  };
  if (column.label === "操作") {
    style["text-align"] = "center";
    style["color"] = "#1890ff";
  }
  return style;
}
</script>

<style scoped lang="scss">
.v2-query-table {
  width: 100%;
  font-size: 12px;

  :deep(.el-table__body tr) {
    &:hover > td {
      background: #f6ffed !important;
      border-top: 1px solid #b7eb8f !important;
      border-bottom: 1px solid #b7eb8f !important;
    }
  }

  :deep(.row-selected) {
    background: #e6f7ff !important;
  }

  :deep(.el-table__body td) {
    border: 1px solid #ebeef5;
  }

  :deep(.el-table__header th) {
    border: 1px solid #ebeef5;
  }
}

.op-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &.select {
    background: #1890ff;
    color: #fff;

    &:hover {
      background: #40a9ff;
    }
  }

  &.selected {
    background: #ff4d4f;
    color: #fff;

    &:hover {
      background: #ff7875;
    }
  }
}

.legend {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 12px;
  color: #606266;
  padding: 8px 0 4px;
  flex-wrap: wrap;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;

  &.blue {
    background: #e6f7ff;
    border: 1px solid #91d5ff;
  }
}
</style>
