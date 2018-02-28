# ORKG Web Client

## Run

Run the following command in this directory.

    npm run start

The browser will open automatically on the page http://localhost:3000/.

## Requirements

The docker container with the backend application should be run before running the client.

    docker build -t blazegraph .
    docker run --name blazegraph -d -p 8889:8080 blazegraph

In Blazegraph import the data from an ontology by going to the link http://localhost:8889/bigdata/#update.