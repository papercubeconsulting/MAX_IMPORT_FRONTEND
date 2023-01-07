FROM node:12

#data
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
RUN npm install phantomjs-prebuilt

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=1000
ENV GENERATE_SOURCEMAP=false
# Building app
RUN npm run build
# COPY . .
#rebuild

ENV PORT 8080
EXPOSE 8080

#data
# Running the app
CMD [ "npm", "run","start" ]