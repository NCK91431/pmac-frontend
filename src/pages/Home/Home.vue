<template>
    <!-- 轮播图区域- 手机端隐藏 -->
    <section class="banner-section" v-if="!isMobile">
        <swiper
            :modules="modules"
            :pagination="{ clickable: true }"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            :loop="true"
            class="banner-swiper"
        >
            <swiper-slide v-for="(slide, index) in bannerSlides" :key="index">
                <img :src="slide.imgSrc" :alt="slide.alt" />
                <div class="slide-content">
                    <div class="wrap">
                        <div class="left">
                            <div class="title-container">
                                <h1>{{ $t(slide.titleKey) }}</h1>
                            </div>
                            <ul>
                                <li
                                    v-for="(item, itemIndex) in slide.features"
                                    :key="itemIndex"
                                >
                                    {{
                                        $t(
                                            `home.${slide.name}.features[${itemIndex}]`
                                        )
                                    }}
                                </li>
                            </ul>
                        </div>
                        <button
                            class="experience-btn"
                            @click.stop="gotoPage(slide.page)"
                        >
                            {{ $t("home.immediateExperience") }}
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </swiper-slide>
        </swiper>
    </section>

    <!-- 顶部导航区 -->
    <section class="top-section">
        <div class="section-title">
            <h2>{{ $t("home.title") }}</h2>
            <p>
                {{ $t("home.subtitle") }}
            </p>
        </div>
        <div class="nav-cards">
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>{{ $t("home.loadForecast.title") }}</h3>
                <p>
                    <text>{{ $t("home.loadForecast.description") }}</text>
                </p>
                <el-button type="primary" @click="gotoPage('load')">
                    {{ $t("home.enterPage") }}
                </el-button>
            </div>

            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-sun"></i>
                </div>
                <h3>{{ $t("home.pvForecast.title") }}</h3>
                <p>
                    <text>{{ $t("home.pvForecast.description") }}</text>
                </p>
                <el-button type="success" @click="gotoPage('elec')">
                    {{ $t("home.enterPage") }}
                </el-button>
            </div>

            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-solar-panel"></i>
                </div>
                <h3>{{ $t("home.pvStorage.title") }}</h3>
                <p>{{ $t("home.pvStorage.description") }}</p>
                <el-button type="warning" @click="gotoPage('light')">
                    {{ $t("home.enterPage") }}
                </el-button>
            </div>
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-coins"></i>
                </div>
                <h3>{{ $t("home.storageArbitrage.title") }}</h3>
                <p>
                    <text>
                        {{ $t("home.storageArbitrage.description") }}
                    </text>
                </p>
                <el-button type="danger" @click="showComingSoon">
                    {{ $t("home.enterPage") }}
                </el-button>
            </div>
            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h3>{{ $t("home.assetHealth.title") }}</h3>
                <p>{{ $t("home.assetHealth.description") }}</p>
                <el-button type="info" @click="gotoPage('health')">
                    {{ $t("home.enterPage") }}
                </el-button>
            </div>
        </div>
    </section>

    <!-- 功能介绍宣传 -->
    <div class="intro-containner" v-if="!isMobile">
        <Intro />
    </div>

    <!-- 待开发功能:可爱的提示弹窗 -->
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
            <h3>{{ $t("home.comingSoon.title") }}</h3>
            <p>{{ $t("home.comingSoon.message") }}</p>
            <p>{{ $t("home.comingSoon.contact") }}</p>
            <div class="animation-container">
                <div class="loader">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
        <button @click="comingSoonVisible = false" class="confirm-btn">
            {{ $t("home.comingSoon.button") }}
        </button>
    </el-dialog>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted, onUnmounted, inject, computed } from "vue";
import { ElDialog } from "element-plus";
// 导入Swiper相关组件和样式
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import Intro from "./Intro.vue";
import "swiper/css";
import "swiper/css/pagination";
import { useLoadForecastStore } from "@/store/load";
import { useElecStore } from "@/store/elec";
import { useLightStore } from "@/store/light";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 获取 t 函数

