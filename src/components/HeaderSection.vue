<template>
    <div class="header-container" ref="headerRef">
        <div class="header-content">
            <div class="logo-section">
                <i class="fas fa-bolt"></i>
                <img
                    src="https://i.postimg.cc/7ZfS8FNx/pilot-logo.png"
                    alt=""
                />
                <div>
                    <h1 class="pmac-title">智慧洞见 毫厘尽显</h1>
                </div>
            </div>
            <el-menu
                class="menus"
                mode="horizontal"
                background-color="transparent"
                text-color="#fff"
                active-text-color="#ffd04b"
                :ellipsis="false"
                default-active="home"
                router
            >
                <el-menu-item index="home" route="/home">首页</el-menu-item>
                <el-menu-item index="describe" route="/describe"
                    >功能介绍</el-menu-item
                >
                <el-menu-item index="about_us" route="/about_us"
                    >关于我们</el-menu-item
                >
            </el-menu>
            <!-- 电力交易专家 -->
            <div class="chatbot" @click="openChatbotWindow">
                <div class="chatbot-icon">
                    <img
                        src="https://pmac.leyi.host/downloads/pmac/rengongzhineng.png"
                        alt="智能助手"
                    />
                    <div class="pulse-effect"></div>
                </div>
                <span class="chatbot-text">电力交易专家</span>
            </div>
            <!-- 用户信息区域 -->
            <div class="user-info">
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
                                        {{ user.company || "未设置公司" }}
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
                                    修改用户信息
                                </el-button>
                                <el-button
                                    type="danger"
                                    plain
                                    class="action-btn"
                                    :icon="Notification"
                                    @click="onLogout"
                                >
                                    登出
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
                                <span class="company-name"> 未登录用户 </span>
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
                                    <h3>未登录用户</h3>
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
                                    去登录
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
import { useLoadForecastStore } from "@/store/load"; // 使用新的综合Store

const forecastStore = useLoadForecastStore(); // 使用新的综合Store

// 注入全局用户状态和方法
const user = inject("user");
const clearUser = inject("clearUser");
const isHaveUser = computed(() => Boolean(user.value));

const router = useRouter();

const avatarURL = ref(
    "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
);

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
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight); // 监听窗口大小变化，动态更新高度（适配响应式布局）
});

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener("resize", updateHeaderHeight);
});
</script>

<style lang="scss" scoped>
.header-container {
    background: linear-gradient(135deg, #2c6fbb, #34a4dc);
    color: white;
    padding: 1.5rem 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    /* 添加固定定位 */
    position: fixed; /* 固定定位，相对于视口 */
    top: 0; /* 距离顶部0 */
    left: 0; /* 距离左侧0 */
    right: 0; /* 距离右侧0，确保宽度占满屏幕 */
    z-index: 1000; /* 设置层级，避免被其他元素覆盖（值需大于页面其他元素的z-index） */

    .header-content {
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .logo-section {
            margin-left: 10%;
            display: flex;
            align-items: center;
            img {
                margin-right: 10px;
            }

            i {
                font-size: 2.5rem;
                margin-right: 15px;
                color: #ffd04b;
            }

            h1 {
                font-size: 1.8rem;
                margin: 0;
            }

            p {
                margin: 5px 0 0;
                opacity: 0.85;
                font-size: 0.95rem;
            }
        }
    }
    .menus {
        justify-content: flex-end;
        margin-left: auto;
    }
    .el-menu {
        border: none;
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

            &:hover {
                background-color: rgba(255, 255, 255, 0.15) !important;
            }

            &.is-active {
                background-color: rgba(255, 208, 75, 0.2) !important;
            }
        }
    }
}
.user-info {
    margin-left: 20px;
    margin-right: 3%;
    .user-company {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 30px;
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .user-avatar {
            background: linear-gradient(135deg, #00c6ff, #0072ff);
            color: #fff;
            font-size: 18px;
        }

        .company-name {
            color: #fff;
            font-weight: 500;
            margin: 0 10px;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
</style>
