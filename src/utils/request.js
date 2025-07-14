import axios from "axios";

// 创建axios实例
const service = axios.create({
    // baseURL: "https://api.pmac.leyi.host", // 后端基础地址
    baseURL: "http://localhost:3001",
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
    }
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
    }
);

export default service;
