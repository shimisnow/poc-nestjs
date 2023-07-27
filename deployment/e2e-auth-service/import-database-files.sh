#! /bin/bash
for file in $(ls /tmp/e2e-auth-service/database-data/authentication);
do
  export PGPASSWORD=1234567890
  cd /tmp/e2e-auth-service/database-data/authentication/
  psql -U postgres -d authentication -f "$file"
done