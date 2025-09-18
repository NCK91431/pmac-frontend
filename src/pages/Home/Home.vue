<template>
    <!-- 轮播图区域 -->
    <section class="banner-section">
        <swiper
            :modules="modules"
            :pagination="{ clickable: true }"
            :autoplay="{ delay: 5000, disableOnInteraction: false }"
            :loop="true"
            class="banner-swiper"
        >
            <swiper-slide>
                <img
                    src="https://pmac.leyi.host/downloads/banner/load.jpg"
                    alt="负荷预测"
                />
                <div class="slide-content">
                    <div class="wrap">
                        <div class="left">
                            <div class="title-container">
                                <h1>负荷预测</h1>
                            </div>
                            <ul>
                                <li>引入国家气象局高精度数据</li>
                                <li>
                                    负荷预测算法模型荣获国际人工智能大赛银奖
                                </li>
                                <li>精准预测 D+1 日 24 小时逐时负荷</li>
                                <li>已服务大型售电公司日常交易</li>
                            </ul>
                        </div>
                        <button
                            class="experience-btn"
                            @click.stop="gotoPage('load')"
                        >
                            立即体验 <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </swiper-slide>
            <swiper-slide>
                <img
                    src="https://pmac.leyi.host/downloads/banner/pv.jpg"
                    alt="光伏发电预测"
                />
                <div class="slide-content">
                    <div class="wrap">
                        <div class="left">
                            <div class="title-container">
                                <h1>光伏发电预测</h1>
                            </div>
                            <ul>
                                <li>打通现货与虚拟电厂全链路</li>
                                <li>引入国家气象局高精度数据</li>
                                <li>国家级获奖算法</li>
                                <li>成功服务上百家光伏站点</li>
                            </ul>
                        </div>
                        <button
                            class="experience-btn"
                            @click.stop="gotoPage('elec')"
                        >
                            立即体验 <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </swiper-slide>
        </swiper>
    </section>

    <!-- 顶部导航区 -->
    <section class="top-section">
        <div class="section-title">
            <h2>智能能源解决方案</h2>
            <p>一站式能源管理平台，助力企业高效用能</p>
        </div>
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
                <el-button type="success" @click="gotoPage('elec')"
                    >进入页面</el-button
                >
            </div>

            <div class="nav-card">
                <div class="icon">
                    <i class="fas fa-solar-panel"></i>
                </div>
                <h3>光储定容</h3>
                <p>光伏储能系统容量优化设计与经济性分析</p>
                <el-button type="warning" @click="gotoPage('light')"
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
                <el-button type="info" @click="showComingSoon"
                    >进入页面</el-button
                >
            </div>
        </div>
    </section>

    <!-- 功能介绍宣传 -->
    <div class="intro-containner">
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
import { ref, onMounted, inject, computed } from "vue";
import { ElDialog } from "element-plus";
// 导入Swiper相关组件和样式
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import Intro from "./Intro.vue";
import "swiper/css";
import "swiper/css/pagination";

const router = useRouter();

/* --------------------------------- 广告轮播图 ------------------------------ */
const modules = [Autoplay, Pagination];
// 获取header高度
const headerHeight = inject("headerHeight");
// 计算轮播图高度
const bannerHeight = computed(() => {
    if (headerHeight && headerHeight.value) {
        return `calc((100vh - ${headerHeight.value}px) / 2)`;
    }
    return "50vh"; // 默认值
});

// 页面加载完成后更新轮播图高度
onMounted(() => {
    // 确保Swiper正确初始化
    setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
    }, 100);
});

/* --------------------------------- 导航到各个功能页面 ------------------------------ */
const gotoPage = (page) => {
    switch (page) {
        case "home":
            router.push("/");
            break;
        case "load":
            router.push("/loadpre");
            break;
        case "elec":
            router.push("/elec");
            break;
        case "light":
            router.push("/light");
            break;
        case "chuneng":
            router.push("/chunengpre");
            break;
        default:
            router.push("/");
            break;
    }
};

const comingSoonVisible = ref(false); // 控制弹窗显示
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

    .section-title {
        text-align: center;
        margin-bottom: 40px;

        h2 {
            color: #1d3b6c;
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 15px;
        }

        p {
            color: #5e6d82;
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
        }
    }
    .nav-cards {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 25px;
        max-width: 1400px;
        margin: 0 auto;
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

/*功能介绍宣传样式 */
.intro-containner {
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
