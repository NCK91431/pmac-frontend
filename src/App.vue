<template>
  <HeaderSection @update:headerHeight="handleHeaderHeight" />
  <div class="page-content" :style="contentStyle">
    <Breadcrumb @update:breadcrumbHeight="handleBreadcrumbHeight" />
    <RouterView />
  </div>
  <HomeFooter v-if="showFooter" @update:footerHeight="handleFooterHeight" />
  
  <div v-if="showUpdateModal" class="update-modal-overlay">
    <div class="update-modal">
      <div class="update-modal-header">
        <i class="bi bi-info-circle"></i>
        <span>系统更新提示</span>
      </div>
      <div class="update-modal-body">
        <p>检测到系统有新版本可用，请刷新页面以使用最新版本</p>
        <p class="version-info">当前版本: {{ updateInfo.currentVersion }}</p>
        <p class="version-info">最新版本: {{ updateInfo.latestVersion }}</p>
      </div>
      <div class="update-modal-footer">
        <button class="btn btn-primary" @click="handleRefresh">立即刷新</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, computed } from "vue";
import HeaderSection from "./components/HeaderSection.vue";
import Breadcrumb from "./components/Breadcrumb.vue";
import HomeFooter from "./components/HomeFooter.vue";
import { checkForUpdate, refreshPage } from "./utils/versionCheck";

const user = ref(null);
const showUpdateModal = ref(false);
const updateInfo = ref({
  currentVersion: '0.0.0',
  latestVersion: '0.0.0'
});

onMounted(() => {
  const showHint = localStorage.getItem("showTranslateHint");
  if (!showHint) {
    setTimeout(() => {
      console.log("提示：如需英文版，可使用浏览器翻译功能");
    }, 3000);
    localStorage.setItem("showTranslateHint", "true");
  }
  const storedUser = localStorage.getItem("userInfo");
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser);
    } catch (e) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("authToken");
    }
  }
  
  checkVersionUpdate();
});

const checkVersionUpdate = async () => {
  const result = await checkForUpdate();
  if (result.hasUpdate) {
    updateInfo.value = {
      currentVersion: result.currentVersion,
      latestVersion: result.latestVersion
    };
    showUpdateModal.value = true;
  }
};

const handleRefresh = () => {
  showUpdateModal.value = false;
  refreshPage();
};

// 更新用户状态的方法
function updateUser(userInfo, authToken) {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("authToken");
  localStorage.setItem("authToken", authToken);
  localStorage.setItem("userInfo", JSON.stringify(userInfo)); // 将对象转换为 JSON 字符串存储
  user.value = userInfo; // 更新响应式状态
}

// 清除用户状态（登出）
function clearUser() {
  user.value = null;
  localStorage.removeItem("userInfo");
  localStorage.removeItem("authToken");
}

// 向所有子组件提供用户状态和方法
provide("user", user);
provide("updateUser", updateUser);
provide("clearUser", clearUser);

// 存储 header 高度
const headerHeight = ref(0);
const footerHeight = ref(0);
const breadcrumbHeight = ref(0);

const showFooter = import.meta.env.VITE_COMPANY === "pilot";

// 提供headerHeight给所有子组件
provide("headerHeight", headerHeight);

// 提供breadcrumbHeight给所有子组件
provide("breadcrumbHeight", breadcrumbHeight);

// 接收 header 传递的高度
const handleHeaderHeight = (height) => {
  headerHeight.value = height;
};
// 接收 breadcrumb 传递的高度
const handleBreadcrumbHeight = (height) => {
  breadcrumbHeight.value = height;
};
// 接收 footer 传递的高度
const handleFooterHeight = (height) => {
  footerHeight.value = height;
};

// 计算内容区域样式（关键修改）
const contentStyle = computed(() => ({
  marginTop: `${headerHeight.value}px`,
  minHeight: `calc(100vh - ${headerHeight.value}px - ${footerHeight.value}px)`,
}));
</script>

<style scoped>
.page-content {
  background-color: #e6e8ea;
  overflow-x: hidden;
  box-sizing: border-box;
}

.update-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.update-modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.update-modal-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.update-modal-header i {
  margin-right: 8px;
  color: #3b82f6;
  font-size: 24px;
}

.update-modal-body {
  padding: 20px;
}

.update-modal-body p {
  margin: 0 0 8px 0;
  color: #374151;
}

.update-modal-body .version-info {
  font-size: 14px;
  color: #6b7280;
}

.update-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
}
</style>
