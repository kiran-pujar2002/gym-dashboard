const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-gym-key';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const owner = await prisma.owner.findUnique({ where: { email } });
    if (!owner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, owner.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: owner.id, email: owner.email }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, owner: { id: owner.id, name: owner.name, email: owner.email } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
    res.status(500).json({ error: 'Login failed' });
  }
});

// TEMPORARY SIGNUP ROUTE (Run once, then comment out or secure it)
router.post('/setup-owner', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const owner = await prisma.owner.create({
      data: { email, password: hashedPassword, name }
    });
    res.status(201).json({ message: 'Owner created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create owner' });
  }
});

module.exports = router;