FROM node:10.15.3-alpine
RUN apk update && apk add bash curl tzdata
ENV TZ=Asia/Hong_Kong
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /app  
COPY package.json .
COPY key key
RUN npm install
COPY src src
CMD [ "node", "src/index.js" ]