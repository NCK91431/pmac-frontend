<template>
    <div class="product-card">
        <div class="product-header">
            <h2>{{ product.title }}</h2>
            <!-- <h3>{{ product.subtitle }}</h3> -->
        </div>

        <div class="product-content">
            <div class="product-img-container">
                <img
                    :src="product.imgURL"
                    :alt="product.title"
                    class="product-img"
                />
            </div>
            <p class="product-description">
                {{ product.description }}
            </p>

            <ul class="product-features">
                <li v-for="(feature, index) in product.features" :key="index">
                    <span class="feature-title">{{ feature.title }}</span
                    >：{{ feature.content }}
                </li>
            </ul>

            <div class="application-scenario">
                <strong>应用场景</strong>
                <p>{{ product.scenario }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const { product } = defineProps({ product: Object });
</script>

<style lang="scss" scoped>
.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-width: 320px;
    max-width: 460px;

    &:hover {
        transform: translateY(-10px);
        box-shadow: 0 15px 40px rgba(29, 59, 108, 0.15);
    }

    .product-header {
        background: #1d3b6c;
        padding: 1.2rem 1.5rem;
        color: #fff;

        h2 {
            font-size: 1.4rem;
            font-weight: 700;
            margin-bottom: 0.2rem;
        }

        h3 {
            font-size: 1.1rem;
            font-weight: 500;
            color: #d4e9ff;
        }
    }

    .product-content {
        padding: 1.8rem 1.5rem 1.5rem;
        flex-grow: 1;
        .product-img-container {
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 1.5rem;
            border-radius: 10px;
            overflow: hidden;
            background: #f8fafc;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            .product-img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                transition: transform 0.3s ease;
            }
        }

        .product-description {
            color: #333;
            font-size: 0.95rem;
            line-height: 1.7;
            margin-bottom: 1.2rem;
        }

        .product-features {
            list-style-type: none;
            padding: 0;
            margin-bottom: 1.5rem;
            flex-grow: 1;
            li {
                position: relative;
                padding-left: 1.5rem;
                margin-bottom: 0.9rem;
                font-size: 0.92rem;
                line-height: 1.5;
                color: #555;
                border-bottom: 1px dashed #e2eaf3;
                padding-bottom: 0.7rem;
                &:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                    margin-bottom: 0;
                }
                &::before {
                    content: "•";
                    position: absolute;
                    left: 0;
                    color: #2a5ba9;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
            }
        }

        .application-scenario {
            background: #f0f9ff;
            border-left: 4px solid #2a5ba9;
            padding: 0.8rem 1rem;
            border-radius: 6px;
            margin-top: 1rem;

            strong {
                color: #1d3b6c;
                font-weight: 700;
            }

            p {
                color: #444;
                font-size: 0.9rem;
                margin-top: 0.3rem;
                line-height: 1.5;
            }
        }
    }
}
</style>
