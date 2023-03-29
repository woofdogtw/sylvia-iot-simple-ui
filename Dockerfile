FROM nginx:1.23.3-alpine-slim
ADD dist/spa /usr/share/nginx/html
