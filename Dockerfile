FROM node:6.3.1-slim
RUN apt-get update && apt-get install -y git-core
RUN mkdir /app
WORKDIR "/app"
ADD package.json package.json
RUN npm install
COPY . ./
ENV NODE_ENV=production 
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]