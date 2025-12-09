<template>
    <div class="record-detail">
        <div v-if="record.created_at" class="mb-4">
            <div class="chart-card card shadow-sm h-100">
                <div class="card-header">
                    <h5>
                        <i class="bi bi-bookmark-check"></i>光伏发电预测结果
                    </h5>
                    <template v-if="record.previous_record_id == null">
                        <button
                            class="continue-btn btn btn-primary"
                            @click="continueForecast"
                        >
                            <i class="bi bi-lightning-charge me-2"></i>
                            继续预测
                        </button>
                    </template>
                </div>
                <div class="card-body">
                    <!-- 创建时间 -->
                    <div class="create-time">
                        <i class="bi bi-clock"></i> <span>创建时间:</span>
                        <span>
                            {{ new Date(record.created_at).toLocaleString() }}
                        </span>
                    </div>
                    <div class="base-info">
                        <!-- ID -->
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-key"></i> ID:
                            </div>
                            <div class="value">{{ record.id }}</div>
                        </div>
                        <!-- 自定义名称 -->
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-key"></i> 自定义名称：
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
                        <!-- 装机容量 -->
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-box-seam"></i> 装机容量:
                            </div>
                            <div class="value">
                                {{ record.pv_capacity ? record.pv_capacity : 0
                                }}{{ `（${record.unit}）` }}
                            </div>
                        </div>
                        <!-- 地点 -->
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-geo-alt"></i> 地点:
                            </div>
                            <div class="value">
                                {{ record.location.join("-") }}
                            </div>
                        </div>
                        <!-- 上传数据 -->
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-calendar4-week"></i> 上传数据:
                            </div>
                            <div class="value">
                                {{
                                    record.upload_info.date_range &&
                                    record.upload_info.date_range.length
                                        ? record.upload_info.date_range.join(
                                              " 至 "
                                          )
                                        : "未知"
                                }}
                            </div>
                            <div class="actions">
                                <button @click="downloadUploadExcel">
                                    <i class="bi bi-cloud-download"></i> 下载
                                </button>
                            </div>
                        </div>
                        <!-- 预测日期 -->
                        <div class="info-item">
                            <div class="label">
                                <i class="bi bi-clipboard-pulse"></i> 预测日期:
                            </div>
                            <div class="value">
                                {{ record.forecast_result.date }}
                            </div>
                        </div>
                    </div>
                    <el-divider />
                    <div class="options">
                        <el-button
                            type="primary"
                            @click="downloadPredictionExcel"
                        >
                            <i class="bi bi-download me-2"></i>下载预测结果
                        </el-button>
                    </div>

                    <ChartDisplay
                        :uploadData="getUploadData(record)"
                        :predictionData="getPredictionDataForDate()"
                        :date="getSampleDate(record)"
                        :capacity="record.pv_capacity"
                        :unit="record.unit"
                    />
                </div>
            </div>
        </div>
        <!-- 天气预测结果 -->
        <template
            v-if="
                selectedCityWeather &&
                cityWeatherForecast &&
                cityWeatherForecast.length
            "
        >
            <div class="chart-card card shadow-sm h-100">
                <div class="card-header">
                    <h5 class="h5 text-success">
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
                <div class="card-body">
                    <WeatherChart
                        :temperature-data="
                            selectedCityWeather.temperatureForecast
                        "
                        :irradiation-data="
                            selectedCityWeather.irradiationForecast
                        "
                    />
                    <div class="mb-3"></div>
                    <WeatherInfo
                        :weather-info="selectedCityWeather.weatherInfo"
                    />
                </div>
            </div>
        </template>
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
import ChartDisplay from "../ResultSection/ChartDisplay.vue";
import WeatherChart from "../ResultSection/WeatherChart.vue";
import WeatherInfo from "../ResultSection/WeatherInfo.vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";
import { saveAs } from "file-saver";
import { useElecStore } from "@/store/elec";

const forecastStore = useElecStore();
const activeHistoryRecordId = computed(
    () => forecastStore.activeHistoryRecordId
); //用户在历史记录列表里选中的某条负荷预测记录

