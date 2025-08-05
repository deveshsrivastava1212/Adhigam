const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
    authenticateToken, 
    generateToken, 
    verifyPassword, 
    checkLoginAttempts, 
    recordLoginAttempt,
    validateLoginInput,
    sanitizeInput
} = require('../middleware/auth');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Login route with validation
router.post('/login', [
    sanitizeInput,
    validateLoginInput,
    checkLoginAttempts,
    body('username').trim().isLength({ min: 3 }).escape(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { username, password } = req.body;
        const database = getDatabase();

        // Find user by username or email
        database.get(
            'SELECT * FROM admin_users WHERE (username = ? OR email = ?) AND is_active = 1',
            [username, username],
            async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!user) {
                    recordLoginAttempt(req.ip, false);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Verify password
                const isValidPassword = await verifyPassword(password, user.password_hash);
                if (!isValidPassword) {
                    recordLoginAttempt(req.ip, false);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Update last login
                database.run(
                    'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                    [user.id]
                );

                // Generate JWT token
                const token = generateToken(user);

                // Set session
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.role = user.role;

                // Record successful login
                recordLoginAttempt(req.ip, true);

                res.json({
                    message: 'Login successful',
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    try {
        // Clear session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }
            
            res.json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token route
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
    const database = getDatabase();
    
    database.get(
        'SELECT id, username, email, role, created_at, last_login FROM admin_users WHERE id = ? AND is_active = 1',
        [req.user.id],
        (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        }
    );
});

// Change password route
router.post('/change-password', [
    authenticateToken,
    body('currentPassword').isLength({ min: 6 }),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { currentPassword, newPassword } = req.body;
        const database = getDatabase();

        // Get current user
        database.get(
            'SELECT password_hash FROM admin_users WHERE id = ?',
            [req.user.id],
            async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Verify current password
                const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Current password is incorrect' });
                }

                // Hash new password
                const newPasswordHash = await bcrypt.hash(newPassword, 12);

                // Update password
                database.run(
                    'UPDATE admin_users SET password_hash = ? WHERE id = ?',
                    [newPasswordHash, req.user.id],
                    (err) => {
                        if (err) {
                            console.error('Password update error:', err);
                            return res.status(500).json({ error: 'Failed to update password' });
                        }

                        res.json({ message: 'Password updated successfully' });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh token route
router.post('/refresh', authenticateToken, (req, res) => {
    try {
        const database = getDatabase();
        
        database.get(
            'SELECT * FROM admin_users WHERE id = ? AND is_active = 1',
            [req.user.id],
            (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'User not found or inactive' });
                }

                // Generate new token
                const newToken = generateToken(user);

                res.json({
                    message: 'Token refreshed',
                    token: newToken,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 