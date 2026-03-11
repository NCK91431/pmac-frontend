<template>
  <section class="vpp-hero">
    <!-- 背景网格与光晕装饰 -->
    <div class="hero-bg-grid"></div>
    <div class="hero-glow-orb orb1"></div>
    <div class="hero-glow-orb orb2"></div>

    <div class="hero-container">
      <!-- 左侧文字内容 + 入口 -->
      <div class="hero-text">
        <!-- 微型标题 + 闪电图标 -->
        <div class="hero-mini-title">
          <svg class="mini-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" :fill="`url(#${gradMiniId})`" stroke="white" stroke-width="0.8"/>
            <defs>
              <linearGradient :id="gradMiniId" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#4facfe"/>
                <stop offset="100%" stop-color="#00f2fe"/>
              </linearGradient>
            </defs>
          </svg>
          <span>VPP 2.0 · 派诺虚拟电厂</span>
        </div>

        <!-- 主标题 (渐变+阴影) -->
        <h1 class="hero-main-title">
          虚拟电厂
          <span class="gradient-text">超脑平台</span>
        </h1>

        <!-- 副标题 + 装饰线 -->
        <div class="hero-subtitle-wrapper">
          <h2 class="hero-subtitle">分布式聚合 · 动态优化 · 可信交易</h2>
          <div class="subtitle-decoration"></div>
        </div>

        <!-- 描述文字 -->
        <p class="hero-description">
          基于数字孪生与AI预测，实现分布式资源毫秒级响应、智能调度与电力辅助服务，
          构建高弹性虚拟电厂生态，加速零碳未来。
        </p>

        <!-- 了解详情入口 -->
        <div class="cta-block" @click="$emit('jump')">
          <a href="#" class="cta-button">
            <span>了解详情</span>
            <svg class="btn-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <span class="cta-glow"></span>
        </div>
      </div>

      <!-- 右侧大图片区域 (无圆角) + 浮动科技装饰 -->
      <div class="hero-image-wrapper">
        <div class="image-glow-backdrop"></div>
        <img
          class="vpp-screenshot"
          src="https://pmac.leyi.host/downloads/pmac/pilot-vpp.png"
          alt="虚拟电厂平台截图"
          loading="lazy"
        />
        <!-- 装饰性浮动图标 (线条/科技点) -->
        <svg class="floating-deco deco-1" width="120" height="120" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" :stroke="`url(#${decoGrad1Id})`" stroke-width="0.8" stroke-dasharray="6 6" />
          <circle cx="50" cy="50" r="25" :stroke="`url(#${decoGrad1Id})`" stroke-width="0.6" stroke-dasharray="4 8" />
          <defs>
            <linearGradient :id="decoGrad1Id" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4facfe" stop-opacity="0.6"/>
              <stop offset="100%" stop-color="#00f2fe" stop-opacity="0.3"/>
            </linearGradient>
          </defs>
        </svg>
        <svg class="floating-deco deco-2" width="80" height="80" viewBox="0 0 100 100" fill="none">
          <path d="M20 50 L50 20 L80 50 L50 80 Z" :stroke="`url(#${decoGrad2Id})`" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
          <defs>
            <linearGradient :id="decoGrad2Id" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#a1c4fd" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#c2e9fb" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
        </svg>
        <!-- 微小的数据点 -->
        <span class="data-dot dot1"></span>
        <span class="data-dot dot2"></span>
        <span class="data-dot dot3"></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

// 生成唯一ID，避免多个组件实例时SVG渐变ID冲突
const gradMiniId = `gradMini_${Math.random().toString(36).substr(2, 8)}`
const decoGrad1Id = `decoGrad1_${Math.random().toString(36).substr(2, 8)}`
const decoGrad2Id = `decoGrad2_${Math.random().toString(36).substr(2, 8)}`

// 用于清理GSAP动画的上下文
let gsapContext

