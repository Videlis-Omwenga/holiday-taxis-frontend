# Production Deployment Guide

## Prerequisites

- Docker installed
- Access to your backend API
- Environment variables configured

## Quick Start

### 1. Configure Environment Variables

Copy the production environment template:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set the required values:

```bash
# REQUIRED: Your backend API URL
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com

# OPTIONAL: Google Maps API Key (for map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# OPTIONAL: Wialon API Configuration
WIALON_API_URL=https://hst-api.wialon.com/wialon/ajax.html
WIALON_TOKEN=your-wialon-token

# OPTIONAL: HolidayTaxis API Configuration
HOLIDAYTAXIS_API_URL=https://suppliers.htxstaging.com
HOLIDAYTAXIS_API_KEY=your-holidaytaxis-key
```

### 2. Build Docker Image

```bash
docker build -t bookings-frontend .
```

### 3. Run Container

#### With environment file:

```bash
docker run -d \
  --name bookings-app \
  -p 3000:3000 \
  --env-file .env.production \
  bookings-frontend
```

#### With inline environment variables:

```bash
docker run -d \
  --name bookings-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com \
  bookings-frontend
```

### 4. Verify Deployment

Visit `http://localhost:3000` to confirm the application is running.

## Production Checklist

- [x] TypeScript errors fixed
- [x] Server-side rendering (SSR) compatible
- [x] Environment variables externalized
- [x] Docker image optimized with multi-stage build
- [x] Running as non-root user (nextjs:nodejs)
- [x] ESLint configured
- [x] Console logs removed
- [x] Public assets folder created

## Docker Commands

### Stop the container
```bash
docker stop bookings-app
```

### Remove the container
```bash
docker rm bookings-app
```

### View logs
```bash
docker logs bookings-app
```

### View logs (follow mode)
```bash
docker logs -f bookings-app
```

### Restart the container
```bash
docker restart bookings-app
```

## Docker Compose (Alternative)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
    restart: unless-stopped
```

Then run:

```bash
docker compose up -d
```

## Troubleshooting

### Container won't start
Check logs: `docker logs bookings-app`

### Can't connect to backend
Ensure `NEXT_PUBLIC_BACKEND_URL` is set correctly and the backend is accessible from the container.

### Port already in use
Change the host port: `-p 8080:3000` (maps to host port 8080)

## Security Notes

- Never commit `.env.production` to version control
- Use HTTPS in production for `NEXT_PUBLIC_BACKEND_URL`
- Keep your API keys secure
- The container runs as a non-root user for security

## Performance

- Multi-stage Docker build for minimal image size
- Next.js standalone output for optimal performance
- Static pages pre-rendered at build time
- Client-side hydration for interactivity

## Support

For issues or questions, check the application logs or contact your system administrator.
