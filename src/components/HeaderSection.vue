<template>
    <div class="header-container" ref="headerRef">
        <div class="header-content">
            <div class="logo-section">
                <img
                    class="company-logo"
                    src="https://pmac.leyi.host/downloads/pmac/pilot-logo.png"
                    alt="公司Logo"
                />
                <div class="platform-title">
                    <img
                        class="platform-logo"
                        src="https://pmac.leyi.host/downloads/pmac/test-logo.png"
                        alt="平台Logo"
                    />
                    <div class="pmac-title">
                        {{ $t("header.platformName") }}
                    </div>
                    <div class="pmac-subtitle">
                        {{ $t("header.platformSlogan") }}
                    </div>
                </div>
            </div>

            <!-- 移动端汉堡菜单 -->
            <div
                class="mobile-menu-toggle"
                @click="toggleMobileMenu"
                v-if="isMobile"
            >
                <i class="fas fa-bars"></i>
            </div>

            <!-- 移动端菜单遮罩 -->
            <div
                class="mobile-menu-overlay"
                v-if="isMobile && mobileMenuOpen"
                @click="closeMobileMenu"
            ></div>

            <el-menu
                class="menus"
                :class="{
                    'mobile-menu': isMobile,
                    'menu-open': mobileMenuOpen,
                }"
                mode="horizontal"
                background-color="transparent"
                text-color="#fff"
                active-text-color="#ffd04b"
                :ellipsis="false"
                default-active="home"
                router
            >
                <el-menu-item
                    index="home"
                    route="/home"
                    @click="closeMobileMenu"
                    >{{ $t("header.home") }}</el-menu-item
                >
                <el-menu-item
                    index="describe"
                    route="/describe"
                    @click="closeMobileMenu"
                    >{{ $t("header.features") }}</el-menu-item
                >
                <el-menu-item
                    index="about_us"
                    route="/about_us"
                    @click="closeMobileMenu"
                    >{{ $t("header.about") }}</el-menu-item
                >
            </el-menu>

            <LanguageToggle />

            <!-- 电力交易专家 -->
            <div class="chatbot" @click="openChatbotWindow" v-if="false">
                <div class="chatbot-icon">
                    <img
                        src="https://pmac.leyi.host/downloads/pmac/rengongzhineng.png"
                        alt="智能助手"
                    />
                    <div class="pulse-effect"></div>
                </div>
                <span class="chatbot-text">{{
                    $t("header.electricityExpert")
                }}</span>
            </div>

            <!-- 用户信息区域 -->
            <div class="user-info" :class="{ 'mobile-user-info': isMobile }">
                <!-- 有用户 -->
                <template v-if="isHaveUser">
                    <el-popover
                        placement="bottom-end"
                        trigger="click"
                        :width="260"
                    >
                        <template #reference>
                            <div class="user-company">
                                <el-avatar
                                    :size="36"
                                    :src="avatarURL"
                                    class="user-avatar"
                                >
                                    <i
                                        class="el-icon-user-solid"
                                        v-if="!avatarURL"
                                    ></i>
                                </el-avatar>
                                <span class="company-name">{{
                                    user.name
                                }}</span>
                                <i class="el-icon-caret-bottom"></i>
                            </div>
                        </template>

                        <div class="user-popover">
                            <div class="user-header">
                                <el-avatar
                                    :size="64"
                                    :src="avatarURL"
                                    class="popover-avatar"
                                >
                                    <i
                                        class="el-icon-user-solid"
                                        v-if="!avatarURL"
                                    ></i>
                                </el-avatar>
                                <div class="user-details">
                                    <h3>{{ user.name }}</h3>
                                    <p>
                                        <i class="el-icon-mobile-phone"></i>
                                        {{ user.phone }}
                                    </p>
                                    <p>
                                        <i class="el-icon-office-building"></i>
                                        {{
                                            user.company ||
                                            $t("header.companyNotSet")
                                        }}
                                    </p>
                                </div>
                            </div>

                            <div class="user-actions">
                                <el-button
                                    type="primary"
                                    plain
                                    class="action-btn"
                                    :icon="Edit"
                                    @click="gotoPage('modifyuser')"
                                >
                                    {{ $t("header.modifyUserInfo") }}
                                </el-button>
                                <el-button
                                    type="danger"
                                    plain
                                    class="action-btn"
                                    :icon="Notification"
                                    @click="onLogout"
                                >
                                    {{ $t("common.logout") }}
                                </el-button>
                            </div>
                        </div>
                    </el-popover>
                </template>
                <!-- 没有用户 -->
                <template v-else>
                    <el-popover
                        placement="bottom-end"
                        trigger="click"
                        :width="260"
                    >
                        <template #reference>
                            <div class="user-company">
                                <el-avatar
                                    :size="36"
                                    :src="avatarURL"
                                    class="user-avatar"
                                >
                                    <i
                                        class="el-icon-user-solid"
                                        v-if="!avatarURL"
                                    ></i>
                                </el-avatar>
                                <span class="company-name">{{
                                    $t("header.notLoggedIn")
                                }}</span>
                                <i class="el-icon-caret-bottom"></i>
                            </div>
                        </template>

                        <div class="user-popover">
                            <div class="user-header">
                                <el-avatar
                                    :size="64"
                                    :src="avatarURL"
                                    class="popover-avatar"
                                >
                                    <i
                                        class="el-icon-user-solid"
                                        v-if="!avatarURL"
                                    ></i>
                                </el-avatar>
                                <div class="user-details">
                                    <h3>{{ $t("header.notLoggedIn") }}</h3>
                                </div>
                            </div>
                            <div class="user-actions">
                                <el-button
                                    type="primary"
                                    plain
                                    class="action-btn"
                                    :icon="User"
                                    @click="gotoPage('login')"
                                >
                                    {{ $t("common.login") }}
                                </el-button>
                            </div>
                        </div>
                    </el-popover>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Edit, Notification, User } from "@element-plus/icons-vue";
