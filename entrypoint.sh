#!/bin/sh
# Set PGPASSWORD so psql doesn't ask for it interactively
export PGPASSWORD=$DB_PASSWORD

# Run the initialization script
echo "Initializing database from servicios_salud.sql..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /usr/src/app/servicios_salud.sql
echo "Database initialization script finished."

# Execute the original CMD
exec "$@"
