<template>
  <div class="config-form">
    <!-- 模式选择 -->
    <div class="form-section">
      <div class="field-label">负荷预测模式</div>
      <div class="mode-radio-group">
        <label class="mode-option" :class="{ active: mode === 'T' }">
          <input type="radio" :checked="mode === 'T'" @change="setMode('T')" />
          总负荷预测
        </label>
        <label class="mode-option" :class="{ active: mode === 'S' }">
          <input type="radio" :checked="mode === 'S'" @change="setMode('S')" />
          分项负荷预测
        </label>
      </div>
    </div>

    <template v-if="mode == 'S'">
      <div class="form-section">
        <div class="field-label">客户类型 <span class="optional-tag">（可选）</span></div>
        <el-select
          v-model="form.customer_type"
          placeholder="请选择客户类型"
          class="plain-select"
          :disabled="isContinue"
        >
          <el-option label="医院" value="hospital" />
          <el-option label="商超" value="mall" />
          <el-option label="离散工业" value="discrete" />
          <el-option label="连续工业" value="continuous" />
        </el-select>
      </div>

      <div class="form-section">
        <div class="field-label">光伏配置 <span class="optional-tag">（可选）</span></div>
        <div class="pill-radio-group">
          <label class="pill-option" :class="{ active: form.pv_config === 'yes' }">
            <input type="radio" v-model="form.pv_config" value="yes" :disabled="isContinue" />
            有
          </label>
          <label class="pill-option" :class="{ active: form.pv_config === 'no' }">
            <input type="radio" v-model="form.pv_config" value="no" :disabled="isContinue" />
            无
          </label>
          <label class="pill-option" :class="{ active: form.pv_config === 'unknown' }">
            <input type="radio" v-model="form.pv_config" value="unknown" :disabled="isContinue" />
            不确定
          </label>
        </div>
      </div>

      <div class="form-section" v-if="form.pv_config == 'yes'">
        <div class="field-label">装机容量（kWp）</div>
        <input
          type="number"
          v-model.number="form.pv_capacity"
          class="plain-input"
          placeholder="请输入装机容量"
          required
          min="0"
          step="any"
          :disabled="isContinue"
        />
      </div>
    </template>

    <div class="form-section">
      <div class="field-label">地点</div>
      <el-cascader
        v-model="form.location"
        :options="mode === 'T' ? provinceOptions : locationOptions"
        :props="cascaderProps"
        :placeholder="mode === 'T' ? '请选择省份' : '请选择省/市/区'"
        :show-all-levels="mode !== 'T'"
        clearable
        filterable
        class="plain-select"
        :disabled="isContinue"
      />
    </div>

    <div class="form-section">
      <div class="field-label">预测类型</div>
      <el-select
        v-model="form.forecast_range"
        placeholder="请选择预测类型"
        class="plain-select"
        :disabled="isContinue"
      >
        <el-option label="D-4 -> D+1、D+2、D+3【注：4天前用电量 → 预测未来3天分时负荷】" value="D-4" />
        <el-option label="D-3 -> D+1、D+2、D+3【注：3天前用电量 → 预测未来3天分时负荷】" value="D-3" />
        <el-option label="D-2 -> D+1、D+2、D+3【注：2天前用电量 → 预测未来3天分时负荷】" value="D-2" />
        <el-option label="D-1 -> D+1、D+2、D+3【注：1天前用电量 → 预测未来3天分时负荷】" value="D-1" />
      </el-select>
    </div>

    <!-- 预测日信息展示 -->
    <div v-if="showPredictionDate" class="prediction-date-box">
      <div class="prediction-date-title">预测日</div>
      <div class="prediction-tags">
        <span
          v-for="(day, index) in predictionDays"
          :key="index"
          class="prediction-tag"
          :class="day.type"
        >
          {{ day.date }} {{ day.weekday }} · {{ day.typeText }}
        </span>
      </div>
    </div>

    <div class="form-section" v-if="mode == 'S'">
      <div class="field-label">上传负荷数据的单位</div>
      <div class="pill-radio-group">
        <label class="pill-option" :class="{ active: form.unit === 'MW' }">
          <input type="radio" v-model="form.unit" value="MW" />
          MW 兆瓦
        </label>
        <label class="pill-option" :class="{ active: form.unit === 'kW' }">
          <input type="radio" v-model="form.unit" value="kW" />
          kW 千瓦
        </label>
      </div>
      <div class="peak-load-warning" v-if="maxVal_tipText">
        <span>请确认单位选择是否正确</span>
      </div>
    </div>

    <!-- 标记名称 -->
    <div class="form-section mark-name-section">
      <div class="field-label">
        <span class="optional-badge">选填</span>
        <span class="optional-text">标记名称</span>
      </div>
      <input
        type="text"
        v-model.trim="form.mark_name"
        class="plain-input"
        maxlength="15"
        :disabled="isContinue"
        placeholder="输入名称，不超过15字"
      />
    </div>

    <!-- 提示 -->
    <div class="form-tip">
      <span>建议上传至少1年以上的历史数据，可获得更好的预测准确度</span>
    </div>

    <div v-if="isContinue" class="continue-form-tip">
      由于您正在基于已有模型进行预测，原有配置不可改
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request";
import { addDays, format } from "date-fns";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();