const record = ref({});
async function getRecordDetailById() {
    const id = activeHistoryRecordId.value;
    if (!id) {
        // ElMessage.error("记录ID不存在，无法获取详情");
        return;
    }
    const response = await request.get(`/api/elec_history/${id}`);
    record.value = response.data;
    const info = response.data;
    const isContinueRecord = info.previous_record_id !== null;
    console.log("isContinueRecord", isContinueRecord);
    if (isContinueRecord) {
        const previouse_response = await request.get(
            `/api/elec_history/${info.previous_record_id}`
        );
        const previous_record = previouse_response.data;
        console.log("previous_record", previous_record);
        record.value.upload_info.date_range =
            previous_record.upload_info.date_range;
    }
}
onMounted(() => {
    getRecordDetailById();
});
watch(activeHistoryRecordId, (newId) => {
    if (newId) {
        getRecordDetailById();
    }
});

const getUploadData = (record) => {
    // 模拟数据
    return Array(24)
        .fill()
        .map((_, i) => ({
            time: `${i}:00`,
            value: Math.random() * 800 + 300,
        }));
};

const getPredictionDataForDate = () => {
    // 生成时间序列数组
    const resultArray = record.value.forecast_result.values.map(
        (value, index) => {
            // 计算总分钟数 (15分钟间隔)
            const totalMinutes = index * 15;

            // 计算小时和分钟
            const hours = Math.floor(totalMinutes / 60) % 24;
            const minutes = totalMinutes % 60;

            // 格式化为两位数的时间字符串
            const time = `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;

            return { time, value };
        }
    );
    return resultArray;
};

const getSampleDate = (record) => {
    return new Date(record.created_at).toISOString().split("T")[0];
};

const emit = defineEmits(["close"]);

/*------------天气预测------------*/
// 城市天气预测数据
const cityWeatherForecast = computed(
    () =>
        (record.value.forecast_result &&
            record.value.forecast_result.cityWeatherForecast) ||
        []
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
            `/api/elec_history/${id}/download/upload`,
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
            `/api/elec_history/${id}/download/result`,
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
    const date_range = record.value.upload_info.date_range;

    // 便于计算一些属性
    const [start, end] = date_range;
    forecastStore.setContinueData({
        end_date: date_range[1],
        upload_date_range: date_range,
        upload_date_range_format_text: `${start} 至 ${end}`,
    });

    // 预填表单
    forecastStore.updateFormData({
        pv_capacity: record.value.pv_capacity,
        location: record.value.location,
        previous_record_id: record.value.id,
    });

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
        const response = await request.post(
            "/api/elec_history/update_mark_name",
            {
                record_id: record.value.id,
                mark_name: editMarkName.value.trim(),
            }
        );

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
    .chart-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: none;
        overflow: hidden;
        color: #2c6fbb;
        .card-header {
            display: flex;
            justify-content: space-between;
            padding: 0.8rem 1rem;
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
    }
    .create-time {
        margin-top: 8px;
        margin-bottom: 24px;
        color: gray;
        span {
            margin-right: 6px;
        }
        font-style: italic;
    }
    .base-info {
        display: grid;
        grid-template-columns: 1.3fr 1.5fr 1.6fr;
        gap: 10px;

        .info-item {
            display: flex;
            align-items: center;
            padding: 0.8rem 1.2rem;
            background: #f8f9fa;
            border-radius: 10px;
            transition: all 0.3s ease;

            &:hover {
                background: #e9ecef;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            }

            .label {
                font-weight: 600;
                color: #2c3e50;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-right: 10px;

                i {
                    font-size: 1.1rem;
                    color: #3498db;
                }
            }

            .value {
                color: #555;
                font-size: 0.95rem;
            }

            .actions {
                justify-self: flex-end;
                margin-left: auto;
                button {
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
        }
    }
    .options {
        margin-top: 16px;
        display: flex;
        justify-content: end;
    }
}
</style>
