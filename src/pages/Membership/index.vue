<template>
  <div class="membership-page" :class="{ 'member-mode': !purchaseAvailable }">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <template v-else>
      <div class="membership-container">
        <!-- ===== 已开通会员视图（付费会员默认展示，100%还原设计稿） ===== -->
        <template v-if="!purchaseAvailable">
          <div class="member-center">
            <!-- Header Section -->
            <div class="mc-header mc-animate mc-delay-1">
              <div class="mc-pro-badge">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2L13 7L8 14L3 7L8 2Z"
                    fill="white"
                    opacity="0.9"
                  />
                  <path d="M8 5L10.5 7.5L8 11L5.5 7.5L8 5Z" fill="white" />
                </svg>
                PRO
              </div>
              <h1 class="mc-title">解锁高级会员</h1>
              <p class="mc-subtitle">
                获取实时电价数据 · 深度趋势分析 · 光伏收益预测
              </p>
            </div>

            <!-- User Info Card -->
            <div class="mc-user-card mc-animate mc-delay-2">
              <div class="mc-user-card-inner">
                <div class="mc-user-left">
                  <div class="mc-avatar">{{ avatarChar }}</div>
                  <div>
                    <div class="mc-user-name">{{ user?.name }}</div>
                    <div class="mc-user-phone">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3.5 2.5h3l1.5 3-2 1.5a8 8 0 004 4l1.5-2 3 1.5v3a1 1 0 01-1 1A12 12 0 012.5 3.5a1 1 0 011-1z"
                          stroke="#9CA3AF"
                          stroke-width="1.2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>{{ maskedPhone }}</span>
                    </div>
                  </div>
                </div>
                <div class="mc-user-right">
                  <div class="mc-user-right-group">
                    <span class="mc-status-dot"></span>
                    <span class="mc-status-label">当前状态：</span>
                    <span class="mc-status-badge">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M8 2L13 7L8 14L3 7L8 2Z"
                          stroke="#6D28D9"
                          stroke-width="1.5"
                          stroke-linejoin="round"
                        />
                        <path d="M3 7h10" stroke="#6D28D9" stroke-width="1.5" />
                      </svg>
                      高级会员
                    </span>
                  </div>
                  <div class="mc-user-divider"></div>
                  <div class="mc-user-expiry">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="2"
                        y="3"
                        width="12"
                        height="11"
                        rx="1.5"
                        stroke="#6B7280"
                        stroke-width="1.5"
                      />
                      <path
                        d="M2 7h12M5 1.5v3M11 1.5v3"
                        stroke="#6B7280"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                    <span
                      >有效期至
                      {{ formatDate(paidMembershipInfo.expireAt) }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Expiry Reminder -->
            <div class="mc-reminder mc-animate mc-delay-2">
              <div class="mc-reminder-left">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#6D28D9"
                    stroke-width="1.5"
                  />
                  <path
                    d="M10 6v4l2.5 1.5"
                    stroke="#6D28D9"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                <span class="mc-reminder-text"
                  >会员有效期还剩
                  <span class="mc-reminder-days">{{
                    paidMembershipInfo.daysLeft
                  }}</span>
                  天</span
                >
              </div>
              <button class="mc-reminder-btn" @click="handleRenew">
                立即续费
              </button>
            </div>

            <!-- Member Benefits -->
            <div class="mc-section mc-animate mc-delay-3">
              <h2 class="mc-section-title">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2L15 7L10 17L5 7L10 2Z"
                    fill="#6D28D9"
                    opacity="0.15"
                  />
                  <path
                    d="M10 2L15 7L10 17L5 7L10 2Z"
                    stroke="#6D28D9"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
                会员专属权益
              </h2>
              <div class="mc-benefits-grid">
                <div class="mc-benefit-card mc-card-hover">
                  <div class="mc-benefit-icon">📍</div>
                  <div class="mc-benefit-body">
                    <div class="mc-benefit-title">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="#6D28D9"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>广东省2000+节点电价查询</span>
                    </div>
                    <p class="mc-benefit-desc">
                      覆盖广东全省2000余个交易节点，实时查看各节点电价数据
                    </p>
                  </div>
                </div>
                <div class="mc-benefit-card mc-card-hover">
                  <div class="mc-benefit-icon">📈</div>
                  <div class="mc-benefit-body">
                    <div class="mc-benefit-title">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="#6D28D9"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>结算电价预测</span>
                    </div>
                    <p class="mc-benefit-desc">
                      基于历史数据与AI算法，精准预测未来结算电价走势
                    </p>
                  </div>
                </div>
                <div class="mc-benefit-card mc-card-hover">
                  <div class="mc-benefit-icon">📊</div>
                  <div class="mc-benefit-body">
                    <div class="mc-benefit-title">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3.5 8.5L6.5 11.5L12.5 4.5"
                          stroke="#6D28D9"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <span>数据Excel格式导出</span>
                    </div>
                    <p class="mc-benefit-desc">
                      支持一键导出查询数据为Excel文件，方便二次分析与存档
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settlement Price Prediction Banner -->
            <div class="mc-banner mc-animate mc-delay-4">
              <div class="mc-banner-left">
                <div class="mc-banner-badge-row">
                  <span class="mc-banner-badge">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5z"
                        fill="#FBBF24"
                      />
                    </svg>
                    新功能上线
                  </span>
                </div>
                <h2 class="mc-banner-title">结算电价预测</h2>
                <p class="mc-banner-desc">
                  融合统调负荷、新能源出力、跨区送电、气象与历史交易等多维特征，精准预测
                  D+1 日逐时结算电价曲线
                </p>
                <div class="mc-banner-features">
                  <div class="mc-banner-feature">
                    <div class="mc-banner-feature-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="7"
                          stroke="#6D28D9"
                          stroke-width="1.5"
                        />
                        <path
                          d="M10 6v4l2.5 1.5"
                          stroke="#6D28D9"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="mc-banner-feature-title">
                        实时结算电价预测
                      </div>
                      <p class="mc-banner-feature-desc">
                        预测 D+1 日逐时实时结算电价曲线
                      </p>
                    </div>
                  </div>
                  <div class="mc-banner-feature">
                    <div class="mc-banner-feature-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="14"
                          height="12"
                          rx="1.5"
                          stroke="#6D28D9"
                          stroke-width="1.5"
                        />
                        <path d="M3 8h14" stroke="#6D28D9" stroke-width="1.5" />
                        <path
                          d="M7 1v6M13 1v6"
                          stroke="#6D28D9"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="mc-banner-feature-title">
                        日前结算电价预测
                      </div>
                      <p class="mc-banner-feature-desc">
                        预测 D+1 日逐时日前结算电价曲线
                      </p>
                    </div>
                  </div>
                </div>
                <button class="mc-banner-btn" @click="goSettlementPrediction">
                  立即体验
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4l4 4-4 4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div class="mc-banner-visual">
                <svg width="180" height="140" viewBox="0 0 180 140" fill="none">
                  <line
                    x1="20"
                    y1="30"
                    x2="160"
                    y2="30"
                    stroke="#E5E7EB"
                    stroke-width="0.5"
                  />
                  <line
                    x1="20"
                    y1="60"
                    x2="160"
                    y2="60"
                    stroke="#E5E7EB"
                    stroke-width="0.5"
                  />
                  <line
                    x1="20"
                    y1="90"
                    x2="160"
                    y2="90"
                    stroke="#E5E7EB"
                    stroke-width="0.5"
                  />
                  <line
                    x1="20"
                    y1="120"
                    x2="160"
                    y2="120"
                    stroke="#E5E7EB"
                    stroke-width="0.5"
                  />
                  <path
                    d="M20 100 Q40 85 55 75 T90 55 T120 45 T150 35 L150 120 L20 120Z"
                    fill="url(#mcAreaGrad)"
                    opacity="0.3"
                  />
                  <path
                    d="M20 100 Q40 85 55 75 T90 55 T120 45 T150 35"
                    stroke="#6D28D9"
                    stroke-width="2.5"
                    fill="none"
                    stroke-linecap="round"
                  />
                  <circle cx="55" cy="75" r="3" fill="#6D28D9" />
                  <circle cx="90" cy="55" r="3" fill="#6D28D9" />
                  <circle cx="120" cy="45" r="3" fill="#6D28D9" />
                  <circle
                    cx="150"
                    cy="35"
                    r="4"
                    fill="#6D28D9"
                    stroke="white"
                    stroke-width="2"
                  />
                  <text x="20" y="135" fill="#9CA3AF" font-size="8">00:00</text>
                  <text x="80" y="135" fill="#9CA3AF" font-size="8">12:00</text>
                  <text x="140" y="135" fill="#9CA3AF" font-size="8">
                    24:00
                  </text>
                  <defs>
                    <linearGradient
                      id="mcAreaGrad"
                      x1="20"
                      y1="30"
                      x2="20"
                      y2="120"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#6D28D9" />
                      <stop offset="1" stop-color="#6D28D9" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <!-- Platform Introduction -->
            <div class="mc-intro-card mc-animate mc-delay-4">
              <h2 class="mc-section-title">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    fill="#6D28D9"
                    opacity="0.15"
                    stroke="#6D28D9"
                    stroke-width="1.5"
                  />
                  <path
                    d="M10 7v3l2 1"
                    stroke="#6D28D9"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                关于派诺星火平台
              </h2>
              <div class="mc-intro-body">
                <p>
                  <span class="mc-intro-strong">派诺星火</span
                  >是面向能源行业的智能化数据服务平台，致力于为用户提供实时电价监测、电力负荷预测、光伏收益分析等核心能力。
                </p>
                <p>
                  平台依托自研 AI
                  算法引擎，整合全国各省市电力交易数据、气象信息与政策动态，帮助用户实现<span
                    class="mc-intro-accent"
                    >精准决策</span
                  >与<span class="mc-intro-accent">降本增效</span>。
                </p>
                <div class="mc-intro-tags">
                  <span class="mc-intro-tag">实时电价</span>
                  <span class="mc-intro-tag">AI 预测</span>
                  <span class="mc-intro-tag">光伏分析</span>
                  <span class="mc-intro-tag">数据导出</span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="mc-section mc-animate mc-delay-5">
              <h2 class="mc-section-title">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="#6D28D9"
                    opacity="0.15"
                    stroke="#6D28D9"
                    stroke-width="1.2"
                  />
                  <rect
                    x="11"
                    y="3"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="#6D28D9"
                    opacity="0.15"
                    stroke="#6D28D9"
                    stroke-width="1.2"
                  />
                  <rect
                    x="3"
                    y="11"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="#6D28D9"
                    opacity="0.15"
                    stroke="#6D28D9"
                    stroke-width="1.2"
                  />
                  <rect
                    x="11"
                    y="11"
                    width="6"
                    height="6"
                    rx="1.5"
                    fill="#6D28D9"
                    opacity="0.15"
                    stroke="#6D28D9"
                    stroke-width="1.2"
                  />
                </svg>
                快捷功能
              </h2>
              <div class="mc-actions-grid">
                <button
                  class="mc-action-btn mc-card-hover"
                  @click="goPriceAnalysis"
                >
                  <div class="mc-action-icon mc-action-icon-purple">📍</div>
                  <div class="mc-action-body">
                    <div class="mc-action-title">节点电价分析</div>
                    <div class="mc-action-desc">查看广东省各节点电价走势</div>
                  </div>
                  <div class="mc-action-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </button>
                <button
                  class="mc-action-btn mc-card-hover"
                  @click="goSettlementPrediction"
                >
                  <div class="mc-action-icon mc-action-icon-blue">📈</div>
                  <div class="mc-action-body">
                    <div class="mc-action-title">结算电价预测</div>
                    <div class="mc-action-desc">AI 预测未来结算电价趋势</div>
                  </div>
                  <div class="mc-action-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </button>
                <button class="mc-action-btn mc-card-hover" @click="goInvoices">
                  <div class="mc-action-icon mc-action-icon-green">🧾</div>
                  <div class="mc-action-body">
                    <div class="mc-action-title">开发票</div>
                    <div class="mc-action-desc">申请开具会员发票</div>
                  </div>
                  <div class="mc-action-arrow">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer Links -->
            <div class="mc-footer-links mc-animate mc-delay-6">
              <a href="#" class="mc-footer-link" @click.prevent="goInvoices">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 2h8a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <path
                    d="M6 6h4M6 9h4M6 12h2"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                </svg>
                历史订单
              </a>
              <a href="#" class="mc-footer-link" @click.prevent="goInvoices">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4h10M3 8h10M3 12h6"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M11 10l2 2 2-2"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                发票管理
              </a>
              <a
                href="#"
                class="mc-footer-link"
                @click.prevent="handleHelpCenter"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <path
                    d="M8 5v3.5M8 10.5v.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                帮助中心
              </a>
              <a
                href="#"
                class="mc-footer-link"
                @click.prevent="handleOnlineService"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2a5 5 0 00-5 5c0 3.5 5 7 5 7s5-3.5 5-7a5 5 0 00-5-5z"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <circle
                    cx="8"
                    cy="7"
                    r="1.5"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                </svg>
                在线客服
              </a>
            </div>
          </div>
        </template>

        <!-- ===== 未开通/续费：购买流程 ===== -->
        <template v-else>
          <!-- 顶部标题区域 -->
          <div class="header-area">
            <span class="pro-badge">
              <el-icon class="pro-badge-icon"><Lightning /></el-icon>PRO
            </span>
            <h1 class="page-title">解锁高级会员</h1>
            <p class="page-subtitle">
              获取实时电价数据·深度趋势分析·光伏收益预测
            </p>
          </div>

          <!-- 新人福利悬浮入口（仅免费用户可见） -->
          <div
            v-if="!membershipInfo.isMember && !claimedFreeTrial"
            class="gift-entry"
            @click="openGiftModal"
          >
            <div class="gift-entry-icon">
              <i class="bi bi-gift-fill"></i>
              <span class="gift-entry-badge">7天</span>
            </div>
            <span class="gift-entry-label">新人福利</span>
          </div>

          <!-- 用户状态栏 -->
          <div class="status-bar">
            <div class="status-bar-left">
              <div class="user-avatar">
                <i class="bi bi-person-fill"></i>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user?.name }}</span>
                <span class="user-phone">
                  <i class="bi bi-telephone"></i>{{ user?.phone }}
                </span>
              </div>
            </div>
            <div class="status-bar-right">
              <span class="status-dot"></span>
              <span class="status-label">
                当前状态：
                <span
                  class="status-value"
                  :class="membershipInfo.isMember ? 'is-member' : 'is-free'"
                >
                  <i
                    :class="
                      membershipInfo.isMember
                        ? 'bi bi-gem'
                        : 'bi bi-person-fill'
                    "
                  ></i>
                  {{ membershipInfo.isMember ? "会员" : "免费用户" }}
                </span>
              </span>
              <template v-if="membershipInfo.isMember">
                <span class="status-expire">
                  <i class="bi bi-calendar-check"></i>
                  有效期至 {{ formatDate(membershipInfo.expireAt) }}
                </span>
                <a
                  v-if="isExpiring"
                  href="#plans"
                  class="status-link"
                  @click.prevent="scrollToPlans"
                  >立即续费 <i class="bi bi-lightning-charge-fill"></i
                ></a>
              </template>
            </div>
          </div>

          <!-- 即将到期警示 -->
          <div v-if="isExpiring" class="expiring-warning">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ expiringWarningText }}</span>
          </div>

          <!-- 套餐区域（购买/续费流程中展示） -->
          <template v-if="purchaseAvailable">
            <h2 class="section-title" id="plans">选择你的套餐</h2>
            <div class="plan-cards">
              <div
                v-for="plan in plans"
                :key="plan.type"
                class="plan-card"
                :class="{ selected: selectedPlan?.type === plan.type }"
                @click="selectedPlan = plan"
              >
                <span class="tag-discount"><span>限时特惠</span></span>
                <div class="plan-body">
                  <h3 class="plan-name">
                    <span class="plan-name-text">{{ plan.name }}</span>
                    <span class="tag-badge">
                      {{ plan.tag }}
                    </span>
                    <span v-if="plan.save" class="plan-save">{{
                      plan.save
                    }}</span>
                  </h3>
                  <div class="plan-price-row">
                    <span class="plan-price">¥{{ plan.price }}</span>
                    <span class="plan-original-price"
                      >¥{{ plan.originalPrice }}</span
                    >
                  </div>
                  <div class="plan-duration">/{{ plan.duration }}</div>
                  <span
                    v-if="selectedPlan?.type === plan.type"
                    class="selected-check"
                  >
                    <i class="bi bi-check"></i>
                  </span>
                </div>
              </div>
            </div>

            <!-- 支付方式区域 -->
            <div class="payment-section">
              <h3 class="payment-title">选择支付方式</h3>
              <div class="payment-methods">
                <div
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="payment-method"
                  :class="{ active: selectedPaymentMethod === method.value }"
                  @click="selectedPaymentMethod = method.value"
                >
                  <div class="payment-method-left">
                    <i :class="[method.icon, 'method-' + method.value]"></i>
                    <span>{{ method.label }}</span>
                  </div>
                  <i
                    v-if="selectedPaymentMethod === method.value"
                    class="bi bi-check-circle-fill check-icon"
                  ></i>
                </div>
              </div>
            </div>

            <!-- 购买按钮 -->
            <button class="buy-btn" @click="handleBuy">
              {{ buyButtonText }} ¥{{ selectedPlan?.price }} →
            </button>

            <!-- 底部提示文字 -->
            <div class="bottom-tip">
              <i class="bi bi-info-circle"></i>
              <span
                >新用户首次开通可享7天免费试用，试用期内购买会员有效期自动叠加</span
              >
            </div>
          </template>

          <!-- 测试账号 - 一键激活（套餐区隐藏时同步隐藏） -->
          <div
            v-if="isTestAccount && purchaseAvailable"
            class="test-account-section"
          >
            <div class="test-account-card">
              <div class="test-account-info">
                <h4>
                  <i class="bi bi-bug-fill"></i>
                  测试账号模式
                  <span class="test-badge">开发环境</span>
                </h4>
                <p>开发测试账号，可一键激活任意会员套餐，免支付</p>
              </div>
              <div class="test-account-actions">
                <button
                  v-for="plan in plans"
                  :key="'test-' + plan.type"
                  class="test-activate-btn"
                  @click="handleTestActivate(plan.type)"
                >
                  激活{{ plan.name }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 支付弹窗（点击周围区域不关闭，仅通过关闭按钮关闭） -->
      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="payment-modal">
          <button class="close-btn" @click="closePaymentModal">✕</button>

          <!-- 创建订单中 -->
          <div v-if="!paymentInfo" class="modal-loading">
            <div class="spinner-sm"></div>
            <span>创建订单中...</span>
          </div>

          <!-- 支付二维码 / Mock 支付 -->
          <template v-else>
            <div class="pay-header">
              <i :class="[methodIcon, 'method-' + selectedPaymentMethod]"></i>
              <span>{{ methodLabel }}</span>
            </div>
            <p class="pay-subtitle">扫一扫付款</p>
            <p class="pay-plan">套餐：{{ selectedPlan?.name }}</p>
            <p class="pay-price-big">¥{{ selectedPlan?.price }}</p>

            <!-- Mock 模式 - 模拟支付按钮 -->
            <div v-if="paymentInfo?.mockQrCode" class="mock-payment">
              <div class="mock-badge">测试环境</div>
              <p class="mock-hint">当前为 Mock 模式，点击下方按钮模拟支付</p>
              <button
                class="mock-pay-btn"
                :disabled="pollingActive"
                @click="handleMockPayment"
              >
                {{ pollingActive ? "支付处理中..." : "模拟支付成功" }}
              </button>
            </div>

            <!-- 真实支付 - 二维码 -->
            <div v-else-if="paymentInfo?.qrCodeUrl" class="qr-section">
              <canvas ref="qrCanvas"></canvas>
              <p class="qr-validity">
                二维码有效期2分钟
                <br />
                请尽快完成付款
              </p>
              <div class="payment-status" v-if="pollingActive">
                <div class="spinner-sm"></div>
                <span>等待支付...</span>
              </div>
            </div>
          </template>

          <!-- 支付结果 -->
          <div
            v-if="paymentResult"
            class="payment-result"
            :class="paymentResult.success ? 'success' : 'fail'"
          >
            <i
              :class="
                paymentResult.success
                  ? 'bi bi-check-circle-fill'
                  : 'bi bi-x-circle-fill'
              "
            ></i>
            <span>{{ paymentResult.message }}</span>
          </div>
        </div>
      </div>

      <!-- 新人福利领取弹窗 -->
      <div
        v-if="showGiftModal"
        class="gift-modal-overlay"
        @click.self="closeGiftModal"
      >
        <div class="gift-modal">
          <button class="gift-close-btn" @click="closeGiftModal">✕</button>

          <!-- Hero 区：礼盒 + 光效 -->
          <div class="gift-modal-hero">
            <div class="gift-box-wrap">
              <span class="gift-sun gift-sun-1"></span>
              <span class="gift-sun gift-sun-2"></span>
              <div class="gift-box">
                <i class="bi bi-gift-fill"></i>
              </div>
            </div>
            <span class="gift-new-badge">
              <i class="bi bi-stars"></i> 新人专属
            </span>
          </div>

          <h3 class="gift-modal-title">免费领取 7 天会员</h3>
          <p class="gift-modal-desc">解锁全部高级功能，开启智能用电之旅</p>

          <!-- 权益列表 -->
          <div class="gift-benefits">
            <div class="gift-benefit">
              <i class="bi bi-lightning-charge-fill"></i>
              <div>
                <span>实时电价数据</span>
                <small>掌握全天电价波动</small>
              </div>
            </div>
            <div class="gift-benefit">
              <i class="bi bi-graph-up-arrow"></i>
              <div>
                <span>深度趋势分析</span>
                <small>洞察用电规律</small>
              </div>
            </div>
            <div class="gift-benefit">
              <i class="bi bi-sun-fill"></i>
              <div>
                <span>光伏收益预测</span>
                <small>精准预估发电收益</small>
              </div>
            </div>
          </div>

          <p class="gift-tip">
            <i class="bi bi-arrow-repeat"></i>
            每个用户仅限领取一次，试用期内购买会员有效期自动叠加
          </p>

          <div class="gift-actions">
            <button
              class="gift-btn-primary"
              :disabled="claiming"
              @click="confirmClaimGift"
            >
              {{ claiming ? "领取中..." : "立即免费领取" }}
              <i class="bi bi-gift-fill"></i>
            </button>
            <button class="gift-btn-ghost" @click="closeGiftModal">
              暂不需要
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, inject } from "vue";
import { ElMessage } from "element-plus";
import { Lightning } from "@element-plus/icons-vue";
import request from "@/utils/request";
import QRCode from "qrcode";
import { useMembershipStore } from "@/store/membership";
import { useRouter } from "vue-router";

