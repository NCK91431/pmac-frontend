# =============================================================
# 前端(energy-frontend) 构建/推送/宝塔部署 Makefile
#
# 环境区分（优雅切换）：
#   Vite 会把 VITE_COMPANY 打进产物，因此测试/正式必须在【构建时】注入：
#     测试: make build-test  -> --build-arg VITE_COMPANY=test
#     正式: make build-prod  -> --build-arg VITE_COMPANY=pilot
#   （对应 src/utils/request.js 的 baseURLMap）
#
# 本地开发不受影响：直接 npm run dev（Vite HMR），
#   或 make dev（容器化热重载，端口 5173）。
#
# 常用命令：
#   make help          查看全部命令
#   make login         登录镜像仓库
#   make build-test    构建测试镜像 isage/frontend:test
#   make build-prod    构建正式镜像 isage/frontend:latest
#   make push-test     构建+推送测试镜像
#   make push-prod     构建+推送正式镜像
#   make deploy-test   生成/查看宝塔测试部署脚本 deploy/baota.sh test
#   make deploy-prod   生成/查看宝塔正式部署脚本 deploy/baota.sh prod
#   make dev           本地开发容器（Vite HMR 5173）
#   make dev-down      停止开发容器
# =============================================================

SHELL := /bin/bash

# ---------- 镜像仓库配置（isage/frontend） ----------
REGISTRY       := crpi-l6epzovsig699rg9.cn-shenzhen.personal.cr.aliyuncs.com
NAMESPACE      := isage
IMAGE          := $(REGISTRY)/$(NAMESPACE)/frontend
REGISTRY_USER  := skdkds

# 镜像 tag：日期 + git commit（如 20260809-a1b2c3d4），区分构建内容
DATE       := $(shell date +%Y%m%d)
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "nogit")

# 固定 tag：供宝塔部署脚本直接拉取最新，也便于指定日期tag回滚
TAG_TEST := test
TAG_PROD := latest

.PHONY: help login \
        build-test build-prod \
        push-test push-prod \
        deploy-test deploy-prod \
        dev dev-down

help:
	@echo "可用命令："
	@echo "  make login         登录镜像仓库(交互式输入密码)"
	@echo "  make build-test    构建测试镜像 $(IMAGE):test-$(DATE)-$(GIT_COMMIT)"
	@echo "  make build-prod    构建正式镜像 $(IMAGE):latest-$(DATE)-$(GIT_COMMIT)"
	@echo "  make push-test     构建+推送测试镜像"
	@echo "  make push-prod     构建+推送正式镜像"
	@echo "  make deploy-test   查看宝塔测试部署命令(脚本 deploy/baota.sh test)"
	@echo "  make deploy-prod   查看宝塔正式部署命令(脚本 deploy/baota.sh prod)"
	@echo "  make dev           本地开发容器(Vite HMR 5173)"
	@echo "  make dev-down      停止开发容器"

# ---------- 登录 ----------
login:
	docker login $(REGISTRY)

# ---------- 构建（主 tag = 日期-commit，另打固定 tag 供部署/回滚） ----------
build-test:
	docker build -f deploy/Dockerfile --build-arg VITE_COMPANY=test -t $(IMAGE):test-$(DATE)-$(GIT_COMMIT) .
	docker tag $(IMAGE):test-$(DATE)-$(GIT_COMMIT) $(IMAGE):$(TAG_TEST)

build-prod:
	docker build -f deploy/Dockerfile --build-arg VITE_COMPANY=pilot -t $(IMAGE):latest-$(DATE)-$(GIT_COMMIT) .
	docker tag $(IMAGE):latest-$(DATE)-$(GIT_COMMIT) $(IMAGE):$(TAG_PROD)

# ---------- 推送 ----------
push-test: build-test
	docker push $(IMAGE):test-$(DATE)-$(GIT_COMMIT)
	docker push $(IMAGE):$(TAG_TEST)

push-prod: build-prod
	docker push $(IMAGE):latest-$(DATE)-$(GIT_COMMIT)
	docker push $(IMAGE):$(TAG_PROD)

# ---------- 本地开发（容器化热重载） ----------
dev:
	docker build -f deploy/Dockerfile --target dev -t $(IMAGE):dev .
	-docker rm -f energy-frontend-dev 2>/dev/null
	docker run -d --name energy-frontend-dev \
		-p 5173:5173 \
		-v $(CURDIR):/app \
		-v /app/node_modules \
		$(IMAGE):dev
	@echo "前端开发容器已启动: http://localhost:5173"

dev-down:
	-docker rm -f energy-frontend-dev 2>/dev/null

# ---------- 宝塔部署（deploy/baota.sh 支持 test/prod 参数） ----------
# 部署方式：脚本需在宝塔服务器上执行——
#   方式1: 上传 deploy/baota.sh 到服务器，执行 bash baota.sh test
#   方式2: 粘贴到 宝塔面板 → 计划任务 → Shell脚本（可设定期自动更新）
# 说明: 前端 nginx 通过 BACKEND_UPSTREAM 反代后端，
#       后端容器端口映射见后端项目 deploy/baota.sh。
deploy-test:
	@echo "宝塔测试部署命令："
	@echo "  bash deploy/baota.sh test"
	@echo ""
	@echo "（脚本内容如下，也可直接粘贴到宝塔计划任务执行）"
	@cat deploy/baota.sh | sed 's/^/  /'

deploy-prod:
	@echo "宝塔正式部署命令："
	@echo "  bash deploy/baota.sh prod"
	@echo ""
	@echo "（脚本内容如下，也可直接粘贴到宝塔计划任务执行）"
	@cat deploy/baota.sh | sed 's/^/  /'
