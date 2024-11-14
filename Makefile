OPTIONS = -f docker-compose.dev.yml --env-file .env.development

build:
	docker-compose $(OPTIONS) build --no-cache

up:
	docker-compose $(OPTIONS) up -d

down:
	docker-compose $(OPTIONS) down

bash:
	docker exec -it menyalka_server zsh

attach:
	docker attach menyalka_server
