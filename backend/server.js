const express = require('express');
const dotenv = require('dotenv');
// Load environment variables FIRST
dotenv.config();

const cors = require('cors');
const helmet = require('helmet');

const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const queryRoutes = require('./routes/queryRoutes');
const authRoutes = require('./routes/authRoutes');

// Connect to database
connectDB().catch((err) => {
  console.error('Fatal: could not connect to MongoDB:', err.message || err);
  process.exit(1);
});

// Global safety net — log but don't crash (e.g. Puter SDK internal auth checks)
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled Promise Rejection (non-fatal):', reason?.message || reason);
});

const app = express();

// Trust Render/cloud proxy so express-rate-limit reads IPs correctly
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Secure HTTP headers
const ALLOWED_ORIGIN = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
}));
app.use(express.json());
// Prevent NoSQL Injection (Express 5 compatible — only sanitizes req.body)
app.use((req, _res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  next();
});

// Rate Limiting (100 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
});
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', queryRoutes);

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LLMForge API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
