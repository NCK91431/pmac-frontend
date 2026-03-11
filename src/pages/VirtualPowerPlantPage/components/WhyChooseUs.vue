<!-- 为什么选择我们组件 -->
<template>
    <section class="why-choose-us section-padding">
        <div class="container">
            <div class="section-header text-center" ref="sectionHeader">
                <h2 class="section-title gradient-text">
                    为什么选择我们：您的省心保障
                </h2>
                <p class="section-subtitle">技术服务于价值，专业成就信赖</p>
            </div>

            <!-- 优势卡片网格 -->
            <div class="advantages-grid" ref="advantagesGrid">
                <div
                    v-for="advantage in advantages"
                    :key="advantage.id"
                    class="advantage-card"
                    :ref="(el) => (advantageCards[advantage.id] = el)"
                    @mouseenter="hoverAdvantage(advantage.id)"
                    @mouseleave="leaveAdvantage(advantage.id)"
                >
                    <div class="advantage-header">
                        <div
                            class="advantage-icon"
                            :ref="(el) => (advantageIcons[advantage.id] = el)"
                        >
                            <i :class="advantage.icon"></i>
                        </div>
                        <h3 class="advantage-title">{{ advantage.title }}</h3>
                    </div>
                    <p class="advantage-description">
                        {{ advantage.description }}
                    </p>

                    <div class="advantage-stats" v-if="advantage.stats">
                        <div
                            class="stat-item"
                            v-for="stat in advantage.stats"
                            :key="stat.label"
                        >
                            <div class="stat-value">{{ stat.value }}</div>
                            <div class="stat-label">{{ stat.label }}</div>
                        </div>
                    </div>

                    <div class="advantage-features">
                        <div
                            class="feature-tag"
                            v-for="feature in advantage.features"
                            :key="feature"
                        >
                            <i class="bi bi-check-circle"></i>
                            <span>{{ feature }}</span>
                        </div>
                    </div>

                    <div class="advantage-glow"></div>
                </div>
            </div>

            <!-- 信任徽章 -->
            <div class="trust-badges" ref="trustBadges">
                <h3 class="badges-title text-center">我们的资质与认证</h3>
                <div class="badges-grid">
                    <div
                        v-for="badge in badges"
                        :key="badge.id"
                        class="badge-item"
                    >
                        <div class="badge-icon">
                            <i :class="badge.icon"></i>
                        </div>
                        <div class="badge-content">
                            <h4 class="badge-title">{{ badge.title }}</h4>
                            <p class="badge-description">
                                {{ badge.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 客户证言 -->
            <div class="testimonials" ref="testimonialsRef">
                <h3 class="testimonials-title text-center">客户证言</h3>
                <div class="testimonials-slider">
                    <div
                        class="testimonial-card"
                        v-for="testimonial in testimonials"
                        :key="testimonial.id"
                        :ref="(el) => (testimonialCards[testimonial.id] = el)"
                    >
                        <div class="testimonial-content">
                            <div class="quote-icon">
                                <i class="bi bi-quote"></i>
                            </div>
                            <p class="testimonial-text">
                                {{ testimonial.text }}
                            </p>
                            <div class="testimonial-author">
                                <div class="author-avatar">
                                    <i class="bi bi-person-circle"></i>
                                </div>
                                <div class="author-info">
                                    <h4 class="author-name">
                                        {{ testimonial.author }}
                                    </h4>
                                    <p class="author-position">
                                        {{ testimonial.position }}
                                    </p>
                                    <div class="author-company">
                                        {{ testimonial.company }}
                                    </div>
                                </div>
                            </div>
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

// 优势数据
const advantages = ref([
    {
        id: 1,
        icon: "bi bi-cpu",
        title: "已验证的赚钱大脑",
        description:
            "我们的算法不是论文，已在广东、澳洲等成熟市场真金白银地赚到了钱，预测准确率行业领先。",
        stats: [
            { value: "95%", label: "预测准确率" },
            { value: "3+", label: "年验证" },
        ],
        features: ["多市场验证", "算法持续优化", "实时策略调整"],
    },
    {
        id: 2,
        icon: "bi bi-shield-check",
        title: "全合规的通行证",
        description:
            "平台已通过所有官方认证，确保您入场无忧，结算顺畅，规避政策风险。",
        stats: [
            { value: "100%", label: "合规保障" },
            { value: "0", label: "政策风险" },
        ],
        features: ["等保三级认证", "安全评估认证", "交易许可资质"],
    },
    {
        id: 3,
        icon: "bi bi-person-check",
        title: "一站式管家服务",
        description:
            "您不需要雇佣电力交易员和IT团队。我们从技术、交易到运维提供全程支持。",
        stats: [
            { value: "24/7", label: "运维支持" },
            { value: "1h", label: "响应时间" },
        ],
        features: ["专业交易团队", "技术支持团队", "运维服务团队"],
    },
    {
        id: 4,
        icon: "bi bi-cash-coin",
        title: "透明公正的伙伴",
        description: "收益清晰可查，分成模式简单明了，合作安心，共同成长。",
        stats: [
            { value: "100%", label: "收益透明" },
            { value: "7天", label: "结算周期" },
        ],
        features: ["实时收益报表", "清晰分成模式", "定期对账服务"],
    },
]);

// 信任徽章数据
const badges = ref([
    {
        id: 1,
        icon: "bi bi-award",
        title: "等保三级认证",
        description: "最高等级信息安全认证",
    },
    {
        id: 2,
        icon: "bi bi-shield-lock",
        title: "安全评估认证",
        description: "电力交易系统安全认证",
    },
    {
        id: 3,
        icon: "bi bi-building-check",
        title: "电力交易许可",
        description: "官方授权电力交易资质",
    },
    {
        id: 4,
        icon: "bi bi-patch-check",
        title: "ISO认证",
        description: "质量管理体系认证",
    },
]);

// 客户证言数据
const testimonials = ref([
    {
        id: 1,
        text: "接入派诺虚拟电厂后，我们的储能系统年收益提升了，运维成本降低了，真正实现了躺赚。团队的专业服务让我们非常放心。",
        author: "张伟",
        position: "能源总监",
        company: "广东某制造企业",
    },
    {
        id: 2,
        text: "最让我们满意的是派诺的柔性调控技术，完全不影晌生产线的正常运行。去年获得了更多额外收益，投资回报超出预期。",
        author: "李娜",
        position: "运营经理",
        company: "重庆某商业楼宇",
    },
    {
        id: 3,
        text: "作为外资企业，我们最担心政策合规问题。派诺团队帮我们解决了所有合规担忧，现在可以安心享受电力市场的红利了。",
        author: "John Smith",
        position: "CEO",
        company: "澳洲储能项目",
    },
]);



// 引用
const sectionHeader = ref(null);
const advantagesGrid = ref(null);
const trustBadges = ref(null);
const testimonialsRef = ref(null);

const advantageCards = ref({});
const advantageIcons = ref({});
const testimonialCards = ref({});

// 优势卡片悬停效果
const hoverAdvantage = (id) => {
    if (advantageIcons.value[id]) {
        gsap.to(advantageIcons.value[id], {
            scale: 1.2,
            rotate: 10,
            duration: 0.3,
            ease: "back.out(1.7)",
        });
    }

    if (advantageCards.value[id]) {
        gsap.to(advantageCards.value[id], {
            y: -10,
            duration: 0.3,
            ease: "power2.out",
        });
    }
};

const leaveAdvantage = (id) => {
    if (advantageIcons.value[id]) {
        gsap.to(advantageIcons.value[id], {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease: "power2.out",
        });
    }

    if (advantageCards.value[id]) {
        gsap.to(advantageCards.value[id], {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
        });
    }
};

// 创建优势卡片动画
const createAdvantageAnimations = () => {
    Object.values(advantageCards.value).forEach((card, index) => {
        if (card) {
            gsap.from(card, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: advantagesGrid.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

// 创建信任徽章动画
const createBadgeAnimations = () => {
    const badgeItems = document.querySelectorAll(".badge-item");
    badgeItems.forEach((item, index) => {
        gsap.from(item, {
            x: -30,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: {
                trigger: trustBadges.value,
                start: "top 80%",
                end: "bottom 20%",
            },
        });
    });
};

// 创建客户证言动画
const createTestimonialAnimations = () => {
    Object.values(testimonialCards.value).forEach((card, index) => {
        if (card) {
            gsap.from(card, {
                x: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: testimonialsRef.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

onMounted(() => {
  console.log('testimonials:', testimonials.value);

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
    createAdvantageAnimations();
    createBadgeAnimations();
    createTestimonialAnimations();
});
</script>

<style scoped>
.why-choose-us {
    position: relative;
    background: #ffffff;
    border-radius: 40px;
    margin: 40px 20px;
	padding:80px 0;
    overflow: hidden;
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
    letter-spacing: 0.3px;.container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 20px;}
}

.advantages-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 100px;
}

/* 优势卡片高级样式 */
.advantage-card {
    border-radius: 20px;
    padding: 25px 20px;
    border: 2px solid transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,250,255,0.9)) padding-box,
        linear-gradient(145deg, #c5dbff, #9ab5f0, #c2d4ff) border-box;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 12px 28px -12px rgba(0, 70, 150, 0.2);
    min-width: 0;
}

.advantage-card:hover {
    border-color: transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.8), rgba(245,252,255,0.98)) padding-box,
        linear-gradient(145deg, #b8d6ff, #95baf5, #bed3ff) border-box;
    box-shadow: 0 20px 40px -12px rgba(0, 100, 200, 0.3);
    transform: translateY(-5px);
}

.advantage-header {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
}

/* 图标差异化 — 四种不同渐变色 */
.advantage-card:nth-child(1) .advantage-icon {
    background: linear-gradient(145deg, #6a7cf0, #3f54c4);
    box-shadow: 0 8px 16px -8px #2f44a0;
}

.advantage-card:nth-child(2) .advantage-icon {
    background: linear-gradient(145deg, #f9b851, #f0851e);
    box-shadow: 0 8px 16px -8px #e07c1f;
}

.advantage-card:nth-child(3) .advantage-icon {
    background: linear-gradient(145deg, #4db8b0, #1f8f87);
    box-shadow: 0 8px 16px -8px #1f8f87;
}

.advantage-card:nth-child(4) .advantage-icon {
    background: linear-gradient(145deg, #a88cf0, #795fd9);
    box-shadow: 0 8px 16px -8px #624bc2;
}

.advantage-icon {
    width: 60px;
    height: 60px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-right: 15px;
    transition: all 0.3s ease;
    color: white;
    flex-shrink: 0;
}

.advantage-title {
    font-size: 1.15rem;
    font-weight: 700;
    background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.advantage-description {
    color: #2c3f55;
    line-height: 1.6;
    margin-bottom: 25px;
    font-size: 1rem;
    text-shadow: 0 1px 3px rgba(255,255,255,0.8);
}

.advantage-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 25px;
}

.stat-item {
    text-align: center;
    flex: 1;
}

.stat-value {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(90deg, #4d8cff, #6a5acd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 0.9rem;
    color: #3f5570;
    font-weight: 500;
}

.advantage-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.feature-tag {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: rgba(200, 220, 250, 0.4);
    backdrop-filter: blur(2px);
    border-radius: 10px;
    color: #1e3a6f;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid rgba(160, 200, 255, 0.5);
}

.feature-tag i {
    color: #3f7fd4;
    margin-right: 10px;
    font-size: 1.1rem;
}

.advantage-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 110, 255, 0.1) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.advantage-card:hover .advantage-glow {
    opacity: 1;
}

.trust-badges {
    margin-bottom: 100px;
}

.badges-title {
    font-size: 2rem;
    font-weight: 700;
    color: #0a1a2f;
    text-shadow: 0 4px 10px rgba(0, 90, 190, 0.1);
    position: relative;
    padding-bottom: 20px;
    margin-bottom: 50px;
}

.badges-title::after {
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

.badges-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

/* 徽章卡片样式 */
.badge-item {
    display: flex;
    align-items: center;
    padding: 25px;
    border-radius: 20px;
    border: 2px solid transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.6), rgba(245,250,255,0.8)) padding-box,
        linear-gradient(145deg, #d0e2ff, #b0caf5, #cbdeff) border-box;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 10px 20px -10px rgba(0, 60, 130, 0.15);
}

.badge-item:hover {
    transform: translateX(10px);
    border-color: transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.8), rgba(250,255,255,0.95)) padding-box,
        linear-gradient(145deg, #b8d6ff, #95baf5, #bed3ff) border-box;
    box-shadow: 0 15px 25px -10px rgba(0, 90, 180, 0.25);
}

.badge-icon {
    width: 60px;
    height: 60px;
    border-radius: 15px;
    background: linear-gradient(145deg, #6a7cf0, #3f54c4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-right: 20px;
    color: white;
    box-shadow: 0 6px 12px -6px #2f44a0;
}

.badge-content {
    flex: 1;
}

.badge-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 5px;
    color: #1e3a6f;
}

.badge-description {
    color: #3f5570;
    font-size: 0.9rem;
    font-weight: 400;
}

.testimonials {
    max-width: 1000px;
    margin: 0 auto;
}

.testimonials-title {
    font-size: 2rem;
    font-weight: 700;
    color: #0a1a2f;
    text-shadow: 0 4px 10px rgba(0, 90, 190, 0.1);
    position: relative;
    padding-bottom: 20px;
    margin-bottom: 50px;
}

.testimonials-title::after {
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

.testimonials-slider {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

/* 证言卡片样式 */
.testimonial-card {
    border-radius: 25px;
    padding: 40px;
    border: 2px solid transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.7), rgba(245,250,255,0.85)) padding-box,
        linear-gradient(145deg, #d0e2ff, #b0caf5, #cbdeff) border-box;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    box-shadow: 0 15px 30px -12px rgba(0, 70, 150, 0.15);
}

.testimonial-card:hover {
    border-color: transparent;
    background: 
        linear-gradient(145deg, rgba(255,255,255,0.9), rgba(250,255,255,0.98)) padding-box,
        linear-gradient(145deg, #b8d6ff, #95baf5, #bed3ff) border-box;
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -12px rgba(0, 100, 200, 0.2);
}

.quote-icon {
    font-size: 3rem;
    color: #4f8eff;
    opacity: 0.3;
    margin-bottom: 20px;
}

.testimonial-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #1e2f45;
    margin-bottom: 30px;
    font-style: italic;
    text-shadow: 0 1px 3px rgba(255,255,255,0.8);
}

.testimonial-author {
    display: flex;
    align-items: center;
}

.author-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(145deg, #a88cf0, #795fd9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    margin-right: 20px;
    color: white;
    box-shadow: 0 8px 16px -8px #624bc2;
}

.author-info {
    flex: 1;
}

.author-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 5px;
    background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.author-position {
    color: #3f5570;
    font-size: 0.9rem;
    margin-bottom: 5px;
    font-weight: 400;
}

.author-company {
    color: #3f5570;
    font-size: 0.9rem;
    opacity: 0.8;
}

@media (max-width: 1300px) {
    .advantages-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }
    .advantage-title {
        font-size: 1.25rem;
    }
}

@media (max-width: 992px) {
    .advantages-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .badges-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .container {
        padding: 0 15px;
    }
}

@media (max-width: 768px) {
    .why-choose-us {
        margin: 20px 10px;
        border-radius: 20px;
    }
    .section-title {
        font-size: 2rem;
    }
    .advantages-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    .badges-grid {
        grid-template-columns: 1fr;
    }
    .testimonials-slider {
        grid-template-columns: 1fr;
    }
    .advantage-title {
        font-size: 1.2rem;
    }
    .advantage-card {
        padding: 30px 25px;
    }
}
</style>