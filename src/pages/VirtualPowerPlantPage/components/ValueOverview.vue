<template>
  <section class="value-overview">
    <div class="container">
      <!-- 左侧内容 -->
      <div class="content-left">
        <!-- 主标题区 -->
        <div class="title-section">
          <h1 class="main-title">
            <span class="title-line">让您的每一度电，</span>
            <span class="title-line gradient-text">都赚得更多更轻松</span>
          </h1>
          <p class="subtitle">派诺虚拟电厂 · 您的智能能源管家</p>

          <div class="highlight-box">
            <p class="highlight-text">
              无需成为专家，无需组建团队。我们为您对接电力市场，自动调度您的空调、光伏、储能设备，
              在电价波峰时赚取补贴和电费差价，实现稳定被动收入。
            </p>
            <!-- 装饰光晕 -->
            <div class="highlight-glow"></div>
          </div>
        </div>

        <!-- 核心价值点 -->
        <div class="value-points">
          <div
            class="value-card"
            v-for="point in valuePoints"
            :key="point.id"
          >
            <div class="card-icon" :style="{ background: point.gradient }">
              <i :class="point.icon"></i>
            </div>
            <h3 class="card-title">{{ point.title }}</h3>
            <p class="card-description">
              {{ point.description }}
            </p>
            <!-- 卡片科技边框 -->
            <div class="card-border"></div>
          </div>
        </div>
      </div>

      <!-- 右侧大图 -->
      <div class="content-right">
        <div class="image-wrapper">
          <img
            src="https://pmac.leyi.host/downloads/pmac/pilot-vpp.png"
            alt="派诺虚拟电厂平台展示"
            class="feature-image"
          />
          <!-- 图片装饰光效 -->
          <div class="image-glow"></div>
          <div class="image-dots"></div>
        </div>
        <!-- 浮动科技标签 -->
        <div class="floating-tag tag-1">
          <i class="bi bi-lightning-charge-fill"></i>
          <span>实时响应</span>
        </div>
        <div class="floating-tag tag-2">
          <i class="bi bi-graph-up-arrow"></i>
          <span>收益最大化</span>
        </div>
        <div class="floating-tag tag-3">
          <i class="bi bi-shield-check"></i>
          <span>安全合规</span>
        </div>
      </div>
    </div>

    <!-- 背景装饰网格和光效 -->
    <div class="bg-grid"></div>
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const valuePoints = ref([
  {
    id: 1,
    icon: "bi bi-graph-up-arrow",
    title: "轻松增收",
    description: "坐享设备\"闲置能力\"变现，年收益提升15%-45%",
    gradient: "linear-gradient(135deg, #4facfe 0%, #43e97b 100%)",
  },
  {
    id: 2,
    icon: "bi bi-headset",
    title: "省心省力",
    description: "从注册、交易到调控、结算，我们提供全托管服务",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: 3,
    icon: "bi bi-shield-check",
    title: "零风险启动",
    description: "成熟平台，已验证的商业案例，无前期开发成本",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    id: 4,
    icon: "bi bi-file-earmark-check",
    title: "政策护航",
    description: "我们确保您的所有操作完全符合最新市场规则",
    gradient: "linear-gradient(135deg, #96e6a1 0%, #d4fc79 100%)",
  },
]);
</script>

<style scoped>
.value-overview {
  min-height: 100vh;
  background: linear-gradient(145deg, #f0f5fe 0%, #e9f0fa 100%);
  padding: 80px 40px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 5;
}

/* 左侧内容区域 */
.content-left {
  flex: 1;
  max-width: 650px;
}

.title-section {
  margin-bottom: 50px;
}

.main-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
  text-shadow: 0 10px 20px rgba(0, 100, 200, 0.2);
}

.title-line {
  display: block;
  color: #13294b;
}

