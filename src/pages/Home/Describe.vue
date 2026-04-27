<template>
  <div class="features-container">
    <!-- 标题和介绍部分 -->
    <div class="intro-section">
      <div class="lead text-center intro-text">
        <p class="title display-4 fw-bold text-center">
          智算新能源全链运营，驱动绿色未来
        </p>
        新能源资产运营，依托先进的算法引擎与创新技术体系，用创新技术为行业注入精准与高效，从预测到规划，从效益评估到安全守护，为售电与微电网用户筑牢发展根基。
      </div>
    </div>

    <!-- 功能模块区域 - 左右交替布局 -->
    <div class="features-modules">
      <!-- 负荷预测模块 - 奇数行：左图右文 -->
      <div class="feature-module" ref="loadModule">
        <div class="module-card">
          <div class="module-container">
            <div class="image-side">
              <div class="image-wrapper">
                <img
                  src="https://pmac.leyi.host/downloads/pmac/describe/load.png"
                  alt="负荷预测"
                  class="feature-image"
                />
                <div class="image-overlay"></div>
              </div>
            </div>
            <div class="content-side">
              <div class="content-wrapper">
                <h2 class="module-title">负荷预测（日前）</h2>
                <p class="module-description">
                  提供D-4预测D+1和D-1预测D+1两种日前预测方式。采用群体特征聚类分析与差异化建模融合的预测范式，通过动态感知技术实现用户群体的精准分类建模。创新性构建新能源耦合解析模块，通过自有光伏发电-负荷解耦技术实现净负荷特征空间重构。针对不同行业负荷特性差异，设计自适应特征选择引擎，融合多周期时空关联算子与动态残差补偿机制，构建抗扰动能力的预测拓扑架构。
                </p>
                <div class="module-tip">
                  <div class="tip-icon">
                    <el-icon><InfoFilled /></el-icon>
                  </div>
                  <div class="tip-content">
                    <p class="tip-text">
                      自动滚动的96点负荷预测需要一定的硬件基础支持。请联系我们进行咨询。
                    </p>
                    <p class="contact-info">
                      {{
                        `联系电话：${isTrina ? "15919159383" : "18679510800"}（微信同号）`
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 光伏发电预测模块 - 偶数行：右图左文 -->
      <div class="feature-module" ref="pvModule">
        <div class="module-card">
          <div class="module-container">
            <div class="content-side">
              <div class="content-wrapper">
                <h2 class="module-title">光伏发电预测（日前）</h2>
                <p class="module-description">
                  提供未来多日的96点预测。采用融合多个数值气象源的先进预测框架，通过对气象数值预报特征与发电模式的深度挖掘，实现对不同天气类型的精准聚类与动态识别。针对每一类特定天气工况，采用Model Stacking技术，融合多个异构预测器的优势，在特征空间与模型层面进行双重优化，有效捕捉光伏出力在不同气象条件下的复杂非线性规律。
                </p>
                <div class="module-tip">
                  <div class="tip-icon">
                    <el-icon><InfoFilled /></el-icon>
                  </div>
                  <div class="tip-content">
                    <p class="tip-text">
                      自动滚动的96点光伏发电预测需要一定的硬件基础支持。请联系我们进行咨询。
                    </p>
                    <p class="contact-info">
                      {{
                        `联系电话：${isTrina ? "15919159383" : "18679510800"}（微信同号）`
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="image-side">
              <div class="image-wrapper">
                <img
                  src="https://pmac.leyi.host/downloads/pmac/describe/pv.png"
                  alt="光伏发电预测"
                  class="feature-image"
                />
                <div class="image-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 光储定容模块 - 奇数行：左图右文 -->
      <div class="feature-module" ref="storageModule">
        <div class="module-card">
          <div class="module-container">
            <div class="image-side">
              <div class="image-wrapper">
                <img
                  src="https://pmac.leyi.host/downloads/pmac/describe/light.png"
                  alt="光储定容"
                  class="feature-image"
                />
                <div class="image-overlay"></div>
              </div>
            </div>
            <div class="content-side">
              <div class="content-wrapper">
                <h2 class="module-title">光储定容</h2>
                <p class="module-description">
                  以工程-经济耦合优化为核心，把日内功率调度与长期投资口径同时纳入混合整数非线性规划（​​MINLP）框架，通过多时级能量平衡、SOC限制与充放电互斥等物理约束保证运行可行性，并将需量电费、分时电价与电池退化成本等并入运行费用。
                  采用分式优化求最优规模与运行策略。模型输出兼顾工程可实施性与财务可行性，为技术决策与投融资评审提供量化依据。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术优势部分 -->
    <div class="tech-section">
      <h2 class="section-title">我们的技术优势</h2>
      <div class="tech-grid">
        <div class="tech-item">
          <div class="tech-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <h4>海量数据训练</h4>
          <p>基于全球能源网络数据构建训练模型</p>
        </div>
        <div class="tech-item">
          <div class="tech-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <h4>AI智能算法</h4>
          <p>融合深度学习和时间序列分析技术</p>
        </div>
        <div class="tech-item">
          <div class="tech-icon">
            <el-icon><Cloudy /></el-icon>
          </div>
          <h4>气象数据融合</h4>
          <p>整合全球气象卫星实时数据</p>
        </div>
        <div class="tech-item">
          <div class="tech-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <h4>金融级安全</h4>
          <p>端到端加密与数据隐私保护</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  DataAnalysis,
  Cpu,
  Cloudy,
  Lock,
  InfoFilled,
} from "@element-plus/icons-vue";

const isTrina = import.meta.env.VITE_COMPANY == "trina";

// 滚动动画相关
const loadModule = ref(null);
const pvModule = ref(null);
const storageModule = ref(null);

let observers = [];

const setupScrollAnimation = () => {
  const options = {
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
      }
    });
  }, options);

  // 观察所有模块
  [loadModule.value, pvModule.value, storageModule.value].forEach((module) => {
    if (module) {
      observer.observe(module);
      observers.push(observer);
    }
  });
};

