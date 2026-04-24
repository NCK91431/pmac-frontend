<template>
  <div class="strategy-table-container">
    <el-table
      :data="tableData"
      border
      stripe
      highlight-current-row
      style="width: 100%"
      :header-cell-style="headerCellStyle"
      :cell-style="cellStyle"
      :show-summary="true"
      :summary-method="getSummaries"
      @cell-click="handleCellClick"
    >
      <!-- 第1列：时间 -->
      <el-table-column
        prop="time"
        label="时间"
        width="80"
        align="center"
        fixed="left"
      >
        <template #default="{ row }">
          <div class="time-cell">{{ row.time }}</div>
        </template>
      </el-table-column>

      <!-- 第2列：用户评估电量 -->
      <el-table-column
        prop="estimated_mwh"
        label="用户评估电量(MWh)"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <div :class="getPriceSpreadClass(row.estimated_mwh)">
            {{ formatNumber(row.estimated_mwh, 2) }}
          </div>
        </template>
      </el-table-column>

      <!-- 第3列：价差方向 -->
      <el-table-column
        prop="price_compare"
        label="价差方向"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag
            :type="getDirectionTagType(row.price_compare)"
            size="small"
            effect="dark"
          >
            {{ formatPriceCompare(row.price_compare) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 第4列：日前低概率 -->
      <el-table-column
        prop="probability"
        label="日前低概率"
        align="center"
      >
        <template #default="{ row }">
          <div class="probability-cell">
            <el-progress
              :percentage="getProbabilityPercentage(row.probability)"
              :color="getProbabilityColor(row.probability)"
              :show-text="true"
              :stroke-width="12"
              :format="(percentage) => `${percentage}%`"
            />
          </div>
        </template>
      </el-table-column>

      <!-- 第5列：日前建议申报电量(MWh) -->
      <el-table-column
        prop="declaration_mwh"
        label="日前建议申报电量(MWh)"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <div class="load-cell">
            {{ formatNumber(row.declaration_mwh, 2) }}
          </div>
        </template>
      </el-table-column>

      <!-- 第6列：申报比例 -->
      <el-table-column prop="ratio" label="申报比例" width="120" align="center">
        <template #default="{ row }">
          <div class="ratio-cell">
            <el-tag :type="getRatioTagType(row.ratio)" size="small">
              {{ formatRatio(row.ratio) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <!-- 第7列：调整申报比例（用户可编辑） -->
      <el-table-column
        prop="adjustedRatio"
        label="调整申报比例"
        width="110"
        align="center"
      >
        <template #default="{ row, $index }">
          <!-- 调整申报比例（只读显示） -->
          <div class="adjust-ratio-cell">
            <div
              class="adjuested-val"
              :class="getRatioValueClass(ratios[$index], row.ratio)"
            >
              {{ ratios[$index] !== null && ratios[$index] !== undefined ? ratios[$index] : '—' }}
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 第8列：实际申报电量 -->
      <el-table-column
        prop="actualLoad"
        label="实际申报电量(MWh)"
        width="120"
        align="center"
      >
        <template #default="{ row, $index }">
          <div class="load-cell" :class="getLoadCellClass(row, $index)">
            {{ calculateActualLoad(row, $index) }}
          </div>
        </template>
      </el-table-column>
    </el-table>


    <!-- 表格底部统计信息 -->
    <div class="table-footer">
      <div class="footer-stats">
        <el-space>
          <el-tag type="info" size="large">
            <span class="stat-label">总时段数:</span>
            <span class="stat-value">{{ tableData.length }}</span>
          </el-tag>
          <el-tag type="success" size="large">
            <span class="stat-label">已调整:</span>
            <span class="stat-value">{{ adjustedCount }}</span>
          </el-tag>
          <el-tag type="warning" size="large">
            <span class="stat-label">默认比例:</span>
            <span class="stat-value">{{ defaultCount }}</span>
          </el-tag>
        </el-space>
      </div>
      <div class="footer-actions">
        <el-button type="success" plain size="small" @click="copyResults">
          <el-icon><CopyDocument /></el-icon>
          <span>一键复制结果</span>
        </el-button>
        <el-button type="primary" plain size="small" @click="exportToExcel">
          <el-icon><Download /></el-icon>
          <span>导出用电侧申报结果</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  CopyDocument,
  Download,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// Props定义
const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    default: () => [],
  },
  // 调整比例数组
  ratios: {
    type: Array,
    default: () => [],
  },
});

onMounted(() => {
  // 初始化默认值
  console.log("props.ratios----->:", props.ratios);
});
// Emits定义
const emit = defineEmits(["cell-click"]);



// 计算属性：已调整的比例数量
const adjustedCount = computed(() => {
  let count = 0;
  for (let i = 0; i < props.ratios.length; i++) {
    const adjustedRatio = props.ratios[i];
    const originalRatio = props.tableData[i]?.ratio;
    // 如果调整比例不等于原始比例，视为已调整
    if (adjustedRatio != originalRatio) {
      count++;
    }
  }
  return count;
});

// 计算属性：默认比例数量
const defaultCount = computed(() => {
  let count = 0;
  for (let i = 0; i < props.ratios.length; i++) {
    const adjustedRatio = props.ratios[i];
    const originalRatio = props.tableData[i]?.ratio;
    // 如果调整比例等于原始比例，视为默认（未调整）
    if (adjustedRatio == originalRatio) {
      count++;
    }
  }
  return count;
});

// 格式化数字
const formatNumber = (value, precision = 4) => {
  if (value === null || value === undefined) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(precision);
};

// 格式化比例
const formatRatio = (value) => {
  if (value === null || value === undefined) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return (num * 100).toFixed(1) + "%";
};

// 获取价差值的样式类
const getPriceSpreadClass = (value) => {
  if (value === null || value === undefined) return "price-spread-neutral";
  const num = parseFloat(value);
  if (isNaN(num)) return "price-spread-neutral";
  return num >= 0 ? "price-spread-positive" : "price-spread-negative";
};

// 获取价差方向标签类型（新版接口）
const getDirectionTagType = (direction) => {
  if (direction === null || direction === undefined) return "info";
  // 处理数字类型：-1表示日期低，0表示相等，1表示日前高
  if (typeof direction === "number") {
    if (direction === -1) return "danger"; // 日期低
    if (direction === 0) return "warning"; // 相等
    if (direction === 1) return "success"; // 日前高
  }
  // 处理字符串类型
  if (typeof direction === "string") {
    if (Number(direction) === -1 || direction.includes(">")) return "success";
    if (Number(direction) === 0 || direction.includes("<")) return "danger";
    if (Number(direction) === 1 || direction.includes("=")) return "warning";
  }
  return "info";
};

// 格式化价差方向显示
const formatPriceCompare = (value) => {
  if (value === null || value === undefined) return "未知";
  // 处理数字类型
  if (typeof value === "number") {
    if (value === -1) return "日前低";
    if (value === 0) return "相等";
    if (value === 1) return "日前高";
  }
  // 处理字符串类型
  if (typeof value === "string") {
    // 如果已经是中文描述，直接返回
    if (value.includes("低") || value.includes("高") || value.includes("等")) {
      return value;
    }
    // 尝试解析其他格式
    if (Number(value) === -1 || value.includes(">")) return "日前低";
    if (Number(value) === 0 || value.includes("<")) return "相等";
    if (Number(value) === 1 || value.includes("=")) return "日前高";
  }
  return String(value);
};

// 获取概率百分比
const getProbabilityPercentage = (value) => {
  if (value === null || value === undefined) return 0;
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

// 获取概率颜色
const getProbabilityColor = (value) => {
  const percentage = getProbabilityPercentage(value);
  if (percentage >= 70) return "#67c23a";
  if (percentage >= 50) return "#e6a23c";
  return "#f56c6c";
};

// 获取比例标签类型
const getRatioTagType = (value) => {
  if (value === null || value === undefined) return "info";
  const num = parseFloat(value);
  if (isNaN(num)) return "info";
  if (num >= 0.5) return "success";
  if (num >= 0.2) return "warning";
  return "danger";
};

// 获取调整比例值的样式类
const getRatioValueClass = (adjustedRatio, originalRatio) => {
  // 如果调整比例等于原始比例，视为未调整
  if (adjustedRatio == originalRatio) {
    return "ratio-not-adjusted";
  }

  const num = parseFloat(adjustedRatio);
  if (isNaN(num)) return "ratio-not-adjusted";

  if (num < 0.8) return "ratio-low";
  if (num < 1.2) return "ratio-medium";
  return "ratio-high";
};

// 计算实际申报电量
const calculateActualLoad = (row, index) => {
  const estimatedMwh = parseFloat(row.estimated_mwh); // 用户评估电量(MWh)
  const declarationMwh = parseFloat(row.declaration_mwh); // 日前建议申报电量(MWh)
  const adjustedRatio = props.ratios[index];
  const originalRatio = row.ratio; // 原始申报比例

  // 如果调整比例等于原始比例，视为未调整，实际申报电量等于日前建议申报电量
  if (adjustedRatio == originalRatio) {
    if (isNaN(declarationMwh)) return "—";
    // 格式化为2位小数，与formatNumber保持一致
    return declarationMwh;
  } else {
    // 如果调整比例不等于原始比例，视为有调整，实际申报电量等于用户评估电量×调整申报比例
    const ratioNum = parseFloat(adjustedRatio);
    if (isNaN(estimatedMwh) || isNaN(ratioNum) || ratioNum === 0) return "—";
    const actualLoad = estimatedMwh * ratioNum;
    // 格式化为2位小数，与formatNumber保持一致
    return formatNumber(actualLoad, 2);
  }
};

// 获取实际申报电量单元格样式类
const getLoadCellClass = (row, index) => {
  const adjustedRatio = props.ratios[index];
  const originalRatio = row.ratio;
  // 如果调整比例等于原始比例，视为未调整
  if (adjustedRatio == originalRatio) {
    return "load-default";
  } else {
    return "load-adjusted";
  }
};

// 表头样式
const headerCellStyle = () => ({
  backgroundColor: "#f5f7fa",
  color: "#303133",
  fontWeight: "600",
  fontSize: "14px",
  borderColor: "#ebeef5",
  textAlign: "center",
});

// 单元格样式
const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
  const style = {
    borderColor: "#ebeef5",
    padding: "12px 8px",
    fontSize: "13px",
  };

  // 交替行背景色
  if (rowIndex % 2 === 0) {
    style.backgroundColor = "#ffffff";
  } else {
    style.backgroundColor = "#fafafa";
  }

  return style;
};





// 处理单元格点击
const handleCellClick = (row, column, cell, event) => {
  emit("cell-click", { row, column, cell, event });
};



// 一键复制实际申报电量结果
const copyResults = async () => {
  if (!props.tableData || props.tableData.length === 0) {
    ElMessage.warning("没有数据可复制");
    return;
  }

  try {
    // 提取所有行的实际申报电量值
    const actualLoadValues = props.tableData.map((row, index) => {
      const value = calculateActualLoad(row, index);
      // 如果返回的是"—"或其他非数字，转换为空字符串
      if (value === "—" || value === null || value === undefined) {
        return "";
      }
      // 如果是数字字符串，直接返回（已格式化）
      return value;
    });

    // 将值用换行符连接，形成竖向的一列数据
    const copyText = actualLoadValues.join("\n");

    // 复制到剪贴板
    await navigator.clipboard.writeText(copyText);

    ElMessage.success(
      `已复制${actualLoadValues.length}个实际申报电量值到剪贴板，可竖向粘贴到Excel列中`,
    );
  } catch (error) {
    console.error("复制失败:", error);
    ElMessage.error("复制失败，请确保浏览器支持剪贴板功能");
  }
};

// 导出用电侧申报结果到Excel
const exportToExcel = async () => {
  if (!props.tableData || props.tableData.length === 0) {
    ElMessage.warning("没有数据可导出");
    return;
  }

  try {
    // 动态导入xlsx和file-saver库
    const XLSX = await import("xlsx");
    const { default: saveAs } = await import("file-saver");

    // 提取实际申报电量数据
    const actualLoadValues = props.tableData.map((row, index) => {
      const value = calculateActualLoad(row, index);
      // 如果返回的是"—"或其他非数字，转换为空字符串
      if (value === "—" || value === null || value === undefined) {
        return "";
      }
      // 转换为数字，便于Excel识别
      const num = parseFloat(value);
      return isNaN(num) ? "" : num;
    });

    // 构建Excel数据
    const data = [];

    // 第1行：表头
    data.push(["时刻", "电量(MWh)"]);

    // 第2行开始：数据行（00:00~23:00）
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      const loadValue = actualLoadValues[i] || "";
      data.push([hour, loadValue]);
    }

    // 创建工作簿和工作表
    const ws = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    ws["!cols"] = [{ wch: 10 }, { wch: 15 }];

    // 添加样式（xlsx社区版样式支持有限，这里使用基本样式）
    // 注意：xlsx社区版对样式支持有限，专业版（xlsx-style）支持更完整的样式

    // 为A1单元格（时刻）和B1单元格（电量(MWh)）添加加粗
    if (ws["A1"]) {
      ws["A1"].s = {
        font: { bold: true },
      };
    }
    if (ws["B1"]) {
      ws["B1"].s = {
        font: { bold: true },
      };
    }

    // 为整个B列添加加粗（B2:B25）
    for (let i = 2; i <= 25; i++) {
      const cellAddress = `B${i}`;
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
        };
      }
    }

    // 为A列的奇数行（3,5,7,...,25）添加蓝色填充
    // 注意：xlsx社区版不支持填充颜色，这里使用文本颜色替代
    for (let i = 3; i <= 25; i += 2) {
      const cellAddress = `A${i}`;
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { color: { rgb: "FFFFFF" }, bold: true },
          fill: { fgColor: { rgb: "4472C4" } }, // 蓝色背景
        };
      }
    }

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "用电侧申报结果");

    // 生成Excel文件
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // 保存文件
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const fileName = `用电侧申报结果_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);

    ElMessage.success("Excel文件导出成功");
  } catch (error) {
    console.error("导出Excel失败:", error);
    ElMessage.error("导出失败，请重试");
  }
};

// 表格总计行计算方法
const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];

  columns.forEach((column, index) => {
    // 第一列显示"总计"
    if (index === 0) {
      sums[index] = "总计";
      return;
    }

    const values = data.map((item, rowIndex) => {
      if (column.property === "estimated_mwh") {
        // 用户评估电量(MWh)
        return parseFloat(item.estimated_mwh) || 0;
      } else if (column.property === "declaration_mwh") {
        // 日前建议申报电量(MWh)
        return parseFloat(item.declaration_mwh) || 0;
      } else if (column.property === "actualLoad") {
        // 实际申报电量(MWh) - 根据调整后的比例计算
        const value = calculateActualLoad(item, rowIndex);
        if (value === "—" || value === null || value === undefined) {
          return 0;
        }
        return parseFloat(value) || 0;
      }
      return 0;
    });

    // 计算总和并格式化
    if (
      column.property === "estimated_mwh" ||
      column.property === "declaration_mwh" ||
      column.property === "actualLoad"
    ) {
      const sum = values.reduce((prev, curr) => prev + curr, 0);
      sums[index] = formatNumber(sum, 2);
    } else {
      // 其他列留空
      sums[index] = "";
    }
  });

  return sums;
};
</script>

<style lang="scss" scoped>
.strategy-table-container {
  width: 100%;
  background: white;

  :deep(.el-table) {
    overflow: hidden;

    .el-table__header-wrapper {
      border-radius: 8px 8px 0 0;
    }

    .el-table__body-wrapper {
      border-radius: 0 0 8px 8px;
    }

    // 总计行特殊样式
    .el-table__footer-wrapper {
      background-color: #f8fafc;
      border-top: 2px solid #3b82f6;

      .el-table__footer {
        background-color: #f8fafc;

        .cell {
          font-weight: 700;
          color: #1e293b;
          font-size: 14px;

          // 第一列"总计"特殊样式
          &:first-child {
            color: #3b82f6;
            font-size: 15px;
          }

          // 数字列样式
          &:nth-child(2),
          &:nth-child(5),
          &:nth-child(8) {
            color: #10b981;
            font-weight: 800;
          }
        }
      }
    }
  }

  .time-cell {
    font-weight: 600;
    color: #1e3c72;
    font-size: 13px;
  }

  .price-spread-positive {
    font-size: 14px;
    color: #67c23a;
    font-weight: 600;
  }

  .price-spread-negative {
    color: #f56c6c;
    font-weight: 600;
  }

  .price-spread-neutral {
    color: #909399;
  }

  .probability-cell {
    .el-progress {
      margin: 0 auto;

      :deep(.el-progress__text) {
        font-size: 14px !important;
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .load-cell {
    font-weight: 500;
    color: #606266;
    font-size: 14px;

    &.load-default {
      color: #94a3b8;
      font-weight: 400;
      font-style: italic;
    }

    &.load-adjusted {
      color: #1e293b;
      font-weight: 600;
      background-color: rgba(59, 130, 246, 0.05);
      border-radius: 4px;
      padding: 2px 6px;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
  }

  .ratio-cell {
    .el-tag {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .adjust-ratio-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;

    .adjuested-val {
      font-size: 12px;
      font-weight: 500;
      color: #1e293b;
      text-align: center;
      transition: all 0.2s ease;
      border-radius: 4px;
      padding: 0 6px;

      &.ratio-not-adjusted {
        color: #94a3b8;
        font-weight: 400;
        font-size: 11px;
        background-color: transparent;
      }

      &.ratio-low {
        color: #ef4444;
        font-weight: 700;
        font-size: 13px;
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        box-shadow: 0 1px 3px rgba(239, 68, 68, 0.1);
      }

      &.ratio-medium {
        color: #10b981;
        font-weight: 700;
        font-size: 13px;
        background-color: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.2);
        box-shadow: 0 1px 3px rgba(16, 185, 129, 0.1);
      }

      &.ratio-high {
        color: #ef4444;
        font-weight: 700;
        font-size: 13px;
        background-color: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        box-shadow: 0 1px 3px rgba(239, 68, 68, 0.1);
      }
    }
  }


  .table-footer {
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .footer-stats {
      .el-tag {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        .stat-label {
          margin-right: 6px;
          color: #606266;
          font-size: 13px;
        }

        .stat-value {
          font-weight: 700;
          font-size: 14px;
        }
      }
    }

    .footer-actions {
      display: flex;
    }
  }

  // 响应式调整
  @media (max-width: 1200px) {
    padding: 15px;

    :deep(.el-table) {
      font-size: 12px;
    }

    .table-footer {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;

      .footer-stats,
      .footer-actions {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>