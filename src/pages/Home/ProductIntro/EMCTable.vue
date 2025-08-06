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
        interface: "红外通信接口",
        description:
            "内置红外发射LED与接收器，通信距离0-3米（室内），收发角度90°，波特率1200bps",
        note: "支持与各类红外仪表通讯，数据类型为float，保留小数点后3位，可配置PT、CT变比",
    },
    {
        category: "",
        interface: "4G通讯接口",
        description:
            "支持LTE FDD/LTE TDD主流频段，直接对接云平台，内置SIM卡免插卡",
        note: "数据通过MQTT协议上传，推送间隔与存储间隔可配置，默认包8年流量",
    },

    {
        category: "",
        interface: "电源接口",
        description:
            "DC直流插头；RS485版本：红色线芯为正极，黑色为负极，电压9-12V DC",
        note: "峰值电流<100mA，建议使用原装适配器，避免超压损坏设备",
    },
    {
        category: "",
        interface: "SIM卡接口",
        description: "内置SIM卡（免插卡设计），支持8年流量套餐",
        note: "不支持热拔插，流量套餐到期后需联系厂商续费",
    },
];
// 参数性能
const second_table = [
    {
        category: "参数性能",
        description: "红外通信距离",
        value: "0-3米（室内环境光）",
    },
    { category: "", description: "峰值电流", value: "<100mA" },
    {
        category: "",
        description: "工作温度",
        value: "-20℃~+60℃（工业级）",
    },
    { category: "", description: "MTBF", value: "≥50,000小时" },
];
// 抗干扰性能
const third_table = [
    {
        category: "抗干扰性能",
        description: "静电放电抗扰度",
        standard: "GB/T 17626.2-2006(IEC 61000-4-2:2001)",
        level: "III",
    },
    {
        category: "",
        description: "射频电磁场辐射抗扰度",
        standard: "GB/T 17626.3-2006(IEC 61000-4-3:1998)",
        level: "III",
    },
    {
        category: "",
        description: "电快速瞬变脉冲群抗扰度",
        standard: "GB/T 17626.4-2008(IEC 61000-4-4:1998)",
        level: "III",
    },
    {
        category: "",
        description: "浪涌抗扰度",
        standard: "GB/T 17626.5-2008(IEC 61000-4-5:2005)",
        level: "II",
    },
    {
        category: "",
        description: "工频磁场抗扰度",
        standard: "GB/T 17626.8-2008(IEC 61000-4-8:2001)",
        level: "III",
    },
    {
        category: "",
        description: "电磁发射限值",
        standard: "GB/T 14598.16-2002(IEC 60255-25:2000)",
        level: "符合",
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
