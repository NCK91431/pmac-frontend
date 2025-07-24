import { defineStore } from "pinia";

export const useLoadPreStageStore = defineStore("loadpreStage", {
    state: () => ({
        stage: 0, // 0:初始状态 1:处理中 2:处理完成
        responseData: null, // 存储完整的后端响应数据
    }),
    actions: {
        setStageZero() {
            this.stage = 0;
        },
        setStageOne() {
            this.stage = 1;
        },
        setCompleted(responseData) {
            this.stage = 2;
            this.responseData = responseData;
        },
        reset() {
            this.stage = 0;
            this.responseData = null;
        },
        // 提供计算属性的访问方式
        get record() {
            return this.responseData;
        },
        get predictionData() {
            return this.responseData?.predictionData;
        },
    },
    persist: true,
});