import { computed, inject, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useLoadForecastStore } from "@/store/load";
import LanguageToggle from "./LanguageToggle.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n(); // 获取 t 函数

const forecastStore = useLoadForecastStore(); // 使用新的综合Store

// 注入全局用户状态和方法
const user = inject("user");
const clearUser = inject("clearUser");
const isHaveUser = computed(() => Boolean(user.value));

const router = useRouter();

const avatarURL = ref(
    "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
);

// 添加移动端状态和菜单控制
const isMobile = ref(false);
const mobileMenuOpen = ref(false);

const checkIsMobile = () => {
    isMobile.value = window.innerWidth <= 768;
};

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
    // 防止背景滚动
    if (mobileMenuOpen.value) {
        document.body.classList.add("menu-open");
    } else {
        document.body.classList.remove("menu-open");
    }
};

const closeMobileMenu = () => {
    if (isMobile.value) {
        mobileMenuOpen.value = false;
        document.body.classList.remove("menu-open");
    }
};

function onLogout() {
    ElMessageBox.confirm("您确定要登出此账号吗?", "Warning", {
        title: "操作提示",
        confirmButtonText: "确认",
        cancelButtonText: "返回",
        type: "warning",
    }).then(() => {
        clearUser();
        // 重置所有状态：
        forecastStore.resetStage(); // 重置stage和responseData
        forecastStore.set_activeHistoryRecordId(null); // 重置历史记录选择
        forecastStore.resetForm(); // 重置表单数据
        forecastStore.clearContinueData(); // 清除继续预测数据
        forecastStore.setActiveTab("upload"); // 重置标签页

        //返回首页：
        router.push({ name: "home" });

        ElMessage({
            type: "success",
            message: "您的账号已登出",
        });
    });
}

function gotoPage(page) {
    closeMobileMenu();
    router.push({ name: page });
}

function openChatbotWindow() {
    // 在新标签页打开外部链接
    window.open("http://125.88.36.153/chat/xKNQVUj83HlEWtAh", "_blank");
}

