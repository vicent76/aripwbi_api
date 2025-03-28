docker rm -f aripwbi_app
docker pull aswrf/aripwbi_app
docker run -d --name aripwbi_app -p8089:8088 \
-e ARIPWBI_PORT=8088 \
-e ARIPWBI_WINSTON_FILELEVEL=info \
-e ARIPWBI_WINSTON_CONSOLELEVEL=debug \
-e ARIPWBI_JWT_KEY=secret \
-e ARIPWBI_MYSQL_HOST=mysql01.ariadnasw.com \
-e ARIPWBI_MYSQL_USER=root \
-e ARIPWBI_MYSQL_PASSWORD=aritel \
-e ARIPWBI_MYSQL_PORT=3306 \
-e ARIPWBI_MYSQL_DATABASE=aripwbi \
-e ARIPWBI_MYSQL_CONTABILIDAD=ariconta1 \
-e ARIPWBI_MYSQL_USUARIOS=usuarios \
--restart unless-stopped aswrf/aripwbi_app

