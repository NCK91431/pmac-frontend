<template>
    <div class="advantage-card" :ref="setCardRef">
        <div class="card-icon">
            <div class="icon-bg"></div>
            <span class="icon-text">{{ advantage.icon }}</span>
        </div>
        <h3 class="card-title">{{ advantage.title }}</h3>
        <p class="card-description">
            {{ advantage.description }}
        </p>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    advantage: {
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
</script>

<style scoped>
.advantage-card {
    background: #fff;
    border-radius: 16px;
    padding: 30px 25px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.advantage-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.advantage-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.advantage-card:hover::before {
    opacity: 1;
}

.card-icon {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
}

.icon-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    opacity: 0.1;
}

.icon-text {
    position: relative;
    font-size: 2rem;
    line-height: 80px;
}

.card-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 15px;
    line-height: 1.3;
}

.card-description {
    color: #718096;
    line-height: 1.6;
    font-size: 0.95rem;
}
</style>