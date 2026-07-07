<template>
  <div class="user-price-config">
    <div class="page-header">
      <h2>电力交易收益配置表</h2>
      <p class="description">
        配置12个月的日前市场月度综合价和月度中长期交易综合价，用于计算售电收入
      </p>
    </div>

    <div class="config-card">
      <div class="card-header">
        <div v-if="configData" class="update-info">
          <span
            >最后更新人：{{
              userNameMap[configData.updating_responsible_person] ||
              configData.updating_responsible_person
            }}</span
          >
          <span>更新时间：{{ formatDateTime(configData.updating_time) }}</span>
        </div>
        <el-button
          text
          size="small"
          :loading="loading"
          @click="loadConfig"
          style="color: #409eff; padding: 0"
        >
          <el-icon style="margin-right: 4px"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div class="table-container">
        <el-table
          :data="rawValues"
          border
          style="width: 100%"
          size="default"
          :header-cell-style="{
            background: '#fafafa',
            color: '#666',
            fontWeight: 500,
          }"
        >
          <el-table-column label="月份" width="120" align="center">
            <template #default="{ row }">
              {{ row.label }}
            </template>
          </el-table-column>

          <!-- <el-table-column
            label="用户均价（元/MWh）"
            min-width="250"
            align="center"
          >
            <template #default="{ row }">
              <el-input-number
                v-model="row.userPrice"
                :disabled="loading"
                :min="0"
                :step="0.00000001"
                :precision="8"
                controls-position="right"
                placeholder="请输入均价"
                style="width: 200px"
                size="default"
              />
            </template>
          </el-table-column> -->

          <el-table-column
            label="日前市场月度综合价（含分摊）（元/MWh）"
            min-width="300"
            align="center"
          >
            <template #default="{ row, $index }">
              <span
                v-if="editingRowIndex !== $index"
                :class="[
                  'display-value',
                  { 'value-zero': row.dayAheadPrice === 0 },
                ]"
              >
                {{ row.dayAheadPrice }}
              </span>
              <el-input-number
                v-else
                v-model="row.dayAheadPrice"
                :min="0"
                :step="0.00000001"
                :precision="8"
                :controls="false"
                placeholder="请输入价格"
                style="width: 200px"
                size="default"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="月度中长期交易综合价（含分摊）（元/MWh）"
            min-width="300"
            align="center"
          >
            <template #default="{ row, $index }">
              <span
                v-if="editingRowIndex !== $index"
                :class="[
                  'display-value',
                  { 'value-zero': row.mediumLongTermPrice === 0 },
                ]"
              >
                {{ row.mediumLongTermPrice }}
              </span>
              <el-input-number
                v-else
                v-model="row.mediumLongTermPrice"
                :min="0"
                :step="0.00000001"
                :precision="8"
                :controls="false"
                placeholder="请输入价格"
                style="width: 200px"
                size="default"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="180"
            align="center"
            fixed="right"
          >
            <template #default="{ $index }">
              <template v-if="editingRowIndex === $index">
                <el-button
                  size="small"
                  type="primary"
                  @click="saveRow($index)"
                  :disabled="loading"
                >
                  保存
                </el-button>
              </template>
              <el-button
                v-else
                size="small"
                @click="startEdit($index)"
                :disabled="loading"
                plain
              >
                设置
              </el-button>
              <el-button
                size="small"
                @click="resetPrice($index)"
                :disabled="loading"
                plain
              >
                重置
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import request from "@/utils/request";
import {
  powerTradingConfigApi,
  createPowerTradingConfigApi,
  updatePowerTradingConfigApi,
} from "@/DailyDemandReportV2/api";

const monthLabels = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const defaultUserPrices = Array(12).fill(0);
const defaultDayAheadPrices = Array(12).fill(0);
const defaultMediumLongTermPrices = Array(12).fill(0);

const rawValues = reactive(
  monthLabels.map((label, index) => ({
    label,
    userPrice: defaultUserPrices[index],
    dayAheadPrice: defaultDayAheadPrices[index],
    mediumLongTermPrice: defaultMediumLongTermPrices[index],
    originalUserPrice: defaultUserPrices[index],
    originalDayAheadPrice: defaultDayAheadPrices[index],
    originalMediumLongTermPrice: defaultMediumLongTermPrices[index],
  })),
);

