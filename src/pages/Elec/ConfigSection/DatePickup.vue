<template>
    <div class="date-pickup card border-0 shadow-sm p-3 h-100">
        <div class="date-pickup-header mb-3">
            <h5 class="mb-1">
                <i class="bi bi-calendar-week me-2"></i>继续预测
            </h5>
            <p class="text-muted small mb-0">选择未来7天中的一天进行预测</p>
        </div>

        <div class="date-grid">
            <div
                v-for="(dateItem, index) in dateOptions"
                :key="index"
                class="date-item"
                :class="{
                    active: selectedDate === dateItem.date,
                }"
                @click="selectDate(dateItem)"
            >
                <div class="date-icon">
                    <i class="bi bi-calendar3"></i>
                </div>
                <div class="date-info">
                    <div class="date-main">
                        <span class="date-text">{{ dateItem.date }}</span>
                        <span class="date-badge" v-if="dateItem.badge">{{
                            dateItem.badge
                        }}</span>
                    </div>
                    <div class="date-weekday">{{ dateItem.weekday }}</div>
                </div>
                <div class="date-check" v-if="selectedDate === dateItem.date">
                    <i class="bi bi-check-lg"></i>
                </div>
            </div>
        </div>

        <div
            class="selected-info mt-3 p-2 bg-light rounded text-center"
            v-if="selectedDate"
        >
            <small class="text-primary">
                <i class="bi bi-calendar-check me-1"></i>
                已选择: {{ formatSelectedDate(selectedDate) }}
            </small>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { format, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useElecStore } from "@/store/elec";

const forecastStore = useElecStore();

// 从 store 获取选中的日期
const selectedDate = computed({
    get: () => forecastStore.userPickDate,
    set: (value) => forecastStore.setUserPickDate(value),
});

// 生成7天日期选项
const dateOptions = computed(() => {
    const today = new Date();
    const dates = [];

    for (let i = 0; i < 7; i++) {
        const date = addDays(today, i);
        const dateString = format(date, "yyyy-MM-dd");
        const weekday = format(date, "EEEE", { locale: zhCN });

        let badge = "";

        if (i === 0) {
            badge = "今天";
        } else if (i === 1) {
            badge = "明天";
        } else if (i === 2) {
            badge = "后天";
        }

        dates.push({
            date: dateString,
            weekday,
            badge,
        });
    }

    return dates;
});

const selectDate = (dateItem) => {
    selectedDate.value = dateItem.date;
};

const formatSelectedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "yyyy年MM月dd日 EEEE", { locale: zhCN });
};

// 组件挂载时，如果没有选中日期，默认选择今天
onMounted(() => {
    if (!selectedDate.value && dateOptions.value.length > 0) {
        selectDate(dateOptions.value[0]);
    }
});

// 监听日期选项变化，确保默认值设置
watch(dateOptions, (newOptions) => {
    if (!selectedDate.value && newOptions.length > 0) {
        selectDate(newOptions[0]);
    }
});
</script>

<style lang="scss" scoped>
.date-pickup {
    background: white;
    border-radius: 8px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
}

.date-pickup-header {
    h5 {
        font-weight: 600;
        font-size: 1.1rem;
        color: #2c6fbb;
    }
}

.date-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    flex: 1;
}

.date-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: center;

    &:hover {
        border-color: #2c6fbb;
        background-color: #f8f9fa;
    }

    &.active {
        border-color: #2c6fbb;
        background-color: #e3f2fd;

        .date-check {
            opacity: 1;
        }
    }
}

.date-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;

    i {
        font-size: 1rem;
        color: #6c757d;
    }
}

.date-info {
    width: 100%;

    .date-main {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
        flex-wrap: wrap;
    }

    .date-text {
        font-weight: 500;
        color: #2c3e50;
        font-size: 0.85rem;
        line-height: 1.2;
    }

    .date-badge {
        background: #2c6fbb;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7rem;
        margin-left: 4px;
        font-weight: 500;
    }

    .date-weekday {
        font-size: 0.75rem;
        color: #6c757d;
        line-height: 1.2;
    }
}

.date-check {
    position: absolute;
    top: 6px;
    right: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;

    i {
        color: #2c6fbb;
        font-size: 0.9rem;
    }
}

.selected-info {
    border-left: 3px solid #2c6fbb;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

// 响应式调整
@media (max-width: 768px) {
    .date-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .date-item {
        padding: 10px 6px;
    }

    .date-icon {
        width: 28px;
        height: 28px;
        margin-bottom: 6px;

        i {
            font-size: 0.9rem;
        }
    }

    .date-text {
        font-size: 0.8rem;
    }

    .date-weekday {
        font-size: 0.7rem;
    }
}

@media (max-width: 480px) {
    .date-grid {
        grid-template-columns: 1fr;
    }
}
</style>
