build-db:
	docker build -t db-bek11 .
	docker run -d --name db-bek11 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=bek11 -e MYSQL_USER=datran -e MYSQL_PASSWORD=datran -p 3306:3306 db-bek11

start-db:
	docker start db-bek11

stop-db:
	docker stop db-bek11

rm-db:
	docker stop db-bek11 || true
	docker rm db-bek11 || true
	docker rmi db-bek11 || true
	docker volume rm $(docker volume ls -qf dangling=true) || true

build:
	npm run build

test:
	npm run test

start: build
	npm run start
