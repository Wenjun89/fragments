FROM node:22.12.0 AS builder

WORKDIR /app

# 注意：这里路径已经加上了子目录前缀
COPY lab7/assignment-01/lab5/package*.json ./
RUN npm install

COPY lab7/assignment-01/lab5/src ./src
COPY lab7/assignment-01/lab5/tests/.htpasswd ./tests/.htpasswd

FROM node:22.12.0-alpine

WORKDIR /app

ENV PORT=8080
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/tests/.htpasswd ./tests/.htpasswd
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
CMD ["npm", "start"]
