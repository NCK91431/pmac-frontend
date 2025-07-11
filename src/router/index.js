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
            component: () => import("@/pages/Home/HomePage.vue"),
        },
        {
            path: "/loadpre",
            name: "loadpre",
            component: () => import("../pages/Load/LoadPre.vue"),
        },
        {
            path: "/login",
            name: "Login",
            component: () => import("@/pages/Home/LoginRegister.vue"),
        },
        {
            path: "/modifyuser",
            name: "ModifyUser",
            component: () => import("@/pages/Home/ModifyUserInfo.vue"),
        },
    ],
});

export default router;