const store = useMembershipStore();
const router = useRouter();
const user = inject("user");
const loading = computed(() => store.loading);
const membershipInfo = computed(() => store.membershipInfo);
const claimedFreeTrial = computed(() => store.claimedFreeTrial);
const paidMembershipInfo = computed(() => store.paidMembershipInfo);

// ===== 已开通会员视图：头像首字（用户名首字符） =====
const avatarChar = computed(() => user?.value?.name?.charAt(0) || "用");

// ===== 已开通会员视图：手机号脱敏（130****8226） =====
const maskedPhone = computed(() => {
  const phone = user?.value?.phone || "";
  return phone.length === 11
    ? `${phone.slice(0, 3)}****${phone.slice(7)}`
    : phone;
});

// ===== 已开通会员视图：立即续费（付费会员可随时续费，解除到期前3天限制） =====
const handleRenew = () => {
  renewMode.value = true;
};

// ===== 已开通会员视图：快捷功能跳转 =====
const goPriceAnalysis = () => router.push("/price-analysis");
const goSettlementPrediction = () => router.push("/price-analysis/settlement");
const goInvoices = () => router.push("/membership/invoices");

// ===== 已开通会员视图：帮助中心 / 在线客服（暂未开放独立页面） =====
const handleHelpCenter = () => {
  ElMessage.info("帮助中心建设中，敬请期待");
};
const handleOnlineService = () => {
  ElMessage.info("在线客服建设中，敬请期待");
};

