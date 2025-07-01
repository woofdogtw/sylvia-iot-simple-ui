FROM nginx:1.29.0-alpine-slim
ADD dist/spa /usr/share/nginx/html
