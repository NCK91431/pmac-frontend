<template>
  <div class="header-container">
    <div class="header-content">
      <div class="logo-section">
        <i class="fas fa-bolt"></i>
		<img src="https://i.postimg.cc/7ZfS8FNx/pilot-logo.png" alt="">
        <div>
          <h1>智慧能源工具</h1>
          <p>精准预测每一度 智能互联每一端</p>
        </div>
      </div>
      
      <el-menu 
        mode="horizontal" 
        background-color="transparent" 
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="1" @click="gotoPage('home')">首页</el-menu-item>
        <el-menu-item index="2" @click="gotoPage('fuhe')">示例数据</el-menu-item>
        <el-menu-item index="3" @click="gotoPage('guangfu')">联系我们</el-menu-item>
        <el-menu-item index="4" @click="gotoPage('chuneng')">储能预测</el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const gotoPage = (page) => {
  switch (page) {
	case 'home':
	  router.push('/');
	  break;
	case 'fuhe':
	  router.push('/loadpre');
	  break;
	case 'guangfu':
	  router.push('/pvpre');
	  break;
	case 'chuneng':
	  router.push('/chunengpre');
	  break;
	default:
	  router.push('/');
	  break;
  }
};
</script>

<style lang="scss" scoped>
.header-container {
  background: linear-gradient(135deg, #2c6fbb, #34a4dc);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .logo-section {
      display: flex;
      align-items: center;
	  img{
		margin-right: 10px;
	  }
      
      i {
        font-size: 2.5rem;
        margin-right: 15px;
        color: #ffd04b;
      }
      
      h1 {
        font-size: 1.8rem;
        margin: 0;
      }
      
      p {
        margin: 5px 0 0;
        opacity: 0.85;
        font-size: 0.95rem;
      }
    }
  }
  
  .el-menu {
    border: none;
  }
  
  .el-menu--horizontal {
    .el-menu-item {
      height: 50px;
      line-height: 50px;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0 10px;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.15) !important;
      }
      
      &.is-active {
        background-color: rgba(255, 208, 75, 0.2) !important;
      }
    }
  }
}
</style>