const LoadStore = useLoadForecastStore();
const ElecStore = useElecStore();
const LightStore = useLightStore();

const router = useRouter();

// 添加移动端检测
const isMobile = ref(false);
const checkIsMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

/* --------------------------------- 广告轮播图 ------------------------------ */
// 轮播图数据
const bannerSlides = [
    {
        imgSrc: "https://pmac.leyi.host/downloads/banner/load.jpg",
        alt: "负荷预测",
        titleKey: "home.loadForecast.title", // 只存储翻译的key
        name: "loadForecast",
        features: [
            "引入国家气象局高精度数据",
            "负荷预测算法模型荣获国际人工智能大赛银奖",
            "精准预测 D+1 日 24 小时逐时负荷",
            "已服务大型售电公司日常交易",
        ],
        page: "load",
    },
    {
        imgSrc: "https://pmac.leyi.host/downloads/banner/pv.jpg",
        alt: "光伏发电预测",
        titleKey: "home.pvForecast.title", // 只存储翻译的key
        name: "pvForecast",
        features: [
            "打通现货与虚拟电厂全链路",
            "引入国家气象局高精度数据",
            "国家级获奖算法",
            "成功服务上百家光伏站点",
        ],
        page: "elec",
    },
    {
        imgSrc: "https://pmac.leyi.host/downloads/banner/light.png",
        alt: "光伏发电预测",
        titleKey: "home.pvStorage.title", // 只存储翻译的key
        name: "pvStorage",
        features: [
            "基于负荷与电价曲线的智能容量优化",
            "综合考虑投资成本与运营收益的多目标优化",
            "支持多种储能技术路线与经济性对比",
            "已为工商业园区提供最优光储配置方案",
        ],
        page: "light",
    },
];
const modules = [Autoplay, Pagination];
// 获取header高度
const headerHeight = inject("headerHeight");
// 计算轮播图高度
const bannerHeight = computed(() => {
    if (isMobile.value) {
        return "0px"; // 移动端隐藏轮播图
    }
    if (headerHeight && headerHeight.value) {
        return `calc((100vh - ${headerHeight.value}px) / 2)`;
    }
    return "50vh"; // 默认值
});

// 页面加载完成后更新轮播图高度
onMounted(() => {
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    // 确保Swiper正确初始化
    setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
    }, 100);
});

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener("resize", checkIsMobile);
});

/* --------------------------------- 导航到各个功能页面 ------------------------------ */
const gotoPage = (page) => {
    switch (page) {
        case "home":
            router.push("/");
            break;
        case "load":
            if (LoadStore.stage <= 0) {
                router.push("/load_example");
            } else {
                router.push("/loadpre");
            }
            break;
        case "elec":
            if (ElecStore.stage == 0) {
                router.push("/elec_example");
            } else {
                router.push("/elec");
            }
            break;
        case "light":
            if (LightStore.stage == 0) {
                router.push("/light_example");
            } else {
                router.push("/light");
            }
            break;
        case "chuneng":
            router.push("/chunengpre");
            break;
        case "health":
            router.push("/health");
            break;
        default:
            router.push("/");
            break;
    }
};

const comingSoonVisible = ref(false); // 控制弹窗显示

