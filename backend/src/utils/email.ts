// Simple email utility without nodemailer for now
// In dev mode, just log to console

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  console.log('\n📧 ========== VERIFICATION EMAIL ==========');
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`\nVerification URL:`);
  console.log(verificationUrl);
  console.log(`\nToken: ${token}`);
  console.log('==========================================\n');

  return { success: true, dev: true };
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

  console.log('\n📧 ========== PASSWORD RESET EMAIL ==========');
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`\nReset URL:`);
  console.log(resetUrl);
  console.log(`\nToken: ${token}`);
  console.log('============================================\n');

  return { success: true, dev: true };
}

export async function sendWelcomeEmail(email: string, name: string) {
  console.log(`\n📧 Welcome email would be sent to: ${email}\n`);
  return { success: true, dev: true };
}
