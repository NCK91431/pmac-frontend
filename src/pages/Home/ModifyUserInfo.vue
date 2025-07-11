<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-header">
                <i class="el-icon-user-solid"></i>
                <h2>修改用户信息</h2>
                <p>更新您的个人信息</p>
            </div>

            <el-form
                :model="userForm"
                ref="userFormRef"
                label-position="top"
                class="login-form"
            >
                <el-form-item
                    label="姓名"
                    prop="name"
                    :rules="[
                        {
                            required: true,
                            message: '请输入姓名',
                            trigger: 'blur',
                        },
                    ]"
                >
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
                        v-model="userForm.phone"
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();
const userFormRef = ref(null);

// 用户表单数据
const userForm = ref({
    name: "",
    phone: "",
    company: "",
});

// 提交表单
const submitForm = () => {
    userFormRef.value.validate((valid) => {
        if (valid) {
            // 模拟保存修改
            ElMessage.success("用户信息更新成功");

            // 实际项目中这里会调用API更新用户信息
            setTimeout(() => {
                router.push("/");
            }, 1500);
        }
    });
};

// 返回
const goBack = () => {
    router.go(-1);
};

// 初始化用户数据
onMounted(() => {
    // 模拟从状态管理或API获取用户信息
    userForm.value = {
        name: "张三",
        phone: "13800138000",
        company: "智慧能源科技有限公司",
    };
});
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