const headerTitle = ref("工业物联网产品解决方案");
const headerSubtitle = ref(
    "高效、稳定、安全的工业通信与数据采集设备，助力企业数字化转型"
);
const products = ref([
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

// 显示开发中提示
const showComingSoon = () => {
    comingSoonVisible.value = true;
};
</script>

<style lang="scss" scoped>
/* 轮播图区域样式 */
.banner-section {
    width: 100%;
    margin: 0;
    position: relative;
    height: v-bind(bannerHeight);
    overflow: hidden;

    @media (max-width: 768px) {
        display: none; /* 移动端完全隐藏轮播图 */
    }

    .banner-swiper {
        width: 100%;
        height: 100%;

        .swiper-slide {
            position: relative;
            cursor: pointer;

            img {
                width: 100%;
                height: 100%;
                object-fit: fill;
                display: block;
            }

            &:hover .slide-content {
                background: linear-gradient(
                    to bottom,
                    rgba(0, 0, 0, 0.3),
                    rgba(0, 0, 0, 0.2)
                );
            }

            &:hover .slide-content ul {
                transform: translateY(-5px);
            }
            .slide-content {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    to bottom,
                    rgba(0, 0, 0, 0.2),
                    rgba(0, 0, 0, 0.1)
                );
                transition: background 0.3s ease;
                color: white;
                z-index: 100;
                opacity: 1;
                transition: all 0.5s ease;
                display: flex;
                flex-direction: column;
                justify-content: center;

                .wrap {
                    display: flex;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 17%;
                }

                .title-container {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 1.5rem;

                    /* 添加半透明背景，确保文字在任何背景下都可见 */
                    &::before {
                        content: "";
                        position: absolute;
                        top: -10px;
                        left: -15px;
                        right: -15px;
                        bottom: -10px;
                        border-radius: 8px;
                        z-index: -1;
                    }
                }

                h1 {
                    font-size: 3.2rem;
                    font-weight: 800;
                    color: #fff;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8),
                        0 4px 8px rgba(0, 0, 0, 0.6);
                    transform: translateY(0);
                    transition: all 0.5s ease;
                    position: relative;
                    letter-spacing: 1px;
                    line-height: 1.2;
                    margin: 0;
                    padding: 5px 0;

                    /* 确保字体在构建后也能正确加载 */
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                        Roboto, "Helvetica Neue", Arial, sans-serif,
                        "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                }

                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 2rem 0;
                    opacity: 1;
                    transform: translateY(0);
                    transition: all 0.5s ease 0.1s;
                    li {
                        font-style: italic;
                        font-size: 1.4rem;
                        margin-bottom: 0.8rem;
                        text-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
                        position: relative;
                        padding-left: 30px;
                        &:before {
                            content: "✓";
                            position: absolute;
                            left: 0;
                            color: #4cd964;
                        }
                    }
                }
                .experience-btn {
                    align-items: bottom;
                    margin-top: auto;
                    background: linear-gradient(
                        135deg,
                        #2b7cff 0%,
                        #42d3ff 100%
                    );
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    &:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 4px 8px rgba(43, 124, 255, 0.6),
                            0 8px 16px rgba(66, 211, 255, 0.4);
                    }
                }
            }

            &:hover .slide-content h1 {
                transform: translateY(-10px);
                text-shadow: 0 4px 8px rgba(0, 0, 0, 0.9),
                    0 8px 16px rgba(0, 0, 0, 0.7);
            }

            /* 响应式调整 */
            @media (max-width: 768px) {
                .slide-content h3 {
                    font-size: 1.8rem;
                }

                .slide-content li {
                    font-size: 1rem;
                }

                .experience-btn {
                    padding: 10px 20px;
                    font-size: 1rem;
                }
            }
        }

        // 分页器样式 - 修复后的写法
        :deep(.swiper-pagination-bullet) {
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.6);
            opacity: 1;
        }

        :deep(.swiper-pagination-bullet-active) {
            background: #fff;
            transform: scale(1.2);
        }
    }
}

