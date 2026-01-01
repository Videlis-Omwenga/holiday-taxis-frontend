# 🚀 Docker Quick Start

## Start Development Server (with hot reload)

```bash
npm run docker:dev
```

Or using Docker Compose directly:
```bash
docker compose -f docker-compose.dev.yml up --build
```

Your app will be available at: **http://localhost:3000**

## Stop Development Server

```bash
npm run docker:dev:down
```

Or:
```bash
docker compose -f docker-compose.dev.yml down
```

## Start Production Server

```bash
npm run docker:prod
```

## Available Scripts

- `npm run docker:dev` - Start development container with hot reload
- `npm run docker:dev:down` - Stop development container
- `npm run docker:prod` - Start production container
- `npm run docker:prod:down` - Stop production container
- `npm run docker:build` - Build Docker image
- `npm run docker:clean` - Clean up Docker resources

## View Logs

```bash
docker compose -f docker-compose.dev.yml logs -f
```

See **DOCKER_README.md** for complete documentation.
