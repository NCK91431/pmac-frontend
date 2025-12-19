<template>
    <div class="config-form card border-0 shadow-sm p-3 h-100">
        <!-- 提示  Start -->
        <!-- <div class="tip-card mb-4" v-if="mode == 'T'">
            <div class="tip-content">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
                <div class="tip-text">
                    当前的
                    <span class="highlight-term-simple">总负荷预测模式</span>
                    针对
                    <span class="highlight-term-simple">售电公司</span>，
                    <br />若您是
                    <span class="highlight-term-simple">单个用电用户 </span
                    >请切换至
                    <el-text class="switch-text" @click="switchMode">
                        分项负荷预测 <el-icon> <TopRight /> </el-icon>
                    </el-text>
                    模式。
                </div>
            </div>
        </div> -->
        <!-- 提示  End   -->
        <template v-if="mode == 'S'">
            <div class="mb-3">
                <label class="form-label fw-bold">客户类型</label>
                <el-select
                    v-model="form.customer_type"
                    placeholder="请选择客户类型"
                    class="w-100"
                    :disabled="isContinue"
                >
                    <el-option label="医院" value="hospital" />
                    <el-option label="商超" value="mall" />
                    <el-option label="离散工业" value="discrete" />
                    <el-option label="连续工业" value="continuous" />
                </el-select>
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">光伏配置</label>
                <div class="d-flex gap-3">
                    <div class="form-check">
                        <input
                            v-model="form.pv_config"
                            class="form-check-input"
                            type="radio"
                            value="yes"
                            id="pvYes"
                            :disabled="isContinue"
                        />
                        <label class="form-check-label" for="pvYes">有</label>
                    </div>
                    <div class="form-check">
                        <input
                            v-model="form.pv_config"
                            class="form-check-input"
                            type="radio"
                            value="no"
                            id="pvNo"
                            :disabled="isContinue"
                        />
                        <label class="form-check-label" for="pvNo">无</label>
                    </div>
                    <div class="form-check">
                        <input
                            v-model="form.pv_config"
                            class="form-check-input"
                            type="radio"
                            value="unknown"
                            id="pvUnknown"
                            :disabled="isContinue"
                        />
                        <label class="form-check-label" for="pvUnknown"
                            >不确定</label
                        >
                    </div>
                </div>
            </div>

            <!-- 新增装机容量输入框，仅在选择"有"时显示 -->
            <div class="mb-3" v-if="form.pv_config == 'yes'">
                <label class="form-label fw-bold">装机容量 (kWp)</label>
                <input
                    type="number"
                    v-model.number="form.pv_capacity"
                    class="form-control"
                    placeholder="请输入装机容量"
                    required
                    min="0"
                    step="any"
                    :disabled="isContinue"
                />
            </div>
        </template>

        <div class="mb-3">
            <label class="form-label fw-bold">地点</label>
            <el-cascader
                v-model="form.location"
                :options="mode === 'T' ? provinceOptions : locationOptions"
                :props="cascaderProps"
                :placeholder="mode === 'T' ? '请选择省份' : '请选择省/市/区'"
                :show-all-levels="mode !== 'T'"
                clearable
                filterable
                class="w-100"
                :disabled="isContinue"
            />
        </div>

        <div class="mb-3">
            <label class="form-label fw-bold">预测类型</label>
            <el-select
                v-model="form.forecast_range"
                placeholder="请选择预测类型"
                class="w-100"
                :disabled="isContinue"
            >
                <el-option
                    label="D-4 -> D+1、D+2、D+3 【注：4天前用电量 → 预测未来三天分时负荷】"
                    value="D-4"
                />
                <el-option
                    label="D-3 -> D+1 【注：3天前用电量 → 预测未来一天分时负荷】"
                    value="D-3"
                />
                <el-option
                    label="D-2 -> D+1 【注：2天前用电量 → 预测未来一天分时负荷】"
                    value="D-2"
                />
                <el-option
                    label="D-1 -> D+1 【注：1天前用电量 → 预测未来一天分时负荷】"
                    value="D-1"
                />
            </el-select>
        </div>

        <!-- 预测日信息展示 -->
        <div v-if="showPredictionDate" class="prediction-date-container mb-3">
            <div class="prediction-title">
                <i class="bi bi-calendar2-week me-2"></i>预测日
            </div>
            <div class="date-info">
                <div
                    v-for="(day, index) in predictionDays"
                    :key="index"
                    class="day-item"
                >
                    <div class="selected-date-display">
                        <i class="bi bi-calendar-event me-1"></i>
                        {{ day.date }}
                    </div>
                    <div class="weekday">
                        <i class="bi bi-calendar-week me-1"></i>
                        {{ day.weekday }}
                    </div>
                    <div class="date-type" :class="day.type">
                        <i class="me-1" :class="day.typeIcon"></i>
                        {{ day.typeText }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 选择数据单位 -->
        <div class="mb-3" v-if="mode == 'S'">
            <label class="form-label fw-bold"
                >上传负荷数据的单位：{{
                    form.unit + ` ${form.unit == "MW" ? "兆瓦" : "千瓦"}`
                }}
            </label>
            <el-radio-group class="w-100" v-model="form.unit" size="small">
                <el-radio-button label="MW" value="MW" />
                <el-radio-button label="kW" value="kW" />
            </el-radio-group>
            <!-- 峰值负荷警告提示 Start -->
            <div class="peak-load-warning mb-3 mt-3" v-if="maxVal_tipText">
                <div class="warning-content">
                    <div class="warning-icon">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div class="warning-text">
                        <span>请确认单位选择是否正确</span>
                    </div>
                </div>
            </div>
            <!-- 峰值负荷警告提示 END -->
        </div>

        <!-- 取别名 -->
        <el-divider />
        <div class="mb-3">
            <label class="form-label fw-bold">
                <span class="optional-badge">选填</span>
                <span class="optional-text">标记名称</span>
            </label>
            <input
                type="text"
                v-model.trim="form.mark_name"
                class="form-control optional-field"
                maxlength="15"
                :disabled="isContinue"
            />
            <span class="optional-tip">
                <i class="bi bi-info-circle-fill"></i>
                你可以给此次建模取名，不超过15字
            </span>
        </div>

        <div v-if="isContinue" class="continue-form-tip">
            <el-text type="info" size="small">
                <el-icon><InfoFilled /></el-icon>
                由于您正在基于已有模型进行预测，原有配置不可改
            </el-text>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import request from "@/utils/request";
import { InfoFilled, TopRight } from "@element-plus/icons-vue";
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

const mode = computed(() => forecastStore.mode); // 预测模式

// 添加一个计算属性来获取省份数据
const provinceOptions = computed(() => {
    return locationOptions.value.map((province) => ({
        value: province.value,
        label: province.label,
        // 清空children以确保不能选择下级
        children: undefined,
    }));
});

// 配置级联选择器属性
const cascaderProps = computed(() => {
    const baseProps = {
        value: "label",
        label: "label",
        expandTrigger: "hover",
    };

    // 当mode为'T'时，禁用children选择
    if (mode.value === "T") {
        return {
            ...baseProps,
            // 设置为叶子节点，防止展开
            leaf: () => true,
            // 禁用子选项
            children: undefined,
        };
    }

    return {
        ...baseProps,
        children: "children",
    };
});

// 表单数据双向绑定
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
]; // 仅支持广东省和山西、山东、甘肃、湖北、浙江、四川、江苏、江西、宁夏、安徽、河北、辽宁

