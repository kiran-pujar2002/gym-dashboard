const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const memberRoutes = require('./routes/members');
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages'); // <-- NEW
const billingRoutes = require('./routes/billing');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/packages', packageRoutes); // <-- NEW
app.use('/api/billing', billingRoutes);

module.exports = app;