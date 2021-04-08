#!/bin/bash

# From: https://github.com/andrewmclagan/react-env/blob/master/packages/nginx/entrypoint.sh

set -e

echo "Serializing environment"

react-env --dest /usr/share/nginx/html/

cat /usr/share/nginx/html/__ENV.js

exec "$@"

echo "Serializing successful"