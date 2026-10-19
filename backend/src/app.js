const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const memberRoutes = require('./routes/members');
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const billingRoutes = require('./routes/billing');

const app = express();

app.use(helmet());

// Your exact Vercel URL goes here
app.use(cors({ 
  origin: ['https://gym-dashboard-self-tau.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// The health route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/billing', billingRoutes);

module.exports = app;