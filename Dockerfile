FROM node:alpine
ENV CHOKIDAR_USEPOLLING=true
RUN apk update && apk add git