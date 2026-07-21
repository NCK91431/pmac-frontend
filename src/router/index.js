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
            meta: {
                showFooter: true,
                breadcrumb: { title: "首页", icon: "bi bi-house" },
            },
        },
        {
            path: "/loadpre",
            name: "loadpre",
            component: () => import("../pages/Load/LoadPre.vue"),
            meta: {
                module: "load",
                breadcrumb: { title: "负荷预测", icon: "bi bi-lightning-charge" },
            },
        },
        {
            path:"/loadpre-history",
            name:"loadpre_history",
            component: () => import("../pages/Load/LoadHistory.vue"),
            meta: {
                breadcrumb: {
                    title: "已建模型",
                    icon: "bi bi-clock-history",
                },
            },
        },
        {
            path: "/login",
            name: "login",
            component: () => import("@/pages/Home/LoginRegister.vue"),
            meta: {
                breadcrumb: { title: "登录", icon: "bi bi-box-arrow-in-right" },
            },
        },
        {
            path: "/modifyuser",
            name: "modifyuser",
            component: () => import("@/pages/Home/ModifyUserInfo.vue"),
            meta: {
                breadcrumb: { title: "用户设置", icon: "bi bi-person-gear" },
            },
        },
        {
            path: "/product_intro",
            name: "product_intro",
            component: () => import("@/pages/Home/ProductIntro/index.vue"),
            meta: {
                breadcrumb: { title: "产品介绍", icon: "bi bi-info-circle" },
            },
        },
        {
            path: "/about_us",
            name: "about_us",
            component: () => import("@/pages/Home/Aboutus.vue"),
            meta: {
                showFooter: true,
                breadcrumb: { title: "关于我们", icon: "bi bi-people" },
            },
        },
        {
            path: "/describe",
            name: "describe",
            component: () => import("@/pages/Home/Describe.vue"),
            meta: {
                showFooter: true,
                breadcrumb: { title: "功能介绍", icon: "bi bi-journal-text" },
            },
        },
        {
            path: "/light",
            name: "light",
            component: () => import("../pages/Light/LightPre.vue"),
            meta: {
                module: "light",
                breadcrumb: { title: "光储定容", icon: "bi bi-sun" },
            },
        },
        {
            path: "/elec",
            name: "elec",
            component: () => import("../pages/Elec/ElecPre.vue"),
            meta: {
                module: "elec",
                breadcrumb: { title: "光伏发电预测", icon: "bi bi-lightning" },
            },
        },
        {
            path: "/loadcompare/:recordId?",
            name: "LoadCompare",
            component: () => import("../pages/Load/HistorySection/LoadCompare.vue"),
            meta: {
                module: "load",
                breadcrumb: {
                    title: "回测分析",
                    icon: "bi bi-graph-up-arrow",
                    parentRouteName: "loadpre",
                    titleFormatter: (route) =>
                        route.params.recordId
                            ? `回测分析 - 记录 ${route.params.recordId}`
                            : "回测分析",
                },
            },
        },
        {
            path: "/eleccompare/:recordId?",
            name: "ElecCompare",
            component: () => import("../pages/Elec/HistorySection/ElecCompare.vue"),
            meta: {
                module: "elec",
                breadcrumb: {
                    title: "回测分析",
                    icon: "bi bi-graph-up-arrow",
                    parentRouteName: "elec",
                    titleFormatter: (route) =>
                        route.params.recordId
                            ? `回测分析 - 记录 ${route.params.recordId}`
                            : "回测分析",
                },
            },
        },
        {
            path: "/elec_example",
            name: "elec_example",
            component: () => import("@/pages/Elec/HistorySection/Example.vue"),
            meta: {
                module: "elec",
                showFooter: true,
                breadcrumb: {
                    title: "光伏发电预测-案例展示",
                    icon: "bi bi-bookmark-check",
                },
            },
        },
        {
            path: "/load_example",
            name: "load_example",
            component: () => import("@/pages/Load/HistorySection/Publicity.vue"),
            meta: {
                module: "load",
                showFooter: true,
                breadcrumb: {
                    title: "负荷预测-案例展示",
                    icon: "bi bi-bookmark-check",
                },
            },
        },
        {
            path: "/light_example",
            name: "light_example",
            component: () => import("@/pages/Light/HistorySection/Example.vue"),
            meta: {
                module: "light",
                showFooter: true,
                breadcrumb: {
                    title: "光储定容-案例展示",
                    icon: "bi bi-bookmark-check",
                },
            },
        },
        {
            path: "/health",
            name: "health",
            component: () => import("@/pages/Health/index.vue"),
            meta: {
                breadcrumb: { title: "资产健康", icon: "bi bi-sun" },
            },
        },
        {
            path: "/product_EGate10",
            name: "product_EGate10",
            component: () => import("@/pages/Products/EGate10.vue"),
            meta: {
                breadcrumb: {
                    title: "EGate10产品详情",
                    icon: "bi bi-sun",
                    parentRouteName: "elec_example",
                },
            },
        },
        {
            path: "/product_BMS",
            name: "product_BMS",
            component: () => import("@/pages/Products/BMS.vue"),
            meta: {
                breadcrumb: {
                    title: "BMS",
                    icon: "bi bi-sun",
                    parentRouteName: "health",
                },
            },
        },
        {
            path: "/product_BMSPLUS",
            name: "product_BMSPLUS",
            component: () => import("@/pages/Products/BMSPLUS.vue"),
            meta: {
                breadcrumb: {
                    title: "被动均衡BMU",
                    icon: "bi bi-sun",
                    parentRouteName: "health",
                },
            },
        },
        {
            path: "/product_BMU",
            name: "product_BMU",
            component: () => import("@/pages/Products/BMU.vue"),
            meta: {
                breadcrumb: {
                    title: "BMU",
                    icon: "bi bi-sun",
                    parentRouteName: "health",
                },
            },
        },
        {
            path: "/price-analysis",
            name: "price_analysis",
            component: () => import("@/pages/PriceAnalysis/Page.vue"),
            meta: {
                module: "price_analysis",
                breadcrumb: { title: "节点电价查询", icon: "bi bi-sun" },
            },
        },
        {
            path: "/VirtualPowerPlant",
            name: "VirtualPowerPlant",
            component: () => import("@/pages/VirtualPowerPlantPage/index.vue"),
            meta: {
                breadcrumb: { title: "虚拟电厂介绍", icon: "bi bi-sun" },
            },
        },
        {
            path: "/admin/access-stats",
            name: "AccessStats",
            component: () => import("@/pages/Admin/AccessStats.vue"),
            meta: {
                permission: "admin",
                breadcrumb: { title: "系统管理", icon: "bi bi-gear" },
            },
        },
        {
            path: "/monthly-demand-report",
            name: "MonthlyDemandReport",
            component: () => import("@/AuxiliaryTradingTools/MonthlyDemandReport.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                temporaryAccess: true,
                breadcrumb: { title: "月度需求申报", icon: "bi bi-sun" },
            },
        },
        {
            path: "/daily-demand-report-v2",
            name: "DailyDemandReportV2",
            component: () => import("@/DailyDemandReportV2/index.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                temporaryAccess: true,
                breadcrumb: { title: "日前用电侧申报V2", icon: "bi bi-clock-history" },
            },
        },
        {
            path: "/daily-demand-report-v2/history",
            name: "DailyDemandReportV2History",
            component: () => import("@/DailyDemandReportV2History/index.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                temporaryAccess: true,
                breadcrumb: {
                    title: "历史日前申报查询",
                    icon: "bi bi-clock-history",
                    parentRouteName: "DailyDemandReportV2",
                },
            },
        },
        {
            path: "/daily-profit",
            name: "DailyProfit",
            component: () => import("@/DailyProfitPage/index.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                temporaryAccess: true,
                breadcrumb: {
                    title: "每日收益",
                    icon: "bi bi-graph-up",
                    titleFormatter: (route) => {
                        const date = route.query.date;
                        return date ? `每日收益（${date}日）` : "每日收益";
                    },
                },
            },
        },
        {
            path: "/daily-profit/monthly",
            name: "MonthlyProfit",
            component: () => import("@/DailyProfitPage/MonthlyProfit.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                temporaryAccess: true,
                breadcrumb: {
                    title: "月度收益",
                    icon: "bi bi-graph-up",
                    titleFormatter: () => {
                        const saved = sessionStorage.getItem("monthlyProfit_selectedMonth");
                        if (saved) {
                            const month = saved.split("-")[1];
                            return month ? `月度收益（${parseInt(month)}月）` : "月度收益";
                        }
                        return "月度收益";
                    },
                },
            },
        },
        // {
        //     path: "/daily-demand-report/history",
        //     name: "DailyDemandHistory",
        //     component: () => import("@/AuxiliaryTradingTools/DailyDemandHistory.vue"),
        //     meta: {
        //         module: "trading",
        //         permission: "internal",
        //         breadcrumb: {
        //             title: "日前需求申报历史",
        //             icon: "bi bi-card-heading",
        //             parentRouteName: "DailyDemandReport",
        //         },
        //     },
        // },
        {
            path: "/user-price-config",
            name: "UserPriceConfig",
            component: () => import("@/views/UserPriceConfig.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                breadcrumb: {
                    title: "用户均价配置",
                    icon: "bi bi-settings",
                    parentRouteName: "DailyDemandReportV2",
                },
            },
        },
    ]
});

