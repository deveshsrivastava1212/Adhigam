const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'adhigam.db');

let db;

function getDatabase() {
    if (!db) {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
            }
        });
    }
    return db;
}

async function initDatabase() {
    const database = getDatabase();
    
    return new Promise((resolve, reject) => {
        database.serialize(() => {
            // Create donations table
            database.run(`
                CREATE TABLE IF NOT EXISTS donations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    donor_name TEXT NOT NULL,
                    donor_email TEXT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    payment_id TEXT,
                    order_id TEXT,
                    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create events table
            database.run(`
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    event_date DATE NOT NULL,
                    event_time TEXT NOT NULL,
                    location TEXT NOT NULL,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create testimonials table
            database.run(`
                CREATE TABLE IF NOT EXISTS testimonials (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    text TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create impact_stats table
            database.run(`
                CREATE TABLE IF NOT EXISTS impact_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stat_name TEXT UNIQUE NOT NULL,
                    stat_value INTEGER NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create admin_users table
            database.run(`
                CREATE TABLE IF NOT EXISTS admin_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'admin',
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )
            `);

            // Create sessions table for admin sessions
            database.run(`
                CREATE TABLE IF NOT EXISTS admin_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT UNIQUE NOT NULL,
                    user_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES admin_users (id)
                )
            `);

            // Insert default admin user
            database.run(`
                INSERT OR IGNORE INTO admin_users (username, email, password_hash, role)
                VALUES (?, ?, ?, 'admin')
            `, [
                process.env.ADMIN_USERNAME || 'admin',
                process.env.ADMIN_EMAIL || 'admin@adhigam.org',
                bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 12)
            ]);

            // Insert default impact stats
            database.run(`
                INSERT OR IGNORE INTO impact_stats (stat_name, stat_value) VALUES 
                ('children_empowered', 500),
                ('weekly_sessions', 50),
                ('active_programs', 3),
                ('volunteers', 25)
            `);

            // Insert sample events
            database.run(`
                INSERT OR IGNORE INTO events (title, event_date, event_time, location, description) VALUES 
                ('Art Workshop for Children', '2024-02-15', '10:00 AM - 2:00 PM', 'Community Center', 'Creative art workshop focusing on modern techniques for children aged 8-12.'),
                ('Educational Seminar', '2024-02-20', '3:00 PM - 5:00 PM', 'Local School', 'Educational seminar on modern learning techniques and child development.'),
                ('Volunteer Training', '2024-02-25', '9:00 AM - 12:00 PM', 'Adhigam Office', 'Training session for new volunteers joining our programs.')
            `);

            // Insert sample testimonials
            database.run(`
                INSERT OR IGNORE INTO testimonials (name, role, text) VALUES 
                ('Anjali Patel', 'Parent', 'The creative learning program has transformed my daughter confidence. She now expresses herself freely through art and storytelling.'),
                ('Rajesh Kumar', 'Volunteer', 'Being part of Adhigam has been incredibly rewarding. The impact we make on children lives is truly inspiring.'),
                ('Priya Sharma', 'Community Member', 'The educational programs have brought positive change to our community. Children are more engaged and confident.')
            `);

            console.log('Database initialized successfully');
            resolve();
        });
    });
}

function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

module.exports = {
    getDatabase,
    initDatabase,
    closeDatabase
}; 