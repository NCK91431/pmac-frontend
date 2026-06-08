<template>
    <div v-if="anomalyData && anomalyData.abnormal_flag" class="anomaly-alert">
        <div class="anomaly-content">
            <div class="anomaly-problem">
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span class="anomaly-label">提示：</span>
                <span class="anomaly-text">{{ anomalyData.problem }}</span>
            </div>
            <div class="anomaly-suggestion">
                <i class="bi bi-lightbulb-fill"></i>
                <span class="anomaly-label">建议：</span>
                <span class="anomaly-text">{{ anomalyData.suggestion }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    anomalyData: {
        type: Object,
        default: null,
    },
});
</script>

<style lang="scss" scoped>
.anomaly-alert {
    background: linear-gradient(135deg, #fef6e6 0%, #fff2d9 100%);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    padding: 14px 0 14px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border-left: 4px solid #ffc107;

    .anomaly-content {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .anomaly-problem,
        .anomaly-suggestion {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            line-height: 1.5;

            i {
                flex-shrink: 0;
                margin-top: 2px;
                font-size: 0.95rem;
            }

            .anomaly-label {
                font-weight: 600;
                flex-shrink: 0;
            }

            .anomaly-text {
                color: #3f4041;
                flex: 1;
            }
        }

        .anomaly-problem {
            i,
            .anomaly-label {
                color: #e6a23c;
            }
        }

        .anomaly-suggestion {
            i,
            .anomaly-label {
                color: #67c23a;
            }
        }
    }
}
</style>
