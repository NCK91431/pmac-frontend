import axios from "axios";
import { useMembershipStore } from "@/store/membership";

const baseURLMap = {
    pilot: "https://energyun.com.cn",
    test: "https://api.pmac.leyi.host",
    trina: "https://trinapower.leyi.host",
    local: "http://localhost:3001",
};

const currentEnv = import.meta.env.VITE_COMPANY || "pilot";
const baseURL = baseURLMap[currentEnv] || baseURLMap.pilot;

// 创建axios实例
const service = axios.create({
    baseURL,
    // timeout: 10000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 可在此处添加token等全局参数
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers["authorization"] = token; // 将令牌添加到 Authorization 头
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 返回完整的响应对象，而不是response.data
        return response;
    },
    (error) => {
        // 统一处理错误
        console.error("API Error:", error.response?.data || error.message);

        // 处理token过期
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED"
        ) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userInfo");
            // 跳转到登录页，并携带当前页面路径用于登录后跳回
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&expired=1`;
        }

        // 处理会员权限不足（后端 requireMembership 返回）：
        // 软拦截——清理缓存并弹出会员引导弹窗，不强制跳转（跳转由用户点击弹窗按钮触发）
        if (
            error.response?.status === 403 &&
            error.response?.data?.code === "MEMBERSHIP_REQUIRED"
        ) {
            localStorage.removeItem("membershipStatus");
            useMembershipStore().openGate();
            // 标记为会员门禁拦截：页面 catch 应静默处理（不弹红色错误提示），
            // 避免"数据加载失败"与会员引导弹窗同时出现，让用户误以为系统报错
            error.__membershipGate = true;
        }

        return Promise.reject(error);
    },
);

export default service;