// 是否为付费会员（非免费试用）
const isPaidMembership = computed(() => paidMembershipInfo.value.isPaidMember);

// 续费模式：付费会员点击「立即续费」后进入购买流程（可随时续费，解除到期前3天限制）
const renewMode = ref(false);

// 会员（含免费试用）是否即将到期（≤3天）
const isExpiring = computed(
  () => membershipInfo.value.isMember && membershipInfo.value.daysLeft <= 3,
);

// 即将到期提示文案（区分付费会员与免费试用）
const expiringWarningText = computed(() =>
  isPaidMembership.value
    ? "您的会员即将到期，请及时续费以继续享受会员权益"
    : "您的免费试用即将到期，开通正式会员可无缝续享权益",
);

// 套餐区是否可展示：免费用户直接展示；付费会员点击「立即续费」后进入续费流程
const purchaseAvailable = computed(
  () => !isPaidMembership.value || renewMode.value,
);

// 按钮文案：付费会员显示「续费」，免费用户显示「立即购买」
const buyButtonText = computed(() =>
  isPaidMembership.value ? "续费" : "立即购买",
);

// 二维码视图头部：支付方式图标
const methodIcon = computed(() =>
  selectedPaymentMethod.value === "alipay" ? "bi bi-alipay" : "bi bi-wechat",
);

