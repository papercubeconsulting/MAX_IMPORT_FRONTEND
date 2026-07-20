FROM node:22

#data
WORKDIR '/app'

COPY ./package.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=2048
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