onMounted(() => {
  setupScrollAnimation();
});

onUnmounted(() => {
  observers.forEach((observer) => observer.disconnect());
});
</script>

<style lang="scss" scoped>
.features-container {
  background: linear-gradient(135deg, #f5f9ff 0%, #e6f0ff 100%);
  padding: 4rem 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
}

.intro-section {
  max-width: 1000px;
  margin: 0 auto 6rem;
  text-align: center;

  .intro-text {
    .title {
      color: #1d3b6c;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 30px;
      &::after {
        content: "";
        display: block;
        width: 600px;
        height: 4px;
        background: linear-gradient(90deg, #3a8ffe, #00c6ff);
        margin: 15px auto 0;
        border-radius: 2px;
      }
    }
    font-size: 1.25rem;
    line-height: 1.8;
    color: #4a6582;
    margin-top: 1.5rem;
    background: rgba(255, 255, 255, 0.7);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 100, 0.05);
  }
}

.features-modules {
  max-width: 1400px;
  margin: 0 auto;
}

.feature-module {
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  &:last-child {
    margin-bottom: 4rem;
  }
}

.module-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.4s ease;

  &:hover {
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
    transform: translateY(-5px);
  }
}

.module-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;

  &.reverse {
    direction: rtl;

    > * {
      direction: ltr;
    }
  }
}

.image-side {
  position: relative;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px -12px rgba(0, 0, 0, 0.15);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  .module-card:hover & {
    transform: scale(1.02);
    box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.2);
  }
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.feature-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.6s ease;

  .module-card:hover & {
    transform: scale(1.08);
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(58, 143, 254, 0.1) 0%,
    rgba(0, 198, 255, 0.1) 100%
  );
  opacity: 0;
  transition: all 0.4s ease;

  .module-card:hover & {
    opacity: 1;
  }
}

.content-side {
  padding: 1rem;
}

.content-wrapper {
  max-width: 500px;
  margin: 0 auto;
}

.module-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a3a5f;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #3a8ffe 0%, #00c6ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3a8ffe, #00c6ff);
    border-radius: 2px;
  }
}

.module-description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a6582;
  margin-bottom: 2rem;
  text-align: justify;
}

.module-tip {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
  border-left: 4px solid #3a8ffe;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(58, 143, 254, 0.1);

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 8px 25px rgba(58, 143, 254, 0.15);
  }
}

.tip-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a8ffe 0%, #00c6ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  i {
    font-size: 1.2rem;
  }
}

.tip-content {
  flex: 1;
}

.tip-text {
  color: #2c5282;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.contact-info {
  color: #2b6cb0;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
}

/* 技术优势部分样式保持不变 */
.tech-section {
  max-width: 1200px;
  margin: 6rem auto;

  .section-title {
    text-align: center;
    margin-bottom: 3rem;
    font-weight: 700;
    color: #1a3a5f;
    position: relative;

    &::after {
      content: "";
      display: block;
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #3a8ffe, #00c6ff);
      margin: 0.5rem auto 0;
      border-radius: 2px;
    }
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;

    .tech-item {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 5px 20px rgba(0, 82, 204, 0.05);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .tech-icon {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: linear-gradient(135deg, #e6f0ff 0%, #d0e3ff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;

        i {
          font-size: 2rem;
          color: #3a8ffe;
        }
      }

      h4 {
        font-weight: 700;
        color: #1a3a5f;
        margin-bottom: 0.75rem;
      }

      p {
        color: #7a92b0;
        margin: 0;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .module-container {
    gap: 2.5rem;
  }
}

@media (max-width: 992px) {
  .module-container {
    grid-template-columns: 1fr;
    gap: 2rem;

    &.reverse {
      direction: ltr;
    }
  }

  .image-side {
    min-height: 280px;
  }

  .content-wrapper {
    max-width: 100%;
  }

  .module-card {
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .features-container {
    padding: 2rem 1rem;
  }

  .intro-section {
    .display-4 {
      font-size: 2rem;
    }

    .lead {
      font-size: 1rem;
    }

    .intro-text .title::after {
      width: 300px;
    }
  }

  .module-title {
    font-size: 1.7rem;
  }

  .module-description {
    font-size: 1rem;
  }

  .module-tip {
    flex-direction: column;
    text-align: center;

    &:hover {
      transform: translateY(-3px);
    }
  }

  .module-card {
    padding: 1.5rem;
  }
}

/* 滚动动画延迟 */
.feature-module:nth-child(1) {
  transition-delay: 0.1s;
}

.feature-module:nth-child(2) {
  transition-delay: 0.2s;
}

.feature-module:nth-child(3) {
  transition-delay: 0.3s;
}
</style>
