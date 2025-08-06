<template>
    <div class="background-container">
        <div class="product-container">
            <div class="header">
                <div class="btn">
                    <button class="back-button" @click="backHomePage">
                        返回首页
                    </button>
                </div>

                <h1>{{ product.title }}</h1>
            </div>

            <!-- 概述部分 -->
            <div class="section">
                <h2>概述</h2>
                <div class="overview-content">
                    <div class="product-image">
                        <el-image
                            style="width: 150px; height: auto"
                            :src="product.imgURL"
                            :fit="fit"
                        />
                    </div>
                    <div class="product-description">
                        <p v-for="(desc, i) in product.description" :key="i">
                            {{ desc }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 主要功能部分 -->
            <div class="section">
                <h2>主要功能</h2>
                <ul class="features-list">
                    <li v-for="(feature, i) in product.features" :key="i">
                        {{ feature }}
                    </li>
                </ul>
            </div>

            <!-- 性能指标部分 -->
            <div class="section">
                <h2>性能指标</h2>

                <GatewayTable v-if="product_type == 'Gateway'" />
                <EMCTable v-if="product_type == 'EMC200'" />
                <MeterTable v-if="product_type == 'Meter'" />
            </div>

            <!-- 产品尺寸及安装示意图部分 -->
            <div class="section" v-if="product_type == 'Gateway'">
                <h2>产品尺寸及安装示意图</h2>
                <div class="images-container">
                    <div class="unit-label">单位：mm</div>
                    <div class="installation-images">
                        <div
                            class="image-card"
                            v-for="(imgURL, i) in product.srcList"
                            :key="i"
                        >
                            <el-image
                                style="width: 150px; height: auto"
                                :src="imgURL"
                                :fit="fit"
                            />
                        </div>
                    </div>
                    <div class="install-note">安装方式：标准DN35导轨安装</div>
                </div>
            </div>
            <div class="section" v-if="product_type == 'Meter'">
                <h2>产品尺寸及安装示意图</h2>
                <div class="images-container">
                    <div class="unit-label">单位：mm</div>
                    <div class="installation-images">
                        <div
                            class="image-card"
                            v-for="(imgURL, i) in product.srcList"
                            :key="i"
                        >
                            <el-image
                                style="width: 150px; height: auto"
                                :src="imgURL"
                                :fit="fit"
                            />
                        </div>
                    </div>
                    <div class="install-note">安装方式：标准DN35导轨安装</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import GatewayTable from "./GatewayTable.vue";
import EMCTable from "./EMCTable.vue";
import MeterTable from "./MeterTable.vue";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute(),
    router = useRouter();

const gateway = {
    title: "PMAC3101工业专用无线通信终端",
    imgURL: "https://pmac.leyi.host/downloads/product_01.png",
    description: [
        "PMAC3101是一款应用于工业级嵌入式专用无线通信终端，可支持移动、电信、联通等运营商的4G物联网卡。可以实现RS485和4G或TCP接口。",
        "PMAC3101具备注册包、心跳包，同时具备Modbus-RTU/TCP协议对接云服务等功能，在兼容、替代2G产品的同时，实现高速传输、低延时、支持新技术等特点。",
    ],
    features: [
        "支持服务端协议Modbus-RTU/TCP，设备端协议Modbus-RTU协议，如选择透传模式可支持更多传输协议",
        "支持LTE FDD/LTE TDD/WCDMA，包含有联通4G，移动4G以及电信4G",
        "支持一键扫描功能，可通过按键触发进行自动扫描，实现一键测试功能，用于检测终端设备的RS485口配接的有效仪表数量",
        "支持信息远程查看、配置与重启",
        "MICROSIM卡 （12mm × 15mm），502/SMA，电源AC85-265V或DC80-300V",
        "◎1路RS485接口，光电隔离，通讯距离1.2km(RVSP2x1.5mm)",
    ],
    srcList: [
        "https://pmac.leyi.host/downloads/gateway01.png",
        "https://pmac.leyi.host/downloads/gateway02.png",
        "https://pmac.leyi.host/downloads/gateway03.png",
    ],
};
const EMC200 = {
    title: "PMAC124 4G红外抄表仪",
    imgURL: "https://pmac.leyi.host/downloads/product_03.png",
    description: [
        "PMAC124 4G红外抄表仪采用高性能ARM CPU作为微处理器，配合内置红外发射LED和一体化红外接收器，可实现稳定可靠的非接触式数据传输，广泛应用于电表、水表、气表等支持红外传输功能的仪表读取场景。",
        "设备支持4G通讯接口（直接上传平台，免数据采集网关），工作电压9-12V DC，即插即用免接线风险，无需停电即可快速完成仪表接入，是能耗监控系统末端数据采集的理想终端。",
    ],
    features: [
        "非接触式红外读表，区别于传统RS485接线方式，降低现场实施成本与接线风险",
        "4G版本内置SIM卡（免插卡），包8年流量，数据直接上传平台，免去中间网关设备",
        "红外通信距离0-3米（室内环境光），收发角度90度（左右上下各45°），保障稳定通讯",
        "支持ModbusRTU、MQTT等多种协议，适配各类物联系统与云平台，兼容性强",
        "9-12V DC直流供电，即插即用；多种安装方式（贴装电表红外窗口、电箱门、计量柜玻璃），适应不同场景",
    ],
    srcList: [
        "https://pmac.leyi.host/downloads/gateway01.png",
        "https://pmac.leyi.host/downloads/gateway02.png",
        "https://pmac.leyi.host/downloads/gateway03.png",
    ],
};
const meter = {
    title: "PMGC-2000微网控制器",
    imgURL: "https://pmac.leyi.host/downloads/product_02.png",
    description: [
        "PMGC-2000微网控制器是珠海派诺科技有限公司研发的新一代微网控制器，采用先进控制算法与工业级通信模块，集成微网协调控制、数据采集转发、策略管理等功能，适配多美型微网场景，支持多协议交互与云端协同，维持微网功率、频率稳走，提升清洁能源利用效率，具备宽温域稳定运行能力。",
        "通过本地策略执行与云端平台联动，实现 微网源-网-荷-储 一体化协调，满足工商业、企业园区等微网管理中功率调控、能效优化、智能运维等需求。",
    ],
    features: [
        "支持并离网智能切换，动态调控有功/无功功率，实现分布式电源智能调频调压，光储荷协同（含防逆流、削峰填谷等策眙）",
        "配置 16 路 RS485接口，兼容 Modbus - RTU/TCP、DLT645 -2007 等协议，并行高效采集微网多设备数据",
        "支持 ModbusTCP、IEC104 协议转发数据，对接 EMS3.0 等云平台上传信息，支持多主机同时连接",
        "涵盖计划充放电、动态扩容、需求侧响应策路，可助力虚拟电厂搭建，适配不同微网运行场景",
        "留存 12个月历史数据与事件记录，云端同步日志，便于微网运维、故障追溯及能效分析",
        "适配多类微网设备通信协议，保障不同厂家光伏、储能、负荷设备接入协同",
        "适应复杂电网环境，具备稳定运行能力，保障微网控制指令可靠执行",
    ],
    srcList: [
        "https://pmac.leyi.host/downloads/meter01.png",
        "https://pmac.leyi.host/downloads/meter02.png",
        "https://pmac.leyi.host/downloads/meter03.png",
    ],
};
const product = ref({});
const product_type = ref(null);
onMounted(() => {
    product_type.value = route.query.product_type;
    switch (route.query.product_type) {
        case "Gateway":
            product.value = gateway;
            break;
        case "EMC200":
            product.value = EMC200;
            break;
        case "Meter":
            product.value = meter;
            break;
        default:
            break;
    }
});

function backHomePage() {
    router.push({ name: "home" });
}
</script>

<style lang="scss" scoped>
.background-container {
    width: 100%;
    background-color: #fff;
}
.product-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    line-height: 1.6;
    .header {
        display: flex;
        .btn {
            justify-self: flex-start;
            margin-right: auto;
            border: none;
        }
        .back-button {
            padding: 0.6rem 1.2rem;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

            &:hover {
                background-color: #2980b9;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            // 可根据需要添加返回箭头
            &::before {
                content: "← ";
                font-size: 1.1rem;
            }
        }
        h1 {
            justify-self: center;
            margin-right: auto;
            text-align: center;
            color: #2c3e50;
            margin-bottom: 2.5rem;
            font-size: 2.2rem;
            position: relative;
            padding-bottom: 1rem;

            &::after {
                content: "";
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 120px;
                height: 3px;
                background-color: #3498db;
            }
        }
    }

    .section {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        margin-bottom: 2.5rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #2980b9;
            margin-top: 0;
            margin-bottom: 1.5rem;
            font-size: 1.6rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #f1f1f1;
        }
    }

    // 概述部分样式
    .overview-content {
        display: flex;
        align-items: center;
        gap: 2rem;

        @media (max-width: 768px) {
            flex-direction: column;
        }

        .product-description {
            flex: 1;
            padding: 1rem;
            font-size: 1.05rem;

            p {
                margin: 0 0 1rem 0;
                text-align: justify;
            }
        }
    }

    // 主要功能部分样式
    .features-list {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
            position: relative;
            padding: 0.8rem 0 0.8rem 2.5rem;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.3s ease;

            &:last-child {
                border-bottom: none;
            }

            &::before {
                content: "✓";
                position: absolute;
                left: 0.5rem;
                top: 50%;
                transform: translateY(-50%);
                width: 1.2rem;
                height: 1.2rem;
                border-radius: 50%;
                background-color: #3498db;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
            }

            &:hover {
                background-color: #f8f9fa;
                padding-left: 2.7rem;
            }
        }
    }

    // 产品尺寸及安装示意图部分样式
    .images-container {
        padding: 1rem 0;

        .unit-label {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            text-align: right;
        }

        .installation-images {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            justify-content: center;

            @media (max-width: 768px) {
                flex-direction: column;
                align-items: center;
            }

            .image-card {
                display: flex;
                justify-content: center;
                flex: 1;
                min-width: 250px;
                max-width: 350px;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s ease;

                &:hover {
                    transform: translateY(-8px);
                }

                img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    display: block;
                }
            }
        }

        .install-note {
            margin-top: 1.5rem;
            text-align: center;
            color: #555;
            font-weight: 500;
            padding: 0.8rem;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
    }
}
</style>
