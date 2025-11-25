const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Database connection
let pool = null;

if (process.env.DATABASE_URL) {
  // Extract hostname for debugging (without exposing credentials)
  const urlMatch = process.env.DATABASE_URL.match(/@([^:\/]+)/);
  const hostname = urlMatch ? urlMatch[1] : 'unknown';

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });
  console.log('Database connection configured');
  console.log('Connecting to hostname:', hostname);
} else {
  console.warn('WARNING: DATABASE_URL not set - email signup will not work');
}

// Initialize database table
async function initDB() {
  if (!pool) {
    console.log('Skipping database initialization - no DATABASE_URL');
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_signups (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database table initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    console.error('DATABASE_URL value:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET');
  }
}

// Initialize DB on startup
initDB();

// API endpoint to receive email submissions
app.post('/api/signup', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (!pool) {
    console.error('Email signup attempted but DATABASE_URL not configured');
    return res.status(503).json({
      success: false,
      message: 'Email signup is temporarily unavailable. Please try again later.'
    });
  }

  try {
    await pool.query(
      'INSERT INTO email_signups (email) VALUES ($1)',
      [email.toLowerCase()]
    );

    console.log('Email signup successful:', email);
    res.json({
      success: true,
      message: 'Thank you for signing up! We will be in touch soon.'
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    console.error('Database error:', error.message);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