// 二维码视图头部：支付方式文案
const methodLabel = computed(() =>
  selectedPaymentMethod.value === "alipay" ? "支付宝支付" : "微信支付",
);

const plans = [
  {
    type: "week",
    name: "周会员",
    price: 19,
    duration: "7天",
    originalPrice: 39,
    popular: false,
    tag: "体验版",
  },
  {
    type: "month",
    name: "月度会员",
    price: 29,
    duration: "30天",
    originalPrice: 99,
    popular: true,
    tag: "特惠版",
    save: "省64%",
  },
  {
    type: "quarter",
    name: "季度会员",
    price: 79,
    duration: "90天",
    originalPrice: 297,
    popular: false,
    tag: "超值版",
    save: "省73%",
  },
];

const paymentMethods = [
  { value: "wechat", label: "微信支付", icon: "bi bi-wechat" },
  { value: "alipay", label: "支付宝", icon: "bi bi-alipay" },
];

// 默认选中月度会员（最受欢迎）与微信支付，与 UI 图一致
const selectedPlan = ref(plans[1]);
const selectedPaymentMethod = ref("wechat");
const showPaymentModal = ref(false);
const paymentInfo = ref(null);
const pollingActive = ref(false);
const paymentResult = ref(null);
const qrCanvas = ref(null);
const claiming = ref(false); // 免费试用领取请求进行中标志（防重复提交）
const showGiftModal = ref(false); // 新人福利弹窗开关

// 检查是否为测试账号
const isTestAccount = computed(() => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    return userInfo.phone === "19122221999";
  } catch {
    return false;
  }
});

// 状态栏链接：滚动到套餐区域
const scrollToPlans = () => {
  document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
};

