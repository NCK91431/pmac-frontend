<template>
    <div class="bmu-product-detail">
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
                            <span class="title-main">BMU-AB-M001</span>
                            <span class="title-sub">电池系统"采集战士"</span>
                        </h1>
                        <p class="hero-description" ref="heroDescription">
                            进行单体电池电压、单体温度、极柱温度采集，<strong>主动均衡功能</strong>，并对电池包进行单包故障诊断，同时具备自动地址编码和热管理能力。
                        </p>
                        <div class="hero-highlight" ref="heroHighlight">
                            <p>
                                适用于以磷酸铁锂、钛酸锂等材料作为介质的电池系统，通过CAN通信与主控单元（BCU）进行通讯，实现高效的电池包采集和管理。
                            </p>
                        </div>
                        <div class="hero-stats">
                            <div
                                class="stat-item"
                                v-for="(stat, index) in stats"
                                :key="index"
                            >
                                <div class="stat-value" ref="statValues">
                                    <span class="stat-number" ref="statNumbers"
                                        >0</span
                                    >
                                    <span class="stat-unit">{{
                                        stat.unit
                                    }}</span>
                                </div>
                                <div class="stat-label">{{ stat.label }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="hero-image">
                        <div class="image-container" ref="imageContainer">
                            <img
                                src="https://pmac.leyi.host/downloads/pmac/products/BMU.png"
                                alt="BMU-AB-M001 电池系统采集战士"
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
                        专为电池系统采集设计的智能管理核心
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

        <!-- 产品详情部分 -->
        <section class="details-section" ref="detailsSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">探索产品详情</h2>
                    <p class="section-subtitle">电池管理系统从控模块</p>
                </div>
                <div class="details-content">
                    <div class="details-text">
                        <h3>型号：EES-LIB-M-0005V-AB-052-056-M001</h3>
                        <p>
                            一款电池管理系统从控模块，是电池系统的"采集战士"，是电池包的采集和管理核心，并可通过CAN通信与主控单元（BCU）进行通讯。该从控模块适用于以磷酸铁锂、钛酸锂等材料作为介质的电池系统。
                        </p>
                        <p>
                            支持单体电池电压、单体温度、极柱温度采集，具备主动均衡功能和自动地址编码能力，为电池系统提供全面的监测和管理。
                        </p>
                    </div>
                    <div class="details-image">
                        <div class="image-container">
                            <img
                                src="https://pmac.leyi.host/downloads/pmac/products/BMU.png"
                                alt="BMU-AB-M001 产品详情"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>

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
                                src="https://pmac.leyi.host/downloads/pmac/products/BMU.png"
                                alt="BMU-AB-M001 特性展示"
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
                                <span class="icon">⚡</span>
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

        <!-- 详细参数部分 -->
        <section class="specs-section" ref="specsSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">详细参数</h2>
                    <p class="section-subtitle">专业级硬件配置与性能参数</p>
                </div>
                <div class="specs-content">
                    <div class="specs-table" ref="specsTable">
                        <div class="table-header">
                            <div class="table-cell">技术参数</div>
                            <div class="table-cell">额定规格</div>
                            <div class="table-cell">备注</div>
                        </div>
                        <div
                            class="table-row"
                            v-for="(spec, index) in specifications"
                            :key="index"
                            :ref="
                                (el) => {
                                    if (el) tableRows[index] = el;
                                }
                            "
                        >
                            <div class="table-cell">{{ spec.parameter }}</div>
                            <div class="table-cell">
                                {{ spec.specification }}
                            </div>
                            <div class="table-cell">{{ spec.remark }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 底部CTA部分 -->
        <section class="cta-section" ref="ctaSection">
            <div class="container">
                <div class="cta-content">
                    <h2 class="cta-title">开启智能电池采集新时代</h2>
                    <p class="cta-description">
                        BMU-AB-M001电池管理系统从控模块，为您的电池系统提供全方位的智能化采集解决方案
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
                                href="#"
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
                                <div class="contact-name">徐博士</div>
                                <div class="contact-phone">18679510800</div>
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
const detailsSection = ref(null);
const featuresSection = ref(null);
const featureItems = ref([]);
const specsSection = ref(null);
const ctaSection = ref(null);

//表格
const specsTable = ref(null);
const tableRows = ref([]);
const specifications = ref([
    {
        parameter: "供电电压采集范围",
        specification: "10~40V",
        remark: "≤士1V",
    },
    {
        parameter: "电池监测节数及范围",
        specification: "52节，0~5V",
        remark: "可向下兼容至32串",
    },
    {
        parameter: "电压检测精度",
        specification: "≤5mV",
        remark: "-20°C-65°C",
    },
    {
        parameter: "温度监测个数及范围",
        specification: "561, -40°C-125°C",
        remark: "单体温度+极柱温度",
    },
    {
        parameter: "温度检测精度",
        specification: "+ 1°C(-40~85°C) #2°C(85~125°C)",
        remark: "分辦率：0.1°C",
    },
    {
        parameter: "双向主动均衡",
        specification: "2A（典型值）",
        remark: "",
    },
    {
        parameter: "通讯方式",
        specification: "CAN/250Kbps（默认）",
        remark: "1路",
    },
    {
        parameter: "双向1〇口",
        specification: "2路",
        remark: "自动地址编码",
    },
    {
        parameter: "DO/DI",
        specification: "2路高边DO/1路DI",
        remark: "支持外围扩展",
    },
    {
        parameter: "尺寸",
        specification: "320*125*25mm",
        remark: "",
    },
    {
        parameter: "安装方式",
        specification: "壁挂",
        remark: "",
    },
]);

// 粒子背景数据
const particles = ref(
    Array.from({ length: 15 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 10 + 5,
        delay: Math.random() * 5,
    })),
);

// 统计数据
const stats = ref([
    { value: 52, unit: "节", label: "电池监测" },
    { value: 2, unit: "路", label: "双向I〇口" },
    { value: 2, unit: "A", label: "双向主动均衡" },
    { value: 56, unit: "个", label: "温度监测" },
]);

// 核心优势数据
const advantages = ref([
    {
        icon: "🔄",
        title: "双向DCDC主动均衡",
        description: "实现电池簇任意单体电芯之间能量高效转移",
    },
    {
        icon: "⚡",
        title: "创新均衡开关阵列",
        description: "提升性能并兼顾成本，提高均衡效率",
    },
    {
        icon: "🎯",
        title: "恒定均衡电流",
        description: "精确SOC补偿，提升电路工作稳定性，反馈电路精度高",
    },
    {
        icon: "🛡️",
        title: "主动冗余保护功能",
        description: "软硬件结合保护，提升均衡安全性",
    },
]);

// 浮动元素数据
const floatingElements = ref([
    { text: "电压采集" },
    { text: "温度采集" },
    { text: "主动均衡" },
    { text: "故障诊断" },
    { text: "热管理" },
]);

// 关键特性数据
const features = ref([
    {
        title: "多维度协同控制算法",
        description: "双变量耦合算法，全生命能量优化管理，高效均衡效率",
    },
    {
        title: "高兼容性",
        description: "灵活配置，多通讯协议兼容，适用于多种电池材料",
    },
    {
        title: "高效应用性设计",
        description: "自动地址编码、单包小系统、远程升级、远程参数配置",
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
            "-=0.5",
        )
        .fromTo(
            ".hero-title .title-sub",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
            "-=0.3",
        )
        .fromTo(
            heroDescription.value,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
            "-=0.2",
        )
        .fromTo(
            heroHighlight.value,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
            "-=0.4",
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
            "-=0.6",
        );

    //统计数据动画

    statValues.value.forEach((el, index) => {
        const targetValues = [52, 2, 2, 56];
        const units = ["节", "路", "A", "个"];
        const target = targetValues[index];

        gsap.fromTo(
            el,
            { innerText: 0 },
            {
                innerText: target,
                duration: 2,
                ease: "power2.out",
                snap: { innerText: 1 },
                delay: index * 0.3,
                onComplete: () => {
                    // 动画完成后确保显示完整值
                    el.textContent = target + units[index];
                },
            },
        );
    });

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
            },
        );
    });

    // 产品详情区域动画
    gsap.fromTo(
        detailsSection.value,
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: detailsSection.value,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            },
        },
    );

    //  产品详情表格
    gsap.fromTo(
        specsTable.value,
        { y: 50, opacity: 0, scale: 0.95 },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "back.out(1.2)",
            scrollTrigger: {
                trigger: specsTable.value,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            },
        },
    );
    // 表格行逐行动画
    tableRows.value.forEach((row, index) => {
        gsap.fromTo(
            row,
            {
                y: 30,
                opacity: 0,
                backgroundColor: "rgba(0, 204, 102, 0.1)",
            },
            {
                y: 0,
                opacity: 1,
                backgroundColor:
                    index % 2 === 0
                        ? "rgba(248, 250, 252, 0.5)"
                        : "rgba(255, 255, 255, 1)",
                duration: 0.6,
                delay: index * 0.05,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: row,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse",
                },
            },
        );
    });

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
            },
        );
    });

    // 详细参数区域动画
    gsap.fromTo(
        specsSection.value,
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: specsSection.value,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            },
        },
    );

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
        },
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
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
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
    const contactInfo = "徐博士 18679510800（微信同号）";
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
// 定义颜色变量 - 使用不同的主题色以示区别
$primary-color: #00cc66;
$secondary-color: #33dd88;
$accent-color: #ffaa00;
$dark-color: #0f2a1a;
$light-color: #f8fcf8;
$text-color: #1e3b2b;
$text-light: #64786b;

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
        box-shadow:
            0 0 5px rgba($secondary-color, 0.5),
            0 0 10px rgba($secondary-color, 0.3);
    }
    50% {
        box-shadow:
            0 0 20px rgba($secondary-color, 0.8),
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
    background: linear-gradient(135deg, $dark-color 0%, #1e3b2b 100%);
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
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
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

// 产品详情部分
.details-section {
    padding: 120px 0;
    background: white;

    .details-content {
        display: flex;
        align-items: center;
        gap: 60px;

        @media (max-width: 968px) {
            flex-direction: column;
        }
    }

    .details-text {
        flex: 1;

        h3 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: $primary-color;
            font-weight: 700;
        }

        p {
            font-size: 1.1rem;
            line-height: 1.7;
            margin-bottom: 20px;
            color: $text-light;
        }
    }

    .details-image {
        flex: 1;
        display: flex;
        justify-content: center;

        .image-container {
            position: relative;
            max-width: 500px;

            img {
                width: 100%;
                height: auto;
                border-radius: 16px;
                box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(0, 0, 0, 0.05);
                transition: transform 0.5s ease;

                &:hover {
                    transform: scale(1.05);
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

// 详细参数部分
.specs-section {
    padding: 120px 0;
    background: white;

    .specs-content {
        display: flex;
        justify-content: center;
    }

    .specs-table {
        width: 100%;
        max-width: 1000px;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.05);
        background: white;
        transform-origin: center top;

        .table-header {
            display: flex;
            background: linear-gradient(
                135deg,
                $primary-color,
                $secondary-color
            );
            color: white;
            font-weight: 700;
            font-size: 1.1rem;

            .table-cell {
                flex: 1;
                padding: 25px 20px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.05em;

                &:first-child {
                    flex: 1.2;
                }
                &:last-child {
                    flex: 0.8;
                }
            }
        }

        .table-row {
            display: flex;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            transform-origin: center;

            &:last-child {
                border-bottom: none;
            }

            &:nth-child(even) {
                background: rgba($light-color, 0.5);
            }

            &:hover {
                background: rgba($primary-color, 0.03);
                transform: translateX(10px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }

            .table-cell {
                flex: 1;
                padding: 20px;
                text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.05rem;
                line-height: 1.5;
                transition: all 0.3s ease;

                &:first-child {
                    flex: 1.2;
                    font-weight: 600;
                    color: $primary-color;
                    text-align: left;
                    justify-content: flex-start;
                }

                &:last-child {
                    flex: 0.8;
                    color: $text-light;
                    font-size: 0.95rem;
                }

                &:nth-child(2) {
                    font-weight: 500;
                    color: $dark-color;
                }
            }
        }
    }
}

// 响应式调整
@media (max-width: 768px) {
    .specs-section {
        .specs-table {
            .table-header,
            .table-row {
                flex-direction: column;

                .table-cell {
                    padding: 15px 20px;
                    text-align: left;
                    justify-content: flex-start;

                    &:first-child {
                        background: rgba($primary-color, 0.05);
                        font-weight: 700;
                    }
                }
            }

            .table-header {
                .table-cell {
                    justify-content: center;
                    text-align: center;
                }
            }
        }
    }
}

// CTA部分
.cta-section {
    padding: 120px 0;
    background: linear-gradient(135deg, $dark-color 0%, #1e3b2b 100%);
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
                        box-shadow: 0 10px 20px rgba(0, 204, 102, 0.4);
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

    .details-content {
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
    background: rgba(15, 42, 26, 0.7);
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
        color: #64786b;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.1);
            color: #1e3b2b;
            transform: rotate(90deg);
        }
    }

    .modal-content {
        text-align: center;

        .modal-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #00cc66, #33dd88);
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
            background: linear-gradient(135deg, #00cc66, #33dd88);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.02em;
        }

        .modal-description {
            color: #64786b;
            font-size: 1.1rem;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .contact-info {
            background: #f8fcf8;
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
                    background: linear-gradient(135deg, #00cc66, #33dd88);
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
                        color: #1e3b2b;
                        margin-bottom: 5px;
                    }

                    .contact-phone {
                        font-size: 1.5rem;
                        font-weight: 800;
                        color: #00cc66;
                        margin-bottom: 5px;
                        letter-spacing: 0.02em;
                    }

                    .contact-note {
                        color: #64786b;
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
                    background: linear-gradient(135deg, #00cc66, #33dd88);
                    color: white;

                    &:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 20px rgba(0, 204, 102, 0.3);
                    }
                }

                &.secondary {
                    background: transparent;
                    color: #64786b;
                    border: 2px solid #e2e8f0;

                    &:hover {
                        background: #f8fcf8;
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