const sidebarMenuConfig = {
    home: {
        title: "首页",
        icon: "bi-house-fill",
        route: "/home",
        children: [
            { title: "首页", route: "/home", anchor: "home" },
            { title: "功能介绍", route: "/describe", anchor: "function-intro" },
            { title: "关于我们", route: "/about_us", anchor: "about-us" },
        ]
    },
    load: {
        title: "负荷预测",
        icon: "bi-bar-chart-line",
        children: [
            { title: "案例展示", route: "/load_example" },
            { title: "新建模型", route: "/loadpre" },
            { title: "已建模型", route: "/loadpre-history" },
        ]
    },
    elec: {
        title: "光伏发电预测",
        icon: "bi-sun",
        children: [
            { title: "案例展示", route: "/elec_example" },
            { title: "新建模型", route: "/elec" },
        ]
    },
    price_analysis: {
        title: "电价分析",
        icon: "bi-node-plus",
        route: "/price-analysis",
        children: [
            { title: "节点电价查询", route: "/price-analysis" },
        ]
    },
    light: {
        title: "光储定容测算",
        icon: "bi-battery-charging",
        children: [
            { title: "案例展示", route: "/light_example" },
            { title: "新建测算", route: "/light" },
        ]
    },
    trading: {
        title: "辅助电力交易",
        icon: "bi-graph-up-arrow",
        permission: "internal",
        children: [
            // { title: "日前交易申报", route: "/daily-demand-report" },
            { title: "日前用电侧申报V2", route: "/daily-demand-report-v2", temporaryAccess: true },
            { title: "历史日前申报查询", route: "/daily-demand-report-v2/history", temporaryAccess: true },
            { title: "每日收益", route: "/daily-profit", temporaryAccess: true },
            { title: "月度收益", route: "/daily-profit/monthly", temporaryAccess: true },
            // { title: "历史申报", route: "/daily-demand-report/history" },
            // { title: "收益分析", route: "/daily-demand-report/history/daily-revenue-analysis" },
            { title: "用户均价配置", route: "/user-price-config" },
            { title: "月度需求申报", route: "/monthly-demand-report", temporaryAccess: true },
        ]
    }
};

router.$sidebarMenuConfig = sidebarMenuConfig;

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("userInfo");
    const userInfo = user ? JSON.parse(user) : null;

    if (to.meta.permission) {
        if (!token || !userInfo) {
            next({ name: "login" });
            return;
        }

        if (to.meta.permission === "internal" && userInfo.role !== "internal") {
            if (userInfo.role === "temporary" && to.meta.temporaryAccess) {
                // temporary 角色仅可访问特定内部页面
            } else {
                next({ name: "home" });
                return;
            }
        }

        if (to.meta.permission === "admin" && userInfo.role !== "admin") {
            next({ name: "home" });
            return;
        }
    }

    next();
});

export default router;
