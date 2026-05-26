<template>
  <div class="v2-table-wrapper">
    <el-table
      :data="props.dates"
      border
      class="v2-table"
      style="width: 100%"
      :row-class-name="getSelectedRowClass"
    >
      <el-table-column type="index" label="#" width="auto" align="center" />
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
      <el-table-column
        prop="cloudCoverAfternoon"
        label="下午云量"
        width="auto"
      />
      <el-table-column prop="cloudCoverEvening" label="晚上云量" width="auto" />
      <el-table-column prop="windSpeed" label="风速" width="auto" />
      <el-table-column prop="windDirection" label="风向°" width="auto" />
      <el-table-column prop="weather" label="天气" width="auto" />
      <el-table-column
        v-if="!readonly"
        label="操作"
        width="110"
        align="center"
        fixed="right"
        :header-cell-style="{ color: '#ff4d4f', textAlign: 'center' }"
      >
        <template #default="{ row }">
          <span class="remove-btn" @click="emit('remove', row.date)">
            ✕ 移除
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <div class="v2-legend">
    <div class="legend-item">
      <span class="legend-dot blue"></span> 蓝色行 = 从查询结果选中
    </div>
    <div class="legend-item">
      <span class="legend-dot orange"></span> 橙色行 = 手动添加插入
    </div>
    <span class="text-muted">⬇ 日期按由近到远排序</span>
  </div>
</template>

<script setup>
const props = defineProps({
  dates: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['remove'])

function getSelectedRowClass({ row }) {
  return row.isManual ? "row-added" : "row-selected";
}
</script>

<style scoped lang="scss">
.v2-table-wrapper {
  overflow-x: auto;

  :deep(.el-table) {
    border: none;
    font-size: 12px;
    color: #606266;

    &::before {
      display: none;
    }

    &::after {
      display: none;
    }
  }

  :deep(.el-table__inner-wrapper) {
    border: none;
  }

  :deep(th.el-table__cell) {
    background: #f5f7fa !important;
    color: #303133;
    font-weight: 600;
    padding: 0;
    border: 1px solid #ebeef5 !important;

    .cell {
      padding: 8px 6px;
      line-height: 1.4;
      white-space: nowrap;
    }
  }

  :deep(td.el-table__cell) {
    padding: 0;
    border: 1px solid #ebeef5;
    color: #606266;

    .cell {
      padding: 6px;
      line-height: 1.4;
    }
  }

  :deep(.el-table__body tr:hover > td.el-table__cell) {
    background: #f5f7fa !important;
  }

  :deep(.el-table__body tr.el-table__row--striped > td.el-table__cell) {
    background: #fafafa;
  }

  :deep(.el-table__body tr.el-table__row--striped:hover > td.el-table__cell) {
    background: #f5f7fa !important;
  }

  :deep(.v2-table .row-selected) {
    background-color: #e6f7ff !important;
  }

  :deep(.v2-table .row-added) {
    background-color: #fffbe6 !important;
  }
}

.v2-legend {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 2px;

  &.blue {
    background: #e6f7ff;
    border: 1px solid #91d5ff;
  }

  &.orange {
    background: #fffbe6;
    border: 1px solid #ffe58f;
  }
}

.text-muted {
  color: #8c8c8c;
}

.remove-btn {
  color: #ff4d4f;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    color: #ff7875;
  }
}
</style>
