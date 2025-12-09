<!-- 产品详情 -->
<template>
    <div class="product-detail">
        <!-- 顶部横幅部分 -->
        <section class="hero-section" ref="heroSection">
            <div class="hero-bg">
                <div
                    class="floating-particle"
                    v-for="(particle, index) in particles"
                    :key="index"
                    :style="{
                        left: particle.x + '%',
                        top: particle.y + '%',
                        width: particle.size + 'px',
                        height: particle.size + 'px',
                        animationDelay: particle.delay + 's',
                    }"
                ></div>
            </div>
            <div class="container">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1 class="hero-title">
                            <span class="title-main">EGate10-PV</span>
                            <span class="title-sub">光伏四可控制器</span>
                        </h1>
                        <p class="hero-description" ref="heroDescription">
                            EGate10
                            光伏四可通信网关采用高性能工业级处理器，集成多协议解析与边缘计算能力，配合加密通信机制，实现光伏系统全环节数据采集、调控与安全传输，是光伏四可（可观、可测、可调、可控）场景的核心通信枢纽，适配光伏逆变器、并网设备等多终端接入与电网调度需求。
                        </p>
                        <div class="hero-highlight" ref="heroHighlight">
                            <p>
                                设备支持多协议兼容与加密通信（MD5 身份认证、128
                                位 AES 等），采用导轨式宽温设计，工作环境
                                -25℃~+70℃，即装即用，为光伏场站提供高效、安全的端到端数据链路与智能管控能力。
                            </p>
                        </div>
                        <div class="hero-stats">
                            <div
                                class="stat-item"
                                v-for="(stat, index) in stats"
                                :key="index"
                            >
                                <div class="stat-value" ref="statValues">
                                    {{ stat.value }}
                                </div>
                                <div class="stat-label">{{ stat.label }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="hero-image">
                        <div class="image-container" ref="imageContainer">
                            <img
                                src="https://pmac.leyi.host/downloads/pmac/products/EGate10.png"
                                alt="EGate10-PV 光伏四可控制器"
                            />
                            <div class="image-glow"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="scroll-indicator">
                <div class="scroll-arrow"></div>
            </div>
        </section>

        <!-- 核心优势部分 -->
        <section class="advantages-section" ref="advantagesSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">核心优势</h2>
                    <p class="section-subtitle">
                        专为光伏四可场景设计的智能边缘控制器
                    </p>
                </div>
                <div class="advantages-grid">
                    <div
                        class="advantage-card"
                        v-for="(advantage, index) in advantages"
                        :key="index"
                        :ref="
                            (el) => {
                                if (el) advantageCards[index] = el;
                            }
                        "
                    >
                        <div class="card-icon">
                            <div class="icon-bg"></div>
                            <span class="icon-text">{{ advantage.icon }}</span>
                        </div>
                        <h3 class="card-title">{{ advantage.title }}</h3>
                        <p class="card-description">
                            {{ advantage.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 产品选型部分 -->
        <!-- <section class="selection-section" ref="selectionSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">产品选型</h2>
                    <p class="section-subtitle">多种配置满足不同应用需求</p>
                </div>
                <div class="selection-content">
                    <div class="selection-table" ref="selectionTable">
                        <div class="table-header">
                            <div class="table-cell">型号规格</div>
                            <div class="table-cell">功能模块</div>
                            <div class="table-cell">通讯形式</div>
                        </div>
                        <div
                            class="table-row"
                            v-for="(model, index) in productModels"
                            :key="index"
                        >
                            <div class="table-cell">{{ model.model }}</div>
                            <div class="table-cell">{{ model.features }}</div>
                            <div class="table-cell">
                                {{ model.communication }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section> -->

        <!-- 关键特性部分 -->
        <section class="features-section" ref="featuresSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">关键特性</h2>
                    <p class="section-subtitle">卓越性能与稳定性的完美结合</p>
                </div>
                <div class="features-content">
                    <div class="features-image">
                        <div class="image-container">
                            <img
                                src="https://pmac.leyi.host/downloads/pmac/products/EGate10.png"
                                alt="EGate10-PV 特性展示"
                            />
                            <div class="floating-elements">
                                <div
                                    class="floating-element"
                                    v-for="(element, index) in floatingElements"
                                    :key="index"
                                    :style="{
                                        animationDelay: `${index * 0.5}s`,
                                    }"
                                >
                                    <span class="element-text">{{
                                        element.text
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="features-list">
                        <div
                            class="feature-item"
                            v-for="(feature, index) in features"
                            :key="index"
                            :ref="
                                (el) => {
                                    if (el) featureItems[index] = el;
                                }
                            "
                        >
                            <div class="feature-icon">
                                <span class="icon">✓</span>
                            </div>
                            <div class="feature-content">
                                <h3 class="feature-title">
                                    {{ feature.title }}
                                </h3>
                                <p class="feature-description">
                                    {{ feature.description }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 技术指标部分 -->
        <section class="specs-section" ref="specsSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">技术指标</h2>
                    <p class="section-subtitle">专业级硬件配置与性能参数</p>
                </div>
                <div class="specs-grid">
                    <div
                        class="spec-card"
                        v-for="(spec, index) in specifications"
                        :key="index"
                        :ref="
                            (el) => {
                                if (el) specCards[index] = el;
                            }
                        "
                    >
                        <div class="spec-icon">
                            <span class="icon">{{ spec.icon }}</span>
                        </div>
                        <h3 class="spec-title">{{ spec.title }}</h3>
                        <p class="spec-value">{{ spec.value }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 应用场景部分 -->
        <section class="applications-section" ref="applicationsSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">应用场景</h2>
                    <p class="section-subtitle">适用于低压光伏四可</p>
                </div>
                <div class="applications-content">
                    <div
                        class="application-card"
                        v-for="(app, index) in applications"
                        :key="index"
                        :ref="
                            (el) => {
                                if (el) applicationCards[index] = el;
                            }
                        "
                    >
                        <div class="application-icon">
                            <div class="icon-bg"></div>
                            <span class="icon-text">{{ app.icon }}</span>
                        </div>
                        <h3 class="application-title">{{ app.title }}</h3>
                        <p class="application-description">
                            {{ app.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 主要功能部分 -->
        <section class="functions-section" ref="functionsSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">主要功能</h2>
                    <p class="section-subtitle">
                        全面满足光伏场站智能化管理需求
                    </p>
                </div>
                <div class="functions-grid">
                    <div
                        class="function-card"
                        v-for="(func, index) in functions"
                        :key="index"
                        :ref="
                            (el) => {
                                if (el) functionCards[index] = el;
                            }
                        "
                    >
                        <div class="card-header">
                            <div class="function-icon">
                                <span class="icon">{{ func.icon }}</span>
                            </div>
                            <h3 class="function-title">{{ func.title }}</h3>
                        </div>
                        <div class="card-content">
                            <p class="function-description">
                                {{ func.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- AGC/AVC策略控制部分 -->
        <section class="strategy-section" ref="strategySection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">AGC/AVC策略控制</h2>
                    <p class="section-subtitle">精准的功率调节与电网适应性</p>
                </div>
                <div class="strategy-content">
                    <div class="strategy-tabs">
                        <div class="tab-header">
                            <button
                                class="tab-button"
                                :class="{ active: activeTab === 'agc' }"
                                @click="activeTab = 'agc'"
                            >
                                有功功率控制(AGC)
                            </button>
                            <button
                                class="tab-button"
                                :class="{ active: activeTab === 'avc' }"
                                @click="activeTab = 'avc'"
                            >
                                无功功率控制(AVC)
                            </button>
                        </div>
                        <div class="tab-content">
                            <div v-if="activeTab === 'agc'" class="tab-panel">
                                <div
                                    class="strategy-item"
                                    v-for="(mode, index) in agcModes"
                                    :key="index"
                                >
                                    <h4 class="strategy-title">
                                        {{ mode.title }}
                                    </h4>
                                    <p class="strategy-description">
                                        {{ mode.description }}
                                    </p>
                                </div>
                            </div>
                            <div v-if="activeTab === 'avc'" class="tab-panel">
                                <div
                                    class="strategy-item"
                                    v-for="(mode, index) in avcModes"
                                    :key="index"
                                >
                                    <h4 class="strategy-title">
                                        {{ mode.title }}
                                    </h4>
                                    <p class="strategy-description">
                                        {{ mode.description }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 底部CTA部分 -->
        <section class="cta-section" ref="ctaSection">
            <div class="container">
                <div class="cta-content">
                    <h2 class="cta-title">开启智能光伏管理新时代</h2>
                    <p class="cta-description">
                        EGate10-PV光伏四可控制器，为您的光伏场站提供全方位的智能化解决方案
                    </p>
                    <div class="cta-buttons">
                        <button
                            class="btn btn-primary"
                            @click="openContactModal"
                        >
                            立即咨询
                        </button>
                        <button class="btn btn-secondary">
                            <el-link
                                style="
                                    color: #fff;
                                    font-size: 1.1rem;
                                    font-weight: bolder;
                                "
                                :underline="false"
                                href="https://pmac.leyi.host/downloads/pmac/products/EGate10系列智能边缘控制器说明书V1.0.1.pdf?download=1"
                                target="_blank"
                                >下载资料</el-link
                            >
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- 联系咨询弹窗 -->
        <div v-if="showContactModal" class="modal-overlay" @click="closeModal">
            <div class="contact-modal" @click.stop>
                <button class="close-button" @click="closeModal">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M18 6L6 18"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M6 6L18 18"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>
                <div class="modal-content">
                    <div class="modal-icon">
                        <i class="bi bi-headset"></i>
                    </div>
                    <h2 class="modal-title">联系我们</h2>
                    <p class="modal-description">
                        我们的专业顾问将为您提供详细的产品咨询和解决方案
                    </p>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <i class="bi bi-chat-dots-fill"></i>
                            </div>
                            <div class="contact-details">
                                <div class="contact-name">李经理</div>
                                <div class="contact-phone">15919159383</div>
                                <div class="contact-note">（微信同号）</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="action-btn primary" @click="copyContact">
                            复制联系方式
                        </button>
                        <button
                            class="action-btn secondary"
                            @click="closeModal"
                        >
                            稍后联系
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger);

// 定义响应式引用
const heroSection = ref(null);
const heroDescription = ref(null);
const heroHighlight = ref(null);
const imageContainer = ref(null);
const statValues = ref([]);
const advantagesSection = ref(null);
const advantageCards = ref([]);
const selectionSection = ref(null);
const selectionTable = ref(null);
const featuresSection = ref(null);
const featureItems = ref([]);
const specsSection = ref(null);
const specCards = ref([]);
const applicationsSection = ref(null);
const applicationCards = ref([]);
const functionsSection = ref(null);
const functionCards = ref([]);
const strategySection = ref(null);
const ctaSection = ref(null);

// 活动标签
const activeTab = ref("agc");

// 粒子背景数据
const particles = ref(
    Array.from({ length: 15 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        delay: Math.random() * 5,
    }))
);

// 统计数据
const stats = ref([
    { value: "3", label: "RS485接口" },
    { value: "1", label: "RS232接口" },
    { value: "2", label: "DI+DO通道" },
    { value: "12V", label: "DC输出" },
]);

// 核心优势数据
const advantages = ref([
    {
        icon: "👁️",
        title: "可观",
        description: "实时采集并可视化呈现光伏系统全环节运行数据与状态",
    },
    {
        icon: "📊",
        title: "可测",
        description: "多维度精准采集光伏系统的电参数、设备状态与性能指标",
    },
    {
        icon: "🔄",
        title: "可调",
        description: "根据电网需求自动调节光伏逆变器的发电功率、输出电压",
    },
    {
        icon: "🎮",
        title: "可控",
        description: "远程控制光伏逆变器启停、功率调节及并网状态",
    },
]);

// 产品型号数据
const productModels = ref([
    {
        model: "EGate10-2CL",
        features: "2路RS485, 1路4G, 2网口",
        communication: "4G通讯(默认)",
    },
    {
        model: "EGate10-4CL",
        features: "4路RS485, 1路4G, 2网口",
        communication: "4G通讯(默认)",
    },
    {
        model: "EGate10-8CL",
        features: "8路RS485, 1路4G, 2网口",
        communication: "4G通讯(默认)",
    },
    {
        model: "EGate10-PV",
        features: "3路RS485, 1路RS232, 2DO+2DI, 1路DC 12V输出, 1路4G, 2网口",
        communication: "4G通讯(默认)或WIFI",
    },
]);

// 关键特性数据
const features = ref([
    {
        title: "灵活接入",
        description:
            "具备3路 RS485、1路RS232，2DI+2DO接口，兼容 Modbus、IEC101/104 等多协议，可对接光伏逆变器、智能断路器设备等光伏场景核心设备",
    },
    {
        title: "安全防护",
        description:
            "支持 MD5 身份认证机制，支持 128 位 AES 及 DES、3DES 等高级加密算法，保障数据传输与存储安全",
    },
    {
        title: "便捷安装",
        description:
            "154mm×40mm×90mm 导轨式设计，宽温环境 (-25℃~+70℃) 稳定运行",
    },
    {
        title: "智能管控",
        description: "AGC/AVC 策略控制，支持虚拟设备运算，远程配置与故障诊断",
    },
]);

// 浮动元素数据
const floatingElements = ref([
    { text: "3×RS485" },
    { text: "1×RS232" },
    { text: "2DI+2DO" },
    { text: "4G/WIFI" },
    { text: "-25~70℃" },
]);

// 技术指标数据
const specifications = ref([
    {
        icon: "🚀",
        title: "CPU",
        value: "双核 ARM Cortex-A7 1.2GHz",
    },
    {
        icon: "💾",
        title: "内存",
        value: "DDR3 256MB",
    },
    {
        icon: "📁",
        title: "存储",
        value: "EMMC 8GB",
    },
    {
        icon: "🔌",
        title: "电源",
        value: "AC85-265V 或 DC 100-300V",
    },
    {
        icon: "🌡️",
        title: "工作温度",
        value: "-25℃ ~ +70℃",
    },
    {
        icon: "📶",
        title: "网络接口",
        value: "2个RJ45网口，支持10/100M",
    },
]);

// 应用场景数据
const applications = ref([
    // {
    //     icon: "🏢",
    //     title: "综合能源管理平台",
    //     description:
    //         "通过RS-485串行总线或以太网口对接各类不同规约的串口设备，完成数据采集与汇总，上传至本地监控系统和智慧能源云平台",
    // },
    // {
    //     icon: "⚡",
    //     title: "配电监控系统",
    //     description:
    //         "采集母联柜、进线柜等设备层的运行数据，经计算处理与存储后，传送至本地监控系统，同时上传至云平台，为电力运维提供数据支撑",
    // },
    // {
    //     icon: "💰",
    //     title: "综合在线计量收费系统",
    //     description:
    //         "部署于建筑楼宇各区域及楼层配电房，对楼层分户计量电表实施集中化数据采集与汇总，通过以太网或4G无线方式上传至本地监控系统",
    // },
    {
        icon: "☀️",
        title: "光伏四可应用",
        description:
            "充分发挥核心适配作用，搭载AGC与AVC功能，精准调控光伏系统的发电功率与输出电压，保障光伏电站发电状态稳定且符合并网标准",
    },
]);

// 主要功能数据
const functions = ref([
    {
        icon: "⚡",
        title: "光伏四可专属调控",
        description:
            "支持 AGC/AVC 功率精准调节，兼容电网 101/104 调度协议，实现光伏可观、可测、可调、可控全流程管理",
    },
    {
        icon: "🔗",
        title: "多设备多协议接入",
        description:
            "支持 3 路 RS485、1路RS232、2DO+2DI、以太网，兼容 Modbus、IEC104 等协议，可定制开发，适配光伏逆变器、断路器装置等核心设备",
    },
    {
        icon: "🔒",
        title: "高级安全加密机制",
        description:
            "支持 MD5 身份认证，128 位 AES 及 DES、3DES 等加密算法，搭配 VPN 加密隧道，保障光伏数据传输与存储安全",
    },
    {
        icon: "📡",
        title: "多模稳定通信",
        description:
            "4G/WiFi/以太网多模式，数据断点续传，适配光伏场站网络环境，确保发电数据无丢失",
    },
    {
        icon: "🔧",
        title: "宽温便捷安装",
        description:
            "154mm×40mm×90mm 导轨式设计，-25℃~+70℃宽温稳定运行，适配光伏配电室等安装场景",
    },
    {
        icon: "🔄",
        title: "远程配置功能",
        description:
            "支持远程配置、调试和升级，通过云端部署的远程配置服务器实现设备远程管理与维护",
    },
]);

// AGC控制模式数据
const agcModes = ref([
    {
        title: "无限制模式",
        description:
            "逆变器等设备的有功功率控制采用开环设计，终端仅对逆变器运行状态进行监测，不执行有功功率调节与控制操作。",
    },
    {
        title: "百分比模式",
        description:
            "终端针对逆变器实施有功功率调节，调节输出值以逆变器额定有功功率的百分比形式呈现。",
    },
    {
        title: "有功功率模式",
        description:
            "终端对逆变器开展有功功率调节，有功功率目标值将依据比例裕度分配至每一台逆变器，调节输出为具体数值。",
    },
    {
        title: "限功率模式",
        description:
            "终端对逆变器进行有功功率调节，核心适配自发自用防逆流应用场景，当运行参数达到预警区间时，将动态调节逆变器有功功率，防止向电网倒送电。",
    },
]);

// AVC控制模式数据
const avcModes = ref([
    {
        title: "无输出模式",
        description:
            "逆变器等设备的无功功率控制采用开环设计，终端仅对设备运行状态进行监测，不执行无功功率调节与控制操作。",
    },
    {
        title: "无功功率模式",
        description:
            "终端对逆变器实施无功功率精准调节，无功功率目标值将依据比例裕度分配至每一台逆变器，调节输出为具体数值。",
    },
    {
        title: "功率因数模式",
        description:
            "终端针对逆变器、SVG 等设备开展无功功率调节，确保并网点功率因数满足预设标准，针对性能状况及场况无功补偿不足导致的力调电费增加问题。",
    },
    {
        title: "电压模式",
        description:
            "终端对逆变器、SVG 等设备进行无功功率调节，核心用于规避并网点及台区电压越限风险，保障电网电压稳定。",
    },
]);

// 初始化动画
const initAnimations = () => {
    // 英雄区域动画
    gsap.timeline()
        .fromTo(heroSection.value, { opacity: 0 }, { opacity: 1, duration: 1 })
        .fromTo(
            ".hero-title .title-main",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
            "-=0.5"
        )
        .fromTo(
            ".hero-title .title-sub",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
            "-=0.3"
        )
        .fromTo(
            heroDescription.value,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
            "-=0.2"
        )
        .fromTo(
            heroHighlight.value,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
            "-=0.4"
        )
        .fromTo(
            imageContainer.value,
            { scale: 0.8, opacity: 0, rotationY: 15 },
            {
                scale: 1,
                opacity: 1,
                rotationY: 0,
                duration: 1,
                ease: "back.out(1.7)",
            },
            "-=0.6"
        );

    //统计数据动画;
    gsap.fromTo(
        statValues.value,
        { textContent: 0 },
        {
            textContent: (i) => {
                console.log(i);
                if (i === 2) return "2";
                if (i === 3) return "12V";
                return stats.value[i].value;
            },
            duration: 2,
            ease: "power2.out",
            snap: { textContent: 1 },
            stagger: 0.3,
        }
    );

    // 核心优势卡片动画
    advantageCards.value.forEach((card, index) => {
        gsap.fromTo(
            card,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    });

    // 产品选型表格动画
    gsap.fromTo(
        selectionTable.value,
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: selectionTable.value,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            },
        }
    );

    // 关键特性动画
    featureItems.value.forEach((item, index) => {
        gsap.fromTo(
            item,
            { x: -50, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    });

    // 技术指标卡片动画
    specCards.value.forEach((card, index) => {
        gsap.fromTo(
            card,
            { y: 50, opacity: 0, scale: 0.8 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                delay: index * 0.1,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    });

    // 应用场景卡片动画
    applicationCards.value.forEach((card, index) => {
        gsap.fromTo(
            card,
            { y: 50, opacity: 0, rotationY: 10 },
            {
                y: 0,
                opacity: 1,
                rotationY: 0,
                duration: 0.8,
                delay: index * 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    });

    // 功能卡片动画
    functionCards.value.forEach((card, index) => {
        gsap.fromTo(
            card,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                delay: index * 0.1,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse",
                },
            }
        );
    });

    // CTA区域动画
    gsap.fromTo(
        ctaSection.value,
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ctaSection.value,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            },
        }
    );
};

// 页面加载后初始化动画
onMounted(() => {
    // 确保DOM完全加载后再初始化动画
    setTimeout(() => {
        initAnimations();
    }, 100);
});

// 组件卸载时清理ScrollTrigger
onUnmounted(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
});

// 控制弹窗显示的状态
const showContactModal = ref(false);

// 打开弹窗
const openContactModal = () => {
    showContactModal.value = true;
    // 使用GSAP添加弹窗动画
    if (typeof gsap !== "undefined") {
        gsap.fromTo(
            ".contact-modal",
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
};

// 关闭弹窗
const closeModal = () => {
    if (typeof gsap !== "undefined") {
        gsap.to(".contact-modal", {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                showContactModal.value = false;
            },
        });
    } else {
        showContactModal.value = false;
    }
};

// 复制联系方式
const copyContact = () => {
    const contactInfo = "李经理 15919159383（微信同号）";
    navigator.clipboard
        .writeText(contactInfo)
        .then(() => {
            // 可以添加复制成功的提示
            alert("联系方式已复制到剪贴板");
        })
        .catch((err) => {
            console.error("复制失败:", err);
        });
};
</script>

<style lang="scss" scoped>
// 定义颜色变量
$primary-color: #0066cc;
$secondary-color: #00aaff;
$accent-color: #ff6b00;
$dark-color: #0f172a;
$light-color: #f8fafc;
$text-color: #1e293b;
$text-light: #64748b;

// 定义动画
@keyframes float {
    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-20px) rotate(5deg);
    }
}

@keyframes glow {
    0%,
    100% {
        box-shadow: 0 0 5px rgba($secondary-color, 0.5),
            0 0 10px rgba($secondary-color, 0.3);
    }
    50% {
        box-shadow: 0 0 20px rgba($secondary-color, 0.8),
            0 0 30px rgba($secondary-color, 0.5);
    }
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

@keyframes particleFloat {
    0%,
    100% {
        transform: translateY(0) translateX(0);
    }
    25% {
        transform: translateY(-20px) translateX(10px);
    }
    50% {
        transform: translateY(-10px) translateX(-10px);
    }
    75% {
        transform: translateY(10px) translateX(5px);
    }
}

// 基础样式
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: "Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: $text-color;
    overflow-x: hidden;
    background: $light-color;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

// 通用部分样式
.section-header {
    text-align: center;
    margin-bottom: 60px;
}

.section-title {
    font-size: 2.8rem;
    font-weight: 800;
    margin-bottom: 15px;
    background: linear-gradient(
        135deg,
        $primary-color,
        $secondary-color,
        $accent-color
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradient 5s ease infinite;
    background-size: 200% 200%;
    letter-spacing: -0.02em;
}

.section-subtitle {
    font-size: 1.3rem;
    color: $text-light;
    max-width: 600px;
    margin: 0 auto;
    font-weight: 400;
}

// 顶部横幅部分
.hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: linear-gradient(135deg, $dark-color 0%, #1e293b 100%);
    color: white;

    .hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        .floating-particle {
            position: absolute;
            background: rgba($secondary-color, 0.1);
            border-radius: 50%;
            animation: particleFloat 15s ease-in-out infinite;

            &:nth-child(odd) {
                background: rgba($accent-color, 0.1);
            }
        }
    }

    .hero-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 60px;
        position: relative;
        z-index: 2;

        @media (max-width: 968px) {
            flex-direction: column;
            text-align: center;
        }
    }

    .hero-text {
        flex: 1;
        max-width: 600px;

        .hero-title {
            margin-bottom: 30px;

            .title-main {
                display: block;
                font-size: 4rem;
                font-weight: 900;
                background: linear-gradient(
                    135deg,
                    #fff,
                    $secondary-color,
                    $accent-color
                );
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                animation: gradient 5s ease infinite;
                background-size: 200% 200%;
                line-height: 1.1;
                letter-spacing: -0.03em;
            }

            .title-sub {
                display: block;
                font-size: 2rem;
                font-weight: 400;
                margin-top: 10px;
                color: rgba(255, 255, 255, 0.8);
                letter-spacing: 0.02em;
            }
        }

        .hero-description {
            font-size: 1.3rem;
            line-height: 1.7;
            margin-bottom: 25px;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 300;
        }

        .hero-highlight {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 25px;
            border-left: 4px solid $accent-color;
            margin-bottom: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);

            p {
                margin: 0;
                color: rgba(255, 255, 255, 0.8);
                font-size: 1.1rem;
                line-height: 1.6;
            }
        }

        .hero-stats {
            display: flex;
            gap: 30px;

            @media (max-width: 768px) {
                flex-wrap: wrap;
                justify-content: center;
            }

            .stat-item {
                text-align: center;

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: $secondary-color;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            }
        }
    }

    .hero-image {
        flex: 1;
        display: flex;
        justify-content: center;

        .image-container {
            position: relative;
            max-width: 500px;

            img {
                width: 100%;
                height: auto;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
                transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
                transition: transform 0.5s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);

                &:hover {
                    transform: perspective(1000px) rotateY(0) rotateX(0);
                }
            }

            .image-glow {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 20px;
                background: linear-gradient(
                    45deg,
                    transparent,
                    rgba($secondary-color, 0.2),
                    transparent
                );
                animation: glow 4s ease-in-out infinite;
                z-index: -1;
            }
        }
    }

    .scroll-indicator {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);

        .scroll-arrow {
            width: 30px;
            height: 50px;
            border: 2px solid rgba(255, 255, 255, 0.5);
            border-radius: 15px;
            position: relative;

            &::before {
                content: "";
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 10px;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 2px;
                animation: scroll 2s infinite;
            }
        }
    }
}

@keyframes scroll {
    0% {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    100% {
        transform: translateX(-50%) translateY(15px);
        opacity: 0;
    }
}

// 核心优势部分
.advantages-section {
    padding: 120px 0;
    background: $light-color;

    .advantages-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
        gap: 30px;
    }

    .advantage-card {
        background: white;
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
            position: relative;
            width: 90px;
            height: 90px;
            margin: 0 auto 25px;

            .icon-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    135deg,
                    $primary-color,
                    $secondary-color
                );
                border-radius: 50%;
                animation: float 5s ease-in-out infinite;
            }

            .icon-text {
                position: relative;
                z-index: 2;
                font-size: 2.5rem;
                line-height: 90px;
            }
        }

        .card-title {
            font-size: 1.6rem;
            margin-bottom: 15px;
            color: $dark-color;
            font-weight: 700;
        }

        .card-description {
            color: $text-light;
            line-height: 1.6;
            font-size: 1.05rem;
        }
    }
}

// 产品选型部分
.selection-section {
    padding: 120px 0;
    background: white;

    .selection-content {
        display: flex;
        justify-content: center;
    }

    .selection-table {
        width: 100%;
        max-width: 900px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(0, 0, 0, 0.05);

        .table-header {
            display: flex;
            background: linear-gradient(
                135deg,
                $primary-color,
                $secondary-color
            );
            color: white;
            font-weight: 600;

            .table-cell {
                flex: 1;
                padding: 20px;
                text-align: center;
                font-size: 1.1rem;
            }
        }

        .table-row {
            display: flex;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);

            &:last-child {
                border-bottom: none;
            }

            &:nth-child(even) {
                background: rgba($light-color, 0.5);
            }

            .table-cell {
                flex: 1;
                padding: 18px 20px;
                text-align: center;

                &:first-child {
                    font-weight: 600;
                    color: $primary-color;
                }
            }
        }
    }
}

// 关键特性部分
.features-section {
    padding: 120px 0;
    background: $light-color;

    .features-content {
        display: flex;
        align-items: center;
        gap: 80px;

        @media (max-width: 968px) {
            flex-direction: column;
        }
    }

    .features-image {
        flex: 1;
        position: relative;

        .image-container {
            position: relative;

            img {
                width: 100%;
                height: auto;
                border-radius: 16px;
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(0, 0, 0, 0.05);
            }

            .floating-elements {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;

                .floating-element {
                    position: absolute;
                    background: white;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba($primary-color, 0.2);
                    border-radius: 30px;
                    padding: 10px 18px;
                    font-size: 0.9rem;
                    color: $primary-color;
                    font-weight: 600;
                    animation: float 5s ease-in-out infinite;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

                    &:nth-child(1) {
                        top: 10%;
                        left: 10%;
                    }
                    &:nth-child(2) {
                        top: 30%;
                        right: 10%;
                    }
                    &:nth-child(3) {
                        bottom: 40%;
                        left: 5%;
                    }
                    &:nth-child(4) {
                        bottom: 20%;
                        right: 15%;
                    }
                    &:nth-child(5) {
                        bottom: 10%;
                        left: 30%;
                    }
                }
            }
        }
    }

    .features-list {
        flex: 1;

        .feature-item {
            display: flex;
            margin-bottom: 35px;

            .feature-icon {
                flex-shrink: 0;
                width: 60px;
                height: 60px;
                background: linear-gradient(
                    135deg,
                    $primary-color,
                    $secondary-color
                );
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 25px;

                .icon {
                    color: white;
                    font-weight: bold;
                    font-size: 1.5rem;
                }
            }

            .feature-content {
                flex: 1;

                .feature-title {
                    font-size: 1.4rem;
                    margin-bottom: 12px;
                    color: $dark-color;
                    font-weight: 700;
                }

                .feature-description {
                    color: $text-light;
                    line-height: 1.7;
                    font-size: 1.05rem;
                }
            }
        }
    }
}

// 技术指标部分
.specs-section {
    padding: 120px 0;
    background: white;

    .specs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }

    .spec-card {
        background: white;
        border-radius: 16px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .spec-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(
                135deg,
                rgba($primary-color, 0.1),
                rgba($secondary-color, 0.1)
            );
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;

            .icon {
                font-size: 2rem;
                color: $primary-color;
            }
        }

        .spec-title {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: $dark-color;
            font-weight: 600;
        }

        .spec-value {
            color: $text-light;
            font-size: 1.1rem;
            line-height: 1.6;
        }
    }
}

