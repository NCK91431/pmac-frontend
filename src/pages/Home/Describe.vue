<template>
    <div class="features-container">
        <!-- 标题和介绍部分 -->
        <div class="intro-section">
            <div class="lead text-center intro-text">
                <p class="title display-4 fw-bold text-center">
                    智算新能源全链运营，驱动绿色未来
                </p>
                新能源资产运营，依托先进的算法引擎与创新技术体系，用创新技术为行业注入精准与高效，从预测到规划，从效益评估到安全守护，为售电与微电网用户筑牢发展根基。
            </div>
        </div>

        <!-- 功能卡片区域 - 修改为2+3布局 -->
        <div class="features-grid">
            <!-- 第一行 - 两个卡片 -->
            <div class="row g-4 justify-content-center">
                <div
                    v-for="(feature, index) in features.slice(0, 2)"
                    :key="index"
                    class="col-md-6 col-lg-5"
                >
                    <div
                        class="feature-card"
                        @mouseover="hoverIndex = feature.title"
                        @mouseleave="hoverIndex = -1"
                    >
                        <div
                            class="card-icon"
                            :class="{
                                'icon-hover': hoverIndex === feature.title,
                            }"
                        >
                            <component :is="feature.icon" class="icon" />
                        </div>
                        <h3 class="card-title">{{ feature.title }}</h3>
                        <p class="card-desc">{{ feature.description }}</p>
                        <!-- <div class="card-stats">
                            <div class="stat-item">
                                <span class="stat-value">{{
                                    feature.stats[0]
                                }}</span>
                                <span class="stat-label">{{
                                    feature.statLabels[0]
                                }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">{{
                                    feature.stats[1]
                                }}</span>
                                <span class="stat-label">{{
                                    feature.statLabels[1]
                                }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">{{
                                    feature.stats[2]
                                }}</span>
                                <span class="stat-label">{{
                                    feature.statLabels[2]
                                }}</span>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>

            <!-- 第二行 - 三个卡片 -->
            <div class="row g-4 justify-content-center mt-4">
                <div
                    v-for="(feature, index) in features.slice(2)"
                    :key="index + 2"
                    class="col-md-6 col-lg-4"
                >
                    <div
                        class="feature-card"
                        @mouseover="hoverIndex = feature.title"
                        @mouseleave="hoverIndex = -1"
                    >
                        <div
                            class="card-icon"
                            :class="{
                                'icon-hover': hoverIndex === feature.title,
                            }"
                        >
                            <component :is="feature.icon" class="icon" />
                        </div>
                        <h3 class="card-title">{{ feature.title }}</h3>
                        <p class="card-desc">{{ feature.description }}</p>
                        <!-- <div class="card-stats">
                            <div class="stat-item">
                                <span class="stat-value">{{
                                    feature.stats[0]
                                }}</span>
                                <span class="stat-label">{{
                                    feature.statLabels[0]
                                }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">{{
                                    feature.stats[1]
                                }}</span>
                                <span class="stat-label">{{
                                    feature.statLabels[1]
                                }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">{{
                                    feature.stats[2]
                                }}</span>
                                <span class="stat-label">{{
                                    feature.statLabels[2]
                                }}</span>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 技术优势部分 -->
        <div class="tech-section">
            <h2 class="section-title">我们的技术优势</h2>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="tech-icon">
                        <el-icon><DataAnalysis /></el-icon>
                    </div>
                    <h4>海量数据训练</h4>
                    <p>基于全球能源网络数据构建训练模型</p>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <el-icon><Cpu /></el-icon>
                    </div>
                    <h4>AI智能算法</h4>
                    <p>融合深度学习和时间序列分析技术</p>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <el-icon><Cloudy /></el-icon>
                    </div>
                    <h4>气象数据融合</h4>
                    <p>整合全球气象卫星实时数据</p>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <el-icon><Lock /></el-icon>
                    </div>
                    <h4>金融级安全</h4>
                    <p>端到端加密与数据隐私保护</p>
                </div>
            </div>
        </div>

        <!-- 客户证言 -->
        <div class="testimonial-section">
            <h2 class="section-title">客户证言</h2>
            <div class="testimonial">
                <div class="quote-icon">"</div>
                <p class="quote">
                    使用派诺智慧能源工具后，我们的能源分配效率显著提升，预测精度达到行业领先水平，每年节省大量能源成本。
                </p>
                <div class="client-info">
                    <div class="client-avatar"></div>
                    <div>
                        <p class="client-name">张华</p>
                        <p class="client-position">某大型制造企业能源总监</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import {
    TrendCharts,
    Sunny,
    Setting,
    Money,
    Warning,
    DataAnalysis,
    Cpu,
    Cloudy,
    Lock,
} from "@element-plus/icons-vue";

