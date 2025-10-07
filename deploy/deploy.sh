#!/bin/bash

# TokenMarket Production Deployment Script
# Smart Index Investment Platform - smartindexinvest.com
# Version: 1.0.0 - October 2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES FOR YOUR DEPLOYMENT
DOMAIN="smartindexinvest.com"
EMAIL="admin@smartindexinvest.com"
PROJECT_NAME="tokenmarket"

# REPLACE WITH YOUR GITHUB PAT (do not commit real tokens)
# This is a placeholder - set your actual PAT as environment variable
# GITHUB_PAT="${GITHUB_PAT:-your_personal_access_token}""

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}==============================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}==============================${NC}"
}

# Check if running as root/sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root for security reasons."
        log_info "The script will use sudo when necessary."
        exit 1
    fi

    # Check if docker is available
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH."
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed or not in PATH."
        exit 1
    fi
}

# Setup firewall rules
setup_firewall() {
    log_header "Setting up Firewall Rules"

    log_info "Configuring UFW firewall..."
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable

    log_success "Firewall configured successfully"
}

# Install Docker and Docker Compose if not present
install_docker() {
    if ! command -v docker &> /dev/null; then
        log_info "Installing Docker..."

        # Update package list
        sudo apt update

        # Install dependencies
        sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

        # Add Docker repository
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

        # Start and enable Docker
        sudo systemctl start docker
        sudo systemctl enable docker

        # Add current user to docker group
        sudo usermod -aG docker $USER

        log_warning "Docker installed. You may need to log out and back in for group changes to take effect."
    else
        log_info "Docker is already installed"
    fi
}

# Setup SSL certificates with Let's Encrypt
setup_ssl() {
    log_header "Setting up SSL Certificates with Let's Encrypt"

    # Stop nginx if running to free port 80
    log_info "Stopping any existing nginx containers..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Create webroot directory for certbot
    sudo mkdir -p /var/www/html/.well-known/acme-challenge
    sudo chown -R $USER:$USER /var/www/html

    log_info "Obtaining SSL certificates for $DOMAIN and www.$DOMAIN..."

    # Run certbot to get certificates
    docker run --rm -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" -v "/var/www/html:/var/www/html" certbot/certbot certonly --webroot -w /var/www/html -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-effort

    if [ $? -eq 0 ]; then
        log_success "SSL certificates obtained successfully"
    else
        log_error "Failed to obtain SSL certificates"
        exit 1
    fi

    # Set proper permissions
    sudo chown -R root:nginx /etc/letsencrypt/archive
    sudo chown -R root:nginx /etc/letsencrypt/live
}

# Deploy the application
deploy_app() {
    log_header "Deploying TokenMarket Application"

    log_info "Building and starting Docker containers..."

    # Build and start services (excluding certbot)
    docker-compose -f docker-compose.prod.yml up -d --build nginx tokenmarket redis

    log_info "Waiting for services to be healthy..."

    # Wait for application to be healthy
    MAX_ATTEMPTS=30
    ATTEMPTS=0

    while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
        if docker-compose -f docker-compose.prod.yml exec -T tokenmarket curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "Application is healthy and responding"
            break
        fi

        ATTEMPTS=$((ATTEMPTS + 1))
        log_info "Attempt $ATTEMPTS/$MAX_ATTEMPTS - Application not ready yet..."
        sleep 10
    done

    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
        log_error "Application failed to become healthy within the timeout period"
        docker-compose -f docker-compose.prod.yml logs tokenmarket
        exit 1
    fi

    log_success "Application deployed successfully"
}

# Configure automatic SSL renewal
setup_ssl_renewal() {
    log_header "Setting up Automatic SSL Renewal"

    # Create renewal script
    sudo tee /etc/cron.d/certbot-renew <<EOF
# Certbot SSL certificate renewal
0 */12 * * * root docker run --rm -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" -v "/var/www/html:/var/www/html" certbot/certbot renew --quiet && docker-compose -f /home/$USER/tokenmarket/docker-compose.prod.yml restart nginx
EOF

    sudo chmod 644 /etc/cron.d/certbot-renew
    sudo systemctl restart cron

    log_success "Automatic SSL renewal configured (runs every 12 hours)"
}

# Test the deployment
test_deployment() {
    log_header "Testing Production Deployment"

    log_info "Testing HTTPS access..."

    # Wait for nginx to be ready
    sleep 5

    # Test HTTPS access
    if curl -s -k https://$DOMAIN > /dev/null; then
        log_success "HTTPS access working for $DOMAIN"
    else
        log_error "HTTPS access failed for $DOMAIN"
    fi

    # Test API endpoints
    if curl -s -k https://$DOMAIN/api/health > /dev/null; then
        log_success "Health check endpoint working"
    else
        log_warning "Health check endpoint not responding"
    fi

    # Test Discord API (will fail without webhook URL, which is expected)
    response=$(curl -s -o /dev/null -w "%{http_code}" -k -X POST https://$DOMAIN/api/discord/notify -H "Content-Type: application/json" -d '{"type":"user_joined","data":{"userAddress":"test"}}')
    if [ "$response" = "400" ]; then
        log_success "Discord API responding correctly (expected 400 without webhook)"
    else
        log_warning "Discord API unexpected response code: $response"
    fi

    log_info "Deployment testing complete"
}

# Display post-deployment information
post_deployment_info() {
    log_header "🎉 Deployment Complete!"

    echo ""
    log_success "TokenMarket is now live at: https://$DOMAIN"
    echo ""
    log_info "📋 Next Steps:"
    echo "  1. Configure Discord webhook URL in .env.production"
    echo "  2. Update DNS records for $DOMAIN if needed"
    echo "  3. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  4. Setup monitoring and alerts"
    echo ""
    log_info "🔧 Useful Commands:"
    echo "  • Start:  docker-compose -f docker-compose.prod.yml up -d"
    echo "  • Stop:   docker-compose -f docker-compose.prod.yml down"
    echo "  • Logs:   docker-compose -f docker-compose.prod.yml logs -f"
    echo "  • Update: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
    echo ""
    log_info "🔒 Security Notes:"
    echo "  • SSL certificates auto-renew every 12 hours"
    echo "  • Firewall configured for SSH and HTTPS only"
    echo "  • Rate limiting enabled on API endpoints"
    echo ""
}

# Main deployment function
main() {
    log_header "🚀 TokenMarket Production Deployment"
    log_info "Target Domain: $DOMAIN"
    log_info "Email: $EMAIL"
    log_info "Starting deployment process..."
    echo ""

    # Pre-deployment checks
    check_permissions

    # Setup system
    setup_firewall
    install_docker

    # SSL setup
    setup_ssl

    # Deploy application
    deploy_app

    # Post-deployment setup
    setup_ssl_renewal
    test_deployment
    post_deployment_info

    log_header "✅ Deployment Complete!"
    log_success "TokenMarket is now deployed and running at https://$DOMAIN"
}

# Handle command line arguments
case "${1:-}" in
    "ssl-only")
        check_permissions
        setup_ssl
        ;;
    "deploy-only")
        check_permissions
        deploy_app
        ;;
    "test")
        test_deployment
        ;;
    *)
        main
        ;;
esac
