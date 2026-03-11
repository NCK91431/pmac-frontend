<!-- 动画背景组件（明亮版） -->
<template>
  <div class="animated-background">
    <div class="particles-container">
      <div
        v-for="i in 30"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>
    <div class="gradient-overlay"></div>
  </div>
</template>

<script setup>
import { ref ,onMounted} from "vue";
import gsap from "gsap";

const particles = ref(30);

const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const opacity = Math.random() * 0.2 + 0.1; // 降低不透明度，更柔和
  const duration = Math.random() * 20 + 10;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    opacity: opacity,
    animationDuration: `${duration}s`,
  };
};

onMounted(() => {
  gsap.to(".gradient-overlay", {
    backgroundPosition: "200% 200%",
    duration: 30,
    repeat: -1,
    ease: "none",
    yoyo: true,
  });
});
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  background-color: #ffffff; /* 纯白基底 */
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: linear-gradient(135deg, #b8d0ff 0%, #a0b8f0 100%); /* 浅蓝紫渐变粒子 */
  border-radius: 50%;
  animation: float infinite ease-in-out;
  filter: blur(1px); /* 增加柔和感 */
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(10px) translateX(-10px);
  }
  75% {
    transform: translateY(-10px) translateX(-5px);
  }
}

.gradient-overlay {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background:
    radial-gradient(
      circle at 30% 20%,
      rgba(180, 200, 255, 0.25) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 70% 80%,
      rgba(200, 180, 255, 0.2) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(160, 210, 255, 0.15) 0%,
      transparent 60%
    );
  animation: gradientMove 30s infinite alternate;
}

@keyframes gradientMove {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>