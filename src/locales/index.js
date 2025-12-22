import { createI18n } from "vue-i18n";
import zhCN from "./zh-CN.json";
import enUS from "./en-US.json";

// 创建 i18n 实例
const i18n = createI18n({
    legacy: false, // 使用 Composition API
    locale: localStorage.getItem("language") || "zh-CN", // 默认语言
    fallbackLocale: "zh-CN", // 回退语言
    messages: {
        "zh-CN": zhCN,
        "en-US": enUS,
    },
    silentTranslationWarn: true, // 隐藏警告
    missingWarn: false,
    fallbackWarn: false,
});

export default i18n;
