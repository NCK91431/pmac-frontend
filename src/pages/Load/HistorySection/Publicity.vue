<template>
  <div class="publicity-page">
    <!-- 第一部分：宣传视频 + 立即体验入口 -->
    <section class="hero-section">
      <!-- 动态装饰浮层 -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>

      <div class="container">
        <div class="section-header" ref="videoHeader">
          <h1 class="main-title">快速上手<span>负荷预测</span></h1>
          <p class="sub-title">3分钟掌握核心功能，轻松预测负荷，让决策更简单</p>
        </div>
        <div class="video-wrapper" ref="videoWrapper">
          <video
            controls
            playsinline
            preload="metadata"
          >
            <source
              src="https://pmac.leyi.host/downloads/video/load.mp4"
              type="video/mp4"
            />
            您的浏览器不支持视频播放。
          </video>
        </div>

        <!-- 新增：立即体验区域 -->
        <div class="cta-wrapper" ref="ctaRef">
          <div class="cta-button" ref="ctaButton" @click="gotoLoadPrediction">
            <i class="bi bi-lightning-charge-fill"></i> 立即体验
          </div>
          <p class="cta-note">无需注册 · 免费使用 · 精准高效</p>
        </div>
      </div>
    </section>

    <!-- 第二部分：案例展示 (GIF 图文) -->
    <section class="cases-section">
      <div class="case-wrap">
        <div class="section-header" ref="casesHeader">
          <h2 class="main-title">真实案例 · 效果见证</h2>
          <p class="sub-title">精准预测，助力能源管理智能化</p>
        </div>

        <div class="cases-grid">
          <!-- 案例 1：模型信息 -->
          <div class="case-item" ref="case1">
            <div class="case-text" ref="case1Text">
              <h3>模型信息深度解析</h3>
              <p>
                训练完成后自动展示完整模型信息，对历史负荷数据进行周期性、趋势性解析，让模型特征与训练细节清晰呈现。所有特性一目了然，预测有据可依。
              </p>
            </div>
            <div class="case-media" ref="case1Media">
              <img
                src="https://pmac.leyi.host/downloads/video/负荷预测模型信息.gif"
                alt="负荷预测模型信息"
                loading="lazy"
              />
            </div>
          </div>

          <!-- 案例 2：结果展示（文字居右，图片居左） -->
          <div class="case-item reverse" ref="case2">
            <div class="case-text" ref="case2Text">
              <h3>多维预测结果展示</h3>
              <p>
                灵活切换查看未来三日预测结果，左侧同步日期类型，可视化图表展现负荷趋势，同时对比同类型日历史曲线。下方表格数据与图表对应，支持一键下载，便于进一步分析。
              </p>
            </div>
            <div class="case-media" ref="case2Media">
              <img
                src="https://pmac.leyi.host/downloads/video/负荷预测结果展示.gif"
                alt="负荷预测结果展示"
                loading="lazy"
              />
            </div>
          </div>

          <!-- 案例 3：天气信息 -->
          <div class="case-item" ref="case3">
            <div class="case-text" ref="case3Text">
              <h3>天气依据</h3>
              <p>
                查看模型预测依据的详细天气信息，支持多地切换。进入回测分析可直观评估任意历史日期的表现，实际曲线与预测曲线清晰对比。
              </p>
            </div>
            <div class="case-media" ref="case3Media">
              <img
                src="https://pmac.leyi.host/downloads/video/负荷预测天气信息展示.gif"
                alt="负荷预测天气信息展示"
                loading="lazy"
              />
            </div>
          </div>

          <!-- 案例4：继续预测扩展（原XXXX已修改） -->
          <div class="case-item reverse" ref="case4">
            <div class="case-text" ref="case4Text">
              <h3>持续预测扩展</h3>
              <p>
                支持“继续预测”：上传最新数据，即可无缝衔接，快速扩展后续预测结果，所有模型连续可追溯。
              </p>
            </div>
            <div class="case-media" ref="case4Media">
              <img
                src="https://pmac.leyi.host/downloads/video/负荷预测继续预测入口.gif"
                alt="负荷预测继续预测"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 第三部分：隐私与安全（色调与整体融合） -->
    <section class="privacy-section">
      <div class="container">
        <div class="section-header" ref="privacyHeader">
          <h2 class="main-title">隐私与安全</h2>
          <p class="sub-title">
            我们始终致力于保护用户的隐私与数据安全，坚持“本地优先”和“加密传输”的原则。
          </p>
        </div>

        <div class="features-grid" ref="featuresGrid">
          <div class="feature-card" ref="feature1">
            <i class="bi bi-shield-lock"></i>
            <h4>数据本地处理</h4>
            <p>所有预测计算均在本地完成，数据无需上传，杜绝泄露风险。</p>
          </div>
          <div class="feature-card" ref="feature2">
            <i class="bi bi-incognito"></i>
            <h4>匿名使用</h4>
            <p>无需注册，无追踪记录，保护您的使用行为隐私。</p>
          </div>
          <div class="feature-card" ref="feature3">
            <i class="bi bi-file-lock"></i>
            <h4>加密存储</h4>
            <p>本地数据采用高强度加密，即使设备丢失，数据也无法破解。</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref,computed } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLoadForecastStore } from "@/store/load";
