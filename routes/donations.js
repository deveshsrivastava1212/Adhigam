const express = require('express');
const { body, validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { getDatabase } = require('../database/init');
const { sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create donation record
router.post('/create', [
    sanitizeInput,
    body('donor_name').trim().isLength({ min: 2, max: 100 }).escape(),
    body('donor_email').isEmail().normalizeEmail(),
    body('amount').isFloat({ min: 100 }).withMessage('Minimum donation amount is ₹100'),
    body('phone').optional().isMobilePhone('en-IN'),
    body('message').optional().trim().isLength({ max: 500 }).escape()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { donor_name, donor_email, amount, phone, message } = req.body;
        const database = getDatabase();

        // Create Razorpay order
        const orderOptions = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: 'INR',
            receipt: `donation_${Date.now()}`,
            notes: {
                donor_name,
                donor_email,
                phone: phone || '',
                message: message || ''
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        // Save donation record to database
        database.run(
            `INSERT INTO donations (donor_name, donor_email, amount, order_id, status) 
             VALUES (?, ?, ?, ?, 'pending')`,
            [donor_name, donor_email, amount, order.id],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to create donation record' });
                }

                res.json({
                    success: true,
                    order_id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    key_id: process.env.RAZORPAY_KEY_ID
                });
            }
        );
    } catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({ error: 'Failed to create donation order' });
    }
});

// Verify payment and update donation status
router.post('/verify', [
    sanitizeInput,
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty()
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify signature
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (signature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Update donation status in database
        const database = getDatabase();
        database.run(
            `UPDATE donations 
             SET payment_id = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP 
             WHERE order_id = ?`,
            [razorpay_payment_id, razorpay_order_id],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to update donation status' });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Donation record not found' });
                }

                res.json({
                    success: true,
                    message: 'Payment verified successfully'
                });
            }
        );
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

// Get all donations (admin only)
router.get('/all', (req, res) => {
    const database = getDatabase();
    
    database.all(
        `SELECT id, donor_name, donor_email, amount, payment_id, order_id, status, 
                created_at, updated_at 
         FROM donations 
         ORDER BY created_at DESC`,
        (err, donations) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch donations' });
            }

            res.json({ donations });
        }
    );
});

// Get donation statistics
router.get('/stats', (req, res) => {
    const database = getDatabase();
    
    database.get(
        `SELECT 
            COUNT(*) as total_donations,
            SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_donations,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_donations
         FROM donations`,
        (err, stats) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch donation statistics' });
            }

            res.json({ stats });
        }
    );
});

// Get donation by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const database = getDatabase();
    
    database.get(
        `SELECT * FROM donations WHERE id = ?`,
        [id],
        (err, donation) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to fetch donation' });
            }

            if (!donation) {
                return res.status(404).json({ error: 'Donation not found' });
            }

            res.json({ donation });
        }
    );
});

// Webhook for Razorpay events
router.post('/webhook', (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const text = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const event = req.body;
        const database = getDatabase();

        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id;

            // Update donation status
            database.run(
                `UPDATE donations 
                 SET payment_id = ?, status = 'completed', updated_at = CURRENT_TIMESTAMP 
                 WHERE order_id = ?`,
                [payment.id, orderId],
                function(err) {
                    if (err) {
                        console.error('Webhook database error:', err);
                    } else {
                        console.log('Payment webhook processed successfully');
                    }
                }
            );
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Export donation data (admin only)
router.get('/export/csv', (req, res) => {
    const database = getDatabase();
    
    database.all(
        `SELECT donor_name, donor_email, amount, payment_id, order_id, status, created_at 
         FROM donations 
         ORDER BY created_at DESC`,
        (err, donations) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to export donations' });
            }

            // Create CSV content
            const csvHeader = 'Donor Name,Email,Amount,Payment ID,Order ID,Status,Date\n';
            const csvContent = donations.map(donation => 
                `"${donation.donor_name}","${donation.donor_email}",${donation.amount},"${donation.payment_id || ''}","${donation.order_id}","${donation.status}","${donation.created_at}"`
            ).join('\n');

            const csvData = csvHeader + csvContent;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
            res.send(csvData);
        }
    );
});

module.exports = router; 