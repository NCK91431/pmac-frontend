<!-- ProductAdvertisement.vue -->
<template>
    <div class="product-advertisement">
        <div class="ad-container">
            <div class="product-visual">
                <div class="image-wrapper">
                    <img
                        :src="product.imageUrl"
                        :alt="product.title"
                        class="product-image"
                    />
                    <div class="floating-particle particle-1"></div>
                    <div class="floating-particle particle-2"></div>
                    <div class="floating-particle particle-3"></div>
                </div>
            </div>
            <div class="product-content">
                <div class="content-wrapper">
                    <div class="title-section">
                        <div class="badge" v-if="product.badge">
                            {{ product.badge }}
                        </div>
                        <h3 class="product-title">{{ product.title }}</h3>
                    </div>
                    <p class="product-desc">{{ product.description }}</p>

                    <div class="features-grid">
                        <div
                            v-for="(feature, index) in product.features"
                            :key="index"
                            class="feature-item"
                        >
                            <div class="feature-icon">
                                <i :class="feature.icon"></i>
                            </div>
                            <div class="feature-content">
                                <span class="feature-title">{{
                                    feature.title
                                }}</span>
                                <span class="feature-subtitle">{{
                                    feature.subtitle
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <button class="cta-button" @click="handleButtonClick">
                        <span class="button-text">{{ buttonText }}</span>
                        <div class="button-arrow">
                            <i class="bi bi-arrow-up-right"></i>
                        </div>
                        <div class="button-glow"></div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    product: {
        type: Object,
        required: true,
        default: () => ({
            imageUrl: "",
            title: "",
            description: "",
            badge: "",
            features: [],
        }),
    },
    buttonText: {
        type: String,
        default: "探索产品详情",
    },
});

const emit = defineEmits(["button-click"]);

const handleButtonClick = () => {
    emit("button-click");
};
</script>

<style lang="scss" scoped>
.product-advertisement {
    margin-bottom: 30px;

    .ad-container {
        height: 100%;
        background: linear-gradient(
            135deg,
            #f8fafc 0%,
            #e2e8f0 50%,
            #f1f5f9 100%
        );
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        position: relative;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(20px);

        // 自动动画效果
        animation: containerFloat 8s ease-in-out infinite;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.8) 0%,
                rgba(255, 255, 255, 0.4) 50%,
                rgba(255, 255, 255, 0.6) 100%
            );
            z-index: 1;
        }
    }

    .product-visual {
        flex: 0 0 45%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 30px;
        z-index: 2;

        .image-wrapper {
            position: relative;
            width: 300px;
            height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;

            .product-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 12px 36px rgba(0, 0, 0, 0.15));
                animation: imageFloat 6s ease-in-out infinite;
                z-index: 2;
                position: relative;
            }

            .floating-particle {
                position: absolute;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                opacity: 0.1;
                animation: particleFloat 4s ease-in-out infinite;

                &.particle-1 {
                    width: 60px;
                    height: 60px;
                    top: 10%;
                    left: 15%;
                    animation-delay: 0s;
                }

                &.particle-2 {
                    width: 40px;
                    height: 40px;
                    bottom: 20%;
                    right: 20%;
                    animation-delay: 1.5s;
                    background: linear-gradient(135deg, #10b981, #06b6d4);
                }

                &.particle-3 {
                    width: 30px;
                    height: 30px;
                    top: 60%;
                    left: 10%;
                    animation-delay: 3s;
                    background: linear-gradient(135deg, #f59e0b, #ef4444);
                }
            }
        }
    }

    .product-content {
        flex: 1;
        padding: 40px;
        display: flex;
        align-items: center;
        color: #1e293b;
        z-index: 2;

        .content-wrapper {
            max-width: 500px;

            .title-section {
                margin-bottom: 20px;

                .badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    animation: badgePulse 2s ease-in-out infinite;
                }

                .product-title {
                    font-size: 32px;
                    font-weight: 700;
                    margin: 0;
                    background: linear-gradient(
                        125deg,
                        #1a56db 0%,
                        #7e22ce 70%,
                        #ec4899 100%
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1.2;
                    animation: titleSlideIn 1s ease-out;
                }
            }

            .product-desc {
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 28px;
                color: #64748b;
                animation: fadeInUp 0.8s ease 0.3s forwards;
                opacity: 0;
            }

            .features-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin-bottom: 32px;

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    animation: featureSlideIn 0.6s ease-out;
                    animation-fill-mode: both;

                    &:nth-child(1) {
                        animation-delay: 0.4s;
                    }
                    &:nth-child(2) {
                        animation-delay: 0.5s;
                    }
                    &:nth-child(3) {
                        animation-delay: 0.6s;
                    }
                    &:nth-child(4) {
                        animation-delay: 0.7s;
                    }

                    .feature-icon {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        border-radius: 10px;
                        color: white;
                        font-size: 18px;

                        i {
                            animation: iconBounce 2s ease-in-out infinite;
                        }
                    }

                    .feature-content {
                        display: flex;
                        flex-direction: column;

                        .feature-title {
                            font-weight: 600;
                            color: #1e293b;
                            font-size: 14px;
                        }

                        .feature-subtitle {
                            font-size: 12px;
                            color: #64748b;
                            margin-top: 2px;
                        }
                    }
                }
            }

            .cta-button {
                position: relative;
                display: inline-flex;
                align-items: center;
                gap: 12px;
                padding: 14px 28px;
                background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
                border: none;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                overflow: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 8px 24px rgba(30, 41, 59, 0.2);
                animation: buttonSlideIn 0.8s ease 0.8s forwards;
                opacity: 0;
                transform: translateY(20px);

                .button-glow {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    transition: left 0.6s ease;
                }

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 32px rgba(30, 41, 59, 0.3);

                    .button-glow {
                        left: 100%;
                    }

                    .button-arrow {
                        transform: translate(2px, -2px);
                    }
                }

                .button-arrow {
                    transition: transform 0.3s ease;
                }
            }
        }
    }
}

// 关键帧动画
@keyframes containerFloat {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-8px);
    }
}

@keyframes imageFloat {
    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }
    33% {
        transform: translateY(-6px) rotate(0.5deg);
    }
    66% {
        transform: translateY(4px) rotate(-0.5deg);
    }
}

@keyframes particleFloat {
    0%,
    100% {
        transform: translateY(0px) scale(1);
        opacity: 0.1;
    }
    50% {
        transform: translateY(-20px) scale(1.1);
        opacity: 0.15;
    }
}

@keyframes badgePulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@keyframes titleSlideIn {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes featureSlideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes buttonSlideIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes iconBounce {
    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-3px);
    }
    60% {
        transform: translateY(-2px);
    }
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
    from {
        opacity: 0;
        transform: translateY(20px);
    }
}

// 响应式设计
@media (max-width: 1024px) {
    .product-advertisement {
        height: auto;
        min-height: 240px;

        .ad-container {
            flex-direction: column;
            height: auto;

            .product-visual {
                flex: none;
                height: 180px;
                padding: 20px;

                .image-wrapper {
                    width: 220px;
                    height: 160px;
                }
            }

            .product-content {
                padding: 30px;

                .content-wrapper {
                    .title-section .product-title {
                        font-size: 26px;
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .product-advertisement {
        .ad-container {
            .product-content {
                .content-wrapper {
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                }
            }
        }
    }
}
</style>
