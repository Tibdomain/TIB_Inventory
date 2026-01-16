const express = require('express');
const router2 = express.Router();
const sqlDBConnect = require('./dbConnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Database initialization - create loginsystem table if it doesn't exist
function initDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS loginsystem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `;
    
    sqlDBConnect.query(createTableQuery, [], (error) => {
        if (error) {
            console.error('Database initialization error:', error);
            return;
        }

        // Check if admin user exists
        sqlDBConnect.query(
            'SELECT * FROM loginsystem WHERE username = ?',
            ['admin'],
            async (err, adminRows) => {
                if (err) {
                    console.error('Admin check error:', err);
                    return;
                }

                if (adminRows.length === 0) {
                    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
                    sqlDBConnect.query(
                        'INSERT INTO loginsystem (username, email, password, role) VALUES (?, ?, ?, ?)',
                        ['admin', process.env.ADMIN_EMAIL, hashedPassword, 'admin'],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('Admin creation error:', insertErr);
                                return;
                            }
                            console.log('Default admin user created');
                        }
                    );
                }
            }
        );
        console.log('Database initialized successfully');
    });
}

// Initialize database on server start
initDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

// Login route
router2.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    sqlDBConnect.query(
        'SELECT * FROM loginsystem WHERE email = ?',
        [email],
        async (err, rows) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ message: 'Database connection error' });
            }

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = rows[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            sqlDBConnect.query(
                'UPDATE loginsystem SET last_login = NOW() WHERE id = ?',
                [user.id]
            );

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(200).json({
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
});

// Register route
router2.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    sqlDBConnect.query(
        'SELECT * FROM loginsystem WHERE email = ? OR username = ?',
        [email, username],
        async (err, existingUsers) => {
            if (err) {
                console.error('Registration error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (existingUsers.length > 0) {
                return res.status(409).json({ message: 'Username or email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            sqlDBConnect.query(
                'INSERT INTO loginsystem (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                (insertErr, result) => {
                    if (insertErr) {
                        console.error('User insertion error:', insertErr);
                        return res.status(500).json({ message: 'Error creating user' });
                    }

                    res.status(201).json({
                        message: 'User registered successfully',
                        userId: result.insertId
                    });
                }
            );
        }
    );
});

// Get user profile (protected route)
router2.get('/profile', authenticateToken, (req, res) => {
    sqlDBConnect.query(
        'SELECT id, username, email, role, created_at, last_login FROM loginsystem WHERE id = ?',
        [req.user.id],
        (err, rows) => {
            if (err) {
                console.error('Profile fetch error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ user: rows[0] });
        }
    );
});

module.exports = { router2, authenticateToken };
