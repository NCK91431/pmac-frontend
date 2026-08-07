<template>
  <Transition name="mg-fade">
    <div v-if="visible" class="mg-overlay">
      <div class="mg-modal">
        <button class="mg-close" title="关闭" @click="handleLater">✕</button>
        <div class="mg-left">
          <span class="mg-badge">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5z" fill="#FBBF24"/></svg>
            会员专享功能
          </span>
          <h3 class="mg-title">开通<b>尊享会员</b><br />解锁电价分析</h3>
          <p class="mg-desc">实时节点电价 · 结算电价预测，电力市场行情一手掌握</p>
          <div class="mg-feats">
            <div class="mg-feat">
              <div class="mg-feat-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="2" fill="#6D28D9"/>
                  <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="#6D28D9" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <div class="mg-feat-title">节点电价查询</div>
                <p class="mg-feat-desc">单日 / 溯前30天 / 多日 / 对比模式</p>
              </div>
            </div>
            <div class="mg-feat">
              <div class="mg-feat-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 15l4-4 3 2 6-7" stroke="#6D28D9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 6h2v2" stroke="#6D28D9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <div class="mg-feat-title">结算电价预测与查看</div>
                <p class="mg-feat-desc">D+1 逐时预测 · 实时 / 日前结算电价</p>
              </div>
            </div>
          </div>
          <button class="mg-btn" @click="handleOpen">
            立即开通会员
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="mg-link" @click="handleLater">稍后再说</button>
        </div>

        <div class="mg-visual">
          <div class="mg-visual-badge">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5z" fill="#FBBF24"/></svg>
          </div>
          <div class="mg-visual-caption">结算电价曲线</div>
          <svg width="190" height="150" viewBox="0 0 190 150" fill="none">
            <line x1="20" y1="30" x2="175" y2="30" stroke="#E5E7EB" stroke-width="0.5"/>
            <line x1="20" y1="65" x2="175" y2="65" stroke="#E5E7EB" stroke-width="0.5"/>
            <line x1="20" y1="100" x2="175" y2="100" stroke="#E5E7EB" stroke-width="0.5"/>
            <line x1="20" y1="135" x2="175" y2="135" stroke="#E5E7EB" stroke-width="0.5"/>
            <path d="M20 110 Q45 92 60 80 T95 58 T130 44 T165 32 L165 135 L20 135Z" fill="url(#mgArea)" opacity="0.28"/>
            <path d="M20 110 Q45 92 60 80 T95 58 T130 44 T165 32" stroke="#6D28D9" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <circle cx="60" cy="80" r="3" fill="#6D28D9"/>
            <circle cx="95" cy="58" r="3" fill="#6D28D9"/>
            <circle cx="130" cy="44" r="3" fill="#6D28D9"/>
            <circle cx="165" cy="32" r="4.5" fill="#6D28D9" stroke="#fff" stroke-width="2"/>
            <text x="20" y="147" fill="#9CA3AF" font-size="9">00:00</text>
            <text x="85" y="147" fill="#9CA3AF" font-size="9">12:00</text>
            <text x="150" y="147" fill="#9CA3AF" font-size="9">24:00</text>
            <defs>
              <linearGradient id="mgArea" x1="20" y1="30" x2="20" y2="135" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6D28D9"/>
                <stop offset="1" stop-color="#6D28D9" stop-opacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useMembershipStore } from "@/store/membership";

const router = useRouter();
const membershipStore = useMembershipStore();
const visible = computed(() => membershipStore.gateVisible);

// 立即开通会员：进入会员中心
const handleOpen = () => {
  membershipStore.closeGate();
  router.push({ name: "membership" });
};

// 稍后再说 / 关闭：回到原路径，无可退历史时兜底回首页
const handleLater = () => {
  membershipStore.closeGate();
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "home" });
  }
};
</script>

<style scoped>
.mg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(6, 10, 26, 0.66);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  z-index: 10000;
}

.mg-modal {
  position: relative;
  width: min(660px, 94vw);
  max-height: calc(100vh - 56px);
  overflow-y: auto;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 28px 70px rgba(40, 20, 80, 0.4), 0 4px 14px rgba(40, 20, 80, 0.12);
  display: flex;
}

.mg-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background: #f3f4f6;
  font-size: 13px;
  line-height: 1;
  transition: all 0.15s;
}
.mg-close:hover {
  color: #4b5563;
  background: #e5e7eb;
}

.mg-left {
  flex: 1;
  padding: 30px 28px 26px;
}

.mg-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.mg-title {
  margin: 14px 0 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #111827;
  line-height: 1.35;
}
.mg-title b {
  color: #6d28d9;
}

.mg-desc {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.625;
  color: #6b7280;
}

.mg-feats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.mg-feat {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
}

.mg-feat-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #ede9fe;
  color: #6d28d9;
}

.mg-feat-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.mg-feat-desc {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.625;
  color: #6b7280;
}

.mg-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
  padding: 11px 30px;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow: 0 8px 20px rgba(109, 40, 217, 0.3);
  transition: opacity 0.2s;
}
.mg-btn:hover {
  opacity: 0.92;
}

.mg-link {
  display: block;
  margin-top: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #9ca3af;
  transition: color 0.15s;
}
.mg-link:hover {
  color: #6b7280;
}

.mg-visual {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  background: linear-gradient(135deg, #f5f3ff, #eef2ff);
  position: relative;
}

.mg-visual-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.mg-visual-caption {
  font-size: 12px;
  font-weight: 600;
  color: #6d28d9;
  letter-spacing: 0.04em;
}

.mg-fade-enter-active,
.mg-fade-leave-active {
  transition: opacity 0.2s ease;
}
.mg-fade-enter-active .mg-modal,
.mg-fade-leave-active .mg-modal {
  transition: transform 0.2s ease;
}
.mg-fade-enter-from,
.mg-fade-leave-to {
  opacity: 0;
}
.mg-fade-enter-from .mg-modal,
.mg-fade-leave-to .mg-modal {
  transform: scale(0.96);
}

@media (max-width: 700px) {
  .mg-modal {
    flex-direction: column;
  }
  .mg-visual {
    width: 100%;
    min-height: 160px;
  }
}
</style>