import { useRouter } from "vue-router";

gsap.registerPlugin(ScrollTrigger);

// 获取需要动画的元素
const videoHeader = ref(null);
const videoWrapper = ref(null);
const casesHeader = ref(null);
const case1 = ref(null);
const case2 = ref(null);
const case3 = ref(null);
const case4 = ref(null);
const privacyHeader = ref(null);
const featuresGrid = ref(null);
const feature1 = ref(null);
const feature2 = ref(null);
const feature3 = ref(null);
const ctaButton = ref(null); // 新增按钮ref

const case1Text = ref(null);
const case1Media = ref(null);
const case2Text = ref(null);
const case2Media = ref(null);
const case3Text = ref(null);
const case3Media = ref(null);
const case4Text = ref(null);
const case4Media = ref(null);

const forecastStore = useLoadForecastStore();
const stage = computed(() => forecastStore.stage);
const router = useRouter();

const gotoLoadPrediction = () => {
    if (stage.value == 0) {
        forecastStore.setStageChooseMode();
    }
    router.push({ name: "loadpre" });
};


onMounted(() => {
  // 1. 初始状态：透明并向下偏移 50px（包含所有需要动画的元素）
  gsap.set(
    [
      videoHeader.value,
      videoWrapper.value,
      casesHeader.value,
      case1.value,
      case2.value,
      case3.value,
      case4.value,
      privacyHeader.value,
    ],
    {
      opacity: 0,
      y: 50,
    },
  );

  // 为部分元素设置额外的初始值
  gsap.set(videoHeader.value, { scale: 0.8 });
  gsap.set(videoWrapper.value, { scale: 0.7, rotation: -2 });
  gsap.set(privacyHeader.value, { scale: 0.9 });

  // 2. 视频部分标题动画（每次进入视口都重置并播放）
  gsap.to(videoHeader.value, {
    scrollTrigger: {
      trigger: videoHeader.value,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.2,
    ease: "back.out(1.4)",
  });

  // 3. 视频包装动画
  gsap.to(videoWrapper.value, {
    scrollTrigger: {
      trigger: videoWrapper.value,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 1,
    y: 0,
    scale: 1,
    rotation: 0,
    duration: 1.2,
    delay: 0.2,
    ease: "power4.out",
  });

  // 4. 案例部分标题动画
  gsap.to(casesHeader.value, {
    scrollTrigger: {
      trigger: casesHeader.value,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 1,
    y: 0,
    duration: 1,
    ease: "power2.out",
  });

  // 5. 案例卡片动画（每个卡片独立触发，不再由casesHeader统一控制）
  const caseItems = [case1.value, case2.value, case3.value, case4.value];
  caseItems.forEach((el) => {
    if (el) {
      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reset",
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      });
    }
  });


  const textElements = [
  case1Text.value, case2Text.value, case3Text.value, case4Text.value
];
const mediaElements = [
  case1Media.value, case2Media.value, case3Media.value, case4Media.value
];

// 文字初始：透明，并向左/右偏移 50px（反向卡片则偏移方向相反）
textElements.forEach((el, index) => {
  if (!el) return;
  const isReverse = index === 1 || index === 3; // case2 和 case4 是 reverse
  gsap.set(el, {
    opacity: 0,
    x: isReverse ? 50 : -50,
  });
});

// 媒体初始：透明，并向右/左偏移 50px（反向卡片则方向相反），同时 scale 0.8 准备弹性放大
mediaElements.forEach((el, index) => {
  if (!el) return;
  const isReverse = index === 1 || index === 3;
  gsap.set(el, {
    opacity: 0,
    x: isReverse ? -50 : 50,
    scale: 0.8,
  });
});

// 3. 为每个案例的文字和媒体创建独立的滚动动画
textElements.forEach((el, index) => {
  if (!el) return;
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 1,
    x: 0,
    duration: 0.8,
    ease: "power2.out",
  });
});

mediaElements.forEach((el, index) => {
  if (!el) return;
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 1,
    x: 0,
    scale: 1,
    duration: 1.0,
    ease: "back.out(1.7)", // 弹性放大效果
  });
});

  // 6. 隐私部分标题动画
  gsap.to(privacyHeader.value, {
    scrollTrigger: {
      trigger: privacyHeader.value,
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1,
    ease: "power2.out",
  });

  // 7. 隐私卡片动画（每个卡片独立触发，保留原有的差异化入场方向）
  const featureCards = [feature1.value, feature2.value, feature3.value];
  featureCards.forEach((el, i) => {
    if (el) {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          x: i === 0 ? -30 : i === 2 ? 30 : 0,
          y: i === 1 ? 50 : 0,
          rotation: i === 0 ? -5 : i === 2 ? 5 : 0,
          scale: 0.8,
        },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reset",
          },
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        },
      );
    }
  });

  // 8. 立即体验按钮的吸引动画（无限呼吸效果）
  if (ctaButton.value) {
    gsap.to(ctaButton.value, {
      scale: 1.03,
      boxShadow: "0 28px 40px -8px rgba(15, 220, 120, 0.7)",
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }
});
</script>

