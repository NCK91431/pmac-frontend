<template>
    <!-- 预测说明文字 -->
    <div class="explanation-section rounded">
        <h6 class="explanation-title mb-3">
            <!-- <i class="bi bi-lightbulb me-1"></i>
            说明 -->
        </h6>
        <div class="explanation-content">
            <div class="explanation-item mb-3">
                <i class="bi bi-1-circle-fill"></i>
                <span class="item-text ms-2">
                    总负荷数据需连续、完整，并且最近的180天内客户无新增或减少（让模型精准捕捉客户群体的真实用电规律，进而输出可靠的预测结果）。
                </span>
            </div>
            <div class="explanation-item">
                <i class="bi bi-2-circle-fill"></i>
                <span class="item-text ms-2">
                    180天内新增的客户，采用
                    <el-text class="switch-text" @click="checkout">
                        分项负荷预测
                        <el-icon> <TopRight /> </el-icon>
                    </el-text>
                    进行单独建模和预测。
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { TopRight } from "@element-plus/icons-vue";
const emits = defineEmits(["switchMode"]);
function checkout() {
    emits("switchMode");
}
</script>

<style lang="scss" scoped>
.explanation-section {
    // background-color: #f8f9fa;
    // border: 1px solid #e9ecef;
    // border-radius: 6px;

    .explanation-title {
        color: #2c6fbb;
        font-weight: 600;
        font-size: 1.1rem;
        padding-bottom: 12px;
        margin-bottom: 16px;
        border-bottom: 1px solid #dee2e6;
        position: relative;

        i {
            font-size: 1.2rem;
            color: #ffc107;
        }

        &::after {
            content: "";
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, #2c6fbb, transparent);
        }
    }

    .explanation-content {
        .explanation-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;

            &:last-child {
                margin-bottom: 0;
            }
            .bi {
                color: #626466;
            }
            .item-text {
                color: #495057;
                line-height: 1.6;
                font-size: 0.95rem;
                text-align: justify;
                .switch-text {
                    color: #409eff;
                    cursor: pointer;
                    text-decoration: underline;
                    font-weight: bolder;
                    padding: 0 2px;
                }
            }
        }
    }
}
</style>
