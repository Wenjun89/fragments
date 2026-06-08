FROM node:22.12.0

LABEL maintainer="Wenjun Wei <michellewei0101@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

EXPOSE 8080
CMD ["npm", "start"]
