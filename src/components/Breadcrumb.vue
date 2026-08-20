<template>
  <nav
    class="breadcrumb-container"
    ref="breadcrumbRef"
    v-if="breadcrumbs.length"
  >
    <div class="breadcrumb-inner">
      <ol class="breadcrumb">
        <li
          v-for="(item, index) in breadcrumbs"
          :key="index"
          class="breadcrumb-item"
        >
          <router-link
            v-if="index < breadcrumbs.length - 1 && item.to"
            :to="ensureAbsolutePath(item.to)"
            class="breadcrumb-link"
          >
            <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon"></i>
            {{ item.title }}
          </router-link>
          <span v-else class="breadcrumb-text">
            <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon"></i>
            {{ item.title }}
          </span>
          <span
            v-if="index < breadcrumbs.length - 1"
            class="breadcrumb-separator"
          >
            <i class="bi bi-chevron-right"></i>
          </span>
        </li>
      </ol>

      <!-- 当前页面标题 -->
      <!-- <div v-if="currentPageTitle" class="page-title">
                {{ currentPageTitle }}
            </div> -->
      <el-button
        v-if="showBackBtn"
        type="primary"
        :icon="Back"
        @click="$router.back()"
        >返回</el-button
      >
    </div>
  </nav>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Back } from "@element-plus/icons-vue";

const route = useRoute();
const breadcrumbs = ref([]);

const emit = defineEmits(["update:breadcrumbHeight"]); // 定义 emits 用于传递高度给父组件
const breadcrumbRef = ref(null);
// 获取并传递 header 高度
const updateBreadcrumbHeight = () => {
  if (breadcrumbRef.value) {
    const height = breadcrumbRef.value.offsetHeight; // 获取元素实际高度（包括 padding，不包括 margin 和 border）
    emit("update:breadcrumbHeight", height); // 发送高度给父组件
  }
};
// 初始化时获取一次高度
onMounted(() => {
  updateBreadcrumbHeight();
  window.addEventListener("resize", updateBreadcrumbHeight); // 监听窗口大小变化，动态更新高度（适配响应式布局）
});

