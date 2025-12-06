# PostgreSQL Logging Configuration

# Add these to your postgresql.conf file or set via SQL

# Reduce logging level

log_min_messages = warning
log_min_error_statement = error

# Disable statement logging

log_statement = 'none'

# Disable connection logging

log_connections = off
log_disconnections = off

# Disable duration logging

log_duration = off

# Disable lock waits

log_lock_waits = off

# You can apply these settings by running SQL commands:

# ALTER SYSTEM SET log_min_messages = 'warning';

# ALTER SYSTEM SET log_statement = 'none';

# SELECT pg_reload_conf();
