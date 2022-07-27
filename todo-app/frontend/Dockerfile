FROM node:alpine AS build-stage

WORKDIR /usr/src/app
COPY . .
ENV BACKEND_URL='/api'
RUN npm ci
RUN npm run build

FROM nginx:1.20-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html