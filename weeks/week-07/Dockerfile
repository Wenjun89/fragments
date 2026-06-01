# Dockerfile for https://github.com/Seneca-ICTOER/Intro2C

# Stage 0: Install alpine Linux + node + yarn + dependencies
FROM node:18-alpine3.17@sha256:a136ed7b0df71082cdb171f36d640ea3b392a5c70401c642326acee767b8c540 AS dependencies

ENV NODE_ENV=production

WORKDIR /app

# copy dep files and install the production deps
COPY package.json yarn.lock ./
RUN yarn

#######################################################################

# Stage 1: use dependencies to build the site
FROM node:18-alpine3.17@sha256:a136ed7b0df71082cdb171f36d640ea3b392a5c70401c642326acee767b8c540 AS builder

WORKDIR /app
# Copy cached dependencies from previous stage so we don't have to download
COPY --from=dependencies /app /app
# Copy source code into the image
COPY . .
# Build the site to build/
RUN yarn build

########################################################################

# Stage 2: nginx web server to host the built site
FROM nginx:stable-alpine@sha256:2366ede62d2e26a20f7ce7d0294694fe52b166107fd346894e4658dfb5273f9c AS deploy

# Put our build/ into /usr/share/nginx/html/ and host static files
COPY --from=builder /app/build/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail localhost:80 || exit 1
