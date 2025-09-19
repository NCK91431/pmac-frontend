<template>
    <div class="banner-container">
        <div class="feature-banner">
            <div class="banner-content">
                <h2>光伏发电预测</h2>
                <p>对未来24小时发电功率进行准确预测，为优化调度注入灵活动能</p>
            </div>

            <div class="button-container">
                <button class="start-button" @click="gotoLoadPrediction">
                    立即体验 <i class="fas fa-arrow-right"></i>
                </button>
            </div>

            <div class="banner-decoration">
                <div class="floating-item circle item-1"></div>
                <div class="floating-item square item-2"></div>
                <div class="floating-item triangle item-3"></div>
                <div class="floating-item circle item-4"></div>

                <div class="sparkle sparkle-1">✨</div>
                <div class="sparkle sparkle-2">✨</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const gotoLoadPrediction = () => {
    router.push({ name: "elec" });
};

// 添加文字动画效果
import { onMounted } from "vue";

onMounted(() => {
    const heading = document.querySelector(".banner-content h2");
    if (heading) {
        const text = heading.textContent;
        heading.innerHTML = "";

        for (let i = 0; i < text.length; i++) {
            setTimeout(function () {
                heading.innerHTML += text[i];
            }, i * 80);
        }
    }
});
</script>

<style scoped>
.banner-container {
    width: 100%;
    margin-bottom: 24px;
}

.feature-banner {
    position: relative;
    height: 150px;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    color: white;
}

.banner-content {
    position: relative;
    z-index: 2;
    max-width: 600px;
    animation: fadeInLeft 1s ease-out;
}

.banner-content h2 {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 8px;
    color: #ffffff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    position: relative;
}

.banner-content h2::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #ff9a9e, #fad0c4, #a18cd1, #fbc2eb);
    background-size: 200% 100%;
    animation: gradientMove 3s infinite linear;
}

.banner-content p {
    font-size: 18px;
    margin-bottom: 0;
    opacity: 0.9;
    font-weight: 500;
    color: #e6e6ff;
}

.button-container {
    position: relative;
    z-index: 2;
    animation: fadeInRight 1s ease-out;
}

.start-button {
    padding: 14px 36px;
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: #1a3a5f;
    border: none;
    border-radius: 6px;
    font-weight: 700;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(67, 233, 123, 0.5);
    position: relative;
    overflow: hidden;
    z-index: 2;
    letter-spacing: 1px;
    text-transform: uppercase;
}

.start-button:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(67, 233, 123, 0.7);
    animation: pulse 1s infinite;
}

.start-button:active {
    transform: translateY(0);
}

.start-button::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
        to bottom right,
        rgba(255, 255, 255, 0.2),
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.05),
        transparent
    );
    transform: rotate(45deg);
    animation: shine 3s infinite;
}

.start-button i {
    margin-left: 8px;
    transition: transform 0.3s ease;
}

.start-button:hover i {
    transform: translateX(5px);
}

.banner-decoration {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    pointer-events: none;
}

.floating-item {
    position: absolute;
    animation: float 6s ease-in-out infinite;
}

.circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
}

.square {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
}

.triangle {
    width: 0;
    height: 0;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
    border-bottom: 50px solid rgba(255, 255, 255, 0.1);
}

.item-1 {
    top: -20px;
    right: 100px;
    animation-delay: 0s;
}

.item-2 {
    top: 40px;
    right: 250px;
    animation-delay: 1s;
}

.item-3 {
    bottom: -20px;
    right: 180px;
    animation-delay: 2s;
}

.item-4 {
    bottom: 20px;
    right: 350px;
    animation-delay: 3s;
}

.sparkle {
    position: absolute;
    font-size: 24px;
    opacity: 0.7;
    animation: sparkle 2s infinite;
}

.sparkle-1 {
    top: 30px;
    left: 180px;
    animation-delay: 0.5s;
}

.sparkle-2 {
    top: 60px;
    left: 250px;
    animation-delay: 1.2s;
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }
    50% {
        transform: translateY(-15px) rotate(10deg);
    }
}

@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes gradientMove {
    0% {
        background-position: 0% 50%;
    }
    100% {
        background-position: 200% 50%;
    }
}

@keyframes sparkle {
    0%,
    100% {
        opacity: 0;
        transform: scale(0.5);
    }
    50% {
        opacity: 0.8;
        transform: scale(1.2);
    }
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(67, 233, 123, 0.7);
    }
    70% {
        box-shadow: 0 0 0 15px rgba(67, 233, 123, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(67, 233, 123, 0);
    }
}

@keyframes shine {
    0% {
        transform: translateX(-100%) rotate(45deg);
    }
    100% {
        transform: translateX(100%) rotate(45deg);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .feature-banner {
        height: 180px;
        padding: 0 20px;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }

    .banner-content {
        max-width: 100%;
        margin-bottom: 20px;
    }

    .banner-content h2 {
        font-size: 24px;
    }

    .banner-content p {
        font-size: 16px;
    }

    .floating-item {
        display: none;
    }
}
</style>
