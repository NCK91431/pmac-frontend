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

        <!-- 表头 -->
        <div class="table-header">
            <div class="col-id">ID</div>
            <div class="col-date">创建时间</div>
            <div class="col-location">项目地点</div>
            <div class="col-price">需量电价 (元/kW·月)</div>
            <div class="col-cost">储能成本 (元/Wh)</div>
            <div class="col-cost">光伏成本 (元/W)</div>
            <div class="col-actions">操作</div>
        </div>

        <!-- 历史记录列表 -->
        <div class="record-list" v-if="filteredRecords.length > 0">
            <div
                v-for="record in filteredRecords"
                :key="record.id"
                class="record-item"
                :class="{
                    'active-record': activeHistoryRecordId === record.id,
                }"
                @click="handleRecordClick(record)"
            >
                <div class="col-id">
                    <span class="record-id">{{ record.id }}</span>
                </div>
                <div class="col-date">
                    {{ formatDate(record.created_at) }}
                </div>
                <div class="col-location">
                    {{ record.location }}
                </div>
                <div class="col-price">
                    {{ formatFloat(record.demand_price) }}
                </div>
                <div class="col-cost">
                    {{ formatFloat(record.storage_cost) }}
                </div>
                <div class="col-cost">
                    {{ formatFloat(record.pv_cost) }}
                </div>

                <div class="col-actions">
                    <el-button
                        size="small"
                        type="danger"
                        :icon="Delete"
                        circle
                        @click.stop="deleteRecord(record)"
                    ></el-button>
                    <el-tooltip content="下载原始数据" placement="top">
                        <el-button
                            size="small"
                            type="primary"
                            :icon="Download"
                            circle
                            @click.stop="downloadRecord(record)"
                        ></el-button>
                    </el-tooltip>
                </div>
            </div>
        </div>

        <div v-else class="empty-state">
            <el-icon><FolderDelete /></el-icon>
            <h3>暂无预测记录</h3>
            <p>当前没有找到匹配的预测记录，请尝试调整筛选条件</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import request from "@/utils/request";
import { Delete, Download, FolderDelete } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useLightStore } from "@/store/light";

const forecastStore = useLightStore();
const activeHistoryRecordId = computed(
    () => forecastStore.activeHistoryRecordId
);

const searchQuery = ref("");
const records = ref([]);

// 获取历史记录
function fetchRecords() {
    request
        .get("/api/light_history")
        .then((response) => {
            records.value = response.data;
            ElMessage.success(`成功加载 ${response.data.length} 条历史记录`);
        })
        .catch((error) => {
            console.error("获取历史记录失败:", error);
            ElMessage.error("获取历史记录失败，请稍后重试");
        });
}

// 搜索过滤
const filteredRecords = computed(() => {
    if (!searchQuery.value) return records.value;

    const query = searchQuery.value.toLowerCase();
    return records.value.filter((record) => {
        return (
            record.id.toString().includes(query) ||
            record.created_at.toLowerCase().includes(query) ||
            record.storage_cost.toLowerCase().includes(query) ||
            record.pv_cost.toLowerCase().includes(query) ||
            record.pv_cap_kw.toLowerCase().includes(query) ||
            record.ess_cap_kwh.toLowerCase().includes(query)
        );
    });
});

function formatFloat(num) {
    if (!num || num == 0) return "-";
    if (typeof num !== "number") {
        if (typeof num == "string") {
            num = Number(num);
        } else {
            return "-";
        }
    }
    return num.toFixed(2);
}

// 日期格式化
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

onMounted(() => {
    fetchRecords();
});

// 点击记录
async function handleRecordClick(record) {
    forecastStore.set_activeHistoryRecordId(record.id);
}

// 下载记录原始数据
async function downloadRecord(record) {
    if (!record.id) {
        ElMessage.error("记录ID不存在，无法下载");
        return;
    }

    try {
        const response = await request.get(
            `/api/light_history/${record.id}/download`,
            {
                responseType: "blob",
            }
        );

        // 获取文件名
        const fileName = `简易预测记录_${record.id}_原始数据.xlsx`;

        // 创建Blob并下载
        const blob = new Blob([response.data]);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);

        ElMessage.success("文件下载成功");
    } catch (error) {
        console.error("下载文件失败:", error);
        ElMessage.error("文件下载失败");
    }
}

// 删除历史记录
async function deleteRecord(record) {
    try {
        await ElMessageBox.confirm(
            `确定要删除记录 #${record.id} 吗？此操作不可撤销。`,
            "删除确认",
            {
                confirmButtonText: "确认删除",
                cancelButtonText: "取消",
                type: "warning",
                center: true,
            }
        );

        const response = await request.delete(
            `/api/light_history/${record.id}`
        );

        if (response.data.success) {
            ElMessage.success(response.data.message);
            // 刷新历史记录列表
            fetchRecords();
            // 如果删除的这条刚好是用户当前选中的，重置选中的记录为null
            if (record.id == activeHistoryRecordId.value) {
                forecastStore.set_activeHistoryRecordId(null);
            }
        } else {
            ElMessage.error("删除记录失败");
        }
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("删除记录请求失败");
            console.error("删除记录失败:", error);
        }
    }
}
</script>

<style lang="scss" scoped>
.history-section {
    padding: 15px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    max-height: 700px;
    overflow-y: auto;
    overflow-x: hidden;
    .text {
        color: #2c6fbb;
        font-weight: 600;
    }
}

/* 表头样式 */
.table-header {
    display: grid;
    grid-template-columns: 70px 150px 160px 150px 150px 150px auto;
    align-items: center;
    width: 100%;
    padding: 12px 15px;
    background-color: #f5f7fa;
    border: 1px solid #ebeef5;
    border-radius: 4px 4px 0 0;
    font-weight: bold;
    color: #606266;
    font-size: 13px;
    gap: 10px;
}
.table-header > div {
    flex-shrink: 1; // 允许收缩
}

/* 记录项样式 */
.record-list {
    border: 1px solid #ebeef5;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 300px;
}

.record-item {
    display: grid;
    grid-template-columns: 70px 150px 160px 150px 150px 150px auto;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    transition: all 0.3s ease;
    cursor: pointer;
    gap: 10px;
    font-size: 13px;

    &:hover {
        background-color: #f9fafc;
    }

    &.active-record {
        background-color: #f0f7ff;
        border-left: 3px solid #409eff;
        font-weight: 500;
    }

    .record-id {
        display: inline-block;
        width: 28px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        background-color: #e6f7ff;
        color: #1890ff;
        border-radius: 50%;
        font-weight: 600;
    }

    .col-actions {
        display: flex;
        gap: 8px;
    }
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    border: 1px solid #ebeef5;
    border-radius: 0 0 4px 4px;

    .el-icon {
        font-size: 48px;
        margin-bottom: 16px;
        color: #ccc;
    }

    h3 {
        margin: 0 0 8px;
        font-weight: normal;
        color: #666;
    }

    p {
        font-size: 14px;
    }
}

.pagination-container {
    display: flex;
    justify-content: center;
}

@media (max-width: 1600px) {
    .table-header,
    .record-item {
        grid-template-columns: 70px 150px 160px 150px 150px 150px auto;
        width: 1300px;
        overflow-x: auto;
    }
}

@media (max-width: 1200px) {
    .history-section {
        overflow-x: auto;
    }

    .table-header,
    .record-item {
        width: 1100px;
    }
}
</style>
