FROM node:18-slim

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install --force

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "start"]