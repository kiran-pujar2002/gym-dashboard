const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

const settingsSchema = z.object({
  admissionFee: z.number().min(0),
  monthlyFee: z.number().min(0),
  cardioFee: z.number().min(0),
});

// GET current settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      // If no settings exist, create the default ones
      settings = await prisma.settings.create({ data: {} });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE settings
router.put('/', async (req, res) => {
  try {
    const data = settingsSchema.parse(req.body);
    let settings = await prisma.settings.findFirst();
    
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data,
      });
    } else {
      settings = await prisma.settings.create({ data });
    }
    
    res.json(settings);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;