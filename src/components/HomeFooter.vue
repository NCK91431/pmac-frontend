<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-column">
          <h3>联系我们</h3>
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div>
                <strong>地址</strong>
                <p>广东省珠海市高新区科技创新八路派诺科技园</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Iphone /></el-icon>
              </div>
              <div>
                <strong>电话</strong>
                <p>+86 10 8888 7777</p>
              </div>
            </div>
          </div>
        </div>
        
		<div class="footer-column">
          <h3>关注派诺</h3>
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Message /></el-icon>
              </div>
              <div>
                <strong>公众号</strong>
                <p>扫描关注公众号&nbsp;获取最新产品资讯</p>
              </div>
            </div>
              <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Message /></el-icon>
              </div>
              <div>
                <strong>邮箱</strong>
                <p>contact@energysolutions.com</p>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-column">
          <h3>服务时间</h3>
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Location /></el-icon>
              </div>
              <div>
                <strong>地址</strong>
                <p>周一至周五：9:00 - 18:00 周六周日及法定节假日休息</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">
                <el-icon><Iphone /></el-icon>
              </div>
              <div>
                <strong>客服热线</strong>
                <p>+86 10 8888 7777</p>
              </div>
            </div>
         
          </div>
        </div>
        <!-- <div class="footer-column">
          <h3>订阅更新</h3>
          <p>订阅我们的新闻通讯，获取最新的行业洞察、产品更新和技术白皮书。</p>
          <div class="subscribe-form">
            <input type="email" placeholder="请输入您的邮箱">
            <button>订阅</button>
          </div>
        </div> -->
      </div>
      
      <div class="copyright">
        <div>© 2025 珠海派诺科技股份有限公司 版权所有 | 京ICP备12345678号</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Location, Iphone, Message } from '@element-plus/icons-vue';
</script>

<style lang="scss" scoped>
.footer {
  background: #2c3e50;
  color: #e2e8f0;
  padding: 35px 0 15px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
}

.footer-column {
  h3 {
    font-size: 16px;
    margin-bottom: 1.5rem;
    color: white;
    position: relative;
    padding-bottom: 0.8rem;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 50px;
      height: 3px;
      background: #3b82f6;
      border-radius: 3px;
    }
  }
  
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  strong,p{
	font-size:14px;
  }
}

.contact-icon {
  background: rgba(59, 130, 246, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .el-icon {
    color: #3b82f6;
    font-size: 1.2rem;
  }
}

.subscribe-form {
  display: flex;
  margin-top: 1.5rem;
  
  input {
    flex: 1;
    padding: 0.8rem 1rem;
    border: none;
    border-radius: 6px 0 0 6px;
    font-size: 1rem;
  }
  
  button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0 1.5rem;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    transition: background 0.3s;
    
    &:hover {
      background: #2563eb;
    }
  }
}

.copyright {
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 0.9rem;
  margin-top:15px;
}

// @media (max-width: 768px) {
//   .footer-grid {
//     gap: 2rem;
//   }
  
//   .footer-column {
//     h3 {
//       font-size: 1.3rem;
//     }
//   }
// }
</style>