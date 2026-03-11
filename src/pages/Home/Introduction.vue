<template>
  <section class="features-intro" ref="sectionRef">
    <div class="container">
      <!-- 头部标题区域：百闻不如一试 + 副标题（两行） -->
      <div class="intro-header">
        <h2>百闻不如一试</h2>
        <p class="subtitle">
          无需注册也可以使用<br />
          注册用户可保留所有创建模型，使用更方便
        </p>
        <!-- 轻量装饰线，增加层次感 -->
        <div class="header-decoration"></div>
      </div>

      <!-- 三个功能块：循环生成，奇偶块左右交替 -->
      <div
        v-for="(feature, index) in features"
        :key="index"
        class="feature-block"
        :class="{ 'reverse-layout': index % 2 === 1 }"
        :ref="(el) => setBlockRef(el, index)"
      >
        <!-- 左侧文本区域（视觉顺序可能因 reverse-layout 改变） -->
        <div class="text-content" :ref="(el) => setTextRef(el, index)">
          <span class="badge">{{ feature.badge }}</span>
          <h3>{{ feature.title }}</h3>
          <p class="desc">{{ feature.description }}</p>
          <ul class="feature-list">
            <li v-for="(item, idx) in feature.listItems" :key="idx">
              <i class="fas fa-check-circle"></i>
              <!-- 数值高亮显示（百分比等） -->
              <span v-html="highlightNumbers(item)"></span>
            </li>
          </ul>
          <!-- 负荷预测块（index === 0）显示视频入口提示 -->
          <div v-if="index === 0" class="video-prompt" @click="handleVideoClick">
            <i class="fas fa-play-circle"></i>
            <span>视频介绍 (3分钟)</span>
          </div>
        </div>

        <!-- 右侧图片区域（视觉顺序可能因 reverse-layout 改变） -->
        <div class="image-content" :ref="(el) => setImageRef(el, index)">
          <div class="image-wrapper">
            <img :src="feature.imgSrc" :alt="feature.title" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from "vue-router";

// 注册 GSAP ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

const router = useRouter();

// 功能数据（包含三个宣传点）
const features = [
  {
    badge: '负荷预测',
    title: '日前负荷预测',
    description: '基于国际获奖算法模型，提供业界领先的预测精度',
    listItems: [
      '总负荷平均预测精度97%',
      '医院商超单一客户平均预测精度96%',
      '工业制造单一客户平均预测精度91%',
      '已为多家大型售电公司节省数百万成本',
    ],
    imgSrc: 'https://pmac.leyi.host/downloads/features/load.jpg',
  },
  {
    badge: '光伏发电',
    title: '光伏发电预测',
    description: '精准预测光伏发电量，最大化绿色能源收益',
    listItems: [
      '国家级气象数据支持',
      '日前预测晴天平均误差3.68%',
      '日前预测阴天平均误差5.74%',
      '已成功服务200+光伏站点',
    ],
    imgSrc: 'https://pmac.leyi.host/downloads/features/pv.jpg',
  },
  {
    badge: '光储定容',
    title: '光储定容',
    description: '科学规划储能容量，实现投资回报最大化',
    listItems: [
      '综合考虑电价与需量，平均可缩减峰值需量10%-30%',
      '1000+场景模型生成',
      '全国范围多尺度光伏数据支撑',
      '支持期望成本与风险分析',
    ],
    imgSrc: 'https://pmac.leyi.host/downloads/features/storage.jpg',
  },
];

// DOM 引用
const sectionRef = ref(null);
const blockRefs = ref([]);          // 每个功能块的根容器
const textRefs = ref([]);           // 每个块的文本区域
const imageRefs = ref([]);          // 每个块的图片区域容器 (.image-content)

// 辅助函数：设置 ref 数组（确保索引对应）
const setBlockRef = (el, index) => {
  if (el) blockRefs.value[index] = el;
};
const setTextRef = (el, index) => {
  if (el) textRefs.value[index] = el;
};
const setImageRef = (el, index) => {
  if (el) imageRefs.value[index] = el;
};

