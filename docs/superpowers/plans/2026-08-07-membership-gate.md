# 电价分析会员门禁 + 会员引导弹窗 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将「节点电价查询」与「结算电价预测与查看」恢复为会员专属功能：非会员先进入页面再弹出引导弹窗（视觉已定稿），前后端双重收口。

**Architecture:** 前端采用路由级软拦截——路由 meta 加 `requiresMembership`，守卫对非会员放行进入页面并触发全局弹窗（Pinia store 状态驱动，弹窗组件挂在 App.vue）。后端恢复 `MembershipController.requireMembership` 中间件做 403 兜底。弹窗「稍后再说」`router.back()` 回原路径。

**Tech Stack:** Vue 3 `<script setup>` + Pinia + vue-router（createWebHistory）；后端 Express Router 中间件。

**参考设计文档:** `docs/superpowers/specs/2026-08-07-membership-gate-design.md`（已提交，commit `831fc83`）

**注意：** 本项目无自动化测试框架（package.json 仅 dev/build/preview），每个任务用 `GetDiagnostics`（VS Code 诊断）与 `npm run build` 做编译级验证；功能由用户自测，不执行端到端验证。工作区存在此前的未提交改动（会员中心开发、EnergyNav 修复等），每次提交仅 `git add` 本任务涉及文件。

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `src/store/membership.js` | 修改 | 新增 `gateVisible` 弹窗状态 + `openGate()/closeGate()` |
| `src/components/MembershipGateModal.vue` | 新建 | 全局会员引导弹窗（定稿视觉） |
| `src/App.vue` | 修改 | 挂载 MembershipGateModal |
| `src/router/index.js` | 修改 | 路由 meta、菜单 permission、守卫软拦截 |
| `src/components/GlobalSidebar.vue` | 修改 | 更新导航临时放开注释 |
| `backend/routes/nodePrice.js` | 修改 | 恢复 verifyToken + requireMembership |
| `backend/routes/settlementPrice.js` | 修改 | 增加 requireMembership |

---

### Task 1: 扩展会员 store（弹窗可见性状态）

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/store/membership.js`

- [ ] **Step 1: 在 store 中新增 gateVisible 状态与开关方法**

读取当前文件（7 行处已有 `paidMembershipInfo`），在 `paidMembershipInfo` 定义后插入：

```js
  const paidMembershipInfo = ref({ isPaidMember: false, type: null, expireAt: null, daysLeft: 0 });
  // 会员引导弹窗可见性（由路由守卫触发，全局弹窗组件消费）
  const gateVisible = ref(false);

  function openGate() {
    gateVisible.value = true;
  }

  function closeGate() {
    gateVisible.value = false;
  }
```

并将 return 语句改为（在 `fetchMembershipStatus,` 后追加三项）：

```js
  return {
    loading,
    membershipInfo,
    claimedFreeTrial,
    paidMembershipInfo,
    history,
    gateVisible,
    openGate,
    closeGate,
    fetchMembershipStatus,
  };
```

- [ ] **Step 2: 验证**

用 GetDiagnostics 检查 `src/store/membership.js`，预期无错误（`ref` 已从 vue import）。

- [ ] **Step 3: 提交**

```bash
git add src/store/membership.js
git commit -m "feat: add membership gate modal state to store"
```

---

### Task 2: 新建全局弹窗组件 MembershipGateModal.vue

**Files:**
- Create: `/Users/guansiyu/Desktop/frontend-code/src/components/MembershipGateModal.vue`

- [ ] **Step 1: 创建组件文件**

完整代码（视觉按定稿 v2 设计 1:1 转换；`.v2-scene/.v2-page/.v2-veil` 等演示壳去掉，改由 `.mg-overlay` 固定遮罩承担）：

```vue
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
```

- [ ] **Step 2: 验证**

用 GetDiagnostics 检查 `src/components/MembershipGateModal.vue`，预期无错误（`@/store/membership` 路径别名已配置）。

- [ ] **Step 3: 提交**

```bash
git add src/components/MembershipGateModal.vue
git commit -m "feat: add membership gate modal component"
```

---

### Task 3: App.vue 挂载全局弹窗组件

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/App.vue`

