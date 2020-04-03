FROM node:10

#data
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
RUN npm install phantomjs-prebuilt

COPY . .


# Building app
RUN npm run build
# COPY . .
#rebuild

ENV PORT 8080
EXPOSE 8080

#data
# Running the app
# CMD [ "npm", "run","start" ]