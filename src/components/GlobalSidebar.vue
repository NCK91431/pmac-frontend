<template>
  <div
    class="global-sidebar"
    @mouseenter="isExpanded = true"
    @mouseleave="isExpanded = false"
  >
    <div class="icon-bar">
      <i class="bi" :class="isExpanded ? 'bi-arrow-left' : 'bi-list'" />
      <div class="icon-group">
        <template v-for="(config, module) in sidebarMenu" :key="module">
          <div
            v-if="canAccessModule(config)"
            class="nav-icon"
            :title="config.title"
          >
            <i :class="'bi ' + config.icon" />
          </div>
        </template>
      </div>
    </div>

    <transition name="slide">
      <div v-show="isExpanded" class="sidebar-panel">
        <div class="panel-header">功能导航</div>
        <div class="panel-body">
          <div
            v-for="(config, module) in sidebarMenu"
            :key="module"
            class="nav-section"
          >
            <template v-if="canAccessModule(config)">
              <div class="nav-section-title" @click="toggleCollapse(module)">
                <i :class="'bi ' + config.icon" />
                <span>{{ config.title }}</span>
                <span v-if="config.permission" class="internal-badge"
                  >仅内部</span
                >
                <i
                  class="bi bi-chevron-down collapse-arrow"
                  :class="{ rotated: collapsedModules[module] }"
                />
              </div>
              <div v-show="!collapsedModules[module]" class="nav-children">
                <div
                  v-for="child in getVisibleChildren(config)"
                  :key="child.title"
                  class="nav-child-item"
                  :class="{
                    active: router.currentRoute.value.path === child.route,
                  }"
                  @click="handleNavigate(child)"
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

<script setup>
import { ref, inject, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const user = inject("user");
const headerHeight = inject("headerHeight", ref(0));

const isExpanded = ref(false);
const collapsedModules = ref({});

const sidebarMenu = computed(() => {
  return router.$sidebarMenuConfig || {};
});

const canAccessModule = (config) => {
  if (!config.permission) {
    return true;
  }
  const userRole = user.value?.role;
  // internal 和 temporary 角色均可访问标记为 internal 的模块
  if (config.permission === "internal") {
    return userRole === "internal" || userRole === "temporary";
  }
  return userRole === config.permission;
};

const getVisibleChildren = (config) => {
  const userRole = user.value?.role;
  if (userRole === "temporary") {
    // temporary 角色只显示有 temporaryAccess 标记的子菜单
    return config.children.filter((child) => child.temporaryAccess);
  }
  return config.children;
};

const initCollapsed = () => {
  const menu = sidebarMenu.value;
  const state = {};
  for (const key of Object.keys(menu)) {
    state[key] = true;
  }
  collapsedModules.value = state;
};

initCollapsed();

watch(
  () => router.currentRoute.value,
  (route) => {
    const path = route.path;
    const menu = sidebarMenu.value;
    for (const [module, config] of Object.entries(menu)) {
      if (!canAccessModule(config)) continue;
      const isActive = config.children.some((child) => child.route === path);
      if (isActive) {
        expandOnly(module);
        return;
      }
    }
    const routeModule = route.meta?.module;
    if (routeModule && menu[routeModule]) {
      expandOnly(routeModule);
    }
  },
  { immediate: true },
);

const expandOnly = (module) => {
  for (const key of Object.keys(collapsedModules.value)) {
    collapsedModules.value[key] = key !== module;
  }
};

const toggleCollapse = (module) => {
  if (collapsedModules.value[module]) {
    expandOnly(module);
  } else {
    collapsedModules.value[module] = true;
  }
};

const handleNavigate = (child) => {
  if (!child.route) return;

  router.push(child.route).then(() => {
    if (child.anchor) {
      setTimeout(() => {
        const element =
          document.querySelector(`.${child.anchor}`) ||
          document.getElementById(child.anchor);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  });
};
</script>

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

.nav-child-item.active {
  background: rgba(59, 130, 246, 0.2);
  color: white;
  font-weight: 500;
}

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
