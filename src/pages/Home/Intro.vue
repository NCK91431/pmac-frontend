<template>
    <section class="intro-section">
        <div class="section-title">
            <h2>{{ $t("intro.title") }}</h2>
            <p>{{ $t("intro.subtitle1") }}</p>
            <p>{{ $t("intro.subtitle2") }}</p>
        </div>

        <div class="swiper-container-wrapper">
            <swiper
                :direction="'vertical'"
                :modules="modules"
                :mousewheel="true"
                :speed="800"
                :slidesPerView="1"
                :spaceBetween="0"
                class="intro-swiper"
                @slideChange="onSlideChange"
            >
                <swiper-slide v-for="(feature, index) in features" :key="index">
                    <div
                        class="intro-slide"
                        @click="goExamplePage(feature.pathName)"
                    >
                        <div class="image-container">
                            <img
                                :src="feature.image"
                                :alt="feature.title + $t('intro.resultDisplay')"
                                class="feature-image"
                            />
                        </div>
                        <div class="content-container">
                            <div class="feature-tag">
                                {{ $t(feature.tagKey) }}
                            </div>
                            <h3>{{ $t(feature.titleKey) }}</h3>
                            <p class="feature-desc">
                                {{ $t(feature.descriptionKey) }}
                            </p>
                            <ul class="feature-list">
                                <li
                                    v-for="(
                                        itemKey, itemIndex
                                    ) in feature.itemKeys"
                                    :key="itemIndex"
                                    v-html="$t(itemKey)"
                                ></li>
                            </ul>
                        </div>
                    </div>
                </swiper-slide>
            </swiper>

            <div class="swiper-pagination-vertical"></div>
        </div>
    </section>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Mousewheel, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const router = useRouter();

// 功能数据
// 修改 features 数据，使用翻译键
const features = ref([
    {
        tagKey: "intro.features.loadForecast.tag",
        titleKey: "intro.features.loadForecast.title",
        pathName: "load_example",
        descriptionKey: "intro.features.loadForecast.description",
        image: "https://pmac.leyi.host/downloads/features/load.jpg",
        itemKeys: [
            "intro.features.loadForecast.items[0]",
            "intro.features.loadForecast.items[1]",
            "intro.features.loadForecast.items[2]",
            "intro.features.loadForecast.items[3]",
        ],
    },
    {
        tagKey: "intro.features.pvForecast.tag",
        pathName: "elec_example",
        titleKey: "intro.features.pvForecast.title",
        descriptionKey: "intro.features.pvForecast.description",
        image: "https://pmac.leyi.host/downloads/features/pv.jpg",
        itemKeys: [
            "intro.features.pvForecast.items[0]",
            "intro.features.pvForecast.items[1]",
            "intro.features.pvForecast.items[2]",
            "intro.features.pvForecast.items[3]",
        ],
    },
    {
        tagKey: "intro.features.pvStorage.tag",
        titleKey: "intro.features.pvStorage.title",
        pathName: "light_example",
        descriptionKey: "intro.features.pvStorage.description",
        image: "https://pmac.leyi.host/downloads/features/storage.jpg",
        itemKeys: [
            "intro.features.pvStorage.items[0]",
            "intro.features.pvStorage.items[1]",
            "intro.features.pvStorage.items[2]",
            "intro.features.pvStorage.items[3]",
        ],
    },
]);

const modules = [Mousewheel, Pagination];
const activeIndex = ref(0);

const onSlideChange = (swiper) => {
    activeIndex.value = swiper.activeIndex;
};

onMounted(() => {
    // 添加滚动提示动画
    const handleScroll = () => {
        const hint = document.querySelector(".scroll-hint");
        if (hint) {
            hint.style.opacity = "0";
            setTimeout(() => hint.remove(), 500);
            window.removeEventListener("scroll", handleScroll);
        }
    };
    window.addEventListener("scroll", handleScroll);
});

function goExamplePage(pathName) {
    router.push({ name: pathName });
}
</script>

