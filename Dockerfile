FROM mhart/alpine-node:8
LABEL maintainer="Allard Oelen <oelen@l3s.de>"

#EXPOSE 3000

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /nodeApp
ADD . /nodeApp

RUN npm rebuild node-sass
RUN npm install
RUN cp default.env .env
RUN ./pre-release.sh
RUN npm start
