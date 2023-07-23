FROM nginx:1.25.1-alpine-slim
ADD dist/spa /usr/share/nginx/html
