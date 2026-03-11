<template>
    <div class="virtual-power-plant-page">
        <!-- 动画背景 -->
        <AnimatedBackground />

        <!-- 页面主体内容 -->
        <div class="page-container">
            <!-- 价值总览部分 -->
            <ValueOverview ref="valueOverview" />

            <!-- 赚钱原理部分 -->
            <ProfitPrinciple ref="profitPrinciple" />

            <!-- 收益展示部分 -->
            <!-- <CaseStudies ref="caseStudies" /> -->

            <!-- 如何开始部分 -->
            <GettingStarted ref="gettingStarted" @open-contact-modal="openContactModal" />

            <!-- 为什么选择我们部分 -->
            <WhyChooseUs ref="whyChooseUs" />

            <!-- 常见问题部分 -->
            <FAQSection ref="faqSection" @open-contact-modal="openContactModal" />

            <!-- 底部行动号召 -->
            <!-- <div class="cta-section" ref="ctaSection">
                <div class="container">
                    <h2 class="gradient-text animated-title">
                        立即开启您的自动赚钱模式
                    </h2>
                    <p class="cta-subtitle">
                        已有超过500家企业加入派诺虚拟电厂，年收益平均提升35%
                    </p>
                    <div class="cta-buttons">
                        <button
                            class="btn btn-primary btn-glow"
                            @click="openContactModal('all')"
                        >
                            免费资源评估
                            <i class="bi bi-arrow-right"></i>
                        </button>
                        <button class="btn btn-outline" @click="scrollToCases">
                            查看成功案例
                            <i class="bi bi-graph-up"></i>
                        </button>
                    </div>
                </div>
            </div> -->
        </div>
        
        <!-- 联系弹窗 -->
        <ContactModal v-model="contactModalVisible" title="联系我们" :mode="contactModalMode" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedBackground from "./components/AnimatedBackground.vue";
import ValueOverview from "./components/ValueOverview.vue";
import ProfitPrinciple from "./components/ProfitPrinciple.vue";
import CaseStudies from "./components/CaseStudies.vue";
import WhyChooseUs from "./components/WhyChooseUs.vue";
import GettingStarted from "./components/GettingStarted.vue";
import FAQSection from "./components/FAQSection.vue";
import ContactModal from "./components/ContactModal.vue";

gsap.registerPlugin(ScrollTrigger);

// 获取组件引用
const valueOverview = ref(null);
const profitPrinciple = ref(null);
const caseStudies = ref(null);
const gettingStarted = ref(null);
const whyChooseUs = ref(null);
const faqSection = ref(null);
const ctaSection = ref(null);

// 联系弹窗控制
const contactModalVisible = ref(false);
const contactModalMode = ref('all');

// 页面加载时的动画
onMounted(() => {
    // 初始加载动画
    const tl = gsap.timeline();

    tl.from(".virtual-power-plant-page", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
    });

    // 创建滚动触发动画
    setupScrollAnimations();
});

// 设置滚动触发动画
const setupScrollAnimations = () => {
    // 为每个主要部分添加滚动动画
    const sections = [
        valueOverview,
        profitPrinciple,
        caseStudies,
        gettingStarted,
        whyChooseUs,
        faqSection,
        // ctaSection,
    ];

    sections.forEach((sectionRef, index) => {
        if (sectionRef.value && sectionRef.value.$el) {
            gsap.from(sectionRef.value.$el, {
                scrollTrigger: {
                    trigger: sectionRef.value.$el,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                },
                y: 50,
                opacity: 0,
                duration: 1,
                delay: index * 0.1,
            });
        }
    });
};

// 滚动到案例部分
const scrollToCases = () => {
    if (caseStudies.value && caseStudies.value.$el) {
        caseStudies.value.$el.scrollIntoView({ behavior: "smooth" });
    }
};

// 打开联系弹窗
const openContactModal = (mode = 'all') => {
    contactModalMode.value = mode;
    contactModalVisible.value = true;
};

// 滚动到联系表单（保留原函数用于兼容性）
const scrollToContact = () => {
    contactModalVisible.value = true;
};
</script>

<style>
:root {
  --bg-page: #f9fafc;           /* 页面主背景 */
  --bg-card: #ffffff;           /* 卡片背景 */
  --bg-card-soft: #f5f7ff;      /* 柔和卡片背景 */
  --bg-gradient-start: #eef2ff;  /* 渐变起始 */
  --bg-gradient-end: #ffffff;    /* 渐变结束 */
  --text-primary: #1a2b4c;       /* 主要文字（深蓝灰） */
  --text-secondary: #5a6b8c;     /* 次要文字 */
  --text-light: #8a9bb0;         /* 辅助文字 */
  --accent-blue: #3b82f6;        /* 蓝色 */
  --accent-cyan: #06b6d4;        /* 青色 */
  --accent-purple: #8b5cf6;      /* 紫色 */
  --accent-pink: #ec4899;        /* 粉色 */
  --accent-orange: #f97316;      /* 橙色 */
  --border-light: #e9eef2;       /* 边框 */
  --shadow: 0 20px 40px -15px rgba(0, 20, 50, 0.15);
}
</style>
<style scoped>
.virtual-power-plant-page {
    position: relative;
    overflow-x: hidden;
    background: #ffffff;
    color: #1e293b;
    min-height: 100vh;
}

.page-container {
    position: relative;
    z-index: 10;
}

.cta-section {
    padding: 100px 20px;
    text-align: center;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    margin-top: 60px;
}

.cta-subtitle {
    font-size: 1.2rem;
    color: #475569;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.cta-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 15px 30px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
    color: white;
}

.btn-outline {
    background: transparent;
    color: #0072ff;
    border: 2px solid #0072ff;
}

.btn-outline:hover {
    background: rgba(0, 114, 255, 0.05);
}

.btn-glow {
    box-shadow: 0 0 20px rgba(0, 114, 255, 0.5);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 20px rgba(0, 114, 255, 0.5);
    }
    50% {
        box-shadow: 0 0 30px rgba(0, 114, 255, 0.8);
    }
    100% {
        box-shadow: 0 0 20px rgba(0, 114, 255, 0.5);
    }
}

@media (max-width: 768px) {
    .cta-section {
        padding: 60px 20px;
    }

    .cta-buttons {
        flex-direction: column;
        align-items: center;
    }

    .btn {
        width: 100%;
        max-width: 300px;
        justify-content: center;
    }
}
</style>
