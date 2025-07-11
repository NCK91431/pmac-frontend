<template>
    <div class="login-register-container">
        <div class="login-card">
            <div class="logo-section">
                <img
                    src="https://i.postimg.cc/7ZfS8FNx/pilot-logo.png"
                    alt=""
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

                    <!-- 姓名输入 -->
                    <el-form-item prop="name">
                        <el-input
                            v-model="formData.name"
                            :placeholder="
                                isRegister ? '请输入您的姓名' : '请输入您的姓名'
                            "
                            size="large"
                        >
                            <template #prefix>
                                <i class="bi bi-person"></i>
                            </template>
                        </el-input>
                    </el-form-item>

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

                    <!-- 仅在注册模式显示公司名称 -->
                    <el-form-item v-if="isRegister" prop="company">
                        <el-input
                            v-model="formData.company"
                            placeholder="请输入您的公司名称"
                            size="large"
                        >
                            <template #prefix>
                                <i class="bi bi-building"></i>
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
import { ref, computed, inject } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import request from "@/utils/request";
const updateUser = inject("updateUser"); //注入全局方法
const router = useRouter();

// 表单数据
const formData = ref({
    name: "",
    phone: "",
    company: "",
});

// 当前是否为注册模式
const isRegister = ref(false);

// 切换登录/注册模式
const toggleMode = () => {
    isRegister.value = !isRegister.value;
    errorMessage.value = "";

    // 重置表单
    formData.value.name = "";
    formData.value.phone = "";
    formData.value.company = "";

    // 重置表单验证
    if (loginForm.value) {
        loginForm.value.resetFields();
    }
};

// 表单验证规则
const formRules = computed(() => {
    const baseRules = {
        name: [
            { required: true, message: "请输入姓名", trigger: "blur" },
            {
                min: 2,
                max: 20,
                message: "姓名长度应在2-20个字符",
                trigger: "blur",
            },
        ],
        phone: [
            { required: true, message: "请输入手机号", trigger: "blur" },
            {
                pattern: /^1[3-9]\d{9}$/,
                message: "请输入有效的手机号",
                trigger: "blur",
            },
        ],
    };

    // 注册模式添加公司名称验证
    if (isRegister.value) {
        return {
            ...baseRules,
            company: [
                { required: true, message: "请输入公司名称", trigger: "blur" },
                {
                    min: 2,
                    max: 50,
                    message: "公司名称长度应在2-50个字符",
                    trigger: "blur",
                },
            ],
        };
    }

    return baseRules;
});

const loginForm = ref(null); //验证表单
const loading = ref(false);
const errorMessage = ref("");

// 处理表单提交
const handleSubmit = async () => {
    try {
        // 验证表单
        const valid = await loginForm.value.validate();
        if (!valid) return;

        loading.value = true;
        errorMessage.value = "";

        if (isRegister.value) {
            // 注册逻辑
            await handleRegister();
        } else {
            // 登录逻辑
            await handleLogin();
        }
    } catch (error) {
        console.error("操作失败:", error);
        // 错误信息已在具体处理函数中设置
    } finally {
        loading.value = false;
    }
};

// 处理注册请求
const handleRegister = async () => {
    try {
        const response = await request.post(
            "/api/auth/register",
            formData.value,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.success) {
            // 使用全局方法更新用户状态，传入用户信息和token
            updateUser(response.data.user, response.data.token);

            ElMessage.success({
                message: `注册成功，欢迎 ${response.data.user.name}！`,
                duration: 2000,
            });

            router.push("/");
        } else {
            errorMessage.value = response.data.error || "注册失败，请重试";
        }
    } catch (error) {
        console.error("注册失败:", error);
        if (error.response?.status === 409) {
            errorMessage.value = "该手机号已注册，请直接登录";
        } else {
            errorMessage.value =
                error.response?.data?.error || "注册失败，请稍后重试";
        }
    }
};

// 处理登录请求
const handleLogin = async () => {
    try {
        // 只提交登录所需的字段
        const loginData = {
            name: formData.value.name,
            phone: formData.value.phone,
        };

        const response = await request.post("/api/auth/login", loginData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.data.success) {
            // 使用全局方法更新用户状态，传入用户信息和token
            updateUser(response.data.user, response.data.token);

            ElMessage.success({
                message: `欢迎回来，${response.data.user.name}！`,
                duration: 2000,
            });

            router.back();
        } else {
            // 假设404状态码表示用户不存在
            if (error.response?.status === 404) {
                errorMessage.value = "用户不存在，请先注册";
            } else {
                errorMessage.value = response.data.error || "登录失败，请重试";
            }
        }
    } catch (error) {
        console.error("登录失败:", error);
        if (error.response?.status === 404) {
            errorMessage.value = "用户不存在，请先注册";
        } else {
            errorMessage.value =
                error.response?.data?.error || "登录失败，请稍后重试";
        }
    }
};
</script>

<style lang="scss" scoped>
.login-register-container {
    justify-content: center;
    display: flex;
    align-items: center;
    min-height: calc(100vh - 405px);
}

.login-card {
    width: 100%;
    max-width: 450px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}

.logo-section {
    background: #0d6efd;
    color: white;
    padding: 10px;
    text-align: center;

    i {
        font-size: 48px;
        display: block;
        margin-bottom: 15px;
        color: #ffd43b;
    }

    h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
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

    .submit-btn {
        width: 100%;
        height: 48px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
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

    .register-prompt {
        margin-top: 20px;
        text-align: center;
        color: #6c757d;
        font-size: 14px;

        p {
            margin-bottom: 8px;
        }

        .el-button {
            color: #0d6efd;
            padding: 5px 10px;

            &:hover {
                background-color: rgba(13, 110, 253, 0.05);
            }

            i {
                transition: transform 0.3s;
            }

            &:hover i {
                transform: translateX(3px);
            }
        }
    }
}

.info-section {
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
    padding: 20px;
    font-size: 14px;
    color: #6c757d;

    p {
        margin: 0;
        display: flex;
        align-items: center;
    }

    i {
        font-size: 16px;
        color: #0d6efd;
    }
}
</style>
