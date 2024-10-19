all: up

up:
	docker compose up -d --build

down:
	docker compose down

start:
	docker compose start

stop:
	docker compose stop

restart:
	docker compose restart

logs:
	docker compose logs -f

status:
	docker compose ps

clean:
	docker compose down --rmi all --volumes --remove-orphans
	docker system prune -f -a --volumes

re : clean all

.PHONY: all up down start stop restart logs status clean
