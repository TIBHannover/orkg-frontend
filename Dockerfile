FROM mhart/alpine-node:8
LABEL maintainer="Allard Oelen <oelen@l3s.de>"

#EXPOSE 3000

WORKDIR /nodeApp
ADD . /nodeApp

RUN npm install
RUN cp default.env .env
RUN ./pre-release.sh
RUN npm start
