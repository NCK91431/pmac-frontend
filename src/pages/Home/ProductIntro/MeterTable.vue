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
    {
        name: "工作电源",
        value: "AC85 - 265V 或 DC90 - 300V（适配微网常见供电范围）",
    },
    { name: "功耗", value: "<5W（低功耗设计，降低微网内部能耗）" },
    {
        name: "环境温度",
        value: "工作温度：-15℃~+55℃，存储温度：-25℃~+70℃（满足工商业、园区等环境需求 ）",
    },
    { name: "相对湿度", value: "5 - 95%，无凝露（适应不同地域气候环境 ）" },
];

// 硬件接口
const first_table = [
    {
        category: "",
        interface: "4G / 以太网接口",
        description:
            "支持移动 / 电信 / 联通全网通（或适配微网通信的工业以太网），通信模块年限 8 - 10 年",
        note: "无需布线，传输距离无限制，支持远程抄表及控制",
    },
    {
        category: "",
        interface: "RS485接口",
        description:
            "多路（如 8 路 / 16 路 ），Modbus - RTU/TCP 协议（根据微网设备灵活适配）",
        note: "用于本地数据采集（对接光伏、储能、负荷等设备）、扩展通信",
    },
    {
        category: "",
        interface: "安全认证模块",
        description: "嵌入式加密芯片，支持国密算法",
        note: "实现双向认证、线路加密及权限控制，保障微网控制指令安全",
    },
    {
        category: "",
        interface: "显示接口",
        description: "LCD/LED 液晶屏",
        note: "实时显示微网功率、频率、储能状态等关键参数	",
    },
];
// 参数性能
const second_table = [
    {
        category: "参数性能",
        description: "电流规格",
        value: "适配微网场景，如 0 - 5A/0 - 50A 等多量程（根据微网功率灵活配置）",
    },
    {
        category: "",
        description: "电压规格",
        value: "适配微网电压等级，如 220V/380V/750V 等（覆盖低压、中压微网场景 ）",
    },
    {
        category: "",
        description: "工作温度",
        value: "-25℃~+60℃（极限：-40℃~+70℃ ）",
    },
    {
        category: "",
        description: "控制精度",
        value: "功率控制精度：≤1%；频率控制精度：≤0.05Hz（保障微网稳定运行关键指标 ）",
    },
    {
        category: "",
        description: "数据存储",
        value: ">20 年，含 12 个月历史数据（至少存储微网关键运行参数、事件记录等 ）",
    },
];
// 抗干扰性能
const third_table = [
    {
        category: "抗干扰性能",
        description: "静电放电抗扰度",
        standard: "GB/T 17626.2 - 2006",
        level: "III",
    },
    {
        category: "",
        description: "浪涌抗扰度",
        standard: "GB/T 17626.5 - 2008",
        level: "III",
    },
    {
        category: "",
        description: "快速瞬变脉冲群",
        standard: "GB/T 17626.4 - 2008",
        level: "III",
    },
    {
        category: "",
        description: "射频辐射抗扰度",
        standard: "GB/T 17626.3 - 2006",
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