// 测试账号一键激活
const handleTestActivate = async (type) => {
  try {
    // 先创建订单
    const orderRes = await request.post("/api/membership/create-order", {
      type,
      paymentMethod: "wechat",
    });
    if (!orderRes.data.success) return;

    // 模拟支付成功
    await request.post("/api/membership/payment/mock-success", {
      orderNo: orderRes.data.orderNo,
    });

    await fetchMembershipStatus();
  } catch (err) {
    console.error("测试账号激活失败:", err);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

// 获取会员状态
const fetchMembershipStatus = store.fetchMembershipStatus;

// 点击购买：需先选择支付方式，随后直接创建订单并弹出支付窗口
const handleBuy = () => {
  if (!selectedPlan.value) return;
  if (!selectedPaymentMethod.value) {
    ElMessage.warning("请先选择支付方式");
    return;
  }
  paymentInfo.value = null;
  paymentResult.value = null;
  showPaymentModal.value = true;
  createOrder();
};

// 创建订单
const createOrder = async () => {
  if (!selectedPlan.value || !selectedPaymentMethod.value) return;
  try {
    const res = await request.post("/api/membership/create-order", {
      type: selectedPlan.value.type,
      paymentMethod: selectedPaymentMethod.value,
    });
    const data = res.data;
    if (data.success) {
      paymentInfo.value = data;

      // 如果是 Mock 模式，不生成二维码
      if (!data.mockQrCode && data.qrCodeUrl) {
        await nextTick();
        if (qrCanvas.value) {
          await QRCode.toCanvas(qrCanvas.value, data.qrCodeUrl, { width: 200 });
        }
        startPolling(data.orderNo);
      }
    } else {
      // 创建订单失败
      closePaymentModal();
      ElMessage.error(data.message || "创建订单失败，请重试");
    }
  } catch (err) {
    console.error("创建订单失败:", err);
    closePaymentModal();
    ElMessage.error("创建订单失败，请重试");
  }
};

// 模拟支付成功
const handleMockPayment = async () => {
  if (!paymentInfo.value) return;
  pollingActive.value = true;

  try {
    const res = await request.post("/api/membership/payment/mock-success", {
      orderNo: paymentInfo.value.orderNo,
    });
    const data = res.data;
    if (data.success) {
      paymentResult.value = { success: true, message: "支付成功！会员已激活" };
      await fetchMembershipStatus();
      renewMode.value = false; // 续费成功后回到会员中心
      setTimeout(() => {
        closePaymentModal();
      }, 2000);
    }
  } catch (err) {
    paymentResult.value = { success: false, message: "支付失败，请重试" };
  } finally {
    pollingActive.value = false;
  }
};

// 轮询句柄（关闭弹窗时需清理，防止后台继续轮询）
let pollTimer = null;
let pollTimeout = null;

// 清除轮询定时器
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
};

// 轮询支付状态
const startPolling = (orderNo) => {
  // 先清理旧轮询，避免重复叠加
  stopPolling();
  pollingActive.value = true;
  const interval = setInterval(async () => {
    try {
      const res = await request.get(
        `/api/membership/payment/status/${orderNo}`,
      );
      const data = res.data;
      if (data.success && data.status === "success") {
        stopPolling();
        pollingActive.value = false;
        paymentResult.value = {
          success: true,
          message: "支付成功！会员已激活",
        };
        await fetchMembershipStatus();
        renewMode.value = false; // 续费成功后回到会员中心
        setTimeout(() => {
          closePaymentModal();
        }, 2000);
      } else if (data.success && data.status === "canceled") {
        stopPolling();
        pollingActive.value = false;
        paymentResult.value = {
          success: false,
          message: "支付超时，订单已取消",
        };
        await fetchMembershipStatus();
        setTimeout(() => {
          closePaymentModal();
        }, 2000);
      }
    } catch (err) {
      console.error("轮询支付状态失败:", err);
    }
  }, 3000);
  pollTimer = interval;

  // 5分钟后停止轮询
  pollTimeout = setTimeout(() => {
    stopPolling();
    pollingActive.value = false;
  }, 300000);
};

// 关闭支付弹窗
const closePaymentModal = () => {
  // 停止轮询
  stopPolling();
  pollingActive.value = false;

  // 有未支付订单时将其标记为已取消
  const orderNo = paymentInfo.value?.orderNo;
  if (orderNo) {
    request.post("/api/membership/payment/cancel", { orderNo }).catch(() => {});
  }

  showPaymentModal.value = false;
  paymentInfo.value = null;
  paymentResult.value = null;
  fetchMembershipStatus();
};

// 新人福利弹窗：打开 / 关闭
const openGiftModal = () => {
  if (claimedFreeTrial.value || isPaidMembership.value) return;
  showGiftModal.value = true;
};

const closeGiftModal = () => {
  showGiftModal.value = false;
};

// 新人福利弹窗确认领取（弹窗本身即确认环节，直接领取）
const confirmClaimGift = () => {
  closeGiftModal();
  doClaimFreeTrial();
};

// 领取免费试用（实际请求）
const doClaimFreeTrial = async () => {
  // 已领取或请求进行中时防重
  if (claimedFreeTrial.value || isPaidMembership.value || claiming.value)
    return;
  claiming.value = true;

  try {
    const res = await request.post("/api/membership/free-trial");
    const data = res.data;
    if (data.success) {
      store.claimedFreeTrial = true;
      await fetchMembershipStatus();
    }
  } catch (err) {
    console.error("领取免费试用失败:", err);
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    if (status === 400 && code === "FREE_TRIAL_ALREADY_CLAIMED") {
      // 后端返回已领取：同步本地状态并给出明确提示
      store.claimedFreeTrial = true;
      ElMessage.warning("您已领取过免费试用会员，每人仅限一次");
    } else if (status === 400 && code === "FREE_TRIAL_PAID_MEMBER_ACTIVE") {
      // 后端返回付费会员有效期内不可领取，刷新本地状态校正按钮
      await fetchMembershipStatus();
      ElMessage.warning("会员有效期内不可领取免费试用，请到期后再来");
    } else {
      ElMessage.error("领取失败，请稍后重试");
    }
  } finally {
    claiming.value = false;
  }
};

onMounted(() => {
  fetchMembershipStatus();
});
</script>

<style scoped>
/* 页面背景：浅灰（与已开通会员视图保持一致） */
.membership-page {
  box-sizing: border-box;
  min-height: calc(100vh - 64px);
  padding: 40px 16px;
  background: #f9fafb;
}

.membership-container {
  max-width: 1280px;
  margin: 0 auto;
}

/* ===== 加载状态 ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  color: #64748b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #524bd8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 高级渐变动画 ===== */
/* 渐变背景流动 */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 呼吸光晕 */
@keyframes glowPulse {
  0%,
  100% {
    box-shadow: 0 6px 20px rgba(255, 57, 86, 0.28);
  }
  50% {
    box-shadow: 0 8px 32px rgba(255, 119, 53, 0.52);
  }
}

/* 边框渐变流动（双层背景：内层白 + 边框层渐变） */
@keyframes borderFlow {
  0% {
    background-position:
      0% 50%,
      0% 50%;
  }
  50% {
    background-position:
      0% 50%,
      100% 50%;
  }
  100% {
    background-position:
      0% 50%,
      0% 50%;
  }
}

/* 减弱动态效果时，停用流动动画（保留静态渐变边框） */
@media (prefers-reduced-motion: reduce) {
  .plan-card.selected,
  .selected-check,
  .payment-method.active {
    animation: none;
  }
}

/* ===== 顶部标题区域 ===== */
.header-area {
  text-align: center;
  margin-bottom: 32px;
}

.pro-badge {
  display: inline-block;
  background: linear-gradient(
    90deg,
    #4942d0,
    #635be9,
    #8a7dff,
    #635be9,
    #4942d0
  );
  background-size: 300% 100%;
  animation: gradientFlow 4s ease infinite;
  color: #fff;
  padding: 6px 18px;
  border-radius: 9999px;
  font-size: 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 14px rgba(99, 91, 233, 0.35);
}

.pro-badge-icon {
  font-size: 16px;
  margin-right: 5px;
  vertical-align: -1px;
}

/* 页面主标题：紫色 → 蓝色 高级渐变（无动画，渐变层次明显） */
.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(
    135deg,
    #8b5cf6 0%,
    #6211ed 30%,
    #4f46e5 60%,
    #2563eb 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  filter: drop-shadow(0 2px 8px rgba(99, 102, 241, 0.35));
}

.page-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

/* ===== 用户状态栏 ===== */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 20px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(82, 75, 216, 0.06);
}

