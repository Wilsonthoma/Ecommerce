import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend.com
 * ✅ PRODUCTION READY - with proper error handling
 */
export const sendEmail = async ({ to, subject, html, from }) => {
  try {
    console.log(`📧 Sending email via Resend to: ${to}`);
    
    // Use onboarding@resend.dev for testing (always works)
    const fromEmail = from || 'KwetuShop <onboarding@resend.dev>';
    
    // ACTUALLY SEND THE EMAIL - No more dev fallback!
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      
      // Only fallback in development if there's an actual error
      if (process.env.NODE_ENV === 'development') {
        const otpMatch = html.match(/\d{6}/);
        const otp = otpMatch ? otpMatch[0] : 'N/A';
        console.log(`🔐 [DEV] OTP for testing: ${otp}`);
        console.log(`⚠️  Email would have been sent to: ${to}`);
        return { 
          success: true, 
          messageId: `dev-${Date.now()}`,
          devMode: true,
          otp
        };
      }
      
      return { 
        success: false, 
        error: error.message,
        code: error.statusCode
      };
    }

    console.log(`✅ Email sent via Resend! Message ID: ${data.id}`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    
    return { 
      success: true, 
      messageId: data.id 
    };
    
  } catch (error) {
    console.error('❌ Resend exception:', error);
    
    if (process.env.NODE_ENV === 'development') {
      const otpMatch = html.match(/\d{6}/);
      const otp = otpMatch ? otpMatch[0] : 'N/A';
      console.log(`🔐 [DEV] OTP for testing: ${otp}`);
      return { 
        success: true, 
        messageId: `dev-${Date.now()}`,
        devMode: true,
        otp
      };
    }
    
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Test Resend connection
 */
export const testResendConnection = async () => {
  try {
    console.log('📧 Testing Resend connection...');
    
    const { data, error } = await resend.emails.send({
      from: 'KwetuShop <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: '✅ Resend Connected - KwetuShop',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #10b981; font-size: 24px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="color: #333; text-align: center;">KwetuShop</h1>
            <div class="success">✅ Resend is working!</div>
            <p>Your email configuration is complete and working correctly.</p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>API Key: ${process.env.RESEND_API_KEY?.substring(0, 8)}...</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend test failed:', error.message);
      return { 
        connected: false, 
        error: error.message 
      };
    }

    console.log('✅ Resend connected successfully!');
    console.log(`   Test email sent! Message ID: ${data.id}`);
    console.log(`   Check your Resend dashboard for delivery logs.`);
    
    return { 
      connected: true, 
      messageId: data.id 
    };
    
  } catch (error) {
    console.error('❌ Resend test exception:', error);
    return { 
      connected: false, 
      error: error.message 
    };
  }
};

export default { sendEmail, testResendConnection };