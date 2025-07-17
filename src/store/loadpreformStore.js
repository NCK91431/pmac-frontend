import { defineStore } from "pinia";

export const useLoadPreFormStore = defineStore("loadPreForm", {
    state: () => ({
        formData: {
            customer_type: "",
            pv_config: "",
            location: [],
            forecast_range: "",
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
            this.formData = { ...this.formData, ...newData };
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
        },
        // 完全重置表单
        resetForm() {
            this.formData = {
                customer_type: "",
                pv_config: "",
                location: [],
                forecast_range: "",
            };
            this.uploadedFile = null;
        },
    },
});
