# Adhigam NGO Website - Full Stack Implementation

A complete NGO website with Node.js backend, SQLite database, and comprehensive security features for donation management and content administration.

## 🚀 Features

### Frontend
- **Modern Responsive Design** - Mobile-first approach with beautiful UI
- **Hero Slider** - Dynamic image/video carousel for homepage
- **Interactive Sections** - About, Programs, Events, Gallery, Impact, Testimonials
- **Donation System** - Integrated Razorpay payment gateway
- **Volunteer Portal** - Application form for volunteers
- **Contact Forms** - Multiple contact options
- **Admin Panel** - Content management interface

### Backend (Node.js)
- **Express.js Server** - RESTful API architecture
- **SQLite Database** - Lightweight, file-based database
- **Authentication System** - JWT-based admin authentication
- **Security Features** - Rate limiting, input validation, XSS protection
- **Razorpay Integration** - Complete payment processing
- **Content Management** - CRUD operations for events, testimonials, stats

### Security Measures
- **Helmet.js** - Security headers and CSP
- **Rate Limiting** - Prevent abuse and DDoS
- **Input Validation** - Server-side validation with express-validator
- **XSS Protection** - Input sanitization
- **CORS Configuration** - Controlled cross-origin requests
- **Password Hashing** - bcrypt with configurable salt rounds
- **JWT Authentication** - Secure token-based auth
- **Session Management** - SQLite-based sessions

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Razorpay account (for payments)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Adhigam
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment example file and configure it:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Database Configuration
DB_PATH=./database/adhigam.db

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@adhigam.org

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
PASSWORD_SALT_ROUNDS=12

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,https://your-domain.com
```

### 4. Razorpay Setup
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the dashboard
3. Update the `.env` file with your keys
4. Configure webhook URL: `https://your-domain.com/api/donations/webhook`

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🗄️ Database Schema

The application uses SQLite with the following tables:

### Donations
```sql
CREATE TABLE donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_id TEXT,
    order_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Events
```sql
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Testimonials
```sql
CREATE TABLE testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Impact Statistics
```sql
CREATE TABLE impact_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_name TEXT UNIQUE NOT NULL,
    stat_value INTEGER NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Admin Users
```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);
```

## 🔐 Security Features

### Authentication
- JWT-based authentication for admin access
- Password hashing with bcrypt
- Session management with SQLite store
- Rate limiting for login attempts

### Input Validation
- Server-side validation for all inputs
- XSS protection through input sanitization
- SQL injection prevention with parameterized queries

### API Security
- CORS configuration for controlled access
- Helmet.js for security headers
- Rate limiting on all API endpoints
- Content Security Policy (CSP)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user info

### Donations
- `POST /api/donations/create` - Create donation record
- `POST /api/donations/verify` - Verify payment
- `GET /api/donations/all` - Get all donations (admin)
- `GET /api/donations/stats` - Get donation statistics
- `POST /api/donations/webhook` - Razorpay webhook

### Content Management
- `GET /api/content/events` - Get all events
- `POST /api/content/events` - Add new event
- `PUT /api/content/events/:id` - Update event
- `DELETE /api/content/events/:id` - Delete event
- `GET /api/content/testimonials` - Get all testimonials
- `POST /api/content/testimonials` - Add new testimonial
- `PUT /api/content/testimonials/:id` - Update testimonial
- `DELETE /api/content/testimonials/:id` - Delete testimonial
- `GET /api/content/impact-stats` - Get impact statistics
- `PUT /api/content/impact-stats` - Update impact statistics

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get all admin users
- `POST /api/admin/users` - Create new admin user
- `PUT /api/admin/users/:id` - Update admin user
- `DELETE /api/admin/users/:id` - Delete admin user
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/health` - System health check

## 🎯 Content Management

### Admin Panel Access
1. Click the gear icon (⚙️) in the bottom-right corner
2. Login with admin credentials (default: admin/admin123)
3. Use the panel to update content

### Features
- **Impact Statistics** - Update numbers in real-time
- **Event Management** - Add, edit, delete events
- **Testimonial Management** - Add new testimonials
- **Donation Records** - View and export donation data

## 🔧 Development

### Project Structure
```
Adhigam/
├── public/                 # Frontend files
│   ├── adhigam.html       # Main HTML file
│   ├── style.css          # Styles
│   └── script.js          # Frontend JavaScript
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── donations.js       # Donation routes
│   ├── content.js         # Content management routes
│   └── admin.js           # Admin routes
├── middleware/             # Middleware
│   └── auth.js            # Authentication middleware
├── database/               # Database files
│   └── init.js            # Database initialization
├── server.js              # Main server file
├── package.json           # Dependencies
└── env.example            # Environment variables example
```

### Adding New Features
1. Create route file in `routes/` directory
2. Add middleware in `middleware/` directory
3. Update database schema in `database/init.js`
4. Add frontend integration in `public/script.js`

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set `NODE_ENV=production` in `.env`
2. Update `ALLOWED_ORIGINS` with your domain
3. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "adhigam-ngo"
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-very-secure-jwt-secret
SESSION_SECRET=your-very-secure-session-secret
RAZORPAY_KEY_ID=your-razorpay-live-key
RAZORPAY_KEY_SECRET=your-razorpay-live-secret
ALLOWED_ORIGINS=https://your-domain.com
```

## 📈 Monitoring & Analytics

### Built-in Analytics
- Donation trends and statistics
- Top donors analysis
- Event engagement metrics
- System health monitoring

### Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## 🔒 Security Checklist

- [x] Input validation and sanitization
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Rate limiting
- [x] Secure headers (Helmet)
- [x] Password hashing
- [x] JWT token security
- [x] CORS configuration
- [x] Session security
- [x] Payment verification
- [x] Webhook signature validation

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if database directory exists
mkdir -p database
# Restart server
npm run dev
```

**Razorpay Integration Issues**
- Verify API keys in `.env`
- Check webhook URL configuration
- Ensure proper signature verification

**Admin Login Issues**
- Default credentials: admin/admin123
- Check JWT_SECRET in `.env`
- Clear browser localStorage

**CORS Errors**
- Update `ALLOWED_ORIGINS` in `.env`
- Restart server after changes

## 📞 Support

For technical support:
1. Check the console for error messages
2. Verify all environment variables
3. Ensure database files have proper permissions
4. Check Razorpay account configuration

## 📄 License

This project is licensed under the MIT License.

---

**Note**: This is a production-ready implementation with comprehensive security features. Remember to change default passwords and secrets before deploying to production. 