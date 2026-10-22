require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);

if (!process.env.SESSION_SECRET || !process.env.ADMIN_PASSWORD) {
  console.error('Missing SESSION_SECRET or ADMIN_PASSWORD. Copy .env.example to .env and set them.');
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sss_institution',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(session({
  name: 'sss.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

const allowedCourses = new Set([
  'Full Stack Development', 'Java Programming', 'Python Programming',
  'Web Design', 'Data Analytics', 'Computer Basics'
]);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    res.status(500).json({ ok: false, message: 'Database connection failed. Check MySQL settings in .env.' });
  }
});

app.post('/api/students', async (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const course = String(req.body.course || '').trim();
  const education = String(req.body.education || '').trim();
  const message = String(req.body.message || '').trim();

  if (fullName.length < 2 || fullName.length > 120) return res.status(400).json({ message: 'Please enter a name between 2 and 120 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone)) return res.status(400).json({ message: 'Please enter a valid phone number.' });
  if (!allowedCourses.has(course)) return res.status(400).json({ message: 'Please select a course from the list.' });
  if (!education || education.length > 120) return res.status(400).json({ message: 'Please enter your education.' });
  if (message.length > 1000) return res.status(400).json({ message: 'Message must be 1000 characters or less.' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO students (full_name, email, phone, course, education, message) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, course, education, message || null]
    );
    res.status(201).json({ message: 'Registration submitted successfully! Our team will contact you.', id: result.insertId });
  } catch (err) {
    console.error('Student insert failed:', err.message);
    res.status(500).json({ message: 'Could not save your details. Check that MySQL is running and the table has been created.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const password = String(req.body.password || '');
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ message: 'Incorrect admin password.' });
  req.session.isAdmin = true;
  res.json({ message: 'Logged in successfully.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) return res.status(401).json({ message: 'Please log in as admin first.' });
  next();
}

app.get('/api/admin/me', (req, res) => res.json({ isAdmin: Boolean(req.session.isAdmin) }));
app.get('/api/admin/students', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, full_name AS fullName, email, phone, course, education, message, created_at AS createdAt FROM students ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Student list failed:', err.message);
    res.status(500).json({ message: 'Could not load student records.' });
  }
});

app.delete('/api/admin/students/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid student ID.' });
  try {
    const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Student record not found.' });
    res.json({ message: 'Student record deleted.' });
  } catch (err) {
    console.error('Student delete failed:', err.message);
    res.status(500).json({ message: 'Could not delete this record.' });
  }
});

app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connection successful.');
  } catch (err) {
    console.error('Could not connect to MySQL:', err.message);
    console.error('Start MySQL and check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env.');
  }
  app.listen(PORT, () => console.log(`SSS Institution website running at http://localhost:${PORT}`));
}
start();
