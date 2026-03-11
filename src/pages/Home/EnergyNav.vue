<template>
  <div ref="root" class="energy-ad">
    <!-- 背景装饰网格与光效 -->
    <div class="ad-bg-grid"></div>
    <div class="ad-bg-glow"></div>

    <div class="ad-container">
      <!-- 头部
      <div class="ad-header">
        <h1 class="main-title">
          <span class="title-gradient">点亮资产，预见收益</span>
        </h1>
        <p class="subtitle">{{ subtitle }}</p>
        装饰细线
        <div class="title-underline"></div>
      </div> -->

      <!-- 五个核心模块网格 -->
      <div class="features-grid">
        <div
          v-for="(item, idx) in features"
          :key="idx"
          class="feature-item"
          :data-index="idx"
        >
          <!-- 图标区（渐变底+图标） -->
          <div class="icon-frame">
            <i :class="['bi', item.icon]"></i>
            <!-- 微光晕 -->
            <div class="icon-glow"></div>
          </div>

          <h3 class="feature-title" v-html="item.title"></h3>
          <p class="feature-desc">{{ item.desc }}</p>

          <!-- 立刻开始按钮（带箭头） -->
          <div class="action-wrap">
            <template v-if="item.tag!=='none'">
            <button class="btn-start" @click="$emit('jump',`${item.tag}`)">
              <span>立刻开始</span>
              <i class="bi bi-arrow-right-short"></i>
            </button>
            </template>
            <template v-else>
                <button class="btn-start" @click="$emit('showComingSoon')">
              <span>立刻开始</span>
              <i class="bi bi-arrow-right-short"></i>
            </button>
            </template>
          </div>

          <!-- 科技感装饰小点 -->
          <div class="corner-dot"></div>
          <div class="corner-line"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

// 根节点ref，用于限定gsap查找范围
const root = ref(null)

// 副标题（强制一行）
const subtitle = '为电力市场参与者及能源资产持有者打造的在线决策引擎将复杂的能源数据转化为清晰的预测和洞见，助您精准决策、提升收益'

// 模块数据
const features = [
  {
    icon: 'bi-lightning-charge-fill',
    title: '负荷预测',
    desc: '提供精准的日前负荷预测，助力日前交易申报',
    tag:'load'
  },
  {
    icon: 'bi-sun-fill',
    title: '光伏发电预测',
    desc: '自适应模型选择，提供高精度的光伏发电预测',
    tag:'elec'
  },
  {
    icon: 'bi-bar-chart-steps',  // 节点电价查询
    title: '节点电价查询',
    desc: '一站式查询各地区、各节点电价数据',
    tag:'price-analysis'
  },
  {
    icon: 'bi-battery-charging',
    title: '光储定容',
    desc: '光伏储能系统容量优化设计与经济性分析',
    tag:'light'
  },
  {
    icon: 'bi-graph-up-arrow',   // 慧储™套利模拟
    title: '慧储<sup>™</sup>套利模拟',
    desc: '基于负荷预测和电价，动态生成最优充放策略，最大化IRR',
    tag:'none'
  }
]

onMounted(() => {
  const el = root.value
  if (!el) return

  // 1. 标题入场：透明度与轻微上浮
  gsap.from(el.querySelector('.main-title'), {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  })
  gsap.from(el.querySelector('.subtitle'), {
    y: 20,
    opacity: 0,
    duration: 0.8,
    delay: 0.15,
    ease: 'power2.out'
  })

  // 2. 五个模块交错淡入 + 向上移动 (GSAP核心动画)
  gsap.from(el.querySelectorAll('.feature-item'), {
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'back.out(1.2)',
    clearProps: 'opacity,transform' // 动画结束后清除内联样式，保持CSS默认
  })

  // 3. 为每个按钮添加悬浮动画 (GSAP交互)
  const buttons = el.querySelectorAll('.btn-start')
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
      gsap.to(btn, {
        scale: 1.05,
        backgroundColor: '#ffffff',
        borderColor: 'transparent',
        boxShadow: '0 10px 25px -8px rgba(0, 102, 255, 0.5)',
        duration: 0.2,
        ease: 'power1.out'
      })
      // 箭头右移
      const arrow = btn.querySelector('.bi-arrow-right-short')
      if (arrow) {
        gsap.to(arrow, {
          x: 5,
          duration: 0.2,
          ease: 'power1.out'
        })
      }
    })
    btn.addEventListener('mouseleave', (e) => {
      gsap.to(btn, {
        scale: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderColor: 'rgba(0,153,255,0.3)',
        boxShadow: '0 4px 12px rgba(0,51,102,0.08)',
        duration: 0.2,
        ease: 'power1.in'
      })
      const arrow = btn.querySelector('.bi-arrow-right-short')
      if (arrow) {
        gsap.to(arrow, {
          x: 0,
          duration: 0.2,
          ease: 'power1.in'
        })
      }
    })
  })

  // 4. 图标微弱浮动动画 (增加呼吸感)
  gsap.to(el.querySelectorAll('.icon-frame'), {
    y: -3,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    stagger: 0.1
  })
})
</script>

<style lang="scss" scoped>
// 引入 bootstrap-icons (确保依赖中存在)
@import 'bootstrap-icons/font/bootstrap-icons.css';

