<!-- 收益展示组件 -->
<template>
    <section class="case-studies section-padding">
        <div class="container">
            <!-- 部分标题 -->
            <div class="section-header text-center" ref="sectionHeader">
                <h2 class="section-title gradient-text">
                    收益展示：看看别人赚了多少
                </h2>
                <p class="section-subtitle">真实案例，震撼收益，让数据说话</p>
            </div>

            <!-- 案例展示 -->
            <div class="cases-container">
                <div
                    v-for="(caseItem, index) in cases"
                    :key="caseItem.id"
                    class="case-card"
                    :class="{ reverse: index % 2 === 1 }"
                    :ref="(el) => (caseCards[caseItem.id] = el)"
                >
                    <div class="case-image">
                        <!-- <img :src="caseItem.image" :alt="caseItem.title" /> -->
                        <div class="case-badge">
                            <span class="badge-text"
                                >年收益提升 {{ caseItem.profitIncrease }}</span
                            >
                        </div>
                    </div>
                    <div class="case-content">
                        <div class="case-header">
                            <h3 class="case-title">{{ caseItem.title }}</h3>
                            <div class="case-location">
                                <i class="bi bi-geo-alt"></i>
                                {{ caseItem.location }}
                            </div>
                        </div>

                        <div class="case-resources">
                            <h4 class="resources-title">资源设备</h4>
                            <div class="resources-tags">
                                <span
                                    v-for="resource in caseItem.resources"
                                    :key="resource"
                                    class="resource-tag"
                                >
                                    {{ resource }}
                                </span>
                            </div>
                        </div>

                        <div class="case-service">
                            <h4 class="service-title">我们的服务</h4>
                            <p class="service-description">
                                {{ caseItem.service }}
                            </p>
                        </div>

                        <div class="case-results">
                            <h4 class="results-title">收益成果</h4>
                            <div class="results-stats">
                                <div
                                    class="stat-item"
                                    v-for="stat in caseItem.stats"
                                    :key="stat.label"
                                >
                                    <div
                                        class="stat-value"
                                        :ref="
                                            (el) =>
                                                (statValues[
                                                    `${caseItem.id}-${stat.label}`
                                                ] = el)
                                        "
                                    >
                                        {{ stat.value }}
                                    </div>
                                    <div class="stat-label">
                                        {{ stat.label }}
                                    </div>
                                </div>
                            </div>

                            <!-- 收益图表容器 -->
                            <div
                                class="profit-chart"
                                :id="`chart-${caseItem.id}`"
                                v-if="caseItem.chartData"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 统计数据 -->
            <div class="stats-summary" ref="statsSummary">
                <div class="summary-card">
                    <div class="summary-content">
                        <h3 class="summary-title">
                            加入派诺虚拟电厂的共同收获
                        </h3>
                        <div class="summary-grid">
                            <div
                                v-for="stat in summaryStats"
                                :key="stat.id"
                                class="summary-stat"
                            >
                                <div
                                    class="summary-value"
                                    :ref="(el) => (summaryValues[stat.id] = el)"
                                >
                                    {{ stat.value }}
                                </div>
                                <div class="summary-label">
                                    {{ stat.label }}
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
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as echarts from "echarts";

gsap.registerPlugin(ScrollTrigger);

// 案例数据
const cases = ref([
    {
        id: 1,
        title: '"粤能投”虚拟电厂"',
        location: "广东省，广州市",
        image: "https://pmac.leyi.host/downloads/pmac/products/EGate10.png",
        profitIncrease: "38%",
        resources: ["厂房空调系统", "屋顶光伏"],
        service: "代理参与需求响应，自动调度空调负荷",
        stats: [
            { label: "参与次数", value: "28次" },
            { label: "补贴净收益", value: "¥120万" },
            { label: "占电费比例", value: "15%" },
        ],
    },
    {
        id: 2,
        title: "澳洲电力交易市场极端电价日",
        location: "澳大利亚，悉尼",
        image: "https://pmac.leyi.host/downloads/pmac/products/EGate10.png",
        profitIncrease: "52%",
        resources: ["261kWh储能系统", "120kW光伏"],
        service: "全自动参与现货市场套利",
        stats: [
            { label: "极端日收益", value: "$1,664" },
            { label: "月均收益", value: "$8,200" },
            { label: "投资回收期", value: "3.2年" },
        ],
        chartData: {
            xAxis: ["1月", "2月", "3月", "4月", "5月", "6月"],
            series: [4200, 5800, 6200, 7800, 8200, 16640],
        },
    },
    {
        id: 3,
        title: "重庆楼宇空调聚合项目",
        location: "重庆市，渝中区",
        image: "https://pmac.leyi.host/downloads/pmac/products/EGate10.png",
        profitIncrease: "41%",
        resources: ["中央空调系统", "智能照明"],
        service: "柔性调控参与电网调峰",
        stats: [
            { label: "年节省电费", value: "¥65万" },
            { label: "补贴收入", value: "¥28万" },
            { label: "投资回收期", value: "2.8年" },
        ],
    },
]);

