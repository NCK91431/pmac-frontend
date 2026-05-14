<template>
  <div class="universal-header" ref="headerRef">
    <div class="header-content">
      <!-- 公司Logo和平台名称 ===== -->
      <div class="logo-section">
        <img
          class="company-logo"
          :style="{ width: isTrina ? '100px' : '55px' }"
          :src="
            isTrina
              ? 'https://pmac.leyi.host/downloads/trina/trina-logo.png'
              : 'https://pmac.leyi.host/downloads/pmac/pilot-logo.png'
          "
          alt="公司Logo"
        />
        <div class="platform-title" v-if="!isTrina">
          <img
            class="platform-logo"
            src="https://pmac.leyi.host/downloads/pmac/test-logo.png"
            alt="平台Logo"
          />
          <div class="pmac-title">
            {{ $t("header.platformName") }}
          </div>
        </div>
      </div>
      <!-- 分隔线 ===== -->
      <div class="header-divider"></div>
      <Bread />

      <div class="user-info">
        <!-- 如果有用户信息，显示用户头像和公司名称 -->
        <template v-if="isHaveUser">
          <el-popover placement="bottom-end" trigger="click" :width="260">
            <template #reference>
              <div class="user-company">
                <img :src="avatarURL" class="user-avatar" alt="用户头像" />
                <span class="company-name">{{ user.name }}</span>
                <i class="el-icon-caret-bottom"></i>
              </div>
            </template>

            <div class="user-popover">
              <div class="user-header">
                <img :src="avatarURL" class="popover-avatar" alt="用户头像" />
                <div class="user-details">
                  <h3>{{ user.name }}</h3>
                  <p>
                    <i class="el-icon-mobile-phone"></i>
                    {{ user.phone }}
                  </p>
                  <p>
                    <i class="el-icon-office-building"></i>
                    {{ user.company || $t("header.companyNotSet") }}
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
        <!-- 如果没有用户信息，显示登录按钮 -->
        <template v-else>
          <el-popover placement="bottom-end" trigger="click" :width="260">
            <template #reference>
              <div class="user-company">
                <img :src="avatarURL" class="user-avatar" alt="用户头像" />
                <span class="company-name">{{ $t("header.notLoggedIn") }}</span>
                <i class="el-icon-caret-bottom"></i>
              </div>
            </template>

            <div class="user-popover">
              <div class="user-header">
                <img :src="avatarURL" class="popover-avatar" alt="用户头像" />
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
import { useI18n } from "vue-i18n";
import Bread from "./Bread.vue";

const { t } = useI18n();

const forecastStore = useLoadForecastStore();
const isTrina = import.meta.env.VITE_COMPANY === "trina";

const user = inject("user");
const clearUser = inject("clearUser");
const isHaveUser = computed(() => Boolean(user.value));

const router = useRouter();

const avatarURL = ref(
  "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
);

function onLogout() {
  ElMessageBox.confirm("您确定要登出此账号吗?", "Warning", {
    title: "操作提示",
    confirmButtonText: "确认",
    cancelButtonText: "返回",
    type: "warning",
  }).then(() => {
    clearUser();
    forecastStore.resetStage();
    forecastStore.set_activeHistoryRecordId(null);
    forecastStore.resetForm();
    forecastStore.clearContinueData();
    forecastStore.setActiveTab("upload");
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

const headerRef = ref(null);
const emit = defineEmits(["update:headerHeight"]);

const updateHeaderHeight = () => {
  if (headerRef.value) {
    const height = headerRef.value.offsetHeight;
    emit("update:headerHeight", height);
  }
};

onMounted(() => {
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateHeaderHeight);
});
</script>

<style lang="scss" scoped>
.universal-header {
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    padding: 0.5rem 0;
  }

  .header-content {
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      padding: 0 5%;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      margin-left: 1rem;

      .platform-title {
        display: flex;
        align-items: flex-end;
        gap: 0.3rem;

        @media (max-width: 768px) {
          .pmac-subtitle {
            display: none;
          }
        }

        .pmac-title {
          font-size: 1.1rem;
          line-height: 1.1rem;
          font-weight: 600;
          background: linear-gradient(135deg, #8ba3f4, #ff72ae);
          background-clip: text;
          //字体倾斜
          font-style: italic;
          // 文字阴影
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          color: transparent;
          opacity: 0.85;
          margin: 0;

          @media (max-width: 768px) {
            font-size: 1rem;
          }
        }

        .pmac-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 400;
        }
      }

      img.company-logo {
        height: auto;

        @media (max-width: 768px) {
          width: 40px !important;
        }
      }

      img.platform-logo {
        height: 1.1rem;
        width: auto;
      }
    }

    .user-info {
      margin-right: 1%;
      .user-company {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
          width: 1.2rem;
          height: 1.2rem;
          border-radius: 50%;
          object-fit: cover;

          @media (max-width: 768px) {
            width: 28px !important;
            height: 28px !important;
          }
        }

        .company-name {
          color: #cbd5e1;
          font-weight: 500;
          font-size: 0.75rem;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          @media (max-width: 768px) {
            display: none;
          }
        }

        .el-icon-caret-bottom {
          color: #64748b;
          font-size: 12px;

          @media (max-width: 768px) {
            display: none;
          }
        }
      }
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
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
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

// ===== 分隔线样式 =====
.universal-header {
  .header-content {
    .header-divider {
      width: 1px;
      height: 1.5rem;
      margin-left: 2.5rem;
      background: rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
    }
  }
}

@media (max-width: 768px) {
  .universal-header {
    .header-content {
      .header-divider {
        display: none;
      }
    }
  }
}
</style>