// 高亮文本中的百分比数值（如 97%、3.68%、10%-30% 等）
const highlightNumbers = (text) => {
  // 正则匹配：整数/小数百分比，以及范围百分比（如10%-30%会被拆成两个分别高亮，也可以接受）
  // 为了更友好，匹配包含 % 的数字部分（包括负号、小数点、范围连接符-，但保留原文）
  // 这里简单处理：匹配任意包含%的连续字符（非空白），保证不会破坏HTML
  return text.replace(/(\d+(?:\.\d+)?%|[-]?\d+%[-]\d+%|[-]?\d+\.\d+%|\d+%-\d+%)/g, (match) => {
    // 进一步确保只高亮真正含%的数值（match一定含%）
    return `<span class="highlight-number">${match}</span>`;
  });
};

// 视频入口点击处理（占位，可根据实际需求扩展）
const handleVideoClick = () => {
  // 例如触发事件、打开弹窗或跳转
  console.log('视频介绍入口点击 - 可接入视频播放逻辑');
  // 可以改为 this.$emit('play-video') 或 router.push 等
  router.push({name:'load_example'})
};

// GSAP 上下文
let ctx;

onMounted(async () => {
  // 等待 DOM 更新，确保所有 ref 已填充
  await nextTick();

  // 创建 GSAP 上下文，所有动画自动绑定到当前组件
  ctx = gsap.context(() => {
    // 遍历每个功能块，分别创建动画
    features.forEach((_, index) => {
      const block = blockRefs.value[index];
      const textEl = textRefs.value[index];
      const imageEl = imageRefs.value[index];
      if (!block || !textEl || !imageEl) return;

      // 获取图片包装层 (.image-wrapper) 用于弹性缩放动画
      const imageWrapper = imageEl.querySelector('.image-wrapper');
      if (!imageWrapper) return;

      // 判断是否为反向布局（图片在左，文本在右）
      const isReverse = index % 2 === 1;

      // 文本动画：根据布局方向决定滑入方向
      gsap.from(textEl, {
        scrollTrigger: {
          trigger: block,
          start: 'top 80%',          // 当块的顶部到达视口80%时开始
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        x: isReverse ? 50 : -50,      // 反向块文本从右侧滑入，否则从左侧
        duration: 1,
        ease: 'power2.out',
      });

      // 图片容器动画 (.image-content) 滑入
      gsap.from(imageEl, {
        scrollTrigger: {
          trigger: block,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        x: isReverse ? -50 : 50,      // 反向块图片从左侧滑入，否则从右侧
        duration: 1,
        delay: 0.15,                  // 轻微错开
        ease: 'power2.out',
      });

      // 图片包装层弹性放大出场
      gsap.from(imageWrapper, {
        scrollTrigger: {
          trigger: block,
          start: 'top 80%',
        },
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: 'backOut(1.2)',
      });
    });
  }, sectionRef); // 作用域限定在 features-intro 内
});

onUnmounted(() => {
  // 清理 GSAP 上下文及 ScrollTrigger 实例
  if (ctx) ctx.revert();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
});
</script>

<style lang="scss" scoped>
.features-intro {
  padding: 80px 0;
  background: #f9fafc;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    padding: 50px 0;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ===== 新增头部样式 ===== */
  .intro-header {
    text-align: center;
    margin-bottom: 70px;
    position: relative;

    h2 {
      font-size: 3.2rem;
      font-weight: 800;
      background: linear-gradient(145deg, #1a2b4c, #2b7cff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
      letter-spacing: -0.5px;
      @media (max-width: 768px) {
        font-size: 2.4rem;
      }
    }

    .subtitle {
      font-size: 1.3rem;
      line-height: 1.6;
      color: #4a5a72;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(4px);
      display: inline-block;
      padding: 12px 32px;
      border-radius: 60px;
      box-shadow: 0 10px 25px rgba(0, 20, 50, 0.08);
      border: 1px solid rgba(43, 124, 255, 0.15);

      br {
        display: none; // 桌面版不需要换行，移动版通过样式控制换行
      }

      @media (max-width: 768px) {
        font-size: 1.1rem;
        padding: 12px 20px;
        br {
          display: inline; // 移动版显示br换行
        }
      }
    }

    .header-decoration {
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, transparent, #2b7cff, #42d3ff, transparent);
      margin: 25px auto 0;
      border-radius: 4px;
    }
  }

  /* 每个功能块 */
  .feature-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    align-items: center;
    margin-bottom: 100px;

    &:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 992px) {
      gap: 40px;
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
      margin-bottom: 80px;
    }

    /* 反向布局：图片在左，文本在右 (通过 order 实现) */
    &.reverse-layout {
      .text-content {
        order: 2;   /* 文本列移到右侧 */
      }
      .image-content {
        order: 1;   /* 图片列移到左侧 */
      }
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

    h3 {
      font-size: 2.2rem;
      font-weight: 700;
      color: #1d3b6c;
      line-height: 1.3;
      margin-bottom: 16px;

      @media (max-width: 992px) {
        font-size: 1.9rem;
      }

      @media (max-width: 768px) {
        font-size: 1.8rem;
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
      margin: 0 0 20px;

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

        /* 高亮数字样式 */
        :deep(.highlight-number) {
          font-weight: 700;
          color: #2b7cff;
          background: rgba(43, 124, 255, 0.08);
          padding: 0 4px;
          border-radius: 6px;
          display: inline-block;
          font-size: 1.1em;
          transition: all 0.2s;
          border-bottom: 1px dashed rgba(43, 124, 255, 0.3);
        }
      }
    }

    /* 视频提示入口 */
    .video-prompt {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-top: 15px;
      padding: 10px 22px;
      background: rgba(43, 124, 255, 0.05);
      border: 1px solid rgba(43, 124, 255, 0.3);
      border-radius: 40px;
      color: #1d3b6c;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
      font-size: 0.95rem;

      i {
        color: #2b7cff;
        font-size: 1.3rem;
        transition: transform 0.2s;
      }

      &:hover {
        background: rgba(43, 124, 255, 0.15);
        border-color: #2b7cff;
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(43, 124, 255, 0.15);

        i {
          transform: scale(1.1);
        }
      }
    }
  }

  /* 右侧图片区域 - 完全展示图片，无圆角，无裁剪 */
  .image-content {
    display: flex;
    justify-content: center;
    align-items: center; /* 垂直方向也居中 */

    .image-wrapper {
      width: 100%;
      /* 移除圆角、aspect-ratio、overflow: hidden */
      background: #0b1a2f; /* 深色背景，适配图片加载或透明区域 */
      box-shadow: 0 30px 50px -20px rgba(0, 0, 0, 0.4);
      transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1),
                  box-shadow 0.4s ease;

      &:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.5);
      }

      img {
        width: 100%;
        height: auto;        /* 让高度自适应，保持原始比例 */
        display: block;
        /* 移除 object-fit: cover，避免裁剪 */
        background: #0b1a2f; /* 占位背景 */
      }
    }
  }

  /* 移动端覆盖 order 调整，确保堆叠顺序正常 */
  @media (max-width: 768px) {
    .feature-block.reverse-layout {
      .text-content, .image-content {
        order: unset; /* 恢复自然顺序：文本在上，图片在下 */
      }
    }
    .intro-header .subtitle br {
      display: inline; /* 强制换行 */
    }
  }

  /* 额外点缀：整体背景光晕 */
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle at 30% 30%, rgba(43,124,255,0.03), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle at 70% 70%, rgba(66,211,255,0.03), transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .container {
    position: relative;
    z-index: 2;
  }
}
</style>