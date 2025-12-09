<template>
    <div class="container">
        <!-- 产品广告 - BMS -->
        <ProductAdvertisement
            :product="productData.BMS"
            :button-text="'探索产品详情'"
            @button-click="goProductInfoPage('product_BMS')"
        />
        <!-- 产品广告 - BMU -->
        <ProductAdvertisement
            :product="productData.BMU"
            :button-text="'探索产品详情'"
            @button-click="goProductInfoPage('product_BMU')"
        />
    </div>
</template>

<script setup>
import ProductAdvertisement from "../Products/ProductAdvertisement.vue";
import productData from "../Products/productData";

import { useRouter } from "vue-router";
const router = useRouter();
function goProductInfoPage(name) {
    router.push({ name });
}
</script>

<style lang="scss" scoped>
.container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}
</style>
