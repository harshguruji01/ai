#!/usr/bin/env bash
# ==============================================================================
# GURUAI ONE-CLICK VPS PROVISIONING SCRIPT (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
set -e

echo "🚀 Starting GuruAI VPS Setup for ai.webguruji.online..."

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx

# 2. Configure UFW Firewall
echo "🛡️ Configuring Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 3. Install Docker & Docker Compose plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 4. Clone / Setup Project Directory
APP_DIR="/var/www/guruai"
echo "📂 Setting up project in $APP_DIR..."
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    git clone https://github.com/harshguruji01/ai.git $APP_DIR
fi

cd $APP_DIR

# 5. Check .env.local
if [ ! -f "$APP_DIR/.env.local" ]; then
    echo "⚠️ Warning: .env.local not found. Creating from template..."
    cp .env.local.example .env.local
    echo "❗ Please edit $APP_DIR/.env.local with your real SUPABASE and NVIDIA_API_KEY credentials."
fi

# 6. Deploy Nginx Configuration
echo "🌐 Configuring Nginx reverse proxy..."
sudo cp deploy/nginx/ai.webguruji.online.conf /etc/nginx/sites-available/ai.webguruji.online.conf
sudo ln -sf /etc/nginx/sites-available/ai.webguruji.online.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Start Docker Containers
echo "🚀 Building and starting GuruAI container..."
docker compose up -d --build

# 8. Obtain SSL Certificate with Certbot
echo "🔒 Requesting SSL Certificate via Let's Encrypt for ai.webguruji.online..."
sudo certbot --nginx -d ai.webguruji.online --non-interactive --agree-tos --register-unsafely-without-email || true

echo "✅ Setup complete! GuruAI is running at https://ai.webguruji.online"
