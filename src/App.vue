<template>
    <HeaderSection @update:headerHeight="handleHeaderHeight" />
    <div class="page-content" :style="contentStyle">
        <Breadcrumb />
        <RouterView />
    </div>
    <HomeFooter @update:footerHeight="handleFooterHeight" />
</template>

<script setup>
import { ref, provide, onMounted, computed } from "vue";
import HeaderSection from "./components/HeaderSection.vue";
import Breadcrumb from "./components/Breadcrumb.vue";
import HomeFooter from "./components/HomeFooter.vue";
// 用户状态响应式变量
const user = ref(null);

// 初始化时检查本地存储
onMounted(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
        try {
            user.value = JSON.parse(storedUser);
        } catch (e) {
            localStorage.removeItem("userInfo");
            localStorage.removeItem("authToken");
        }
    }
});

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
// 接收 header 传递的高度
const handleHeaderHeight = (height) => {
    headerHeight.value = height;
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
</style>
