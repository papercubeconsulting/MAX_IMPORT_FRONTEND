FROM node:10

#data
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .


# Building app
RUN npm run build
#rebuild

ENV PORT 8080
EXPOSE 8080


# Running the app
CMD [ "npm", "run","start" ]