// 路由到面包屑的映射
const routeToBreadcrumb = {
  home: { title: "首页", to: "/home", icon: "bi bi-house" },
  loadpre: {
    title: "负荷预测",
    to: "/loadpre",
    icon: "bi bi-lightning-charge",
  },
  LoadCompare: {
    title: "回测分析",
    icon: "bi bi-graph-up-arrow",
    hasBackBtn: true,
  },
  loadpre_history: {
    title: "已建模型",
    icon: "bi bi-clock-history",
    hasBackBtn: true,
  },
  load_example: {
    title: "负荷预测-案例展示",
    icon: "bi bi-bookmark-check",
    hasBackBtn: true,
  },
  elec: {
    title: "光伏发电预测",
    to: "/elec",
    icon: "bi bi-lightning",
  },
  ElecCompare: {
    title: "回测分析",
    icon: "bi bi-graph-up-arrow",
    hasBackBtn: true,
  },
  elec_example: {
    title: "光伏发电预测-案例展示",
    to: "/elec_example",
    icon: "bi bi-bookmark-check",
    hasBackBtn: true,
  },
  light_example: {
    title: "光储定容-案例展示",
    icon: "bi bi-bookmark-check",
    hasBackBtn: true,
  },
  login: { title: "登录", icon: "bi bi-box-arrow-in-right" },
  modifyuser: { title: "用户设置", icon: "bi bi-person-gear" },
  product_intro: {
    title: "产品介绍",
    to: "/product_intro",
    icon: "bi bi-info-circle",
  },
  about_us: { title: "关于我们", to: "/about_us", icon: "bi bi-people" },
  describe: {
    title: "功能介绍",
    to: "/describe",
    icon: "bi bi-journal-text",
  },
  light: { title: "光储定容", to: "/light", icon: "bi bi-sun" },
  product_EGate10: {
    title: "EGate10",
    to: "/product_EGate10",
    icon: "bi bi-sun",
  },
  health: { title: "资产健康", to: "/health", icon: "bi bi-sun" },
  price_analysis: {
    title: "节点电价查询",
    to: "/price-analysis",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
  product_BMS: {
    title: "BMS",
    to: "/product_BMS",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
  product_BMSPLUS: {
    title: "被动均衡BMU",
    to: "/product_BMSPLUS",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
  product_BMU: {
    title: "BMU",
    to: "/product_BMU",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
  VirtualPowerPlant: {
    title: "虚拟电厂介绍",
    to: "/VirtualPowerPlant",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
  AccessStats: {
    title: "系统管理",
    to: "/admin/access-stats",
    icon: "bi bi-gear",
    hasBackBtn: true,
  },
  Invoices: {
    title: "记录与发票",
    to: "/membership/invoices",
    icon: "bi bi-receipt",
  },
  AdminInvoices: {
    title: "发票管理",
    to: "/admin/invoices",
    icon: "bi bi-receipt",
    hasBackBtn: true,
  },
  MonthlyDemandReport: {
    title: "月度需求申报",
    to: "/monthly-demand-report",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
  DailyDemandReportV2: {
    title: "日前用电侧申报V2",
    to: "/daily-demand-report-v2",
    icon: "bi bi-clock-history",
    hasBackBtn: true,
  },
  MultiDayTrading: {
    title: "多日交易",
    to: "/multiday-trading",
    icon: "bi bi-sun",
    hasBackBtn: true,
  },
};

// 确保路径是绝对路径的辅助函数
function ensureAbsolutePath(path) {
  // 如果路径不是以斜杠开头，添加斜杠
  if (path && !path.startsWith("/")) {
    return "/" + path;
  }
  return path;
}

// 计算当前页面标题
const currentPageTitle = computed(() => {
  if (breadcrumbs.value.length > 0) {
    return breadcrumbs.value[breadcrumbs.value.length - 1].title;
  }
  return null;
});
const curPageName = computed(() => route.name || "");

const showBackBtn = computed(() => {
  const key = curPageName.value;
  if (!key) return false;
  return routeToBreadcrumb[key].hasBackBtn;
});

// 更新面包屑
const updateBreadcrumbs = () => {
  const routeName = route.name;

  // 如果是首页，不显示面包屑
  if (routeName === "home") {
    breadcrumbs.value = [];
    return;
  }

  const crumbs = [];

  // 添加首页（非首页情况下）
  crumbs.push(routeToBreadcrumb["home"]);

  // 如果是回测分析页面，添加负荷预测作为父级
  if (routeName === "LoadCompare") {
    crumbs.push(routeToBreadcrumb["loadpre"]);
  }
  // 如果是光伏发电回测分析页面，添加光伏发电预测作为父级
  if (routeName === "ElecCompare") {
    crumbs.push(routeToBreadcrumb["elec"]);
  }
  // 如果是EGate10产品详情页面，添加光伏发电预测-案例展示作为父级
  if (routeName == "product_EGate10") {
    crumbs.push(routeToBreadcrumb["elec_example"]);
  }

  if (
    routeName == "product_BMS" ||
    routeName == "product_BMSPLUS" ||
    routeName == "product_BMU"
  ) {
    crumbs.push(routeToBreadcrumb["health"]);
  }

  // 添加当前页面
  if (routeName && routeToBreadcrumb[routeName]) {
    const breadcrumbItem = { ...routeToBreadcrumb[routeName] };

    // 如果是回测分析页面，添加记录ID
    if (routeName === "LoadCompare" && route.params.recordId) {
      breadcrumbItem.title = `回测分析 - 记录 ${route.params.recordId}`;
    }
    // 如果是光伏发电预测回测分析页面，添加记录ID
    if (routeName === "ElecCompare" && route.params.recordId) {
      breadcrumbItem.title = `回测分析 - 记录 ${route.params.recordId}`;
    }
    if (routeName == "product_EGate10") {
      breadcrumbItem.title = `EGate10产品详情`;
    }

    crumbs.push(breadcrumbItem);
  }

  breadcrumbs.value = crumbs;
};

// 监听路由变化
watch(() => route, updateBreadcrumbs, { immediate: true, deep: true });
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 12px 20px;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10; /* 确保高于任何背景组件的 z-index */
}

.breadcrumb-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;

  &:last-child {
    .breadcrumb-text {
      color: #2c6fbb;
      font-weight: 600;
    }
  }
}

.breadcrumb-link {
  color: #6c757d;
  text-decoration: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    color: #2c6fbb;
  }
}

.breadcrumb-text {
  color: #495057;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.breadcrumb-icon {
  margin-right: 6px;
  font-size: 14px;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #adb5bd;
  font-size: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  padding: 4px 12px;
  background-color: rgba(44, 111, 187, 0.1);
  border-radius: 6px;
}

// 响应式设计
@media (max-width: 768px) {
  .breadcrumb-container {
    padding: 10px 15px;
  }

  .breadcrumb-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .breadcrumb {
    font-size: 13px;
    flex-wrap: wrap;
  }

  .breadcrumb-separator {
    margin: 0 6px;
  }

  .page-title {
    font-size: 14px;
    align-self: flex-end;
  }
}
</style>