<style scoped>
/* 样式部分完全保持不变，未作任何修改 */
.publicity-page {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  background-color: #f9fafc;
  color: #1e293b;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

section {
  padding: 80px 0;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

/* ----- 焕新标题：科技蓝紫渐变，活泼不刺眼 ----- */
.hero-section {
  .main-title {
    font-size: 4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    color: #f5f9fe;
    span {
      /* 主标题使用明亮蓝紫渐变 */
      background: linear-gradient(
        90deg,
        #3ee1a3 0,
        #32f08c 36%,
        #60f2bd 71.63%,
        #a0fde7 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      background-size: 200% auto;
      animation: shine 6s linear infinite;
    }
  }
  .sub-title{
    color: #a6aab5;
  }

}

.cases-section {
  .main-title {
    font-size: 4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    /* 主标题使用明亮蓝紫渐变 */
    background: linear-gradient(135deg, #2b7cff, #7511f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% auto;
    animation: shine 6s linear infinite;
  }
}

@keyframes shine {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

.sub-title {
  font-size: 1.3rem;
  color: #2c3e50;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 300;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
}

/* ----- Hero 区域：动态装饰 + 丰富背景 ----- */
.hero-section {
  padding-top: 100px;
  background: #0a0b0d;
  grid-area: content;
  overflow-x: hidden;
  z-index: 1;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

/* 浮动装饰 blob */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  z-index: 0;
  pointer-events: none;
  opacity: 0.5;
  animation: floatBlob 15s infinite alternate ease-in-out;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #2b7cff 0%, #7a4df0 80%);
  top: -100px;
  left: -100px;
  animation-duration: 18s;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #9d4eff 0%, #2b7cff 80%);
  bottom: -50px;
  right: -50px;
  animation-duration: 22s;
  animation-delay: -3s;
}

.blob-3 {
  width: 250px;
  height: 250px;
  background: #42d3ff;
  filter: blur(80px);
  top: 40%;
  left: 60%;
  opacity: 0.3;
  animation: floatBlob2 20s infinite alternate;
}

@keyframes floatBlob {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(60px, 40px) scale(1.2);
  }
}
@keyframes floatBlob2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-50px, 30px) scale(1.3);
  }
}

.video-wrapper {
   aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 30px 50px -20px rgba(43, 124, 255, 0.4);
  transition:
    transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1),
    box-shadow 0.5s ease;
  transform: translateY(0);
  position: relative;
  z-index: 2;
}

.video-wrapper:hover {
  transform: scale(1.02) translateY(-8px);
  box-shadow: 0 40px 70px -15px #2b7cff;
}

.video-wrapper video {
  width: 100%;
  height:100%;  
    object-fit: cover;  
  display: block;
  background-color: #0f172a;
}

/* 立即体验按钮区域 */
.cta-wrapper {
  text-align: center;
  margin-top: 50px;
  position: relative;
  z-index: 5;
}