// 获取省市区数据
onMounted(async () => {
    try {
        const response = await request.get("/api/locationtree");
        if (response.data.code === 200) {
            const list = response.data.data;
            const filteredList = list.filter((item) =>
                SURPPORT_PROVINCES.includes(item.value)
            );
            locationOptions.value = filteredList;
        }
    } catch (error) {
        console.error("获取省市区数据失败:", error);
    }
});

defineExpose({
    isValid: computed(() => forecastStore.isValid),
});

/* ---------------- 切换模式 -----------------*/
function switchMode() {
    forecastStore.switchMode();
}

/* ------------ 新增：预测日计算和展示 ------------ */
const showPredictionDate = computed(() => {
    return forecastStore.excelInfo && form.value.forecast_range;
});

// 计算预测日（返回数组）
const predictionDays = computed(() => {
    if (!forecastStore.excelInfo || !form.value.forecast_range) return [];

    const endDate = new Date(forecastStore.excelInfo.dateRange[1]);
    const baseDaysToAdd = getDaysToAdd(form.value.forecast_range);
    const dayCount = getDayCount(form.value.forecast_range);

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
    console.log(days);
    return days;
});

// 获取预测天数
function getDayCount(forecastRange) {
    const map = {
        "D-4": 3, // 预测未来3天
        "D-3": 1, // 预测未来1天
        "D-2": 1, // 预测未来1天
        "D-1": 1, // 预测未来1天
    };
    return map[forecastRange] || 1;
}

// 根据预测类型计算需要添加的天数（基值）
function getDaysToAdd(forecastRange) {
    const map = {
        "D-4": 2, // 结束日期 + 2天开始预测（D+1, D+2, D+3）
        "D-3": 2, // 结束日期 + 2天（D+1）
        "D-2": 2, // 结束日期 + 2天（D+1）
        "D-1": 2, // 结束日期 + 2天（D+1）
    };
    return map[forecastRange] || 2;
}

// 获取星期几
function getWeekday(date) {
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `星期${weekdays[date.getDay()]}`;
}

// 判断日期类型
function getDateType(date) {
    const day = date.getDay();
    // 0是周日，6是周六
    if (day === 0 || day === 6) {
        return "weekend";
    }
    // 这里可以扩展节假日判断
    return "weekday";
}

// 日期类型文本
function getDateTypeText(type) {
    const typeMap = {
        weekday: "工作日",
        weekend: "周末",
        holiday: "节假日",
    };
    return typeMap[type] || type;
}

