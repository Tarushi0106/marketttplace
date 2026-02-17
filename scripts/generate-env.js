// This script generates a runtime config file with environment variables
// Run this during build to create a config that can be read at runtime

const fs = require('fs');
const path = require('path');

const envVars = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
  AUTH_SECRET: process.env.AUTH_SECRET || '',
  AUTH_URL: process.env.AUTH_URL || '',
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'true',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'NaaS Marketplace',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || '',
};

const configContent = `// Auto-generated runtime config - DO NOT EDIT
export const runtimeEnv = ${JSON.stringify(envVars, null, 2)};

export default runtimeEnv;
`;

const outputPath = path.join(__dirname, '..', 'src', 'runtime-env.ts');
fs.writeFileSync(outputPath, configContent);
console.log('✅ Generated runtime-env.ts with environment variables');