// 统计数据
const summaryStats = ref([
    { id: 1, value: "15-45%", label: "年收益提升幅度" },
    { id: 2, value: "2-4年", label: "平均投资回收期" },
    { id: 3, value: "100%", label: "政策合规保障" },
    { id: 4, value: "0", label: "前期投入成本" },
]);

// 引用
const sectionHeader = ref(null);
const caseCards = ref({});
const statValues = ref({});
const statsSummary = ref(null);
const summaryValues = ref({});

// 图表实例存储
const chartInstances = ref({});

// 初始化图表
const initCharts = () => {
    cases.value.forEach((caseItem) => {
        if (caseItem.chartData) {
            const chartId = `chart-${caseItem.id}`;
            const chartDom = document.getElementById(chartId);

            if (chartDom) {
                const chart = echarts.init(chartDom);
                chartInstances.value[caseItem.id] = chart;

                const option = {
                    grid: {
                        left: "10%",
                        right: "10%",
                        bottom: "15%",
                        top: "15%",
                        containLabel: true,
                    },
                    xAxis: {
                        type: "category",
                        data: caseItem.chartData.xAxis,
                        axisLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,0.3)",
                            },
                        },
                        axisLabel: {
                            color: "#a0aec0",
                        },
                    },
                    yAxis: {
                        type: "value",
                        axisLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,0.3)",
                            },
                        },
                        axisLabel: {
                            color: "#a0aec0",
                            formatter: "${value}",
                        },
                        splitLine: {
                            lineStyle: {
                                color: "rgba(255,255,255,0.1)",
                            },
                        },
                    },
                    series: [
                        {
                            data: caseItem.chartData.series,
                            type: "bar",
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(
                                    0,
                                    0,
                                    0,
                                    1,
                                    [
                                        { offset: 0, color: "#00c6ff" },
                                        { offset: 1, color: "#0072ff" },
                                    ],
                                ),
                            },
                            barWidth: "40%",
                        },
                    ],
                    tooltip: {
                        trigger: "axis",
                        formatter: "月收益: <b>${c0}</b>",
                        backgroundColor: "rgba(0,0,0,0.8)",
                        borderColor: "#00c6ff",
                        textStyle: {
                            color: "#fff",
                        },
                    },
                };

                chart.setOption(option);

                // 图表动画
                gsap.from(chartDom, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 1,
                    delay: 0.5,
                    scrollTrigger: {
                        trigger: chartDom,
                        start: "top 80%",
                        end: "bottom 20%",
                    },
                });
            }
        }
    });
};

// 创建统计数字动画
const createStatAnimations = () => {
    // 案例统计数字
    Object.values(statValues.value).forEach((el) => {
        if (el) {
            const originalText = el.textContent;
            if (originalText.match(/\d+/)) {
                gsap.from(el, {
                    innerText: 0,
                    duration: 2,
                    snap: { innerText: 1 },
                    scrollTrigger: {
                        trigger: el.closest(".case-card"),
                        start: "top 80%",
                        end: "bottom 20%",
                    },
                });
            }
        }
    });

    // 汇总统计数字
    Object.values(summaryValues.value).forEach((el, index) => {
        if (el) {
            gsap.from(el, {
                innerText: 0,
                duration: 2,
                delay: index * 0.2,
                snap: { innerText: 1 },
                scrollTrigger: {
                    trigger: statsSummary.value,
                    start: "top 80%",
                    end: "bottom 20%",
                },
            });
        }
    });
};

