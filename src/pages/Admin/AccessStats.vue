<template>
  <div class="admin-dashboard">
    <!-- 顶部概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6" v-for="item in overviewItems" :key="item.label">
        <el-card shadow="hover" class="overview-card">
          <div class="card-content">
            <div class="card-label">{{ item.label }}</div>
            <div class="card-value">{{ item.value }}</div>
            <div class="card-trend" v-if="item.trend !== undefined">
              <el-tag :type="item.trend >= 0 ? 'success' : 'danger'" size="small">
                {{ item.trend >= 0 ? '+' : '' }}{{ (item.trend * 100).toFixed(1) }}%
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中部模块分析区域 -->
    <el-card shadow="never" class="module-analysis">
      <template #header>
        <div class="card-header">
          <span>模块访问分析</span>
          <div class="header-controls">
            <el-radio-group v-model="timeFilter" size="small" @change="handleTimeFilterChange">
              <el-radio-button label="this-year">本年</el-radio-button>
              <el-radio-button label="this-month">本月</el-radio-button>
              <el-radio-button label="last-week">近一周</el-radio-button>
              <el-radio-button label="last-3-days">近三天</el-radio-button>
            </el-radio-group>
            <span class="date-range-text">{{ dateRangeText }}</span>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-table :data="moduleTableData" border stripe size="small" v-loading="moduleLoading">
            <el-table-column prop="moduleName" label="模块" />
            <el-table-column prop="visits" label="访问量" sortable />
            <el-table-column prop="percentage" label="占比">
              <template #default="{ row }">
                {{ (row.percentage * 100).toFixed(2) }}%
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="12">
          <div ref="trendChartRef" style="width: 100%; height: 300px;"></div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 文件下载管理区域 -->
    <el-card shadow="never" class="file-management">
      <template #header>
        <div class="card-header">
          <span>用户上传文件记录</span>
          <div class="header-controls">
            <el-select v-model="fileModuleFilter" placeholder="全部模块" size="small" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="负荷预测" value="load" />
              <el-option label="光伏发电预测" value="pv" />
              <el-option label="光储定容" value="light" />
            </el-select>
            <el-date-picker
              v-model="fileDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              :clearable="false"
              style="width: 240px; margin-right: 10px;"
            />
            <el-input v-model="fileSearchKeyword" placeholder="用户姓名/电话" size="small" clearable style="width: 200px; margin-right: 10px;" />
            <el-button type="primary" size="small" @click="handleFileSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="fileTableData" border stripe size="small" v-loading="fileLoading">
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag :type="row.module === 'load' ? '' : row.module === 'pv' ? 'success' : 'warning'">
              {{ row.moduleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="160" />
        <el-table-column prop="userName" label="用户姓名" width="120" />
        <el-table-column prop="userPhone" label="联系电话" width="120" />
        <el-table-column prop="fileName" label="文件名" show-overflow-tooltip />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="filePage"
        v-model:page-size="filePageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="fileTotal"
        @size-change="handleFileSizeChange"
        @current-change="handleFileCurrentChange"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 底部统计区 -->
    <el-row :gutter="20" class="bottom-stats">
      <el-col :span="12">
        <el-card shadow="never">
          <div class="card-title">模块访问排行榜</div>
          <el-table :data="rankingData" border stripe size="small">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="moduleName" label="模块" />
            <el-table-column prop="visits" label="访问量" sortable />
            <el-table-column prop="percentage" label="占比">
              <template #default="{ row }">
                {{ (row.percentage * 100).toFixed(2) }}%
              </template>
            </el-table-column>
            <el-table-column label="趋势" width="80">
              <template #default="{ row }">
                <el-tag :type="row.trend >= 0 ? 'success' : 'danger'" size="small">
                  {{ row.trend >= 0 ? '+' : '' }}{{ (row.trend * 100).toFixed(1) }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div class="card-title">访问量变化明细</div>
          <el-table :data="changeDetailData" border stripe size="small">
            <el-table-column prop="moduleName" label="模块" />
            <el-table-column prop="currentVisits" label="当前访问量" sortable />
            <el-table-column prop="previousVisits" label="上一周期" />
            <el-table-column prop="changeValue" label="增减值">
              <template #default="{ row }">
                <span :class="row.changeValue >= 0 ? 'text-success' : 'text-danger'">
                  {{ row.changeValue >= 0 ? '+' : '' }}{{ row.changeValue }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="changePercent" label="增减百分比">
              <template #default="{ row }">
                <el-tag :type="row.changePercent >= 0 ? 'success' : 'danger'" size="small">
                  {{ row.changePercent >= 0 ? '+' : '' }}{{ (row.changePercent * 100).toFixed(1) }}%
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户信息区域 -->
    <el-card shadow="never" class="user-management" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>已注册用户</span>
          <div class="header-controls">
            <el-input v-model="userSearchKeyword" placeholder="姓名/电话/公司" size="small" clearable style="width: 240px; margin-right: 10px;" @keyup.enter="handleUserSearch" />
            <el-button type="primary" size="small" @click="handleUserSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="userTableData" border stripe size="small" v-loading="userLoading">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="company" label="公司" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="注册时间" width="180" />
      </el-table>

      <el-pagination
        v-model:current-page="userPage"
        v-model:page-size="userPageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userTotal"
        @size-change="handleUserSizeChange"
        @current-change="handleUserCurrentChange"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear } from 'date-fns'

// -------------------- 状态定义 --------------------
const overviewItems = ref([
  { label: '总访问量', value: 0, trend: undefined },
  { label: '今日访问量', value: 0, trend: undefined },
  { label: '昨日访问量', value: 0, trend: undefined },
  { label: '日环比', value: 0, trend: undefined }
])

const timeFilter = ref('this-year')
const dateRange = ref([startOfYear(new Date()), new Date()]) // 默认本年
const moduleLoading = ref(false)
const moduleTableData = ref([])
const trendChartRef = ref(null)
let trendChart = null

// 计算日期范围文本
const dateRangeText = computed(() => {
  if (!dateRange.value || dateRange.value.length < 2) return ''
  return `${format(dateRange.value[0], 'yyyy-MM-dd')}～${format(dateRange.value[1], 'yyyy-MM-dd')}`
})

// 文件管理
const fileModuleFilter = ref('')
const fileDateRange = ref([new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]) // 默认最近1年
const fileSearchKeyword = ref('')
const fileLoading = ref(false)
const fileTableData = ref([])
const filePage = ref(1)
const filePageSize = ref(10)
const fileTotal = ref(0)

// 底部统计
const rankingData = ref([])
const changeDetailData = ref([])

// 用户管理
const userSearchKeyword = ref('')
const userLoading = ref(false)
const userTableData = ref([])
const userPage = ref(1)
const userPageSize = ref(10)
const userTotal = ref(0)

// -------------------- 真实API调用 --------------------
const fetchOverview = async () => {
  const response = await request.get('/api/admin/overview')
  return response.data.data
}

const fetchModuleTrend = async (start, end) => {
  const params = {
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  }
  
  const response = await request.get('/api/admin/module-trend', { params })
  return response.data.data
}

const fetchUploads = async (params) => {
  const queryParams = {
    page: params.page,
    pageSize: params.pageSize
  }
  
  if (params.module) queryParams.module = params.module
  if (params.keyword) queryParams.keyword = params.keyword
  if (params.startDate) queryParams.start_date = format(params.startDate, 'yyyy-MM-dd')
  if (params.endDate) queryParams.end_date = format(params.endDate, 'yyyy-MM-dd')
  
  const response = await request.get('/api/admin/uploads', { params: queryParams })
  return response.data.data
}

const fetchRanking = async (start, end) => {
  const response = await request.get('/api/admin/module-ranking', {
    params: { 
      start_date: format(start, 'yyyy-MM-dd'),
      end_date: format(end, 'yyyy-MM-dd')
    }
  })
  return response.data.data
}

const fetchUsers = async (params) => {
  const queryParams = {
    page: params.page,
    pageSize: params.pageSize
  }
  
  if (params.keyword) queryParams.keyword = params.keyword
  
  const response = await request.get('/api/admin/users', { params: queryParams })
  return response.data.data
}

// -------------------- 数据加载函数 --------------------
const loadOverview = async () => {
  const data = await fetchOverview()
  overviewItems.value[0].value = data.totalVisits.toLocaleString()
  overviewItems.value[1].value = data.todayVisits.toLocaleString()
  overviewItems.value[2].value = data.yesterdayVisits.toLocaleString()
  overviewItems.value[3].value = (data.dailyGrowth * 100).toFixed(1) + '%'
  overviewItems.value[3].trend = data.dailyGrowth
}

const loadModuleTrend = async () => {
  moduleLoading.value = true
  try {
    const [start, end] = dateRange.value
    console.log('请求模块趋势数据:', { start, end })
    const data = await fetchModuleTrend(start, end)
    console.log('接收到的模块趋势数据:', data)
    
    // 计算表格数据：按模块聚合总访问量
    const moduleTotals = {}
    data.forEach(item => {
      Object.entries(item.modules).forEach(([mod, count]) => {
        moduleTotals[mod] = (moduleTotals[mod] || 0) + count
      })
    })
    console.log('聚合后的模块数据:', moduleTotals)
    
    const total = Object.values(moduleTotals).reduce((a, b) => a + b, 0)
    const moduleNames = { 
      load: '负荷预测', 
      pv: '光伏发电预测', 
      light: '光储定容', 
      'price-analysis': '节点电价分析', 
      products: '产品展示', 
      vpp: '虚拟电厂', 
      health: '健康页面', 
      admin: '管理后台' 
    }
    moduleTableData.value = Object.entries(moduleTotals).map(([mod, visits]) => ({
      module: mod,
      moduleName: moduleNames[mod],
      visits,
      percentage: visits / total
    }))
    console.log('最终表格数据:', moduleTableData.value)

    // 更新折线图
    updateTrendChart(data)
  } finally {
    moduleLoading.value = false
  }
}

const updateTrendChart = (trendData) => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  const dates = trendData.map(d => d.date)
  const series = []
  const modules = ['load', 'pv', 'light']
  const moduleNames = { load: '负荷预测', pv: '光伏发电预测', light: '光储定容' }
  modules.forEach(mod => {
    series.push({
      name: moduleNames[mod],
      type: 'line',
      data: trendData.map(d => d.modules[mod])
    })
  })
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['负荷预测', '光伏预测', '光储优化'] },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series
  })
}

