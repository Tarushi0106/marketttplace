import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    configs?: Array<{ name: string; value: string; price: number }>;
  }>;
  subtotal: number;
  setupFee: number;
  tax: number;
  total: number;
  billingCycle: string;
  recurringAmount: number;
  recurringPeriod: string;
  companyInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Get email settings from environment variables or database
 */
async function getEmailSettings(): Promise<EmailSettings | null> {
  // First check environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      fromName: process.env.SMTP_FROM_NAME || 'Marketplace',
    };
  }

  // Fall back to database settings
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpFromEmail', 'smtpFromName'],
        },
      },
    });

    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = typeof s.value === 'string' ? s.value : (s.value as any)?.value;
    });

    // Also get company info for default from address
    const companyInfo = await prisma.companyInfo.findFirst();

    if (!settingsMap.smtpHost || !settingsMap.smtpUser) {
      console.log('SMTP settings not configured');
      return null;
    }

    return {
      smtpHost: settingsMap.smtpHost,
      smtpPort: parseInt(settingsMap.smtpPort as string) || 587,
      smtpUser: settingsMap.smtpUser,
      smtpPass: settingsMap.smtpPass,
      fromEmail: settingsMap.smtpFromEmail || companyInfo?.email || 'noreply@example.com',
      fromName: settingsMap.smtpFromName || companyInfo?.name || 'Marketplace',
    };
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
}

/**
 * Create nodemailer transporter
 */
async function createTransporter() {
  const settings = await getEmailSettings();
  
  if (!settings) {
    throw new Error('Email settings not configured');
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    },
  });
}

/**
 * Generate HTML content for order confirmation email
 */
function generateOrderEmailHTML(order: OrderDetails): string {
  const itemsList = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong>${item.name}</strong>
          ${item.configs && item.configs.length > 0
            ? `<br/><small style="color: #64748b;">${item.configs.map(c => `${c.name}: ${c.value}`).join(', ')}</small>`
            : ''}
          ${item.quantity > 1
            ? `<br/><small style="color: #64748b;">Qty: ${item.quantity}</small>`
            : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
          ₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #f8fafc; padding: 30px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f172a; margin: 0;">Order Confirmation</h1>
          <p style="color: #64748b; margin-top: 8px;">Thank you for your purchase!</p>
        </div>

        <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Order #${order.orderNumber}</h2>
          <p style="color: #64748b;">Hi ${order.customerName},</p>
          <p style="color: #64748b;">We're excited to confirm your order. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 12px; text-align: left; border-radius: 4px 0 0 0;">Item</th>
                <th style="padding: 12px; text-align: right; border-radius: 0 4px 0 0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div style="margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #64748b;">Subtotal</span>
              <span>₹${order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            ${order.setupFee > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #64748b;">Setup Fee</span>
              <span>₹${order.setupFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            ${order.tax > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="color: #64748b;">Tax (18% GST)</span>
              <span>₹${order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 18px;">
              <span>Total Due Today</span>
              <span style="color: #0f172a;">₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          ${order.recurringAmount > 0 ? `
          <div style="background: #fef3c7; padding: 16px; border-radius: 6px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              You will be charged ₹${order.recurringAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} every ${order.recurringPeriod} after purchase.
            </p>
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; padding: 20px; color: #64748b; font-size: 14px;">
          <p>If you have any questions, please contact us at</p>
          <p style="color: #0f172a;">
            <strong>${order.companyInfo.name}</strong><br/>
            Email: ${order.companyInfo.email}<br/>
            Phone: ${order.companyInfo.phone}
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of order email
 */
function generateOrderEmailText(order: OrderDetails): string {
  const itemsList = order.items
    .map((item) => {
      let details = `  - ${item.name}`;
      if (item.configs && item.configs.length > 0) {
        details += `\n    ${item.configs.map(c => `${c.name}: ${c.value}`).join(', ')}`;
      }
      if (item.quantity > 1) {
        details += `\n    Qty: ${item.quantity}`;
      }
      details += `\n    ₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      return details;
    })
    .join('\n');

  let text = `
ORDER CONFIRMATION
==================
Order #${order.orderNumber}

Hi ${order.customerName},

Thank you for your purchase! Here are your order details:

ITEMS:
${itemsList}

SUBTOTAL:     ₹${order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
${order.setupFee > 0 ? `SETUP FEE:     ₹${order.setupFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` : ''}
${order.tax > 0 ? `TAX (18% GST): ₹${order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` : ''}
------------------
TOTAL DUE TODAY: ₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
${order.recurringAmount > 0 ? `\nYou will be charged ₹${order.recurringAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} every ${order.recurringPeriod} after purchase.\n` : ''}

---
${order.companyInfo.name}
Email: ${order.companyInfo.email}
Phone: ${order.companyInfo.phone}

This is an automated message. Please do not reply directly to this email.
`;

  return text;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: OrderDetails): Promise<boolean> {
  try {
    const settings = await getEmailSettings();
    
    if (!settings) {
      console.log('Email settings not configured. Add SMTP settings to .env file.');
      console.log('Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
      return false;
    }

    const transporter = await createTransporter();

    const mailOptions = {
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: order.customerEmail,
      subject: `Order Confirmed - #${order.orderNumber} | ${order.companyInfo.name}`,
      text: generateOrderEmailText(order),
      html: generateOrderEmailHTML(order),
    };

    console.log(`Sending order confirmation email to: ${order.customerEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

/**
 * Check if email is configured
 */
export async function isEmailConfigured(): Promise<boolean> {
  const settings = await getEmailSettings();
  return settings !== null && !!settings.smtpHost && !!settings.smtpUser;
}

/**
 * Test SMTP connection
 */
export async function testSmtpConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const settings = await getEmailSettings();
    
    if (!settings) {
      return { success: false, message: 'SMTP settings not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to .env file.' };
    }

    const transporter = await createTransporter();
    await transporter.verify();
    
    return { success: true, message: 'SMTP connection successful' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `SMTP connection failed: ${errorMessage}` };
  }
}
