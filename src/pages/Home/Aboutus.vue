<template>
    <!-- 页面标题 -->
    <section class="page-header">
        <div class="container">
            <h1>珠海派诺科技股份有限公司</h1>
            <p>智慧用电，绿色用能 - 为全球能源绿色转型提供数字化解决方案</p>
        </div>
    </section>

    <div class="container">
        <!-- 企业简介部分 -->
        <section class="content-card">
            <h2 class="section-title">
                <i class="fas fa-building"></i>企业简介
            </h2>

            <p class="company-intro">
                珠海派诺科技股份有限公司（股票代码：831175）总部位于风景优美、高校云集的珠海国家高新区科技创新海岸，拥有四座现代化的科技产业园。
            </p>

            <p class="company-intro">
                派诺科技始终坚持自主研发，以“智慧用电、绿色用能”为使命，为大型建筑、数据中心、交通枢纽、工业园区等用户提供能源物联网产品及能源数字化解决方案。公司主要产品涵盖了“云管边端”的整体能源数字化解决方案，包括测控保护、电气安全、充电桩、储能、基于场景及行业的系统平台及应用，具备全栈自研能力。
            </p>

            <p class="company-intro">
                目前，派诺科技拥有珠海和深圳两大研发中心，并已在武汉筹建研发中心。同时建立了以北京、上海、广州、武汉、西安为区域中心的覆盖华北、华东、华南、华中、华西等地区的营销、工程和售后服务网络体系，在长沙、南京、杭州、济南、成都、天津、乌鲁木齐等全国主要大中型城市设立办事处，以便更快的响应和服务客户。业务遍及全国以及八十多个境外市场。
            </p>

            <p class="company-intro">
                近年来，派诺科技进一步加大了在数字化技术和新型电力系统领域的投入，为客户在绿色经济新时期的转型升级提供方案咨询、系统集成、运维服务等一站式智慧能源及双碳解决方案，助力客户高效可持续发展，为全社会实现双碳目标奉献“派诺智慧”。
            </p>

            <div class="campus-images">
                <div class="image-container">
                    <img
                        src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="珠海总部园区"
                    />
                    <div class="overlay">珠海总部园区</div>
                </div>
                <div class="image-container">
                    <img
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="深圳研发中心"
                    />
                    <div class="overlay">深圳研发中心</div>
                </div>
                <div class="image-container">
                    <img
                        src="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="武汉研发中心"
                    />
                    <div class="overlay">武汉研发中心</div>
                </div>
                <div class="image-container">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        alt="科技产业园"
                    />
                    <div class="overlay">科技产业园</div>
                </div>
            </div>
        </section>

        <!-- 企业文化部分 -->
        <section class="content-card">
            <h2 class="section-title"><i class="fas fa-heart"></i>企业文化</h2>

            <div class="culture-cards">
                <div class="culture-card">
                    <div class="card-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3 class="card-title">企业精神</h3>
                    <p class="card-content">
                        创业不息，创新不止，创造不凡。我们始终以创业者的心态面对挑战，以创新的精神推动发展，以创造不凡的成果回报社会。
                    </p>
                </div>

                <div class="culture-card">
                    <div class="card-icon">
                        <i class="fas fa-bullseye"></i>
                    </div>
                    <h3 class="card-title">企业使命</h3>
                    <p class="card-content">
                        从物联到智联，推动"智慧用电，绿色用能"，以高品质产品与数字化解决方案赋能全球能源绿色转型。
                    </p>
                </div>

                <div class="culture-card">
                    <div class="card-icon">
                        <i class="fas fa-eye"></i>
                    </div>
                    <h3 class="card-title">企业愿景</h3>
                    <p class="card-content">
                        以"小公司做出大事业，大公司办成大家的公司，大家的公司成长为全球领先、用户信赖的能源物联网企业"为目标，不断追求卓越，成为全球绿色能源转型的关键力量。
                    </p>
                </div>
            </div>
        </section>
    </div>

    <!-- 合作伙伴部分 -->
    <div class="container">
        <section class="partners-section">
            <h2 class="partner-title">
                <i class="fas fa-handshake"></i>合作伙伴
            </h2>

            <div class="partner-logos">
                <div class="partner-logo" v-for="i in 24" :key="i">
                    <img
                        :src="`https://pmac.leyi.host/downloads/partner/${i}.jpg`"
                        alt="合作伙伴"
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script setup></script>

