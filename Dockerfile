FROM node:6.3.1-slim
RUN apt-get update && apt-get install -y git-core && apt-get install -y curl
RUN mkdir /app
WORKDIR "/app"
ADD package.json package.json
RUN npm install
COPY . ./
ARG env=production
ENV NODE_ENV=$env 
RUN npm run build
EXPOSE 443
CMD ["npm", "start"]