<style lang="scss" scoped>
.intro-section {
    position: relative;
    padding: 80px 0;
    background: linear-gradient(135deg, #f8faff 0%, #e8eeff 100%);
    overflow: hidden;
    width: 100vw;
    margin-left: calc(-50vw + 50%);

    .section-title {
        text-align: center;
        margin-bottom: 60px;

        h2 {
            color: #1d3b6c;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 15px;
        }

        p {
            color: #5e6d82;
            font-size: 1.3rem;
            max-width: 600px;
            margin: 0 auto;
        }
    }
}

.swiper-container-wrapper {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
}

.intro-swiper {
    height: 700px;
    width: 100%;
    background: linear-gradient(to bottom, #ffffff, #f7f9ff);
    border-radius: 20px;
}

.intro-slide {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 60px;

    .image-container {
        flex: 1.2;
        padding: 30px;
        display: flex;
        justify-content: center;
        align-items: center;

        .feature-image {
            width: 100%;
            max-width: 600px;
            height: auto;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
            transition: all 0.5s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);

            &:hover {
                transform: scale(1.03) translateY(-5px);
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
            }
        }
    }

    .content-container {
        flex: 0.8;
        padding: 30px 0;

        .feature-tag {
            display: inline-block;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(37, 117, 252, 0.3);
        }

        h3 {
            font-size: 2.5rem;
            color: #1d3b6c;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .feature-desc {
            font-size: 1.3rem;
            color: #5e6d82;
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .feature-list {
            list-style: none;
            padding: 0;
            margin-bottom: 30px;

            li {
                padding: 12px 0;
                padding-left: 40px;
                position: relative;
                color: #4a5568;
                font-size: 1.2rem;
                line-height: 1.6;

                &:before {
                    content: "→";
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #2575fc;
                    font-size: 1.5rem;
                    font-weight: bold;
                }

                :deep(.highlight) {
                    color: #2575fc;
                    font-weight: 700;
                    background: linear-gradient(
                        135deg,
                        rgba(106, 17, 203, 0.1) 0%,
                        rgba(37, 117, 252, 0.1) 100%
                    );
                    padding: 0 4px;
                    border-radius: 4px;
                }
                :deep(.bold) {
                    font-weight: 700;
                }
            }
        }
    }
}

// 垂直分页器样式
:deep(.swiper-pagination-vertical) {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 10;

    .swiper-pagination-bullet {
        width: 14px;
        height: 14px;
        background: rgba(37, 117, 252, 0.3);
        opacity: 1;
        transition: all 0.3s ease;

        &-active {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            transform: scale(1.4);
            box-shadow: 0 0 10px rgba(37, 117, 252, 0.5);
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .intro-slide {
        padding: 0 40px;

        .image-container {
            flex: 1;
            padding: 20px;

            .feature-image {
                max-width: 500px;
            }
        }

        .content-container {
            flex: 1;
            padding: 20px 30px;

            h3 {
                font-size: 2.2rem;
            }

            .feature-desc {
                font-size: 1.2rem;
            }

            .feature-list li {
                font-size: 1.1rem;
            }
        }
    }
}

@media (max-width: 992px) {
    .intro-swiper {
        height: auto;
    }

    .swiper-container-wrapper {
        max-width: 90%;
    }

    .intro-slide {
        flex-direction: column;
        padding: 40px 20px;

        .image-container {
            padding: 20px;

            .feature-image {
                max-width: 90%;
            }
        }

        .content-container {
            padding: 30px 20px;
            text-align: center;

            h3 {
                font-size: 2rem;
            }

            .feature-desc {
                font-size: 1.1rem;
            }

            .feature-list {
                text-align: left;

                li {
                    font-size: 1.1rem;
                    padding-left: 35px;
                }
            }
        }
    }

    :deep(.swiper-pagination-vertical) {
        position: static;
        flex-direction: row;
        justify-content: center;
        margin-top: 30px;
        transform: none;
    }
}

@media (max-width: 576px) {
    .intro-section {
        padding: 40px 0;

        .section-title h2 {
            font-size: 2rem;
        }

        .section-title p {
            font-size: 1.1rem;
        }
    }

    .intro-slide {
        padding: 30px 15px;

        .content-container {
            padding: 20px 10px;

            h3 {
                font-size: 1.8rem;
            }

            .feature-list li {
                font-size: 1rem;
                padding-left: 30px;

                &:before {
                    font-size: 1.2rem;
                }
            }
        }
    }
}

// 动画效果
.intro-slide {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease;
}

.swiper-slide-active {
    .intro-slide {
        opacity: 1;
        transform: translateY(0);
    }

    .image-container .feature-image {
        animation: float 3s ease-in-out infinite;
    }

    .content-container {
        h3 {
            animation: fadeInUp 0.8s ease forwards;
        }

        .feature-desc {
            animation: fadeInUp 0.8s ease 0.2s forwards;
        }

        .feature-list li {
            opacity: 0;
            animation: fadeInUp 0.5s ease forwards;

            @for $i from 1 through 6 {
                &:nth-child(#{$i}) {
                    animation-delay: 0.3s + ($i * 0.1s);
                }
            }
        }
    }
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
