<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <h2>修改用户信息</h2>
                <p>更新您的个人信息</p>
            </div>

            <el-form
                :rules="formRules"
                :model="userForm"
                ref="formRef"
                label-position="top"
                class="login-form"
            >
                <el-form-item label="姓名" prop="name">
                    <el-input
                        v-model="userForm.name"
                        placeholder="请输入您的姓名"
                        size="large"
                    >
                        <template #prefix>
                            <i class="el-icon-user"></i>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="手机号" prop="phone">
                    <el-input
                        v-model="user.phone"
                        placeholder="请输入您的手机号"
                        size="large"
                        disabled
                    >
                        <template #prefix>
                            <i class="el-icon-mobile-phone"></i>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item
                    label="公司名称"
                    prop="company"
                    :rules="[
                        {
                            required: true,
                            message: '请输入公司名称',
                            trigger: 'blur',
                        },
                    ]"
                >
                    <el-input
                        v-model="userForm.company"
                        placeholder="请输入您的公司名称"
                        size="large"
                    >
                        <template #prefix>
                            <i class="el-icon-office-building"></i>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item>
                    <el-button
                        :loading="submitLoading"
                        type="primary"
                        class="submit-btn"
                        size="large"
                        @click="submitForm"
                    >
                        保存修改
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="login-footer">
                <el-button link @click="goBack">
                    <i class="el-icon-arrow-left"></i> 返回
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const user = inject("user");
const updateUser = inject("updateUser"); //注入全局方法
import request from "@/utils/request";

// 用户表单数据
const userForm = ref({
    name: "",
    company: "",
});
onMounted(() => {
    userForm.value.name = user.value.name;
    userForm.value.company = user.value.company;
});

const formRef = ref(null);
const submitLoading = ref(false); // 新增加载状态
// 修复后的表单规则（移除计算属性）
const formRules = {
    name: [
        { required: true, message: "请输入姓名", trigger: "blur" },
        { min: 2, max: 20, message: "姓名长度应在2-20个字符", trigger: "blur" },
    ],
    company: [
        { required: true, message: "请输入公司名称", trigger: "blur" },
        {
            min: 2,
            max: 40,
            message: "公司名称长度应在2-40个字符",
            trigger: "blur",
        },
    ],
};
// 提交表单
async function submitForm() {
    if (
        userForm.value.name == user.value.name &&
        userForm.value.company == user.value.company
    ) {
        ElMessage.error("您未做任何修改");
        return;
    }
    try {
        // 关键修复：执行表单验证
        const valid = await formRef.value.validate();
        if (!valid) return;
        submitLoading.value = true;
        // 发送请求
        const res = await request.post("/api/auth/update", userForm.value, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (res.data.success) {
            const userInfo = res.data.user,
                authToken = res.data.token;
            updateUser(userInfo, authToken);
            ElMessage.success("用户信息更新成功");
            router.back();
        }
    } catch (error) {
        ElMessage.error(error.response?.data?.message || "更新失败");
    } finally {
        submitLoading.value = false;
    }
}

// 返回
const goBack = () => {
    router.go(-1);
};
</script>

<style lang="scss" scoped>
.login-container {
    justify-content: center;
    display: flex;
    align-items: center;
    min-height: calc(100vh - 405px);
}

.login-box {
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    padding: 40px;
}

.login-header {
    text-align: center;
    margin-bottom: 30px;

    .el-icon-user-solid {
        font-size: 48px;
        color: #1a3a6c;
        margin-bottom: 15px;
        background: #f0f7ff;
        border-radius: 50%;
        padding: 15px;
    }

    h2 {
        font-size: 28px;
        color: #1a3a6c;
        margin: 10px 0;
    }

    p {
        color: #718096;
        font-size: 16px;
        margin: 0;
    }
}

.login-form {
    .el-form-item {
        margin-bottom: 25px;
    }

    .el-form-item__label {
        font-weight: 600;
        color: #4a5568;
        padding-bottom: 8px;
    }

    .el-input {
        :deep(.el-input__wrapper) {
            padding: 0 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;

            &:hover {
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            &.is-focus {
                box-shadow: 0 0 0 2px rgba(26, 58, 108, 0.2);
            }
        }

        :deep(.el-input__prefix) {
            display: flex;
            align-items: center;
            margin-right: 8px;
            color: #a0aec0;
        }
    }
}

.submit-btn {
    width: 100%;
    padding: 15px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    background: linear-gradient(135deg, #1a3a6c, #2c5282);
    border: none;
    transition: all 0.3s ease;
    cursor: pointer;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(26, 58, 108, 0.3);
    }
}

.login-footer {
    text-align: center;
    margin-top: 20px;

    .el-button {
        color: #718096;
        font-size: 14px;

        &:hover {
            color: #1a3a6c;
        }
    }
}
</style>
