FROM node:16-alpine
WORKDIR /usr/app
COPY . /usr/app
RUN npm install /usr/app
