# 全局侧边导航栏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个独立的 GlobalSidebar 全局侧边导航栏组件，固定在页面左侧。收起时显示为 48px 图标窄条，鼠标悬停展开为 260px 覆盖式导航面板。

**Architecture:** 新增 `src/components/GlobalSidebar.vue` 独立组件，在 `App.vue` 中与 HeaderSection 平级引入。展开/收起通过 CSS hover 控制，导航数据通过集中式配置对象管理，白名单权限从 `user.role` 字段判断。

**Tech Stack:** Vue 3 (Composition API), Bootstrap Icons, CSS Flexbox

---

### Task 1: 创建 GlobalSidebar.vue 组件

**Files:**

- Create: `src/components/GlobalSidebar.vue`

- [ ] **Step 1: 创建组件模板结构**

在 `src/components/GlobalSidebar.vue` 中写入完整组件。组件包含两大部分：48px 图标窄条（始终显示）和 260px 展开面板（hover 控制显示/隐藏）。

```vue
<template>
  <div
    class="global-sidebar"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <!-- 48px 图标窄条 -->
    <div class="icon-bar">
      <i class="bi" :class="isExpanded ? 'bi-arrow-left' : 'bi-list'" />
      <div class="icon-group">
        <template v-for="item in navItems" :key="item.title">
          <div
            v-if="!item.whitelist || canSeeTrading"
            class="nav-icon"
            :title="item.title"
          >
            <i :class="'bi ' + item.icon" />
          </div>
        </template>
      </div>
    </div>

    <!-- 260px 展开面板 -->
    <transition name="slide">
      <div v-show="isExpanded" class="sidebar-panel">
        <div class="panel-header">功能导航</div>
        <div class="panel-body">
          <div v-for="item in navItems" :key="item.title" class="nav-section">
            <template v-if="!item.whitelist || canSeeTrading">
              <div
                class="nav-section-title"
                @click="toggleCollapse(item.title)"
              >
                <i :class="'bi ' + item.icon" />
                <span>{{ item.title }}</span>
                <span v-if="item.whitelist" class="internal-badge">仅内部</span>
                <i
                  class="bi bi-chevron-down collapse-arrow"
                  :class="{ rotated: collapsedItems[item.title] }"
                />
              </div>
              <div v-show="!collapsedItems[item.title]" class="nav-children">
                <div
                  v-for="child in item.children"
                  :key="child.title"
                  class="nav-child-item"
                  @click="handleNavigate(child.route)"
                >
                  {{ child.title }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
```

- [ ] **Step 2: 编写组件脚本逻辑**

```vue
<script setup>
import { ref, inject, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = inject("user");

const isExpanded = ref(false);
const collapsedItems = ref({});

const canSeeTrading = computed(() => user.value?.role === "internal");

const navItems = [
  {
    title: "负荷预测",
    icon: "bi-bar-chart-line",
    route: "/loadpre",
    children: [
      { title: "案例展示", route: "/load_example" },
      { title: "用法演示视频", route: "/home" },
      { title: "新建模型", route: "/loadpre" },
      { title: "已建模型", route: "/loadpre" },
    ],
  },
  {
    title: "光伏发电预测",
    icon: "bi-sun",
    route: "/elec",
    children: [
      { title: "案例展示", route: "/elec_example" },
      { title: "新建模型", route: "/elec" },
      { title: "已建模型", route: "/elec" },
    ],
  },
  {
    title: "光储定容测算",
    icon: "bi-battery-charging",
    route: "/light",
    children: [
      { title: "案例展示", route: "/light_example" },
      { title: "新建测算", route: "/light" },
      { title: "历史测算", route: "/light" },
    ],
  },
  {
    title: "辅助电力交易",
    icon: "bi-graph-up-arrow",
    route: "",
    whitelist: true,
    children: [
      { title: "日前交易申报", route: "/daily-demand-report" },
      { title: "历史申报", route: "/daily-demand-report/history" },
      {
        title: "收益分析",
        route: "/daily-demand-report/history/daily-revenue-analysis",
      },
      { title: "月度需求申报", route: "/monthly-demand-report" },
    ],
  },
];

function toggleCollapse(title) {
  collapsedItems.value[title] = !collapsedItems.value[title];
}

function handleNavigate(route) {
  if (route) {
    router.push(route);
  }
}
</script>
```