const unit = computed(() => forecastStore.formData.unit);
const maxVal_tipText = computed(() => {
  if (!forecastStore.excelInfo || !forecastStore.excelInfo.maxLoad)
    return false;
  const val = forecastStore.excelInfo.maxLoad.val;
  if (unit.value == "kW" && val < 50) {
    return true;
  }
  return false;
});

const isContinue = computed(() => forecastStore.isContinue);

const mode = computed(() => forecastStore.mode);

const provinceOptions = computed(() => {
  return locationOptions.value.map((province) => ({
    value: province.value,
    label: province.label,
    children: undefined,
  }));
});

const cascaderProps = computed(() => {
  const baseProps = {
    value: "label",
    label: "label",
    expandTrigger: "hover",
  };

  if (mode.value === "T") {
    return {
      ...baseProps,
      leaf: () => true,
      children: undefined,
    };
  }

  return {
    ...baseProps,
    children: "children",
  };
});

const form = computed({
  get: () => forecastStore.formData,
  set: (value) => forecastStore.updateFormData(value),
});

const locationOptions = ref([]);

const SURPPORT_PROVINCES = [
  "44",
  "61",
  "14",
  "37",
  "62",
  "42",
  "33",
  "51",
  "32",
  "36",
  "64",
  "34",
  "13",
  "21",
];

onMounted(async () => {
  try {
    const response = await request.get("/api/locationtree");
    if (response.data.code === 200) {
      const list = response.data.data;
      locationOptions.value = list;
    }
  } catch (error) {
    console.error("获取省市区数据失败:", error);
  }
});

function setMode(val) {
  if (val !== mode.value) {
    forecastStore.switchMode();
  }
}

defineExpose({
  isValid: computed(() => forecastStore.isValid),
});

const showPredictionDate = computed(() => {
  return forecastStore.excelInfo && form.value.forecast_range;
});

function getDayCount(forecastRange) {
  if (mode.value === "T") {
    return 3;
  } else {
    return 1;
  }
}

function getDaysToAdd(forecastRange) {
  const offsetMap = {
    "D-1": 2,
    "D-2": 3,
    "D-3": 4,
    "D-4": 5,
  };
  return offsetMap[forecastRange] || 2;
}

const predictionDays = computed(() => {
  if (!forecastStore.excelInfo || !form.value.forecast_range) return [];

  const forecastRange = form.value.forecast_range;
  const endDate = new Date(forecastStore.excelInfo.dateRange[1]);
  const baseDaysToAdd = getDaysToAdd(forecastRange);
  const dayCount = getDayCount(forecastRange);

  const days = [];
  for (let i = 0; i < dayCount; i++) {
    const predictionDate = addDays(endDate, baseDaysToAdd + i);
    const dateStr = format(predictionDate, "yyyy-MM-dd");
    const weekday = getWeekday(predictionDate);
    const type = getDateType(predictionDate);

    days.push({
      date: dateStr,
      weekday: weekday,
      type: type,
      typeText: getDateTypeText(type),
      typeIcon: getDateTypeIcon(type),
    });
  }
  return days;
});

