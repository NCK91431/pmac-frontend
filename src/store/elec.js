import { defineStore } from "pinia";

export const useElecStore = defineStore("elec", {
    state: () => ({
        // 来自 forecast.js
        continueData: null,
        isContinue: false,
        activeTab: "upload",

        // 来自 loadpreformStore.js
        formData: {
            pv_capacity: 0,
            location: [],
            previous_record_id: null,
        },
        uploadedFile: null,

        // 来自 loadpreStageStore.js
        stage: 0, // 0:初始状态 1:处理中 2:处理完成
        responseData: null,
        activeHistoryRecordId: null,

        // LoadCompare.vue 需要用到的状态:
        compare_data: null, // 用于存储对比数据
        compare_baseinfo: null, // 用于存储对比的基本信息
        compare_merge: null, // 用于存储合并后的数据
    }),

    getters: {
        // 表单验证状态
        isValid: (state) => state.formData.location.length === 3,

        // 文件上传状态
        hasFile: (state) => state.uploadedFile !== null,

        // 预测结果访问
        record: (state) => state.responseData,
        predictionData: (state) => state.responseData?.predictionData,
    },

    actions: {
        // 继续预测相关操作
        setContinueData(data) {
            this.continueData = data;
            this.isContinue = true;
            this.activeTab = "upload";
        },
        clearContinueData() {
            this.continueData = null;
            this.isContinue = false;
        },
        setActiveTab(tab) {
            if (tab === "upload" || tab === "history") {
                this.activeTab = tab;
            }
        },

        // 表单操作
        updateFormData(newData) {
            Object.assign(this.formData, newData);
        },
        setFile(file) {
            this.uploadedFile = file;
        },
        removeFile() {
            this.uploadedFile = null;
        },
        resetFileOnly() {
            this.uploadedFile = null;
            this.formData.previous_record_id = null;
        },
        resetForm() {
            this.formData = {
                pv_capacity: 0,
                location: [],
                previous_record_id: null,
            };
            this.uploadedFile = null;
        },

        // 预测流程控制
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
        resetStage() {
            this.stage = 0;
            this.responseData = null;
        },
        set_activeHistoryRecordId(id) {
            this.activeHistoryRecordId = id;
        },
        setCompareData(data) {
            this.compare_data = data;
        },
        setCompareBaseinfo(info) {
            this.compare_baseinfo = info;
        },
        setCompareMerge(merge) {
            this.compare_merge = merge;
        },
    },

    // 保留原loadpreStageStore的持久化配置
    persist: true,
});
