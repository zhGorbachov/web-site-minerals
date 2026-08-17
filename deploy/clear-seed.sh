#!/bin/sh
# Strip seeded mock products, default seed subcategories, and leftover demo reviews.
# Keeps the five storefront categories, users and the bootstrap admin.
# Run from the repo root on the server:
#   sh deploy/clear-seed.sh
set -e
cd "$(dirname "$0")/.."
docker compose -f docker-compose.prod.yml exec api npm run db:clear-seed
