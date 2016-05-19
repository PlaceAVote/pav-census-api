#!/usr/bin/env

set -e

HOST=${DEV_HOST}
USER=${DEV_USER}
PASSWORD=${DEV_PASSWORD}

USER_HOST=${DEV_USER_HOST}
USER_USER=${DEV_USER_USER}
USER_PASSWORD=${DEV_USER_PASSWORD}
USER_DB=${DEV_USER_DB}

echo "Compiling Config"
node ./scripts/compile_config.js ${HOST} ${USER} ${PASSWORD} ${USER_HOST} ${USER_USER} ${USER_PASSWORD} ${USER_DB}
echo "Config Compiled"
