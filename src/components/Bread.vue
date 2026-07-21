<template>
  <el-breadcrumb :separator-icon="ArrowRight" v-if="breadcrumbs.length" class="header-breadcrumb">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :to="index < breadcrumbs.length - 1 && item.to ? ensureAbsolutePath(item.to) : undefined"
    >
      <i v-if="item.icon" :class="item.icon" class="bc-icon"></i>
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const breadcrumbs = computed(() => {
  const routeName = route.name;
  if (!routeName || routeName === "home") return [];

  const crumbs = [];
  const visited = new Set();
  let currentName = routeName;

  while (currentName && !visited.has(currentName)) {
    visited.add(currentName);
    const matched = router.getRoutes().find((r) => r.name === currentName);
    if (!matched?.meta?.breadcrumb) break;

    const bc = matched.meta.breadcrumb;
    const title =
      typeof bc.titleFormatter === "function" ? bc.titleFormatter(route) : bc.title;

    crumbs.unshift({
      title,
      to: matched.path,
      icon: bc.icon,
    });

    currentName = bc.parentRouteName;
  }

  // 从月度收益页跳转过来时，动态添加上级面包屑
  if (route.query.fromMonthly) {
    const parentRoute = router.getRoutes().find((r) => r.name === "MonthlyProfit");
    if (parentRoute?.meta?.breadcrumb) {
      const bc = parentRoute.meta.breadcrumb;
      crumbs.unshift({
        title: typeof bc.titleFormatter === "function" ? bc.titleFormatter(route) : bc.title,
        to: parentRoute.path,
        icon: bc.icon,
      });
    }
  }

  if (crumbs.length && crumbs[0].title !== "首页") {
    const homeRoute = router.getRoutes().find((r) => r.name === "home");
    if (homeRoute?.meta?.breadcrumb) {
      crumbs.unshift({
        title: homeRoute.meta.breadcrumb.title,
        to: homeRoute.path,
        icon: homeRoute.meta.breadcrumb.icon,
      });
    }
  }

  return crumbs;
});

function ensureAbsolutePath(path) {
  if (path && !path.startsWith("/")) {
    return "/" + path;
  }
  return path;
}
</script>

<style lang="scss" scoped>
.header-breadcrumb {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 16px;
  overflow: hidden;

  .bc-icon {
    margin-right: 4px;
    font-size: 0.75rem;
  }

  :deep(.el-breadcrumb__item) {
    display: flex;
    align-items: center;

    .el-breadcrumb__inner {
      display: inline-flex;
      align-items: center;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);

      &.is-link {
        color: rgba(255, 255, 255, 0.5);
        font-weight: 400;

        &:hover {
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }

    &:last-child {
      .el-breadcrumb__inner {
        color: #60a5fa;
        font-weight: 600;
        text-shadow: 0 0 20px rgba(96, 165, 250, 0.15);
      }
    }

    .el-breadcrumb__separator {
      color: rgba(255, 255, 255, 0.15);
      font-size: 0.75rem;
      margin: 0 4px;
      font-weight: 300;
    }
  }
}

@media (max-width: 768px) {
  .header-breadcrumb {
    display: none;
  }
}
</style>
