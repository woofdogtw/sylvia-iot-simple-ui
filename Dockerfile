FROM nginx:1.26.1-alpine-slim
ADD dist/spa /usr/share/nginx/html
