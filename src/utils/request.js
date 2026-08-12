import axios from "axios";
import { useMembershipStore } from "@/store/membership";
import hmacSha256 from "./hmacSha256.js";

const baseURLMap = {
    pilot: "https://energyun.com.cn",
    test: "https://api.pmac.leyi.host",
    trina: "https://trinapower.leyi.host",
    local: "http://localhost:3001",
};

const currentEnv = import.meta.env.VITE_COMPANY || "pilot";
const baseURL = baseURLMap[currentEnv] || baseURLMap.pilot;

// 前后端约定的硬编码盐（仅混淆层；必须与后端 middlewares/signature.js 的 SIGN_PEPPER 一致）
const SIGN_PEPPER = "piano-star-sign-pepper-v1";
// 需要动态签名的受保护路径（必须与后端挂载 requireSignature 的路由一致）
const PROTECTED_PATHS = ["/api/node-price/price-chart", "/api/settlement-price/analysis"];

// 创建axios实例
const service = axios.create({
    baseURL,
    // timeout: 10000, // 请求超时时间
});

// 获取/懒获取当前用户签名密钥（老用户首次访问受保护接口时自动调 /api/auth/sign-key 缓存）
async function ensureSignKey() {
    const cached = localStorage.getItem("signKey");
    if (cached) return cached;
    const res = await service.get("/api/auth/sign-key");
    const signKey = res.data?.signKey;
    if (!signKey) throw new Error("无法获取签名密钥");
    localStorage.setItem("signKey", signKey);
    return signKey;
}

// 请求拦截器
service.interceptors.request.use(
    async (config) => {
        // 可在此处添加token等全局参数
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers["authorization"] = token; // 将令牌添加到 Authorization 头
        }

        // 受保护接口：附加动态签名（timestamp/nonce/sign，每次请求均不同）
        const path = (config.url || "").split("?")[0];
        if (token && PROTECTED_PATHS.includes(path)) {
            const signKey = await ensureSignKey();
            const timestamp = String(Date.now());
            const nonce = `${timestamp}${Math.random().toString(36).slice(2)}`;
            const sign = await hmacSha256(signKey, `${path}${timestamp}${nonce}${SIGN_PEPPER}`);
            config.params = { ...(config.params || {}), timestamp, nonce, sign };
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
        // 登录/注册等响应携带 signKey 时存入本地（统一在此缓存，调用方无需改动）
        if (response.data?.signKey) {
            localStorage.setItem("signKey", response.data.signKey);
        }
        // 返回完整的响应对象，而不是response.data
        return response;
    },
    (error) => {
        // 统一处理错误
        console.error("API Error:", error.response?.data || error.message);

        // 签名校验失败（SIGN_*）：本地 signKey 可能过期/与库中不匹配，清除后重试一次
        if (
            error.response?.status === 401 &&
            typeof error.response?.data?.code === "string" &&
            error.response.data.code.startsWith("SIGN_")
        ) {
            localStorage.removeItem("signKey");
            const originalConfig = error.config;
            if (originalConfig && !originalConfig.__signRetried) {
                originalConfig.__signRetried = true;
                return service(originalConfig);
            }
        }

        // 处理token过期
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === "TOKEN_EXPIRED"
        ) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userInfo");
            localStorage.removeItem("signKey");
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
