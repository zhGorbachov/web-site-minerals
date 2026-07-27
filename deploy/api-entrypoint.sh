#!/bin/sh
set -e
cd /app/server
echo "Waiting for database and applying schema..."
npx prisma db push
exec "$@"
