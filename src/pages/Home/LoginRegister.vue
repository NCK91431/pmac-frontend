<template>
    <div class="login-register-container" :style="bgStyle">
        <div class="login-card">
            <div class="logo-section">
                <img
                    src="https://i.postimg.cc/7ZfS8FNx/pilot-logo.png"
                    alt="Logo"
                />
            </div>

            <div class="form-section">
                <el-form
                    ref="loginForm"
                    :model="formData"
                    :rules="formRules"
                    @submit.prevent="handleSubmit"
                >
                    <!-- 登录/注册标题 -->
                    <div class="form-header">
                        <h2>{{ isRegister ? "用户注册" : "用户登录" }}</h2>
                        <p class="switch-mode" @click="toggleMode">
                            {{
                                isRegister
                                    ? "已有账号？去登录"
                                    : "没有账号？去注册"
                            }}
                        </p>
                    </div>

                    <!-- 手机号输入 -->
                    <el-form-item prop="phone">
                        <el-input
                            v-model="formData.phone"
                            placeholder="请输入您的手机号"
                            size="large"
                        >
                            <template #prefix>
                                <i class="bi bi-phone"></i>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 验证码输入 -->
                    <el-form-item prop="code">
                        <div class="code-input-container">
                            <el-input
                                v-model="formData.code"
                                placeholder="请输入验证码"
                                size="large"
                            >
                                <template #prefix>
                                    <i class="bi bi-shield-lock"></i>
                                </template>
                            </el-input>
                            <el-button
                                class="send-code-btn"
                                :disabled="countdown > 0 || isSending"
                                @click="sendVerificationCode"
                            >
                                {{
                                    countdown > 0
                                        ? `${countdown}秒后重发`
                                        : "获取验证码"
                                }}
                            </el-button>
                        </div>
                    </el-form-item>

                    <!-- 仅在注册模式显示公司名称 -->
                    <el-form-item v-if="isRegister" prop="company">
                        <el-input
                            v-model="formData.company"
                            placeholder="公司名称（选填）"
                            size="large"
                        >
                            <template #prefix>
                                <i class="bi bi-building"></i>
                            </template>
                        </el-input>
                    </el-form-item>
                    <!-- 仅在注册模式显示姓名 -->
                    <el-form-item v-if="isRegister" prop="name">
                        <el-input
                            v-model="formData.name"
                            placeholder="您的姓名（选填）"
                            size="large"
                        >
                            <template #prefix>
                                <i class="bi bi-person-circle"></i>
                            </template>
                        </el-input>
                    </el-form-item>
                    <!-- 提交按钮 -->
                    <el-button
                        type="primary"
                        size="large"
                        class="submit-btn"
                        :loading="loading"
                        @click="handleSubmit"
                    >
                        <i
                            class="bi me-2"
                            :class="
                                isRegister
                                    ? 'bi-person-plus'
                                    : 'bi-box-arrow-in-right'
                            "
                        ></i>
                        {{
                            loading ? "处理中..." : isRegister ? "注册" : "登录"
                        }}
                    </el-button>

                    <!-- 错误信息 -->
                    <div v-if="errorMessage" class="error-message">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        {{ errorMessage }}
                    </div>
                </el-form>
            </div>

            <div class="info-section">
                <p class="mb-2">
                    <i class="bi bi-info-circle me-2"></i>
                    {{
                        isRegister
                            ? "注册后即可使用系统所有功能"
                            : "首次使用？注册账号即可开始使用"
                    }}
                </p>
                <p>
                    <i class="bi bi-shield-lock me-2"></i>
                    您的信息将受到严格保护
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, inject, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import request from "@/utils/request";

const updateUser = inject("updateUser");
const router = useRouter();

// 表单数据
const formData = ref({
    phone: "",
    code: "",
    company: "", //选填
    name: "", //选填
});

// 当前是否为注册模式
const isRegister = ref(false);
// 倒计时状态
const countdown = ref(0);
let countdownTimer = null;

// 切换登录/注册模式
const toggleMode = () => {
    isRegister.value = !isRegister.value;
    errorMessage.value = "";
    formData.value.phone = "";
    formData.value.code = "";

    if (loginForm.value) {
        loginForm.value.resetFields();
    }
};

// 手机号格式验证
const isPhoneValid = computed(() => {
    return /^1[3-9]\d{9}$/.test(formData.value.phone);
});

// 表单验证规则
const formRules = {
    phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入有效的手机号",
            trigger: "blur",
        },
    ],
    code: [
        { required: true, message: "请输入验证码", trigger: "blur" },
        {
            pattern: /^\d{4}$/,
            message: "验证码为4位数字",
            trigger: "blur",
        },
    ],
};

const loginForm = ref(null);
const loading = ref(false);
const errorMessage = ref("");

// 发送验证码
const sendVerificationCode = async () => {
    try {
        // 验证手机号格式
        if (!isPhoneValid.value) {
            ElMessage.warning("请输入有效的手机号");
            return;
        }

        const type = isRegister.value ? "register" : "login";

        loading.value = true;
        const response = await request.post("/api/auth/send-code", {
            phone: formData.value.phone,
            type,
        });

        if (response.data.success) {
            ElMessage.success("验证码已发送");
            // 开始5分钟倒计时（300秒）
            countdown.value = 300;
            countdownTimer = setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
        } else {
            errorMessage.value = response.data.error || "验证码发送失败";
        }
    } catch (error) {
        console.error("发送验证码失败:", error);
        if (error.response?.status === 404) {
            errorMessage.value = "用户不存在，请先注册";
        } else if (error.response?.status === 409) {
            errorMessage.value = "该手机号已注册，请直接登录";
        } else {
            errorMessage.value = "验证码发送失败，请稍后重试";
        }
    } finally {
        loading.value = false;
    }
};

