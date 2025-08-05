# Deployment Guide - Adhigam NGO Website

This guide covers deploying the Adhigam NGO website with Node.js backend to various platforms.

## 🚀 Quick Deployment Options

### 1. Local Development
```bash
# Install dependencies
npm install

# Run setup script
npm run setup

# Start development server
npm run dev
```

### 2. Railway (Recommended for beginners)
1. Push code to GitHub
2. Connect Railway account to GitHub
3. Deploy automatically
4. Add environment variables in Railway dashboard

### 3. Render
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### 4. Heroku
1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Deploy: `git push heroku main`
4. Set environment variables

## 🔧 Production Deployment

### Prerequisites
- Node.js 16+ installed
- Git repository
- Domain name (optional)
- SSL certificate (recommended)

### Step 1: Prepare Your Code

1. **Clone and setup locally:**
```bash
git clone <your-repo-url>
cd Adhigam
npm install
npm run setup
```

2. **Update environment variables:**
```bash
# Edit .env file
nano .env
```

3. **Configure production settings:**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-very-secure-jwt-secret
SESSION_SECRET=your-very-secure-session-secret
RAZORPAY_KEY_ID=your-razorpay-live-key
RAZORPAY_KEY_SECRET=your-razorpay-live-secret
ALLOWED_ORIGINS=https://your-domain.com
```

### Step 2: Choose Your Platform

#### Option A: VPS/Cloud Server (DigitalOcean, AWS, etc.)

1. **Create server instance**
2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (Process Manager):**
```bash
npm install -g pm2
```

4. **Deploy application:**
```bash
# Clone your repository
git clone <your-repo-url>
cd Adhigam

# Install dependencies
npm install

# Set environment variables
cp env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name "adhigam-ngo"

# Save PM2 configuration
pm2 save
pm2 startup
```

5. **Setup Nginx (Reverse Proxy):**
```bash
sudo apt-get install nginx
```

Create Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Setup SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Option B: Railway (Easiest)

1. **Create Railway account**
2. **Connect GitHub repository**
3. **Add environment variables in Railway dashboard**
4. **Deploy automatically**

#### Option C: Render

1. **Create Render account**
2. **Connect GitHub repository**
3. **Configure build settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add environment variables**
5. **Deploy**

### Step 3: Database Setup

The application uses SQLite by default, which is perfect for small to medium applications.

**For production with high traffic, consider PostgreSQL:**

1. **Install PostgreSQL:**
```bash
sudo apt-get install postgresql postgresql-contrib
```

2. **Create database:**
```bash
sudo -u postgres psql
CREATE DATABASE adhigam_ngo;
CREATE USER adhigam_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE adhigam_ngo TO adhigam_user;
\q
```

3. **Update database configuration in `database/init.js`**

### Step 4: Security Configuration

1. **Update admin credentials:**
```env
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-password
```

2. **Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Configure firewall:**
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Step 5: Monitoring & Maintenance

#### Setup Monitoring

1. **PM2 Monitoring:**
```bash
pm2 monit
pm2 logs adhigam-ngo
```

2. **Setup log rotation:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

3. **Health checks:**
```bash
# Test health endpoint
curl https://your-domain.com/api/health
```

#### Backup Strategy

1. **Database backup:**
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp ./database/adhigam.db ./backups/adhigam_$DATE.db
# Keep only last 7 days
find ./backups -name "*.db" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/your/app/backup.sh
```

2. **Code backup:**
```bash
# Regular git pushes
git add .
git commit -m "Backup $(date)"
git push origin main
```

### Step 6: Performance Optimization

1. **Enable compression:**
```javascript
// In server.js
const compression = require('compression');
app.use(compression());
```

2. **Setup caching:**
```javascript
// Cache static files
app.use(express.static('public', {
    maxAge: '1d',
    etag: true
}));
```

3. **Database optimization:**
```sql
-- Add indexes for better performance
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at);
```

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET and SESSION_SECRET
- [ ] Configured proper CORS settings
- [ ] Enabled HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configured rate limiting
- [ ] Enabled security headers
- [ ] Set up monitoring and logging
- [ ] Created backup strategy
- [ ] Updated Razorpay webhook URL

## 📊 Monitoring & Analytics

### Built-in Monitoring

1. **Health Check Endpoint:**
```
GET /api/health
```

2. **Admin Dashboard Analytics:**
```
GET /api/admin/analytics
```

3. **System Logs:**
```bash
pm2 logs adhigam-ngo
```

### External Monitoring

1. **Uptime Monitoring:**
   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Error Tracking:**
   - Sentry
   - LogRocket

3. **Performance Monitoring:**
   - New Relic
   - DataDog

## 🚨 Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
pm2 logs adhigam-ngo

# Check port availability
netstat -tulpn | grep :3000

# Restart application
pm2 restart adhigam-ngo
```

**Database issues:**
```bash
# Check database file
ls -la database/

# Recreate database
rm database/adhigam.db
npm run dev
```

**Payment issues:**
- Verify Razorpay API keys
- Check webhook URL configuration
- Ensure proper signature verification

**CORS errors:**
- Update ALLOWED_ORIGINS in .env
- Restart application after changes

### Performance Issues

1. **High memory usage:**
```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart adhigam-ngo
```

2. **Slow database queries:**
```bash
# Add database indexes
sqlite3 database/adhigam.db
.schema
CREATE INDEX idx_donations_date ON donations(created_at);
```

## 📞 Support

For deployment issues:

1. **Check logs:**
```bash
pm2 logs adhigam-ngo
tail -f /var/log/nginx/error.log
```

2. **Test endpoints:**
```bash
curl https://your-domain.com/api/health
curl https://your-domain.com/api/content/events
```

3. **Verify environment:**
```bash
node -e "console.log(process.env.NODE_ENV)"
```

## 🔄 Updates & Maintenance

### Regular Updates

1. **Code updates:**
```bash
git pull origin main
npm install
pm2 restart adhigam-ngo
```

2. **Security updates:**
```bash
npm audit
npm audit fix
```

3. **Database maintenance:**
```bash
# Backup before updates
cp database/adhigam.db backups/adhigam_$(date +%Y%m%d).db

# Run updates
npm run dev
```

### Scaling Considerations

For high traffic:

1. **Load balancing with multiple instances**
2. **Database migration to PostgreSQL**
3. **CDN for static assets**
4. **Redis for session storage**
5. **Microservices architecture**

---

**Remember**: Always test in a staging environment before deploying to production! 