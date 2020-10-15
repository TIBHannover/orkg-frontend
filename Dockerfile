# Building the application
FROM node:lts-buster as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
# Increate node max memory, the default memory limit is too low for building 
ENV NODE_OPTIONS --max-old-space-size=8192 

COPY package.json package-lock.json ./

# NOTE: opencollective is not required but leads to warnings if missing
RUN npm install react-scripts@3.4.1 react-app-rewired@2.1.6 opencollective -g

# install the dependencies (exclude dev dependencies by using --only=production)
RUN npm ci --only=production

COPY . ./

# Include default values; override in deployment image
RUN cp default.env .env

# Build
RUN ./pre-release.sh
RUN npm run build

# Serve the built application with nginx
FROM nginx:stable-alpine

RUN apk add --no-cache nodejs npm bash

SHELL ["/bin/bash", "-c"]

RUN npm install -g @beam-australia/react-env

ADD entrypoint.sh /var/entrypoint.sh
RUN ["chmod", "+x", "/var/entrypoint.sh"]

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

ENTRYPOINT ["/var/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
