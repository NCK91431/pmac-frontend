<!-- 如何开始组件  -->
<template>
    <section class="getting-started section-padding">
        <div class="container">
            <div class="section-header text-center" ref="sectionHeader">
                <h2 class="section-title gradient-text">
                    如何开始：三步开启您的"自动赚钱"模式
                </h2>
                <p class="section-subtitle">
                    将复杂流程极度简化，轻松上手，坐享收益
                </p>
            </div>

            <!-- 步骤流程 -->
            <div class="steps-process" ref="stepsProcess">
                <div
                    class="step-item"
                    v-for="step in steps"
                    :key="step.id"
                    :ref="(el) => (stepItems[step.id] = el)"
                >
                    <div class="step-number-container">
                        <div class="step-number">{{ step.number }}</div>
                        <div
                            class="step-line"
                            v-if="step.number < steps.length"
                        ></div>
                    </div>
                    <div class="step-content">
                        <div class="step-header">
                            <div class="step-icon" :class="step.iconClass">
                                <i :class="step.icon"></i>
                            </div>
                            <h3 class="step-title">{{ step.title }}</h3>
                        </div>
                        <p class="step-description">{{ step.description }}</p>
                        <div class="step-details">
                            <div
                                class="detail-tag"
                                v-for="detail in step.details"
                                :key="detail"
                            >
                                <i class="bi bi-check-circle"></i>
                                <span>{{ detail }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 时间线展示 -->
            <div class="timeline-section" ref="timelineSection">
                <h3 class="timeline-title text-center">典型合作时间线</h3>
                <div class="timeline-container">
                    <div class="timeline-track">
                        <div
                            v-for="(milestone, index) in milestones"
                            :key="milestone.id"
                            class="milestone"
                            :ref="(el) => (milestoneRefs[milestone.id] = el)"
                            :style="{
                                left: `${(index / (milestones.length - 1)) * 100}%`,
                            }"
                        >
                            <div
                                class="milestone-dot"
                                @mouseenter="showMilestoneDetail(milestone.id)"
                            >
                                <div class="dot-inner"></div>
                            </div>
                            <div class="milestone-label">
                                {{ milestone.day }}
                            </div>
                            <div
                                class="milestone-detail"
                                :id="`milestone-${milestone.id}`"
                            >
                                <h4>{{ milestone.title }}</h4>
                                <p>{{ milestone.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 快速开始CTA -->
            <div class="quick-start-cta" ref="quickStartCta">
                <div class="cta-content">
                    <h3 class="cta-title">现在就开始您的赚钱之旅</h3>
                    <p class="cta-text">
                        提交您的资源信息，我们将为您提供免费的收益评估报告
                    </p>
                    <button
                        class="btn btn-primary btn-glow"
                        @click="startAssessment"
                    >
                        免费获取收益评估
                        <i class="bi bi-lightning-charge"></i>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const emit = defineEmits(['open-contact-modal']);

gsap.registerPlugin(ScrollTrigger);

// 步骤数据
const steps = ref([
    {
        id: 1,
        number: "01",
        icon: "bi bi-clipboard-data",
        iconClass: "step-icon-1",
        title: "资源评估",
        description: "您提供设备信息",
        details: [
            "告诉我们您有哪些用电设备",
            "提供发电/储能设备信息",
            "无需专业评估，我们帮您分析",
        ],
    },
    {
        id: 2,
        number: "02",
        icon: "bi bi-file-earmark-text",
        iconClass: "step-icon-2",
        title: "方案与签约",
        description: "我们主导合作流程",
        details: [
            "为您分析预期收益",
            "提供定制合作方案",
            "协助完成市场注册与协议签订",
        ],
    },
    {
        id: 3,
        number: "03",
        icon: "bi bi-rocket-takeoff",
        iconClass: "step-icon-3",
        title: "安装接入与坐享收益",
        description: "我们执行，您坐享收益",
        details: [
            "部署轻量级控制终端",
            "平台开始自动优化运行",
            "手机/电脑查看实时收益报表",
        ],
    },
]);

// 里程碑数据
const milestones = ref([
    {
        id: 1,
        day: "第1天",
        title: "提交申请",
        description: "填写基本信息，获取初步评估",
    },
    {
        id: 2,
        day: "第3-5天",
        title: "现场勘查",
        description: "工程师上门勘查设备情况",
    },
    {
        id: 3,
        day: "第7-10天",
        title: "方案制定",
        description: "定制专属虚拟电厂方案",
    },
    {
        id: 4,
        day: "第12天",
        title: "签约接入",
        description: "签订协议，部署控制终端",
    },
    {
        id: 5,
        day: "第15天起",
        title: "开始赚钱",
        description: "平台自动运行，产生稳定收益",
    },
]);

// 引用
const sectionHeader = ref(null);
const stepsProcess = ref(null);
const timelineSection = ref(null);
const quickStartCta = ref(null);

const stepItems = ref({});
const milestoneRefs = ref({});

// 显示里程碑详情
const showMilestoneDetail = (id) => {
    const detail = document.getElementById(`milestone-${id}`);
    if (detail) {
        gsap.to(detail, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
        });
    }
};

// 隐藏里程碑详情
const hideMilestoneDetail = (id) => {
    const detail = document.getElementById(`milestone-${id}`);
    if (detail) {
        gsap.to(detail, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: "power2.out",
        });
    }
};