.status-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #2563eb 100%);
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.user-phone {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #64748b;
}

.user-phone i {
  font-size: 12px;
  color: #94a3b8;
}

.status-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #41c86f;
  box-shadow: 0 0 0 3px rgba(65, 200, 111, 0.15);
}

.status-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
}

.status-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.status-value i {
  font-size: 12px;
}

.status-value.is-member {
  color: #524bd8;
  background: rgba(82, 75, 216, 0.1);
  border: 1px solid rgba(82, 75, 216, 0.3);
}

.status-value.is-free {
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.status-bar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-expire {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #2e3440;
}

.status-expire i {
  font-size: 14px;
  color: #524bd8;
}

.status-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #524bd8;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.status-link:hover {
  opacity: 0.8;
}

/* ===== 即将到期警示 ===== */
.expiring-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  padding: 12px 16px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-left: 4px solid #ff5454;
  border-radius: 10px;
  color: #9a3412;
  font-size: 14px;
  font-weight: 500;
}

.expiring-warning i {
  color: #ff5454;
  font-size: 16px;
}

/* ===== 套餐区域 ===== */
/* 区块标题：小字斜体 + 与主标题一致的高级深蓝紫渐变 */
.section-title {
  position: relative;
  font-size: 15px;
  font-weight: 600;
  font-style: italic;
  letter-spacing: 0.5px;
  margin: 0 0 20px;
  padding-left: 16px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 45%, #4c1d95 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: gradientFlow 5s ease infinite;
  filter: drop-shadow(0 1px 3px rgba(30, 58, 138, 0.25));
}

/* 左侧斜线装饰：与标题文字同色的深蓝紫渐变，斜向与平行四边形卡片呼应 */
.section-title::before,
.payment-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 45%, #4c1d95 100%);
  transform: skewX(-20deg);
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.plan-card {
  position: relative;
  background: #fff;
  border: 3px solid transparent;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(82, 75, 216, 0.12);
  cursor: pointer;
  transition: all 0.2s;
  transform: skewX(-6deg) scale(0.95);
}

/* 选中卡片：放大 + 高亮紫色流动渐变边框（方案A） */
.plan-card.selected {
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(
        120deg,
        #8b5cf6 0%,
        #a78bfa 30%,
        #c4b5fd 50%,
        #a78bfa 70%,
        #8b5cf6 100%
      )
      border-box;
  background-size:
    100% 100%,
    300% 100%;
  animation: borderFlow 4s ease-in-out infinite;
  transform: skewX(-6deg) scale(1.06);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.18);
}

/* 限时特惠 平行四边形渐变标签（右上角） */
.tag-discount {
  position: absolute;
  top: -27px;
  right: 12px;
  background: linear-gradient(90deg, #ff4b4b, #ff7a7a, #ff4b4b);
  background-size: 200% 100%;
  animation: gradientFlow 3s ease infinite;
  transform: skewX(-6deg);
  border-radius: 5px;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
}

.tag-discount span {
  transform: skewX(6deg);
  display: inline-block;
}

/* 套餐标签（标题右侧内联） */
.tag-badge {
  display: inline-block;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 9999px;
  white-space: nowrap;
}

.plan-body {
  padding-top: 16px;
  min-height: 100%;
  /* 反切回正，保持卡片内容文字正立 */
  transform: skewX(6deg);
}

.plan-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 套餐名称：深蓝 → 深紫渐变斜体文字（与页面主标题一致） */
.plan-name-text {
  font-style: italic;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 45%, #4c1d95 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: gradientFlow 4s ease infinite;
}

/* 价格行：售价 + 原价（右侧划线价，间距10px） */
.plan-price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 4px 0;
}

.plan-original-price {
  color: #94a3b8;
  text-decoration: line-through;
  font-size: 18px;
  font-style: italic;
  white-space: nowrap;
}

.plan-price {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  background: linear-gradient(90deg, #ff3956 0%, #ff7735 50%, #ff3956 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: gradientFlow 3s ease infinite;
}

.plan-duration {
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 16px;
}

.plan-save {
  display: inline-block;
  background: #e7f9ee;
  color: #3cbf6a;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  margin: 0;
}

/* 选中卡片右下角勾选圆圈：与选中边框同色系的亮紫流动渐变 */
.selected-check {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    120deg,
    #8b5cf6 0%,
    #a78bfa 30%,
    #c4b5fd 50%,
    #a78bfa 70%,
    #8b5cf6 100%
  );
  background-size: 300% 100%;
  animation: gradientFlow 4s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
}

/* ===== 支付方式区域 ===== */
.payment-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(82, 75, 216, 0.06);
}

/* 支付方式标题：小字斜体 + 与主标题一致的高级深蓝紫渐变 */
.payment-title {
  position: relative;
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  font-style: italic;
  letter-spacing: 0.5px;
  padding-left: 16px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 45%, #4c1d95 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: gradientFlow 5s ease infinite;
  filter: drop-shadow(0 1px 3px rgba(30, 58, 138, 0.25));
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.payment-method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-method:not(.active) {
  border-color: #e2e8f0;
}

/* 支付方式选中：与套餐卡片一致的高亮紫色流动渐变边框 */
.payment-method.active {
  border-color: transparent;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(
        120deg,
        #8b5cf6 0%,
        #a78bfa 30%,
        #c4b5fd 50%,
        #a78bfa 70%,
        #8b5cf6 100%
      )
      border-box;
  background-size:
    100% 100%,
    300% 100%;
  animation: borderFlow 4s ease-in-out infinite;
}

.payment-method-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-method-left span {
  font-size: 15px;
  color: #2e3440;
}

.method-wechat {
  color: #06c05f;
  font-size: 18px;
}

.method-alipay {
  color: #1677ff;
  font-size: 18px;
}

.check-icon {
  color: #8b5cf6;
  font-size: 18px;
}

/* ===== 购买按钮 ===== */
.buy-btn {
  width: 100%;
  border: none;
  background: linear-gradient(90deg, #ff3956 0%, #ff7735 50%, #ff3956 100%);
  background-size: 200% 100%;
  animation:
    gradientFlow 3s ease infinite,
    glowPulse 2.5s ease-in-out infinite;
  color: #fff;
  font-weight: 500;
  padding: 16px;
  border-radius: 16px;
  font-size: 18px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.buy-btn:hover {
  opacity: 0.92;
}

/* ===== 底部提示 ===== */
.bottom-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 16px;
}

/* ===== 测试账号区域 ===== */
.test-account-section {
  margin-bottom: 24px;
}

.test-account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px dashed #524bd8;
  border-radius: 16px;
  padding: 16px 20px;
}

.test-account-info h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #2e3440;
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-account-info h4 i {
  color: #524bd8;
  font-size: 16px;
}

.test-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  background: #f4f2fe;
  color: #524bd8;
  border: 1px solid #d8d4f8;
  padding: 1px 8px;
  border-radius: 20px;
}

