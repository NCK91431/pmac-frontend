<template>
    <HeaderSection />
    <div class="page-content">
        <RouterView />
    </div>
    <HomeFooter />
</template>

<script setup>
import { ref, provide, onMounted } from "vue";
import HomeFooter from "./components/HomeFooter.vue";
import HeaderSection from "./components/HeaderSection.vue";

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
    user.value = userInfo;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("userInfo", userInfo);
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
</script>

<style scoped>
.page-content {
    background-color: #e6e8ea;
    width: 100vw;
    min-height: calc(100vh - 405px);
    overflow-x: hidden;
}
</style>
