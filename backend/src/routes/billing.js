const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { sendPaymentReceipt } = require('../utils/email'); // <-- Import email utility

const router = express.Router();
const prisma = new PrismaClient();

// GET all recent payments
router.get('/', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { member: true },
      orderBy: { date: 'desc' },
      take: 50 // Get latest 50
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// POST record a payment (Mark as paid + create history + send email)
router.post('/collect', async (req, res) => {
  try {
    const { memberId, amount, notes } = req.body;
    
    // 1. Log the payment in the database
    const payment = await prisma.payment.create({
      data: {
        memberId: parseInt(memberId),
        amount: parseFloat(amount),
        notes: notes || 'Membership Renewal'
      }
    });

    // 2. Fetch member details to calculate next due date
    const member = await prisma.member.findUnique({ 
      where: { id: parseInt(memberId) },
      include: { package: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // 3. Calculate new due date based on their package duration
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + member.package.duration);

    // 4. Update the member's status
    await prisma.member.update({
      where: { id: parseInt(memberId) },
      data: { 
        isPaid: true, 
        nextDueDate,
        totalPaid: { increment: parseFloat(amount) } // Also add to their total paid
      }
    });

    // 5. Send the email receipt (if the member has an email)
    if (member.email) {
      await sendPaymentReceipt(member.email, member.name, amount, notes);
    }

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

module.exports = router;