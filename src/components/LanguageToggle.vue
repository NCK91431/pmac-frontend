<template>
  <div class="language-toggle" @click="toggleLanguage">
    <div
      class="toggle-container"
      :class="{ 'en-active': currentLocale === 'en-US' }"
    >
      <span class="lang-text zh">中</span>
      <span class="lang-text en">EN</span>
      <div class="toggle-slider"></div>
    </div>
    <span class="toggle-label">
      {{ currentLocale === "zh-CN" ? "中文" : "English" }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

// 当前语言
const currentLocale = computed(() => locale.value);

// 切换语言
const toggleLanguage = () => {
  const newLocale = currentLocale.value === "zh-CN" ? "en-US" : "zh-CN";
  locale.value = newLocale;
  localStorage.setItem("language", newLocale);

  // 更新页面标题等
  document.documentElement.lang = newLocale;
  document.title = getPageTitle(newLocale);
};

// 根据语言获取页面标题
const getPageTitle = (lang) => {
  if (lang === "en-US") {
    return "Spark Platform - Smart Energy Solutions";
  }
  return "星火平台 - 智慧能源解决方案";
};

// 初始化时设置语言
const savedLang = localStorage.getItem("language");
if (savedLang) {
  locale.value = savedLang;
  document.documentElement.lang = savedLang;
  document.title = getPageTitle(savedLang);
}
</script>

<style lang="scss" scoped>
/* 保持原有样式不变 */
.language-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 768px) {
    padding: 6px 10px;

    .toggle-label {
      display: none;
    }
  }
}

.toggle-container {
  position: relative;
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  padding: 0 4px;
  margin-right: 8px;

  .lang-text {
    flex: 1;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    z-index: 2;
    transition: color 0.3s;

    &.zh {
      color: #fff;
    }

    &.en {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  &.en-active {
    .lang-text {
      &.zh {
        color: rgba(255, 255, 255, 0.6);
      }

      &.en {
        color: #fff;
      }
    }

    .toggle-slider {
      transform: translateX(30px);
    }
  }

  .toggle-slider {
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd04b, #ffa726);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    left: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
}
</style>