const loadUploads = async () => {
  fileLoading.value = true
  try {
    const params = {
      module: fileModuleFilter.value,
      startDate: fileDateRange.value?.[0],
      endDate: fileDateRange.value?.[1],
      keyword: fileSearchKeyword.value,
      page: filePage.value,
      pageSize: filePageSize.value
    }
    const { total, list } = await fetchUploads(params)
    fileTotal.value = total
    fileTableData.value = list
  } finally {
    fileLoading.value = false
  }
}

const loadRanking = async () => {
  const [start, end] = dateRange.value
  console.log('请求排行榜数据，日期范围:', { start, end })
  const { ranking, changeDetail } = await fetchRanking(start, end)
  console.log('接收到的排行榜数据:', { ranking, changeDetail })
  rankingData.value = ranking
  changeDetailData.value = changeDetail
}

const loadUsers = async () => {
  userLoading.value = true
  try {
    const params = {
      keyword: userSearchKeyword.value,
      page: userPage.value,
      pageSize: userPageSize.value
    }
    const { total, list } = await fetchUsers(params)
    userTotal.value = total
    userTableData.value = list
  } finally {
    userLoading.value = false
  }
}

// 计算日期范围
const calculateDateRange = (filter) => {
  const today = new Date()
  switch (filter) {
    case 'this-year':
      return [startOfYear(today), today]
    case 'this-month':
      return [startOfMonth(today), today]
    case 'last-week':
      return [subDays(today, 7), today]
    case 'last-3-days':
      return [subDays(today, 3), today]
    default:
      return [startOfYear(today), today]
  }
}

