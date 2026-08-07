# 电价分析会员门禁 + 会员引导弹窗 · 设计文档

日期：2026-08-07

## 1. 背景与目标

电价分析模块下的「节点电价查询」与「结算电价预测与查看」目前对登录用户完全开放（临时放开状态），需要恢复为**会员专属功能**：

- 非会员**先进入页面**，随后弹出**会员引导弹窗**（视觉已定稿，方案 C 放大版，对接会员中心设计语言），引导用户进入会员中心开通会员。
- 会员可正常使用，不弹窗。
- 前后端双重收口：前端路由守卫 + 后端 `requireMembership` 中间件 403 兜底。

## 2. 决策记录（已与用户确认）

| 决策点 | 结论 |
|---|---|
| `/membership` 会员中心页权限 | 放开 `permission: "internal"` 限制，所有登录用户可访问 |
| 后端接口鉴权 | 前后端都收口：恢复 nodePrice 会员校验、settlementPrice 增加会员校验 |
| 未登录用户 | 先跳登录页，登录后进入页面再弹窗 |
| 弹窗「稍后再说」 | 回到原路径（router 后退，无历史时兜底回首页） |
| 弹窗频率 | 每次都弹（不记忆） |
| 实现机制 | 方案 A：路由级软拦截（`requiresMembership` meta）+ 全局弹窗组件 |

## 3. 前端改造

### 3.1 路由配置（src/router/index.js）

| 路由 | 现状 | 改后 |
|---|---|---|
| `/price-analysis` | `meta: { requiresAuth: true }` | `meta: { requiresAuth: true, requiresMembership: true }` |
| `/price-analysis/settlement` | `meta: { permission: "internal" }` | 去掉 `permission: "internal"`，改为 `meta: { requiresMembership: true }`（保留 `module`、`breadcrumb`） |
| `/membership` | `meta: { permission: "internal" }` | 去掉 `permission: "internal"`（保留 `breadcrumb`） |
| `/membership/invoices` | `meta: { permission: "internal" }` | 去掉 `permission: "internal"` |
| `sidebarMenuConfig.membership` | `permission: "internal"` | 去掉 `permission`（否则侧边栏「会员中心」菜单对普通用户不可见） |

### 3.2 路由守卫软拦截（router/index.js 第 515-539 行）

现有 `requiresMembership` 守卫在非会员时 `next({ name: "membership" })` 硬跳转。改为：

```
1. 未登录（无 token / userInfo）→ next({ name: "login" })
2. 调用 GET /api/membership/status 实时校验
3. 会员 → 放行 next()，同步刷新 localStorage.membershipStatus
4. 非会员 → 清理 localStorage.membershipStatus → next() 放行进入页面 → 设置
   membershipStore.gateVisible = true（触发全局弹窗）
5. 接口失败（网络/后端异常）→ 放行 next()，靠后端 403 兜底
```

守卫通过 `useMembershipStore()`（pinia 实例在守卫回调执行时已激活）访问 store。

### 3.3 会员状态 store（src/store/membership.js）

新增：

- `gateVisible = ref(false)` — 全局会员引导弹窗可见性
- `openGate()` / `closeGate()` — 打开/关闭弹窗

### 3.4 全局弹窗组件 src/components/MembershipGateModal.vue（新建）

按已定稿的 v2 视觉设计实现（详见第 5 节弹窗视觉规格）：

- **props**：无；读取 `membershipStore.gateVisible`
- **「立即开通会员」**：`router.push({ name: "membership" })` + `closeGate()`
- **「稍后再说」**：`router.back()`；若 `window.history.length <= 1`（无可退历史，如 URL 直达）则 `router.push({ name: "home" })` 兜底 + `closeGate()`
- **右上角 ✕ 关闭**：行为与「稍后再说」一致
- **遮罩点击**：不关闭（避免误触；与引导意图一致）
- 在 App.vue 模板中挂载（`<MembershipGateModal />`），全站生效

### 3.5 现有 403 兜底（保留，不改）

src/utils/request.js 第 56-63 行已处理后端 403 `MEMBERSHIP_REQUIRED`：清缓存 + 跳 `/membership`。保留作为异常兜底（如会员刚过期、守卫实时校验与后端判定不一致的场景）。

## 4. 后端改造

### 4.1 routes/nodePrice.js

恢复两行中间件，删除「临时放开」注释：

```js
router.use(AuthController.verifyToken);
router.use(MembershipController.requireMembership);
```

### 4.2 routes/settlementPrice.js

- import `MembershipController`（`require('../controllers/membershipController')`）
- 在现有 `router.use(AuthController.verifyToken);` 之后追加：

```js
router.use(MembershipController.requireMembership);
```

## 5. 弹窗视觉规格（定稿：方案 C 放大版）

对齐 Membership/index.vue「结算电价预测 Banner」设计语言：

- **卡片**：约 660px 宽，圆角 16px，白底，双栏布局，阴影
- **左侧内容区**（白底，padding 30px 28px 26px）：
  - 紫色渐变徽章「会员专享功能」（`linear-gradient(135deg, #6d28d9, #4f46e5)`，金色星标）
  - 标题「开通**尊享会员** · 解锁电价分析」（24px 加粗，`#6d28d9` 强调）
  - 描述「实时节点电价 · 结算电价预测，电力市场行情一手掌握」（14px 灰）
  - 两条权益卡片：紫色图标（36px，`#ede9fe` 底）+ 标题 + 描述
    - 节点电价查询：「单日 / 溯前30天 / 多日 / 对比模式」
    - 结算电价预测与查看：「D+1 逐时预测 · 实时 / 日前结算电价」
  - 紫色渐变主按钮「立即开通会员 →」（`#6d28d9→#4f46e5`，`box-shadow: 0 8px 20px rgba(109,40,217,.3)`）
  - 「稍后再说」灰色链接
- **右侧视觉区**（260px，`linear-gradient(135deg, #f5f3ff, #eef2ff)`）：
  - 右上角金色星标角标（白底圆角方形，`#f59e0b`）
  - 「结算电价曲线」紫色小标签
  - 190×150 紫色曲线 SVG（`#6D28D9` 线条 + 面积渐变）
- **右上角**：圆形 ✕ 关闭按钮（28px，灰色）

## 6. 错误处理

| 场景 | 行为 |
|---|---|
| 守卫 `/api/membership/status` 接口失败 | 放行进入页面，后端 403 兜底 |
| 后端接口 403 `MEMBERSHIP_REQUIRED` | request.js 全局处理：清缓存 + 跳 `/membership` |
| 弹窗无历史可退（URL 直达） | `router.push({ name: "home" })` 兜底 |

## 7. 验证场景

前端：
1. 非会员（含免费试用过期）进入 `/price-analysis`、`/price-analysis/settlement` → 正常进入页面 + 弹出引导弹窗
2. 弹窗点「立即开通会员」→ 进入会员中心
3. 弹窗点「稍后再说」→ 回到来源页面（从首页进入则回首页）
4. 会员进入两页面 → 不弹窗，正常使用
5. 未登录访问两页面 → 跳登录页
6. `/membership`、侧边栏「会员中心」菜单对普通登录用户可见

后端：
1. 无 token 调接口 → 401
2. 有 token 非会员调接口 → 403 `MEMBERSHIP_REQUIRED`
3. 会员调接口 → 200

## 8. 范围外（YAGNI）

- 不做弹窗记忆去重（用户明确要求每次都弹）
- 不改动 /admin/invoices 路由（后台发票管理，保持 admin 权限）
- 不改动会员购买流程、支付逻辑本身