// 日期类型图标
function getDateTypeIcon(type) {
    const iconMap = {
        weekday: "bi-briefcase",
        weekend: "bi-emoji-sunglasses",
        holiday: "bi-balloon",
    };
    return iconMap[type] || "bi-briefcase";
}

// 监听预测类型变化，重新计算预测日
watch(
    () => form.value.forecast_range,
    () => {
        // 计算属性会自动更新，这里不需要额外操作
    }
);
</script>

<style lang="scss" scoped>
.config-form {
    background-color: #fff;
    border-radius: 6px;
    .tip-card {
        background: linear-gradient(
            135deg,
            #f0f7ff 0%,
            #e6f3ff 50%,
            #f0f7ff 100%
        );
        border: 1px solid #d1e9ff;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);

        .tip-content {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .tip-icon {
            color: #1890ff;
            font-size: 18px;
            margin-top: 2px;
            flex-shrink: 0;
        }

        .tip-text {
            color: #333;
            font-size: 14px;
            line-height: 1.5;
            font-weight: 400;
        }

        .highlight-term {
            color: #1890ff;
            font-weight: 600;
            background: rgba(24, 144, 255, 0.08);
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid rgba(24, 144, 255, 0.2);
        }

        .highlight-term-simple {
            color: #1565c0;
            font-weight: 600;
            font-size: 1.05em;
        }
        .switch-text {
            color: #409eff;
            cursor: pointer;
            text-decoration: underline;
            font-weight: bolder;
            padding: 0 2px;
        }
    }

    .form-label {
        font-size: 14px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        .optional-badge {
            font-size: 0.7rem;
            color: #909399;
            background-color: #f4f4f5;
            padding: 2px 6px;
            border-radius: 4px;
            margin-right: 6px;
            font-weight: normal;
        }
        .optional-text {
            color: #5e5e5e;
        }
    }
    .optional-field {
        border: 1px solid #e4e7ed;
        &:disabled {
            background-color: #f5f7fa;
            color: #c0c4cc;
        }
    }
    .optional-tip {
        font-weight: normal;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        color: #909399;
    }
}

.peak-load-warning {
    background: linear-gradient(135deg, #fff8e6, #fffbeb);
    border: 1px solid #ffd666;
    border-radius: 5px;
    padding: 8px 0 8px 12px;
    box-shadow: 0 2px 8px rgba(255, 182, 29, 0.1);
    animation: fadeInUp 0.5s ease;
    .warning-content {
        display: flex;
        align-items: flex-start;
        gap: 5px;
        .warning-icon {
            color: #ff9900;
            font-size: 1rem;
            flex-shrink: 0;
        }

        .warning-text {
            color: #8a6d3b;
            font-size: 0.8rem;
            line-height: 1.9;

            .highlight-user {
                color: #e74c3c;
                font-weight: 700;
                background: linear-gradient(135deg, #ffece8, #ffdbd6);
                padding: 2px 6px;
                border-radius: 4px;
                margin: 0 2px;
                border: 1px solid #ffcdc2;
                text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
            }

            .switch-text {
                color: #8a6d3b;
                cursor: pointer;
                text-decoration: underline;
                font-weight: bolder;
                padding: 0 2px;
            }
        }
    }

    &:hover {
        border-color: #ff9900;
        box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15);
        transform: translateY(-1px);
        transition: all 0.3s ease;
    }
}

/* 预测日信息样式 */
.prediction-date-container {
    background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
    border: 1px solid;
    border-image: linear-gradient(135deg, #3498db, #2c6fbb) 0.4;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 16px;

    .prediction-title {
        font-weight: 600;
        color: #2c6fbb;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        white-space: nowrap;

        i {
            font-size: 1rem;
            color: #3498db;
        }
    }

    .date-info {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    .day-item {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .selected-date-display,
        .weekday,
        .date-type {
            display: flex;
            align-items: center;
            min-height: 28px;
            font-size: 0.8rem;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 500;
        }

        .selected-date-display {
            color: #1890ff;
            background-color: rgba(24, 144, 255, 0.08);
            border: 1px solid rgba(24, 144, 255, 0.2);
        }

        .weekday {
            background: rgba(44, 111, 187, 0.08);
            color: #2c6fbb;
            border: 1px solid rgba(44, 111, 187, 0.2);
        }

        .date-type {
            &.weekday {
                background: rgba(76, 175, 80, 0.08);
                color: #4caf50;
                border: 1px solid rgba(76, 175, 80, 0.2);
            }

            &.weekend {
                background: rgba(156, 39, 176, 0.08);
                color: #9c27b0;
                border: 1px solid rgba(156, 39, 176, 0.2);
            }

            &.holiday {
                background: linear-gradient(135deg, #fff1f0 0%, #ffefed 100%);
                color: #cf1322;
                border: 1px solid rgba(244, 67, 54, 0.2);
            }
        }
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .prediction-date-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;

        .day-item {
            width: 100%;
            justify-content: space-between;
        }
    }
}
</style>
