import "./assets/main.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./locales"; // 导入 i18n 配置

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus, {
    locale: zhCn,
});
app.use(i18n); // 使用 i18n 插件
app.mount("#app");
