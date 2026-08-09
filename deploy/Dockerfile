# =============================================================
# 前端 Dockerfile（Vite + Vue3 -> Nginx 静态托管）
#
# 测试/正式环境优雅切换：
#   Vite 会把 VITE_COMPANY 打进产物，因此必须在【构建时】注入：
#     测试: docker build -f deploy/Dockerfile --build-arg VITE_COMPANY=test  -t isage/frontend:test .
#     正式: docker build -f deploy/Dockerfile --build-arg VITE_COMPANY=pilot -t isage/frontend:latest .
#   （对应 src/utils/request.js 中的 baseURLMap：test / pilot / trina / local）
#
# 本地开发不受影响：仍然使用本地 .env + npm run dev（Vite HMR），
#   或 make dev 用 --target dev 跑热重载容器。
# =============================================================

# ---------- 阶段一：构建产物 ----------
FROM node:20.19.0-alpine AS build

WORKDIR /app

# 构建环境参数：pilot=正式(默认) / test=测试 / trina=三方 / local=本地
ARG VITE_COMPANY=pilot
ENV VITE_COMPANY=${VITE_COMPANY}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- 阶段二：本地开发（热重载，供 docker compose dev 使用） ----------
FROM node:20.19.0-alpine AS dev

WORKDIR /app
ENV VITE_COMPANY=local

COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- 阶段三：运行（Nginx 托管，默认目标） ----------
FROM nginx:1.27-alpine AS prod

# 后端网关地址：运行时通过环境变量注入（默认同 compose 网络的后端服务）。
# 测试/正式环境只需在 docker run / compose 里改该变量，无需重新构建镜像。
ENV BACKEND_UPSTREAM=http://backend:3001

# 官方 nginx 镜像的模板机制：/etc/nginx/templates/*.template 启动时经 envsubst 渲染
# 注意: COPY 源路径相对构建上下文(项目根)，故为 deploy/nginx.conf
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
