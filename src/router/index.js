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
    ],
});

export default router;