// 处理表单提交
const handleSubmit = async () => {
    try {
        const valid = await loginForm.value.validate();
        if (!valid) return;

        loading.value = true;
        errorMessage.value = "";

        if (isRegister.value) {
            await handleRegister();
        } else {
            await handleLogin();
        }
    } catch (error) {
        console.error("操作失败:", error);
    } finally {
        loading.value = false;
    }
};

// 处理注册请求
const handleRegister = async () => {
    try {
        const response = await request.post("/api/auth/register", {
            phone: formData.value.phone,
            code: formData.value.code,
            company: formData.value.company,
            name: formData.value.name,
        });

        if (response.data.success) {
            updateUser(response.data.user, response.data.token);
            ElMessage.success("注册成功");
            router.push("/");
        } else {
            errorMessage.value = response.data.error || "注册失败，请重试";
        }
    } catch (error) {
        console.error("注册失败:", error);
        if (error.response?.status === 409) {
            errorMessage.value = "该手机号已注册，请直接登录";
        } else if (error.response?.status === 401) {
            errorMessage.value = "验证码无效或已过期";
        } else {
            errorMessage.value = "注册失败，请稍后重试";
        }
    }
};

// 处理登录请求
const handleLogin = async () => {
    try {
        const response = await request.post("/api/auth/login", {
            phone: formData.value.phone,
            code: formData.value.code,
        });

        if (response.data.success) {
            updateUser(response.data.user, response.data.token);
            ElMessage.success("登录成功");
            router.back();
        } else {
            errorMessage.value = response.data.error || "登录失败，请重试";
        }
    } catch (error) {
        console.error("登录失败:", error);
        if (error.response?.status === 404) {
            errorMessage.value = "用户不存在，请先注册";
        } else if (error.response?.status === 401) {
            errorMessage.value = "验证码无效或已过期";
        } else {
            errorMessage.value = "登录失败，请稍后重试";
        }
    }
};

// 组件卸载时清除定时器
onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
});
</script>

<style lang="scss" scoped>
.login-register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.login-card {
    width: 100%;
    max-width: 450px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-section {
    background: rgba(13, 110, 253, 0.85);
    color: white;
    padding: 20px;
    text-align: center;

    img {
        max-height: 60px;
    }
}

.form-section {
    padding: 30px;

    .form-header {
        text-align: center;
        margin-bottom: 25px;

        h2 {
            color: #333;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .switch-mode {
            color: #0d6efd;
            cursor: pointer;
            font-size: 14px;
            margin: 0;
            font-weight: 500;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .el-form-item {
        margin-bottom: 22px;
    }

    .el-input {
        :deep(.el-input__wrapper) {
            padding: 0 15px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 0.9);

            &:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .el-input__prefix {
                display: flex;
                align-items: center;
                margin-right: 8px;

                i {
                    font-size: 18px;
                    color: #6c757d;
                }
            }
        }
    }

    .code-input-container {
        display: flex;
        gap: 10px;
        width: 100%;
        .el-input {
            flex: 1;
        }

        .send-code-btn {
            height: 48px;
            border-radius: 8px;
            background: #f0f7ff;
            color: #0d6efd;
            border: 1px solid #cfe2ff;
            font-weight: 500;
            transition: all 0.3s;

            &:hover {
                background: #e2edff;
                transform: translateY(-1px);
            }

            &:active {
                transform: translateY(1px);
            }

            &:disabled {
                background: #f8f9fa;
                color: #adb5bd;
                cursor: not-allowed;
            }
        }
    }

    .submit-btn {
        width: 100%;
        height: 48px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
        background: linear-gradient(135deg, #0d6efd, #0b5ed7);
        border: none;
        box-shadow: 0 4px 10px rgba(13, 110, 253, 0.3);
        transition: all 0.3s ease;
        margin-top: 10px;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
        }

        &:active {
            transform: translateY(1px);
        }
    }

    .error-message {
        margin-top: 15px;
        padding: 12px;
        background-color: #fff8f8;
        border: 1px solid #ffd0d0;
        border-radius: 8px;
        color: #dc3545;
        font-size: 14px;
        display: flex;
        align-items: center;

        i {
            font-size: 18px;
        }
    }
}

.info-section {
    background-color: rgba(248, 249, 250, 0.7);
    border-top: 1px solid rgba(233, 236, 239, 0.5);
    padding: 20px;
    font-size: 14px;
    color: #6c757d;
    text-align: center;

    p {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    i {
        font-size: 16px;
        color: #0d6efd;
        margin-right: 8px;
    }
}

@media (max-width: 768px) {
    .login-card {
        width: 90%;
    }

    .form-section {
        padding: 20px;
    }

    .code-input-container {
        flex-direction: column;

        .send-code-btn {
            width: 100%;
        }
    }
}
</style>
