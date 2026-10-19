const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { sendWelcomeEmail } = require('../utils/email'); // <-- Import

const router = express.Router();
const prisma = new PrismaClient();

const memberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  packageId: z.number().int(),
  hasCardio: z.boolean(),
  admissionPaid: z.boolean(),
});

router.post('/', async (req, res) => {
  try {
    const data = memberSchema.parse(req.body);

    const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const planCost = pkg.monthlyPrice * pkg.duration;
    const cardioCost = data.hasCardio ? pkg.cardioFee * pkg.duration : 0;
    const admissionCost = data.admissionPaid ? pkg.admissionFee : 0;
    const totalPaid = planCost + cardioCost + admissionCost;

    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + pkg.duration);

    const member = await prisma.member.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        packageId: data.packageId,
        hasCardio: data.hasCardio,
        admissionPaid: data.admissionPaid,
        totalPaid: totalPaid,
        nextDueDate: nextDueDate,
      },
    });

    // Send Welcome Email (Await it so we know it succeeded, but catch errors inside the utility)
    await sendWelcomeEmail(member.email, member.name, pkg.name, totalPaid);

    res.status(201).json(member);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ 
      include: { package: true },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.member.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
});
// MARK MEMBER AS PAID
router.put('/:id/pay', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Fetch member to calculate next due date
    const member = await prisma.member.findUnique({ 
      where: { id },
      include: { package: true }
    });

    if (!member) return res.status(404).json({ error: 'Member not found' });

    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + member.package.duration);

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        isPaid: true,
        nextDueDate: nextDueDate,
      },
    });

    res.json(updatedMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as paid' });
  }
});

// UPDATE a member
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = memberSchema.parse(req.body);

    const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const planCost = pkg.monthlyPrice * pkg.duration;
    const cardioCost = data.hasCardio ? pkg.cardioFee * pkg.duration : 0;
    const admissionCost = data.admissionPaid ? pkg.admissionFee : 0;
    const totalPaid = planCost + cardioCost + admissionCost;

    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + pkg.duration);

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        packageId: data.packageId,
        hasCardio: data.hasCardio,
        admissionPaid: data.admissionPaid,
        totalPaid: totalPaid,
        nextDueDate: nextDueDate,
      },
    });

    res.json(updatedMember);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ errors: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

module.exports = router;