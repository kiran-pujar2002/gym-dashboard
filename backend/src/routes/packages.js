const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

const packageSchema = z.object({
  name: z.string().min(1),
  duration: z.number().int().min(1),
  monthlyPrice: z.number().min(0),
  admissionFee: z.number().min(0),
  cardioFee: z.number().min(0),
});

// GET all packages
router.get('/', async (req, res) => {
  try {
    const packages = await prisma.package.findMany({ orderBy: { duration: 'asc' } });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// POST create package
router.post('/', async (req, res) => {
  try {
    const data = packageSchema.parse(req.body);
    const pkg = await prisma.package.create({ data });
    res.status(201).json(pkg);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
    res.status(500).json({ error: 'Failed to create package' });
  }
});

// DELETE package
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.package.delete({ where: { id } });
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete package. It may be in use by members.' });
  }
});
// UPDATE a package
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = packageSchema.parse(req.body);
    
    const updatedPackage = await prisma.package.update({
      where: { id },
      data,
    });
    
    res.json(updatedPackage);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Failed to update package' });
  }
});
module.exports = router;