onMounted(() => {
  // 创建GSAP上下文，便于一次性清理所有动画
  gsapContext = gsap.context(() => {
    // 入场时间线
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 初始状态
    gsap.set('.hero-mini-title, .hero-main-title, .hero-subtitle-wrapper, .hero-description, .cta-block', {
      opacity: 0,
      y: 30
    })
    gsap.set('.hero-image-wrapper', { opacity: 0, x: 50 })
    gsap.set('.floating-deco, .data-dot', { opacity: 0, scale: 0.5 })

    // 入场动画
    tl.to('.hero-mini-title', { opacity: 1, y: 0, duration: 0.6 })
      .to('.hero-main-title', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .to('.hero-subtitle-wrapper', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
      .to('.hero-description', { opacity: 1, y: 0, duration: 0.7 }, '-=0.1')
      .to('.cta-block', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
      .to('.hero-image-wrapper', { opacity: 1, x: 0, duration: 1.2, ease: 'power2.out' }, '-=0.8')
      .to('.floating-deco, .data-dot', { opacity: 1, scale: 1, stagger: 0.1, duration: 0.8 }, '-=0.5')

    // 持续动画：图片浮动
    gsap.to('.hero-image-wrapper', {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // 装饰环旋转
    gsap.to('.deco-1', {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: 'none'
    })
    gsap.to('.deco-2', {
      rotation: -360,
      duration: 25,
      repeat: -1,
      ease: 'none'
    })

    // 背景光晕缩放
    gsap.to('.image-glow-backdrop', {
      scale: 1.2,
      opacity: 0.7,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // 数据点闪烁
    gsap.to('.dot1', {
      opacity: 0.3,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })
    gsap.to('.dot2', {
      opacity: 0.4,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      delay: 0.3,
      ease: 'power1.inOut'
    })
    gsap.to('.dot3', {
      opacity: 0.2,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      delay: 0.7,
      ease: 'power1.inOut'
    })

    // 按钮光晕脉冲
    gsap.to('.cta-button', {
      boxShadow: '0 0 25px rgba(0, 242, 254, 0.6), 0 0 45px rgba(79, 172, 254, 0.4)',
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  })
})

onUnmounted(() => {
  // 清理所有GSAP动画
  if (gsapContext) {
    gsapContext.revert()
  }
})
</script>

<style lang="scss" scoped>
.vpp-hero {
  position: relative;
  width: 100%;
  background-color: #0a0c12;
  background-image: radial-gradient(circle at 30% 40%, rgba(32, 78, 128, 0.15) 0%, transparent 35%);
  min-height: 800px;
  display: flex;
  align-items: center;
  overflow: hidden;
  font-family: 'Inter', 'Space Grotesk', sans-serif;

  // 背景网格
  .hero-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(79, 172, 254, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79, 172, 254, 0.08) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 1;
  }

  // 光晕装饰
  .hero-glow-orb {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(0, 242, 254, 0.15), rgba(79, 172, 254, 0.02) 70%);
    filter: blur(80px);
    z-index: 0;
    &.orb1 {
      top: -200px;
      right: -100px;
    }
    &.orb2 {
      bottom: -200px;
      left: -50px;
      background: radial-gradient(circle at 70% 70%, rgba(79, 172, 254, 0.12), rgba(0, 242, 254, 0.01) 70%);
    }
  }

  .hero-container {
    position: relative;
    z-index: 10;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px;
    display: flex;
    align-items: center;
    gap: 80px;
    width: 100%;

    @media (max-width: 1024px) {
      flex-direction: column;
      padding: 40px 30px;
      gap: 60px;
    }
  }

  // 左侧文字区域
  .hero-text {
    flex: 1.1;
    color: #fff;
  }

  .hero-mini-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #b0d4ff;
    margin-bottom: 24px;
    text-shadow: 0 0 10px rgba(0, 242, 254, 0.3);

    .mini-icon {
      filter: drop-shadow(0 0 8px #4facfe);
    }
  }

  .hero-main-title {
    font-size: clamp(48px, 8vw, 80px);
    font-weight: 800;
    line-height: 1.1;
    margin: 0 0 16px 0;
    letter-spacing: -1px;
    color: white;
    text-shadow: 0 0 20px rgba(0,0,0,0.5);

    .gradient-text {
      background: linear-gradient(135deg, #4facfe, #00f2fe, #a3e7ff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 800;
      text-shadow: 0 0 30px rgba(0, 242, 254, 0.5);
      display: inline-block;
    }
  }

  .hero-subtitle-wrapper {
    position: relative;
    margin-bottom: 28px;
  }

  .hero-subtitle {
    font-size: 22px;
    font-weight: 500;
    color: rgba(220, 240, 255, 0.9);
    text-shadow: 0 0 15px rgba(79, 172, 254, 0.4);
    letter-spacing: 1px;
    margin: 0 0 8px 0;
    font-family: 'Space Grotesk', sans-serif;
  }

  .subtitle-decoration {
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, #4facfe, #00f2fe, transparent);
    margin-top: 8px;
    box-shadow: 0 0 15px #00f2fe;
  }

  .hero-description {
    font-size: 18px;
    line-height: 1.7;
    color: #bfd9ff;
    max-width: 550px;
    margin-bottom: 42px;
    font-weight: 400;
    text-shadow: 0 0 10px rgba(0,0,0,0.3);
  }

  .cta-block {
    position: relative;
    display: inline-block;
  }

  .cta-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 16px 38px;
    background: rgba(10, 20, 40, 0.5);
    backdrop-filter: blur(6px);
    border: 1px solid transparent;
    background: linear-gradient(#0e1a2b, #0e1a2b) padding-box,
                linear-gradient(135deg, #4facfe, #00f2fe) border-box;
    border-radius: 0;  /* 无圆角，硬朗科技感 */
    font-size: 18px;
    font-weight: 600;
    color: white;
    text-decoration: none;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
    z-index: 2;

    span {
      text-shadow: 0 0 8px rgba(79, 172, 254, 0.8);
    }

    .btn-arrow {
      transition: transform 0.2s;
    }

    &:hover {
      background: linear-gradient(#142433, #142433) padding-box,
                  linear-gradient(135deg, #6eb9ff, #3af2fe) border-box;
      box-shadow: 0 0 35px rgba(0, 242, 254, 0.6);
      .btn-arrow {
        transform: translateX(5px);
      }
    }
  }

  .cta-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(0,242,254,0.3) 0%, transparent 70%);
    filter: blur(25px);
    z-index: -1;
    opacity: 0.5;
  }

  // 右侧图片区域
  .hero-image-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 450px;
  }

  .image-glow-backdrop {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.05) 70%);
    filter: blur(60px);
    z-index: 1;
    border-radius: 0;
  }

  .vpp-screenshot {
    position: relative;
    z-index: 5;
    width: 100%;
    max-width: 900px;
    height: auto;
    display: block;
    border-radius: 0 !important;    /* 严格无圆角 */
    box-shadow:
      0 30px 50px -20px rgba(0,0,0,0.8),
      0 0 0 1px rgba(0, 242, 254, 0.3) inset,
      0 0 50px rgba(0, 242, 254, 0.3);
    outline: 1px solid rgba(79, 172, 254, 0.3);
    outline-offset: -1px;
  }

  // 浮动装饰
  .floating-deco {
    position: absolute;
    z-index: 6;
    pointer-events: none;
    opacity: 0.7;
    filter: drop-shadow(0 0 15px #4facfe);

    &.deco-1 {
      top: 0;
      right: -20px;
      width: 140px;
      height: 140px;
    }
    &.deco-2 {
      bottom: -10px;
      left: -20px;
      width: 110px;
      height: 110px;
    }
  }

  .data-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #00f2fe;
    border-radius: 0;  /* 方形点，科技感 */
    box-shadow: 0 0 15px #4facfe, 0 0 25px #00f2fe;
    z-index: 7;

    &.dot1 {
      top: 25%;
      right: 5%;
      width: 12px;
      height: 12px;
      background: #4facfe;
    }
    &.dot2 {
      bottom: 30%;
      left: 0;
      width: 6px;
      height: 6px;
      background: #a3e7ff;
    }
    &.dot3 {
      top: 60%;
      right: 10%;
      width: 10px;
      height: 10px;
      background: #00f2fe;
    }
  }

  img {
    border-radius: 0 !important;
  }
}
</style>