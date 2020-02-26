FROM node:10

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /app

# Installing dependencies
COPY package.json .
RUN npm install

# Copying source files
COPY . .

# Building app
RUN npm run build

ENV PORT 8080
EXPOSE 8080
CMD ["npm", "run", "start"]
# Running the app