const hoverIndex = ref("");

const features = ref([
    {
        title: "负荷预测",
        description:
            "深挖历史数据规律，精准预测 D+1 24 小时逐时负荷，为售电公司撬动利润空间，助力微电网用户高效调度与科学管理",
        icon: TrendCharts,
        stats: ["行业领先", "高效分配", "广泛适用"],
        statLabels: ["预测精度", "能源优化", "应用范围"],
    },
    {
        title: "光伏发电预测",
        description:
            "动态工况精准识别，改进 Tansformer 架构，未来24小时发电功率预测为优化调度注入灵活动能",
        icon: Sunny,
        stats: ["精准可靠", "提升效率", "多云适应"],
        statLabels: ["预测质量", "效能提升", "环境适应"],
    },
    {
        title: "光储定容",
        description:
            "全天调度仿真与全生命周期成本评估，给出稳健的光伏与储能装机建议，辅助投决与尽调",
        icon: Setting,
        stats: ["优化设计", "长期收益", "稳定可靠"],
        statLabels: ["系统设计", "经济效益", "可靠性"],
    },
    {
        title: `慧储™套利模拟`,
        description:
            "提供全景化场景比对，量化评估储能项目投资效能，助力实现储能投资回报可衡量性与可预见性",
        icon: Money,
        stats: ["策略多样", "回报显著", "灵活配置"],
        statLabels: ["套利策略", "投资回报", "配置方案"],
    },
    {
        title: "设备健康预警",
        description:
            "实时监测设备运行状态，精准预警故障风险，延长设备生命周期，有效降低维护成本",
        icon: Warning,
        stats: ["实时监测", "风险预判", "延长寿命"],
        statLabels: ["监控能力", "风险预警", "设备寿命"],
    },
]);
</script>

<style lang="scss" scoped>
.features-container {
    background: linear-gradient(135deg, #f5f9ff 0%, #e6f0ff 100%);
    padding: 4rem 2rem;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #2c3e50;
    min-height: 100vh;
}

.intro-section {
    max-width: 1000px;
    margin: 0 auto 4rem;
    text-align: center;

    .intro-text {
        .title {
            color: #1d3b6c;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 30px;
            &::after {
                content: "";
                display: block;
                width: 600px;
                height: 4px;
                background: linear-gradient(90deg, #3a8ffe, #00c6ff);
                margin: 15px auto 0;
                border-radius: 2px;
            }
        }
        font-size: 1.25rem;
        line-height: 1.8;
        color: #4a6582;
        margin-top: 1.5rem;
        background: rgba(255, 255, 255, 0.7);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0, 0, 100, 0.05);
    }
}

.section-title {
    text-align: center;
    margin-bottom: 3rem;
    font-weight: 700;
    color: #1a3a5f;
    position: relative;

    &::after {
        content: "";
        display: block;
        width: 80px;
        height: 4px;
        background: linear-gradient(90deg, #3a8ffe, #00c6ff);
        margin: 0.5rem auto 0;
        border-radius: 2px;
    }
}

.features-grid {
    max-width: 1200px;
    margin: 0 auto;

    .row {
        transition: all 0.3s ease;
    }
}

.feature-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    height: 100%;
    box-shadow: 0 10px 30px rgba(0, 82, 204, 0.08);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
    border: 1px solid rgba(58, 143, 254, 0.1);

    &:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 35px rgba(0, 82, 204, 0.15);
        border-color: rgba(58, 143, 254, 0.3);
    }

    .card-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        background: linear-gradient(135deg, #e6f0ff 0%, #d0e3ff 100%);
        transition: all 0.3s ease;

        &.icon-hover {
            background: linear-gradient(135deg, #3a8ffe 0%, #00c6ff 100%);
        }

        .icon {
            width: 40px;
            height: 40px;
            color: #3a8ffe;
            transition: all 0.3s ease;
        }

        &.icon-hover .icon {
            color: white;
        }
    }

    .card-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a3a5f;
        text-align: center;
        margin-bottom: 1rem;
    }

    .card-desc {
        color: #4a6582;
        line-height: 1.7;
        margin-bottom: 0;
        min-height: 100px;
    }

    .card-stats {
        display: flex;
        justify-content: space-around;
        border-top: 1px solid rgba(58, 143, 254, 0.1);
        padding-top: 1.5rem;

        .stat-item {
            text-align: center;

            .stat-value {
                display: block;
                font-size: 1.4rem;
                font-weight: 700;
                color: #3a8ffe;
            }

            .stat-label {
                font-size: 0.85rem;
                color: #7a92b0;
            }
        }
    }
}

