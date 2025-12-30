<template>
    <div class="record-detail">
        <!-- 负荷特性分析 -->
        <template v-if="result.load_stabilityindex && result.predictaBility">
            <Analysis
                :load_stabilityindex="result.load_stabilityindex"
                :predictaBility="result.predictaBility"
                class="mb-2"
            />
        </template>

        <div v-if="record.created_at" class="row mb-4">
            <!-- 基本信息 -->
            <div class="col-md-4">
                <div class="card info-card">
                    <div class="card-header">
                        <h5><i class="bi bi-info-circle"></i> 基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-key"></i> ID:
                            </div>
                            <div class="value">{{ record.id }}</div>
                        </div>
                        <div class="info-item mode">
                            <div class="label">
                                <i class="bi bi-aspect-ratio"></i> 预测模式:
                            </div>
                            <div class="value">
                                <span
                                    class="badge-custom"
                                    :class="'customer-' + record.mode"
                                    >{{
                                        record.mode == "T"
                                            ? "总负荷预测"
                                            : "分项负荷预测"
                                    }}</span
                                >
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-marker-tip"></i>
                                自定义名称:
                            </div>
                            <div class="value">
                                {{ record.mark_name || "未设置" }}
                            </div>
                            <div class="actions">
                                <button @click="openEditMarkNameDialog">
                                    <i class="bi bi-pencil"></i> 编辑
                                </button>
                            </div>
                        </div>
                        <div
                            class="info-item"
                            v-if="
                                record.upload_date_range &&
                                record.upload_date_range.length > 0
                            "
                        >
                            <div class="label">
                                <i class="bi bi-calendar4-week"></i>
                                上传数据:
                            </div>
                            <div class="value">
                                {{ record.upload_date_range[0] }} 至
                                {{ record.upload_date_range[1] }}
                            </div>
                            <div class="actions">
                                <button @click="downloadUploadExcel">
                                    <i class="bi bi-cloud-download"></i> 下载
                                </button>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-clipboard-pulse"></i> 预测日:
                            </div>
                            <el-tag type="success" style="font-size: 1rem">
                                {{ format_pred_dates }}</el-tag
                            >
                        </div>
                        <template v-if="record.mode == 'S'">
                            <div class="info-item">
                                <div class="label">
                                    <i class="bi bi-person"></i> 客户类型:
                                </div>
                                <div class="value">
                                    <span class="badge-custom">{{
                                        formatCustomerType(record.customer_type)
                                    }}</span>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="label">
                                    <i class="bi bi-sun"></i> 光伏配置:
                                </div>
                                <div class="value">
                                    <span
                                        v-if="record.pv_config === 'yes'"
                                        class="badge-custom badge-pv-yes"
                                        >有</span
                                    >
                                    <span
                                        v-else-if="record.pv_config === 'no'"
                                        class="badge-custom badge-pv-no"
                                        >无</span
                                    >
                                    <span
                                        v-else
                                        class="badge-custom badge-pv-unknown"
                                        >不确定</span
                                    >
                                </div>
                            </div>
                            <div
                                class="info-item"
                                v-if="record.pv_config == 'yes'"
                            >
                                <div class="label">
                                    <i class="bi bi-box-seam"></i> 装机容量:
                                </div>
                                <div class="value">
                                    {{
                                        record.pv_capacity
                                            ? record.pv_capacity
                                            : 0
                                    }}（kWp）
                                </div>
                            </div>
                        </template>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-geo-alt"></i> 地点:
                            </div>
                            <div class="value">
                                {{ record.location.join("-") }}
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-graph-up"></i> 预测类型:
                            </div>
                            <div class="value">
                                <span class="badge-custom forecast-badge">
                                    {{
                                        activeHistoryRecord.mode == "T"
                                            ? `${record.forecast_range} → D+1、D+2、D+3`
                                            : `${record.forecast_range} → D+1`
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="timestamp">
                            <i class="bi bi-clock"></i> 创建时间 :<br />
                            {{ new Date(record.created_at).toLocaleString() }}
                        </div>

                        <button
                            class="continue-btn btn btn-primary"
                            @click="continueForecast"
                        >
                            <i class="bi bi-lightning-charge me-2"></i>
                            继续预测
                        </button>
                    </div>
                </div>
            </div>
            <!-- 负荷预测结果 -->
            <div class="col-md-8" style="padding-left: 0">
                <div class="chart-card load card shadow-sm p-3 h-100">
                    <div class="header">
                        <h5 class="mb-3 text-success">
                            <i class="bi bi-graph-up"></i>负荷预测结果
                        </h5>
                        <!-- 日期信息展示部分 -->
                        <!-- 新增：预测日下拉框 -->
                        <div style="margin-right: 20px">
                            <el-radio-group v-model="selectedDay">
                                <el-radio value="D+1">D + 1</el-radio>
                                <el-radio value="D+2" :disabled="disabled_D2"
                                    >D + 2</el-radio
                                >
                                <el-radio value="D+3" :disabled="disabled_D3"
                                    >D + 3</el-radio
                                >
                            </el-radio-group>
                        </div>
                        <div class="date-info" v-if="result.date.value">
                            <div class="selected-date-display">
                                <i class="bi bi-calendar-event me-1"></i>
                                {{ result.date.value }}
                            </div>

                            <div class="weekday">
                                <i class="bi bi-calendar-week me-1"></i>
                                {{ getWeekday(result.date.value) }}
                            </div>
                            <div class="date-type" :class="result.date.type">
                                <i
                                    class="me-1"
                                    :class="{
                                        'bi-briefcase':
                                            result.date.type === 'weekday',
                                        'bi-emoji-sunglasses':
                                            result.date.type === 'weekend',
                                        'bi-balloon':
                                            result.date.type === 'holiday',
                                    }"
                                ></i>
                                {{ formatDateType(result.date.type) }}
                            </div>
                        </div>
                    </div>

                    <LoadChart
                        :loads="result.predictionData"
                        :date="result.date"
                        :similarDayLoad="result.similarDayLoad"
                        :unit="record.unit"
                    />
                    <div
                        v-if="
                            result.dataAnomaly &&
                            result.dataAnomaly.abnormal_flag
                        "
                        class="anomaly-alert"
                    >
                        <div class="anomaly-content">
                            <div class="anomaly-problem">
                                <i class="bi bi-exclamation-triangle-fill"></i>
                                <span class="anomaly-label">提示：</span>
                                <span class="anomaly-text">{{
                                    result.dataAnomaly.problem
                                }}</span>
                            </div>
                            <div class="anomaly-suggestion">
                                <i class="bi bi-lightbulb-fill"></i>
                                <span class="anomaly-label">建议：</span>
                                <span class="anomaly-text">{{
                                    result.dataAnomaly.suggestion
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="options">
                        <el-button
                            type="primary"
                            @click="downloadPredictionExcel"
                        >
                            <i class="bi bi-download me-2"></i>下载预测结果
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 天气预测结果 -->
        <div v-if="selectedCityWeather" class="row mb-4">
            <div class="col-md-4">
                <div class="card info-card">
                    <div class="card-header">
                        <h5><i class="bi bi-info-circle"></i> 天气信息</h5>
                    </div>
                    <WeatherInfo
                        :weather-info="selectedCityWeather.weatherInfo"
                    />
                </div>
            </div>
            <div
                class="col-md-8"
                style="padding-left: 0"
                v-if="cityWeatherForecast && cityWeatherForecast.length"
            >
                <div class="chart-card card shadow-sm p-3 h-100">
                    <div class="header">
                        <h5 class="h5 mb-3 text-success">
                            <i class="bi bi-cloud-sun me-2"></i>天气信息
                        </h5>
                        <div class="city-selector">
                            <el-select
                                v-model="selectedCityIndex"
                                placeholder="选择城市"
                                style="width: 300px"
                            >
                                <el-option
                                    v-for="(city, index) in cityWeatherForecast"
                                    :key="index"
                                    :label="city.location"
                                    :value="index"
                                />
                            </el-select>
                        </div>
                    </div>
                    <WeatherChart
                        :temperature-data="
                            selectedCityWeather.temperatureForecast
                        "
                        :irradiation-data="
                            selectedCityWeather.irradiationForecast
                        "
                    />
                </div>
            </div>
        </div>
    </div>
    <!-- 编辑标记名称的弹窗 -->
    <el-dialog
        v-model="editMarkNameDialogVisible"
        title="编辑标记名称"
        width="400px"
        center
    >
        <div class="edit-mark-name-dialog">
            <el-input
                v-model="editMarkName"
                placeholder="请输入标记名称（不超过15字）"
                maxlength="15"
                show-word-limit
                clearable
            />
            <div class="dialog-tip">
                <el-icon><InfoFilled /></el-icon>
                你可以给此次建模取名，不超过15字
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="editMarkNameDialogVisible = false"
                    >取消</el-button
                >
                <el-button
                    type="primary"
                    @click="saveMarkName"
                    :loading="saveLoading"
                >
                    确认
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import LoadChart from "../ResultSection/LoadChart.vue";
import WeatherChart from "../ResultSection/WeatherChart.vue";
import WeatherInfo from "../ResultSection/WeatherInfo.vue";
import Analysis from "../ConfigSection/components/Analysis.vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import { useLoadForecastStore } from "@/store/load";
import { tr } from "date-fns/locale";

const forecastStore = useLoadForecastStore();
const activeHistoryRecordId = computed(
    () => forecastStore.activeHistoryRecordId
); //用户在历史记录列表里选中的某条负荷预测记录
const activeHistoryRecord = computed(() => forecastStore.activeHistoryRecord);

const record = ref({});
const result = computed(() => record.value.result || {}); //后端返回的预测结果数据
const format_pred_dates = computed(() => {
    if (activeHistoryRecord.value.prediction_date) {
        return activeHistoryRecord.value.prediction_date.value;
    }
    if (
        activeHistoryRecord.value.pred_dates &&
        activeHistoryRecord.value.pred_dates.length
    ) {
        let str = activeHistoryRecord.value.pred_dates[0].value;
        if (activeHistoryRecord.value.pred_dates[1]) {
            const item_str = activeHistoryRecord.value.pred_dates[1].value;
            const item_arr = item_str.split("-");
            str += `、${item_arr[1]}-${item_arr[2]}`;
        }
        if (activeHistoryRecord.value.pred_dates[2]) {
            const item_str = activeHistoryRecord.value.pred_dates[2].value;
            const item_arr = item_str.split("-");
            str += `、${item_arr[1]}-${item_arr[2]}`;
        }
        return str;
    }
});

const disabled_D2 = computed(() => {
    return !(
        activeHistoryRecord.value.pred_dates &&
        activeHistoryRecord.value.pred_dates[1]
    );
});
const disabled_D3 = computed(() => {
    return !(
        activeHistoryRecord.value.pred_dates &&
        activeHistoryRecord.value.pred_dates[2]
    );
});
/*------------日期信息------------*/

const date_type = computed(() => result.date.type);

const selectedDay = ref("D+1");

// 获取星期几
const getWeekday = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `星期${weekdays[date.getDay()]}`;
};

// 格式化日期类型
const formatDateType = (type) => {
    const typeMap = {
        weekday: "工作日",
        weekend: "周末",
        holiday: "节假日",
    };
    return typeMap[type] || type;
};
/*------------天气预测------------*/
// 城市天气预测数据
const cityWeatherForecast = computed(
    () => (record.value.result && record.value.result.cityWeatherForecast) || []
);
// 当前选中的城市索引
const selectedCityIndex = ref(0);
// 当前选中的城市天气数据
const selectedCityWeather = computed(() => {
    return cityWeatherForecast.value[selectedCityIndex.value] || null;
});
// 监听城市天气数据变化，默认选择第一个城市
watch(
    cityWeatherForecast,
    (newVal) => {
        if (newVal && newVal.length > 0) {
            selectedCityIndex.value = 0;
        }
    },
    { immediate: true }
);
async function getRecordDetailById() {
    const id = activeHistoryRecordId.value;
    if (!id) {
        // ElMessage.error("记录ID不存在，无法获取详情");
        return;
    }
    const selected_day = selectedDay.value;
    const response = await request.get(`/api/history/${id}/${selected_day}`);
    record.value = response.data;
}
onMounted(() => {
    getRecordDetailById();
});
watch(activeHistoryRecordId, (newId) => {
    if (newId) {
        getRecordDetailById();
        selectedDay.value = "D+1";
    }
});
watch(selectedDay, (newDay) => {
    if (newDay) {
        getRecordDetailById();
    }
});

const formatCustomerType = (type) => {
    const types = {
        hospital: "医院",
        mall: "商超",
        discrete: "离散工业",
        continuous: "连续工业",
    };
    return types[type] || type;
};

const emit = defineEmits(["close"]);

/*------------下载用户上传的excel文件------------*/
async function downloadUploadExcel() {
    const id = activeHistoryRecordId.value;
    if (!id) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = id + "_upload.xlsx";

    try {
        ElMessage.success(`正在下载您上传的文件${fileName}`);
        // 发送下载请求
        const response = await request.get(
            `/api/history/${id}/download/upload`,
            {
                responseType: "blob",
            }
        );
        const blob = new Blob([response.data]); // 创建Blob对象并保存文件
        saveAs(blob, fileName);
    } catch (error) {
        // 处理错误响应（如后端返回JSON错误信息）
        if (error.response?.data?.type?.includes("application/json")) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorData = JSON.parse(reader.result);
                    ElMessage.error(`下载失败: ${errorData.error}`);
                } catch {
                    ElMessage.error("未知错误");
                }
            };
            reader.readAsText(error.response.data);
        } else {
            ElMessage.error("文件下载失败");
        }
    }
}
/*------------下载预测结果excel文件------------*/
async function downloadPredictionExcel() {
    const id = activeHistoryRecordId.value;
    if (!id) {
        ElMessage.error("记录ID不存在，无法下载文件");
        return;
    }
    const fileName = id + "_prediction.xlsx";

    try {
        ElMessage.success(`正在生成预测结果Excel文件${fileName}`);
        // 发送下载请求
        const response = await request.get(
            `/api/history/${id}/download/prediction`,
            {
                responseType: "blob",
            }
        );
        const blob = new Blob([response.data]); // 创建Blob对象并保存文件
        saveAs(blob, fileName);
    } catch (error) {
        // 处理错误响应（如后端返回JSON错误信息）
        if (error.response?.data?.type?.includes("application/json")) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorData = JSON.parse(reader.result);
                    ElMessage.error(`下载失败: ${errorData.error}`);
                } catch {
                    ElMessage.error("未知错误");
                }
            };
            reader.readAsText(error.response.data);
        } else {
            ElMessage.error("文件下载失败");
        }
    }
}
/*------------ 继续预测 ------------*/
const continueForecast = () => {
    // 如果用户正处在预测进行状态中不可使用
    if (forecastStore.stage == 1) {
        ElMessage.error("您有预测正在进行中，请待预测完成后再使用此功能");
        return;
    }

    // 便于计算一些属性
    const [start, end] = record.value.upload_date_range;
    forecastStore.setContinueData({
        end_date: record.value.upload_date_range[1],
        upload_date_range: record.value.upload_date_range,
        upload_date_range_format_text: `${start} 至 ${end}`,
    });

    // 预填表单
    forecastStore.updateFormData({
        customer_type: record.value.customer_type,
        pv_config: record.value.pv_config,
        location: record.value.location,
        forecast_range: record.value.forecast_range,
        previous_record_id: record.value.id,
    });

    forecastStore.setMode(record.value.mode); // 设置预测模式

    forecastStore.removeFile(); //清空文件

    forecastStore.resetStage(); // 重置stage
};

