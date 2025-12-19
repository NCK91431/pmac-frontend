// productData.js
const productData = {
    EGate10: {
        imageUrl: "https://pmac.leyi.host/downloads/pmac/products/EGate10.png",
        title: "EGate10-PV 光伏四可控制器",
        description:
            "专为光伏四可（可观、可测、可调、可控）场景设计，具备AGC/AVC功能，兼容电网调度 101/104 协议，可实现光伏系统全环节数据安全传输与高效运维",
        badge: "新品上市",
        features: [
            {
                icon: "bi bi-plug",
                title: "灵活接入",
                subtitle: "多协议兼容",
            },
            {
                icon: "bi bi-shield-check",
                title: "安全防护",
                subtitle: "数据加密",
            },
            {
                icon: "bi bi-tools",
                title: "便捷安装",
                subtitle: "即插即用",
            },
            {
                icon: "bi bi-cpu",
                title: "智能管控",
                subtitle: "AI优化",
            },
        ],
    },
    BMS: {
        imageUrl: "https://pmac.leyi.host/downloads/pmac/products/BMS.png",
        title: `BCU-C001 电池管理系统主控模块`,
        description: `电池系统"控制大脑"`,
        badge: "新品上市",
        features: [
            {
                icon: "bi bi-plug",
                title: "高压安全管理",
                subtitle: "独立锁存",
            },
            {
                icon: "bi bi-shield-check",
                title: "自适应充电算法",
                subtitle: "提升容量利用率",
            },
            {
                icon: "bi bi-tools",
                title: "BCU故障录波",
                subtitle: "快速问题定位",
            },
            {
                icon: "bi bi-cpu",
                title: "高精度采集",
                subtitle: "专业计量传承",
            },
        ],
    },
    BMU: {
        imageUrl: "https://pmac.leyi.host/downloads/pmac/products/BMU.png",
        title: "BMU-AB-M001 电池管理系统从控模块",
        description: `电池系统"采集战士"`,
        badge: "新品上市",
        features: [
            {
                icon: "bi bi-plug",
                title: "双向DCDC主动均衡方案",
                subtitle: "实现电池簇任意单体电芯之间能量高效转移",
            },
            {
                icon: "bi bi-shield-check",
                title: "创新均衡开关阵列",
                subtitle: "提升性能并兼顾成本",
            },
            {
                icon: "bi bi-tools",
                title: "恒定均衡电流",
                subtitle: "精确SOC补偿，提升电路工作稳定性，反馈电路精度高",
            },
            {
                icon: "bi bi-cpu",
                title: "主动冗余保护功能",
                subtitle: "软硬件结合保护，提升均衡安全性",
            },
        ],
    },
    BMSPLUS: {
        imageUrl: "https://pmac.leyi.host/downloads/pmac/products/BMU-M001.png",
        title: "被动均衡BMU系列",
        description: `被动均衡BMU有2个产品，属于同设计方案同系列，分为52串产品和16串产品`,
        badge: "新品上市",
        features: [
            {
                icon: "bi bi-plug",
                title: "汽车级核心芯片、插件选型",
                subtitle: "品质性能双升级",
            },
            {
                icon: "bi bi-shield-check",
                title: "双向IO口",
                subtitle: "自动地址编码",
            },
            {
                icon: "bi bi-tools",
                title: "高可靠性设计",
                subtitle: "万次上下电寿命测试、高EMC要求、自增多项测试",
            },
            {
                icon: "bi bi-cpu",
                title: "多类别认证",
                subtitle: "满足国内/海外认证要求",
            },
        ],
    },
};
export { productData }; // 命名导出
export default productData; // 默认导出
