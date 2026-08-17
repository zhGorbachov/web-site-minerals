#!/bin/sh
# Strip seeded mock products and leftover demo reviews from the production database.
# Keeps the five storefront categories, users and the bootstrap admin.
# Run from the repo root on the server:
#   sh deploy/clear-seed.sh
set -e
cd "$(dirname "$0")/.."
docker compose -f docker-compose.prod.yml exec api npm run db:clear-seed
