FROM node:14-slim
WORKDIR /hardhat-runner
RUN npm init -y
RUN npm install hardhat
COPY hardhat.config.js .
ENTRYPOINT [ "npx", "hardhat", "node" ]