// -------------------- 事件处理 --------------------
const handleTimeFilterChange = () => {
  dateRange.value = calculateDateRange(timeFilter.value)
  loadModuleTrend()
  loadRanking()
}

const handleFileSearch = () => {
  filePage.value = 1
  loadUploads()
}

const handleFileSizeChange = (size) => {
  filePageSize.value = size
  loadUploads()
}

const handleFileCurrentChange = (page) => {
  filePage.value = page
  loadUploads()
}

const handleUserSearch = () => {
  userPage.value = 1
  loadUsers()
}

const handleUserSizeChange = (size) => {
  userPageSize.value = size
  loadUsers()
}

const handleUserCurrentChange = (page) => {
  userPage.value = page
  loadUsers()
}

const handleDownload = async (row) => {
  try {
    // 调用真实的下载接口
    const response = await request.get(`/api/admin/download/${row.id}`, {
      responseType: 'blob'
    })
    
    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition']
    let filename = row.fileName
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?;/)
      if (match) {
        filename = match[1]
      }
    }
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    
    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载失败: ' + (error.response?.data?.message || error.message))
  }
}

// -------------------- 监听与初始化 --------------------
onMounted(() => {
  loadOverview()
  loadModuleTrend()
  loadUploads()
  loadRanking()
  loadUsers()
})

// 窗口大小变化时自适应图表
window.addEventListener('resize', () => {
  trendChart?.resize()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .overview-cards {
    margin-bottom: 20px;

    .overview-card {
      height: 100%;
      border-radius: 12px;
      border: none;
      transition: all 0.3s ease;
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }

      .card-content {
        padding: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 120px;
        .card-label {
          font-size: 14px;
          color: #909399;
        }
        .card-value {
          font-size: 28px;
          font-weight: bold;
          margin: 8px 0;
        }
        .card-trend {
          .el-tag {
            font-weight: normal;
          }
        }
      }
    }
  }

  .module-analysis {
    margin-bottom: 20px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .file-management {
    margin-bottom: 20px;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .bottom-stats {
    .el-card {
      height: 100%;
      .card-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 16px;
      }
    }
  }

  .user-management {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.date-range-text {
  margin-left: 16px;
  color: #606266;
  font-size: 14px;
}

.text-success {
  color: #67c23a;
}
.text-danger {
  color: #f56c6c;
}
</style>