.energy-ad {
  position: relative;
  width: 100%;
  min-width: 1200px;        /* 保证大屏五个并排 */
  padding: 60px 40px 80px;
  background: linear-gradient(145deg, #f4f7fc 0%, #eef2f6 100%);
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  // 背景科技网格 (极淡)
  .ad-bg-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(0, 153, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 153, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  // 大光晕
  .ad-bg-glow {
    position: absolute;
    top: -30%;
    left: -10%;
    width: 120%;
    height: 80%;
    background: radial-gradient(circle at 30% 50%, rgba(0, 180, 255, 0.08), transparent 60%);
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }

  .ad-container {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    z-index: 2;
  }

  // 头部样式
  .ad-header {
    text-align: center;
    margin-bottom: 60px;
    position: relative;

    .main-title {
      font-size: 64px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 16px;
      line-height: 1.2;
      text-shadow: 0 2px 10px rgba(0, 102, 255, 0.2);
      
      .title-gradient {
        background: linear-gradient(135deg, #0B1E33, #1D4E8F, #0F2B4F);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        position: relative;
        display: inline-block;
        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 20%;
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #0099ff, #66ccff, #0099ff, transparent);
          border-radius: 2px;
          opacity: 0.6;
        }
      }
    }

    .subtitle {
      font-size: 16px;
      font-weight: 400;
      color: #2c3e50;
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: inline-block;
      padding: 12px 32px;
      border-radius: 60px;
      box-shadow: 0 2px 15px rgba(0,51,102,0.05);
      border: 1px solid rgba(255,255,255,0.8);
      white-space: nowrap;
      max-width: 100%;
      overflow-x: auto;
      scrollbar-width: none;  /* 隐藏滚动条但保持可滚动（若溢出） */
      &::-webkit-scrollbar {
        display: none;
      }
      letter-spacing: 0.02em;
      line-height: 1.5;
      margin: 0 auto;
    }

    .title-underline {
      width: 120px;
      height: 3px;
      background: linear-gradient(90deg, #0099ff, #a0d8ff, #0099ff);
      margin: 20px auto 0;
      border-radius: 3px;
      opacity: 0.5;
    }
  }

  // 网格布局：五个并排
  .features-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 40px;
    margin-top: 20px;
  }

  // 单个模块 — 极淡玻璃卡片，弱化边界
  .feature-item {
    position: relative;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 48px 24px 48px 24px;
    padding: 32px 22px 40px;
    transition: all 0.2s ease;
    box-shadow: 
      0 15px 35px -15px rgba(0, 51, 102, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255,255,255,0.6);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;

    // 隐藏卡片直角感 — 柔和
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(145deg, rgba(0,153,255,0.2), rgba(0,204,255,0.05));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    // 装饰角
    .corner-dot {
      position: absolute;
      bottom: 16px;
      right: 20px;
      width: 8px;
      height: 8px;
      background: #0099ff;
      border-radius: 50%;
      filter: blur(2px);
      opacity: 0.5;
    }
    .corner-line {
      position: absolute;
      top: 20px;
      right: 24px;
      width: 30px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #66ccff, #0099ff);
      transform: rotate(30deg);
      opacity: 0.3;
    }

    // 图标
    .icon-frame {
      position: relative;
      width: 68px;
      height: 68px;
      border-radius: 30% 70% 70% 30% / 30% 55% 45% 70%;
      background: linear-gradient(145deg, #0099ff, #3d7eff, #00ccff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      box-shadow: 0 15px 25px -10px rgba(0,102,255,0.4);
      transition: transform 0.3s;

      i {
        font-size: 36px;
        color: white;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        line-height: 1;
      }

      .icon-glow {
        position: absolute;
        inset: -6px;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), transparent 70%);
        opacity: 0.6;
        border-radius: inherit;
        z-index: -1;
      }
    }

    // 标题
    .feature-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 12px;
      color: #0a2540;
      letter-spacing: -0.01em;
      line-height: 1.3;
      position: relative;
      display: inline-block;
      background: linear-gradient(135deg, #112b4f, #1b4a7a);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 2px 5px rgba(0,119,255,0.15);
      
      :deep(sup) {
        font-size: 0.7em;
        background: linear-gradient(145deg, #ffb347, #ff7e5f);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-weight: 600;
      }
    }

    // 描述文字
    .feature-desc {
      font-size: 15px;
      line-height: 1.5;
      color: #1e3b5c;
      margin: 0 0 30px;
      flex: 1;
      font-weight: 400;
      opacity: 0.85;
      letter-spacing: 0.02em;
    }

    // 按钮区域
    .action-wrap {
      width: 100%;
      margin-top: auto;
    }

    .btn-start {
      background: rgba(255,255,255,0.8);
      border: 1px solid rgba(0,153,255,0.3);
      border-radius: 40px;
      padding: 12px 20px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #005c99;
      cursor: pointer;
      transition: none; /* 交给gsap */
      box-shadow: 0 4px 12px rgba(0,51,102,0.08);
      backdrop-filter: blur(4px);
      letter-spacing: 0.03em;

      span {
        background: linear-gradient(145deg, #0066aa, #0099ff);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        font-weight: 600;
      }

      i {
        font-size: 22px;
        color: #0099ff;
        transition: none;
      }

      // 去掉默认outline
      &:focus-visible {
        outline: 2px solid #0099ff;
        outline-offset: 2px;
      }
    }

    // hover时增加轻微提升 (css辅助, 但主要gsap)
    &:hover {
      .icon-frame {
        // 留一个微小css效果，gsap负责更细腻的变化
        filter: brightness(1.05);
      }
    }
  }

  // 第一个图标特殊微调
  .feature-item:first-child .icon-frame {
    background: linear-gradient(145deg, #0088ff, #306cff, #3e9eff);
  }
}
</style>