// 应用场景部分
.applications-section {
    padding: 120px 0;
    background: $light-color;

    .applications-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }

    .application-card {
        background: white;
        border-radius: 20px;
        padding: 40px 30px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &:hover {
            transform: translateY(-10px) rotateY(5deg);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .application-icon {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 25px;

            .icon-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, $accent-color, #ff9d00);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }

            .icon-text {
                position: relative;
                z-index: 2;
                font-size: 2.8rem;
                line-height: 100px;
            }
        }

        .application-title {
            font-size: 1.6rem;
            margin-bottom: 20px;
            color: $dark-color;
            font-weight: 700;
        }

        .application-description {
            color: $text-light;
            line-height: 1.7;
            font-size: 1.05rem;
        }
    }
}

// 主要功能部分
.functions-section {
    padding: 120px 0;
    background: white;

    .functions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 30px;
    }

    .function-card {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.05);

        &:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            padding: 30px 30px 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;

            .function-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(
                    135deg,
                    $primary-color,
                    $secondary-color
                );
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 20px;

                .icon {
                    color: white;
                    font-size: 1.5rem;
                }
            }

            .function-title {
                font-size: 1.4rem;
                color: $dark-color;
                margin: 0;
                font-weight: 700;
            }
        }

        .card-content {
            padding: 25px 30px 30px;

            .function-description {
                color: $text-light;
                line-height: 1.7;
                margin: 0;
                font-size: 1.05rem;
            }
        }
    }
}