/* ------------ 获取 DOM 元素，计算高度后通过 emit 发送给父组件 ----------- */
const headerRef = ref(null); // 定义 ref 关联 DOM 元素
const emit = defineEmits(["update:headerHeight"]); // 定义 emits 用于传递高度给父组件
// 获取并传递 header 高度
const updateHeaderHeight = () => {
    if (headerRef.value) {
        const height = headerRef.value.offsetHeight; // 获取元素实际高度（包括 padding，不包括 margin 和 border）
        emit("update:headerHeight", height); // 发送高度给父组件
    }
};
// 初始化时获取一次高度
onMounted(() => {
    checkIsMobile();
    updateHeaderHeight();
    window.addEventListener("resize", checkIsMobile);
    window.addEventListener("resize", updateHeaderHeight); // 监听窗口大小变化，动态更新高度（适配响应式布局）
});

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener("resize", checkIsMobile);
    window.removeEventListener("resize", updateHeaderHeight);
    document.body.classList.remove("menu-open");
});
</script>

<style lang="scss" scoped>
.header-container {
    background: linear-gradient(135deg, #2c6fbb, #34a4dc);
    color: white;
    padding: 1.5rem 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    @media (max-width: 768px) {
        padding: 1rem 0;
    }

    .header-content {
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;

        @media (max-width: 768px) {
            flex-wrap: wrap;
        }

        .logo-section {
            margin-left: 10%;
            display: flex;
            align-items: center;

            @media (max-width: 768px) {
                margin-left: 5%;
                flex: 1;
            }

            .platform-title {
                display: flex;
                gap: 8px;
                align-items: flex-end;

                @media (max-width: 768px) {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 2px;
                }

                .pmac-title {
                    font-size: 1.8rem;
                    font-weight: 600;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3),
                        0 0 10px rgba(255, 255, 255, 0.2);

                    @media (max-width: 768px) {
                        font-size: 1.4rem;
                    }
                }

                .pmac-subtitle {
                    font-size: 1.3rem;
                    opacity: 0.85;
                    background: linear-gradient(135deg, #8ba3f4, #ff72ae);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    font-weight: 500;

                    @media (max-width: 768px) {
                        font-size: 1rem;
                    }
                }
            }

            img.company-logo {
                width: 70px;
                height: auto;
                margin-right: 15px;

                @media (max-width: 768px) {
                    width: 50px;
                    margin-right: 10px;
                }
            }

            img.platform-logo {
                width: 40px;
                height: auto;

                @media (max-width: 768px) {
                    width: 30px;
                }
            }
        }

        /* 移动端汉堡菜单 */
        .mobile-menu-toggle {
            display: none;

            @media (max-width: 768px) {
                display: block;
                font-size: 1.5rem;
                padding: 8px 12px;
                margin-right: 15px;
                cursor: pointer;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                transition: background 0.3s ease;
                z-index: 1002;

                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            }
        }

        /* 移动端菜单遮罩 */
        .mobile-menu-overlay {
            display: none;

            @media (max-width: 768px) {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
            }
        }

        .menus {
            justify-content: flex-end;
            margin-left: auto;

            @media (max-width: 768px) {
                &.mobile-menu {
                    position: fixed;
                    top: 0;
                    right: -300px;
                    width: 280px;
                    height: 100vh;
                    background: linear-gradient(135deg, #2c6fbb, #34a4dc);
                    flex-direction: column;
                    display: flex;
                    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    transition: right 0.3s ease;
                    z-index: 1000;
                    padding-top: 60px;

                    &.menu-open {
                        right: 0;
                    }

                    .el-menu-item {
                        width: 100%;
                        margin: 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        justify-content: flex-start;
                        height: 60px;
                        text-align: left;
                        padding-left: 30px;
                        font-size: 1.1rem;
                        border-radius: 0;

                        &:hover {
                            background-color: rgba(
                                255,
                                255,
                                255,
                                0.15
                            ) !important;
                        }

                        &.is-active {
                            background-color: rgba(
                                255,
                                208,
                                75,
                                0.2
                            ) !important;
                            border-left: 4px solid #ffd04b;
                        }
                    }
                }
            }
        }

        .el-menu {
            border: none;

            @media (max-width: 768px) {
                width: 100%;
            }
        }

        .el-menu--horizontal {
            .el-menu-item {
                height: 50px;
                line-height: 50px;
                font-size: 1.1rem;
                font-weight: 500;
                margin: 0 10px;
                border-radius: 4px;
                transition: all 0.3s;

                @media (max-width: 768px) {
                    margin: 0;
                    font-size: 1rem;
                }

                &:hover {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                }

                &.is-active {
                    background-color: rgba(255, 208, 75, 0.2) !important;
                }
            }
        }
    }
}

.user-info {
    margin-left: 20px;
    margin-right: 3%;

    @media (max-width: 768px) {
        margin-left: 10px;
        margin-right: 15px;

        &.mobile-user-info {
            .user-company {
                .company-name {
                    display: none;
                }

                .el-icon-caret-bottom {
                    display: none;
                }
            }
        }
    }

    .user-company {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 30px;
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;

        @media (max-width: 768px) {
            padding: 6px 10px;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .user-avatar {
            background: linear-gradient(135deg, #00c6ff, #0072ff);
            color: #fff;
            font-size: 18px;

            @media (max-width: 768px) {
                width: 32px !important;
                height: 32px !important;
            }
        }

        .company-name {
            color: #fff;
            font-weight: 500;
            margin: 0 10px;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            @media (max-width: 768px) {
                max-width: 80px;
                font-size: 0.9rem;
            }
        }

        .el-icon-caret-bottom {
            color: #cbd5e0;
            font-size: 14px;
        }
    }
}

.user-popover {
    padding: 20px;

    .user-header {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;

        .popover-avatar {
            background: linear-gradient(135deg, #00c6ff, #0072ff);
            color: #fff;
            font-size: 24px;
        }

        .user-details {
            margin-left: 15px;

            h3 {
                margin: 0 0 5px;
                font-size: 18px;
                color: #2d3748;
            }

            p {
                margin: 3px 0;
                font-size: 14px;
                color: #718096;
                display: flex;
                align-items: center;

                i {
                    margin-right: 6px;
                    font-size: 16px;
                }
            }
        }
    }

    .user-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .action-btn {
            width: 100%;
            cursor: pointer;
            margin-bottom: 10px;
            padding: 10px 15px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;

            &:last-child {
                margin-bottom: 0;
                margin-left: 0;
            }
        }
    }
}

// 登出确认框样式
.logout-confirm {
    .el-message-box__content {
        padding: 25px 20px;
        text-align: center;
    }

    .el-message-box__title {
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
    }

    .el-message-box__message {
        font-size: 16px;
        color: #4a5568;
        margin-top: 10px;
    }

    .el-message-box__btns {
        justify-content: center;
        padding: 15px 0 10px;

        .el-button {
            padding: 10px 25px;
            border-radius: 6px;
            font-weight: 500;
        }
    }
}

.chatbot {
    display: flex;
    align-items: center;
    padding: 6px 16px 6px 12px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 20px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    position: relative;
    overflow: hidden;

    @media (max-width: 768px) {
        display: none; /* 移动端隐藏电力交易专家 */
    }

    &:hover {
        background: rgba(255, 255, 255, 0.18);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .chatbot-icon img {
            transform: scale(1.1) rotate(5deg);
        }

        .chatbot-text {
            letter-spacing: 0.5px;
        }

        &::before {
            opacity: 0.4;
        }
    }

    &:active {
        transform: translateY(1px);
        background: rgba(255, 255, 255, 0.1);
    }

    &::before {
        content: "";
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: radial-gradient(
            circle,
            rgba(255, 208, 75, 0.3) 0%,
            transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }
}

.chatbot-icon {
    position: relative;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
        width: 24px;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
}

.pulse-effect {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 208, 75, 0.2);
    animation: pulse 2s infinite;
    z-index: -1;
}

.chatbot-text {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    transition: all 0.3s ease;
    position: relative;
    letter-spacing: 0;
}

@keyframes pulse {
    0% {
        transform: scale(0.8);
        opacity: 0.7;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.4;
    }
    100% {
        transform: scale(0.8);
        opacity: 0.7;
    }
}

/* 移动端覆盖层，防止菜单打开时背景滚动 */
@media (max-width: 768px) {
    body.menu-open {
        overflow: hidden;
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .logo-section {
        h1 {
            font-size: 20px;
        }

        p {
            font-size: 12px;
        }
    }

    .el-menu--horizontal {
        overflow-x: auto;

        &::-webkit-scrollbar {
            display: none;
        }

        .el-menu-item {
            height: 50px;
            line-height: 50px;
        }
    }
}
</style>
