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
        <h2 class="section-title">产品展示</h2>
        <div class="products-container">
            <!-- 表计产品 -->
            <div class="product-category">
                <div class="product-header">表计产品</div>
                <el-carousel
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
                </el-carousel>
                <div class="product-description">
                    <p>
                        高精度智能电能表，支持双向计量、远程抄表、实时监控等功能，适用于各类工商业场景。
                    </p>
                    <ul>
                        <li>
                            <i class="fas fa-check-circle"></i> 精度等级：0.5S级
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            通信协议：DL/T645, Modbus
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            支持RS485/4G/NB-IoT通信
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i> 温度范围：-40℃ ~
                            +70℃
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 网关产品 -->
            <div class="product-category">
                <div class="product-header">PMAC3101 4G工业通信网关</div>
                <el-carousel
                    height="250px"
                    :interval="4000"
                    indicator-position="outside"
                >
                    <el-carousel-item v-for="item in 3" :key="item">
                        <div class="product-img">
                            <el-image
                                style="width: 250px; height: auto"
                                src="https://omo-oss-image.thefastimg.com/portal-saas/pg2025040218401364287/cms/image/2c7cdb7b-8fb8-45c7-8cdd-44ce9a9610ed.png"
                                :fit="fit"
                            />
                        </div>
                    </el-carousel-item>
                </el-carousel>
                <div class="product-description">
                    <p>
                        应用场景：工业能耗监测、智能建筑远程数据采集、变电站监控
                    </p>
                    <ul>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            高速4G通信：上行5Mbps/下行10Mbps，替代2G DTU
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            协议转换：Modbus RTU/TCP互转，支持云平台对接
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            多设备接入：2路RS485，最多32台仪表，通信距离1.2km
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            智能管理：一键扫描、远程配置、心跳包机制
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 红外抄表 -->
            <div class="product-category">
                <div class="product-header">红外抄表</div>
                <el-carousel
                    height="250px"
                    :interval="4000"
                    indicator-position="outside"
                >
                    <el-carousel-item v-for="item in 3" :key="item">
                        <div class="product-img">
                            <el-image
                                style="width: 250px; height: auto"
                                src="https://omo-oss-image.thefastimg.com/portal-saas/pg2025040218401364287/cms/image/d4f52344-f71f-46ce-902b-9c3c71604e54.png"
                                :fit="fit"
                            />
                        </div>
                    </el-carousel-item>
                </el-carousel>
                <div class="product-description">
                    <p>
                        非接触式红外抄表设备，可在复杂环境下快速、准确读取各类仪表数据。
                    </p>
                    <ul>
                        <li>
                            <i class="fas fa-check-circle"></i> 有效距离：0-20米
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i> 识别精度：99.9%
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i> 支持多种仪表类型
                        </li>
                        <li>
                            <i class="fas fa-check-circle"></i>
                            内置大容量电池，续航30天
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useRouter } from "vue-router";
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
}

.section-title {
    text-align: center;
    margin-bottom: 40px;
    color: #2c3e50;
    font-size: 2rem;
    position: relative;
}

.section-title::after {
    content: "";
    display: block;
    width: 80px;
    height: 4px;
    background: #3498db;
    margin: 15px auto;
    border-radius: 2px;
}

.products-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
}

.product-category {
    flex: 1;
    min-width: 320px;
    max-width: 380px;
    background: var(--light);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.product-header {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 15px;
    font-size: 1.3rem;
    font-weight: 500;
}
.product-img {
    width: 100%;
    display: flex;
    justify-content: center;
}
.product-description {
    padding: 20px;
    line-height: 1.7;
}

.product-description ul {
    list-style-type: none;
    padding: 0;
    margin-top: 15px;
}

.product-description li {
    padding: 8px 0;
    border-bottom: 1px dashed #ddd;
}

.product-description li:last-child {
    border-bottom: none;
}

.product-description li i {
    margin-right: 10px;
    color: #2ecc71;
}
</style>
