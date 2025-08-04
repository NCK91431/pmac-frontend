<template>
    <!-- 顶部导航区 -->
    <section class="top-section">
        <div class="nav-cards">
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>负荷预测</h3>
                <p>提供精准的负荷预测分析，帮助优化能源分配</p>
                <el-button type="primary" @click="gotoPage('load')"
                    >进入页面</el-button
                >
            </div>

            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-sun"></i>
                </div>
                <h3>光伏发电预测</h3>
                <p>基于气象数据的太阳能发电量预测与分析</p>
                <el-button type="success">进入页面</el-button>
            </div>

            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-battery-full"></i>
                </div>
                <h3>光储定容</h3>
                <p>光伏储能系统容量优化设计与经济性分析</p>
                <el-button type="danger">进入页面</el-button>
            </div>
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-battery-full"></i>
                </div>
                <h3>储能套利模拟</h3>
                <p>量化分析峰谷套利策略收益，助力储能投资回报最大化</p>
                <el-button type="danger">进入页面</el-button>
            </div>
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-battery-full"></i>
                </div>
                <h3>资产健康哨兵</h3>
                <p>精准预警故障风险，延长设备生命周期</p>
                <el-button type="danger">进入页面</el-button>
            </div>
        </div>
    </section>

    <!-- 中间产品展示区 -->
    <section class="product-section">
        <!-- <el-carousel
                    height="250px"
                    :interval="4000"
                    indicator-position="outside"
                >
                    <el-carousel-item v-for="item in 3" :key="item">
                        <div class="product-img">
                            <el-image
                                style="width: 250px; height: auto"
                                src="https://omo-oss-image.thefastimg.com/portal-saas/pg2025040218401364287/cms/image/ebe618ac-4b52-4065-a2ea-9275b485b661.png"
                                :fit="fit"
                            />
                        </div>
                    </el-carousel-item>
                </el-carousel> -->

        <div class="header">
            <h1>{{ headerTitle }}</h1>
            <p>{{ headerSubtitle }}</p>
        </div>
        <div class="product-grid">
            <ProductCard
                v-for="(product, index) in products"
                :key="index"
                :product="product"
            />
        </div>
    </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import ProductCard from "./ProductCard.vue";
import { reactive, ref } from "vue";
const router = useRouter();
const gotoPage = (page) => {
    switch (page) {
        case "home":
            router.push("/");
            break;
        case "load":
            router.push("/loadpre");
            break;
        case "guangfu":
            router.push("/pvpre");
            break;
        case "chuneng":
            router.push("/chunengpre");
            break;
        default:
            router.push("/");
            break;
    }
};
const headerTitle = ref("工业物联网产品解决方案");
const headerSubtitle = ref(
    "高效、稳定、安全的工业通信与数据采集设备，助力企业数字化转型"
);
const products = reactive([
    {
        title: "PMAC3101 4G工业通信网关",
        subtitle: "TASO102 4G红外抄表仪",
        imgURL: "https://pmac.leyi.host/downloads/product_01.png",
        description:
            "快速将传统RS485设备接入云端，节省布线成本，支持边缘计算，为算法提供稳定可靠的实时数据传输通道。",
        features: [
            {
                title: "高速4G通信",
                content: "上行5Mbps/下行10Mbps，替代2G DTU",
            },
            {
                title: "协议转换",
                content: "Modbus RTU/TCP互转，支持云平台对接",
            },
            {
                title: "多设备接入",
                content: "2路RS485，最多32台仪表，通信距离1.2km",
            },
            { title: "智能管理", content: "一键扫描、远程配置、心跳包机制" },
        ],
        scenario: "工业能耗监测、智能建筑远程数据采集、变电站监控",
        detailDescription:
            "无需求或现有电费，3分钟完成安装，立即实现远程抄表与数据上传，大幅降低人工成本，适配老旧设备升级需求。",
        detailFeatures: [
            { title: "非接触抄表", content: "红外通信0-3米，90°角度，免接表" },
            { title: "双模式通信", content: "4G版（内置8年流量）/RS485版" },
            { title: "易安装", content: "3M贴装，9-12V DC供电，即插即用" },
            { title: "多协议支持", content: "DL/T645、Modbus RTU、MQTT" },
        ],
        detailScenario: "住宅/商业楼宇电费改造、工业防爆场景仪表采集",
        pathName: "Gateway",
    },
    {
        title: "工业边缘计算网关",
        subtitle: "EMC-200系列",
        imgURL: "https://pmac.leyi.host/downloads/product_03.png",
        description:
            "高性能工业级边缘计算网关，支持多种工业协议解析与数据预处理，降低云端压力，实现本地智能化决策。",
        features: [
            {
                title: "强大算力",
                content: "四核ARM Cortex-A55处理器，主频1.8GHz",
            },
            { title: "丰富接口", content: "4路千兆网口，8路RS485，2路CAN" },
            { title: "双模通信", content: "支持5G/4G双模，有线光纤备份" },
            {
                title: "边缘计算",
                content: "内置Python运行环境，支持自定义算法",
            },
        ],
        scenario: "智能制造生产线监控、能源管理系统、智慧城市基础设施",
        detailDescription:
            "提供可视化配置界面，无需编程即可实现设备接入、协议转换和数据转发，大幅缩短项目部署周期。",
        detailFeatures: [
            { title: "安全防护", content: "内置防火墙，支持VPN安全接入" },
            { title: "工业级设计", content: "-40℃~75℃宽温运行，IP40防护" },
            { title: "容器支持", content: "支持Docker容器，灵活部署应用" },
            { title: "远程维护", content: "支持SSH远程管理，Web配置界面" },
        ],
        detailScenario: "电力SCADA系统、油气管道监控、水处理自动化",
        pathName: "EMC200",
    },
    {
        title: "智能预付费4G电表",
        subtitle: "图例",
        imgURL: "https://pmac.leyi.host/downloads/product_02.png",
        description:
            "集计量、计费、通信于一体，支持预付费模式与负荷数据实时采集，直接为算法提供高精度用电数据，提升预测准确性。",
        features: [
            {
                title: "精准计量",
                content: "正/反向有功电能，分时计费（尖峰平谷）",
            },
            {
                title: "预付费管理",
                content: "余额不足跳闸，远程充值（微信/支付宝）",
            },
            { title: "4G远程控制", content: "实时抄表、批量任务、超负荷断电" },
            { title: "安全加密", content: "ESAM模块（SMI国密算法），防篡改" },
        ],
        scenario: "住宅/园区预付费管理、工业负荷预测数据采集",
        detailDescription:
            "支持多种计费模式，实时监控用电情况，提供用电分析报表，帮助用户优化用电策略，降低能源成本。",
        detailFeatures: [
            { title: "多费率设置", content: "支持尖、峰、平、谷四费率" },
            { title: "告警功能", content: "余额不足、超功率、开箱等告警" },
            { title: "数据存储", content: "掉电数据保护，存储12个月历史数据" },
            { title: "远程升级", content: "支持OTA远程固件升级" },
        ],
        detailScenario: "商业综合体、工业园区、学校宿舍用电管理",
        pathName: "Meter",
    },
]);
</script>

