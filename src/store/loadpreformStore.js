import { defineStore } from "pinia";

export const useLoadPreFormStore = defineStore("loadPreForm", {
    state: () => ({
        formData: {
            customer_type: "",
            pv_config: "",
            pv_capacity: 0,
            location: [],
            forecast_range: "",
            previous_record_id: null, //如果为继续预测则有父链接
        },
        uploadedFile: null,
    }),
    getters: {
        isValid: (state) => {
            return (
                state.formData.customer_type &&
                state.formData.pv_config &&
                state.formData.location.length === 3 &&
                state.formData.forecast_range
            );
        },
        hasFile: (state) => state.uploadedFile !== null,
    },
    actions: {
        updateFormData(newData) {
            Object.assign(this.formData, newData);
        },
        setFile(file) {
            this.uploadedFile = file;
        },
        removeFile() {
            this.uploadedFile = null;
        },
        // 只重置文件，保留表单配置
        resetFileOnly() {
            this.uploadedFile = null;
            this.formData.previous_record_id = null;
        },
        // 完全重置表单
        resetForm() {
            this.formData = {
                customer_type: "",
                pv_config: "",
                pv_capacity: 0,
                location: [],
                forecast_range: "",
                previous_record_id: null,
            };
            this.uploadedFile = null;
        },
    },
});