- [ ] **Step 3: 编写组件样式**

```vue
<style scoped>
.global-sidebar {
  position: fixed;
  left: 0;
  top: v-bind("headerHeight + 'px'");
  height: calc(100vh - v-bind("headerHeight + 'px'"));
  z-index: 1000;
  display: flex;
}

.icon-bar {
  width: 48px;
  height: 100%;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 4px;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
  cursor: default;
}

.icon-bar .bi-list,
.icon-bar .bi-arrow-left {
  font-size: 18px;
  color: white;
  margin-bottom: 16px;
  padding: 4px;
  cursor: default;
}

.icon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
}

.nav-icon:hover {
  color: white;
  background: rgba(255, 255, 255, 0.06);
}

.sidebar-panel {
  position: absolute;
  left: 48px;
  top: 0;
  width: 260px;
  height: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  padding: 14px 20px;
  color: #64748b;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.nav-section {
  padding: 4px 0;
}

.nav-section + .nav-section {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  margin-top: 4px;
  padding-top: 8px;
}

.nav-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.nav-section-title:hover {
  background: rgba(255, 255, 255, 0.04);
}

.nav-section-title .bi {
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: #94a3b8;
}

.internal-badge {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.collapse-arrow {
  margin-left: auto;
  font-size: 12px;
  color: #64748b;
  transition: transform 0.2s;
}

.collapse-arrow.rotated {
  transform: rotate(-180deg);
}

.nav-children {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0 6px 0;
}

.nav-child-item {
  padding: 6px 12px 6px 50px;
  border-radius: 6px;
  cursor: pointer;
  color: #cbd5e1;
  font-size: 13px;
  transition: all 0.15s;
  margin: 0 8px;
}

.nav-child-item:hover {
  background: rgba(59, 130, 246, 0.12);
  color: white;
}

/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

- [ ] **Step 4: 引入 headerHeight**

需要在组件顶部 `inject` 中补充 headerHeight 注入，以便定位计算：

```vue
<script setup>
import { ref, inject, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = inject("user");
const headerHeight = inject("headerHeight", ref(0));

const isExpanded = ref(false);
const collapsedItems = ref({});
// ... 其余代码保持不变
```

- [ ] **Steps 1-4 全部完成后，确认组件文件内容完整**

---

### Task 2: 在 App.vue 中引入 GlobalSidebar

**Files:**

- Modify: `src/App.vue`

- [ ] **Step 1: 在 App.vue 的 template 中添加 GlobalSidebar**

在 `<HeaderSection>` 标签下方、`<div class="page-content">` 上方插入：

```html
<template>
  <HeaderSection @update:headerHeight="handleHeaderHeight" />
  <GlobalSidebar />
  <div class="page-content" :style="contentStyle">
    <Breadcrumb @update:breadcrumbHeight="handleBreadcrumbHeight" />
    <RouterView />
  </div>
  <HomeFooter v-if="showFooter" @update:footerHeight="handleFooterHeight" />
  <!-- ... update modal ... -->
</template>
```

- [ ] **Step 2: 在 script 中导入 GlobalSidebar**

在 `import HeaderSection` 旁边添加导入：

```javascript
import HeaderSection from "./components/HeaderSection.vue";
import GlobalSidebar from "./components/GlobalSidebar.vue";
import Breadcrumb from "./components/Breadcrumb.vue";
import HomeFooter from "./components/HomeFooter.vue";
```

---

### Task 3: 验证实现

- [ ] **Step 1: 启动开发服务器检查**

```bash
npm run dev
```

- [ ] **Step 2: 验证以下功能点**
  1. 页面左侧显示 48px 深蓝色图标窄条
  2. 鼠标进入窄条 → 侧边栏展开（260px 覆盖式面板）
  3. 鼠标在面板内移动 → 面板保持展开
  4. 鼠标移出面板 → 面板收起
  5. 导航菜单结构正确，4 个模块显示正常
  6. 点击子菜单项 → 跳转到对应路由页面
  7. 模块可折叠展开
  8. 辅助电力交易模块不显示（未登录/无 role 时）
