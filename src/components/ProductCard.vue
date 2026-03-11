<template>
    <div class="product-card" :ref="setCardRef">
        <div class="product-image">
            <img :src="product.image" :alt="product.name" loading="lazy" @error="handleImageError" />
            <div class="product-badge">
                {{ product.type }}
            </div>
        </div>
        <div class="product-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-model">{{ product.model }}</div>
            <div class="product-shortname">{{ product.shortname }}</div>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-features">
                <div
                    class="feature-tag"
                    v-for="(feature, featureIndex) in product.features"
                    :key="featureIndex"
                >
                    {{ feature }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    product: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['card-mounted'])

const cardRef = ref(null)

const setCardRef = (el) => {
    cardRef.value = el
    emit('card-mounted', el, props.index)
}

const handleImageError = (event) => {
    const img = event.target
    img.src = '/images/placeholder-product.png'
    img.alt = '图片加载失败'
    console.warn('图片加载失败:', img.dataset.src || img.src)
}
</script>

<style scoped>
.product-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
    transform: scale(1.05);
}

.product-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.product-content {
    padding: 20px;
}

.product-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 8px;
}

.product-model {
    font-size: 0.9rem;
    color: #718096;
    margin-bottom: 4px;
}

.product-shortname {
    font-size: 0.85rem;
    color: #a0aec0;
    margin-bottom: 12px;
}

.product-description {
    color: #4a5568;
    line-height: 1.5;
    margin-bottom: 16px;
}

.product-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.feature-tag {
    background: #f7fafc;
    color: #4a5568;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    border: 1px solid #e2e8f0;
}
</style>