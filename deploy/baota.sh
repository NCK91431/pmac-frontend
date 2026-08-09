#!/bin/bash
# =============================================================
# 宝塔一键部署脚本 - 前端(energy-frontend)
# 用法: bash baota.sh [test|prod]
#   test: 拉取 isage/frontend:test  映射宿主机 8080 -> 容器 80
#   prod: 拉取 isage/frontend:latest 映射宿主机 8081 -> 容器 80
#
# 执行方式（在宝塔服务器上）：
#   方式1: 上传本脚本后执行  bash baota.sh test
#   方式2: 粘贴到 宝塔面板 → 计划任务 → Shell脚本（可设每日自动更新）
#
# 部署架构：
#   前端容器(nginx)  -> 反代 BACKEND_UPSTREAM -> 后端容器(宿主机映射端口)
#   宝塔「网站」新增站点/反向代理 -> 目标 URL http://127.0.0.1:8080 接管域名和SSL
# =============================================================
set -e

# ---------- 配置（按需修改） ----------
REGISTRY=crpi-l6epzovsig699rg9.cn-shenzhen.personal.cr.aliyuncs.com
REGISTRY_USER=skdkds
# 密码从环境变量 REGISTRY_PWD 读取（避免明文入库），未设置则交互输入
if [ -z "$REGISTRY_PWD" ]; then
    read -rsp "请输入镜像仓库密码: " REGISTRY_PWD
    echo
fi
NAMESPACE=isage
IMAGE=$REGISTRY/$NAMESPACE/frontend

# 参数: test / prod
ENV=${1:-test}
case "$ENV" in
  test)
    TAG=test
    FRONTEND_PORT=8080
    BACKEND_PORT=3001
    CONTAINER=energy-frontend-test
    ;;
  prod)
    TAG=latest
    FRONTEND_PORT=8081
    BACKEND_PORT=3002
    CONTAINER=energy-frontend-prod
    ;;
  *)
    echo "用法: bash baota.sh [test|prod]"
    exit 1
    ;;
esac

# 容器内访问宿主机后端（后端容器映射到宿主机 BACKEND_PORT 端口）
BACKEND_UPSTREAM=http://host.docker.internal:$BACKEND_PORT

echo "==> 登录镜像仓库"
docker login --username=$REGISTRY_USER --password=$REGISTRY_PWD $REGISTRY

echo "==> 拉取镜像 $IMAGE:$TAG"
docker pull $IMAGE:$TAG

echo "==> 部署前端容器 $CONTAINER (宿主机端口 $FRONTEND_PORT)"
docker rm -f $CONTAINER 2>/dev/null || true
docker run -d --name $CONTAINER \
    --restart always \
    --add-host host.docker.internal:host-gateway \
    -p $FRONTEND_PORT:80 \
    -e BACKEND_UPSTREAM=$BACKEND_UPSTREAM \
    $IMAGE:$TAG

echo "==> 部署完成"
echo "前端容器: $CONTAINER"
echo "宝塔站点反向代理目标 URL: http://127.0.0.1:$FRONTEND_PORT"
echo "后端需同步部署: 见后端项目 deploy/baota.sh $ENV（容器端口 $BACKEND_PORT）"