/* .cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #2b7cff, #9d4eff);
  color: white;
  font-size: 1.6rem;
  font-weight: 600;
  padding: 18px 50px;
  border-radius: 60px;
  box-shadow: 0 20px 30px -8px rgba(43, 124, 255, 0.5);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  text-decoration: none;
  letter-spacing: 0.5px;
} */
.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #0fdc78, #00b894);
  color: white;
  font-size: 1.6rem;
  font-weight: 600;
  padding: 18px 50px;
  box-shadow: 0 20px 30px -8px rgba(15, 220, 120, 0.5);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.cta-button i {
  font-size: 2rem;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 28px 40px -8px #2b7cff;
  background: linear-gradient(135deg, #3f8cff, #aa5eff);
}

.cta-button:hover i {
  transform: rotate(10deg) scale(1.1);
}

.cta-note {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.3px;
  color: #a6aab5;
}

/* ----- 案例展示区域：图文精致感升级 ----- */
.cases-section {
  background-color: #ffffff;
  position: relative;
}

.cases-section .case-wrap {
  max-width: 1280px;
  margin: 0 auto;
}

.cases-grid {
  display: flex;
  flex-direction: column;
  gap: 100px;
}

.case-item {
  display: flex;
  align-items: center;
  gap: 60px;
}

.case-item.reverse {
  flex-direction: row-reverse;
}

/* 案例文字部分 */
.case-text {
  flex: 1;
  padding: 20px;
  position: relative;
}

/* 装饰线使用新渐变 */
.case-text::before {
  content: "";
  position: absolute;
  left: 0;
  top: 30px;
  bottom: 30px;
  width: 4px;
  background: linear-gradient(180deg, #2b7cff, #9d4eff, #e0c0ff);
  border-radius: 4px;
  opacity: 0.7;
}

.case-text h3 {
  font-size: 2.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  /* h3 使用稍深但同色系的渐变 */
  background: linear-gradient(130deg, #1d3b6c, #2b7cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
  position: relative;
  display: inline-block;
}

.case-text h3::after {
  content: "◆";
  font-size: 1.2rem;
  margin-left: 10px;
  background: linear-gradient(135deg, #2b7cff, #9d4eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0.8;
  display: inline-block;
  transform: translateY(-2px);
}

.case-text p {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #2c3e50;
  font-weight: 350;
  max-width: 500px;
}

.case-media {
  flex: 2;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px -12px rgba(43, 124, 255, 0.25);
  background: #eef2f6;
  transition: all 0.5s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.case-media img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.7s ease;
}

.case-media:hover {
  transform: scale(1.02) translateY(-6px);
  box-shadow: 0 35px 60px -15px #2b7cff;
}

.case-media:hover img {
  transform: scale(1.03);
}

.case-item.reverse .case-text::before {
  left: auto;
  right: 0;
  background: linear-gradient(180deg, #9d4eff, #2b7cff, #cce0ff);
}

/* ----- 隐私安全区域：深色但融入蓝紫调 ----- */
.privacy-section {
  background: radial-gradient(ellipse at 20% 30%, #1a2f4f, #0c1a30);
  color: #ffffff;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

/* 动态光效微调，更柔和 */
.privacy-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 30% 40%,
      rgba(100, 160, 255, 0.2) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(180, 130, 255, 0.15) 0%,
      transparent 50%
    );
  pointer-events: none;
  animation: breathe 9s ease-in-out infinite;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 隐私区域的标题使用明亮渐变，与主标题一致 */
.privacy-section .main-title {
  background: linear-gradient(135deg, #ffffff, #c0d0ff, #b3a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shine 6s linear infinite;
}

.privacy-section .sub-title {
  color: #b8d0e5;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 40px 30px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition:
    transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1),
    background 0.4s ease,
    box-shadow 0.4s ease;
  box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.5);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 25px 45px -8px #00000066;
  border-color: rgba(255, 255, 255, 0.3);
}

.feature-card i {
  font-size: 3.5rem;
  color: #b3d0ff;
  margin-bottom: 25px;
  display: inline-block;
  filter: drop-shadow(0 8px 12px rgba(43, 124, 255, 0.3));
  transition: transform 0.3s ease;
}

.feature-card:hover i {
  transform: scale(1.1) rotate(2deg);
  color: #d0e5ff;
}

.feature-card h4 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 16px;
  background: linear-gradient(145deg, #ffffff, #e0f0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #d0e2f5;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .main-title {
    font-size: 2.2rem;
  }
  .sub-title {
    font-size: 1.1rem;
  }
  .case-item,
  .case-item.reverse {
    flex-direction: column;
    gap: 30px;
  }
  .case-text {
    text-align: center;
    padding: 20px 10px;
  }
  .case-text::before {
    display: none;
  }
  .case-text h3::after {
    display: none;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .cta-button {
    font-size: 1.3rem;
    padding: 15px 40px;
  }
}

@media (max-width: 768px) {
  section {
    padding: 60px 0;
  }
  .video-wrapper {
    border-radius: 20px;
  }
  .case-text h3 {
    font-size: 1.8rem;
  }
  .feature-card {
    padding: 30px 20px;
  }
  .blob {
    filter: blur(50px);
  }
}
</style>