.test-account-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.test-account-actions {
  display: flex;
  gap: 8px;
}

.test-activate-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid #524bd8;
  background: #fff;
  color: #524bd8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.test-activate-btn:hover {
  background: #524bd8;
  color: #fff;
}

/* ===== 支付弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.payment-modal {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  position: relative;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 0;
  color: #64748b;
  font-size: 14px;
}

/* 二维码视图头部：图标 + 支付方式名 */
.pay-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.pay-header i {
  font-size: 26px;
}

.pay-header i.method-wechat {
  color: #07c160;
}

.pay-header i.method-alipay {
  color: #1677ff;
}

.pay-subtitle {
  margin: 8px 0 20px;
  font-size: 13px;
  color: #94a3b8;
}

.pay-plan {
  margin: 0 0 4px;
  font-size: 14px;
  color: #64748b;
}

.pay-price-big {
  margin: 0 0 20px;
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

/* Mock 支付 */
.mock-payment {
  padding: 20px;
  background: #fff7ed;
  border: 1px dashed #ff7735;
  border-radius: 8px;
  margin-bottom: 16px;
}

.mock-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff3956, #ff7735);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.mock-hint {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px;
}

.mock-pay-btn {
  padding: 10px 32px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #ff3956, #ff7735);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 57, 86, 0.25);
}

.mock-pay-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.mock-pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 二维码区域 */
.qr-section {
  margin-bottom: 16px;
}

.qr-section canvas {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.qr-validity {
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
  margin-top: 10px;
}

.payment-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #524bd8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 支付结果 */
.payment-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.payment-result.success {
  background: #ecfdf5;
  color: #059669;
}

.payment-result.fail {
  background: #fef2f2;
  color: #dc2626;
}

.payment-result i {
  font-size: 18px;
}

/* ===== 新人福利悬浮入口（仅免费用户可见） ===== */
.gift-entry {
  position: fixed;
  top: 96px;
  right: 20px;
  z-index: 1500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.gift-entry-icon {
  position: relative;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #524bd8 50%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  box-shadow:
    0 8px 24px rgba(99, 102, 241, 0.35),
    inset 0 -4px 10px rgba(0, 0, 0, 0.14);
  animation: giftEntryPulse 2.5s ease-in-out infinite;
  transition: box-shadow 0.2s ease;
}

/* 圆环装饰：缓慢旋转的虚线光圈 */
.gift-entry-icon::before {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px dashed rgba(139, 92, 246, 0.4);
  animation: giftSpinSlow 16s linear infinite;
}

.gift-entry:hover .gift-entry-icon {
  box-shadow:
    0 12px 32px rgba(99, 102, 241, 0.5),
    inset 0 -4px 10px rgba(0, 0, 0, 0.14);
}

.gift-entry-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  padding: 2px 7px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #ff3956, #ff7735);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.5;
  border: 2px solid #fff;
  box-shadow: 0 3px 8px rgba(255, 119, 53, 0.45);
}

.gift-entry-label {
  font-size: 12px;
  font-weight: 600;
  color: #524bd8;
  background: #fff;
  border: 1px solid rgba(82, 75, 216, 0.18);
  padding: 3px 11px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(82, 75, 216, 0.18);
}

/* ===== 新人福利领取弹窗 ===== */
.gift-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: giftOverlayIn 0.25s ease-out;
}

.gift-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 24px;
  padding: 30px 26px 22px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.3);
  animation: giftModalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gift-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 2;
}

.gift-close-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

/* Hero 区：礼盒 + 光效 */
.gift-modal-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.gift-box-wrap {
  position: relative;
  width: 116px;
  height: 116px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gift-sun {
  position: absolute;
  border-radius: 50%;
}

.gift-sun-1 {
  width: 108px;
  height: 108px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.2) 0%,
    rgba(139, 92, 246, 0) 70%
  );
  animation: giftSunPulse 2.6s ease-in-out infinite;
}

.gift-sun-2 {
  width: 86px;
  height: 86px;
  background: radial-gradient(
    circle,
    rgba(37, 99, 235, 0.18) 0%,
    rgba(37, 99, 235, 0) 70%
  );
  animation: giftSunPulse 2.6s ease-in-out infinite 0.7s;
}

.gift-box {
  position: relative;
  z-index: 1;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #8b5cf6 0%, #524bd8 55%, #2563eb 100%);
  color: #fff;
  font-size: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
  animation: giftBoxFloat 3s ease-in-out infinite;
}

.gift-new-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 4px 16px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #ff3956, #ff7735);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 119, 53, 0.35);
}

.gift-new-badge i {
  font-size: 13px;
}

.gift-modal-title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #8b5cf6 0%, #524bd8 50%, #2563eb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.gift-modal-desc {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

/* 权益列表 */
.gift-benefits {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0 16px;
}

.gift-benefit {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  text-align: left;
}

.gift-benefit > i {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #2563eb);
}

.gift-benefit:nth-child(2) > i {
  background: linear-gradient(135deg, #ff7735, #ff3956);
}

.gift-benefit:nth-child(3) > i {
  background: linear-gradient(135deg, #10b981, #0d9488);
}

.gift-benefit div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.gift-benefit span {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.gift-benefit small {
  font-size: 12px;
  color: #94a3b8;
}

.gift-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 0 20px;
  font-size: 12px;
  color: #94a3b8;
}

.gift-tip i {
  font-size: 13px;
  color: #8b5cf6;
}

.gift-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gift-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(90deg, #8b5cf6 0%, #524bd8 50%, #2563eb 100%);
  background-size: 200% 100%;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s;
}

.gift-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.45);
}

.gift-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gift-btn-ghost {
  padding: 9px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.gift-btn-ghost:hover {
  color: #64748b;
  background: #f1f5f9;
}

/* 新人福利相关动画 */
@keyframes giftEntryPulse {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes giftSpinSlow {
  to {
    transform: rotate(360deg);
  }
}

@keyframes giftOverlayIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes giftModalIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes giftBoxFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes giftSunPulse {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.15);
  }
}

