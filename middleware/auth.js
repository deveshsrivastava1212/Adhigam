const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../database/init');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Middleware to verify admin role
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Middleware to validate session
const validateSession = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Session expired or invalid' });
    }
    next();
};

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Function to verify password
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Function to hash password
const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

// Rate limiting for login attempts
const loginAttempts = new Map();

const checkLoginAttempts = (req, res, next) => {
    const ip = req.ip;
    const attempts = loginAttempts.get(ip) || 0;
    
    if (attempts >= 5) {
        return res.status(429).json({ 
            error: 'Too many login attempts. Please try again later.' 
        });
    }
    
    req.loginAttempts = attempts;
    next();
};

const recordLoginAttempt = (ip, success) => {
    if (success) {
        loginAttempts.delete(ip);
    } else {
        const attempts = loginAttempts.get(ip) || 0;
        loginAttempts.set(ip, attempts + 1);
        
        // Reset after 15 minutes
        setTimeout(() => {
            loginAttempts.delete(ip);
        }, 15 * 60 * 1000);
    }
};

// Input validation middleware
const validateLoginInput = (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Username and password are required' 
        });
    }
    
    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ 
            error: 'Invalid input types' 
        });
    }
    
    if (username.length < 3 || password.length < 6) {
        return res.status(400).json({ 
            error: 'Invalid credentials format' 
        });
    }
    
    next();
};

// Sanitize user input
const sanitizeInput = (req, res, next) => {
    // Basic XSS protection
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+=/gi, '');
            }
        }
        return obj;
    };
    
    if (req.body) {
        req.body = sanitize(req.body);
    }
    
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    validateSession,
    generateToken,
    verifyPassword,
    hashPassword,
    checkLoginAttempts,
    recordLoginAttempt,
    validateLoginInput,
    sanitizeInput
}; 