<style lang="scss" scoped>
/* 页面标题样式 */
.page-header {
    background: linear-gradient(rgba(26, 58, 95, 0.85), rgba(44, 82, 130, 0.9)),
        url("https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80");
    background-size: cover;
    background-position: center;
    color: white;
    padding: 80px 0 60px;
    text-align: center;
    margin-bottom: 40px;
    border-radius: 0 0 10px 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    h1 {
        font-size: 2.8rem;
        font-weight: 700;
        margin-bottom: 15px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    p {
        font-size: 1.2rem;
        max-width: 700px;
        margin: 0 auto;
        opacity: 0.9;
    }
}

/* 内容卡片样式 */
.content-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    padding: 30px;
    margin-bottom: 40px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: none;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
    }

    .section-title {
        color: #1a3a5f;
        font-weight: 700;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 3px solid #3b82f6;
        display: inline-block;
        font-size: 1.8rem;

        i {
            margin-right: 12px;
            color: #2c5282;
        }
    }

    .company-intro {
        text-indent: 2em;
        margin-bottom: 25px;
        font-size: 1.05rem;
        color: #444;
    }
}

/* 园区图片样式 */
.campus-images {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 25px;

    .image-container {
        flex: 1 1 calc(25% - 20px);
        min-width: 200px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        position: relative;

        &:hover {
            transform: scale(1.03);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

            img {
                transform: scale(1.05);
            }
        }

        img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            transition: transform 0.4s ease;
        }

        .overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
            color: white;
            padding: 15px 10px;
            text-align: center;
            font-weight: 500;
        }
    }
}

/* 企业文化卡片样式 */
.culture-cards {
    display: flex;
    gap: 25px;
    flex-wrap: wrap;

    .culture-card {
        flex: 1;
        min-width: 300px;
        background: #f8fafc;
        border-radius: 12px;
        padding: 30px;
        border-left: 5px solid #2c5282;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;

        &:hover {
            background: white;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transform: translateY(-8px);
            border-left: 5px solid #3b82f6;
        }

        .card-icon {
            font-size: 2.5rem;
            color: #2c5282;
            margin-bottom: 20px;
        }

        .card-title {
            color: #1a3a5f;
            font-weight: 700;
            margin-bottom: 15px;
            font-size: 1.3rem;
        }

        .card-content {
            color: #4a5568;
            line-height: 1.8;
        }
    }
}

/* 合作伙伴样式 */
.partners-section {
    background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
    padding: 50px 0;
    border-radius: 10px;
    margin: 40px 0;

    .partner-title {
        text-align: center;
        color: #1a3a5f;
        font-weight: 700;
        margin-bottom: 40px;
        font-size: 2rem;

        i {
            color: #3b82f6;
            margin-right: 10px;
        }
    }

    .partner-logos {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 30px;

        .partner-logo {
            width: 160px;
            height: 100px;
            background: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;

            &:hover {
                transform: scale(1.08);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            img {
                max-width: 100%;
                max-height: 70px;
                transition: filter 0.4s ease;
            }

            &:hover img {
                filter: grayscale(0%);
            }
        }
    }
}

/* 页脚样式 */
.footer {
    background: linear-gradient(to right, #1a3a5f, #2c5282);
    color: rgba(255, 255, 255, 0.85);
    padding: 50px 0 30px;
    margin-top: 60px;

    .footer-title {
        color: white;
        font-weight: 600;
        margin-bottom: 20px;
        font-size: 1.3rem;
    }

    .contact-info {
        p {
            margin-bottom: 10px;
            display: flex;
            align-items: center;

            i {
                width: 24px;
                margin-right: 10px;
                color: #3b82f6;
            }
        }
    }

    .footer-links {
        list-style: none;
        padding: 0;

        li {
            margin-bottom: 12px;

            a {
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                transition: all 0.3s ease;

                &:hover {
                    color: white;
                    padding-left: 5px;
                }
            }
        }
    }

    .copyright {
        text-align: center;
        padding-top: 30px;
        margin-top: 30px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
    }
}

/* 响应式调整 */
@media (max-width: 992px) {
    .campus-images .image-container {
        flex: 1 1 calc(50% - 20px);
    }

    .culture-cards .culture-card {
        min-width: 100%;
    }
}

@media (max-width: 768px) {
    .page-header h1 {
        font-size: 2.2rem;
    }

    .header .nav-link {
        padding: 15px 10px;
        font-size: 0.9rem;
    }

    .campus-images .image-container {
        flex: 1 1 100%;
    }
}
</style>
