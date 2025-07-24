import { defineStore } from "pinia";
import { ref } from "vue";

export const useForecastStore = defineStore("forecast", () => {
    const continueData = ref(null);
    const isContinue = ref(false); // 新增继续预测状态标识
    const activeTab = ref("upload"); // 统一管理标签状态

    const setContinueData = (data) => {
        continueData.value = data;
        isContinue.value = true; // 设置继续预测状态
        activeTab.value = "upload"; // 设置标签为上传页
    };

    const clearContinueData = () => {
        continueData.value = null;
        isContinue.value = false; // 清除继续预测状态
    };

    const setActiveTab = (tab) => {
        if (tab === "upload" || tab === "history") {
            activeTab.value = tab;
        }
    };

    return {
        continueData,
        isContinue,
        activeTab,
        setContinueData,
        clearContinueData,
        setActiveTab,
    };
});
