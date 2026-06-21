#!/bin/bash
# Copy certs to a location where we can set proper permissions
# (Windows-mounted volumes don't support Linux file permissions)
cp /var/lib/postgresql/certs/server.crt /var/lib/postgresql/server.crt
cp /var/lib/postgresql/certs/server.key /var/lib/postgresql/server.key
chown postgres:postgres /var/lib/postgresql/server.crt /var/lib/postgresql/server.key
chmod 600 /var/lib/postgresql/server.key
chmod 644 /var/lib/postgresql/server.crt

# Hand off to the original entrypoint
exec docker-entrypoint.sh "$@"
