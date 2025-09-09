<template>
    <!-- 轮播图区域 -->
    <section class="banner-section">
        <el-carousel :interval="5000" height="800px" :loop="false">
            <el-carousel-item class="carousel-item">
                <img
                    src="https://pmac.leyi.host/downloads/banner/load.jpg"
                    alt="负荷预测"
                />
                <div class="carousel-overlay">
                    <div class="wrap load">
                        <h2>负荷预测分析</h2>
                        <p>提供精准的负荷预测分析，帮助优化能源分配</p>
                        <el-button
                            type="primary"
                            size="large"
                            @click="gotoPage('load')"
                            >立即体验</el-button
                        >
                    </div>
                </div>
            </el-carousel-item>
            <el-carousel-item class="carousel-item">
                <img
                    src="https://pmac.leyi.host/downloads/banner/pv.jpg"
                    alt="光伏发电预测"
                />
                <div class="carousel-overlay">
                    <div class="wrap pv">
                        <h2>光伏发电预测</h2>
                        <p>基于气象数据的太阳能发电量预测与分析</p>
                        <el-button
                            type="success"
                            size="large"
                            @click="gotoPage('elec')"
                            >立即体验</el-button
                        >
                    </div>
                </div>
            </el-carousel-item>
        </el-carousel>
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
import { ref, onMounted } from "vue";

const router = useRouter();
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

// 预加载图片
const preloadImages = () => {
    const imageUrls = [
        "https://pmac.leyi.host/downloads/banner/pv.jpg",
        "https://pmac.leyi.host/downloads/banner/load.jpg",
    ];

    imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
};

onMounted(() => {
    preloadImages();
});
</script>

<style lang="scss" scoped>
/* 轮播图区域样式 */
.banner-section {
    width: 80vw;
    margin: 40px auto;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);

    :deep(.el-carousel) {
        border-radius: 12px;
    }

    :deep(.el-carousel__arrow) {
        background-color: rgba(255, 255, 255, 0.6);
        color: #333;

        &:hover {
            background-color: rgba(255, 255, 255, 0.9);
        }
    }

    :deep(.el-carousel__indicators) {
        bottom: 20px;

        .el-carousel__indicator {
            padding: 8px 4px;

            .el-carousel__button {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: rgba(255, 255, 255, 0.6);
            }

            &.is-active .el-carousel__button {
                background-color: #fff;
                width: 24px;
                border-radius: 6px;
            }
        }
    }
}

.carousel-item {
    position: relative;
    height: 100%;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .carousel-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: 0 80px;
        background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.2) 100%
        );
        color: white;
        .wrap {
            display: flex;
            flex-direction: column;
            &.pv {
                justify-self: flex-end;
                margin-left: auto;
                align-items: flex-end;
            }
            &.load {
                align-items: flex-start;
            }
            h2 {
                text-align: right;
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 15px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }

            p {
                font-size: 1.2rem;
                margin-bottom: 25px;
                max-width: 500px;
                line-height: 1.5;
            }

            .el-button {
                font-weight: 600;
                padding: 12px 30px;
                border: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
                }
            }
        }
    }
}

/* 顶部导航区样式优化 */
.top-section {
    padding: 0 0 40px 0;

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
}

.nav-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 25px;
    max-width: 1400px;
    margin: 0 auto;
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
}

/* 卡片专属颜色 */
.nav-card:nth-child(1) {
    border-top-color: #3498db;
    .icon {
        color: #3498db;
    }
    .el-button {
        background-color: #3498db;
        color: white;
    }
}
.nav-card:nth-child(2) {
    border-top-color: #2ecc71;
    .icon {
        color: #2ecc71;
    }
    .el-button {
        background-color: #2ecc71;
        color: white;
    }
}
.nav-card:nth-child(3) {
    border-top-color: #f39c12;
    .icon {
        color: #f39c12;
    }
    .el-button {
        background-color: #f39c12;
        color: white;
    }
}
.nav-card:nth-child(4) {
    border-top-color: #9b59b6;
    .icon {
        color: #9b59b6;
    }
    .el-button {
        background-color: #9b59b6;
        color: white;
    }
}
.nav-card:nth-child(5) {
    border-top-color: #1abc9c;
    .icon {
        color: #1abc9c;
    }
    .el-button {
        background-color: #1abc9c;
        color: white;
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
