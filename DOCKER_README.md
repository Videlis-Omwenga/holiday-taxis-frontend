# 🐳 Docker Setup for Holiday Taxis Frontend

This guide explains how to run the Holiday Taxis frontend application using Docker.

## 📋 Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (comes with Docker Desktop)

## 🚀 Quick Start

### Development Mode (with hot reload)

```bash
# Start the development container
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode (background)
docker-compose -f docker-compose.dev.yml up -d --build
```

Your app will be available at: **http://localhost:3000**

### Production Mode

```bash
# Build and start the production container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

## 🛠️ Available Commands

### Development Commands

```bash
# Start containers
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# Stop containers
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# Stop and remove everything (including volumes)
docker-compose -f docker-compose.dev.yml down -v
```

### Production Commands

```bash
# Start containers
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f frontend

# Rebuild containers
docker-compose up --build
```

### Individual Docker Commands

```bash
# Build production image
docker build -t holiday-taxis-frontend .

# Build development image
docker build -f Dockerfile.dev -t holiday-taxis-frontend-dev .

# Run production container
docker run -p 3000:3000 holiday-taxis-frontend

# Run development container with volume mounting
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules holiday-taxis-frontend-dev
```

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Or copy the example file:
```bash
cp .env.docker .env.local
```

## 🔧 Configuration Files

- **Dockerfile** - Production build (multi-stage, optimized)
- **Dockerfile.dev** - Development build (with hot reload)
- **docker-compose.yml** - Production orchestration
- **docker-compose.dev.yml** - Development orchestration
- **.dockerignore** - Exclude files from Docker context
- **.env.docker** - Example environment variables

## 📊 Container Details

### Production Container
- **Base Image**: node:18-alpine
- **Port**: 3000
- **Build Type**: Multi-stage (optimized)
- **Size**: ~150MB (optimized)
- **User**: Non-root (nextjs)

### Development Container
- **Base Image**: node:18-alpine
- **Port**: 3000
- **Features**: Hot reload, volume mounting
- **Size**: ~500MB (includes all dev dependencies)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 3000
sudo fuser -k 3000/tcp

# Or change the port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Container Won't Start
```bash
# Check container logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

### Changes Not Reflecting (Development)
```bash
# Ensure you're using docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

### Out of Disk Space
```bash
# Remove unused containers, images, and volumes
docker system prune -a --volumes

# Remove only stopped containers
docker container prune

# Remove only dangling images
docker image prune
```

## 🔍 Useful Docker Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs holiday-taxis-frontend-dev

# Execute command in running container
docker exec -it holiday-taxis-frontend-dev sh

# Inspect container
docker inspect holiday-taxis-frontend-dev

# View container resource usage
docker stats

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

## 📦 Benefits of Docker

✅ **Consistency** - Same environment on all machines
✅ **Isolation** - No conflicts with local Node.js versions
✅ **Portability** - Easy deployment anywhere
✅ **Quick Setup** - One command to start everything
✅ **Clean Environment** - Easy to reset and rebuild

## 🚢 Deployment

### Deploy to Production Server

1. Copy files to server:
```bash
scp -r . user@server:/path/to/app
```

2. Build and run on server:
```bash
docker-compose up -d --build
```

### Deploy to Cloud Platforms

- **AWS**: Use ECS or EC2 with Docker
- **Google Cloud**: Use Cloud Run or GKE
- **Azure**: Use Container Instances or AKS
- **DigitalOcean**: Use App Platform or Droplets
- **Heroku**: Use container registry

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 💡 Tips

1. Use **docker-compose.dev.yml** for development (hot reload)
2. Use **docker-compose.yml** for production testing
3. Keep your `.env.local` file secure (it's in .gitignore)
4. Regularly clean up Docker resources to save disk space
5. Use `docker-compose logs -f` to monitor application output
