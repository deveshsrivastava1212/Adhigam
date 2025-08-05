const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/events', (req, res) => {
    const database = getDatabase();
    
    database.all(
        `SELECT * FROM events ORDER BY event_date DESC`,
        (err, events) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch events' });
            }

            res.json({ events });
        }
    );
});

// Add new event
router.post('/events', [
    sanitizeInput,
    body('title').trim().isLength({ min: 3, max: 200 }).escape(),
    body('event_date').isISO8601().toDate(),
    body('event_time').trim().isLength({ min: 1, max: 100 }).escape(),
    body('location').trim().isLength({ min: 3, max: 200 }).escape(),
    body('description').optional().trim().isLength({ max: 1000 }).escape()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { title, event_date, event_time, location, description } = req.body;
        const database = getDatabase();

        database.run(
            `INSERT INTO events (title, event_date, event_time, location, description) 
             VALUES (?, ?, ?, ?, ?)`,
            [title, event_date, event_time, location, description || ''],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to add event' });
                }

                res.json({
                    success: true,
                    message: 'Event added successfully',
                    event_id: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Add event error:', error);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

// Update event
router.put('/events/:id', [
    sanitizeInput,
    body('title').optional().trim().isLength({ min: 3, max: 200 }).escape(),
    body('event_date').optional().isISO8601().toDate(),
    body('event_time').optional().trim().isLength({ min: 1, max: 100 }).escape(),
    body('location').optional().trim().isLength({ min: 3, max: 200 }).escape(),
    body('description').optional().trim().isLength({ max: 1000 }).escape()
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
            if (['title', 'event_date', 'event_time', 'location', 'description'].includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);

        database.run(
            `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues,
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update event' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Event not found' });
                }

                res.json({
                    success: true,
                    message: 'Event updated successfully'
                });
            }
        );
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event
router.delete('/events/:id', (req, res) => {
    const { id } = req.params;
    const database = getDatabase();

    database.run(
        'DELETE FROM events WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to delete event' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json({
                success: true,
                message: 'Event deleted successfully'
            });
        }
    );
});

// Get all testimonials
router.get('/testimonials', (req, res) => {
    const database = getDatabase();
    
    database.all(
        `SELECT * FROM testimonials ORDER BY created_at DESC`,
        (err, testimonials) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch testimonials' });
            }

            res.json({ testimonials });
        }
    );
});

// Add new testimonial
router.post('/testimonials', [
    sanitizeInput,
    body('name').trim().isLength({ min: 2, max: 100 }).escape(),
    body('role').trim().isLength({ min: 2, max: 100 }).escape(),
    body('text').trim().isLength({ min: 10, max: 500 }).escape()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { name, role, text } = req.body;
        const database = getDatabase();

        database.run(
            `INSERT INTO testimonials (name, role, text) VALUES (?, ?, ?)`,
            [name, role, text],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to add testimonial' });
                }

                res.json({
                    success: true,
                    message: 'Testimonial added successfully',
                    testimonial_id: this.lastID
                });
            }
        );
    } catch (error) {
        console.error('Add testimonial error:', error);
        res.status(500).json({ error: 'Failed to add testimonial' });
    }
});

// Update testimonial
router.put('/testimonials/:id', [
    sanitizeInput,
    body('name').optional().trim().isLength({ min: 2, max: 100 }).escape(),
    body('role').optional().trim().isLength({ min: 2, max: 100 }).escape(),
    body('text').optional().trim().isLength({ min: 10, max: 500 }).escape()
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
            if (['name', 'role', 'text'].includes(key)) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(id);

        database.run(
            `UPDATE testimonials SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues,
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update testimonial' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Testimonial not found' });
                }

                res.json({
                    success: true,
                    message: 'Testimonial updated successfully'
                });
            }
        );
    } catch (error) {
        console.error('Update testimonial error:', error);
        res.status(500).json({ error: 'Failed to update testimonial' });
    }
});

// Delete testimonial
router.delete('/testimonials/:id', (req, res) => {
    const { id } = req.params;
    const database = getDatabase();

    database.run(
        'DELETE FROM testimonials WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to delete testimonial' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Testimonial not found' });
            }

            res.json({
                success: true,
                message: 'Testimonial deleted successfully'
            });
        }
    );
});

// Get impact statistics
router.get('/impact-stats', (req, res) => {
    const database = getDatabase();
    
    database.all(
        `SELECT stat_name, stat_value, updated_at FROM impact_stats`,
        (err, stats) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch impact statistics' });
            }

            res.json({ stats });
        }
    );
});

// Update impact statistics
router.put('/impact-stats', [
    sanitizeInput,
    body('children_empowered').optional().isInt({ min: 0 }),
    body('weekly_sessions').optional().isInt({ min: 0 }),
    body('active_programs').optional().isInt({ min: 0 }),
    body('volunteers').optional().isInt({ min: 0 })
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const updates = req.body;
        const database = getDatabase();

        // Update each statistic
        const updatePromises = Object.keys(updates).map(statName => {
            return new Promise((resolve, reject) => {
                database.run(
                    `UPDATE impact_stats SET stat_value = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE stat_name = ?`,
                    [updates[statName], statName],
                    function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        });

        Promise.all(updatePromises)
            .then(() => {
                res.json({
                    success: true,
                    message: 'Impact statistics updated successfully'
                });
            })
            .catch(error => {
                console.error('Database error:', error);
                res.status(500).json({ error: 'Failed to update impact statistics' });
            });
    } catch (error) {
        console.error('Update impact stats error:', error);
        res.status(500).json({ error: 'Failed to update impact statistics' });
    }
});

// Get content summary
router.get('/summary', (req, res) => {
    const database = getDatabase();
    
    database.get(
        `SELECT 
            (SELECT COUNT(*) FROM events) as total_events,
            (SELECT COUNT(*) FROM testimonials) as total_testimonials,
            (SELECT COUNT(*) FROM donations WHERE status = 'completed') as total_donations,
            (SELECT SUM(amount) FROM donations WHERE status = 'completed') as total_amount`,
        (err, summary) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch content summary' });
            }

            res.json({ summary });
        }
    );
});

module.exports = router; 