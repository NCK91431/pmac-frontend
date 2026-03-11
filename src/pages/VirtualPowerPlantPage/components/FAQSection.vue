<!-- 常见问题组件 -->
<template>
    <section class="faq-section section-padding">
        <div class="container">
            <div class="section-header text-center" ref="sectionHeader">
                <h2 class="section-title gradient-text">常见问题与顾虑解答</h2>
                <p class="section-subtitle">您的疑虑，我们都有答案</p>
            </div>

            <!-- 问题分类 -->
            <div class="faq-categories" ref="faqCategories">
                <button
                    v-for="category in categories"
                    :key="category.id"
                    class="category-btn"
                    :class="{ active: activeCategory === category.id }"
                    @click="changeCategory(category.id)"
                >
                    <i :class="category.icon"></i>
                    <span>{{ category.name }}</span>
                </button>
            </div>

            <!-- 问题列表 -->
            <div class="faq-list" ref="faqList">
                <div
                    v-for="faq in filteredFaqs"
                    :key="faq.id"
                    class="faq-item"
                    :class="{ active: activeFaq === faq.id }"
                    :ref="(el) => (faqItems[faq.id] = el)"
                >
                    <div class="faq-question" @click="toggleFaq(faq.id)">
                        <div class="question-content">
                            <span class="question-text">{{
                                faq.question
                            }}</span>
                            <span class="question-category">{{
                                getCategoryName(faq.category)
                            }}</span>
                        </div>
                        <div class="question-toggle">
                            <i
                                class="bi"
                                :class="
                                    activeFaq === faq.id ? 'bi-dash' : 'bi-plus'
                                "
                            ></i>
                        </div>
                    </div>
                    <div class="faq-answer">
                        <p>{{ faq.answer }}</p>
                        <div class="answer-details" v-if="faq.details">
                            <div
                                class="detail-item"
                                v-for="detail in faq.details"
                                :key="detail"
                            >
                                <i class="bi bi-check-circle"></i>
                                <span>{{ detail }}</span>
                            </div>
                        </div>
                        <div class="answer-note" v-if="faq.note">
                            <i class="bi bi-info-circle"></i>
                            <span>{{ faq.note }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 更多帮助 -->
            <div class="more-help" ref="moreHelp">
                <div class="help-content">
                    <div class="help-text">
                        <h3 class="help-title">还有更多问题？</h3>
                        <p class="help-description">
                            我们的专家团队随时为您解答，提供专属咨询服务
                        </p>
                    </div>
                    <div class="help-actions">
                        <button class="btn btn-outline" @click="openChat">
                            <i class="bi bi-chat-left-text"></i>
                            在线咨询
                        </button>
                        <button class="btn btn-primary" @click="contactSales">
                            <i class="bi bi-telephone"></i>
                            联系销售
                        </button>
                    </div>
                </div>

                <!-- 联系信息 -->
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="bi bi-telephone"></i>
                        <div class="contact-content">
                            <div class="contact-label">合作热线</div>
                            <div class="contact-value">18679510800（微信同号）</div>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="bi bi-headset"></i>
                        <div class="contact-content">
                            <div class="contact-label">技术支持</div>
                            <div class="contact-value">17722020058</div>
                        </div>
                    </div>
                    <div class="contact-item">
                        <i class="bi bi-geo-alt"></i>
                        <div class="contact-content">
                            <div class="contact-label">地址</div>
                            <div class="contact-value">
                                广东省珠海市高新区科技创新海岸创新8路88号
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const emit = defineEmits(['open-contact-modal']);

gsap.registerPlugin(ScrollTrigger);

// 问题分类
const categories = ref([
    { id: "all", name: "全部问题", icon: "bi bi-grid" },
    { id: "safety", name: "安全合规", icon: "bi bi-shield-check" },
    { id: "profit", name: "收益相关", icon: "bi bi-cash-coin" },
    { id: "tech", name: "技术实施", icon: "bi bi-gear" },
    { id: "service", name: "服务支持", icon: "bi bi-headset" },
]);

// 常见问题数据
const faqs = ref([
    {
        id: 1,
        question: "调控会影响我工厂的正常生产或楼宇的舒适度吗？",
        answer: "完全不会。我们的柔性调控技术基于先进的AI算法，在保障生产稳定和舒适度的前提下进行优化调度。所有调控策略都经过严格的模拟验证，确保不影响您的正常运营。",
        category: "safety",
        details: [
            "柔性调控技术，无感参与",
            "AI算法保障生产稳定",
            "调控策略模拟验证",
            "舒适度优先原则",
        ],
        note: "我们承诺所有调控都在不影响正常运营的前提下进行",
    },
    {
        id: 2,
        question: "参与这个项目，我需要改造现有设备吗？成本高吗？",
        answer: "通常无需大规模改造。我们通过部署轻量级控制终端接入您的设备，改造成本极低甚至为零。对于特殊情况，我们会提供最优的技术方案和成本分析。",
        category: "tech",
        details: [
            "轻量级控制终端接入",
            "零或极低改造成本",
            "提供最优技术方案",
            "成本透明无隐藏",
        ],
    },
    {
        id: 3,
        question: "收益是否稳定？会不会有亏损风险？",
        answer: "收益稳定且有保障。我们的算法经过多市场验证，采用多种风险控制策略。同时，我们提供收益保底承诺，确保您的投资安全。",
        category: "profit",
        details: [
            "多市场验证算法",
            "多种风险控制策略",
            "收益保底承诺",
            "历史收益稳定",
        ],
        note: "我们提供收益保底承诺，确保您的投资安全",
    },
    {
        id: 4,
        question: "数据安全吗？",
        answer: "绝对安全。我们采用银行级数据加密技术，平台已通过等保三级认证。您的数据只用于优化调度，绝不会泄露给任何第三方。",
        category: "safety",
        details: [
            "银行级数据加密",
            "等保三级认证",
            "数据隔离存储",
            "严格访问控制",
        ],
    },
    {
        id: 5,
        question: "合作流程复杂吗？需要多长时间？",
        answer: "流程非常简单。从评估到上线通常只需2-4周。我们提供全程协助，您只需配合提供基本信息，剩下的交给我们。",
        category: "service",
        details: [
            "2-4周快速上线",
            "全程协助服务",
            "极简申请流程",
            "专业团队支持",
        ],
    },
    {
        id: 6,
        question: "收益如何结算？结算周期是多久？",
        answer: "收益按月结算，每月10日前完成上月收益结算。您可以在平台实时查看收益明细，结算报告清晰透明。",
        category: "profit",
        details: ["按月结算", "每月10日前完成", "实时收益查看", "清晰结算报告"],
    },
    {
        id: 7,
        question: "需要专业人员维护吗？",
        answer: "完全不需要。我们的平台是全自动运行的，您无需雇佣专业人员。我们提供7x24小时运维支持，确保系统稳定运行。",
        category: "service",
        details: ["全自动运行", "无需专业人员", "7x24小时运维", "远程技术支持"],
    },
    {
        id: 8,
        question: "如何确保符合电力市场规则？",
        answer: "我们的平台已集成最新的电力市场规则，所有操作自动符合监管要求。同时，我们有专业的合规团队确保您的参与完全合规。",
        category: "safety",
        details: [
            "平台集成市场规则",
            "自动合规操作",
            "专业合规团队",
            "实时政策更新",
        ],
    },
]);

// 状态管理
const activeCategory = ref("all");
const activeFaq = ref(1); // 默认展开第一个问题

// 计算属性：筛选问题
const filteredFaqs = computed(() => {
    if (activeCategory.value === "all") {
        return faqs.value;
    }
    return faqs.value.filter((faq) => faq.category === activeCategory.value);
});

// 获取分类名称
const getCategoryName = (categoryId) => {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.name : "";
};

// 切换问题
const toggleFaq = (id) => {
    if (activeFaq.value === id) {
        activeFaq.value = null;
    } else {
        activeFaq.value = id;
    }
};

// 切换分类
const changeCategory = (categoryId) => {
    activeCategory.value = categoryId;
    activeFaq.value = null; // 切换分类时收起所有问题
};

// 打开在线咨询
const openChat = () => {
    emit('open-contact-modal', 'chat');
};

// 联系销售
const contactSales = () => {
    emit('open-contact-modal', 'sales');
};

// 引用
const sectionHeader = ref(null);
const faqCategories = ref(null);
const faqList = ref(null);
const moreHelp = ref(null);

const faqItems = ref({});

// 创建问题分类动画
const createCategoryAnimations = () => {
    const categoryBtns = document.querySelectorAll(".category-btn");
    categoryBtns.forEach((btn, index) => {
        gsap.from(btn, {
            y: 30,
            opacity: 0,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: {
                trigger: faqCategories.value,
                start: "top 80%",
                end: "bottom 20%",
            },
        });
    });
};

// 创建问题项动画
const createFaqAnimations = () => {
    Object.values(faqItems.value).forEach((item, index) => {
        if (item) {
            gsap.from(item, {
                x: -30,
                opacity: 0,
                duration: 0.6,
                delay: index * 0.05,
                scrollTrigger: {
                    trigger: faqList.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

// 创建更多帮助动画
const createMoreHelpAnimations = () => {
    gsap.from(".help-content", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
            trigger: moreHelp.value,
            start: "top 80%",
            end: "bottom 20%",
        },
    });

    gsap.from(".contact-item", {
        x: -30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        delay: 0.3,
        scrollTrigger: {
            trigger: moreHelp.value,
            start: "top 80%",
            end: "bottom 20%",
        },
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
    createCategoryAnimations();
    createFaqAnimations();
    createMoreHelpAnimations();
});
</script>

<style scoped>
.faq-section {
    position: relative;
    background: #ffffff;
    border-radius: 40px;
    margin: 40px 20px;
    overflow: hidden;
	padding:80px 0;
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


.faq-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    margin-bottom: 60px;
}

.category-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px 25px;
    background: #f9f9f9;
    border: 1px solid #e2e8f0;
    border-radius: 50px;
    color: #475569;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.category-btn:hover {
    color: #0072ff;
    border-color: #00c6ff;
    background: #e6f0ff;
    transform: translateY(-2px);
}

.category-btn.active {
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    color: white;
    border-color: transparent;
    box-shadow: 0 10px 20px rgba(0, 114, 255, 0.3);
}

.category-btn i {
    font-size: 1.2rem;
}

.faq-list {
    max-width: 900px;
    margin: 0 auto 80px;
}

.faq-item {
    background: #f9f9f9;
    border-radius: 20px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.3s ease;
}

.faq-item.active {
    border-color: #00c6ff;
    background: #ffffff;
}

.faq-question {
    padding: 25px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
}

.question-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 15px;
}

.question-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
}

.question-category {
    padding: 5px 12px;
    background: #e6f0ff;
    border-radius: 15px;
    font-size: 0.85rem;
    color: #0072ff;
}

.question-toggle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
    transition: all 0.3s ease;
}

.faq-item.active .question-toggle {
    transform: rotate(180deg);
}

.faq-answer {
    padding: 0 30px;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease;
}

.faq-item.active .faq-answer {
    padding: 0 30px 25px;
    max-height: 1000px;
}

.faq-answer p {
    color: #475569;
    line-height: 1.6;
    margin-bottom: 20px;
}

.answer-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    background: #e6f0ff;
    border-radius: 10px;
    color: #1e293b;
}

.detail-item i {
    color: #0072ff;
    font-size: 1.1rem;
}

.answer-note {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: rgba(0, 114, 255, 0.05);
    border-radius: 10px;
    color: #475569;
    font-size: 0.95rem;
    border: 1px solid rgba(0, 198, 255, 0.2);
}

.answer-note i {
    color: #0072ff;
    font-size: 1.2rem;
}

.more-help {
    background: linear-gradient(135deg, rgba(0, 114, 255, 0.05) 0%, rgba(0, 198, 255, 0.05) 100%);
    border-radius: 30px;
    padding: 60px;
    border: 1px solid rgba(0, 198, 255, 0.3);
}

.help-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 60px;
}

.help-text {
    flex: 1;
}

.help-title {
    font-size: 2rem;
    margin-bottom: 15px;
    color: #1e293b;
}

.help-description {
    font-size: 1.2rem;
    color: #475569;
    max-width: 500px;
}

.help-actions {
    display: flex;
    gap: 20px;
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

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 114, 255, 0.3);
}

.btn-outline {
    background: transparent;
    color: #0072ff;
    border: 2px solid #0072ff;
}

.btn-outline:hover {
    background: rgba(0, 114, 255, 0.05);
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    padding-top: 40px;
    border-top: 1px solid #e2e8f0;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 20px;
}

.contact-item i {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
}

.contact-label {
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 5px;
}

.contact-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
}

@media (max-width: 992px) {
    .help-content {
        flex-direction: column;
        text-align: center;
        gap: 30px;
    }
    .help-actions {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .faq-section {
        margin: 20px 10px;
        border-radius: 20px;
    }
    .section-title {
        font-size: 2rem;
    }
    .faq-categories {
        overflow-x: auto;
        justify-content: flex-start;
        padding-bottom: 10px;
    }
    .category-btn {
        flex-shrink: 0;
    }
    .question-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    .more-help {
        padding: 40px 20px;
    }
    .help-actions {
        flex-direction: column;
        width: 100%;
    }
    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