/* 顶部导航区样式优化 */
.top-section {
    padding: 40px 0;

    @media (max-width: 768px) {
        padding: 20px 0;
        margin-top: 0; /* 移除轮播图后的顶部间距 */
    }

    .section-title {
        text-align: center;
        margin-bottom: 40px;

        @media (max-width: 768px) {
            margin-bottom: 25px;
            padding: 0 15px;
        }

        h2 {
            color: #1d3b6c;
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 15px;

            @media (max-width: 768px) {
                font-size: 1.6rem;
                margin-bottom: 10px;
            }
        }

        p {
            color: #5e6d82;
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;

            @media (max-width: 768px) {
                font-size: 0.9rem;
                line-height: 1.5;
            }
        }
    }
    .nav-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 25px;
        max-width: 1400px;
        margin: 0 auto;

        @media (max-width: 768px) {
            gap: 15px;
            padding: 0 10px;
        }

        .nav-card {
            flex: 1;
            min-width: 220px;
            max-width: 260px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            padding: 30px 20px;
            text-align: center;
            transition: all 0.3s ease;
            border-top: 4px solid;
            position: relative;
            overflow: hidden;

            /* 添加悬浮效果 */
            &:hover {
                transform: translateY(-8px);
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);

                &::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: inherit;
                }
            }

            /* 统一文字样式 */
            h3 {
                color: #2c3e50;
                margin: 20px 0 12px;
                font-size: 1.3rem;
                font-weight: 600;
            }

            p {
                color: #5e6d82;
                line-height: 1.6;
                margin-bottom: 25px;
                min-height: 48px;
            }

            /* 图标样式统一 */
            .icon {
                font-size: 2.5rem;
                margin-bottom: 15px;
                transition: transform 0.3s ease;
            }

            &:hover .icon {
                transform: scale(1.1);
            }

            /* 按钮样式优化 */
            .el-button {
                width: 100%;
                padding: 12px 0;
                font-weight: 500;
                letter-spacing: 0.5px;
                border: none;
                border-radius: 6px;
                transition: all 0.3s ease;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
            }
            /* 卡片专属颜色 */
            &:nth-child(1) {
                border-top-color: #3498db;
                .icon {
                    color: #3498db;
                }
                .el-button {
                    background-color: #3498db;
                    color: white;
                }
            }
            &:nth-child(2) {
                border-top-color: #2ecc71;
                .icon {
                    color: #2ecc71;
                }
                .el-button {
                    background-color: #2ecc71;
                    color: white;
                }
            }
            &:nth-child(3) {
                border-top-color: #f39c12;
                .icon {
                    color: #f39c12;
                }
                .el-button {
                    background-color: #f39c12;
                    color: white;
                }
            }
            &:nth-child(4) {
                border-top-color: #9b59b6;
                .icon {
                    color: #9b59b6;
                }
                .el-button {
                    background-color: #9b59b6;
                    color: white;
                }
            }
            &:nth-child(5) {
                border-top-color: #1abc9c;
                .icon {
                    color: #1abc9c;
                }
                .el-button {
                    background-color: #1abc9c;
                    color: white;
                }
            }
        }
    }
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .nav-cards {
        gap: 20px;
    }

    .nav-card {
        min-width: 200px;
    }
}

@media (max-width: 992px) {
    .carousel-overlay {
        padding: 0 40px !important;

        h2 {
            font-size: 2rem !important;
        }

        p {
            font-size: 1.1rem !important;
        }
    }

    .nav-cards {
        gap: 15px;
    }

    .nav-card {
        min-width: 180px;
        padding: 25px 15px;
    }
}

@media (max-width: 768px) {
    .banner-section {
        margin-bottom: 30px;
    }

    .carousel-item .carousel-overlay {
        padding: 0 20px !important;
        align-items: center;
        text-align: center;

        h2 {
            font-size: 1.6rem !important;
        }

        p {
            font-size: 1rem !important;
        }

        .el-button {
            padding: 10px 20px !important;
        }
    }

    .top-section .section-title h2 {
        font-size: 1.8rem;
    }

    .nav-cards {
        flex-direction: column;
        align-items: center;
    }

    .nav-card {
        max-width: 100%;
        width: 100%;
        margin-bottom: 15px;
    }
}

/* 中间产品区样式 */
.product-section {
    background-color: white;
    padding: 50px 0;
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

/* 期待弹窗样式保持不变 */
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