// AGC/AVC策略控制部分
.strategy-section {
    padding: 120px 0;
    background: $light-color;

    .strategy-content {
        max-width: 900px;
        margin: 0 auto;
    }

    .strategy-tabs {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        border: 1px solid rgba(0, 0, 0, 0.05);

        .tab-header {
            display: flex;
            background: linear-gradient(
                135deg,
                $primary-color,
                $secondary-color
            );

            .tab-button {
                flex: 1;
                padding: 20px;
                background: none;
                border: none;
                color: white;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s ease;

                &.active {
                    background: rgba(255, 255, 255, 0.2);
                }

                &:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.1);
                }
            }
        }

        .tab-content {
            padding: 40px;

            .strategy-item {
                margin-bottom: 25px;

                &:last-child {
                    margin-bottom: 0;
                }

                .strategy-title {
                    font-size: 1.3rem;
                    margin-bottom: 10px;
                    color: $primary-color;
                    font-weight: 600;
                }

                .strategy-description {
                    color: $text-light;
                    line-height: 1.7;
                    font-size: 1.05rem;
                }
            }
        }
    }
}

// CTA部分
.cta-section {
    padding: 120px 0;
    background: linear-gradient(135deg, $dark-color 0%, #1e293b 100%);
    color: white;
    text-align: center;

    .cta-content {
        max-width: 700px;
        margin: 0 auto;

        .cta-title {
            font-size: 2.8rem;
            margin-bottom: 20px;
            background: linear-gradient(
                135deg,
                #fff,
                $secondary-color,
                $accent-color
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: gradient 5s ease infinite;
            background-size: 200% 200%;
            font-weight: 800;
            letter-spacing: -0.02em;
        }

        .cta-description {
            font-size: 1.3rem;
            margin-bottom: 40px;
            color: rgba(255, 255, 255, 0.8);
            font-weight: 300;
        }

        .cta-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;

            @media (max-width: 480px) {
                flex-direction: column;
                align-items: center;
            }

            .btn {
                padding: 16px 32px;
                border: none;
                border-radius: 50px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;

                &.btn-primary {
                    background: linear-gradient(
                        135deg,
                        $primary-color,
                        $secondary-color
                    );
                    color: white;

                    &:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0, 102, 204, 0.4);
                    }
                }

                &.btn-secondary {
                    background: transparent;
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.3);

                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                        border-color: rgba(255, 255, 255, 0.5);
                        transform: translateY(-5px);
                    }
                }
            }
        }
    }
}