function getWeekday(date) {
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `星期${weekdays[date.getDay()]}`;
}

function getDateType(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return "weekend";
  }
  return "weekday";
}

function getDateTypeText(type) {
  const typeMap = {
    weekday: "工作日",
    weekend: "周末",
    holiday: "节假日",
  };
  return typeMap[type] || type;
}

function getDateTypeIcon(type) {
  const iconMap = {
    weekday: "bi-briefcase",
    weekend: "bi-emoji-sunglasses",
    holiday: "bi-balloon",
  };
  return iconMap[type] || "bi-briefcase";
}

watch(
  () => form.value.forecast_range,
  () => {},
);
</script>

<style lang="scss" scoped>
.config-form {
  background-color: #fff;
}

.form-section {
  margin-bottom: 16px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.optional-tag {
  font-size: 0.7rem;
  color: #999;
  font-weight: 400;
}

.optional-badge {
  font-size: 0.7rem;
  color: #999;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 6px;
  font-weight: normal;
}

.optional-text {
  color: #5e5e5e;
}

/* 模式选择 */
.mode-radio-group {
  display: flex;
  gap: 12px;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 14px;
  background: #fff;
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid #eee;
  color: #666;

  input { accent-color: #2b6cb5; }

  &.active {
    background: #f0f4ff;
    color: #2b6cb5;
    font-weight: 500;
    border-color: transparent;
  }
}

/* 胶囊式单选组 */
.pill-radio-group {
  display: flex;
  gap: 10px;
}

.pill-option {
  padding: 4px 14px;
  background: #f8f8f8;
  border-radius: 4px;
  font-size: 0.82rem;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  input { display: none; }

  &.active {
    background: #f0f4ff;
    color: #2b6cb5;
    font-weight: 500;
  }
}

/* 朴素输入框 */
.plain-input {
  height: 34px;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 0.82rem;
  color: #333;
  width: 100%;
  border: none;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background: #f0f0f0;
    color: #bbb;
  }
}

/* el-select / el-cascader 朴素样式 */
:deep(.plain-select) {
  width: 100%;

  .el-select__wrapper,
  .el-cascader__wrapper {
    background: #f8f8f8;
    border: none;
    border-radius: 4px;
    height: 34px;
    box-shadow: none;
    padding: 0 12px;
  }

  .el-select__placeholder,
  .el-cascader__placeholder {
    color: #999;
    font-size: 0.82rem;
  }

  .el-select__selected-item,
  .el-cascader__label {
    font-size: 0.82rem;
    color: #333;
  }

  .el-icon {
    font-size: 14px;
  }
}

/* 预测日区块 */
.prediction-date-box {
  padding: 12px;
  background: #f8fafc;
  margin-bottom: 16px;
}

.prediction-date-title {
  font-size: 0.82rem;
  font-weight: 500;
  color: #2b6cb5;
  margin-bottom: 8px;
}

.prediction-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prediction-tag {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 4px;

  &.weekday {
    background: #e8f0fe;
    color: #2b6cb5;
  }

  &.weekend {
    background: #f3e8ff;
    color: #7c3aed;
  }

  &.holiday {
    background: #fce8e6;
    color: #c62828;
  }
}

/* 峰值警告 */
.peak-load-warning {
  font-size: 0.75rem;
  color: #8a6d3b;
  margin-top: 6px;
}

/* 标记名称区域（带分隔线） */
.mark-name-section {
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* 底部提示 */
.form-tip {
  font-size: 0.78rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  padding: 10px 12px;
  margin-top: 4px;
}

.continue-form-tip {
  font-size: 0.78rem;
  color: #888;
  margin-top: 10px;
}
</style>
