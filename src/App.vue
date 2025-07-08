<template>
  <HeaderSection />
  <div class="page-content">
      <RouterView />
  </div>
  <HomeFooter />
</template>

<script setup>
import HomeFooter from './components/HomeFooter.vue';
import HeaderSection from './components/HeaderSection.vue';
</script>

<style scoped>
.page-content {
  background-color: #e6e8ea;
  width: 100vw;
  min-height: calc(100vh - 405px);
  overflow-x: hidden;
}
</style>
