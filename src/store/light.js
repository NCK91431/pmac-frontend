import { defineStore } from "pinia";

export const useLightStore = defineStore("light", {
    state: () => ({
        // 来自 forecast.js
        continueData: null,
        activeTab: "upload",

        // 来自 loadpreformStore.js
        formData: {
            /* 基本参数 */
            time_granularity: 24, // 默认24小时粒度
            location: "",
            demand_price: 36.1, // 需量电价

            /* 光伏 */
            pv_cost: 3, // 光伏成本
            pv_depreciation_years: 20, // 光伏折旧年限
            pv_max_capacity: 9999, // 光伏最大装机容量
            pv_sell_grid: false, // 是否光伏上网
            sell_price: 0.45, // 光伏上网电价
            max_sell_ratio: 50, // 最大上网比例

            /* 储能 */
            storage_cost: 0.75, // 储能成本
            storage_depreciation_years: 7, // 储能折旧年限
            storage_max_cycles: 8000, // 储能最大循环次数
            storage_max_capacity: 9999, // 储能最大容量
            storage_power_capacity_ratio: 0.5, // 储能功率容量比

            /* 经济参数 */
            discount_rate: 0.08, // 折现率
            tax_rate: 0.1, // 所得税率

            /* 贷款 */
            has_loan: false, // 是否贷款
            loan_amount: 0, //	贷款金额
            loan_annual_rate: 0.05, // 贷款年利率
            loan_term: 8, // 贷款期限
        },

        // 两个文件
        uploadedLoadFile: null,
        uploadedPriceFile: null,

        // 来自 loadpreStageStore.js
        stage: 0, // 0:初始状态 1:处理中 2:处理完成
        responseData: null,
        activeHistoryRecordId: null,

        detailData: null, //选中历史记录中的某条数据
    }),

    getters: {
        // 表单验证状态
        isValid: (state) =>
            state.formData.location &&
            state.formData.storage_cost &&
            state.formData.pv_cost &&
            state.formData.demand_price &&
            state.formData.discount_rate &&
            state.formData.tax_rate >= 0,

        // 文件上传状态
        hasFile: (state) =>
            state.uploadedLoadFile !== null && state.uploadedPriceFile !== null,

        // 预测结果访问
        record: (state) => state.responseData,
        predictionData: (state) => state.responseData?.predictionData,
    },

    actions: {
        setActiveTab(tab) {
            if (tab === "upload" || tab === "history") {
                this.activeTab = tab;
            }
        },

        // 表单操作
        updateFormData(newData) {
            Object.assign(this.formData, newData);
        },

        setFile({ fileType, file }) {
            if (fileType === "load") {
                this.uploadedLoadFile = file;
            } else if (fileType === "price") {
                this.uploadedPriceFile = file;
            }
        },

        removeFile(fileType) {
            if (fileType === "load") {
                this.uploadedLoadFile = null;
            } else if (fileType === "price") {
                this.uploadedPriceFile = null;
            }
        },

        resetFileOnly() {
            this.uploadedLoadFile = null;
            this.uploadedPriceFile = null;
        },

        resetForm() {
            this.formData = {
                storage_cost: "",
                pv_cost: 0,
                time_granularity: 24,
                location: "",
                demand_price: null,
                pv_depreciation_years: 20,
                pv_max_capacity: null,
                storage_depreciation_years: 7,
                storage_max_cycles: 8000,
                storage_max_capacity: null,
                storage_power_capacity_ratio: 0.5,
                discount_rate: 0.08,
                tax_rate: 0.25,
                has_loan: false,
                loan_amount: 0,
                loan_annual_rate: 0.05,
                loan_term: 8,
                pv_sell_grid: false,
                sell_price: 0,
                max_sell_ratio: 50,
            };
            this.uploadedLoadFile = null;
            this.uploadedPriceFile = null;
        },

        // 预测流程控制
        setStageZero() {
            this.stage = 0;
        },
        setStageOne() {
            this.stage = 1;
        },
        setStageTwo() {
            this.stage = 2;
        },
        setCompleted(responseData) {
            this.responseData = responseData;
        },
        resetStage() {
            this.stage = 0;
            this.responseData = null;
        },
        set_activeHistoryRecordId(id) {
            this.activeHistoryRecordId = id;
        },

        set_detailData(data) {
            this.activeHistoryRecordId = data.id;
            this.detailData = data;
        },
    },

    // 保留原loadpreStageStore的持久化配置
    persist: true,
});