// 创建案例卡片动画
const createCaseAnimations = () => {
    Object.values(caseCards.value).forEach((card, index) => {
        if (card) {
            gsap.from(card, {
                x: index % 2 === 0 ? -100 : 100,
                opacity: 0,
                duration: 1,
                delay: index * 0.2,
                scrollTrigger: {
                    trigger: card,
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

    // 初始化图表和动画
    setTimeout(() => {
        initCharts();
        createStatAnimations();
        createCaseAnimations();
    }, 100);
});

// 组件销毁时清理图表
onUnmounted(() => {
    Object.values(chartInstances.value).forEach((chart) => {
        if (chart) {
            chart.dispose();
        }
    });
});
</script>

<style scoped>
.case-studies {
    position: relative;
    padding: 100px 0;
    background: #ffffff;
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

.cases-container {
    max-width: 1200px;
    margin: 0 auto;
}

.case-card {
    display: flex;
    background: #f9f9f9;
    border-radius: 30px;
    overflow: hidden;
    margin-bottom: 60px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
}

.case-card:hover {
    transform: translateY(-10px);
    border-color: #00c6ff;
    box-shadow: 0 30px 60px -20px rgba(0, 114, 255, 0.3);
}

.case-card.reverse {
    flex-direction: row-reverse;
}

.case-image {
    flex: 1;
    position: relative;
    min-height: 400px;
    overflow: hidden;
    background: #e2e8f0;
}

.case-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.case-card:hover .case-image img {
    transform: scale(1.05);
}

.case-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #00c6ff 0%, #0072ff 100%);
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    box-shadow: 0 10px 20px rgba(0, 114, 255, 0.3);
    color: white;
}

.case-content {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
}

.case-header {
    margin-bottom: 30px;
}

.case-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: #0072ff;
}

.case-location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #475569;
    font-size: 0.9rem;
}

.case-resources {
    margin-bottom: 25px;
}

.resources-title {
    font-size: 1.1rem;
    margin-bottom: 15px;

}

.resources-title,.service-title,.results-title{
	background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	letter-spacing: -0.3px;
}

.resources-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.resource-tag {
    padding: 8px 16px;
    background: #e6f0ff;
    border-radius: 20px;
    font-size: 0.9rem;
    color: #0072ff;
}

.case-service {
    margin-bottom: 30px;
}

.service-title {
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: #1e293b;
}

.service-description {
    color: #475569;
    line-height: 1.6;
}

.case-results {
    margin-top: auto;
}

.results-title {
    font-size: 1.1rem;
    margin-bottom: 20px;
    color: #1e293b;
}

.results-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.stat-item {
    text-align: center;
    padding: 20px 10px;
    background: #ffffff;
    border-radius: 15px;
    border: 1px solid #e2e8f0;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 5px;
    background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-label {
    font-size: 0.9rem;
    color: #475569;
}

.profit-chart {
    height: 200px;
    width: 100%;
    margin-top: 20px;
}

.stats-summary {
    margin-top: 100px;
}

.summary-card {
    background: linear-gradient(135deg, rgba(0, 114, 255, 0.05) 0%, rgba(0, 198, 255, 0.05) 100%);
    border-radius: 30px;
    padding: 60px;
    border: 1px solid rgba(0, 198, 255, 0.3);
    position: relative;
    overflow: hidden;
}

.summary-card::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 198, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
}

@keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.summary-content {
    position: relative;
    z-index: 2;
}

.summary-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 50px;
    color: #1e293b;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
}

.summary-stat {
    text-align: center;
}

.summary-value {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 10px;
    background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.summary-label {
    font-size: 1.1rem;
    color: #1e293b;
}

@media (max-width: 992px) {
    .case-card {
        flex-direction: column;
    }
    .case-card.reverse {
        flex-direction: column;
    }
    .case-image {
        min-height: 300px;
    }
    .results-stats {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .section-title {
        font-size: 2rem;
    }
    .case-content {
        padding: 25px;
    }
    .summary-card {
        padding: 40px 20px;
    }
    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }
    .summary-value {
        font-size: 2.5rem;
    }
}
</style>