// 响应式调整
@media (max-width: 968px) {
    .hero-section .hero-title .title-main {
        font-size: 3rem;
    }

    .section-title {
        font-size: 2.3rem;
    }

    .features-content {
        flex-direction: column;
    }

    .hero-stats {
        flex-wrap: wrap;
    }
}

@media (max-width: 768px) {
    .hero-section .hero-title .title-main {
        font-size: 2.5rem;
    }

    .section-title {
        font-size: 2rem;
    }

    .hero-content {
        flex-direction: column;
        text-align: center;
    }

    .selection-table .table-header,
    .selection-table .table-row {
        flex-direction: column;
    }

    .tab-header {
        flex-direction: column;
    }
}
// 弹窗样式
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.contact-modal {
    background: white;
    border-radius: 24px;
    padding: 40px;
    max-width: 480px;
    width: 90%;
    position: relative;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.05);

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.05);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #64748b;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.1);
            color: #1e293b;
            transform: rotate(90deg);
        }
    }

    .modal-content {
        text-align: center;

        .modal-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #0066cc, #00aaff);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 30px;
            svg {
                width: 40px;
                height: 40px;
            }
        }

        .modal-title {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #0066cc, #00aaff);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.02em;
        }

        .modal-description {
            color: #64748b;
            font-size: 1.1rem;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .contact-info {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid rgba(0, 0, 0, 0.05);

            .contact-item {
                display: flex;
                align-items: center;
                gap: 15px;

                .contact-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #0066cc, #00aaff);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    font-size: 20px;
                    svg {
                        width: 24px;
                        height: 24px;
                    }
                }

                .contact-details {
                    text-align: left;

                    .contact-name {
                        font-size: 1.3rem;
                        font-weight: 700;
                        color: #1e293b;
                        margin-bottom: 5px;
                    }

                    .contact-phone {
                        font-size: 1.5rem;
                        font-weight: 800;
                        color: #0066cc;
                        margin-bottom: 5px;
                        letter-spacing: 0.02em;
                    }

                    .contact-note {
                        color: #64748b;
                        font-size: 0.95rem;
                    }
                }
            }
        }

        .modal-actions {
            display: flex;
            gap: 15px;

            @media (max-width: 480px) {
                flex-direction: column;
            }

            .action-btn {
                flex: 1;
                padding: 15px 25px;
                border: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;

                &.primary {
                    background: linear-gradient(135deg, #0066cc, #00aaff);
                    color: white;

                    &:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 20px rgba(0, 102, 204, 0.3);
                    }
                }

                &.secondary {
                    background: transparent;
                    color: #64748b;
                    border: 2px solid #e2e8f0;

                    &:hover {
                        background: #f8fafc;
                        border-color: #cbd5e1;
                        transform: translateY(-3px);
                    }
                }
            }
        }
    }
}

// 弹窗动画
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

// 响应式调整
@media (max-width: 480px) {
    .contact-modal {
        padding: 30px 20px;

        .modal-content {
            .modal-title {
                font-size: 1.7rem;
            }

            .contact-info {
                padding: 20px;

                .contact-item {
                    flex-direction: column;
                    text-align: center;

                    .contact-details {
                        text-align: center;
                    }
                }
            }
        }
    }
}
</style>
