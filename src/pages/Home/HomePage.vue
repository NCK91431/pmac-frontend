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
                <el-button type="success" @click="showComingSoon"
                    >进入页面</el-button
                >
            </div>

            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-solar-panel"></i>
                </div>
                <h3>光储定容</h3>
                <p>光伏储能系统容量优化设计与经济性分析</p>
                <el-button type="danger" @click="showComingSoon"
                    >进入页面</el-button
                >
            </div>
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-coins"></i>
                </div>
                <h3>慧储&trade;套利模拟</h3>
                <p>量化分析峰谷套利策略收益，助力储能投资回报最大化</p>
                <el-button type="danger" @click="showComingSoon"
                    >进入页面</el-button
                >
            </div>
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>资产健康哨兵</h3>
                <p>精准预警故障风险，延长设备生命周期</p>
                <el-button type="danger" @click="showComingSoon"
                    >进入页面</el-button
                >
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
    <!-- 可爱的提示弹窗 -->
    <el-dialog
        v-model="comingSoonVisible"
        title=""
        width="380px"
        custom-class="coming-soon-dialog"
        :show-close="false"
        style="border-radius: 12px"
    >
        <div class="dialog-content">
            <div class="emoji">🚀</div>
            <h3>正在快马加鞭开发中...</h3>
            <p>功能即将上线</p>
            <p>如有项目对接需求，请联系：15919159383</p>
            <div class="animation-container">
                <div class="loader">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
        <button @click="comingSoonVisible = false" class="confirm-btn">
            好的，期待中！
        </button>
    </el-dialog>
</template>

<script setup>
import { useRouter } from "vue-router";
import ProductCard from "./ProductCard.vue";
import { reactive, ref } from "vue";
import { ElDialog } from "element-plus";
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
        title: "PMAC124 4G红外抄表仪",
        subtitle: "EMC-200系列",
        imgURL: "https://pmac.leyi.host/downloads/product_03.png",
        description:
            "无需改造现有电表，3分钟完成安装，立即实现远程抄表与数据上传。",
        features: [
            {
                title: "非接触抄表",
                content: "红外通信 0-3 米，90° 角度，免接线",
            },
            {
                title: "通信方式",
                content: "4G（内置 8 年流量）",
            },
            {
                title: "易安装",
                content: "3M 胶贴装，9-12V DC 供电，即插即用",
            },
            {
                title: "多协议支持",
                content: "DL/T645、Modbus RTU、MQTT",
            },
        ],
        scenario: "工业现场仪表数据采集、住宅/商业楼宇电表改造",
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
        title: "PMGC-2000微网控制器",
        subtitle: "图例",
        imgURL: "https://pmac.leyi.host/downloads/product_02.png",
        description:
            "集微网协调控制、数据采集与转发、策略管理于一体，维持微网功率与频率稳定，提升清洁能源利用效率。",
        features: [
            {
                title: "协调控制",
                content: "分布式智能调频调压，光储荷协调",
            },
            {
                title: "数据采集",
                content: "16 路 RS485，并行采集提高效率",
            },
            {
                title: "数据转发与上传",
                content: "云平台上传，支持多主机连接",
            },
            {
                title: "策略管理",
                content: "计划充放电、需求侧响应，虚拟电厂搭建等",
            },
        ],
        scenario: "工商业、企业园区微网管理，源网荷储一体化协调",
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

const comingSoonVisible = ref(false); // 控制弹窗显示
// 显示开发中提示
const showComingSoon = () => {
    comingSoonVisible.value = true;
};
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

/* 期待弹窗 */
:deep(.coming-soon-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border: none;

    .el-dialog__header {
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        margin: 0;
        padding: 20px;

        .el-dialog__title {
            color: white;
            font-weight: 600;
            font-size: 1.4rem;
        }
    }

    .el-dialog__body {
        padding: 25px 30px 15px;
    }

    .el-dialog__footer {
        padding: 0 30px 25px;
        text-align: center;
    }
}

.dialog-content {
    text-align: center;

    .emoji {
        font-size: 3.5rem;
        margin-bottom: 15px;
        animation: bounce 1.5s infinite;
    }

    h3 {
        color: #2c3e50;
        font-size: 1.5rem;
        margin-bottom: 15px;
        font-weight: 600;
    }

    p {
        color: #5e6d82;
        line-height: 1.7;
        margin-bottom: 10px;
        font-size: 1.05rem;
    }

    .animation-container {
        margin: 25px 0 15px;
        display: flex;
        justify-content: center;
    }
}

.confirm-btn {
    width: 100%;
    padding: 12px 20px;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 8px;
    background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
    border: none;
    color: white;
    transition: all 0.3s ease;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4);
    }
}

/* 加载动画 */
.loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;

    .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
        animation: pulse 1.2s infinite ease-in-out;

        &:nth-child(2) {
            animation-delay: 0.2s;
        }

        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
}

/* 动画定义 */
@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-15px);
    }
}

@keyframes pulse {
    0%,
    60%,
    100% {
        transform: scale(1);
        opacity: 1;
    }
    30% {
        transform: scale(1.3);
        opacity: 0.8;
    }
}
</style>
