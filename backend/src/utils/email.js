const { Resend } = require('resend');

// Initialize Resend with the API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (memberEmail, memberName, packageName, totalPaid) => {
  try {
    await resend.emails.send({
      from: 'GymOS <onboarding@resend.dev>', // Change to your domain later
      to: memberEmail,
      subject: 'Welcome to the Gym! 🏋️',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #2563eb;">Welcome, ${memberName}!</h2>
          <p>We are thrilled to have you join our gym.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Package:</strong> ${packageName}</p>
            <p style="margin: 5px 0 0 0;"><strong>Amount Paid:</strong> ₹${totalPaid}</p>
          </div>
          <p>Your membership is now active. See you at the gym!</p>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">- The GymOS Team</p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${memberEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

const sendPaymentReceipt = async (memberEmail, memberName, amount, notes) => {
  try {
    await resend.emails.send({
      from: 'GymOS <onboarding@resend.dev>',
      to: memberEmail,
      subject: 'Payment Receipt - GymOS 🧾',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #059669;">Payment Received</h2>
          <p>Hi ${memberName},</p>
          <p>Thank you for your payment. Here is your receipt.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 18px;"><strong>Amount Paid:</strong> ₹${amount}</p>
            <p style="margin: 10px 0 0 0; color: #166534;"><strong>Notes:</strong> ${notes}</p>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">- The GymOS Team</p>
        </div>
      `,
    });
    console.log(`Payment receipt sent to ${memberEmail}`);
  } catch (error) {
    console.error('Failed to send receipt email:', error);
  }
};

module.exports = { sendWelcomeEmail, sendPaymentReceipt };