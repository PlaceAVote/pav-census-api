#!/usr/bin/env

set -e

HOST=${DEV_HOST}
USER=${DEV_USER}
PASSWORD=${DEV_PASSWORD}

cd ./scripts && node ./compile_config.js ${HOST} ${USER} ${PASSWORD}
