FROM node:9.4.0-alpine as builder

WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
ENV PORT 8080
EXPOSE 8080
RUN npm run build
COPY . .
CMD ["npm", "run", "start"]
