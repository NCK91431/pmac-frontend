<template>
    <div class="feature-item" :ref="setItemRef">
        <div class="feature-icon">
            <span class="icon">✓</span>
        </div>
        <div class="feature-content">
            <h3 class="feature-title">
                {{ feature.title }}
            </h3>
            <p class="feature-description">
                {{ feature.description }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    feature: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['item-mounted'])

const itemRef = ref(null)

const setItemRef = (el) => {
    itemRef.value = el
    emit('item-mounted', el, props.index)
}
</script>

<style scoped>
.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
}

.feature-item:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon {
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
}

.feature-content {
    flex: 1;
}

.feature-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 8px;
}

.feature-description {
    color: #718096;
    line-height: 1.6;
    font-size: 0.95rem;
}
</style>