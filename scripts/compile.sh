#!/usr/bin/env

set -e

HOST=${DEV_HOST}
USER=${DEV_USER}
PASSWORD=${DEV_PASSWORD}

echo "Compiling Config"
cd ./scripts && node ./compile_config.js ${HOST} ${USER} ${PASSWORD}
echo "Config Compiled"
