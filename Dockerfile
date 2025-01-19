FROM nginx:1.27.3-alpine-slim
ADD dist/spa /usr/share/nginx/html
