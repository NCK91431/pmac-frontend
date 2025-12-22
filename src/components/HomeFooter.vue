<template>
    <footer class="footer" ref="footerRef">
        <div class="container">
            <div class="footer-flexbox">
                <div class="footer-column">
                    <h3>{{ $t("footer.moreContent") }}</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Monitor /></el-icon>
                            </div>
                            <div>
                                <strong>{{
                                    $t("footer.officialWebsite")
                                }}</strong>
                                <p>
                                    <el-link
                                        type="primary"
                                        href="http://www.pmac.com.cn/"
                                        target="_blank"
                                        >www.pmac.com.cn
                                    </el-link>
                                </p>
                            </div>
                        </div>

                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><ShoppingCartFull /></el-icon>
                            </div>
                            <div>
                                <strong>{{ $t("footer.tmallStore") }}</strong>
                                <p>
                                    <el-link
                                        type="primary"
                                        href="https://pilotdg.tmall.com/"
                                        target="_blank"
                                        >{{ $t("footer.pilotStore") }}
                                    </el-link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <h3>{{ $t("footer.contactUs") }}</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Service /></el-icon>
                            </div>
                            <div>
                                <strong>{{
                                    $t("footer.technicalSupport")
                                }}</strong>
                                <p>17722020058</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Connection /></el-icon>
                            </div>
                            <div>
                                <strong>{{
                                    $t("footer.cooperationHotline")
                                }}</strong>
                                <p>
                                    15919159383（{{ $t("footer.wechatSame") }}）
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <h3>{{ $t("footer.painoPark") }}</h3>
                    <div class="contact-item">
                        <div class="contact-icon">
                            <el-icon><i class="bi bi-telephone"></i></el-icon>
                        </div>
                        <div>
                            <strong>{{ $t("footer.customerService") }}</strong>
                            <p>0756-6931888</p>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Location /></el-icon>
                            </div>
                            <div>
                                <strong>{{ $t("footer.address") }}</strong>
                                <p>{{ $t("footer.fullAddress") }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer-column">
                    <h3>{{ $t("footer.scanQRCode") }}</h3>
                    <div class="contact-info qr-code-section">
                        <el-image
                            style="width: 100px; height: 100px"
                            :src="QRcode"
                            :fit="fit"
                            class="qr-code-image"
                        />
                        <p class="qr-code-desc">
                            {{ $t("footer.scanToFollow") }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="copyright">
                <div>
                    © 2025
                    {{ $t("footer.companyName") }}&nbsp;&nbsp;{{
                        $t("footer.stockCode")
                    }}&nbsp;920375
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
import {
    Location,
    Iphone,
    Message,
    Goods,
    Monitor,
    Timer,
    Service,
    ShoppingCartFull,
    Connection,
} from "@element-plus/icons-vue";
import { onMounted, onUnmounted, ref } from "vue";
const QRcode = "https://pmac.leyi.host/downloads/QR-code.jpg";

/* ------------ 获取 DOM 元素，计算高度后通过 emit 发送给父组件 ----------- */
const footerRef = ref(null); // 定义 ref 关联 DOM 元素
const emit = defineEmits(["update:footerHeight"]); // 定义 emits 用于传递高度给父组件
// 获取并传递 header 高度
const updateHeaderHeight = () => {
    if (footerRef.value) {
        const height = footerRef.value.offsetHeight; // 获取元素实际高度（包括 padding，不包括 margin 和 border）
        emit("update:footerHeight", height); // 发送高度给父组件
    }
};
// 初始化时获取一次高度
onMounted(() => {
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight); // 监听窗口大小变化，动态更新高度（适配响应式布局）
});

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener("resize", updateHeaderHeight);
});
</script>

<style lang="scss" scoped>
.footer {
    background: #2c3e50;
    color: #e2e8f0;
    padding: 35px 0 15px;

    @media (max-width: 768px) {
        padding: 25px 0 15px;
    }
}

.footer-flexbox {
    display: flex;
    justify-content: space-around;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 25px;
        padding: 0 15px;
    }
}

.footer-column {
    @media (max-width: 768px) {
        max-width: 100%;
        text-align: center;

        &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 20px;
        }
    }

    h3 {
        font-size: 16px;
        margin-bottom: 1.5rem;
        color: white;
        position: relative;
        padding-bottom: 0.8rem;

        @media (max-width: 768px) {
            margin-bottom: 1rem;
            font-size: 15px;
            padding-bottom: 0.5rem;
        }

        &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50px;
            height: 3px;
            background: #3b82f6;
            border-radius: 3px;

            @media (max-width: 768px) {
                left: 50%;
                transform: translateX(-50%);
            }
        }
    }
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 5px;

    @media (max-width: 768px) {
        gap: 8px;
    }

    &.qr-code-section {
        align-items: center;
        gap: 10px;
    }
}

.contact-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        gap: 0.8rem;
        justify-content: center;
        text-align: left;
    }

    strong,
    p {
        font-size: 14px;
        margin: 0;
        line-height: 1.4;

        @media (max-width: 768px) {
            font-size: 13px;
        }
    }

    p {
        word-break: break-all;
    }
}

.contact-icon {
    background: rgba(59, 130, 246, 0.2);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 35px;
        height: 35px;
    }

    .el-icon {
        color: #3b82f6;
        font-size: 1.2rem;

        @media (max-width: 768px) {
            font-size: 1rem;
        }
    }
}

.qr-code-image {
    @media (max-width: 768px) {
        width: 80px !important;
        height: 80px !important;
    }
}

.qr-code-desc {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 5px;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 11px;
    }
}

.copyright {
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 15px;
    padding-top: 15px;

    @media (max-width: 768px) {
        font-size: 0.8rem;
        padding: 15px 15px 0;
        line-height: 1.4;
    }
}

/* 链接样式移动端适配 */
:deep(.el-link) {
    @media (max-width: 768px) {
        font-size: 13px;
    }
}

/* 地址文本换行优化 */
.contact-item:has(p:contains("广东省珠海市高新区科技创新海岸创新8路88号")) p {
    word-break: break-word;
    line-height: 1.5;
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1024px) {
    .footer-flexbox {
        flex-wrap: wrap;
        gap: 20px;
    }

    .footer-column {
        flex: 0 0 calc(50% - 20px);
        max-width: calc(50% - 20px);
    }
}

/* 超小屏幕手机适配 */
@media (max-width: 480px) {
    .footer {
        padding: 20px 0 10px;
    }

    .footer-flexbox {
        gap: 20px;
        padding: 0 10px;
    }

    .footer-column {
        &:not(:last-child) {
            padding-bottom: 15px;
        }
    }

    .contact-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
    }

    .contact-icon {
        margin-bottom: 5px;
    }

    .copyright {
        margin-top: 10px;
        padding-top: 10px;
    }
}

/* 链接悬停效果增强 */
:deep(.el-link) {
    transition: color 0.3s ease;

    &:hover {
        color: #60a5fa !important;
    }
}

/* 打印样式优化 */
@media print {
    .footer {
        background: #f8f9fa !important;
        color: #000 !important;
        border-top: 2px solid #dee2e6;
    }

    .contact-icon {
        background: #e9ecef !important;

        .el-icon {
            color: #6c757d !important;
        }
    }
}
</style>