const configData = ref(null);
const loading = ref(false);
const editingRowIndex = ref(null);
const user = inject("user");
const userNameMap = ref({});

onMounted(async () => {
  await loadConfig();
});

async function loadConfig() {
  loading.value = true;
  try {
    const response = await powerTradingConfigApi("daily-average-prices");
    if (response.data && response.data.success && response.data.data) {
      configData.value = response.data.data;

      // 获取用户列表，建立 ID → 名称 映射
      try {
        const usersRes = await request.get("/api/admin/users", {
          params: { pageSize: 999 },
        });
        if (usersRes.data?.success) {
          const map = {};
          (usersRes.data.data.list || []).forEach((u) => {
            map[u.id] = u.name;
          });
          userNameMap.value = map;
        }
      } catch (e) {
        console.error("获取用户列表失败:", e);
      }

      ElMessage.success("已刷新");

      response.data.data.values.forEach((item, index) => {
        if (typeof item === "object") {
          rawValues[index].userPrice =
            item.user_price ?? defaultUserPrices[index];
          rawValues[index].dayAheadPrice =
            item.day_ahead_monthly_avg_price ?? defaultDayAheadPrices[index];
          rawValues[index].mediumLongTermPrice =
            item.monthly_forward_avg_price ??
            defaultMediumLongTermPrices[index];
          rawValues[index].originalUserPrice = rawValues[index].userPrice;
          rawValues[index].originalDayAheadPrice =
            rawValues[index].dayAheadPrice;
          rawValues[index].originalMediumLongTermPrice =
            rawValues[index].mediumLongTermPrice;
        } else {
          rawValues[index].userPrice = item;
          rawValues[index].dayAheadPrice = defaultDayAheadPrices[index];
          rawValues[index].mediumLongTermPrice =
            defaultMediumLongTermPrices[index];
          rawValues[index].originalUserPrice = item;
          rawValues[index].originalDayAheadPrice = defaultDayAheadPrices[index];
          rawValues[index].originalMediumLongTermPrice =
            defaultMediumLongTermPrices[index];
        }
      });
    }
  } catch (error) {
    console.error("加载配置失败:", error);
  } finally {
    loading.value = false;
  }
}

function resetPrice(index) {
  rawValues[index].userPrice = defaultUserPrices[index];
  rawValues[index].dayAheadPrice = defaultDayAheadPrices[index];
  rawValues[index].mediumLongTermPrice = defaultMediumLongTermPrices[index];
}

async function saveConfig() {
  loading.value = true;
  const values = rawValues.map((item) => ({
    user_price: item.userPrice,
    day_ahead_monthly_avg_price: item.dayAheadPrice,
    monthly_forward_avg_price: item.mediumLongTermPrice,
  }));

  try {
    const payload = {
      configuration_item_name: "daily-average-prices",
      updating_responsible_person: user.value?.id,
      updating_time: new Date().toISOString().replace("T", " ").slice(0, 19),
      values,
    };

    let response;
    if (configData.value) {
      response = await updatePowerTradingConfigApi(payload);
    } else {
      response = await createPowerTradingConfigApi(payload);
    }

    if (response.data && response.data.success) {
      await loadConfig();
      ElMessage.success("配置保存成功");
    } else {
      throw new Error(response.data?.message || "保存失败");
    }
  } catch (error) {
    console.error("保存配置失败:", error);
    ElMessage.error("保存配置失败，请重试");
  } finally {
    loading.value = false;
  }
}

function startEdit(index) {
  editingRowIndex.value = index;
}

async function saveRow(_index) {
  await saveConfig();
  editingRowIndex.value = null;
}

function formatDateTime(dateTime) {
  if (!dateTime) return "-";
  const date = new Date(dateTime);
  return date.toLocaleString("zh-CN");
}
</script>

<style scoped>
.user-price-config {
  padding: 24px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 0 8px 0;
}

.page-header .description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.config-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.card-header .title {
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
}

.update-info {
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #999;
}

.table-container {
  padding: 24px;
  overflow-x: auto;
}

.table-container :deep(.el-table) {
  border-radius: 4px;
}

.table-container :deep(.el-table .cell) {
  white-space: nowrap;
  word-break: keep-all;
}

.display-value {
  font-size: 14px;
  color: #333;
}

.value-zero {
  color: #bfbfbf;
}
</style>
