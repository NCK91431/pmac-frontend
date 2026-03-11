<!-- 联系弹窗组件 -->
<template>
    <el-dialog
        v-model="visible"
        :title="title"
        width="500px"
        :close-on-click-modal="true"
        :close-on-press-escape="true"
        class="contact-dialog"
    >
        <div class="contact-content">
            <!-- 合作热线 (在线咨询时不显示) -->
            <div v-if="mode !== 'chat'" class="contact-item hotline-section">
                <div class="contact-icon hotline-icon">
                    <i class="bi bi-telephone"></i>
                </div>
                <div class="contact-info">
                    <h4 class="contact-label">合作热线</h4>
                    <div class="contact-value hotline-number">
                        18679510800
                    </div>
                    <p class="contact-hint">（微信同号）</p>
                </div>
            </div>

            <!-- 分隔线 (在线咨询时不显示) -->
            <div v-if="mode !== 'chat'" class="divider"></div>

            <!-- 二维码区域 (联系销售时不显示) -->
            <div v-if="mode !== 'sales'" class="qr-section">
                <h4 class="qr-title">扫码关注</h4>
                <div class="qr-content">
                    <el-image 
                        src="https://pmac.leyi.host/downloads/QR-code.jpg" 
                        fit="cover"
                        class="qr-image"
                    />
                    <p class="qr-desc">扫码关注公众号</p>
                </div>
            </div>

            <!-- 其他联系方式 (在线咨询时不显示) -->
            <div v-if="mode !== 'chat'" class="other-contacts">
                <div class="other-contact-item">
                    <i class="bi bi-headset"></i>
                    <span>技术支持：17722020058</span>
                </div>
                <div class="other-contact-item">
                    <i class="bi bi-geo-alt"></i>
                    <span>广东省珠海市高新区科技创新海岸创新8路88号</span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose" class="cancel-btn">
                    关闭
                </el-button>
                <el-button 
                    v-if="mode !== 'chat'"
                    type="primary" 
                    class="primary-btn"
                    @click="handleCopyPhone"
                >
                    <i class="bi bi-clipboard"></i>
                    复制号码
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '联系我们'
    },
    mode: {
        type: String,
        default: 'all'
    }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
    visible.value = false
}

const handleCopyPhone = async () => {
    try {
        await navigator.clipboard.writeText('18679510800')
        ElMessage.success('号码已复制到剪贴板')
    } catch (err) {
        ElMessage.error('复制失败，请手动复制')
    }
}
</script>

<style scoped>
.contact-dialog {
    --el-bg-color: #ffffff;
}

.contact-dialog :deep(.el-dialog__header) {
    padding: 24px 24px 0;
    margin-bottom: 0;
}

.contact-dialog :deep(.el-dialog__title) {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.contact-dialog :deep(.el-dialog__body) {
    padding: 24px;
}

.contact-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 合作热线区域 */
.contact-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(200, 220, 250, 0.1) 0%, rgba(0, 114, 255, 0.05) 100%);
    border: 1px solid rgba(0, 114, 255, 0.15);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
}

.contact-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top left, rgba(0, 114, 255, 0.1), transparent 50%);
    pointer-events: none;
}

.contact-icon {
    width: 70px;
    height: 70px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
}

.hotline-icon {
    background: linear-gradient(145deg, #00c6ff, #0072ff);
    box-shadow: 0 10px 20px -10px rgba(0, 114, 255, 0.4);
    color: white;
}

.contact-info {
    flex: 1;
    position: relative;
    z-index: 1;
}

.contact-label {
    font-size: 0.95rem;
    color: #6b7280;
    margin-bottom: 6px;
    font-weight: 500;
}

.contact-value {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(90deg, #1e3b6b, #3f5e9c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
}

.hotline-number {
    font-size: 2rem;
    letter-spacing: 1px;
}

.contact-hint {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
}

.call-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(90deg, #00c6ff, #0072ff);
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 15px -5px rgba(0, 114, 255, 0.4);
}

.call-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 114, 255, 0.5);
}

/* 分隔线 */
.divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
}

/* 二维码区域 */
.qr-section {
    text-align: center;
}

.qr-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
}

.qr-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.qr-image {
    width: 140px;
    height: 140px;
    border-radius: 16px;
    border: 3px solid #e5e7eb;
    padding: 8px;
    background: white;
}

.qr-desc {
    font-size: 0.95rem;
    color: #6b7280;
    margin: 0;
}

/* 其他联系方式 */
.other-contacts {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.other-contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 10px;
    font-size: 0.95rem;
    color: #475569;
}

.other-contact-item i {
    color: #0072ff;
    font-size: 1.1rem;
}

/* 底部按钮 */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.cancel-btn {
    padding: 10px 24px;
    border-radius: 50px;
    font-weight: 500;
    border: 2px solid #e5e7eb;
    color: #6b7280;
    transition: all 0.3s ease;
}

.cancel-btn:hover {
    border-color: #d1d5db;
    background: #f3f4f6;
}

.primary-btn {
    padding: 10px 24px;
    border-radius: 50px;
    font-weight: 600;
    background: linear-gradient(90deg, #00c6ff, #0072ff);
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px -5px rgba(0, 114, 255, 0.4);
}

.primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 114, 255, 0.5);
}

/* 响应式 */
@media (max-width: 600px) {
    .contact-dialog :deep(.el-dialog) {
        width: 95% !important;
        margin: 10px auto !important;
    }
    
    .contact-item {
        flex-direction: column;
        text-align: center;
        gap: 16px;
    }
    
    .contact-value {
        font-size: 1.5rem;
    }
    
    .hotline-number {
        font-size: 1.6rem;
    }
}
</style>
