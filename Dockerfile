FROM node:22

#data
WORKDIR '/app'

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    fontconfig \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    fonts-freefont-ttf \
    fonts-liberation \
    fonts-noto-core \
  && fc-cache -f \
  && rm -rf /var/lib/apt/lists/*

COPY ./package.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS=--max_old_space_size=2048
ENV GENERATE_SOURCEMAP=false
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# Building app
RUN npm run build
# COPY . .
#rebuild

ENV PORT 8080
EXPOSE 8080

#data
# Running the app
CMD [ "npm", "run","start" ]
