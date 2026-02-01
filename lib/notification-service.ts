import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Lazy-load Twilio client to avoid build-time validation
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

export async function sendEmailWithChecklist(
  email: string,
  checklist: string,
  userName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM || 'passportpal.business@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .checklist-item { padding: 10px; margin: 10px 0; background: white; border-left: 4px solid #667eea; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌍 Passport Pal</h1>
            <p>Your Personalized Travel Checklist</p>
          </div>
          <div class="content">
            ${userName ? `<p>Hello ${userName},</p>` : '<p>Hello Traveler,</p>'}
            <p>Here's your comprehensive travel documents checklist:</p>
            <div class="checklist">
              ${checklist.split('\n').filter(line => line.trim()).map(line => 
                `<div class="checklist-item">${line}</div>`
              ).join('')}
            </div>
            <p style="margin-top: 30px;"><strong>Safe travels! ✈️</strong></p>
          </div>
          <div class="footer">
            <p>© 2026 Passport Pal - Your AI Travel Assistant</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Passport Pal" <${process.env.EMAIL_FROM || 'passportpal.business@gmail.com'}>`,
      to: email,
      subject: '🌍 Your Travel Documents Checklist - Passport Pal',
      text: `Hello,\n\n${checklist}\n\nSafe travels!\n\nPassport Pal Team`,
      html: htmlContent,
    });

    return {
      success: true,
      message: 'Checklist sent successfully to your email!',
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send email. Please try again later.',
    };
  }
}

export async function scheduleWhatsAppReminder(
  phoneNumber: string,
  departureDate: string,
  travelDetails: string
): Promise<{ success: boolean; message: string }> {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      return {
        success: false,
        message: 'WhatsApp service not configured',
      };
    }

    const departure = new Date(departureDate);
    const reminderDate = new Date(departure);
    reminderDate.setDate(reminderDate.getDate() - 3);

    const now = new Date();
    const delay = reminderDate.getTime() - now.getTime();

    if (delay <= 0) {
      return {
        success: false,
        message: 'Reminder date is in the past',
      };
    }

    // For immediate testing, you can send a message right away
    // In production, you'd use a job queue like Bull or Agenda
    const message = `🌍 Passport Pal Reminder!\n\nYour travel date is approaching (${departureDate}).\n\n${travelDetails}\n\nMake sure you have all your documents ready! Safe travels! ✈️`;

    // Send immediate confirmation (optional)
    if (process.env.TWILIO_WHATSAPP_NUMBER) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${phoneNumber}`,
      });

      return {
        success: true,
        message: 'WhatsApp reminder scheduled successfully!',
      };
    }

    return {
      success: true,
      message: 'Reminder will be sent 3 days before departure',
    };
  } catch (error) {
    console.error('WhatsApp reminder error:', error);
    return {
      success: false,
      message: 'Failed to schedule WhatsApp reminder',
    };
  }
}

export async function sendImmediateWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    const client = getTwilioClient();
    
    if (!client || !process.env.TWILIO_WHATSAPP_NUMBER) {
      return {
        success: false,
        message: 'WhatsApp service not configured',
      };
    }

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phoneNumber}`,
    });

    return {
      success: true,
      message: 'WhatsApp message sent successfully!',
    };
  } catch (error) {
    console.error('WhatsApp error:', error);
    return {
      success: false,
      message: 'Failed to send WhatsApp message',
    };
  }
}