- [ ] **Step 1: 引入并挂载组件**

在模板中 `</div>`（page-content 结束标签）之后、`<HomeFooter .../>` 之前插入：

```html
  <MembershipGateModal />
```

在 `<script setup>` 的 import 区（`import HomeFooter from "./components/HomeFooter.vue";` 之后）插入：

```js
import MembershipGateModal from "./components/MembershipGateModal.vue";
```

- [ ] **Step 2: 验证**

用 GetDiagnostics 检查 `src/App.vue`，预期无错误。

- [ ] **Step 3: 提交**

```bash
git add src/App.vue
git commit -m "feat: mount membership gate modal in App"
```

---

### Task 4: 路由 meta 与侧边栏菜单权限调整

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/router/index.js`

- [ ] **Step 1: 修改 `/membership` 路由（约第 229-238 行）**

将：

```js
        {
            path: "/membership",
            name: "membership",
            component: () => import("@/pages/Membership/index.vue"),
            meta: {
                // 临时限制：会员支付页仅对内部人员（internal 角色）开放
                permission: "internal",
                breadcrumb: { title: "会员中心", icon: "bi bi-star" },
            },
        },
```

改为：

```js
        {
            path: "/membership",
            name: "membership",
            component: () => import("@/pages/Membership/index.vue"),
            meta: {
                breadcrumb: { title: "会员中心", icon: "bi bi-star" },
            },
        },
```

- [ ] **Step 2: 修改 `/membership/invoices` 路由（约第 240-247 行）**

将：

```js
        {
            path: "/membership/invoices",
            name: "Invoices",
            component: () => import("@/pages/Membership/Invoices.vue"),
            meta: {
                permission: "internal",
                breadcrumb: { title: "记录与发票", icon: "bi bi-receipt" },
            },
        },
```

改为（去掉 `permission: "internal"` 一行）：

```js
        {
            path: "/membership/invoices",
            name: "Invoices",
            component: () => import("@/pages/Membership/Invoices.vue"),
            meta: {
                breadcrumb: { title: "记录与发票", icon: "bi bi-receipt" },
            },
        },
```

- [ ] **Step 3: 修改 `/price-analysis` 路由（约第 249-258 行）**

将：

```js
        {
            path: "/price-analysis",
            name: "price_analysis",
            component: () => import("@/pages/PriceAnalysis/Page.vue"),
            meta: {
                module: "price_analysis",
                // 临时放开：电价分析不再要求会员，登录即可访问
                requiresAuth: true,
                breadcrumb: { title: "节点电价查询", icon: "bi bi-sun" },
            },
        },
```

改为：

```js
        {
            path: "/price-analysis",
            name: "price_analysis",
            component: () => import("@/pages/PriceAnalysis/Page.vue"),
            meta: {
                module: "price_analysis",
                requiresAuth: true,
                requiresMembership: true,
                breadcrumb: { title: "节点电价查询", icon: "bi bi-sun" },
            },
        },
```

- [ ] **Step 4: 修改 `/price-analysis/settlement` 路由（约第 260-268 行）**

将：

```js
        {
            path: "/price-analysis/settlement",
            name: "PriceAnalysisSettlement",
            component: () => import("@/pages/PriceAnalysis/SettlementPrice/index.vue"),
            meta: {
                module: "trading",
                permission: "internal",
                breadcrumb: { title: "结算电价预测与查看", icon: "bi bi-cash-coin", parentRouteName: "price_analysis" },
            },
        },
```

改为：

```js
        {
            path: "/price-analysis/settlement",
            name: "PriceAnalysisSettlement",
            component: () => import("@/pages/PriceAnalysis/SettlementPrice/index.vue"),
            meta: {
                module: "trading",
                requiresMembership: true,
                breadcrumb: { title: "结算电价预测与查看", icon: "bi bi-cash-coin", parentRouteName: "price_analysis" },
            },
        },