<style lang="scss" scoped>
/* 优化后的顶部导航区样式 */
.top-section {
    padding: 40px 0;
}

.nav-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px; /* 增加间距 */
    max-width: 1400px;
    margin: 0 auto;
}

.nav-card {
    flex: 1 1 0; /* 等宽卡片 */
    min-width: 220px;
    max-width: 260px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
    padding: 25px 20px;
    text-align: center;
    transition: all 0.3s ease;
    border-top: 4px solid;

    /* 统一文字样式 */
    h3 {
        color: #2c3e50;
        margin: 15px 0 10px;
        font-size: 1.3rem;
        font-weight: 600; /* 标题加粗 */
    }

    p {
        color: #5e6d82;
        line-height: 1.6; /* 增加行高 */
        margin-bottom: 20px;
        min-height: 48px; /* 统一描述高度 */
    }

    /* 图标样式统一 */
    .icon {
        font-size: 2.2rem; /* 统一图标大小 */
        margin-bottom: 10px;
    }

    /* 按钮样式优化 */
    .el-button {
        width: 100%;
        padding: 10px 0;
        font-weight: 500; /* 按钮文字加粗 */
        letter-spacing: 0.5px;
    }

    /* 卡片悬停效果 */
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
    }
}

/* 卡片专属颜色 */
.nav-card:nth-child(1) {
    border-top-color: #3498db;
    .icon {
        color: #3498db;
    }
}
.nav-card:nth-child(2) {
    border-top-color: #2ecc71;
    .icon {
        color: #2ecc71;
    }
}
.nav-card:nth-child(3) {
    border-top-color: #e74c3c;
    .icon {
        color: #e74c3c;
    }
}
.nav-card:nth-child(4) {
    border-top-color: #9b59b6; /* 新增紫色 */
    .icon {
        color: #9b59b6;
    }
    .el-button {
        border: none;
        background-color: #9b59b6; /* 按钮颜色与卡片一致 */
        color: white;
    }
}
.nav-card:nth-child(5) {
    border-top-color: #1abc9c; /* 新增青色 */
    .icon {
        color: #1abc9c;
    }
    .el-button {
        border: none;
        background-color: #1abc9c; /* 按钮颜色与卡片一致 */
        color: white;
    }
}

/* 中间产品区样式 */
.product-section {
    background-color: white;
    padding: 50px 0;
    margin-top: 40px;
    border-radius: 8p x;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .header {
        text-align: center;
        margin-bottom: 2.5rem;

        h1 {
            color: #1d3b6c;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            position: relative;
            display: inline-block;

            &::after {
                content: "";
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: #2a5ba9;
                border-radius: 2px;
            }
        }

        p {
            color: #666;
            font-size: 1.1rem;
            max-width: 700px;
            margin: 1.5rem auto 0;
            line-height: 1.6;
        }
    }

    .el-divider {
        background-color: rgba(#1d3b6c, 0.2);
        margin: 1.5rem 0 2.5rem;
    }
    .product-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 30px;
        margin-top: 2rem;
    }
}
@media (max-width: 768px) {
    .product-grid {
        grid-template-columns: 1fr !important;
        gap: 25px !important;
    }
}
</style>
