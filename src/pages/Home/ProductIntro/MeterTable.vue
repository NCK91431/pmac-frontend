<!-- 网关产品介绍详情页 -->
<template>
    <!-- 基本性能表格 -->
    <el-table :data="performanceData" border style="width: 100%">
        <el-table-column prop="name" label="项目" width="180" />
        <el-table-column prop="value" label="参数" />
    </el-table>

    <!-- 硬件接口、抗干扰性能合并表格 -->
    <el-table
        :data="first_table"
        border
        style="width: 100%"
        :span-method="firstTableMethod"
    >
        <el-table-column prop="category" label="硬件接口" width="180" />
        <el-table-column prop="interface" label="接口" width="200" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="note" label="备注" />
    </el-table>
    <!-- 参数性能 -->
    <el-table
        :data="second_table"
        border
        style="width: 100%"
        :show-header="false"
        :span-method="tableMethod"
    >
        <el-table-column prop="category" width="180" />
        <el-table-column prop="description" width="200" />
        <el-table-column prop="value" />
    </el-table>
    <!-- 抗干扰性能 -->
    <el-table
        :data="third_table"
        border
        style="width: 100%"
        :show-header="false"
        :span-method="tableMethod"
    >
        <el-table-column prop="category" width="180" />
        <el-table-column prop="description" width="200" />
        <el-table-column prop="standard" />
        <el-table-column prop="level" />
    </el-table>
</template>

<script setup>
// 基本性能数据
const performanceData = [
    { name: "工作电源", value: "AC85-265V或DC80-300V" },
    { name: "功耗", value: "<5W" },
    { name: "环境温度", value: "工作温度-15℃~+55℃，存储温度-25℃~+70℃" },
    { name: "相对湿度", value: "5-95%，无凝结" },
];

// 硬件接口
const first_table = [
    {
        category: "",
        interface: "4G通信接口",
        description: "移动/电信/联通全网通，流量年限8-10年",
        note: "无需布线，传输距离无限制，支持远程抄表及控制",
    },
    {
        category: "",
        interface: "RS485接口",
        description: "1路，Modbus-RTU协议（根据系统架构补充）",
        note: "用于本地数据采集或扩展通信",
    },
    {
        category: "",
        interface: "安全认证模块",
        description: "嵌入式ESAM加密芯片",
        note: "支持SMI国密算法，实现数据加解密及身份认证",
    },
    {
        category: "",
        interface: "显示接口",
        description: "LCD液晶屏",
        note: "实时显示电量、余额、电压等参数",
    },
];
// 参数性能
const second_table = [
    {
        category: "参数性能",
        description: "电流规格",
        value: "0.05-0.25(6)A至0.8-2(100)A",
    },
    {
        category: "",
        description: "电压规格",
        value: "单相220V/三相380V/高压57.7V/100V",
    },
    {
        category: "",
        description: "工作温度",
        value: "-25℃~+60℃（极限-40℃~+70℃）",
    },
    {
        category: "",
        description: "计量精度",
        value: "B级/1级，误差±1%",
    },
    {
        category: "",
        description: "数据存储",
        value: "＞20年，含12个月历史电量",
    },
];
// 抗干扰性能
const third_table = [
    {
        category: "抗干扰性能",
        description: "静电放电抗扰度",
        standard: "GB/T 17626.2-2006",
        level: "III",
    },
    {
        category: "",
        description: "浪涌抗扰度",
        standard: "GB/T 17626.5-2008",
        level: "III",
    },
    {
        category: "",
        description: "快速瞬变脉冲群",
        standard: "GB/T 17626.4-2008",
        level: "III",
    },
    {
        category: "",
        description: "射频辐射抗扰度",
        standard: "GB/T 17626.3-2006",
        level: "IV",
    },
];
// 合并单元格逻辑
const firstTableMethod = ({ row, column, rowIndex, columnIndex }) => {
    // 第一列合并逻辑
    if (columnIndex === 0) {
        if (rowIndex === 0) {
            // 第一行：合并所有行
            return {
                rowspan: third_table.length, // 合并行数 = 数据总行数
                colspan: 1,
            };
        } else {
            // 其他行：隐藏单元格
            return {
                rowspan: 0,
                colspan: 0,
            };
        }
    }
    if (columnIndex == 3 && rowIndex == 0) {
        return [2, 0];
    }
    // 其他列正常显示
    return {
        rowspan: 1,
        colspan: 1,
    };
};
const tableMethod = ({ row, column, rowIndex, columnIndex }) => {
    // 第一列合并逻辑
    if (columnIndex === 0) {
        if (rowIndex === 0) {
            // 第一行：合并所有行
            return {
                rowspan: third_table.length, // 合并行数 = 数据总行数
                colspan: 1,
            };
        } else {
            // 其他行：隐藏单元格
            return {
                rowspan: 0,
                colspan: 0,
            };
        }
    }
    // 其他列正常显示
    return {
        rowspan: 1,
        colspan: 1,
    };
};
</script>

<style lang="scss" scoped>
// 表格容器样式
::v-deep .el-table {
    margin-bottom: 24px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }
}

// 表格头部样式
::v-deep .el-table__header {
    background-color: #f5f7fa;

    th {
        background-color: #f5f7fa !important;
        color: #1d2129 !important;
        font-weight: 600 !important;
        text-align: left !important;
        padding: 12px 16px !important;
        border-bottom: 1px solid #e5e6eb !important;
    }
}

// 表格内容区域样式
::v-deep .el-table__body {
    td {
        padding: 14px 16px !important;
        border-bottom: 1px solid #f2f3f5 !important;
        color: #4e5969 !important;
        line-height: 1.6 !important;
    }

    // 斑马条纹效果
    tr:nth-child(even) {
        background-color: #fafafa;
    }

    // 行悬停效果
    tr:hover > td {
        background-color: #f0f7ff !important;
    }
}

// 表格边框样式优化
::v-deep .el-table--border {
    border: 1px solid #e5e6eb;

    &::before,
    &::after {
        background-color: #e5e6eb;
    }

    .el-table__cell {
        border-right: 1px solid #e5e6eb;
    }
}

// 表格标题样式
.table-title {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin: 32px 0 16px;
    padding-left: 4px;
    position: relative;

    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        background-color: #1890ff;
        border-radius: 3px;
    }
}

// 表格内容中的列表项样式
::v-deep .table-list-item {
    margin-bottom: 6px;

    &:last-child {
        margin-bottom: 0;
    }
}

// 响应式调整
@media (max-width: 768px) {
    ::v-deep .el-table {
        font-size: 13px;
    }

    ::v-deep .el-table__header th,
    ::v-deep .el-table__body td {
        padding: 10px 8px !important;
    }

    .table-title {
        font-size: 16px;
        margin: 24px 0 12px;
    }
}
</style>
