FROM nginx:1.27.1-alpine-slim
ADD dist/spa /usr/share/nginx/html
