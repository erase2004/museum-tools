#!/usr/bin/env bash

# Description: Backup single MongoDB database
# Author: Tsuki Akiba
# Version: 1.0
# Date: 2025-11-09
#
# Usage: ./backup.sh [DB_NAME]
#

set -euo pipefail

DB_NAME=$1

IFS="-" read -ra parts <<< $DB_NAME

TARGET="round${parts[1]}-db.tar.gz"

mongodump -d $DB_NAME

tar zcvf $TARGET dump/

rm -r dump
