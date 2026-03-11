import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: "home",
        },
        {
            path: "/home",
            name: "home",
            component: () => import("@/pages/Home/Home.vue"),
        },
        {
            path: "/loadpre",
            name: "loadpre",
            component: () => import("../pages/Load/LoadPre.vue"),
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/pages/Home/LoginRegister.vue"),
        },
        {
            path: "/modifyuser",
            name: "modifyuser",
            component: () => import("@/pages/Home/ModifyUserInfo.vue"),
        },
        {
            path: "/product_intro",
            name: "product_intro",
            component: () => import("@/pages/Home/ProductIntro/index.vue"),
        },
        {
            path: "/about_us",
            name: "about_us",
            component: () => import("@/pages/Home/Aboutus.vue"),
        },
        {
            path: "/describe",
            name: "describe",
            component: () => import("@/pages/Home/Describe.vue"),
        },
        {
            path: "/light",
            name: "light",
            component: () => import("../pages/Light/LightPre.vue"),
        },
        {
            path: "/elec",
            name: "elec",
            component: () => import("../pages/Elec/ElecPre.vue"),
        },
        {
            path: "/loadcompare/:recordId?",
            name: "LoadCompare",
            component: () =>
                import("../pages/Load/HistorySection/LoadCompare.vue"),
        },
        {
            path: "/eleccompare/:recordId?",
            name: "ElecCompare",
            component: () =>
                import("../pages/Elec/HistorySection/ElecCompare.vue"),
        },
        {
            path: "/elec_example",
            name: "elec_example",
            component: () => import("@/pages/Elec/HistorySection/Example.vue"),
        },
        {
            path: "/load_example",
            name: "load_example",
            component: () => import("@/pages/Load/HistorySection/Publicity.vue"),
        },
        {
            path: "/light_example",
            name: "light_example",
            component: () => import("@/pages/Light/HistorySection/Example.vue"),
        },
        {
            path: "/health",
            name: "health",
            component: () => import("@/pages/Health/index.vue"),
        },
        {
            path: "/product_EGate10",
            name: "product_EGate10",
            component: () => import("@/pages/Products/EGate10.vue"),
        },
        {
            path: "/product_BMS",
            name: "product_BMS",
            component: () => import("@/pages/Products/BMS.vue"),
        },
        {
            path: "/product_BMSPLUS",
            name: "product_BMSPLUS",
            component: () => import("@/pages/Products/BMSPLUS.vue"),
        },
        {
            path: "/product_BMU",
            name: "product_BMU",
            component: () => import("@/pages/Products/BMU.vue"),
        },
        /* 节点电价查询 */
        {
            path: "/price-analysis",
            name: "price_analysis",
            component: () => import("@/pages/PriceAnalysis/Page.vue"),
        },
        /* 虚拟电厂广告 */
        {
            path: "/VirtualPowerPlant",
            name: "VirtualPowerPlant",
            component: () => import("@/pages/VirtualPowerPlantPage/index.vue"),
        },
        /* 访问统计与文件管理 */
        {
            path: "/admin/access-stats",
            name: "AccessStats",
            component: () => import("@/pages/Admin/AccessStats.vue"),
        },
    ],
});

export default router;
