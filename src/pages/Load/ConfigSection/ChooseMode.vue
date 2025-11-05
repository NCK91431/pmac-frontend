<template>
    <div class="choose-mode-container">
        <!-- 标题 Start -->
        <div class="section-title">
            <i class="bi bi-cursor"></i>
            <h3>请选择预测模式</h3>
        </div>
        <div class="mode-selection">
            <!-- 总负荷预测 -->
            <div
                class="mode-card total-mode"
                :class="{ clicked: isAnimatingT }"
                @click="selectMode('T')"
                @mouseenter="hoverT = true"
                @mouseleave="hoverT = false"
            >
                <div class="card-border"></div>
                <div class="card-background"></div>
                <div class="mode-content">
                    <h3 class="mode-title">总负荷预测</h3>
                    <ul class="mode-description">
                        <li>
                            <i class="bi bi-building"></i>
                            适用于<strong>售电公司</strong>、<strong
                                >电网企业</strong
                            >
                        </li>
                        <li>
                            <i class="bi bi-graph-up"></i>
                            需要对<strong>整体负荷</strong>进行预测的用户
                        </li>
                        <li>
                            <i class="bi bi-eye"></i>
                            宏观把握电力需求趋势
                        </li>
                    </ul>
                    <div class="select-indicator" :class="{ visible: hoverT }">
                        <span>立即开始</span>
                        <i class="bi bi-arrow-right-circle"></i>
                    </div>
                </div>
                <div class="card-glow" :class="{ active: hoverT }"></div>
            </div>

            <!-- 分项负荷预测 -->
            <div
                class="mode-card subitem-mode"
                :class="{ clicked: isAnimatingS }"
                @click="selectMode('S')"
                @mouseenter="hoverS = true"
                @mouseleave="hoverS = false"
            >
                <div class="card-border"></div>
                <div class="card-background"></div>
                <div class="mode-content">
                    <h3 class="mode-title">分项负荷预测</h3>
                    <ul class="mode-description">
                        <li>
                            <i class="bi bi-columns-gap"></i>
                            适用于<strong>单个用电用户</strong>
                        </li>
                        <li>
                            <i class="bi bi-gear"></i>
                            <strong>精细化</strong>预测场景
                        </li>
                        <li>
                            <i class="bi bi-bar-chart"></i>
                            深入理解用电结构
                        </li>
                    </ul>
                    <div class="select-indicator" :class="{ visible: hoverS }">
                        <span>立即开始</span>
                        <i class="bi bi-arrow-right-circle"></i>
                    </div>
                </div>
                <div class="card-glow" :class="{ active: hoverS }"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useLoadForecastStore } from "@/store/load";

const forecastStore = useLoadForecastStore();

const hoverT = ref(false);
const hoverS = ref(false);
const isAnimatingT = ref(false);
const isAnimatingS = ref(false);

const selectMode = (mode) => {
    if (mode === "T") {
        isAnimatingT.value = true;
    } else {
        isAnimatingS.value = true;
    }

    // 动画持续时间后设置模式并跳转
    setTimeout(() => {
        forecastStore.setMode(mode);
        forecastStore.setStageZero();

        // 重置动画状态
        isAnimatingT.value = false;
        isAnimatingS.value = false;
    }, 400);
};
</script>

<style lang="scss" scoped>
/* 标题样式 */
.choose-mode-container {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    align-items: center;
}