/* 减弱动态效果时停用新人福利装饰动画 */
@media (prefers-reduced-motion: reduce) {
  .gift-entry-icon,
  .gift-entry-icon::before,
  .gift-box,
  .gift-sun-1,
  .gift-sun-2 {
    animation: none;
  }
}

/* ===== 响应式适配 ===== */
@media (max-width: 768px) {
  .gift-entry {
    top: 84px;
    right: 12px;
  }

  .gift-entry-icon {
    width: 54px;
    height: 54px;
    font-size: 24px;
  }

  .plan-cards {
    grid-template-columns: 1fr;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }

  .status-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .test-account-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .test-account-actions {
    flex-wrap: wrap;
  }
}

/* ==========================================================================
   已开通会员视图（100% 还原设计稿：新需求文档/会员权益/已开通会员页面设计.html）
   ========================================================================== */

/* 设计变量（作用于已开通会员视图作用域） */
.membership-page.member-mode {
  --primary: #6d28d9;
  --primary-light: #4f46e5;
  --primary-bg: #eef2ff;
  --bg: #ffffff;
  --bg-subtle: #f9fafb;
  --text: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border: #e5e7eb;
  --success: #10b981;
  --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 4px 12px rgba(109, 40, 217, 0.12);
}

/* 已开通会员视图：页面背景切换为浅灰（设计稿 body 背景 #F9FAFB） */
.membership-page.member-mode {
  background: #f9fafb;
  padding: 32px 16px;
}

@media (min-width: 640px) {
  .membership-page.member-mode {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (min-width: 1024px) {
  .membership-page.member-mode {
    padding-left: 32px;
    padding-right: 32px;
  }
}

/* 容器：max-w 放宽至 1280px，减少两侧留白 */
.member-center {
  max-width: 1280px;
  margin: 0 auto;
}

/* ===== 动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mc-animate {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

.mc-delay-1 {
  animation-delay: 0.1s;
}
.mc-delay-2 {
  animation-delay: 0.2s;
}
.mc-delay-3 {
  animation-delay: 0.3s;
}
.mc-delay-4 {
  animation-delay: 0.4s;
}
.mc-delay-5 {
  animation-delay: 0.5s;
}
.mc-delay-6 {
  animation-delay: 0.6s;
}

/* 卡片悬停：上浮 + 紫色阴影 */
.mc-card-hover {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.mc-card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

/* 按钮按压反馈 */
.mc-reminder-btn:active,
.mc-banner-btn:active,
.mc-action-btn:active {
  transform: scale(0.97);
}

/* ===== Header Section ===== */
.mc-header {
  text-align: center;
  margin-bottom: 24px;
}

.mc-pro-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 auto 16px;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.mc-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

@media (min-width: 640px) {
  .mc-title {
    font-size: 28px;
  }
}

.mc-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}

/* ===== User Info Card ===== */
.mc-user-card {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg);
  box-shadow: var(--card-shadow);
}

.mc-user-card-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .mc-user-card-inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.mc-user-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mc-avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.mc-user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.mc-user-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-muted);
}

.mc-user-right {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--bg-subtle);
}

.mc-user-right-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mc-status-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--success);
}

.mc-status-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.mc-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: var(--primary-bg);
  color: var(--primary);
}

.mc-user-divider {
  display: none;
  width: 1px;
  height: 20px;
  background: var(--border);
}

@media (min-width: 640px) {
  .mc-user-divider {
    display: block;
  }
}

.mc-user-expiry {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* ===== Expiry Reminder ===== */
.mc-reminder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid #ede9fe;
  background: var(--primary-bg);
}

.mc-reminder-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mc-reminder-text {
  font-size: 14px;
  color: var(--text);
}

.mc-reminder-days {
  font-weight: 700;
  color: var(--primary);
}

.mc-reminder-btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: opacity 0.2s;
}

.mc-reminder-btn:hover {
  opacity: 0.9;
}

/* ===== 区块通用 ===== */
.mc-section {
  margin-bottom: 24px;
}

.mc-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

/* ===== Member Benefits ===== */
.mc-benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .mc-benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .mc-benefits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.mc-benefit-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
}

.mc-benefit-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  background: var(--primary-bg);
}

.mc-benefit-body {
  min-width: 0;
  flex: 1;
}

.mc-benefit-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mc-benefit-title span {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.mc-benefit-desc {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.625;
  color: var(--text-secondary);
}

/* ===== Settlement Price Prediction Banner ===== */
.mc-banner {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: #fff;
  box-shadow: var(--card-shadow);
}

@media (min-width: 640px) {
  .mc-banner {
    flex-direction: row;
  }
}

.mc-banner-left {
  flex: 1;
  padding: 24px;
}

@media (min-width: 640px) {
  .mc-banner-left {
    padding: 28px;
  }
}

.mc-banner-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mc-banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.mc-banner-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text);
}

@media (min-width: 640px) {
  .mc-banner-title {
    font-size: 24px;
  }
}

.mc-banner-desc {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.625;
  color: var(--text-secondary);
}

.mc-banner-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.mc-banner-feature {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--bg-subtle);
}

.mc-banner-feature-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-bg);
}

.mc-banner-feature-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.mc-banner-feature-desc {
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 1.625;
  color: var(--text-secondary);
}

.mc-banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: opacity 0.2s;
}

.mc-banner-btn:hover {
  opacity: 0.9;
}

/* 右侧视觉区：默认隐藏，sm 及以上显示 */
.mc-banner-visual {
  display: none;
  width: 256px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f5f3ff, #eef2ff);
}

@media (min-width: 640px) {
  .mc-banner-visual {
    display: flex;
  }
}

/* ===== Platform Introduction ===== */
.mc-intro-card {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: #fff;
  box-shadow: var(--card-shadow);
}

.mc-intro-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  line-height: 1.625;
  color: var(--text-secondary);
}

.mc-intro-body p {
  margin: 0;
}

.mc-intro-strong {
  font-weight: 500;
  color: var(--text);
}

.mc-intro-accent {
  font-weight: 500;
  color: var(--primary);
}

.mc-intro-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.mc-intro-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: var(--primary-bg);
  color: var(--primary);
}

/* ===== Quick Actions ===== */
.mc-actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .mc-actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.mc-action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.mc-action-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 20px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.mc-action-icon-purple {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.mc-action-icon-blue {
  background: linear-gradient(135deg, #6366f1, #3b82f6);
}

.mc-action-icon-green {
  background: linear-gradient(135deg, #10b981, #14b8a6);
}

.mc-action-body {
  min-width: 0;
  flex: 1;
}

.mc-action-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.mc-action-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-secondary);
}

.mc-action-arrow {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.mc-action-btn:hover .mc-action-arrow {
  transform: translateX(2px);
}

/* ===== Footer Links ===== */
.mc-footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.mc-footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.mc-footer-link:hover {
  color: #6d28d9;
}
</style>
