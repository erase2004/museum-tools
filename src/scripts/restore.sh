#!/usr/bin/env bash

# Description: Restore single MongoDB database from compressed backup file
# Author: Tsuki Akiba
# Version: 1.0
# Date: 2025-11-09
#
# Usage: ./restore.sh [COMPRESSED_DB_BACKUP_FILE_NAME]
#

FILENAME=$1

tar zxvf $FILENAME

mongorestore --drop ./dump

rm $FILENAME

rm -rf ./dump
