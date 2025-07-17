<template>
    <div class="history-section">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="h5 text">
                <i class="bi bi-clock-history me-2"></i>历史记录
            </h2>
            <div class="search-box">
                <el-input
                    v-model="searchQuery"
                    placeholder="搜索历史记录..."
                    clearable
                    suffix-icon="Search"
                    style="width: 300px"
                />
            </div>
        </div>

        <div class="record-list">
            <!-- 处理中任务 -->
            <div
                v-if="props.processingTasks && props.processingTasks.length > 0"
                class="mb-4"
            >
                <h5 class="mb-3">处理中任务</h5>
                <div class="processing-tasks">
                    <div
                        v-for="(task, idx) in props.processingTasks"
                        :key="idx"
                        class="processing-task card mb-3"
                    >
                        <div class="card-body">
                            <div
                                class="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <div class="d-flex align-items-center mb-2">
                                        <div
                                            class="spinner-border spinner-border-sm text-primary me-2"
                                            role="status"
                                        ></div>
                                        <strong class="text-primary">{{
                                            dsds
                                        }}</strong>
                                    </div>
                                    <div class="text-muted small">
                                        开始时间:
                                        {{ task }}
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div
                                        class="progress"
                                        style="width: 150px; height: 10px"
                                    >
                                        <div
                                            class="progress-bar progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            :style="{
                                                width: '50%',
                                            }"
                                        ></div>
                                    </div>
                                    <div class="small text-muted mt-1">
                                        {{ 50 }}% 完成
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <el-table :data="filteredRecords" stripe style="width: 100%">
                <el-table-column prop="date" label="ID" width="50">
                    <template #default="{ row }">
                        {{ row.id }}
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="请求时间" width="180">
                    <template #default="{ row }">
                        {{ new Date(row.created_at).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column prop="location" label="地点" width="180">
                    <template #default="{ row }">
                        {{ `${row.province}-${row.city}-${row.district}` }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="customer_type"
                    label="客户类型"
                    width="120"
                >
                    <template #default="{ row }">
                        <el-tag
                            size="small"
                            :type="getCustomerTagType(row.customer_type)"
                        >
                            {{ formatCustomerType(row.customer_type) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="forecast_range"
                    label="预测类型"
                    width="100"
                >
                    <template #default="{ row }">
                        {{
                            row.forecast_range === "4days"
                                ? "D-4 -> D+1"
                                : "D-1 -> D+1"
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="dataRange"
                    label="历史数据范围"
                    width="220"
                >
                    <template #default="{ row }">
                        {{
                            row.upload_date_range &&
                            row.upload_date_range.length
                                ? row.upload_date_range.join(" 至 ")
                                : "未知"
                        }}
                    </template>
                </el-table-column>
                <el-table-column prop="predictionDate" label="预测日期">
                    <template #default="{ row }">
                        {{
                            row.prediction_data.dates &&
                            row.prediction_data.dates.length > 0
                                ? row.prediction_data.dates[0]
                                : "未知"
                        }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160">
                    <template #default="{ row }">
                        <el-button
                            size="small"
                            type="primary"
                            plain
                            @click="viewDetail(row)"
                        >
                            查看详情
                        </el-button>
                        <el-button
                            size="small"
                            type="danger"
                            :icon="Delete"
                            circle
                            @click="deleteRecord(row)"
                        >
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
import { Delete } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

/* --------------------------- 正在执行的任务 -------------------------- */
// 新增处理中任务列表
const props = defineProps({
    processingTasks: Array,
});

// 格式化日期时间
const formatDateTime = (date) => {
    return date.toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// 模拟历史记录数据
const records = ref([]);

function fetchRecords() {
    request
        .get("/api/history")
        .then((response) => {
            records.value = response.data; // 假设后端返回的数据格式与模拟数据一致
        })
        .catch((error) => {
            console.error("获取历史记录失败:", error);
        });
}

onMounted(() => {
    fetchRecords();
});

const filteredRecords = computed(() => {
    return records.value; // 实际项目中根据搜索条件过滤
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

const getCustomerTagType = (type) => {
    const types = {
        hospital: "success",
        mall: "warning",
        discrete: "",
        continuous: "danger",
    };
    return types[type] || "";
};

const searchQuery = ref("");

const emit = defineEmits(["view-detail"]);
const viewDetail = (record) => {
    emit("view-detail", record);
};

// 删除历史记录
async function deleteRecord(record) {
    const recordId = record.id; // 假设记录有一个唯一的ID字段
    if (!recordId) {
        ElMessage.error("记录ID不存在，无法删除");
        return;
    }
    try {
        const response = await request.delete(`/api/history/${recordId}`);

        if (response.data.success) {
            ElMessage.success(response.data.message);
            // 刷新历史记录列表
            fetchRecords();
        } else {
            ElMessage.error("删除记录失败");
        }
    } catch (error) {
        ElMessage.error("删除记录请求失败");
        console.error("删除记录失败:", error);
    }
}
</script>

<style lang="scss" scoped>
.history-section {
    max-height: 400px;
    overflow-y: scroll;
    padding: 10px;
    .text {
        color: #2c6fbb;
    }
}
.record-list {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.processing-tasks {
    .processing-task {
        border-left: 4px solid #0d6efd;
    }
}
</style>