/*------------ 编辑标记名称 ------------*/
const editMarkNameDialogVisible = ref(false);
const editMarkName = ref("");
const saveLoading = ref(false);

// 打开编辑对话框
const openEditMarkNameDialog = () => {
    editMarkName.value = record.value.mark_name || "";
    editMarkNameDialogVisible.value = true;
};

// 保存标记名称
const saveMarkName = async () => {
    if (editMarkName.value.trim().length > 15) {
        ElMessage.error("标记名称不能超过15字");
        return;
    }

    saveLoading.value = true;
    try {
        const response = await request.post("/api/history/update_mark_name", {
            record_id: record.value.id,
            mark_name: editMarkName.value.trim(),
        });

        if (response.data.success) {
            ElMessage.success("标记名称修改成功");
            // 触发历史记录列表刷新
            forecastStore.triggerRefreshHistoryList();
            // 更新本地数据
            record.value.mark_name = editMarkName.value.trim();
            editMarkNameDialogVisible.value = false;
        } else {
            ElMessage.error(response.data.error || "修改失败");
        }
    } catch (error) {
        console.error("修改标记名称失败:", error);
        ElMessage.error("修改标记名称失败");
    } finally {
        saveLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.record-detail {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .info-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: none;
        overflow: hidden;
        height: 100%;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            background: linear-gradient(135deg, #3498db, #1a5f9e);
            color: white;
            padding: 18px 20px;
            border-bottom: none;
            position: relative;

            h5 {
                font-weight: 600;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;

                i {
                    font-size: 1.4rem;
                }
            }
        }

        .card-body {
            padding: 25px;
            padding-bottom: 0;
        }

        .info-item {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            align-items: center;

            &:last-child {
                border-bottom: none;
            }

            .label {
                width: 120px;
                font-weight: 500;
                color: #7f8c8d;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .value {
                flex: 1;
                color: #2c3e50;
                font-weight: 500;
                display: flex;
                align-items: center;
                .badge-custom {
                    background-color: #e3f2fd;
                    color: #1a73e8;
                    font-weight: 500;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;

                    &.badge-pv-yes {
                        background-color: #e8f5e9;
                        color: #2e7d32;
                    }

                    &.badge-pv-no {
                        background-color: #ffebee;
                        color: #c62828;
                    }

                    &.badge-pv-unknown {
                        background-color: #fff8e1;
                        color: #f57f17;
                    }

                    &.forecast-badge {
                        background-color: #f3e5f5;
                        color: #9c27b0;
                    }
                }
            }
            &.mode {
                .badge-custom {
                    font-weight: 500;
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                }
                .customer-S {
                    background-color: rgba(155, 89, 182, 0.1);
                    color: #9b59b6;
                }
                .customer-T {
                    background-color: rgba(52, 152, 219, 0.1);
                    color: #3498db;
                }
            }
            .actions button {
                border: none;
                background: transparent;
                color: #3498db;
                padding: 5px 10px;
                border-radius: 4px;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                font-size: 0.9rem;
                gap: 5px;
                &:hover {
                    background-color: #e3f2fd;
                }
            }
        }

        .card-footer {
            background-color: #f8f9fa;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
            color: #7f8c8d;
            .continue-btn {
                justify-content: flex-end;
                margin-left: auto;
            }
            .timestamp {
                font-style: italic;
            }
        }
    }

    .chart-card {
        background-color: #fff;
        &.load {
            display: flex;
            flex-direction: column;
            // 日期信息样式
            .date-info {
                display: flex;
                gap: 12px;
                margin-bottom: 15px;
                text-align: center;

                .selected-date-display,
                .weekday,
                .date-type {
                    display: flex;
                    align-items: center; /* 内部元素垂直居中 */
                    min-height: 36px; /* 设置最小高度确保一致性 */
                }

                .selected-date-display {
                    color: #1890ff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-weight: 600;
                    background-color: rgba(24, 144, 255, 0.1);
                    border: 1px solid rgba(24, 144, 255, 0.2);
                }

                .weekday {
                    padding: 4px 12px;
                    background: rgba(44, 111, 187, 0.1);
                    border-radius: 4px;
                    color: #2c6fbb;
                    font-weight: 500;
                    border: 1px solid rgba(#2c6fbb, 0.2);
                }

                .date-type {
                    padding: 4px 12px;
                    border-radius: 4px;
                    font-weight: 500;

                    &.weekday {
                        background: rgba(76, 175, 80, 0.1);
                        color: #4caf50;
                        border: 1px solid rgba(#4caf50, 0.2);
                    }

                    &.weekend {
                        background: rgba(156, 39, 176, 0.1);
                        color: #9c27b0;
                        border: 1px solid rgba(#9c27b0, 0.2);
                    }

                    &.holiday {
                        background: linear-gradient(
                            135deg,
                            #fff1f0 0%,
                            #ffccc7 100%
                        );
                        color: #cf1322;
                        border: 1px solid rgba(#f44336, 0.2);
                    }
                }
            }
            .options {
                flex-grow: 1;
                display: flex;
                justify-content: flex-end;
                align-items: flex-end;
            }
        }
        .header {
            display: flex;
            justify-content: flex-end;
            h5 {
                justify-self: flex-start;
                margin-right: auto;
                i {
                    margin-right: 8px;
                }
            }
        }
        .anomaly-alert {
            background: linear-gradient(135deg, #fef6e6 0%, #fff2d9 100%);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 8px;
            padding: 14px 0 14px 16px;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            border-left: 4px solid #ffc107;

            .anomaly-content {
                display: flex;
                flex-direction: column;
                gap: 10px;

                .anomaly-problem,
                .anomaly-suggestion {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    font-size: 0.9rem;
                    line-height: 1.5;

                    i {
                        flex-shrink: 0;
                        margin-top: 2px;
                        font-size: 0.95rem;
                    }

                    .anomaly-label {
                        font-weight: 600;
                        flex-shrink: 0;
                    }

                    .anomaly-text {
                        color: #3f4041;
                        flex: 1;
                    }
                }

                .anomaly-problem {
                    i,
                    .anomaly-label {
                        color: #e6a23c;
                    }
                }

                .anomaly-suggestion {
                    i,
                    .anomaly-label {
                        color: #67c23a;
                    }
                }
            }
        }
    }
}
/* 编辑标记名称弹窗样式 */
.edit-mark-name-dialog {
    padding: 10px 0;

    .dialog-tip {
        margin-top: 8px;
        color: #909399;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 4px;

        .el-icon {
            font-size: 0.9rem;
        }
    }
}
</style>