// 开始评估
const startAssessment = () => {
    emit('open-contact-modal', 'all');
};

// 创建步骤动画
const createStepAnimations = () => {
    Object.values(stepItems.value).forEach((step, index) => {
        if (step) {
            gsap.from(step, {
                x: -50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: stepsProcess.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

// 创建时间线动画
const createTimelineAnimations = () => {
    // 时间线轨迹动画
    const timelineTrack = document.querySelector(".timeline-track");
    if (timelineTrack) {
        gsap.from(timelineTrack, {
            scaleX: 0,
            duration: 2,
            scrollTrigger: {
                trigger: timelineSection.value,
                start: "top 80%",
                end: "bottom 20%",
            },
        });
    }

    // 里程碑点动画
    Object.values(milestoneRefs.value).forEach((milestone, index) => {
        if (milestone) {
            gsap.from(milestone, {
                scale: 0,
                opacity: 0,
                duration: 0.6,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: timelineSection.value,
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

    // 创建动画
    createStepAnimations();
    createTimelineAnimations();

    // CTA动画
    gsap.from(quickStartCta.value, {
        y: 50,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: quickStartCta.value,
            start: "top 80%",
            end: "bottom 20%",
        },
    });

    // 初始化里程碑事件
    Object.keys(milestoneRefs.value).forEach((id) => {
        const milestone = milestoneRefs.value[id];
        if (milestone) {
            milestone.addEventListener("mouseenter", () =>
                showMilestoneDetail(parseInt(id)),
            );
            milestone.addEventListener("mouseleave", () =>
                hideMilestoneDetail(parseInt(id)),
            );
        }
    });
});
</script>

<style scoped>
.getting-started {
    background: #f8fafc;
    position: relative;
    overflow: hidden;
    padding: 100px 0;
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

.steps-process {
    max-width: 1000px;
    margin: 0 auto 100px;
}

.step-item {
    display: flex;
    margin-bottom: 60px;
    position: relative;
}

.step-number-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 40px;
    position: relative;
}

.step-number {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(145deg, #6a7cf0, #3f54c4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    color: white;
    box-shadow: 0 10px 20px -8px #2f44a0;
    position: relative;
    z-index: 2;
}

.step-line {
    width: 2px;
    height: calc(100% + 60px);
    background: linear-gradient(to bottom, #9ab5f0, #d0e2ff);
    position: absolute;
    top: 80px;
    opacity: 0.5;
}

.step-item:last-child .step-line {
    display: none;
}

/* .step-content {
    flex: 1;
    background: #ffffff;
    border-radius: 25px;
    padding: 30px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
} */

/* .step-content:hover {
    transform: translateX(10px);
    border-color: #00c6ff;
    background: #ffffff;
    box-shadow: 0 20px 40px -12px rgba(0, 114, 255, 0.2);
} */

.step-content {
    flex: 1;
    border-radius: 25px;
    padding: 30px;
    /* border: 2px solid transparent; */
	border: 1px solid #e2e8f0;
   /* background: 
        linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,250,255,0.9)) padding-box,
        linear-gradient(145deg, #c5dbff, #9ab5f0, #c2d4ff) border-box; */
		background: #ffffff;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 12px 28px -12px rgba(0, 70, 150, 0.2);
}

.step-content:hover {
    transform: translateX(10px);
    border-color: transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.8), rgba(245,252,255,0.98)) padding-box,
        linear-gradient(145deg, #b8d6ff, #95baf5, #bed3ff) border-box;
    box-shadow: 0 20px 40px -12px rgba(0, 100, 200, 0.3);
}

.step-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.step-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-right: 20px;
    color: white;
}

.step-icon-1 { background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%); }
.step-icon-2 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.step-icon-3 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }

/* .step-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0072ff;
} */

.step-title {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.3px;
}

/* .step-description {
    font-size: 1.1rem;
    color: #475569;
    margin-bottom: 20px;
} */

.step-description {
    font-size: 1.1rem;
    color: #2c3f55;
    margin-bottom: 20px;
    text-shadow: 0 1px 3px rgba(255,255,255,0.8);
}

/* .step-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.detail-tag {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: #e6f0ff;
    border-radius: 10px;
    color: #1e293b;
}

.detail-tag i {
    color: #0072ff;
    margin-right: 10px;
    font-size: 1.1rem;
} */


.step-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.detail-tag {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 500;
	color: #1e3a6f;
    border: 1px solid rgba(160, 200, 255, 0.5);
	background: rgba(200, 220, 250, 0.4);
	backdrop-filter: blur(2px);
}

.detail-tag i {
    color: #3f7fd4;
    margin-right: 10px;
    font-size: 1.1rem;
}


.timeline-section {
    margin-bottom: 100px;
}

.timeline-title {
    font-size: 2rem;
    font-weight: 700;
    color: #0a1a2f;
    text-shadow: 0 4px 10px rgba(0, 90, 190, 0.1);
    position: relative;
    padding-bottom: 20px;
    margin-bottom: 50px;
}

.timeline-title::after {
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

.timeline-container {
    position: relative;
    height: 200px;
    padding: 0 20px;
}

.timeline-track {
    position: absolute;
    top: 50%;
    left: 30px;
    right: 30px;
    height: 3px;
    background: linear-gradient(90deg, #b3d9ff, #4d8cff, #b3a0ff);
    transform: translateY(-50%);
    transform-origin: left center;
    box-shadow: 0 2px 10px rgba(0, 110, 255, 0.2);
}

.milestone {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 2;
}

.milestone-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(150, 190, 255, 0.3);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 110, 255, 0.2);
}

.milestone-dot:hover {
    transform: scale(1.2);
    background: rgba(180, 210, 255, 0.5);
}

.dot-inner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(145deg, #6a7cf0, #3f54c4);
    box-shadow: 0 0 15px rgba(0, 110, 255, 0.6);
}

.milestone-label {
    font-size: 0.9rem;
    color: #3f5570;
    font-weight: 500;
    margin-bottom: 10px;
    white-space: nowrap;
    min-width: 80px;
}

.milestone-detail {
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px;
    border-radius: 10px;
    border: 2px solid transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,250,255,0.98)) padding-box,
        linear-gradient(145deg, #b8d6ff, #95baf5, #bed3ff) border-box;
    width: 200px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    box-shadow: 0 10px 25px -10px rgba(0, 60, 130, 0.3);
    backdrop-filter: blur(4px);
}

.milestone-detail h4 {
    font-size: 1rem;
    color: #1e3a6f;
    margin-bottom: 5px;
    font-weight: 600;
}

.milestone-detail p {
    font-size: 0.9rem;
    color: #3f5570;
}

.quick-start-cta {
    border-radius: 30px;
    padding: 60px;
    text-align: center;
	color: #1e3a6f;
	border: 1px solid rgba(160, 200, 255, 0.5);
	background: linear-gradient(135deg, rgba(200, 220, 250, 0.05) 0%, rgba(0, 114, 255, 0.05) 100%);
	backdrop-filter: blur(2px);
}

.cta-content {
    max-width: 600px;
    margin: 0 auto;
}

.cta-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: #1e293b;
}

.cta-text {
    font-size: 1.2rem;
    color: #475569;
    margin-bottom: 40px;
}

.btn {
    padding: 15px 40px;
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

.btn-glow {
    box-shadow: 0 0 20px rgba(0, 114, 255, 0.5);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 20px rgba(0, 114, 255, 0.5); }
    50% { box-shadow: 0 0 30px rgba(0, 114, 255, 0.8); }
    100% { box-shadow: 0 0 20px rgba(0, 114, 255, 0.5); }
}

@media (max-width: 992px) {
    .step-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .step-number-container {
        margin-right: 0;
        margin-bottom: 20px;
    }
    .step-line {
        width: 100%;
        height: 2px;
        top: auto;
        left: 50%;
        transform: translateX(-50%);
        bottom: -30px;
    }
    .step-header {
        justify-content: center;
    }
    .timeline-container {
        height: 300px;
    }
    .timeline-track {
        left: 30px;
        right: 30px;
    }
}

@media (max-width: 768px) {
    .section-title {
        font-size: 2rem;
    }
    .step-details {
        grid-template-columns: 1fr;
    }
    .quick-start-cta {
        padding: 40px 20px;
    }
    .cta-title {
        font-size: 1.8rem;
    }
}
</style>