```

- [ ] **Step 5: 修改 `sidebarMenuConfig.membership`（约第 460-470 行）**

将：

```js
        membership: {
        title: "会员中心",
        icon: "bi-star",
        route: "/membership",
        permission: "internal",
        children: [
```

改为：

```js
        membership: {
        title: "会员中心",
        icon: "bi-star",
        route: "/membership",
        children: [
```

（仅删除 `permission: "internal",` 一行；保留其他内容不动。）

- [ ] **Step 6: 验证**

用 GetDiagnostics 检查 `src/router/index.js`，预期无错误。

- [ ] **Step 7: 提交**

```bash
git add src/router/index.js
git commit -m "feat: open membership routes and mark price-analysis as membership-only"
```

---

### Task 5: 路由守卫改为软拦截（触发弹窗而非跳转）

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/router/index.js`（顶部 import 区 + 第 514-539 行守卫）

- [ ] **Step 1: 在文件顶部追加 store import**

在现有 `import request from "@/utils/request";` 之后插入：

```js
import { useMembershipStore } from "@/store/membership";
```

- [ ] **Step 2: 改造 requiresMembership 守卫**

将（约第 514-539 行）：

```js
    // 会员权益路由守卫（实时校验，接口失败时放行，靠后端鉴权兜底）
    if (to.meta.requiresMembership) {
        if (!token || !userInfo) {
            next({ name: "login" });
            return;
        }

        try {
            const res = await request.get("/api/membership/status");
            const ms = res.data?.membership;
            if (ms?.isMember) {
                // 会员：放行并同步刷新本地缓存
                localStorage.setItem("membershipStatus", JSON.stringify(ms));
                next();
                return;
            }
            // 非会员：清理缓存，跳转会员购买页
            localStorage.removeItem("membershipStatus");
            next({ name: "membership" });
            return;
        } catch (e) {
            // 接口失败（网络/后端异常）：放行，靠后端 403 兜底
            next();
            return;
        }
    }
```

改为：

```js
    // 会员权益路由守卫（实时校验，接口失败时放行，靠后端鉴权兜底）
    if (to.meta.requiresMembership) {
        if (!token || !userInfo) {
            next({ name: "login" });
            return;
        }

        try {
            const res = await request.get("/api/membership/status");
            const ms = res.data?.membership;
            if (ms?.isMember) {
                // 会员：放行并同步刷新本地缓存
                localStorage.setItem("membershipStatus", JSON.stringify(ms));
                next();
                return;
            }
            // 非会员：清理缓存，放行进入页面并触发会员引导弹窗
            localStorage.removeItem("membershipStatus");
            useMembershipStore().openGate();
            next();
            return;
        } catch (e) {
            // 接口失败（网络/后端异常）：放行，靠后端 403 兜底
            next();
            return;
        }
    }
```

- [ ] **Step 3: 验证**

用 GetDiagnostics 检查 `src/router/index.js`，预期无错误（`useMembershipStore` 已 import；pinia 在 `main.js` 中先于 router 注册，守卫回调执行时 store 可安全访问）。

- [ ] **Step 4: 提交**

```bash
git add src/router/index.js
git commit -m "feat: soft-gate membership routes with modal trigger"
```

---

### Task 6: 更新侧边栏导航注释

**Files:**
- Modify: `/Users/guansiyu/Desktop/frontend-code/src/components/GlobalSidebar.vue`（第 141-158 行 `handleNavigate`）

- [ ] **Step 1: 更新注释**

将：

```js
const handleNavigate = (child) => {
  if (!child.route) return;

  // 临时放开：电价分析不再要求会员，点击直接进入

  router.push(child.route).then(() => {
```

改为：

```js
const handleNavigate = (child) => {
  if (!child.route) return;

  // 电价分析等会员页面由路由守卫（requiresMembership）软拦截并弹出会员引导弹窗，此处直接进入
  router.push(child.route).then(() => {
```

- [ ] **Step 2: 验证**

用 GetDiagnostics 检查 `src/components/GlobalSidebar.vue`，预期无错误。

- [ ] **Step 3: 提交**

```bash
git add src/components/GlobalSidebar.vue
git commit -m "chore: update sidebar navigate comment for membership gate"
```

---

### Task 7: 后端恢复 nodePrice 会员校验

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/routes/nodePrice.js`

- [ ] **Step 1: 恢复中间件**

将（第 7-10 行）：

```js
// 所有节点电价接口都需要登录认证
// router.use(AuthController.verifyToken);
// 临时放开：电价分析不再要求会员，登录即可访问（恢复时取消下一行注释）
// router.use(MembershipController.requireMembership);
```

改为：

```js
// 所有节点电价接口都需要登录认证 + 会员校验（会员到期时返回 403）
router.use(AuthController.verifyToken);
router.use(MembershipController.requireMembership);
```

- [ ] **Step 2: 验证**

Run: `node --check /Users/guansiyu/Desktop/backend-code/routes/nodePrice.js`
Expected: 无输出、退出码 0（`AuthController` 与 `MembershipController` 已在文件第 4-5 行 import）。

- [ ] **Step 3: 提交**

```bash
git add routes/nodePrice.js
git commit -m "feat: enforce membership on node price routes"
```

---

### Task 8: 后端 settlementPrice 增加会员校验

**Files:**
- Modify: `/Users/guansiyu/Desktop/backend-code/routes/settlementPrice.js`

- [ ] **Step 1: import MembershipController 并追加中间件**

在文件顶部（第 4 行 `const AuthController = require('../controllers/auth');` 之后）插入：

```js
const MembershipController = require('../controllers/membershipController');
```

在第 62 行 `router.use(AuthController.verifyToken);` 之后插入：

```js
router.use(MembershipController.requireMembership);
```

（最终两行应为：）

```js
router.use(AuthController.verifyToken);
router.use(MembershipController.requireMembership);
```

- [ ] **Step 2: 验证**

Run: `node --check /Users/guansiyu/Desktop/backend-code/routes/settlementPrice.js`
Expected: 无输出、退出码 0。

- [ ] **Step 3: 提交**

```bash
git add routes/settlementPrice.js
git commit -m "feat: enforce membership on settlement price routes"
```

---

### Task 9: 全量编译验证 + 交付自测清单

**Files:**
- 无代码改动，仅验证

- [ ] **Step 1: 前端编译验证**

Run: `npm run build`（在 `/Users/guansiyu/Desktop/frontend-code`）
Expected: 构建成功、退出码 0、无编译错误。

- [ ] **Step 2: 后端语法验证**

Run: `node --check routes/nodePrice.js && node --check routes/settlementPrice.js`（在 `/Users/guansiyu/Desktop/backend-code`）
Expected: 无输出、退出码 0。

- [ ] **Step 3: 最终提交（若 Step 1-2 发现并修复了问题）**

```bash
git add <修复的文件>
git commit -m "fix: resolve build issues for membership gate"
```

- [ ] **Step 4: 交付自测清单（用户执行）**

向用户说明以下自测场景：

1. 非会员（含免费试用过期）从侧边栏进入「节点电价查询」→ 页面正常进入 + 弹出引导弹窗
2. 非会员进入「结算电价预测与查看」→ 同样弹窗
3. 弹窗点「立即开通会员」→ 进入会员中心页面
4. 弹窗点「稍后再说」/ ✕ → 回到来源页面
5. 会员进入两页面 → 不弹窗，正常使用
6. 未登录访问两页面 → 跳登录页
7. 侧边栏「会员中心」菜单对普通登录用户可见
8. 后端：非会员直接调 `/api/node-price/*`、`/api/settlement-price/*` → 403 `MEMBERSHIP_REQUIRED`；会员 → 200
