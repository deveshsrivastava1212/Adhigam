const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin, sanitizeInput } = require('../middleware/auth');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard data
router.get('/dashboard', (req, res) => {
    const database = getDatabase();
    
    // Get comprehensive dashboard statistics
    database.get(
        `SELECT 
            (SELECT COUNT(*) FROM donations WHERE status = 'completed') as completed_donations,
            (SELECT SUM(amount) FROM donations WHERE status = 'completed') as total_amount,
            (SELECT COUNT(*) FROM events) as total_events,
            (SELECT COUNT(*) FROM testimonials) as total_testimonials,
            (SELECT COUNT(*) FROM admin_users WHERE is_active = 1) as active_admins,
            (SELECT COUNT(*) FROM donations WHERE status = 'pending') as pending_donations`,
        (err, stats) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch dashboard data' });
            }

            // Get recent donations
            database.all(
                `SELECT donor_name, donor_email, amount, status, created_at 
                 FROM donations 
                 ORDER BY created_at DESC 
                 LIMIT 10`,
                (err, recentDonations) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to fetch recent donations' });
                    }

                    // Get upcoming events
                    database.all(
                        `SELECT title, event_date, event_time, location 
                         FROM events 
                         WHERE event_date >= date('now') 
                         ORDER BY event_date ASC 
                         LIMIT 5`,
                        (err, upcomingEvents) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.status(500).json({ error: 'Failed to fetch upcoming events' });
                            }

                            res.json({
                                stats,
                                recentDonations,
                                upcomingEvents
                            });
                        }
                    );
                }
            );
        }
    );
});

// Get all admin users
router.get('/users', (req, res) => {
    const database = getDatabase();
    
    database.all(
        `SELECT id, username, email, role, is_active, created_at, last_login 
         FROM admin_users 
         ORDER BY created_at DESC`,
        (err, users) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch users' });
            }

            res.json({ users });
        }
    );
});

// Create new admin user
router.post('/users', [
    sanitizeInput,
    body('username').trim().isLength({ min: 3, max: 50 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role').optional().isIn(['admin', 'editor']).withMessage('Role must be admin or editor')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { username, email, password, role = 'editor' } = req.body;
        const database = getDatabase();

        // Check if username or email already exists
        database.get(
            'SELECT id FROM admin_users WHERE username = ? OR email = ?',
            [username, email],
            async (err, existingUser) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to check existing user' });
                }

                if (existingUser) {
                    return res.status(400).json({ error: 'Username or email already exists' });
                }

                // Hash password
                const bcrypt = require('bcryptjs');
                const passwordHash = await bcrypt.hash(password, 12);

                // Create new user
                database.run(
                    `INSERT INTO admin_users (username, email, password_hash, role) 
                     VALUES (?, ?, ?, ?)`,
                    [username, email, passwordHash, role],
                    function(err) {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Failed to create user' });
                        }

                        res.json({
                            success: true,
                            message: 'User created successfully',
                            user_id: this.lastID
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update admin user
router.put('/users/:id', [
    sanitizeInput,
    body('username').optional().trim().isLength({ min: 3, max: 50 }).escape(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'editor']),
    body('is_active').optional().isBoolean()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { id } = req.params;
        const updates = req.body;
        const database = getDatabase();

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        Object.keys(updates).forEach(key => {
            if (['username', 'email', 'role', 'is_active'].includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updateValues.push(id);

        database.run(
            `UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues,
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update user' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    success: true,
                    message: 'User updated successfully'
                });
            }
        );
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete admin user
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const database = getDatabase();

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    database.run(
        'DELETE FROM admin_users WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to delete user' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        }
    );
});

// Get system logs (basic implementation)
router.get('/logs', (req, res) => {
    // In a real implementation, you would have a logs table
    // For now, return basic system information
    res.json({
        logs: [
            {
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'System running normally'
            }
        ],
        systemInfo: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
        }
    });
});

// Backup database
router.post('/backup', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    try {
        const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/adhigam.db');
        const backupPath = path.join(__dirname, '../database/backup_' + Date.now() + '.db');
        
        fs.copyFileSync(dbPath, backupPath);
        
        res.json({
            success: true,
            message: 'Database backup created successfully',
            backup_path: backupPath
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ error: 'Failed to create backup' });
    }
});

// Get system health
router.get('/health', (req, res) => {
    const database = getDatabase();
    
    // Test database connection
    database.get('SELECT 1 as test', (err, result) => {
        if (err) {
            return res.status(500).json({
                status: 'unhealthy',
                database: 'disconnected',
                error: err.message
            });
        }

        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    });
});

// Get analytics data
router.get('/analytics', (req, res) => {
    const database = getDatabase();
    
    // Get monthly donation trends
    database.all(
        `SELECT 
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as donation_count,
            SUM(amount) as total_amount
         FROM donations 
         WHERE status = 'completed'
         GROUP BY strftime('%Y-%m', created_at)
         ORDER BY month DESC
         LIMIT 12`,
        (err, monthlyTrends) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch analytics' });
            }

            // Get top donors
            database.all(
                `SELECT donor_name, donor_email, SUM(amount) as total_donated, COUNT(*) as donation_count
                 FROM donations 
                 WHERE status = 'completed'
                 GROUP BY donor_email
                 ORDER BY total_donated DESC
                 LIMIT 10`,
                (err, topDonors) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Failed to fetch analytics' });
                    }

                    res.json({
                        monthlyTrends,
                        topDonors
                    });
                }
            );
        }
    );
});

module.exports = router; 