.tech-section {
    max-width: 1200px;
    margin: 6rem auto;

    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;

        .tech-item {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 82, 204, 0.05);
            transition: transform 0.3s ease;

            &:hover {
                transform: translateY(-5px);
            }

            .tech-icon {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: linear-gradient(135deg, #e6f0ff 0%, #d0e3ff 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;

                i {
                    font-size: 2rem;
                    color: #3a8ffe;
                }
            }

            h4 {
                font-weight: 700;
                color: #1a3a5f;
                margin-bottom: 0.75rem;
            }

            p {
                color: #7a92b0;
                margin: 0;
            }
        }
    }
}

.testimonial-section {
    max-width: 800px;
    margin: 6rem auto;

    .testimonial {
        background: white;
        border-radius: 16px;
        padding: 3rem;
        position: relative;
        box-shadow: 0 10px 30px rgba(0, 82, 204, 0.08);

        .quote-icon {
            position: absolute;
            top: 1.5rem;
            left: 2rem;
            font-size: 5rem;
            color: #e6f0ff;
            font-weight: 700;
            line-height: 1;
        }

        .quote {
            font-size: 1.25rem;
            line-height: 1.8;
            color: #4a6582;
            position: relative;
            z-index: 1;
            font-style: italic;
        }

        .client-info {
            display: flex;
            align-items: center;
            margin-top: 2rem;

            .client-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3a8ffe 0%, #00c6ff 100%);
                margin-right: 1rem;
            }

            .client-name {
                font-weight: 700;
                margin: 0;
                color: #1a3a5f;
            }

            .client-position {
                color: #7a92b0;
                margin: 0;
            }
        }
    }
}

.cta-section {
    margin: 4rem 0;

    .cta-button {
        background: linear-gradient(90deg, #3a8ffe, #00c6ff);
        border: none;
        padding: 1rem 3rem;
        font-size: 1.25rem;
        font-weight: 600;
        border-radius: 50px;
        transition: all 0.3s ease;
        box-shadow: 0 10px 20px rgba(58, 143, 254, 0.3);

        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px rgba(58, 143, 254, 0.4);
        }
    }

    .cta-note {
        color: #7a92b0;
        margin-top: 1rem;
    }
}

@media (max-width: 992px) {
    .intro-section {
        padding: 0 1rem;
    }

    .feature-card {
        padding: 1.5rem;

        .card-desc {
            min-height: auto;
        }
    }
}

@media (max-width: 768px) {
    .features-container {
        padding: 2rem 1rem;
    }

    .intro-section {
        .display-4 {
            font-size: 2rem;
        }

        .lead {
            font-size: 1rem;
        }
    }

    .testimonial {
        padding: 2rem 1.5rem !important;
    }
}
</style>
