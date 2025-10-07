# 🚀 TokenMarket Production Deployment Guide
## Complete Nginx + Docker Deployment for smartindexinvest.com

## 📋 Overview

This deployment setup includes:
- **Docker containerization** for TokenMarket application
- **Nginx reverse proxy** with SSL/TLS termination
- **Let's Encrypt SSL certificates** with auto-renewal
- **Redis caching** for rate limiting and sessions
- **Automated deployment scripts** and monitoring

## 🏗️ Architecture

```
Internet → Nginx (SSL/TLS) → TokenMarket App → Redis
              ↓
         Let's Encrypt (Auto-renewal)
```

### Services:
- **nginx**: Reverse proxy, SSL termination, rate limiting
- **tokenmarket**: Next.js application (standalone output)
- **redis**: Caching and rate limiting
- **certbot**: SSL certificate management

## 🚀 Quick Deployment

### Prerequisites
- Linux server (Ubuntu/Debian recommended)
- Root/sudo access
- Domain name: `smartindexinvest.com`
- DNS records pointing to server IP

### Single Command Deployment

```bash
# Clone the repository
git clone https://github.com/roguedev-ai/tokenmarket-v2.git tokenmarket
cd tokenmarket

# Make deployment script executable
chmod +x deploy/deploy.sh

# Run full deployment (includes SSL setup)
sudo ./deploy/deploy.sh
```

### What the script does:
1. ✅ Configures UFW firewall
2. ✅ Installs Docker and Docker Compose
3. ✅ Obtains SSL certificates with Let's Encrypt
4. ✅ Builds and deploys all containers
5. ✅ Sets up automatic SSL renewal
6. ✅ Tests the deployment
7. ✅ Provides access information

## 🎛️ Manual Deployment Steps

### 1. Prepare Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required tools
sudo apt install -y curl wget git ufw

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 2. SSL Certificate Setup

```bash
# Stop any existing nginx
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Create webroot directory
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R $USER:$USER /var/www/html

# Get certificates
docker run --rm \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  -v "/var/www/html:/var/www/html" \
  certbot/certbot certonly --webroot \
  -w /var/www/html \
  -d smartindexinvest.com \
  -d www.smartindexinvest.com \
  --email admin@smartindexinvest.com \
  --agree-tos --no-effort
```

### 3. Configure Environment

```bash
# Copy and edit production environment file
cp .env.example.social .env.production

# Edit .env.production:
# - Set DISCORD_WEBHOOK_URL (get from Discord)
# - Update other production-specific variables
nano .env.production
```

### 4. Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build nginx tokenmarket redis

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Verify Deployment

```bash
# Test HTTPS access
curl -I https://smartindexinvest.com

# Test API endpoints
curl -k https://smartindexinvest.com/api/health

# Test Discord integration (will show 400 without webhook)
curl -X POST https://smartindexinvest.com/api/discord/notify \
  -H "Content-Type: application/json" \
  -d '{"type":"user_joined","data":{"userAddress":"test"}}'
```

## ⚙️ Configuration Files

### Environment Variables (.env.production)
```bash
# Required
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Recommended
NEXT_PUBLIC_ENABLE_DISCORD_INTEGRATION=true
DISCORD_NOTIFICATIONS_ENABLED=true

# Optional
REDIS_URL=redis://redis:6379
COINGECKO_API_KEY=your_key_here
```

### Nginx Configuration (nginx/conf.d/smartindexinvest.com.conf)
- Rate limiting: 100 r/s general, 50 r/s API, 5 r/m Discord
- SSL/TLS 1.2-1.3 with strong ciphers
- Security headers enabled
- CORS configured for API

## 🔄 Maintenance & Updates

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### SSL Certificate Renewal
```bash
# Manual renewal
docker run --rm \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  -v "/var/www/html:/var/www/html" \
  certbot/certbot renew --quiet

# Restart nginx to use new certificates
docker-compose -f docker-compose.prod.yml restart nginx
```

### Monitoring
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Monitor resource usage
docker stats

# Check nginx access logs
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log
```

## 🚨 Troubleshooting

### Common Issues

**SSL Certificate Issues:**
```bash
# Check certificate status
docker run --rm -v "/etc/letsencrypt:/etc/letsencrypt" certbot/certbot certificates

# Force renewal
docker run --rm \
  -v "/etc/letsencrypt:/etc/letsencrypt" \
  -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
  -v "/var/www/html:/var/www/html" \
  certbot/certbot renew --force-renewal
```

**Application Not Starting:**
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs tokenmarket

# Check if port 3000 is accessible
docker-compose -f docker-compose.prod.yml exec tokenmarket curl localhost:3000

# Restart application
docker-compose -f docker-compose.prod.yml restart tokenmarket
```

**Rate Limiting Issues:**
- Check Redis connectivity: `docker-compose exec redis redis-cli ping`
- Review nginx error logs
- Monitor Redis logs for connection issues

### Health Checks

**Application Health:**
```bash
curl -f https://smartindexinvest.com/health
curl -f https://smartindexinvest.com/api/health
```

**Service Status:**
```bash
# Docker services
docker-compose -f docker-compose.prod.yml ps

# SSL certificates
openssl s_client -connect smartindexinvest.com:443 -servername smartindexinvest.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

## 🔒 Security Configuration

### Nginx Security Features
- Rate limiting on all endpoints
- SSL/TLS encryption with modern ciphers
- Security headers (CSP, HSTS, X-Frame-Options)
- File access restrictions
- Request size limits

### Network Security
- UFW firewall with minimal open ports (SSH, HTTPS)
- Docker network isolation
- No direct container exposure
- Redis authentication enabled

## 📊 Scaling & Performance

### Horizontal Scaling
```yaml
# Example: Multiple app instances
services:
  tokenmarket:
    scale: 3  # Run 3 instances
    depends_on:
      redis:
        condition: service_healthy
      nginx:
        condition: service_started

  loadbalancer:
    # Add load balancer for multiple instances
```

### Performance Optimization
- Nginx caching for static assets
- Redis session caching
- Gzip compression enabled
- Connection pooling configured

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] DNS records point to server IP
- [ ] Server has sufficient resources (2GB RAM minimum)
- [ ] SSH access configured
- [ ] Backup of current deployment (if upgrading)

### During Deployment
- [ ] Script executed without errors
- [ ] All containers started successfully
- [ ] HTTPS access working
- [ ] API endpoints responding
- [ ] SSL certificate valid

### Post-Deployment
- [ ] Discord webhook configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Documentation updated

## 📞 Support & Monitoring

### Logs and Alerts
- Nginx access/error logs in `/var/log/nginx/`
- Application logs via `docker-compose logs`
- Redis logs via `docker-compose logs redis`
- SSL certificate expiration alerts (auto-renewed)

### Backup Strategy
- Database backups (when implemented)
- SSL certificates backed up automatically
- Application code version controlled
- Configuration files version controlled

---

## 🚀 Next Steps After deployment

1. **Configure Discord Webhook:** Get webhook URL from Discord server settings
2. **Setup Monitoring:** Add application monitoring (DataDog, New Relic, etc.)
3. **Configure Domain:** Ensure DNS propagation is complete
4. **Security Audit:** Run security scanning on the deployment
5. **Performance Testing:** Load test the application
6. **Documentation:** Update project documentation with production URLs

---

*TokenMarket Production Deployment - October 2025*
*Version 1.0.0 - Production Ready*
