# build phase
FROM node:alpine as builder

WORKDIR '/app'

COPY package.json .

RUN npm install

COPY . .

ADD ./set-env.sh /set-env.sh
#RUN /set-env.sh
#RUN chmod +x /set-env.sh

RUN echo "Variable ${token}" 

#RUN npm run $token
RUN npm run build:test
EXPOSE 80


FROM nginx:1.15.8-alpine

# # Install only what is needed
# RUN apt-get update && apt-get install -y --no-install-recommends curl \  
#       && rm -rf /var/lib/apt/lists/*

# Remove default nginx
RUN rm /usr/share/nginx/html/*

# Copy all of our nginx configurations
COPY ./nginx.conf /etc/nginx/nginx.conf  
COPY ./default.conf /etc/nginx/conf.d/default.conf

# Copy our optimized build into the web folder that we point to in default.conf
COPY --from=builder /app/build /var/www/

# # Convenicne just in case we want to add more configuration later
# COPY entrypoint.sh /  
# RUN chmod +x /entrypoint.sh  
# ENTRYPOINT ["/entrypoint.sh"]

# Daemon Off otherwise, Docker will drop when the main process is done making child ones
CMD ["nginx", "-g", "daemon off;"] 
