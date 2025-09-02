<template>
    <div class="card-body">
        <div class="weather-grid">
            <div class="weather-item">
                <div class="weather-icon">
                    <i class="bi bi-thermometer-low"></i>
                </div>
                <div class="weather-details">
                    <div class="weather-label">温度范围</div>
                    <div class="weather-value">
                        {{ weatherInfo.temp_min }}°C -
                        {{ weatherInfo.temp_max }}°C
                    </div>
                </div>
            </div>
            <div class="weather-item">
                <div class="weather-icon">
                    <i class="bi bi-cloud"></i>
                </div>
                <div class="weather-details">
                    <div class="weather-label">天气状况</div>
                    <div class="weather-value">
                        {{ weatherInfo.weather_summary }}
                    </div>
                </div>
            </div>
            <div class="weather-item">
                <div class="weather-icon">
                    <i class="bi bi-cloud-fill"></i>
                </div>
                <div class="weather-details">
                    <div class="weather-label">云量情况</div>
                    <div class="weather-value">
                        {{ weatherInfo.cloud_summary }}
                    </div>
                </div>
            </div>
            <div class="weather-item">
                <div class="weather-icon">
                    <i class="bi bi-wind"></i>
                </div>
                <div class="weather-details">
                    <div class="weather-label">风力风向</div>
                    <div class="weather-value">
                        {{ weatherInfo.wind_summary }}
                        {{ weatherInfo.wind_direction }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    weatherInfo: {
        type: Object,
        required: true,
        default: () => ({
            temp_min: 0,
            temp_max: 0,
            weather_summary: "",
            cloud_summary: "",
            wind_summary: "",
            wind_direction: "",
        }),
    },
});
</script>

<style lang="scss" scoped>
.card-header {
    background: linear-gradient(135deg, #2c6fbb 0%, #1a4e8e 100%);
    color: white;
    border: none;
    padding: 16px 20px;

    h5 {
        font-weight: 600;

        i {
            color: rgba(255, 255, 255, 0.9);
        }
    }
}

.card-body {
    padding: 20px;
    background-color: #fafcff;
}

.weather-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
}

.weather-item {
    display: flex;
    align-items: center;
    padding: 18px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border-left: 4px solid #2c6fbb;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(44, 111, 187, 0.15);
    }

    .weather-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;

        i {
            font-size: 1.5rem;
            color: #2c6fbb;
        }
    }

    .weather-details {
        .weather-label {
            font-size: 0.85rem;
            color: #6c757d;
            margin-bottom: 4px;
            font-weight: 500;
        }

        .weather-value {
            font-weight: 600;
            color: #2c3e50;
            font-size: 1.1rem;
        }
    }
}

/* 为不同天气项目添加不同的边框颜色 */
.weather-item:nth-child(2) {
    border-left-color: #28a745;

    .weather-icon {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);

        i {
            color: #28a745;
        }
    }
}

.weather-item:nth-child(3) {
    border-left-color: #6f42c1;

    .weather-icon {
        background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);

        i {
            color: #6f42c1;
        }
    }
}

.weather-item:nth-child(4) {
    border-left-color: #fd7e14;

    .weather-icon {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);

        i {
            color: #fd7e14;
        }
    }
}

@media (max-width: 768px) {
    .weather-grid {
        grid-template-columns: 1fr;
    }

    .weather-item {
        padding: 14px;
    }
}
</style>