.title-line.gradient-text {
  background: linear-gradient(120deg, #0072ff, #00c6ff, #667eea);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

.subtitle {
  font-size: 1.2rem;
  color: #2d4b7a;
  letter-spacing: 2px;
  margin-bottom: 30px;
  text-transform: uppercase;
  font-weight: 500;
  text-shadow: 0 2px 5px rgba(255,255,255,0.5);
  position: relative;
  display: inline-block;
}

.subtitle::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #0072ff, #00c6ff);
  border-radius: 3px;
  box-shadow: 0 0 10px #0072ff;
}

.highlight-box {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 30px 35px;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 25px 45px -15px rgba(0,80,160,0.3);
  position: relative;
  overflow: hidden;
}

.highlight-text {
  font-size: 1.2rem;
  line-height: 1.7;
  color: #1f3a5f;
  font-weight: 500;
  position: relative;
  z-index: 2;
  margin: 0;
}

.highlight-glow {
  position: absolute;
  top: -50%;
  left: -20%;
  width: 140%;
  height: 200%;
  background: radial-gradient(circle, rgba(0,180,255,0.15) 0%, transparent 70%);
  animation: rotateGlow 12s linear infinite;
}

@keyframes rotateGlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 价值点卡片网格 */
.value-points {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.value-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 25px;
  padding: 30px 25px;
  border: 1px solid rgba(255,255,255,0.9);
  box-shadow: 0 15px 30px -10px rgba(0,60,130,0.2);
  transition: all 0.4s cubic-bezier(0.2, 0.9, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.value-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(0, 160, 255, 0.5);
  box-shadow: 0 30px 50px -15px rgba(0,100,200,0.4);
  background: rgba(255, 255, 255, 0.8);
}

.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 15px 25px -8px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
  position: relative;
  z-index: 2;
}

.value-card:hover .card-icon {
  transform: scale(1.1) rotate(3deg);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #13294b;
  letter-spacing: -0.3px;
  position: relative;
  z-index: 2;
}

.card-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #2d4a74;
  position: relative;
  z-index: 2;
}

.card-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 25px;
  border: 1px solid transparent;
  background: linear-gradient(145deg, rgba(0,150,255,0.2), rgba(100,80,255,0.1)) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.value-card:hover .card-border {
  opacity: 1;
}

/* 右侧图片区域 */
.content-right {
  flex: 1;
  position: relative;
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 40px 70px -15px rgba(0,80,160,0.5);
  border: 2px solid rgba(255,255,255,0.4);
  transform: perspective(1000px) rotateY(-2deg) rotateX(2deg);
  transition: transform 0.5s ease;
}

.image-wrapper:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02);
  border-color: rgba(0,200,255,0.8);
  box-shadow: 0 50px 90px -10px #0072ff;
}

.feature-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.image-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(0,180,255,0.3) 0%, transparent 60%);
  pointer-events: none;
  mix-blend-mode: overlay;
}

.image-dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 10px 10px, rgba(255,255,255,0.2) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

.floating-tag {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 50px;
  font-weight: 600;
  color: #1f3a5f;
  box-shadow: 0 15px 30px -8px rgba(0,60,120,0.3);
  border: 1px solid rgba(255,255,255,0.9);
  transition: all 0.3s;
  animation: float 5s ease-in-out infinite;
  z-index: 10;
}

.floating-tag i {
  color: #0072ff;
  font-size: 1.2rem;
}

.floating-tag:hover {
  background: white;
  border-color: #0072ff;
  transform: scale(1.1);
}

.tag-1 {
  top: 15%;
  left: -20px;
  animation-delay: 0s;
}

.tag-2 {
  bottom: 25%;
  right: -15px;
  animation-delay: 1.5s;
}

.tag-3 {
  top: 60%;
  left: -10px;
  animation-delay: 0.8s;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}

/* 背景装饰 */
.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0,100,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,100,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  z-index: 1;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(0,150,255,0.1) 0%, transparent 70%);
  z-index: 0;
}

.orb-1 {
  width: 500px;
  height: 500px;
  top: -200px;
  right: -100px;
  background: radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%);
}

.orb-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -100px;
  background: radial-gradient(circle, rgba(100,80,255,0.08) 0%, transparent 70%);
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .main-title { font-size: 3rem; }
  .container { gap: 40px; }
}

@media (max-width: 992px) {
  .container {
    flex-direction: column;
    text-align: center;
  }
  .content-left { max-width: 100%; }
  .subtitle::after { left: 50%; transform: translateX(-50%); }
  .value-points { grid-template-columns: repeat(2, 1fr); }
  .content-right { width: 100%; }
  .floating-tag { display: none; } /* 移动端隐藏浮动标签避免遮挡 */
  .image-wrapper { transform: none; max-width: 100%; }
}

@media (max-width: 768px) {
  .value-overview { padding: 60px 20px; }
  .main-title { font-size: 2.5rem; }
  .value-points { grid-template-columns: 1fr; }
  .highlight-box { padding: 25px; }
}
</style>