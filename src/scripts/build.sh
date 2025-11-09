#!/usr/bin/env bash

# Description: Build single Meteor.js based museum server instance
# Author: Tsuki Akiba
# Version: 1.0
# Date: 2025-11-09
#
# Usage: ./build.sh [PROJECT_DIRECTORY]
#

CURRENT_PATH=$(pwd)

SOURCE="${CURRENT_PATH}/$1"

TARGET="${CURRENT_PATH}/$1-bin"

rm -rf $TARGET

cd $SOURCE

meteor npm install

meteor build --directory $TARGET --allow-superuser

cd "${TARGET}/bundle/programs/server"

npm install
