<!-- 赚钱原理组件 -->
<template>
    <section class="profit-principle section-padding">
        <div class="container">
            <!-- 部分标题 -->
            <div class="section-header text-center" ref="sectionHeader">
                <h2 class="section-title gradient-text">
                    赚钱原理：虚拟电厂如何为您创造价值
                </h2>
                <p class="section-subtitle">
                    智能算法自动决策，在最佳时机调控设备，最大化您的收益
                </p>
            </div>

            <!-- 原理图展示 -->
            <div class="principle-diagram" ref="principleDiagram">
                <div class="diagram-container">
                    <!-- 左侧：客户资源 -->
                    <div class="resource-side">
                        <h3 class="diagram-title">您的资源</h3>
                        <div class="resources-grid">
                            <div
                                v-for="resource in resources"
                                :key="resource.id"
                                class="resource-item"
                                :ref="(el) => (resourceItems[resource.id] = el)"
                            >
                                <div class="resource-icon">
                                    <i :class="resource.icon"></i>
                                </div>
                                <span class="resource-name">{{
                                    resource.name
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 中间：智能平台 -->
                    <div class="platform-center" ref="platformCenter">
                        <div class="platform-core">
                            <div class="brain-icon">
                                <i class="bi bi-cpu"></i>
                            </div>
                            <h4>派诺虚拟电厂平台</h4>
                            <p>AI算法自动决策</p>
                        </div>
                        <div class="connection-line left"></div>
                        <div class="connection-line right"></div>
                    </div>

                    <!-- 右侧：赚钱机会 -->
                    <div class="opportunity-side">
                        <h3 class="diagram-title">赚钱机会</h3>
                        <div class="opportunities-grid">
                            <div
                                v-for="opportunity in opportunities"
                                :key="opportunity.id"
                                class="opportunity-item"
                                :ref="
                                    (el) =>
                                        (opportunityItems[opportunity.id] = el)
                                "
                            >
                                <div class="opportunity-icon">
                                    <i :class="opportunity.icon"></i>
                                </div>
                                <span class="opportunity-name">{{
                                    opportunity.name
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 三大赚钱场景 -->
            <div class="profit-scenarios" ref="profitScenarios">
                <h3 class="scenarios-title text-center">三大赚钱场景</h3>
                <div class="scenarios-container">
                    <div
                        v-for="scenario in scenarios"
                        :key="scenario.id"
                        class="scenario-card"
                        :ref="(el) => (scenarioCards[scenario.id] = el)"
                    >
                        <div class="scenario-header">
                            <div class="scenario-icon">
                                <i :class="scenario.icon"></i>
                            </div>
                            <h4 class="scenario-name">{{ scenario.name }}</h4>
                        </div>
                        <p class="scenario-description">
                            {{ scenario.description }}
                        </p>
                        <div class="scenario-features">
                            <div
                                v-for="feature in scenario.features"
                                :key="feature"
                                class="feature-tag"
                            >
                                {{ feature }}
                            </div>
                        </div>
                        <div class="scenario-arrow">
                            <i class="bi bi-arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 客户资源数据
const resources = ref([
    { id: 1, name: "工厂", icon: "bi bi-building" },
    { id: 2, name: "商业楼宇", icon: "bi bi-building-fill" },
    { id: 3, name: "光伏设备", icon: "bi bi-sun" },
    { id: 4, name: "储能系统", icon: "bi bi-battery-charging" },
]);

// 赚钱机会数据
const opportunities = ref([
    { id: 1, name: "高价时段套利", icon: "bi bi-graph-up" },
    { id: 2, name: "需求响应补贴", icon: "bi bi-cash-coin" },
    { id: 3, name: "辅助服务费用", icon: "bi bi-tools" },
    { id: 4, name: "容量市场收益", icon: "bi bi-lightning-charge" },
]);

// 赚钱场景数据
const scenarios = ref([
    {
        id: 1,
        name: "算法驱动可调负荷变现",
        icon: "bi bi-lightning",
        description:
            "当电网有调节需求时，我们通过柔性调控您空调等可调负荷，助您直接获取高额响应收益。收益清晰透明、单次回报丰厚，是您无需额外投入即可获得的政策性现金收入。",
        features: [
            "高额响应收益",
            "收益清晰透明",
            "单次回报丰厚",
            "政策性现金收入",
        ],
    },
    {
        id: 2,
        name: "低储高放（现货套利）",
        icon: "bi bi-arrow-down-up",
        description:
            "智能算法作“资源管家”与“策略中枢”，自动制定差异化策略——储能与光伏实现“低储高放”的价差套利，可调负荷则通过“高峰减用”实现电费节约。通过资源的智能协同与优化调度规避资源内耗，最终达成“1+1>2”的整体收益，让您的资产持续增值。",
        features: ["价差套利", "智能协同", "避免内耗", "资产增值"],
    },
    {
        id: 3,
        name: "算法驱动售电套利",
        icon: "bi bi-cash-stack",
        description:
            "依托自研算法，实现对负荷与电价的精准预测，解决传统手工预测既耗时又不准的难题，为您锁定市场中的最佳套利机会，创造持续、稳定的售电额外收益。",
        features: ["精准预测", "持续收益", "稳定套利", "额外收益"],
    },
]);

// 引用
const sectionHeader = ref(null);
const principleDiagram = ref(null);
const platformCenter = ref(null);
const profitScenarios = ref(null);

const resourceItems = ref({});
const opportunityItems = ref({});
const scenarioCards = ref({});

// 创建原理图动画
const createDiagramAnimation = () => {
    // 平台中心脉动动画
    gsap.to(platformCenter.value, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
    });

    // 资源项动画
    Object.values(resourceItems.value).forEach((item, index) => {
        if (item) {
            gsap.from(item, {
                x: -50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: principleDiagram.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });

    // 机会项动画
    Object.values(opportunityItems.value).forEach((item, index) => {
        if (item) {
            gsap.from(item, {
                x: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: principleDiagram.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

// 创建场景卡片动画
const createScenariosAnimation = () => {
    Object.values(scenarioCards.value).forEach((card, index) => {
        if (card) {
            gsap.from(card, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: profitScenarios.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

onMounted(() => {
    // 标题动画
    gsap.from(sectionHeader.value, {
        y: 30,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: sectionHeader.value,
            start: "top 80%",
            end: "bottom 20%",
        },
    });

    // 创建其他动画
    createDiagramAnimation();
    createScenariosAnimation();
});
</script>

<style scoped>
.profit-principle {
	padding:80px 0;
    background: #ffffff;
    border-radius: 40px;
    margin: 40px 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.section-header {
    margin-bottom: 80px;
}

/* 标题高级样式 */
.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #0a1a2f;
    text-shadow: 0 4px 12px rgba(0, 100, 200, 0.15);
    position: relative;
    padding-bottom: 20px;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 4px;
    background: linear-gradient(90deg, #b3d9ff, #4d8cff, #b3a0ff);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 110, 255, 0.3);
}

.section-subtitle {
    font-size: 1.2rem;
    color: #2c3f55;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    font-weight: 400;
    letter-spacing: 0.3px;
    max-width: 600px;
    margin: 0 auto;
}

.principle-diagram {
    margin: 80px 0;
}

.diagram-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* 左右侧背景高级透明渐变 + 渐变边框 */
.resource-side,
.opportunity-side {
    flex: 1;
    padding: 40px;
    border-radius: 20px;
    border: 2px solid transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,250,255,0.9)) padding-box,
        linear-gradient(145deg, #c5dbff, #9ab5f0, #c2d4ff) border-box;
    box-shadow: 0 12px 28px -12px rgba(0, 70, 150, 0.2);
    backdrop-filter: blur(4px);
}

.diagram-title {
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 30px;
    color: #1e3a6f;
    font-weight: 600;
    letter-spacing: 0.5px;
    position: relative;
    display: inline-block;
    width: 100%;
}

.diagram-title::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #a0c4ff, #3f7eff);
    margin: 10px auto 0;
    border-radius: 3px;
}

.resources-grid,
.opportunities-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

/* 资源/机会卡片微调 */
.resource-item,
.opportunity-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(4px);
    border-radius: 15px;
    transition: all 0.3s ease;
    border: 1px solid rgba(200, 220, 250, 0.5);
    box-shadow: 0 6px 14px -8px rgba(0,60,130,0.2);
}

.resource-item:hover,
.opportunity-item:hover {
    transform: translateY(-5px);
    background: rgba(255,255,255,0.8);
    border-color: #a0c0ff;
    box-shadow: 0 15px 25px -12px rgba(0, 100, 200, 0.25);
}

/* 图标差异化 — 高级莫兰迪色系渐变 */
.resource-item .resource-icon {
    background: linear-gradient(145deg, #4db8b0, #1f8f87);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 10px;
    color: white;
    box-shadow: 0 8px 16px -8px #1f8f87;
}

.opportunity-item .opportunity-icon {
    background: linear-gradient(145deg, #f9b851, #f0851e);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 10px;
    color: white;
    box-shadow: 0 8px 16px -8px #e07c1f;
}

/* 名称样式优化 */
.resource-name,
.opportunity-name {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.4px;
    color: #162b42;
    text-shadow: 0 1px 4px rgba(255,255,255,0.5);
}

.platform-center {
    position: relative;
    z-index: 2;
    margin: 0 40px;
}

/* 平台核心卡片 — 同样使用渐变边框 */
.platform-core {
    padding: 30px;
    border-radius: 20px;
    border: 2px solid transparent;
    background: 
        linear-gradient(145deg, #ffffff, #f5fcff) padding-box,
        linear-gradient(145deg, #97bcff, #5580e0, #9bbaff) border-box;
    text-align: center;
    min-width: 200px;
    box-shadow: 0 0 40px rgba(0, 110, 255, 0.2);
}

/* 大脑图标特殊渐变色 */
.brain-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(145deg, #6a7cf0, #3f54c4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    margin: 0 auto 20px;
    color: white;
    box-shadow: 0 10px 20px -8px #2f44a0;
}

.platform-center h4 {
    font-size: 1.2rem;
    margin-bottom: 10px;
    color: #204d8d;
    font-weight: 600;
}

.platform-center p {
    color: #3f5570;
    font-size: 0.9rem;
    font-weight: 400;
}

.connection-line {
    position: absolute;
    top: 50%;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, #9ac0ff, transparent);
    z-index: 1;
}

.connection-line.left {
    left: -100px;
    transform: translateY(-50%);
}

.connection-line.right {
    right: -100px;
    transform: translateY(-50%) rotate(180deg);
}

/* 赚钱场景区域 */
.profit-scenarios {
    margin-top: 100px;
}

.scenarios-title {
    font-size: 2rem;
    font-weight: 700;
    color: #0a1a2f;
    text-shadow: 0 4px 10px rgba(0, 90, 190, 0.1);
    position: relative;
    padding-bottom: 20px;
    margin-bottom: 50px;
}

.scenarios-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 4px;
    background: linear-gradient(90deg, #bbd6ff, #4f8eff, #c9b0ff);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 80, 200, 0.25);
}

.scenarios-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

/* 场景卡片 — 高级透明渐变背景 + 渐变边框 */
.scenario-card {
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.8), rgba(245,252,255,0.95)) padding-box,
        linear-gradient(145deg, #d0e2ff, #b0caf5, #cbdeff) border-box;
    border: 2px solid transparent;
    border-radius: 20px;
    padding: 30px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 15px 30px -12px rgba(0, 70, 150, 0.2);
    backdrop-filter: blur(4px);
}

.scenario-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 25px 40px -16px rgba(0, 100, 220, 0.3);
    border-color: transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.9), rgba(250,252,255,0.98)) padding-box,
        linear-gradient(145deg, #b8d6ff, #95baf5, #bed3ff) border-box;
}

.scenario-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

/* 场景图标差异化渐变 */
.scenario-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    background: linear-gradient(145deg, #a88cf0, #795fd9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 20px;
    color: white;
    box-shadow: 0 8px 16px -8px #624bc2;
}

.scenario-name {
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.3px;
}

.scenario-description {
    color: #254十五6;
    line-height: 1.6;
    margin-bottom: 25px;
    font-weight: 400;
    text-shadow: 0 1px 3px rgba(255,255,255,0.8);
}

.scenario-features {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.feature-tag {
    padding: 8px 15px;
    background: rgba(225, 238, 255, 0.8);
    backdrop-filter: blur(2px);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #1f5090;
    font-weight: 500;
    border: 1px solid rgba(160, 200, 255, 0.6);
}

.scenario-arrow {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(120, 170, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #3f7fd4;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
}

.scenario-card:hover .scenario-arrow {
    opacity: 1;
    transform: translateX(0);
}

@media (max-width: 992px) {
    .diagram-container {
        flex-direction: column;
        gap: 40px;
    }
    .platform-center {
        margin: 20px 0;
        order: 2;
    }
    .resource-side,
    .opportunity-side {
        width: 100%;
    }
    .connection-line {
        display: none;
    }
}

@media (max-width: 768px) {
    .section-title {
        font-size: 2rem;
    }
    .scenarios-container {
        grid-template-columns: 1fr;
    }
    .profit-principle {
        margin: 20px 10px;
        border-radius: 20px;
    }
}
</style>
