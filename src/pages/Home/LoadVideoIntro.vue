<template>
  <section class="load-video-intro" ref="sectionRef">
    <div class="container">
      <div class="content-wrapper">
        <!-- 左侧文本区域 -->
        <div class="text-content" ref="textRef">
          <span class="badge">负荷预测</span>
          <h2>精准预见每一度电<br />助力电力交易决策</h2>
          <p class="desc">
            基于先进算法与高精度气象数据，提供 D+1 日 24 小时逐时负荷预测。
            为售电公司、工商业用户优化购电策略，降低偏差考核风险。
          </p>
          <ul class="feature-list">
            <li v-for="(item, idx) in features" :key="idx">
              <i class="fas fa-check-circle"></i>
              <span>{{ item }}</span>
            </li>
          </ul>
          <div class="cta-buttons">
            <el-button type="primary" @click="gotoLoadPage">
              立即体验 <i class="fas fa-arrow-right"></i>
            </el-button>
            <el-button plain @click="scrollToMore">了解更多</el-button>
          </div>
        </div>

        <!-- 右侧视频区域 -->
        <div class="video-content" ref="videoRef">
          <div class="video-wrapper">
            <video
              ref="videoPlayer"
              :src="videoSrc"
              autoplay
              muted
              loop
              playsinline
              controls
              preload="metadata"
            ></video>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'vue-router';
import { useLoadForecastStore } from '@/store/load';

// 注册 GSAP ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  videoSrc: {
    type: String,
    default: 'https://pmac.leyi.host/downloads/video/load.mp4',
  },
});

const router = useRouter();
const loadStore = useLoadForecastStore();

// 特性列表（可依据实际文案调整）
const features = [
  '引入国家气象局高精度气象数据',
  '算法荣获国际人工智能大赛银奖',
  '精准预测 D+1 日 24 小时逐时负荷',
  '已服务大型售电公司日常交易',
  '一键上传历史数据，自动生成预测报告',
];

// DOM 引用
const sectionRef = ref(null);
const textRef = ref(null);
const videoRef = ref(null);

// 跳转至负荷预测页面（复用原有逻辑）
const gotoLoadPage = () => {
  if (loadStore.stage <= 0) {
    router.push('/load_example');
  } else {
    router.push('/loadpre');
  }
};

// 了解更多：可滚动至页面下方介绍区域（示例中简单回到顶部，可按需修改）
const scrollToMore = () => {
  // window.scrollTo({
  //   top: document.body.scrollHeight,
  //   behavior: 'smooth',
  // });
  router.push("/load_example");
};

// GSAP 动画上下文，便于清理
let ctx;

onMounted(() => {
  // 创建 GSAP 上下文，所有动画自动绑定到当前组件作用域
  ctx = gsap.context(() => {
    // 左侧文本从左侧滑入并淡入
    gsap.from(textRef.value, {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      x: -50,
      duration: 1,
      ease: 'power2.out',
    });

    // 右侧视频区域从右侧滑入并淡入
    gsap.from(videoRef.value, {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      x: 50,
      duration: 1,
      delay: 0.2,
      ease: 'power2.out',
    });

    // 视频卡片本身有个轻微的弹性放大出场
    gsap.from('.video-wrapper', {
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 80%',
      },
      scale: 0.9,
      opacity: 0,
      duration: 1.2,
      ease: 'backOut(1.2)',
    });
  }, sectionRef); // 限定作用域为 sectionRef
});

onUnmounted(() => {
  // 清理 GSAP 上下文及 ScrollTrigger 实例
  if (ctx) ctx.revert();
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
});
</script>

<style lang="scss" scoped>
.load-video-intro {
  padding: 80px 0;
  background: #f9fafc;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 50px 0;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    align-items: center;

    @media (max-width: 992px) {
      gap: 40px;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  /* 左侧文本样式 */
  .text-content {
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #2b7cff 0%, #42d3ff 100%);
      color: #fff;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 4px 16px;
      border-radius: 30px;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 4px 10px rgba(43, 124, 255, 0.3);
    }

    h2 {
      font-size: 2.6rem;
      font-weight: 700;
      color: #1d3b6c;
      line-height: 1.3;
      margin-bottom: 20px;

      @media (max-width: 992px) {
        font-size: 2.2rem;
      }

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .desc {
      font-size: 1.1rem;
      color: #5e6d82;
      line-height: 1.7;
      margin-bottom: 30px;
      max-width: 90%;

      @media (max-width: 768px) {
        max-width: 100%;
        font-size: 1rem;
      }
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 40px;

      li {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 1.05rem;
        color: #2c3e50;

        i {
          color: #2b7cff;
          font-size: 1.3rem;
          flex-shrink: 0;
        }
      }
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      .el-button {
        padding: 12px 28px;
        font-weight: 500;
        border-radius: 40px;
        transition: all 0.3s ease;

        i {
          margin-left: 6px;
          transition: transform 0.2s;
        }

        &:hover i {
          transform: translateX(4px);
        }
      }

      .el-button--primary {
        background: linear-gradient(135deg, #2b7cff, #42d3ff);
        border: none;
        box-shadow: 0 8px 18px rgba(43, 124, 255, 0.3);

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(43, 124, 255, 0.4);
        }
      }

      .el-button--plain {
        border: 1px solid #2b7cff;
        color: #2b7cff;
        background: transparent;

        &:hover {
          background: rgba(43, 124, 255, 0.05);
          transform: translateY(-3px);
        }
      }
    }
  }

  /* 右侧视频样式 */
  .video-content {
    display: flex;
    justify-content: center;

    .video-wrapper {
      width: 100%;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 50px -20px rgba(0, 0, 0, 0.4);
      transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1),
                  box-shadow 0.4s ease;
      background: #0b1a2f;
      aspect-ratio: 16 / 9;

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.5);
      }

      video {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
        background: #000;
      }
    }
  }
}
</style>