<template>
    <footer class="footer" ref="footerRef">
        <div class="container">
            <div class="footer-flexbox">
                <div class="footer-column">
                    <h3>更多内容</h3>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Monitor /></el-icon>
                            </div>
                            <div>
                                <strong>官方网站</strong>
                                <p>
                                    <el-link
                                        type="primary"
                                        href="http://www.pmac.com.cn/"
                                        target="_blank"
                                        >www.pmac.com.cn</el-link
                                    >
                                </p>
                            </div>
                        </div>

                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><ShoppingCartFull /></el-icon>
                            </div>
                            <div>
                                <strong>天猫旗舰店</strong>
                                <p>
                                    <el-link
                                        type="primary"
                                        href="https://pilotdg.tmall.com/"
                                        target="_blank"
                                        >pilot旗舰店</el-link
                                    >
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <h3>联系我们</h3>
                    <div class="contact-info">
                        <!-- 公众号 -->
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Message /></el-icon>
                            </div>
                            <div>
                                <strong>邮箱 </strong>
                                <p>market@pmac.com.cn</p>
                            </div>
                        </div>
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Service /></el-icon>
                            </div>
                            <div>
                                <strong>合作热线</strong>
                                <p>15919126086（微信同号）</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer-column">
                    <h3>派诺科技园</h3>
                    <div class="contact-item">
                        <div class="contact-icon">
                            <el-icon><Timer /></el-icon>
                        </div>
                        <div>
                            <strong>服务时间</strong>
                            <p>
                                周一至周五：9:00 - 18:00
                                周六周日及法定节假日休息
                            </p>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <el-icon><Location /></el-icon>
                            </div>
                            <div>
                                <strong>地址</strong>
                                <p>广东省珠海市高新区科技创新海岸创新8路88号</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer-column">
                    <h3>扫码关注</h3>
                    <div class="contact-info">
                        <el-image
                            style="width: 100px; height: 100px"
                            :src="QRcode"
                            :fit="fit"
                        />
                    </div>
                </div>
            </div>

            <div class="copyright">
                <div>
                    © 2025
                    珠海派诺科技股份有限公司&nbsp;&nbsp;股票代码&nbsp;831175
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
}

.footer-flexbox {
    display: flex;
    justify-content: space-around;
}

.footer-column {
    h3 {
        font-size: 16px;
        margin-bottom: 1.5rem;
        color: white;
        position: relative;
        padding-bottom: 0.8rem;

        &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50px;
            height: 3px;
            background: #3b82f6;
            border-radius: 3px;
        }
    }
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.contact-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    strong,
    p {
        font-size: 14px;
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

    .el-icon {
        color: #3b82f6;
        font-size: 1.2rem;
    }
}

.subscribe-form {
    display: flex;
    margin-top: 1.5rem;

    input {
        flex: 1;
        padding: 0.8rem 1rem;
        border: none;
        border-radius: 6px 0 0 6px;
        font-size: 1rem;
    }

    button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0 1.5rem;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
            background: #2563eb;
        }
    }
}

.copyright {
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 15px;
}

// @media (max-width: 768px) {
//   .footer-flexbox {
//     gap: 2rem;
//   }

//   .footer-column {
//     h3 {
//       font-size: 1.3rem;
//     }
//   }
// }
</style>
