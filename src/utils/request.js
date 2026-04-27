import axios from "axios";

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
        return response; // 关键修改：返回整个响应对象
    },
    (error) => {
        // 统一处理错误
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    },
);

export default service;