.section-title {
    text-align: center;
    margin-bottom: 3rem;
    display: flex;
    align-items: center;
    gap: 1rem;

    i {
        font-size: 2.1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: icon-pulse 2s ease-in-out infinite;
        transform: rotate(135deg); // 永久旋转180度
    }

    h3 {
        font-size: 2rem;
        background: linear-gradient(90deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-weight: 700;
        letter-spacing: 1px;
        margin: 0;
    }
}

@keyframes icon-pulse {
    0%,
    100% {
        transform: rotate(135deg) scale(1);
    }
    50% {
        transform: rotate(135deg) scale(1.1);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .section-title {
        flex-direction: column;
        gap: 0.5rem;

        i {
            font-size: 2.2rem;
        }

        h1 {
            font-size: 2rem;
        }
    }
}

@media (max-width: 480px) {
    .section-title {
        i {
            font-size: 1.8rem;
        }

        h1 {
            font-size: 1.6rem;
        }
    }
}

/* 卡片样式 */
.mode-selection {
    display: flex;
    max-width: 1200px;
    width: 100%;
    justify-content: space-evenly;
    flex-wrap: wrap;
}

.mode-card {
    position: relative;
    width: 380px;
    height: 480px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transform: translateY(0);
}

.mode-card:hover {
    transform: translateY(-15px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

/* 总负荷预测卡片样式 */
.total-mode {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

/* 分项负荷预测卡片样式 */
.subitem-mode {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.card-border {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: transparent;
    z-index: 1;
    transition: all 0.4s ease;
    border: 2px solid transparent;
}

.mode-card:hover .card-border {
    border: 2px solid rgba(255, 255, 255, 0.7);
}

.card-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    z-index: 0;
}

.mode-content {
    position: relative;
    z-index: 2;
    padding: 2.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.mode-title {
    font-size: 2.1rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(90deg, #1565c0, #42a5f5);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 700;
    text-align: center;
    letter-spacing: 1px;
    position: relative;
    padding-bottom: 0.5rem;
}

.mode-title::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 70%;
    height: 3px;
    background: linear-gradient(90deg, #1565c0, #42a5f5);
    border-radius: 2px;
}

.subitem-mode .mode-title {
    background: linear-gradient(90deg, #2e7d32, #4caf50);
    -webkit-background-clip: text;
    background-clip: text;
}

.subitem-mode .mode-title::after {
    background: linear-gradient(90deg, #2e7d32, #4caf50);
}

.mode-description {
    list-style: none;
    padding: 0;
    margin: 2rem 0;
    flex-grow: 1;
}

.mode-description li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    line-height: 1.5;
    color: #37474f;
}

.mode-description li i {
    margin-right: 0.8rem;
    font-size: 1.3rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.total-mode .mode-description li i {
    color: #1565c0;
}

.subitem-mode .mode-description li i {
    color: #2e7d32;
}

.mode-description li strong {
    color: #263238;
    font-weight: 600;
}

.select-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50px;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.5);
    opacity: 1;
    transform: translateY(0);
}
.total-mode .select-indicator {
    color: #1565c0;
}
.subitem-mode .select-indicator {
    color: #2e7d32;
}

.select-indicator:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.select-indicator i {
    font-size: 1.3rem;
    transition: transform 0.3s ease;
}

.select-indicator:hover i {
    transform: translateX(5px);
}

.card-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: radial-gradient(
        circle at center,
        rgba(255, 255, 255, 0.4) 0%,
        transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 1;
}

.card-glow.active {
    opacity: 1;
}

/* 右上角动画装饰元素 */
.mode-card::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        45deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
    );
    transform: rotate(45deg);
    z-index: 1;
    animation: shine 8s infinite linear;
    pointer-events: none;
}

@keyframes shine {
    0% {
        transform: rotate(45deg) translateX(-100%) translateY(-100%);
    }
    100% {
        transform: rotate(45deg) translateX(100%) translateY(100%);
    }
}

/* 点击动画 */
.mode-card.clicked {
    animation: click-pulse 0.4s ease;
}

@keyframes click-pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(0.95);
    }
    100% {
        transform: scale(1);
    }
}

/* 响应式设计 */
@media (max-width: 900px) {
    .mode-selection {
        flex-direction: column;
        align-items: center;
    }

    .mode-card {
        width: 100%;
        max-width: 450px;
    }
}

@media (max-width: 480px) {
    .mode-content {
        padding: 1.5rem;
    }

    .mode-title {
        font-size: 1.8rem;
    }

    .mode-description li {
        font-size: 1rem;
    }
}
</style>
